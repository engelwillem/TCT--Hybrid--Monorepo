"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buildSanctumJsonHeaders, warmSanctumCsrf } from "@/lib/sanctum-csrf";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const xsrfToken = await warmSanctumCsrf();

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        credentials: "same-origin",
        headers: buildSanctumJsonHeaders(xsrfToken),
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors && data.errors.email) {
          setErrorMessage(data.errors.email[0]);
        } else {
          setErrorMessage(data.message || "Gagal memproses permintaan reset password.");
        }
      } else {
        setSuccessMessage("Tautan reset password telah dikirim ke alamat email Anda.");
      }
    } catch (error) {
      console.error("Forgot Client Error:", error);
      setErrorMessage("Tidak dapat terhubung ke server. Silahkan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-6 bg-slate-950 text-white/90">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-950/20 via-slate-950 to-cyan-950/10" />

      <main className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="tct-serif text-3xl font-bold tracking-tight text-white mb-2">Lupa Kata Sandi?</h1>
          <p className="text-white/50 text-sm max-w-sm mx-auto">Masukkan alamat email Anda yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.</p>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 shadow-xl">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Kesalahan</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-xl">
            <CheckCircle2 className="h-4 w-4" color="#34d399" />
            <AlertTitle>Terkirim</AlertTitle>
            <AlertDescription className="text-emerald-500/80">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleForgot} className="space-y-6">
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

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-12 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold rounded-xl active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-cyan-400" />
                  Mengirimkan Tautan...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4 text-cyan-400" />
                  Kirim Reset Link
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center pt-4">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Login
          </Link>
        </div>
      </main>
    </div>
  );
}
