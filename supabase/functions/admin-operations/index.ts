import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password, operation, data } = await req.json();
    
    // Verify admin password first
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!adminPassword || password !== adminPassword) {
      console.log('Admin authentication failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let result;

    switch (operation) {
      // ===== USERS OPERATIONS =====
      case 'get_users':
        result = await supabase
          .from('authorized_users')
          .select('*')
          .order('created_at', { ascending: false });
        break;

      case 'add_user':
        result = await supabase
          .from('authorized_users')
          .insert({ email: data.email, name: data.name });
        break;

      case 'delete_user':
        result = await supabase
          .from('authorized_users')
          .delete()
          .eq('id', data.id);
        break;

      case 'update_user_status':
        result = await supabase
          .from('authorized_users')
          .update({ status: data.status })
          .eq('id', data.id);
        break;

      // ===== NOTIFICATIONS OPERATIONS =====
      case 'get_notifications':
        result = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        break;

      case 'add_notification':
        result = await supabase
          .from('notifications')
          .insert({ title: data.title, message: data.message });
        break;

      case 'delete_notification':
        result = await supabase
          .from('notifications')
          .delete()
          .eq('id', data.id);
        break;

      // ===== SPECIAL NOTIFICATIONS OPERATIONS =====
      case 'get_special_notifications':
        result = await supabase
          .from('special_notifications')
          .select('*')
          .order('created_at', { ascending: false });
        break;

      case 'add_special_notification':
        result = await supabase
          .from('special_notifications')
          .insert({
            title: data.title,
            description: data.description,
            button1_text: data.button1_text,
            button2_text: data.button2_text,
            dismiss_button: data.dismiss_button,
            button_count: data.button_count,
            is_active: true
          });
        break;

      case 'update_special_notification':
        result = await supabase
          .from('special_notifications')
          .update({
            title: data.title,
            description: data.description,
            button1_text: data.button1_text,
            button2_text: data.button2_text,
            dismiss_button: data.dismiss_button,
            button_count: data.button_count
          })
          .eq('id', data.id);
        break;

      case 'toggle_special_notification':
        result = await supabase
          .from('special_notifications')
          .update({ is_active: data.is_active })
          .eq('id', data.id);
        break;

      case 'delete_special_notification':
        result = await supabase
          .from('special_notifications')
          .delete()
          .eq('id', data.id);
        break;

      // ===== PERSONALIZED NOTIFICATIONS OPERATIONS =====
      case 'get_personalized_notifications':
        result = await supabase
          .from('user_personalized_notifications')
          .select('*')
          .order('created_at', { ascending: false });
        break;

      case 'add_personalized_notification':
        result = await supabase
          .from('user_personalized_notifications')
          .insert({
            user_email: data.user_email,
            title: data.title,
            description: data.description,
            button1_text: data.button1_text,
            button2_text: data.button2_text,
            dismiss_button: data.dismiss_button,
            button_count: data.button_count || 2,
            is_active: true,
            is_dismissed: false
          });
        break;

      case 'toggle_personalized_notification':
        result = await supabase
          .from('user_personalized_notifications')
          .update({ is_active: data.is_active, is_dismissed: false })
          .eq('id', data.id);
        break;

      case 'reset_personalized_dismissal':
        result = await supabase
          .from('user_personalized_notifications')
          .update({ is_dismissed: false })
          .eq('id', data.id);
        break;

      case 'delete_personalized_notification':
        result = await supabase
          .from('user_personalized_notifications')
          .delete()
          .eq('id', data.id);
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Unknown operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (result.error) {
      console.error(`Operation ${operation} failed:`, result.error);
      return new Response(
        JSON.stringify({ success: false, error: result.error.message, code: result.error.code }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Operation ${operation} successful`);
    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-operations:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
