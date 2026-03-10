
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
    <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-visible mb-6">
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              placeholder="Apa yang ingin Anda bagikan hari ini?" 
              className="min-h-[80px] bg-muted/30 border-none focus-visible:ring-primary/20 resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 rounded-full">
            <ImagePlus size={18} />
            <span className="text-xs">Foto</span>
          </Button>
          <Button 
            size="sm" 
            className="rounded-full gap-2 px-5" 
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
