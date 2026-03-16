"use client";

import React, { useState, useEffect, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, KeyRound, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get("token") || "";
  const queryEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(queryEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (queryEmail) setEmail(queryEmail);
  }, [queryEmail]);

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic frontend validation
    if (password !== passwordConfirmation) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok dengan sandi baru.");
      setIsLoading(false);
      return;
    }

    try {
      await fetch("/api/sanctum/csrf-cookie", { method: "GET" });

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token,
          email,
          password,
          password_confirmation: passwordConfirmation 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors && data.errors.email) {
          setErrorMessage(data.errors.email[0]);
        } else if (data.errors && data.errors.password) {
          setErrorMessage(data.errors.password[0]);
        } else {
          setErrorMessage(data.message || "Gagal mengubah kata sandi.");
        }
      } else {
        setSuccessMessage("Kata sandi berhasil diubah! Anda akan dialihkan ke halaman Login...");
        setTimeout(() => {
            router.push("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Reset Client Error:", error);
      setErrorMessage("Tidak dapat terhubung ke server. Silahkan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative z-10 w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <h1 className="tct-serif text-3xl font-bold tracking-tight text-white mb-2">Buat Sandi Baru</h1>
        <p className="text-white/50 text-sm max-w-sm mx-auto">Silakan buat kata sandi baru untuk akun Anda. Jangan bagikan sandi ini ke siapapun.</p>
      </div>

      {!token && (
        <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/20 text-orange-500 shadow-xl">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Token Keamanan Hilang</AlertTitle>
          <AlertDescription>Tautan yang Anda gunakan tidak valid atau sudah kedaluwarsa. Silakan ajukan reset password kembali.</AlertDescription>
        </Alert>
      )}

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
          <AlertTitle>Selesai</AlertTitle>
          <AlertDescription className="text-emerald-500/80">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl shadow-2xl">
        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/70">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              readOnly={!!queryEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/50 read-only:text-white/40 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70">Kata Sandi Baru</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 Karakter"
              className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation" className="text-white/70">Konfirmasi Sandi Baru</Label>
            <Input
              id="password_confirmation"
              type="password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Ulangi Sandi Baru Anda"
              className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-cyan-500/50"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !token || !email || !password || !passwordConfirmation}
            className="w-full h-12 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold rounded-xl active:scale-[0.98] transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-cyan-400" />
                Memproses Perubahan...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4 text-cyan-400" />
                Simpan Kata Sandi
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="text-center pt-4">
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Batal dan Kembali Login
        </Link>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-6 bg-slate-950 text-white/90">
      <div className="absolute inset-0 z-0 bg-gradient-to-tl from-emerald-950/20 via-slate-950 to-cyan-950/10" />
      <Suspense fallback={<div className="text-white">Memuat komponen autentikasi...</div>}>
         <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
