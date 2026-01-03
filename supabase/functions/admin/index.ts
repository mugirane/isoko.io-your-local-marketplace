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
        // Get all stores with payment info - optimized query
        const { data: stores, error: storesError } = await supabase
          .from("stores")
          .select("*")
          .order("created_at", { ascending: false });

        if (storesError) {
          console.error("Error fetching stores:", storesError);
          throw storesError;
        }

        if (!stores || stores.length === 0) {
          return new Response(
            JSON.stringify({ stores: [] }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Batch fetch all related data
        const storeIds = stores.map(s => s.id);
        
        // Fetch all payments in one query
        const { data: allPayments } = await supabase
          .from("store_payments")
          .select("*")
          .in("store_id", storeIds)
          .order("due_date", { ascending: false });

        // Fetch all notes in one query
        const { data: allNotes } = await supabase
          .from("admin_notes")
          .select("*")
          .in("store_id", storeIds)
          .order("created_at", { ascending: false });

        // Fetch all follower counts
        const { data: followerCounts } = await supabase
          .from("store_followers")
          .select("store_id")
          .in("store_id", storeIds);

        // Group data by store
        const paymentsByStore = new Map();
        (allPayments || []).forEach(p => {
          if (!paymentsByStore.has(p.store_id)) {
            paymentsByStore.set(p.store_id, p);
          }
        });

        const notesByStore = new Map();
        (allNotes || []).forEach(n => {
          if (!notesByStore.has(n.store_id)) {
            notesByStore.set(n.store_id, []);
          }
          notesByStore.get(n.store_id).push(n);
        });

        const followersCountByStore = new Map();
        (followerCounts || []).forEach(f => {
          followersCountByStore.set(f.store_id, (followersCountByStore.get(f.store_id) || 0) + 1);
        });

        // Build final result
        const storesWithPayments = stores.map(store => ({
          ...store,
          latest_payment: paymentsByStore.get(store.id) || null,
          notes: notesByStore.get(store.id) || [],
          followers_count: followersCountByStore.get(store.id) || 0,
        }));

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
        
        // Get payment details first to calculate affiliate commission
        const { data: payment } = await supabase
          .from("store_payments")
          .select("*, stores(referred_by_affiliate_id)")
          .eq("id", payment_id)
          .single();

        const { error } = await supabase
          .from("store_payments")
          .update({ is_paid: true, paid_at: new Date().toISOString() })
          .eq("id", payment_id);

        if (error) throw error;

        // If store was referred by an affiliate, create earnings record
        if (payment?.stores?.referred_by_affiliate_id) {
          const commissionAmount = payment.amount * 0.30;
          await supabase
            .from("affiliate_earnings")
            .insert({
              affiliate_id: payment.stores.referred_by_affiliate_id,
              store_id: payment.store_id,
              payment_id: payment_id,
              amount: commissionAmount,
            });
          console.log(`Affiliate commission of ${commissionAmount} created`);
        }

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
            is_read: false,
          });

        if (error) throw error;
        console.log(`Admin message sent to store ${store_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_all_chats": {
        // Get stores with unread messages - optimized
        const { data: stores } = await supabase
          .from("stores")
          .select("id, name");

        if (!stores || stores.length === 0) {
          return new Response(
            JSON.stringify({ chats: [] }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const storeIds = stores.map(s => s.id);

        // Batch fetch messages
        const { data: allMessages } = await supabase
          .from("admin_chats")
          .select("*")
          .in("store_id", storeIds)
          .order("created_at", { ascending: false });

        // Group and process
        const messagesByStore = new Map();
        const unreadByStore = new Map();
        
        (allMessages || []).forEach(msg => {
          if (!messagesByStore.has(msg.store_id)) {
            messagesByStore.set(msg.store_id, msg);
          }
          if (msg.sender_type === "seller" && !msg.is_read) {
            unreadByStore.set(msg.store_id, (unreadByStore.get(msg.store_id) || 0) + 1);
          }
        });

        const storesWithChats = stores
          .map(store => ({
            ...store,
            last_message: messagesByStore.get(store.id) || null,
            unread_count: unreadByStore.get(store.id) || 0,
          }))
          .filter(s => s.last_message);

        return new Response(
          JSON.stringify({ chats: storesWithChats }),
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

      case "get_affiliates": {
        const { data, error } = await supabase
          .from("affiliates")
          .select("*, affiliate_earnings(amount, is_paid)")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const affiliatesWithStats = (data || []).map(affiliate => {
          const earnings = affiliate.affiliate_earnings || [];
          const totalEarned = earnings.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
          const unpaidEarnings = earnings.filter((e: any) => !e.is_paid).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
          return {
            ...affiliate,
            total_earned: totalEarned,
            unpaid_earnings: unpaidEarnings,
          };
        });

        return new Response(
          JSON.stringify({ affiliates: affiliatesWithStats }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "pay_affiliate": {
        const { affiliate_id } = params;
        const { error } = await supabase
          .from("affiliate_earnings")
          .update({ is_paid: true, paid_at: new Date().toISOString() })
          .eq("affiliate_id", affiliate_id)
          .eq("is_paid", false);

        if (error) throw error;
        console.log(`Affiliate ${affiliate_id} earnings paid`);
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
