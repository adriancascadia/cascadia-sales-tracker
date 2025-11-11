/**
 * Company Branding Service
 * Manages company-specific branding (logos, colors, themes)
 */

export interface CompanyBranding {
  companyId: number;
  logoUrl?: string;
  primaryColor?: string; // Hex color (e.g., "#2D5016" for Cascadia green)
  secondaryColor?: string;
  accentColor?: string;
  theme?: "light" | "dark";
  customCss?: string;
}

// In-memory branding storage (replace with database in production)
const brandingStore: Map<number, CompanyBranding> = new Map([
  [
    1,
    {
      companyId: 1,
      logoUrl: "/cascadia-logo.png",
      primaryColor: "#2D5016", // Cascadia green
      secondaryColor: "#4A7C2C",
      accentColor: "#5BA83D",
      theme: "light",
    },
  ],
]);

/**
 * Get company branding
 * @param companyId Company ID
 * @returns Company branding configuration
 */
export function getCompanyBranding(companyId: number): CompanyBranding {
  return (
    brandingStore.get(companyId) || {
      companyId,
      primaryColor: "#000000",
      secondaryColor: "#666666",
      accentColor: "#0066CC",
      theme: "light",
    }
  );
}

/**
 * Update company branding
 * @param companyId Company ID
 * @param branding Branding configuration
 */
export function updateCompanyBranding(companyId: number, branding: Partial<CompanyBranding>): CompanyBranding {
  const existing = getCompanyBranding(companyId);
  const updated = { ...existing, ...branding, companyId };
  brandingStore.set(companyId, updated);
  return updated;
}

/**
 * Get branding CSS variables for a company
 * @param companyId Company ID
 * @returns CSS variable declarations
 */
export function getBrandingCssVariables(companyId: number): string {
  const branding = getCompanyBranding(companyId);
  return `
    :root {
      --company-primary: ${branding.primaryColor || "#000000"};
      --company-secondary: ${branding.secondaryColor || "#666666"};
      --company-accent: ${branding.accentColor || "#0066CC"};
    }
  `;
}

/**
 * Get branding as JSON for frontend
 * @param companyId Company ID
 * @returns Branding object safe for frontend
 */
export function getBrandingForFrontend(companyId: number) {
  const branding = getCompanyBranding(companyId);
  return {
    logoUrl: branding.logoUrl,
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    accentColor: branding.accentColor,
    theme: branding.theme,
  };
}
