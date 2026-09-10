import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, code, type = 'verification', podName, inviterName, inviteUrl } = await req.json();

    if (!email || (!code && type !== 'invitation')) {
      return new Response(
        JSON.stringify({ error: 'Missing email or code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const host = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(Deno.env.get('SMTP_PORT') || '587');
    const user = Deno.env.get('SMTP_USER');
    const pass = Deno.env.get('SMTP_PASS');
    const from = Deno.env.get('SMTP_FROM') || user;

    if (!user || !pass) {
      return new Response(
        JSON.stringify({ error: 'SMTP credentials not configured in Edge Function environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587/other ports
      auth: {
        user,
        pass,
      },
    });

    let subject = 'Verify your BOMA email address';
    let html = '';

    const brandHeader = `
      <!-- Brand Header -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom: 1px solid #EFEAE3; padding-bottom: 20px; margin-bottom: 24px;">
        <tr>
          <td style="vertical-align: middle;">
            <table border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align: middle;">
                  <div style="background-color: #2E2330; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 800; color: #F7F5F0;">
                    B
                  </div>
                </td>
                <td style="padding-left: 12px; vertical-align: middle;">
                  <div style="font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 800; color: #2E2330; letter-spacing: 2px; line-height: 1;">
                    BOMA
                  </div>
                  <div style="font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace; font-size: 9.5px; font-weight: 700; color: #C46A4A; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px;">
                    Community Matching & Co-Living
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const emailWrapper = (contentHtml: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BOMA</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F7F5F0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F5F0; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E5DDD2; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(46, 35, 48, 0.08);">
                <!-- Top Terracotta Accent Bar -->
                <tr>
                  <td height="5" style="background-color: #C46A4A; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
                <!-- Inner Content -->
                <tr>
                  <td style="padding: 32px 36px 36px 36px; text-align: left;">
                    ${brandHeader}
                    ${contentHtml}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #FAF8F5; padding: 22px 36px; border-top: 1px solid #E5DDD2; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-family: 'Inter', -apple-system, sans-serif; font-size: 12px; font-weight: 600; color: #2E2330;">
                      BOMA — Finding neighbors who actually fit.
                    </p>
                    <p style="margin: 0; font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; color: #7A746B; line-height: 1.4;">
                      Lifestyle Matching · Pod Formations · Co-Living Agreements
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (type === 'invitation') {
      subject = `You've Been Invited to Join a BOMA Pod`;
      html = emailWrapper(`
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 700; color: #2E2330; margin: 0 0 12px 0;">
          You've Been Invited to Join a Pod
        </h2>
        <div style="background-color: #F7EDE7; border: 1px solid #EAD8CE; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">
          <span style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; color: #C46A4A; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">POD INVITATION</span>
          <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 700; color: #2E2330;">${podName || 'A BOMA Pod'}</span>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #5C544E; margin: 0 0 16px 0;">
          <strong style="color: #2E2330;">${inviterName || 'A neighbor'}</strong> has invited you to join their existing Pod on BOMA.
        </p>
        <p style="font-size: 13.5px; line-height: 1.6; color: #7A746B; margin: 0 0 24px 0;">
          BOMA helps groups align on lifestyle preferences, shared governance, and co-living agreements before taking the next step into The Commons.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteUrl || '#'}" style="background-color: #C46A4A; color: #FFFFFF; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; padding: 13px 32px; border-radius: 9999px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(196, 106, 74, 0.25);">
            Accept Pod Invitation
          </a>
        </div>
        <p style="font-size: 11.5px; color: #9C968E; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #F2ECE4; padding-top: 16px;">
          If you did not request this or do not wish to join, you can safely ignore this email.
        </p>
      `);
    } else if (type === 'reset') {
      subject = 'Reset your BOMA password';
      html = emailWrapper(`
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 700; color: #2E2330; margin: 0 0 12px 0;">
          Reset your password
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #5C544E; margin: 0 0 20px 0;">
          We received a request to reset your BOMA password. Use the following 6-digit verification code to verify your identity and set a new password:
        </p>
        
        <!-- OTP Box -->
        <div style="text-align: center; margin: 24px 0;">
          <div style="background-color: #F7EDE7; border: 1px solid #EAD8CE; border-radius: 12px; padding: 16px 28px; display: inline-block;">
            <span style="font-family: 'IBM Plex Mono', 'JetBrains Mono', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #C46A4A;">
              ${code}
            </span>
          </div>
        </div>

        <p style="font-size: 13px; line-height: 1.5; color: #7A746B; margin: 0 0 16px 0; text-align: center;">
          This code will expire in 15 minutes.
        </p>
        <p style="font-size: 11.5px; color: #9C968E; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #F2ECE4; padding-top: 16px;">
          If you did not request a password reset, you can safely ignore this message. Your password will remain unchanged.
        </p>
      `);
    } else {
      subject = 'Verify your BOMA email address';
      html = emailWrapper(`
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 700; color: #2E2330; margin: 0 0 12px 0;">
          Welcome to BOMA
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #5C544E; margin: 0 0 20px 0;">
          Please use the following 6-digit verification code to confirm your email address and continue setting up your profile:
        </p>

        <!-- OTP Box -->
        <div style="text-align: center; margin: 24px 0;">
          <div style="background-color: #F7EDE7; border: 1px solid #EAD8CE; border-radius: 12px; padding: 16px 28px; display: inline-block;">
            <span style="font-family: 'IBM Plex Mono', 'JetBrains Mono', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #C46A4A;">
              ${code}
            </span>
          </div>
        </div>

        <p style="font-size: 13px; line-height: 1.5; color: #7A746B; margin: 0 0 16px 0; text-align: center;">
          Enter this code in your browser to verify your account.
        </p>
        <p style="font-size: 11.5px; color: #9C968E; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #F2ECE4; padding-top: 16px;">
          If you did not create a BOMA account, you can safely ignore this email.
        </p>
      `);
    }

    const mailOptions = {
      from: `"BOMA" <${from}>`,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
