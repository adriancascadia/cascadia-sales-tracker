import { ENV } from './_core/env';

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    company?: string;
    lifecyclestage?: string;
    hs_lead_status?: string;
    [key: string]: any;
  };
}

interface HubSpotDeal {
  id: string;
  properties: {
    dealname?: string;
    dealstage?: string;
    amount?: string;
    closedate?: string;
    hubspot_owner_id?: string;
    [key: string]: any;
  };
}

/**
 * HubSpot Integration Service
 * Handles syncing between SalesForce Tracker and HubSpot CRM
 */
export class HubSpotService {
  private apiKey: string;
  private baseUrl = HUBSPOT_API_BASE;

  constructor() {
    this.apiKey = ENV.hubspotApiKey || '';
    if (!this.apiKey) {
      console.warn('[HubSpot] API key not configured');
    }
  }

  /**
   * Make authenticated request to HubSpot API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[HubSpot] API error: ${response.status}`, error);
        throw new Error(`HubSpot API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[HubSpot] Request failed:', error);
      throw error;
    }
  }

  /**
   * Get all contacts from HubSpot
   */
  async getContacts(limit = 100): Promise<HubSpotContact[]> {
    try {
      const response = await this.request<any>(
        'GET',
        `/crm/v3/objects/contacts?limit=${limit}&properties=firstname,lastname,email,phone,company,lifecyclestage`
      );
      return response.results || [];
    } catch (error) {
      console.error('[HubSpot] Failed to get contacts:', error);
      return [];
    }
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(email: string): Promise<HubSpotContact | null> {
    try {
      const response = await this.request<any>(
        'GET',
        `/crm/v3/objects/contacts/search`,
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email,
                },
              ],
            },
          ],
          limit: 1,
          properties: ['firstname', 'lastname', 'email', 'phone', 'company', 'lifecyclestage'],
        }
      );

      const results = response.results || [];
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('[HubSpot] Failed to get contact by email:', error);
      return null;
    }
  }

  /**
   * Create or update contact in HubSpot
   */
  async upsertContact(email: string, properties: Record<string, any>): Promise<HubSpotContact | null> {
    try {
      const response = await this.request<any>(
        'POST',
        `/crm/v3/objects/contacts/search`,
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email,
                },
              ],
            },
          ],
          limit: 1,
        }
      );

      const existingContact = response.results?.[0];

      if (existingContact) {
        // Update existing contact
        return await this.request<HubSpotContact>(
          'PATCH',
          `/crm/v3/objects/contacts/${existingContact.id}`,
          { properties }
        );
      } else {
        // Create new contact
        return await this.request<HubSpotContact>(
          'POST',
          `/crm/v3/objects/contacts`,
          { properties: { email, ...properties } }
        );
      }
    } catch (error) {
      console.error('[HubSpot] Failed to upsert contact:', error);
      return null;
    }
  }

  /**
   * Get all deals from HubSpot
   */
  async getDeals(limit = 100): Promise<HubSpotDeal[]> {
    try {
      const response = await this.request<any>(
        'GET',
        `/crm/v3/objects/deals?limit=${limit}&properties=dealname,dealstage,amount,closedate,hubspot_owner_id`
      );
      return response.results || [];
    } catch (error) {
      console.error('[HubSpot] Failed to get deals:', error);
      return [];
    }
  }

  /**
   * Create deal in HubSpot
   */
  async createDeal(properties: Record<string, any>): Promise<HubSpotDeal | null> {
    try {
      return await this.request<HubSpotDeal>(
        'POST',
        `/crm/v3/objects/deals`,
        { properties }
      );
    } catch (error) {
      console.error('[HubSpot] Failed to create deal:', error);
      return null;
    }
  }

  /**
   * Update deal in HubSpot
   */
  async updateDeal(dealId: string, properties: Record<string, any>): Promise<HubSpotDeal | null> {
    try {
      return await this.request<HubSpotDeal>(
        'PATCH',
        `/crm/v3/objects/deals/${dealId}`,
        { properties }
      );
    } catch (error) {
      console.error('[HubSpot] Failed to update deal:', error);
      return null;
    }
  }

  /**
   * Associate contact with deal
   */
  async associateContactWithDeal(contactId: string, dealId: string): Promise<boolean> {
    try {
      await this.request(
        'PUT',
        `/crm/v3/objects/contacts/${contactId}/associations/deals/${dealId}`,
        {
          associationCategory: 'HUBSPOT_DEFINED',
          associationType: 'contact_to_deal',
        }
      );
      return true;
    } catch (error) {
      console.error('[HubSpot] Failed to associate contact with deal:', error);
      return false;
    }
  }

  /**
   * Create activity/note in HubSpot
   */
  async createNote(contactId: string, noteText: string): Promise<boolean> {
    try {
      await this.request(
        'POST',
        `/crm/v3/objects/contacts/${contactId}/notes`,
        {
          properties: {
            hs_note_body: noteText,
          },
        }
      );
      return true;
    } catch (error) {
      console.error('[HubSpot] Failed to create note:', error);
      return false;
    }
  }

  /**
   * Sync customer from SalesForce Tracker to HubSpot
   */
  async syncCustomerToHubSpot(customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    industry?: string;
  }): Promise<HubSpotContact | null> {
    if (!customer.email) {
      console.warn('[HubSpot] Cannot sync customer without email');
      return null;
    }

    const [firstName, ...lastNameParts] = customer.name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    return this.upsertContact(customer.email, {
      firstname: firstName,
      lastname: lastName,
      phone: customer.phone,
      company: customer.address, // Using as company field
      industry: customer.industry,
    });
  }

  /**
   * Sync order from SalesForce Tracker to HubSpot deal
   */
  async syncOrderToHubSpot(order: {
    id: string;
    customerName: string;
    customerEmail?: string;
    totalAmount: number;
    status: string;
    createdAt: Date;
  }): Promise<HubSpotDeal | null> {
    try {
      // Create or get contact
      let contactId: string | null = null;
      if (order.customerEmail) {
        const contact = await this.getContactByEmail(order.customerEmail);
        if (contact) {
          contactId = contact.id;
        } else {
          const newContact = await this.upsertContact(order.customerEmail, {
            firstname: order.customerName.split(' ')[0],
            lastname: order.customerName.split(' ').slice(1).join(' '),
          });
          if (newContact) {
            contactId = newContact.id;
          }
        }
      }

      // Create deal
      const dealProperties: Record<string, any> = {
        dealname: `Order #${order.id} - ${order.customerName}`,
        amount: order.totalAmount.toString(),
        dealstage: this.mapOrderStatusToDealStage(order.status),
        closedate: new Date(order.createdAt).toISOString().split('T')[0],
      };

      const deal = await this.createDeal(dealProperties);

      // Associate contact with deal
      if (deal && contactId) {
        await this.associateContactWithDeal(contactId, deal.id);
      }

      return deal;
    } catch (error) {
      console.error('[HubSpot] Failed to sync order:', error);
      return null;
    }
  }

  /**
   * Map order status to HubSpot deal stage
   */
  private mapOrderStatusToDealStage(status: string): string {
    const stageMap: Record<string, string> = {
      pending: 'negotiation',
      confirmed: 'presentation_scheduled',
      shipped: 'decision_pending',
      delivered: 'closedwon',
      cancelled: 'closedlost',
    };
    return stageMap[status.toLowerCase()] || 'negotiation';
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Export singleton instance
export const hubspotService = new HubSpotService();
