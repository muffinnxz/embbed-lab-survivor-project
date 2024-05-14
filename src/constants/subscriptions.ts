import { SubscriptionPlan } from "@/interfaces/subscription";

export const freePlan: SubscriptionPlan = {
  name: "Free",
  description:
    "The free plan can create unlimited flows and apps, but cannot use the community created apps on the explore page. Upgrading to the PRO plan to unlock all features!",
  stripePriceId: "",
};

export const proPlan: SubscriptionPlan = {
  name: "PRO",
  description:
    "The PRO plan has all the features of the free plan, plus: you can now use the community created apps on the explore page!",
  stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID || "",
};
