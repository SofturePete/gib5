import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail } from '../_shared/smtp.ts';
import { weeklyReminderTemplate } from '../_shared/email-templates.ts';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Finde alle User die diese Woche noch NICHTS GEGEBEN haben
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Alle User
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, email, name');
    
    // User die diese Woche High-Fives GEGEBEN haben
    const { data: activeGivers } = await supabase
      .from('high_fives')
      .select('from_user_id')
      .gte('created_at', oneWeekAgo.toISOString());
    
    const activeGiverIds = new Set((activeGivers || []).map(hf => hf.from_user_id));
    
    // User die noch nichts gegeben haben
    const inactiveUsers = (allUsers || []).filter(u => !activeGiverIds.has(u.id));
    
    // Reminder-Email an jeden inaktiven User
    let sentCount = 0;
    for (const user of inactiveUsers) {
      try {
        const html = weeklyReminderTemplate(user.name, 1);
        
        await sendEmail(
          user.email,
          '⏰ Erinnerung: High-Five geben diese Woche!',
          html
        );
        
        await supabase.from('email_logs').insert({
          user_id: user.id,
          type: 'reminder'
        });
        
        sentCount++;
      } catch (error) {
        console.error(`Failed to send reminder to ${user.email}:`, error);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        remindersSent: sentCount,
        totalInactive: inactiveUsers.length
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
