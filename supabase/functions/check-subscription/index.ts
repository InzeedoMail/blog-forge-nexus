
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.18.0";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
});

// Create a Supabase client with the service role key for admin operations
const adminSupabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create a Supabase client with the auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the user from the auth context
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get the customer's Stripe ID from the database
    const { data: customer, error: customerError } = await supabaseClient
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    // If no customer found, they don't have a subscription
    if (customerError && customerError.code !== "PGRST116") {
      console.error("Error fetching customer:", customerError);
    }

    if (!customer?.stripe_customer_id) {
      // Update subscriptions table with no subscription
      await adminSupabase
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          subscribed: false,
          subscription_tier: "free",
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      return new Response(
        JSON.stringify({
          subscribed: false,
          subscription_tier: "free",
          subscription_end: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check for active subscriptions in Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.stripe_customer_id,
      status: "active",
      expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
      // No active subscription
      await adminSupabase
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          subscribed: false,
          subscription_tier: "free",
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      return new Response(
        JSON.stringify({
          subscribed: false,
          subscription_tier: "free",
          subscription_end: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get the active subscription
    const subscription = subscriptions.data[0];
    
    // Determine subscription tier from price ID or product ID
    let subscriptionTier = "basic"; // Default
    
    // Get price details (if needed)
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });
    
    // Read the product metadata or name to determine tier
    const product = price.product as Stripe.Product;
    if (product.metadata?.tier) {
      subscriptionTier = product.metadata.tier;
    } else if (product.name?.toLowerCase().includes("premium")) {
      subscriptionTier = "premium";
    } else if (product.name?.toLowerCase().includes("enterprise")) {
      subscriptionTier = "enterprise";
    }
    
    // Get subscription end date
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    // Update subscription in database
    await adminSupabase
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        subscribed: true,
        stripe_subscription_id: subscription.id,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    
    return new Response(
      JSON.stringify({
        subscribed: true,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error checking subscription:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
