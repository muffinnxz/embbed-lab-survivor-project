import { proPlan } from "@/constants/subscriptions";
import admin from "@/lib/firebase-admin";
import { NextApiRequestWithUser, firebaseAuth } from "@/middlewares/auth";
import type { NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import { UserData } from "@/hooks/use-user";
import { formatDateJsonToObject } from "@/lib/utils";

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  const billingUrl = `${process.env.NEXT_PUBLIC_ORIGIN_URL}/dashboard/billing`;

  const fs = admin.firestore();
  const userId = req.user;
  const user = await fs.collection("users").doc(userId).get();

  if (!user.exists) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const userData = user.data() as UserData;
  try {
    const isPro = Boolean(
      userData &&
        userData?.stripePriceId &&
        userData?.stripeCurrentPeriodEnd &&
        formatDateJsonToObject(userData?.stripeCurrentPeriodEnd)?.getTime() + 86_400_000 > Date.now()
    );

    // The user is on the pro plan.
    // Create a portal session to manage subscription.
    if (isPro && userData?.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userData?.stripeCustomerId,
        return_url: billingUrl
      });

      return res.status(200).json({
        message: "Success",
        data: {
          url: stripeSession.url
        }
      });
    }

    // The user is on the free plan.
    // Create a checkout session to upgrade.
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: userData.email,
      line_items: [
        {
          price: proPlan.stripePriceId,
          quantity: 1
        }
      ],
      metadata: {
        userId
      }
    });
    res.status(200).json({ message: "Success", data: stripeSession });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default firebaseAuth(handler);
