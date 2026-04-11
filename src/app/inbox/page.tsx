"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  UserCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/auth/use-auth-session";
import { buildAppAuthHeaders, fetchWithAppAuth } from "@/lib/app-auth-fetch";
import { subscribeDataMutation } from "@/lib/mutation-sync";
import MobileAppLayout from "@/layouts/MobileAppLayout";
import SegmentedTabs from "@/components/core/SegmentedTabs";

type InboxItem = {
  message_id: number;
  preview: string;
  is_unread: boolean;
  created_at: string | null;
  partner: {
    id: number;
    name: string;
    online: boolean;
    avatar?: string;
  };
  can_approve?: boolean;
};

type InboxPayload = {
  tabs?: {
    primary?: InboxItem[];
    general?: InboxItem[];
    requests?: InboxItem[];
  };
  counts?: {
    primary?: number;
    general?: number;
    requests?: number;
  };
};

type InboxTab = "primary" | "general" | "requests";

export default function InboxPage() {
  const router = useRouter();
  const { isAuthenticated, isRestoring } = useAuthSession();
  const [inbox, setInbox] = useState<InboxPayload>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InboxTab>("primary");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInbox = async (showLoader = false) => {
    if (isRestoring) return;
    if (!isAuthenticated) {
      setInbox({});
      setLoading(false);
      return;
    }

    if (showLoader) setLoading(true);
    try {
      const response = await fetchWithAppAuth("/api/inbox", {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        const payload = await response.json();
        setInbox(payload.inbox ?? {});
      } else if (response.status === 401) {
        setInbox({});
      }
    } catch {
      // keep current state
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (isRestoring) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setInbox({});
      setLoading(false);
      return;
    }

    void fetchInbox(true);
    const interval = setInterval(() => void fetchInbox(), 7000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isRestoring]);

  useEffect(() => {
    const unsubscribe = subscribeDataMutation((detail) => {
      if (!detail.path.startsWith("/api/inbox/") && !detail.path.startsWith("/api/users/")) {
        return;
      }
      void fetchInbox();
    });

    return unsubscribe;
  }, [isAuthenticated, isRestoring]);

  const formatTime = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const totalThreads = useMemo(
    () => Object.values(inbox.counts ?? {}).reduce((acc, value) => acc + (Number(value) || 0), 0),
    [inbox.counts]
  );

  const unreadThreads = useMemo(() => {
    const tabs = inbox.tabs ?? {};
    return Object.values(tabs)
      .flat()
      .filter((item) => item?.is_unread).length;
  }, [inbox.tabs]);

  const visibleItems = useMemo(() => {
    const tabs = inbox.tabs ?? {};
    return tabs[activeTab] ?? [];
  }, [activeTab, inbox.tabs]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return visibleItems;

    return visibleItems.filter((item) => {
      const haystack = [item.partner?.name, item.preview]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, visibleItems]);

  const approveRequest = async (e: React.MouseEvent, messageId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || busyKey) return;

    setBusyKey(`approve:${messageId}`);
    try {
      const res = await fetchWithAppAuth(`/api/inbox/messages/${messageId}/approve`, {
        method: "POST",
        headers: buildAppAuthHeaders({ contentType: "application/json" }),
        body: JSON.stringify({}),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok !== true) {
        showToast("Gagal menyetujui pesan", "error");
        return;
      }

      showToast("Peringatan telah disetujui");
      setActiveTab("general");
      void fetchInbox();
    } catch {
      showToast("Gagal menyetujui pesan", "error");
    } finally {
      setBusyKey(null);
    }
  };

  if (loading && !inbox.tabs) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#f5f8fc_100%)] flex flex-col items-center justify-center gap-4 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/80 bg-white/90 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.32)]">
          <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
        </div>
        <div className="text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Inbox</p>
          <p className="mt-2 text-sm font-medium text-slate-600">Menyiapkan percakapan dan notifikasi...</p>
        </div>
      </div>
    );
  }

  if (!loading && !isAuthenticated) {
    return (
      <MobileAppLayout title="Inbox" activeNavId="home" backHref="/renungan">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[640px] items-center px-4 py-10">
          <div className="relative w-full overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.96))] p-7 shadow-[0_34px_100px_-52px_rgba(15,23,42,0.34)] backdrop-blur-xl sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-10 h-44 w-44 rounded-full bg-sky-100/75 blur-3xl" />
            <div className="pointer-events-none absolute left-5 top-5 h-20 w-20 rounded-[1.75rem] border border-white/90 bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]" />
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/80" />

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-7 inline-flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-[1.7rem] border border-sky-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.92))] text-sky-600 shadow-[0_24px_48px_-28px_rgba(14,165,233,0.42)] ring-1 ring-white/70">
                <UserCircle2 className="h-8 w-8 stroke-[1.9]" />
              </div>

              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Private access</p>
              <h1 className="mt-3 max-w-[15ch] tct-serif text-[2.25rem] leading-[1.02] tracking-[-0.04em] text-slate-900 sm:text-[2.45rem]">
                Login atau Daftar
                <br />
                untuk buka inbox
              </h1>

              <div className="mt-8 w-full max-w-[330px] space-y-3">
                <Link
                  href="/login?next=/inbox"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#0f172a,#111827)] px-6 text-sm font-semibold text-white shadow-[0_18px_34px_-22px_rgba(15,23,42,0.55)] transition-all hover:-translate-y-0.5 hover:bg-slate-900"
                >
                  Login
                </Link>
                <Link
                  href="/login?intent=signup&next=/inbox"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-200/90 bg-white/84 px-6 text-sm font-semibold text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition-all hover:border-slate-300 hover:bg-white/96"
                >
                  Daftar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout
      title="Inbox"
      activeNavId="home"
      backHref="/renungan"
      rightAction={
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={cn(
               "flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-90",
               isSearchOpen ? "bg-slate-100 text-sky-600" : "text-slate-500 hover:bg-slate-50"
            )}
            aria-label="Toggle search"
          >
            <Search size={20} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => void fetchInbox(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-50 active:scale-90"
            aria-label="Muat ulang inbox"
          >
            <RefreshCw size={19} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-[720px] pb-24">
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-4 mb-4"
            >
              <div className="flex items-center gap-3 rounded-2xl bg-slate-100/80 px-4 py-2.5 ring-1 ring-black/[0.03] backdrop-blur-md">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari percakapan..."
                  className="w-full bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="px-4 mb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900/90">Pesan</h1>
            <div className="text-[11px] font-bold text-slate-400">
               {unreadThreads > 0 ? `${unreadThreads} Belum dibaca` : "Semua terbaca"}
            </div>
          </div>
          
          <div className="scrollbar-hide overflow-x-auto">
            <SegmentedTabs
              options={[
                { id: "primary", label: `Utama` },
                { id: "general", label: `Umum` },
                { id: "requests", label: `Permintaan` },
              ]}
              activeId={activeTab}
              onChange={(id) => setActiveTab(id as InboxTab)}
            />
          </div>
        </section>

        <div className="divide-y divide-slate-50">
          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <motion.div
                key={`empty-${activeTab}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                  <Inbox className="h-6 w-6" />
                </div>
                <p className="mt-4 text-[13px] font-medium text-slate-400">
                  {searchQuery.trim() ? "Tidak ada hasil pencarian" : "Belum ada percakapan"}
                </p>
              </motion.div>
            ) :            (
              filteredItems.map((item, idx) => (
                <motion.button
                  key={item.message_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.01 }}
                  onClick={() => router.push(`/inbox/${item.partner.id}`)}
                  className={cn(
                    "group relative flex w-full items-center gap-4 px-4 py-3 sm:px-5 sm:py-3.5 text-left transition-all hover:bg-black/[0.015] active:bg-black/[0.045] active:scale-[0.985]",
                    item.is_unread ? "bg-sky-50/20" : "bg-transparent"
                  )}
                >
                  <div className="relative flex-none">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-bold ring-1 ring-black/[0.02] shadow-sm",
                      item.is_unread ? "bg-sky-100 text-sky-700" : "bg-slate-100/80 text-slate-500"
                    )}>
                      {(item.partner?.name || "?").slice(0, 1).toUpperCase()}
                    </div>
                    {item.partner?.online && (
                      <div className="absolute right-0.5 bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-3">
                       <p className={cn(
                         "truncate text-[15.5px] tracking-tight leading-none",
                         item.is_unread ? "font-bold text-slate-900" : "font-medium text-slate-800"
                       )}>
                        {item.partner?.name || "Unknown"}
                      </p>
                      <span className="shrink-0 text-[11px] font-medium text-slate-400">
                        {formatTime(item.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-1.5">
                      <p className={cn(
                        "truncate text-[14px] leading-tight flex-1",
                        item.is_unread ? "font-medium text-slate-600" : "text-slate-500/80"
                      )}>
                        {item.preview || "Ketuk untuk memulai percakapan."}
                      </p>
                      
                      {item.is_unread && (
                        <div className="shrink-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 text-[10px] font-black text-white shadow-sm ring-4 ring-sky-500/10">
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-[76px] right-0 h-px bg-slate-100/50 group-last:hidden" />
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {toast ? (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.95 }}
              className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
            >
              <div
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl ring-1 backdrop-blur-xl",
                  toast.type === "error"
                    ? "bg-rose-500 text-white ring-rose-300/20 shadow-rose-500/30"
                    : "bg-emerald-500 text-white ring-emerald-300/20 shadow-emerald-500/30"
                )}
              >
                {toast.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                <p className="text-[12px] font-black tracking-wide">{toast.message}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </MobileAppLayout>
  );
}
