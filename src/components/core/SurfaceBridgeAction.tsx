import Link from "next/link";
import { cn } from "@/lib/utils";

type SurfaceTarget = "renungan" | "versehub" | "community";

type SurfaceBridgeActionProps = {
  target: SurfaceTarget;
  label: string;
  href: string;
  className?: string;
};

const targetToneClass: Record<SurfaceTarget, string> = {
  renungan: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
  versehub: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
  community: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
};

export function SurfaceBridgeAction({ target, label, href, className }: SurfaceBridgeActionProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
        targetToneClass[target],
        className
      )}
    >
      {label}
    </Link>
  );
}
