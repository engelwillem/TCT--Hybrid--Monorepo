"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Type, 
  Moon, 
  Sun, 
  Bookmark, 
  Share2, 
  StickyNote,
  ChevronDown,
  Minus,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { MOCK_VERSES } from "../mock-verses";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VersehubReaderPageProps {
  lang: string;
}

export function VersehubReaderPage({ lang }: VersehubReaderPageProps) {
  const router = useRouter();
  const [fontSize, setFontSize] = useState(18);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());
  const [translation, setTranslation] = useState("Terjemahan Baru (TB)");

  const toggleVerseSelection = (num: number) => {
    const newSelection = new Set(selectedVerses);
    if (newSelection.has(num)) {
      newSelection.delete(num);
    } else {
      newSelection.add(num);
    }
    setSelectedVerses(newSelection);
  };

  const clearSelection = () => setSelectedVerses(new Set());

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-500",
      isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-white text-slate-900"
    )}>
      <header className={cn(
        "sticky top-0 z-50 h-16 px-4 flex items-center justify-between border-b glass-effect",
      )}>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold leading-none">Yeremia 29</h1>
            <p className="tct-label">VerseHub • {lang}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 rounded-full font-bold text-xs uppercase">
              {translation.split(' ')[0]} <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Pilih Terjemahan</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {["Terjemahan Baru (TB)", "Bahasa Indonesia Masa Kini (BIMK)", "English Standard Version (ESV)"].map((t) => (
              <DropdownMenuItem key={t} onClick={() => setTranslation(t)}>
                {t}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="px-4 py-3 flex items-center justify-between border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
          >
            <Minus size={14} />
          </Button>
          <div className="flex items-center gap-1 min-w-[40px] justify-center">
            <Type size={14} />
            <span className="text-xs font-bold">{fontSize}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={() => setFontSize(prev => Math.max(14, prev + 2))}
          >
            <Plus size={14} />
          </Button>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-slate-600" />}
        </Button>
      </div>

      <main className="flex-1 p-8 reader-prose max-w-2xl mx-auto w-full">
        {MOCK_VERSES.map((verse) => (
          <motion.div
            key={verse.number}
            layout
            onClick={() => toggleVerseSelection(verse.number)}
            className={cn(
              "relative cursor-pointer transition-all duration-300 rounded-2xl px-6 py-4 -mx-6 group",
              selectedVerses.has(verse.number) 
                ? (isDarkMode ? "bg-brand/20 ring-1 ring-brand/50" : "bg-brand/10 ring-1 ring-brand/30") 
                : "hover:bg-muted/50"
            )}
          >
            <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
              <sup className={cn(
                "mr-3 font-bold text-[0.6em] transition-colors",
                selectedVerses.has(verse.number) ? "text-brand" : "text-muted-foreground"
              )}>
                {verse.number}
              </sup>
              {verse.text}
            </p>
          </motion.div>
        ))}
      </main>

      <AnimatePresence>
        {selectedVerses.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm z-50"
          >
            <div className="p-3 rounded-3xl shadow-2xl flex items-center justify-around ring-1 ring-border glass-effect">
              <div className="flex items-center gap-1 pl-2">
                <span className="text-xs font-bold bg-brand text-white w-6 h-6 flex items-center justify-center rounded-full">
                  {selectedVerses.size}
                </span>
              </div>
              
              <div className="h-6 w-px bg-border mx-2" />

              <Button variant="ghost" size="icon" className="rounded-full text-brand hover:bg-brand/10">
                <Bookmark size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-brand hover:bg-brand/10">
                <Share2 size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-brand hover:bg-brand/10">
                <StickyNote size={20} />
              </Button>
              
              <div className="h-6 w-px bg-border mx-2" />
              
              <Button variant="ghost" size="sm" onClick={clearSelection} className="font-bold text-xs uppercase hover:text-destructive">
                Batal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="p-16 text-center tct-label">
        Yeremia • Pasal 29 • {translation}
      </footer>
    </div>
  );
}