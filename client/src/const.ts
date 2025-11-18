export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Cascadia Sales Tracker";

export const APP_COMPANY = "Cascadia - Managing Brands";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "/cascadia-logo.png";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  return "/login";
};
