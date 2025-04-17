
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.18.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
});
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  try {
    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new Response(`Webhook error: ${error.message}`, { status: 500 });
  }
});

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    // Get the customer from the subscription
    const customerId = subscription.customer as string;
    
    // Fetch the customer from our database using the Stripe customer ID
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();
    
    if (customerError) {
      console.error("Error fetching customer:", customerError);
      return;
    }
    
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
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .upsert({
        user_id: customerData.user_id,
        subscribed: subscription.status === "active",
        stripe_subscription_id: subscription.id,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    
    if (updateError) {
      console.error("Error updating subscription:", updateError);
    }
    
    // Also update the profiles table with subscription info
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_tier: subscriptionTier,
        subscription_status: subscription.status,
        subscription_end_date: subscriptionEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerData.user_id);
    
    if (profileUpdateError) {
      console.error("Error updating profile:", profileUpdateError);
    }
  } catch (error) {
    console.error("Error in handleSubscriptionChange:", error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Get the customer from the subscription
    const customerId = subscription.customer as string;
    
    // Fetch the customer from our database using the Stripe customer ID
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();
    
    if (customerError) {
      console.error("Error fetching customer:", customerError);
      return;
    }
    
    // Update subscription in database
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .upsert({
        user_id: customerData.user_id,
        subscribed: false,
        stripe_subscription_id: subscription.id,
        subscription_tier: "free",
        subscription_end: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    
    if (updateError) {
      console.error("Error updating subscription:", updateError);
    }
    
    // Also update the profiles table with subscription info
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_tier: "free",
        subscription_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerData.user_id);
    
    if (profileUpdateError) {
      console.error("Error updating profile:", profileUpdateError);
    }
  } catch (error) {
    console.error("Error in handleSubscriptionDeleted:", error);
  }
}
