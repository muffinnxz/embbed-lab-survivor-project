import admin from "@/lib/firebase-admin";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { NextApiRequest, NextApiResponse } from "next";
export const config = {
  api: {
    bodyParser: false,
  },
};

// Function to read the raw body
const readRawBody = (req: any) => {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: any) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", (err: any) => {
      reject(err);
    });
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const fs = admin.firestore();

  const body = (await readRawBody(req)) as string;
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error: any) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (!session?.metadata?.userId) {
    return res.status(400).send("Missing metadata");
  }
  const user = fs.collection("users").doc(session.metadata.userId);

  if (event.type === "checkout.session.completed") {
    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update the user stripe into in our database.
    // Since this is the initial subscription, we need to update
    // the subscription id and customer id.
    await user.update({
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update the price id and set the new period end.
    user.update({
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  return res.status(200).json({ received: true });
};

export default handler;
