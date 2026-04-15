import { cn } from "@/lib/utils";

type AITone = "gentle" | "grounded" | "assistive";

type AIToneNoticeProps = {
  tone: AITone;
  text?: string;
  className?: string;
};

const TONE_COPY: Record<AITone, string> = {
  gentle: "AI akan merespons singkat dan menenangkan.",
  grounded: "AI akan fokus pada teks firman dan konteksnya.",
  assistive: "AI membantu merapikan tulisanmu tanpa mengambil alih suara kamu.",
};

export function AIToneNotice({ tone, text, className }: AIToneNoticeProps) {
  return (
    <p className={cn("text-[11px] leading-relaxed text-slate-500", className)}>
      {text || TONE_COPY[tone]}
    </p>
  );
}
