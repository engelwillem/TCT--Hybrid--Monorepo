"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreVertical, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const messages = [
  { id: 1, name: "Sarah Miller", text: "That verse you shared today really helped me.", time: "10:30 AM", unread: true },
  { id: 2, name: "Morning Prayer Group", text: "John: We'll start in 5 minutes everyone!", time: "9:15 AM", unread: false },
  { id: 3, name: "David Chen", text: "Are you coming to the talk tonight?", time: "Yesterday", unread: false },
  { id: 4, name: "System", text: "Welcome to TheChoosenTalks! Complete your profile...", time: "Feb 18", unread: false },
];

export default function InboxPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 space-y-5 sticky top-0 z-30 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="tct-h1 text-brand">Inbox</h2>
          <div className="flex items-center gap-2">
             <button className="p-2.5 rounded-full bg-muted/40 hover:bg-muted transition-colors text-muted-foreground active:scale-90">
              <Edit2 size={18} />
            </button>
            <button className="p-2.5 rounded-full bg-muted/40 hover:bg-muted transition-colors text-muted-foreground active:scale-90">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand" size={18} />
          <Input 
            placeholder="Search conversations..." 
            className="pl-12 rounded-2xl bg-muted/40 border-none h-12 text-sm focus-visible:ring-brand/20 transition-all font-medium" 
          />
        </div>
      </div>

      <div className="flex-1 px-4 pb-10 space-y-1">
        {messages.map((msg, i) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="p-4 flex gap-4 hover:bg-muted/30 transition-all cursor-pointer active:bg-muted/50 rounded-3xl group"
          >
            <div className="relative">
              <Avatar className="w-14 h-14 ring-4 ring-background shadow-md group-hover:scale-105 transition-transform">
                <AvatarImage src={`https://picsum.photos/seed/user-msg${msg.id}/100/100`} />
                <AvatarFallback>{msg.name[0]}</AvatarFallback>
              </Avatar>
              {msg.unread && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand rounded-full border-[3px] border-background animate-pulse"></div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-extrabold text-[15px] truncate text-foreground">{msg.name}</span>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{msg.time}</span>
              </div>
              <p className={`text-sm truncate leading-snug tracking-tight ${msg.unread ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
                {msg.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}