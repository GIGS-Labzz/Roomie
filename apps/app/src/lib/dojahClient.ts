/**
 * Dojah.io KYC Client Adapter
 * Supports live Dojah API calls when DOJAH_API_KEY is configured,
 * or mock sandbox responses for local testing without API keys.
 */

export interface DojahNINResponse {
  success: boolean;
  data?: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    dob: string;
    gender: string;
    photo?: string;
    reference: string;
  };
  error?: string;
}

export interface DojahLivenessInitResponse {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

export class DojahClient {
  private apiKey: string;
  private appId: string;
  private isMockMode: boolean;

  constructor() {
    this.apiKey = process.env.DOJAH_API_KEY || "";
    this.appId = process.env.DOJAH_APP_ID || "";
    this.isMockMode = !this.apiKey || process.env.NEXT_PUBLIC_VERIFICATION_MOCK_MODE === "true";
  }

  /**
   * Perform NIN lookup via Dojah API (or sandbox mock)
   */
  async lookupNIN(nin: string): Promise<DojahNINResponse> {
    if (this.isMockMode) {
      console.log("[Dojah Mock Mode] Performing NIN lookup for:", nin);
      // Simulate sandbox lookup
      if (nin === "00000000000") {
        return {
          success: false,
          error: "NIN record not found on NIMC database",
        };
      }
      return {
        success: true,
        data: {
          first_name: "Chinedu",
          last_name: "Okonkwo",
          middle_name: "Emmanuel",
          dob: "1998-05-14",
          gender: "male",
          photo: "data:image/png;base64,mockPhotoData",
          reference: `dojah_mock_nin_${Date.now()}`,
        },
      };
    }

    try {
      const response = await fetch(`https://api.dojah.io/api/v1/kyc/nin?nin=${nin}`, {
        method: "GET",
        headers: {
          Authorization: this.apiKey,
          AppId: this.appId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || errorData.message || "Failed to query NIMC database",
        };
      }

      const resJson = await response.json();
      const entity = resJson.entity || {};

      return {
        success: true,
        data: {
          first_name: entity.firstname || entity.first_name || "",
          last_name: entity.surname || entity.last_name || "",
          middle_name: entity.middlename || entity.middle_name || "",
          dob: entity.birthdate || entity.dob || "",
          gender: entity.gender || "",
          photo: entity.photo || "",
          reference: resJson.reference || `dojah_nin_${Date.now()}`,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Dojah connection error";
      return { success: false, error: msg };
    }
  }

  /**
   * Create Face Liveness & Match session
   */
  async initFaceLivenessSession(userId: string): Promise<DojahLivenessInitResponse> {
    if (this.isMockMode) {
      console.log("[Dojah Mock Mode] Initializing face liveness session for user:", userId);
      const mockSessionId = `mock_liveness_${Date.now()}`;
      return {
        success: true,
        sessionId: mockSessionId,
        url: `/onboarding/face?mock_session=${mockSessionId}&status=simulated`,
      };
    }

    try {
      const response = await fetch("https://api.dojah.io/api/v1/liveness/session", {
        method: "POST",
        headers: {
          Authorization: this.apiKey,
          AppId: this.appId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/kyc/face/callback`,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: "Failed to initialize Dojah liveness session",
        };
      }

      const resJson = await response.json();
      return {
        success: true,
        sessionId: resJson.entity?.session_id,
        url: resJson.entity?.url,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Dojah liveness error";
      return { success: false, error: msg };
    }
  }
}

export const dojahClient = new DojahClient();
