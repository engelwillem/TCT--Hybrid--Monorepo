"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

      const data = await res.json();

      if (!res.ok) {
        // Laravel Validation Exception throws 422
        if (data.errors && data.errors.email) {
            setErrorMessage(data.errors.email[0]);
        } else if (data.message) {
            setErrorMessage(data.message);
        } else {
            setErrorMessage("Kredensial yang diberikan salah atau terjadi kendala server.");
        }
        setIsLoading(false);
        return;
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
    <div className="relative min-h-[100dvh] flex items-center justify-center p-6 bg-slate-950 text-white/90">
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-cyan-950/20 via-slate-950 to-blue-950/20" />

      <main className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="tct-serif text-4xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-white/50">Lanjutkan perjalanan rohani harianmu.</p>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Gagal Masuk</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="nama@domain.com"
                className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/70">Password</Label>
                <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
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
                className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
              />
              <Label htmlFor="remember" className="text-sm text-white/60 cursor-pointer">
                Tetap Masuk (Remember Me)
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl active:scale-[0.98] transition-all"
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

        <div className="text-center pt-4">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Depan
          </Link>
        </div>
      </main>
    </div>
  );
}
