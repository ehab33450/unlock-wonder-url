import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { resolveLoginIdentifier } from "@/lib/auth.functions";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "تسجيل الدخول — يسير" }] }),
});

function AuthPage() {
  const nav = useNavigate();
  const resolve = useServerFn(resolveLoginIdentifier);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/" });
    });
  }, [nav]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { email: resolved } = await resolve({ data: { identifier } });
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: resolved,
        password,
      });
      if (signErr) throw new Error(signErr.message);
      nav({ to: "/" });
    } catch (err: any) {
      setError(err?.message ?? "تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[color:var(--eyenak-teal,#0ea5a4)] text-white flex items-center justify-center font-bold text-xl">يسير</div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-1">تسجيل الدخول</h1>
        <p className="text-center text-sm text-slate-500 mb-6">ادخل ببريدك الإلكتروني أو اسم المستخدم</p>

        <form onSubmit={onLogin} className="space-y-3">
            <div>
              <label className="text-xs text-slate-600 mb-1 block">اسم المستخدم أو البريد</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--eyenak-teal,#0ea5a4)]"
                placeholder="example or you@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--eyenak-teal,#0ea5a4)]"
              />
            </div>
            {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[color:var(--eyenak-teal,#0ea5a4)] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "..." : "دخول"}
            </button>
        </form>
      </div>
    </div>
  );
}