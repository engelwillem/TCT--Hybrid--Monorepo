"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostComposer from '@/components/community/PostComposer';
import VerseHubFeaturedCard from '@/components/versehub/VerseHubFeaturedCard';
import MemberPostCard from '@/components/community/MemberPostCard';

const MOCK_FEATURED_VERSE = {
  ref: 'jhn-3-16',
  href: '/versehub/id/jhn-3-16',
  reference: 'Yohanes 3:16',
  text: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.'
};

const MOCK_POSTS = [
  {
    id: 1,
    authorName: 'Admin Chosen',
    isOfficial: true,
    type: 'editorial',
    text: 'Selamat datang di komunitas TheChosenTalks! Mari bersama-sama bertumbuh dalam iman dan kasih Tuhan setiap hari.',
    commentsCount: 12,
    bookmarked: false,
    bookmarkLabel: '34',
    prayLabel: '124',
    prayed: false,
  },
  {
    id: 2,
    authorName: 'The Shepherd',
    type: 'quote',
    text: 'Domba-domba-Ku mendengarkan suara-Ku dan Aku mengenal mereka dan mereka mengikut Aku.',
    commentsCount: 5,
    bookmarked: true,
    bookmarkLabel: '89',
    prayLabel: '450',
    prayed: true,
  }
];

export default function CommunityPage() {
  const [posts] = useState(MOCK_POSTS);

  return (
    <div className="space-y-8">
      {/* Top Featured Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VerseHubFeaturedCard verse={MOCK_FEATURED_VERSE} />
      </motion.div>

      {/* Composer */}
      <div className="relative">
        <div className="absolute -inset-4 rounded-[48px] bg-gradient-to-b from-brand/5 to-transparent opacity-50 blur-xl" />
        <PostComposer className="relative z-10" />
      </div>

      {/* Feed Sections (Today/Recent) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terbaru di Komunitas</h3>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 mx-4" />
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <MemberPostCard
                  {...post}
                  onPray={() => { }}
                  onOpenComments={() => { }}
                  onShare={() => { }}
                  onBookmark={() => { }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* End of Feed Footer */}
      <div className="py-12 flex flex-col items-center gap-4 opacity-30">
        <div className="h-12 w-px bg-gradient-to-b from-brand to-transparent" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Akhir dari Kabar Hari Ini</p>
      </div>
    </div>
  );
}
