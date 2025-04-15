import { Twilio } from "twilio";
import { HTTPException } from "hono/http-exception";

// SMS data interface
export interface SMSData {
  to: string;
  message: string;
  from?: string;
}

// SMS service
export class SMSService {
  private client: Twilio;
  private defaultFrom: string;

  constructor() {
    // Get Twilio configuration from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.defaultFrom = process.env.TWILIO_PHONE_NUMBER || "";

    // Create Twilio client if credentials are available
    if (accountSid && authToken) {
      this.client = new Twilio(accountSid, authToken);
      console.log("SMS service initialized");
    } else {
      console.warn("SMS service not configured: missing Twilio credentials");
    }
  }

  // Send SMS
  async sendSMS(data: SMSData): Promise<boolean> {
    try {
      // Validate SMS data
      if (!data.to || !data.message) {
        throw new HTTPException(400, { message: "Invalid SMS data" });
      }

      // Format phone number (ensure it has country code)
      const formattedNumber = this.formatPhoneNumber(data.to);

      // Check if Twilio client is initialized
      if (!this.client || !this.defaultFrom) {
        // In development or test, don't throw an error
        if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
          console.log("SMS would have been sent in production:", {
            to: formattedNumber,
            body: data.message,
            from: data.from || this.defaultFrom,
          });
          return true;
        }
        
        throw new Error("SMS service not configured");
      }

      // Send SMS
      const message = await this.client.messages.create({
        to: formattedNumber,
        body: data.message,
        from: data.from || this.defaultFrom,
      });

      console.log("SMS sent:", message.sid);
      return true;
    } catch (error) {
      console.error("Error sending SMS:", error);
      
      // In development or test, don't throw an error
      if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        console.log("SMS would have been sent in production:", data);
        return true;
      }
      
      // In production, throw an error
      throw new HTTPException(500, {
        message: "Failed to send SMS",
      });
    }
  }

  // Send verification code
  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    const message = `Your RecCollection verification code is: ${code}. This code will expire in 10 minutes.`;
    return this.sendSMS({ to, message });
  }

  // Send recipe shared SMS
  async sendRecipeSharedSMS(
    to: string,
    senderName: string,
    recipeName: string,
    recipeUrl: string
  ): Promise<boolean> {
    // Keep SMS messages short
    const message = `${senderName} shared a recipe with you on RecCollection: "${recipeName}". View it here: ${recipeUrl}`;
    return this.sendSMS({ to, message });
  }

  // Format phone number (ensure it has country code)
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    
    // If the number doesn't start with +, add +1 (US) as default
    if (!phoneNumber.startsWith("+")) {
      // If it's a 10-digit number, assume US and add +1
      if (digitsOnly.length === 10) {
        return `+1${digitsOnly}`;
      }
      // If it's an 11-digit number starting with 1, assume US and add +
      else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
        return `+${digitsOnly}`;
      }
    }
    
    // Return the original number if it already has a country code
    return phoneNumber;
  }
}
