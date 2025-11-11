/**
 * Email Domain to Company Mapping Configuration
 * Maps email domains to company IDs for automatic company assignment during OAuth signup
 */

export const emailDomainMapping: Record<string, { companyId: number; companyName: string }> = {
  // Cascadia Food & Beverage
  "cascadiafoodbev.com": { companyId: 1, companyName: "Cascadia" },
  "cascadia.com": { companyId: 1, companyName: "Cascadia" },
  
  // Add more companies here as they join
  // "company2.com": { companyId: 2, companyName: "Company 2" },
  // "company3.com": { companyId: 3, companyName: "Company 3" },
};

/**
 * Get company ID from email domain
 * @param email User's email address
 * @returns Company ID and name, or null if domain not found
 */
export function getCompanyFromEmail(email: string): { companyId: number; companyName: string } | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  
  return emailDomainMapping[domain] || null;
}

/**
 * Check if email domain is registered
 * @param email User's email address
 * @returns true if domain is registered, false otherwise
 */
export function isEmailDomainRegistered(email: string): boolean {
  return getCompanyFromEmail(email) !== null;
}

/**
 * Add a new email domain mapping
 * @param domain Email domain (e.g., "company.com")
 * @param companyId Company ID
 * @param companyName Company name
 */
export function addEmailDomainMapping(domain: string, companyId: number, companyName: string): void {
  emailDomainMapping[domain.toLowerCase()] = { companyId, companyName };
}

/**
 * Remove an email domain mapping
 * @param domain Email domain to remove
 */
export function removeEmailDomainMapping(domain: string): void {
  delete emailDomainMapping[domain.toLowerCase()];
}

/**
 * Get all registered domains
 * @returns Array of registered email domains
 */
export function getRegisteredDomains(): string[] {
  return Object.keys(emailDomainMapping);
}
