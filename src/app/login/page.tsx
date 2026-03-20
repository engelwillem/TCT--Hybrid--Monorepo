"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { setAppAccessToken } from "@/services/app-auth-token";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Initialize CSRF protection
      await fetch("/api/sanctum/csrf-cookie", { method: "GET" });

      // 2. Perform Login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        if (data?.errors?.email) {
            setErrorMessage(data.errors.email[0]);
        } else if (data?.message) {
            setErrorMessage(data.message);
        } else {
            setErrorMessage("Server mengembalikan respons tidak valid. Periksa konfigurasi backend.");
        }
        setIsLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Login gagal diproses karena respons backend bukan JSON.");
        setIsLoading(false);
        return;
      }

      const apiToken = data?.data?.token;
      if (typeof apiToken === "string" && apiToken.length > 0) {
        setAppAccessToken(apiToken);
      }

      // Success
      if (data.two_factor_required) {
        router.push(data.redirect_to || "/two-factor-challenge");
      } else {
        router.push(data.redirect_to || "/today");
      }
    } catch (error) {
      console.error("Login Client Error:", error);
      setErrorMessage("Tidak dapat terhubung ke server. Silahkan coba lagi nanti.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(160deg,#eaf2fb_0%,#e3ecf8_45%,#e1ebf7_100%)] text-foreground">
      <main className="mx-auto grid min-h-[100dvh] w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden rounded-[2.25rem] border border-white/70 bg-white/70 p-8 shadow-soft backdrop-blur-xl lg:block">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">TheChosenTalks</p>
          <h2 className="mt-4 tct-serif text-4xl font-bold leading-[1.05] tracking-tight text-slate-900">
            Ruang tenang untuk
            <br />
            melanjutkan ritme
            <br />
            rohanimu.
          </h2>
          <p className="mt-5 text-sm font-medium leading-relaxed text-slate-600">
            Masuk untuk menyimpan refleksi, menata perjalanan firman, dan bertumbuh konsisten bersama komunitas.
          </p>
        </section>

        <section className="w-full max-w-xl justify-self-center rounded-[2.25rem] border border-[#c7d5e6] bg-[#02113a] px-6 py-8 text-white shadow-[0_24px_80px_-24px_rgba(2,17,58,0.55)] sm:px-8 sm:py-10">
          <div className="text-center space-y-2">
            <h1 className="tct-serif text-4xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-sm font-medium text-cyan-100/75">Lanjutkan perjalanan rohani harianmu.</p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mt-6 border-rose-400/35 bg-rose-500/15 text-rose-100">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Gagal Masuk</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 rounded-[1.75rem] border border-white/20 bg-[#03184f]/75 p-6 shadow-inner sm:p-7">
            <form onSubmit={handleLogin} className="space-y-5">
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
                  <Link href="/forgot-password" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">
                    Lupa Sandi?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-12 rounded-2xl border-white/30 bg-slate-100/95 text-slate-900 placeholder:text-slate-500 focus-visible:ring-cyan-400/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-[#02113a]"
                />
                <Label htmlFor="remember" className="text-sm text-cyan-100/80 cursor-pointer">
                  Tetap Masuk (Remember Me)
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="h-12 w-full rounded-full bg-cyan-400 font-black text-[#03224c] transition-all hover:bg-cyan-300 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mengontentikasi...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Buka Blokir
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="pt-6 text-center">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-cyan-100/70 hover:text-cyan-100 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Depan
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
