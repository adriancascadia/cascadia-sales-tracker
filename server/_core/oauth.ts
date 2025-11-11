import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { getCompanyIdFromEmail } from "../emailDomainMapping";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const origin = req.get('origin') || req.get('referer') || 'unknown';

    console.log("[OAuth] Callback received from origin:", origin);
    console.log("[OAuth] Request URL:", req.originalUrl);

    if (!code || !state) {
      console.error("[OAuth] Missing code or state", { code: !!code, state: !!state });
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      console.log("[OAuth] Callback started with code:", code?.substring(0, 10), "state:", state?.substring(0, 10));
      
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      console.log("[OAuth] Token exchange successful");
      
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      console.log("[OAuth] User info retrieved:", userInfo.openId);

      if (!userInfo.openId) {
        console.error("[OAuth] Missing openId in user info");
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      const companyId = getCompanyIdFromEmail(userInfo.email || "") || 1;
      await db.upsertUser({
        openId: userInfo.openId,
        companyId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });
      console.log("[OAuth] User upserted to database");

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      console.log("[OAuth] Session token created");

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      console.log("[OAuth] Cookie set, redirecting to /");

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed with error:", error instanceof Error ? error.message : String(error));
      if (error instanceof Error) {
        console.error("[OAuth] Error stack:", error.stack);
      }
      res.status(500).json({ error: "OAuth callback failed", details: error instanceof Error ? error.message : String(error) });
    }
  });
}
