import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_PASSWORD = "29042006";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, password, ...params } = await req.json();

    // Verify admin password
    if (password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin action: ${action}`, params);

    switch (action) {
      case "get_stores": {
        // Get all stores with payment info
        const { data: stores, error } = await supabase
          .from("stores")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Get payment info for each store
        const storesWithPayments = await Promise.all(
          stores.map(async (store) => {
            const { data: payments } = await supabase
              .from("store_payments")
              .select("*")
              .eq("store_id", store.id)
              .order("due_date", { ascending: false })
              .limit(1);

            const { data: notes } = await supabase
              .from("admin_notes")
              .select("*")
              .eq("store_id", store.id)
              .order("created_at", { ascending: false });

            const { count: followersCount } = await supabase
              .from("store_followers")
              .select("*", { count: "exact", head: true })
              .eq("store_id", store.id);

            return {
              ...store,
              latest_payment: payments?.[0] || null,
              notes: notes || [],
              followers_count: followersCount || 0,
            };
          })
        );

        return new Response(
          JSON.stringify({ stores: storesWithPayments }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "freeze_store": {
        const { store_id, is_active } = params;
        const { error } = await supabase
          .from("stores")
          .update({ is_active })
          .eq("id", store_id);

        if (error) throw error;
        console.log(`Store ${store_id} ${is_active ? "unfrozen" : "frozen"}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add_note": {
        const { store_id, note } = params;
        const { error } = await supabase
          .from("admin_notes")
          .insert({ store_id, note });

        if (error) throw error;
        console.log(`Note added to store ${store_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete_note": {
        const { note_id } = params;
        const { error } = await supabase
          .from("admin_notes")
          .delete()
          .eq("id", note_id);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create_payment": {
        const { store_id } = params;
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 1);

        const { error } = await supabase
          .from("store_payments")
          .insert({
            store_id,
            amount: 8000,
            due_date: dueDate.toISOString(),
          });

        if (error) throw error;
        console.log(`Payment created for store ${store_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "mark_paid": {
        const { payment_id } = params;
        const { error } = await supabase
          .from("store_payments")
          .update({ is_paid: true, paid_at: new Date().toISOString() })
          .eq("id", payment_id);

        if (error) throw error;
        console.log(`Payment ${payment_id} marked as paid`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_due_payments": {
        const { data, error } = await supabase
          .from("store_payments")
          .select("*, stores(name, email, phone)")
          .eq("is_paid", false)
          .lte("due_date", new Date().toISOString());

        if (error) throw error;
        return new Response(
          JSON.stringify({ payments: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_chats": {
        const { store_id } = params;
        const { data, error } = await supabase
          .from("admin_chats")
          .select("*")
          .eq("store_id", store_id)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return new Response(
          JSON.stringify({ messages: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_message": {
        const { store_id, message } = params;
        const { error } = await supabase
          .from("admin_chats")
          .insert({
            store_id,
            sender_type: "admin",
            message,
          });

        if (error) throw error;
        console.log(`Admin message sent to store ${store_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_all_chats": {
        // Get stores with unread messages
        const { data: stores } = await supabase
          .from("stores")
          .select("id, name");

        const storesWithChats = await Promise.all(
          (stores || []).map(async (store) => {
            const { data: messages } = await supabase
              .from("admin_chats")
              .select("*")
              .eq("store_id", store.id)
              .order("created_at", { ascending: false })
              .limit(1);

            const { count: unreadCount } = await supabase
              .from("admin_chats")
              .select("*", { count: "exact", head: true })
              .eq("store_id", store.id)
              .eq("sender_type", "seller")
              .eq("is_read", false);

            return {
              ...store,
              last_message: messages?.[0] || null,
              unread_count: unreadCount || 0,
            };
          })
        );

        return new Response(
          JSON.stringify({ chats: storesWithChats.filter(s => s.last_message) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "mark_messages_read": {
        const { store_id } = params;
        const { error } = await supabase
          .from("admin_chats")
          .update({ is_read: true })
          .eq("store_id", store_id)
          .eq("sender_type", "seller");

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Admin function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
