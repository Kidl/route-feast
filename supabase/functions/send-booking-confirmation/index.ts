import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  bookingId: string;
  bookingReference: string;
  email: string;
  name: string;
  routeName: string;
  date: string;
  time: string;
  numberOfPeople: number;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: BookingConfirmationRequest = await req.json();
    const { 
      bookingReference, 
      email, 
      name, 
      routeName, 
      date, 
      time, 
      numberOfPeople, 
      totalAmount 
    } = requestData;

    // Create Supabase client for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const emailResponse = await resend.emails.send({
      from: "GastroRoute <noreply@gastroroute.no>",
      to: [email],
      subject: `Booking Confirmed - ${routeName} | ${bookingReference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .booking-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-label { font-weight: bold; color: #64748b; }
            .detail-value { color: #1e293b; }
            .highlight { background: #ddd6fe; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .reference { font-size: 24px; font-weight: bold; color: #8B5CF6; letter-spacing: 2px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Booking Confirmed!</h1>
              <p>Thank you for choosing GastroRoute</p>
            </div>
            
            <div class="content">
              <p>Dear ${name},</p>
              
              <p>Great news! Your culinary journey has been confirmed. We're excited to take you on an unforgettable gastronomic adventure.</p>
              
              <div class="highlight">
                <p><strong>Your Booking Reference:</strong></p>
                <div class="reference">${bookingReference}</div>
                <p><small>Please keep this reference number for your records</small></p>
              </div>
              
              <div class="booking-details">
                <h3>📋 Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Route:</span>
                  <span class="detail-value">${routeName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Number of People:</span>
                  <span class="detail-value">${numberOfPeople}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value">${totalAmount} NOK</span>
                </div>
              </div>
              
              <h3>🗓️ What's Next?</h3>
              <ul>
                <li><strong>Check your calendar:</strong> We've sent you the details above</li>
                <li><strong>Arrive 15 minutes early:</strong> This helps us start on time</li>
                <li><strong>Bring your appetite:</strong> You're in for a treat!</li>
                <li><strong>Questions?</strong> Contact us at info@gastroroute.no</li>
              </ul>
              
              <h3>📍 Important Notes</h3>
              <p>• Please let us know of any dietary restrictions at least 24 hours before your tour</p>
              <p>• Cancellations must be made at least 48 hours in advance</p>
              <p>• Comfortable walking shoes are recommended</p>
              
              <div class="footer">
                <p>Thank you for choosing GastroRoute!</p>
                <p>Follow us on social media for culinary inspiration and updates</p>
                <p>© 2024 GastroRoute. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Booking confirmation email sent successfully:", emailResponse);

    // Update booking to mark confirmation as sent
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        confirmation_sent_at: new Date().toISOString(),
        status: 'confirmed',
        payment_status: 'paid'
      })
      .eq('booking_reference', bookingReference);

    if (updateError) {
      console.error('Error updating booking confirmation status:', updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);