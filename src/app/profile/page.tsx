"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Edit3, ChevronRight, Bookmark, Shield, Bell, HelpCircle, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const menuItems = [
    { icon: Bookmark, label: "Saved Talks", color: "text-blue-500 bg-blue-500/10" },
    { icon: Bell, label: "Notifications", color: "text-orange-500 bg-orange-500/10" },
    { icon: Shield, label: "Privacy & Safety", color: "text-green-500 bg-green-500/10" },
    { icon: HelpCircle, label: "Help Center", color: "text-purple-500 bg-purple-500/10" },
  ];

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-1000">
      <header className="p-8 pb-4 flex items-center justify-between">
        <h2 className="tct-h1 text-brand">Profile</h2>
        <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
          <Settings size={20} />
        </Button>
      </header>

      <div className="px-6 space-y-8 pb-10">
        {/* Profile Header */}
        <section className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative inline-block"
          >
            <Avatar className="w-28 h-28 mx-auto ring-4 ring-brand/10 p-1.5 bg-background shadow-xl">
              <AvatarImage src="https://picsum.photos/seed/myprofile/200/200" />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
            <Button size="icon" className="absolute bottom-1 right-1 h-9 w-9 rounded-2xl shadow-lg border-2 border-background">
              <Edit3 size={16} />
            </Button>
          </motion.div>
          <div className="space-y-1">
            <h3 className="tct-h2">The Chosen User</h3>
            <p className="text-muted-foreground text-sm font-medium">@chosen_one_2025</p>
          </div>
          <div className="flex justify-center gap-3">
            <Badge variant="secondary" className="bg-brand/10 text-brand border-none h-7 px-3">Level 12</Badge>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-none h-7 px-3">340 Points</Badge>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Talks", val: "24" },
            { label: "Followers", val: "1.2k" },
            { label: "Prayers", val: "85" },
          ].map((stat) => (
            <Card key={stat.label} className="border-none bg-muted/30 shadow-none text-center p-3 rounded-2xl">
              <p className="font-bold text-xl text-brand">{stat.val}</p>
              <p className="tct-label text-[9px] mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Account Menu */}
        <div className="space-y-4">
          <span className="tct-label px-1">Settings & Account</span>
          <div className="bg-card rounded-3xl shadow-sm overflow-hidden ring-1 ring-border/50 divide-y divide-border/30">
            {menuItems.map((item, i) => (
              <motion.button 
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/30 active:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`${item.color} p-2.5 rounded-2xl group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground/50 group-hover:text-brand transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full h-14 border-destructive/20 text-destructive hover:bg-destructive/5 rounded-2xl font-bold gap-2">
          <LogOut size={18} />
          Sign Out
        </Button>
        
        <div className="text-center pt-2">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">TheChosenTalks v1.0.42 • Beta</p>
        </div>
      </div>
    </div>
  );
}