
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, Send } from "lucide-react";
import { CommunityUser } from "../types";

interface PostComposerProps {
  onPost: (text: string) => void;
  currentUser?: CommunityUser;
}

export function PostComposer({ onPost, currentUser }: PostComposerProps) {
  const [text, setText] = useState("");
  const avatarUrl = currentUser?.avatarUrl;
  const initials = (currentUser?.name?.[0] || "M").toUpperCase();

  const handlePost = () => {
    if (!text.trim()) return;
    onPost(text);
    setText("");
  };

  return (
    <Card className="border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-white/5 overflow-visible mb-6 transition-all duration-300 focus-within:ring-white/10 focus-within:bg-white/[0.04]">
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              placeholder="Apa yang ingin Anda bagikan hari ini?" 
              className="min-h-[80px] bg-white/[0.03] border border-white/5 rounded-xl focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-white/[0.05] resize-none transition-all placeholder:text-white/30 text-white"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/5 gap-2 rounded-full transition-colors">
            <ImagePlus size={18} />
            <span className="text-xs">Foto</span>
          </Button>
          <Button 
            size="sm" 
            className="rounded-full gap-2 px-5 bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-sm transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
            disabled={!text.trim()}
            onClick={handlePost}
          >
            <Send size={14} />
            <span>Kirim</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
