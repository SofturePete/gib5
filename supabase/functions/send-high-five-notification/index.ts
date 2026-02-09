// Follow this setup guide to integrate the Deno runtime into your project:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HighFiveNotification {
  high_five_id: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { high_five_id } = await req.json() as HighFiveNotification;

    // Get high-five details with user information
    const { data: highFive, error: hfError } = await supabaseClient
      .from('high_fives')
      .select(`
        *,
        from_user:users!high_fives_from_user_id_fkey(name, email),
        to_user:users!high_fives_to_user_id_fkey(name, email)
      `)
      .eq('id', high_five_id)
      .single();

    if (hfError) throw hfError;
    if (!highFive) throw new Error('High-five not found');

    // Send email notification
    // NOTE: You need to configure your email service (SendGrid, Resend, etc.)
    // This is a placeholder for the email sending logic
    
    const emailData = {
      to: highFive.to_user.email,
      subject: `🙌 You received a High-Five from ${highFive.from_user.name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f9ab12;">🙌 High-Five!</h1>
          <p>Hey ${highFive.to_user.name.split(' ')[0]}!</p>
          <p><strong>${highFive.from_user.name}</strong> just gave you a high-five!</p>
          <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #f9ab12; margin: 20px 0;">
            <p style="font-style: italic; margin: 0;">"${highFive.message}"</p>
          </div>
          <p>Keep up the great work! 🌟</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Login to <a href="${Deno.env.get('APP_URL') || 'http://localhost:4200'}" style="color: #f9ab12;">gib5</a> to see all your high-fives!
          </p>
        </div>
      `
    };

    // TODO: Integrate with your email service
    // Example with Resend:
    // const res = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    //   },
    //   body: JSON.stringify({
    //     from: 'gib5 <noreply@yourdomain.com>',
    //     to: emailData.to,
    //     subject: emailData.subject,
    //     html: emailData.html,
    //   }),
    // });

    console.log('Email would be sent to:', emailData.to);

    // Log the email
    await supabaseClient
      .from('email_logs')
      .insert({
        user_id: highFive.to_user_id,
        type: 'notification'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent',
        email: emailData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
