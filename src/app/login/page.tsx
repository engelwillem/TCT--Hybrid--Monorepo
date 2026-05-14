"use client";

import React, { useMemo, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, LogIn, ShieldAlert, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { setAppAccessToken, setAppAuthUser } from "@/services/app-auth-token";
import { buildSanctumJsonHeaders, warmSanctumCsrf } from "@/lib/sanctum-csrf";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");
  const isSignup = intent === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [remember, setRemember] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (isSignup) {
      return name.trim().length > 1 && email.length > 0 && password.length >= 8 && passwordConfirmation.length > 0;
    }
    return email.length > 0 && password.length > 0;
  }, [isSignup, name, email, password, passwordConfirmation]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isSignup) {
        void trackFunnelEvent("signup_start", {
          surface: "auth",
          meta: {
            mode: "signup",
            intent: "account_create",
          },
        });
      }

      let xsrfToken: string | null = null;
      try {
        xsrfToken = await warmSanctumCsrf();
      } catch {
        xsrfToken = null;
      }

      const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
      const payload = isSignup
        ? { name: name.trim(), email, password, password_confirmation: passwordConfirmation }
        : { email, password, remember };

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: buildSanctumJsonHeaders(xsrfToken),
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        if (res.status === 503 || res.status === 504) {
          const code = typeof data?.error_code === "string" ? data.error_code : "";
          if (res.status === 504 || code === "LARAVEL_API_TIMEOUT") {
            setErrorMessage("Backend connection timed out. Ensure local Laravel is running, then try again.");
          } else {
            setErrorMessage("Laravel backend is unreachable. Check LARAVEL_API_BASE_URL and local server status.");
          }
          setIsLoading(false);
          return;
        }

        if (res.status === 401) {
          setErrorMessage(data?.message || "Invalid session. Please sign in again.");
          setIsLoading(false);
          return;
        }

        if (data?.errors) {
          const field = Object.keys(data.errors)[0];
          const firstError = field ? data.errors[field]?.[0] : null;
          setErrorMessage(firstError || data?.message || "Input is invalid. Please review and try again.");
        } else if (data?.message) {
          setErrorMessage(data.message);
        } else {
          setErrorMessage("Server returned an invalid response. Check backend configuration.");
        }
        setIsLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Request failed because backend response is not JSON.");
        setIsLoading(false);
        return;
      }

      const apiToken = data?.data?.token;
      const resolvedUser = data?.user || data?.data?.user || null;
      if (typeof apiToken === "string" && apiToken.length > 0) {
        const persistence = remember ? "local" : "session";
        setAppAccessToken(apiToken, "password", persistence);
      }
      if (resolvedUser) {
        const persistence = remember ? "local" : "session";
        setAppAuthUser({
          id: String(resolvedUser.id ?? ""),
          name: String(resolvedUser.name ?? ""),
          email: String(resolvedUser.email ?? ""),
          avatarUrl:
            typeof resolvedUser.avatarUrl === "string"
              ? resolvedUser.avatarUrl
              : typeof resolvedUser.avatar_url === "string"
                ? resolvedUser.avatar_url
                : null,
        }, persistence);
      }

      if (data.two_factor_required) {
        router.push(data.redirect_to || "/two-factor-challenge");
      } else {
        void trackFunnelEvent(isSignup ? "signup_success" : "login_success", {
          surface: "auth",
          meta: {
            mode: isSignup ? "signup" : "login",
            redirect_to: data.redirect_to || "/renungan",
          },
        });
        router.push(data.redirect_to || "/renungan");
      }
    } catch (error) {
      console.error("Auth Client Error:", error);
      setErrorMessage("Cannot connect to the server. Please try again later.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(160deg,#eaf2fb_0%,#e3ecf8_45%,#e1ebf7_100%)] text-foreground">
      <main className="mx-auto grid min-h-[100dvh] w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden rounded-[2.25rem] border border-white/70 bg-white/70 p-8 shadow-soft backdrop-blur-xl lg:block">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">TheChosenTalks</p>
          <h2 className="mt-4 tct-serif text-4xl font-bold leading-[1.05] tracking-tight text-slate-900">
            A modern faith platform for your daily spiritual journey.
          </h2>
          <p className="mt-5 text-sm font-medium leading-relaxed text-slate-600">
            {isSignup
              ? "Create your account to save reflections, organize your Bible journey, and grow with the community."
              : "Sign in to access platform features and grow consistently with the community."}
          </p>
        </section>

        <section className="w-full max-w-xl justify-self-center rounded-[2.25rem] border border-[#c7d5e6] bg-[#02113a] px-6 py-8 text-white shadow-[0_24px_80px_-24px_rgba(2,17,58,0.55)] sm:px-8 sm:py-10">
          <div className="text-center space-y-2">
            <h1 className="tct-serif text-4xl font-bold tracking-tight text-white">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm font-medium text-cyan-100/75">
              {isSignup ? "Sign up to begin your daily spiritual journey." : "Continue your daily spiritual journey."}
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mt-6 border-rose-400/35 bg-rose-500/15 text-rose-100">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>{isSignup ? "Sign Up Failed" : "Login Failed"}</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 rounded-[1.75rem] border border-white/20 bg-[#03184f]/75 p-6 shadow-inner sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-cyan-50/90">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Your full name"
                    className="h-12 rounded-2xl border-white/30 bg-slate-100/95 text-slate-900 placeholder:text-slate-500 focus-visible:ring-cyan-400/50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-cyan-50/90">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="nama@domain.com"
                  className="h-12 rounded-2xl border-white/30 bg-slate-100/95 text-slate-900 placeholder:text-slate-500 focus-visible:ring-cyan-400/50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-cyan-50/90">Password</Label>
                  {!isSignup && (
                    <Link href="/forgot-password" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  className="h-12 rounded-2xl border-white/30 bg-slate-100/95 text-slate-900 placeholder:text-slate-500 focus-visible:ring-cyan-400/50"
                />
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirmation" className="text-cyan-50/90">Confirm Password</Label>
                  <Input
                    id="passwordConfirmation"
                    type="password"
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-12 rounded-2xl border-white/30 bg-slate-100/95 text-slate-900 placeholder:text-slate-500 focus-visible:ring-cyan-400/50"
                  />
                </div>
              )}

              {!isSignup && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-[#02113a]"
                  />
                  <Label htmlFor="remember" className="text-sm text-cyan-100/80 cursor-pointer">
                    Keep me signed in
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !canSubmit}
                className="h-12 w-full rounded-full bg-cyan-400 font-black text-[#03224c] transition-all hover:bg-cyan-300 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isSignup ? "Creating account..." : "Authenticating..."}
                  </>
                ) : (
                  <>
                    {isSignup ? <UserPlus className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
                    {isSignup ? "Sign Up" : "Login"}
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="pt-6 text-center space-y-2">
            {isSignup ? (
              <Link href="/login" className="inline-flex items-center text-sm font-medium text-cyan-100/80 hover:text-cyan-100 transition-colors">
                Already have an account? Login
              </Link>
            ) : (
              <Link href="/login?intent=signup" className="inline-flex items-center text-sm font-medium text-cyan-100/80 hover:text-cyan-100 transition-colors">
                Don’t have an account? Sign up
              </Link>
            )}
            <div>
              <Link href="/" className="inline-flex items-center text-sm font-medium text-cyan-100/70 hover:text-cyan-100 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
