/**
 * Biometric Authentication Service
 * Handles fingerprint and face recognition for mobile devices
 */

export interface BiometricOptions {
  reason?: string;
  fallbackToPasscode?: boolean;
}

export interface BiometricResult {
  success: boolean;
  authenticated: boolean;
  error?: string;
  type?: "fingerprint" | "face" | "passcode";
}

/**
 * Check if device supports biometric authentication
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    // Check if WebAuthn API is available
    if (window.PublicKeyCredential === undefined) {
      return false;
    }

    // Check if platform authenticator is available
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error("Biometric availability check failed:", error);
    return false;
  }
}

/**
 * Authenticate user with biometrics (fingerprint or face)
 */
export async function authenticateWithBiometrics(
  options?: BiometricOptions
): Promise<BiometricResult> {
  try {
    const available = await isBiometricAvailable();
    if (!available) {
      return {
        success: false,
        authenticated: false,
        error: "Biometric authentication not available on this device",
      };
    }

    // Get stored credential ID from localStorage
    const credentialId = localStorage.getItem("biometric_credential_id");
    if (!credentialId) {
      return {
        success: false,
        authenticated: false,
        error: "No biometric credential registered",
      };
    }

    // Create assertion options
    const assertionOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: new Uint8Array(32), // In production, get from server
        allowCredentials: [
          {
            id: Uint8Array.from(atob(credentialId), (c) => c.charCodeAt(0)),
            type: "public-key",
            transports: ["internal"],
          },
        ],
        userVerification: "preferred",
        timeout: 60000,
      },
    };

    // Request credential from platform authenticator
    const assertion = await navigator.credentials.get(assertionOptions);

    if (!assertion) {
      return {
        success: false,
        authenticated: false,
        error: "Biometric authentication cancelled",
      };
    }

    return {
      success: true,
      authenticated: true,
      type: "fingerprint", // Could be fingerprint or face depending on device
    };
  } catch (error) {
    console.error("Biometric authentication error:", error);
    return {
      success: false,
      authenticated: false,
      error: error instanceof Error ? error.message : "Biometric authentication failed",
    };
  }
}

/**
 * Register biometric credential for future authentication
 */
export async function registerBiometric(userId: string): Promise<BiometricResult> {
  try {
    const available = await isBiometricAvailable();
    if (!available) {
      return {
        success: false,
        authenticated: false,
        error: "Biometric authentication not available",
      };
    }

    // Create credential creation options
    const creationOptions: CredentialCreationOptions = {
      publicKey: {
        challenge: new Uint8Array(32),
        rp: {
          name: "SalesForce Tracker",
          id: window.location.hostname,
        },
        user: {
          id: Uint8Array.from(userId, (c) => c.charCodeAt(0)),
          name: userId,
          displayName: userId,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "direct",
      },
    };

    // Create credential
    const credential = await navigator.credentials.create(creationOptions);

    if (!credential) {
      return {
        success: false,
        authenticated: false,
        error: "Failed to register biometric credential",
      };
    }

    // Store credential ID locally
    const credentialId = btoa(
      String.fromCharCode.apply(null, Array.from(new Uint8Array((credential as any).rawId)))
    );
    localStorage.setItem("biometric_credential_id", credentialId);

    return {
      success: true,
      authenticated: true,
      type: "fingerprint",
    };
  } catch (error) {
    console.error("Biometric registration error:", error);
    return {
      success: false,
      authenticated: false,
      error: error instanceof Error ? error.message : "Biometric registration failed",
    };
  }
}

/**
 * Check if biometric is already registered
 */
export function isBiometricRegistered(): boolean {
  return localStorage.getItem("biometric_credential_id") !== null;
}

/**
 * Remove registered biometric credential
 */
export function removeBiometric(): void {
  localStorage.removeItem("biometric_credential_id");
}
