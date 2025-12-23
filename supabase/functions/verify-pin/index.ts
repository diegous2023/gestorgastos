import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, pin, action } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!pin || pin.length !== 4) {
      return new Response(
        JSON.stringify({ error: 'PIN debe ser de 4 dígitos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('authorized_users')
      .select('email, name, pin')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (userError || !user) {
      console.error('User fetch error:', userError)
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create PIN
    if (action === 'create') {
      const { error: updateError } = await supabaseAdmin
        .from('authorized_users')
        .update({ pin: pin })
        .eq('email', email.toLowerCase().trim())

      if (updateError) {
        console.error('PIN update error:', updateError)
        return new Response(
          JSON.stringify({ error: 'Error al crear el PIN' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`PIN created for user: ${email}`)
      return new Response(
        JSON.stringify({ success: true, message: 'PIN creado correctamente' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify PIN
    if (action === 'verify') {
      if (!user.pin) {
        return new Response(
          JSON.stringify({ error: 'El usuario no tiene PIN configurado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (user.pin !== pin) {
        console.log(`Invalid PIN attempt for user: ${email}`)
        return new Response(
          JSON.stringify({ error: 'PIN incorrecto' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`PIN verified for user: ${email}`)
      return new Response(
        JSON.stringify({ success: true, message: 'PIN verificado correctamente' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Acción no válida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in verify-pin:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})