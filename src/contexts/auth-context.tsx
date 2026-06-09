import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/auth.functions";

type Me = {
  profile: { id: string; display_name: string; username: string | null; email: string | null; active: boolean } | null;
  roles: string[];
  isAdmin: boolean;
  perms: Record<string, boolean>;
};

type AuthCtx = {
  loading: boolean;
  session: boolean;
  me: Me | null;
  hasPerm: (key: string) => boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getMe();
      setMe(data as Me);
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(!!s);
      if (s) {
        setTimeout(() => refresh().finally(() => setLoading(false)), 0);
      } else {
        setMe(null);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(!!data.session);
      if (data.session) refresh().finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refresh]);

  const hasPerm = useCallback(
    (key: string) => {
      if (!me) return false;
      if (me.isAdmin) return true;
      return !!me.perms[key];
    },
    [me],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <Ctx.Provider value={{ loading, session, me, hasPerm, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}