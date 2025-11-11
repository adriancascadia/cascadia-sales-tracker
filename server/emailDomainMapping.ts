/**
 * Email domain to company mapping
 * Maps email domains to company IDs for automatic company assignment during signup
 */
const DOMAIN_COMPANY_MAP: Record<string, number> = {
  "cascadiafoodbev.com": 1,
  "cascadia.com": 1,
  // Add more domain mappings as needed
};

/**
 * Get company ID from email address
 * Extracts domain from email and looks up company ID
 */
export function getCompanyIdFromEmail(email: string): number | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;

  // Check static mapping
  if (DOMAIN_COMPANY_MAP[domain]) {
    return DOMAIN_COMPANY_MAP[domain];
  }

  // Default to company 1 for now
  return 1;
}

/**
 * Add email domain to company mapping
 */
export function addEmailDomainMapping(domain: string, companyId: number): void {
  DOMAIN_COMPANY_MAP[domain.toLowerCase()] = companyId;
}

/**
 * Get all domains for a company
 */
export function getEmailDomainsByCompanyId(companyId: number): string[] {
  return Object.entries(DOMAIN_COMPANY_MAP)
    .filter(([_, id]) => id === companyId)
    .map(([domain, _]) => domain);
}
