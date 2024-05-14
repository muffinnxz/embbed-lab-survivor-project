import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase-auth";
import axios from "@/lib/axios";
import { freePlan, proPlan } from "@/constants/subscriptions";
import { stripe } from "@/lib/stripe";
import { formatDateJsonToObject } from "@/lib/utils";

export interface UserData {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  displayName?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isPro: boolean;
  plan: typeof freePlan | typeof proPlan;
  isCanceled: boolean;
  setIsCanceled: React.Dispatch<React.SetStateAction<boolean>>;
  handleChangeUserData: (data: UserData) => void;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => null,
  isLoading: false,
  setIsLoading: () => null,
  userData: null,
  setUserData: () => null,
  isPro: false,
  plan: freePlan,
  isCanceled: false,
  setIsCanceled: () => null,
  handleChangeUserData: () => null,
});

export default function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be within UserProvider");
  }
  return context;
}

export function UserProvider({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCanceled, setIsCanceled] = useState<boolean>(false);

  const handleChangeUserData = (data: UserData) => {
    if (data.stripeCurrentPeriodEnd) {
      setUserData({
        ...data,
        stripeCurrentPeriodEnd: formatDateJsonToObject(
          data.stripeCurrentPeriodEnd
        ),
      });
    } else {
      setUserData(data);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        axios
          .post("/user", {
            name: u.displayName,
            email: u.email,
            avatar: u.photoURL,
          })
          .then(({ data }: any) => {
            handleChangeUserData(data.data);
            setIsLoading(false);
          })
          .catch(() => setIsLoading(false));
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [setUser]);

  const isPro = useMemo(() => {
    return Boolean(
      userData &&
        userData?.stripePriceId &&
        userData?.stripeCurrentPeriodEnd &&
        userData?.stripeCurrentPeriodEnd?.getTime() + 86_400_000 > Date.now()
    );
  }, [userData]);

  const plan = useMemo(() => {
    return isPro ? proPlan : freePlan;
  }, [isPro]);

  useEffect(() => {
    if (isPro && userData?.stripeSubscriptionId) {
      stripe.subscriptions
        .retrieve(userData.stripeSubscriptionId)
        .then((stripePlan: any) => {
          setIsCanceled(Boolean(stripePlan.cancel_at_period_end));
        });
    } else {
      setIsCanceled(false);
    }
  }, [isPro, userData?.stripeSubscriptionId]);

  const value = {
    user,
    setUser,
    isLoading,
    setIsLoading,
    userData,
    setUserData,
    isPro,
    plan,
    isCanceled,
    setIsCanceled,
    handleChangeUserData,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
