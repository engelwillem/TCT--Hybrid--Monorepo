"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Loader2, Music, Waves, Mic2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// AMBIENCE_LIBRARY: Data Suara & Emosi Lagusion
// (Siap diganti/divalidasi oleh Supervisor)
// ==========================================
export type AudioType = 'Instrumental' | 'Vocal' | 'Piano' | 'Acoustic' | 'Nature';

export interface AmbienceTrack {
    title: string;
    type: AudioType;
    url: string;
}

const DEFAULT_TRACK: AmbienceTrack = { title: "Sanctuary", type: "Instrumental", url: "https://play.lagusion.org/listen/instrumental/radio.mp3" };

export const AMBIENCE_LIBRARY: Record<string, AmbienceTrack[]> = {
    // --- Daily Themes ---
    daily_1: [
        { title: "Awal yang Baru", type: "Instrumental", url: "https://play.lagusion.org/listen/instrumental_courage/radio.mp3" },
        { title: "Langkah Pertama", type: "Acoustic", url: "https://play.lagusion.org/listen/acoustic_morning/radio.mp3" }
    ],
    daily_2: [
        { title: "Terang Perjalanan", type: "Piano", url: "https://play.lagusion.org/listen/piano_guidance/radio.mp3" },
        { title: "Bimbingan-Nya", type: "Vocal", url: "https://play.lagusion.org/listen/vocal_guide/radio.mp3" }
    ],
    daily_3: [
        { title: "Teduh di Tengah Minggu", type: "Instrumental", url: "https://play.lagusion.org/listen/instrumental_midweek/radio.mp3" }
    ],
    daily_4: [
        { title: "Kekuatan Mental", type: "Instrumental", url: "https://play.lagusion.org/listen/instrumental_strength/radio.mp3" }
    ],
    daily_5: [
        { title: "Penyerahan Sepenuhnya", type: "Piano", url: "https://play.lagusion.org/listen/piano_surrender/radio.mp3" }
    ],
    daily_6: [
        { title: "Hymn of Rest", type: "Vocal", url: "https://play.lagusion.org/listen/vocal_rest/radio.mp3" },
        { title: "Quiet Stream", type: "Nature", url: "https://play.lagusion.org/listen/nature_stream/radio.mp3" }
    ],
    daily_0: [
        { title: "Sorak Sukacita", type: "Instrumental", url: "https://play.lagusion.org/listen/joyful_worship/radio.mp3" },
        { title: "Sunday Praise", type: "Vocal", url: "https://play.lagusion.org/listen/vocal_praise/radio.mp3" }
    ],
    
    // --- Emotional Sync ---
    anxious: [
        { title: "Ketenangan-Mu", type: "Instrumental", url: "https://play.lagusion.org/listen/calm_instrumental/radio.mp3" },
        { title: "Hadirat-Mu", type: "Vocal", url: "https://play.lagusion.org/listen/vocal_calm/radio.mp3" },
        { title: "Peaceful Night", type: "Piano", url: "https://play.lagusion.org/listen/piano_sleep/radio.mp3" }
    ],
    weary: [
        { title: "Quiet Stream", type: "Nature", url: "https://play.lagusion.org/listen/ambient_rest/radio.mp3" },
        { title: "Safe Haven", type: "Acoustic", url: "https://play.lagusion.org/listen/warm_acoustic/radio.mp3" },
        { title: "Hymn of Rest", type: "Vocal", url: "https://play.lagusion.org/listen/vocal_hymn/radio.mp3" }
    ],
    grieving: [
        { title: "Deep Reflection", type: "Piano", url: "https://play.lagusion.org/listen/deep_piano_reflection/radio.mp3" },
        { title: "Pelukan Bapa", type: "Instrumental", url: "https://play.lagusion.org/listen/strings_comfort/radio.mp3" }
    ],
    confused: [
        { title: "Jalan Terang", type: "Piano", url: "https://play.lagusion.org/listen/clarity_ambient/radio.mp3" },
        { title: "Clarity", type: "Instrumental", url: "https://play.lagusion.org/listen/orchestra_clear/radio.mp3" }
    ],
    insecure: [
        { title: "Berharga di Mata-Nya", type: "Vocal", url: "https://play.lagusion.org/listen/vocal_worth/radio.mp3" },
        { title: "Warm Embrace", type: "Acoustic", url: "https://play.lagusion.org/listen/warm_acoustic_2/radio.mp3" }
    ],
    angry: [
        { title: "Air Kehidupan", type: "Nature", url: "https://play.lagusion.org/listen/soothing_water_piano/radio.mp3" },
        { title: "Mendingin", type: "Instrumental", url: "https://play.lagusion.org/listen/ambient_cool/radio.mp3" }
    ],
    lonely: [
        { title: "Sahabat Setia", type: "Acoustic", url: "https://play.lagusion.org/listen/comfort_strings/radio.mp3" },
        { title: "Engkau Tidak Sendiri", type: "Vocal", url: "https://play.lagusion.org/listen/vocal_companion/radio.mp3" }
    ],
    guilt: [
        { title: "Grace Abounds", type: "Instrumental", url: "https://play.lagusion.org/listen/grace_cello/radio.mp3" },
        { title: "Dibasuh Putih", type: "Piano", url: "https://play.lagusion.org/listen/piano_grace/radio.mp3" }
    ],
    grateful: [
        { title: "Morning Joy", type: "Acoustic", url: "https://play.lagusion.org/listen/joyful_acoustic/radio.mp3" },
        { title: "Hatiku Penuh", type: "Vocal", url: "https://play.lagusion.org/listen/vocal_thanks/radio.mp3" }
    ],
    hopeful: [
        { title: "Cahaya Fajar", type: "Instrumental", url: "https://play.lagusion.org/listen/inspiring_orchestra/radio.mp3" },
        { title: "A New Day", type: "Piano", url: "https://play.lagusion.org/listen/piano_hope/radio.mp3" }
    ],
    joyful: [
        { title: "Upbeat Praise", type: "Vocal", url: "https://play.lagusion.org/listen/upbeat_vocal/radio.mp3" },
        { title: "Tarian Hati", type: "Instrumental", url: "https://play.lagusion.org/listen/instrumental_joy/radio.mp3" }
    ],
};

const getTypeIcon = (type: AudioType) => {
    switch (type) {
        case 'Vocal': return <Mic2 size={12} />;
        case 'Piano': return <Music size={12} />;
        case 'Acoustic': return <Music size={12} />;
        case 'Nature': return <Waves size={12} />;
        case 'Instrumental':
        default: return <Music size={12} />;
    }
};

interface AmbienceControllerProps {
    className?: string;
    isDucking?: boolean;
    activeMoodKey?: string;
    dayIndex?: number;
    onMenuOpen?: (isOpen: boolean) => void;
}

const WaveformIndicator = () => (
    <div className="flex items-end justify-center gap-[2px] h-3 w-4">
        {[1, 2, 3].map((i) => (
            <motion.div 
                key={i}
                animate={{ height: ['30%', '100%', '30%'] }}
                transition={{ duration: 0.6 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
                className="w-[2px] bg-blue-500 rounded-full"
            />
        ))}
    </div>
);

export default function AmbienceController({ className, isDucking = false, activeMoodKey = 'daily', dayIndex = 0, onMenuOpen }: AmbienceControllerProps) {
    const audioA = useRef<HTMLAudioElement | null>(null);
    const audioB = useRef<HTMLAudioElement | null>(null);
    
    // Core states
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackUnavailable, setPlaybackUnavailable] = useState(false);
    const [baseVolume, setBaseVolume] = useState(0.5);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeEngine, setActiveEngine] = useState<'A' | 'B'>('A');

    // User Session Choices (maps combined keys like 'anxious' -> track URL)
    const [userSelections, setUserSelections] = useState<Record<string, string>>({});

    // Target Logic
    const currentMoodContextKey = activeMoodKey === 'daily' ? `daily_${dayIndex}` : activeMoodKey;
    const recommendations = useMemo(() => AMBIENCE_LIBRARY[currentMoodContextKey] || [DEFAULT_TRACK], [currentMoodContextKey]);
    
    // The currently targeted track for the engine based on user selection or default 1st recommendation
    const targetedTrackUrl = userSelections[currentMoodContextKey] || recommendations[0]?.url || DEFAULT_TRACK.url;
    const targetedTrack = recommendations.find(r => r.url === targetedTrackUrl) || DEFAULT_TRACK;
    const hasPlayableTarget = typeof targetedTrackUrl === 'string' && /^https?:\/\//i.test(targetedTrackUrl);

    // Advanced Ducking (0.4 volume when panel is open, 1.0 multiplier when closed)
    const targetMasterVolume = isDucking ? baseVolume * 0.4 : baseVolume;

    const internalVolumes = useRef({ A: 0, B: 0 });
    const fadeAnimationRef = useRef<number | null>(null);
    const engineUrlTargetRef = useRef<string>(targetedTrackUrl);

    // Sync state to engine targets
    useEffect(() => {
        if (targetedTrackUrl !== engineUrlTargetRef.current) {
            engineUrlTargetRef.current = targetedTrackUrl;
            setPlaybackUnavailable(false);
            
            // Cross-Fade Trigger
            if (isPlaying && hasPlayableTarget) {
                const nextEngine = activeEngine === 'A' ? 'B' : 'A';
                const nextAudio = nextEngine === 'A' ? audioA.current : audioB.current;
                
                if (nextAudio) {
                    setIsLoading(true);
                    nextAudio.src = targetedTrackUrl;
                    nextAudio.play()
                        .then(() => setActiveEngine(nextEngine))
                        .catch(e => {
                            console.warn('Crossfade auto-play blocked:', e);
                            setPlaybackUnavailable(true);
                            setIsPlaying(false);
                            setIsLoading(false);
                        });
                }
            }
        }
    }, [targetedTrackUrl, activeEngine, hasPlayableTarget, isPlaying]);

    // Initializer
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const createEngine = () => {
                const audio = new Audio();
                audio.crossOrigin = "anonymous";
                audio.loop = true;
                audio.volume = 0;
                return audio;
            };

            audioA.current = createEngine();
            audioB.current = createEngine();

            const handleWait = () => setIsLoading(true);
            const handlePlay = () => setIsLoading(false);
            const handleError = () => {
                setPlaybackUnavailable(true);
                setIsPlaying(false);
                setIsLoading(false);
            };

            [audioA.current, audioB.current].forEach(a => {
                a.addEventListener('waiting', handleWait);
                a.addEventListener('playing', handlePlay);
                a.addEventListener('error', handleError);
            });
            
            engineUrlTargetRef.current = targetedTrackUrl;
            if (hasPlayableTarget) {
                audioA.current.src = targetedTrackUrl;
            }

            return () => {
                [audioA.current, audioB.current].forEach(a => {
                    if (a) {
                        a.pause();
                        a.removeEventListener('waiting', handleWait);
                        a.removeEventListener('playing', handlePlay);
                        a.removeEventListener('error', handleError);
                        a.src = "";
                    }
                });
            };
        }
    }, [hasPlayableTarget, targetedTrackUrl]);

    // RequestAnimationFrame Volume & Crossfade Loop
    useEffect(() => {
        if (!audioA.current || !audioB.current) return;

        let active = true;
        
        const animateVolume = () => {
            if (!active) return;
            
            // Ducking duration 1.5s = 90 frames @ 60fps
            const duckingStepRate = baseVolume / 90;
            // Crossfade duration 3.0s = 180 frames @ 60fps
            const crossfadeStepRate = baseVolume / 180;

            const targetVolA = activeEngine === 'A' && isPlaying ? targetMasterVolume : 0;
            const targetVolB = activeEngine === 'B' && isPlaying ? targetMasterVolume : 0;

            const processVolume = (currVol: number, targetVol: number, engineKey: 'A'|'B') => {
                const isTargetEngine = activeEngine === engineKey;
                const step = isTargetEngine ? duckingStepRate : crossfadeStepRate;
                
                if (currVol < targetVol) return Math.min(targetVol, currVol + step);
                if (currVol > targetVol) return Math.max(targetVol, currVol - step);
                return currVol;
            };

            internalVolumes.current.A = processVolume(internalVolumes.current.A, targetVolA, 'A');
            internalVolumes.current.B = processVolume(internalVolumes.current.B, targetVolB, 'B');

            if (audioA.current) audioA.current.volume = internalVolumes.current.A;
            if (audioB.current) audioB.current.volume = internalVolumes.current.B;

            // Stop paused tracks to free resources once volume hits 0
            if (audioA.current && internalVolumes.current.A === 0 && activeEngine === 'B' && !audioA.current.paused) audioA.current.pause();
            if (audioB.current && internalVolumes.current.B === 0 && activeEngine === 'A' && !audioB.current.paused) audioB.current.pause();

            fadeAnimationRef.current = requestAnimationFrame(animateVolume);
        };

        fadeAnimationRef.current = requestAnimationFrame(animateVolume);

        return () => {
            active = false;
            if (fadeAnimationRef.current) cancelAnimationFrame(fadeAnimationRef.current);
        };
    }, [baseVolume, targetMasterVolume, activeEngine, isPlaying]);

    const togglePlay = () => {
        if (!audioA.current || !audioB.current) return;
        if (!hasPlayableTarget) {
            setPlaybackUnavailable(true);
            setIsPlaying(false);
            setIsLoading(false);
            return;
        }
        
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            const activeAudio = activeEngine === 'A' ? audioA.current : audioB.current;
            if (!activeAudio) return;
            
            if (!activeAudio.src.includes(engineUrlTargetRef.current)) {
                activeAudio.src = engineUrlTargetRef.current;
            }
            setIsLoading(true);
            setPlaybackUnavailable(false);
            activeAudio.play().then(() => {
                setIsPlaying(true);
            }).catch(e => {
                console.warn("Audio playback unavailable", e);
                setPlaybackUnavailable(true);
                setIsPlaying(false);
                setIsLoading(false);
            });
        }
    };

    const handleMenuToggle = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (onMenuOpen) onMenuOpen(newState);
    };

    const handleTrackSelect = (url: string) => {
        setUserSelections(prev => ({
            ...prev,
            [currentMoodContextKey]: url
        }));
        setPlaybackUnavailable(false);
        
        // Auto play when user selects a track manually if not already playing
        if (!isPlaying && audioA.current && audioB.current && /^https?:\/\//i.test(url)) {
            const activeAudio = activeEngine === 'A' ? audioA.current : audioB.current;
            activeAudio.src = url;
            setIsLoading(true);
            activeAudio.play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                    setPlaybackUnavailable(true);
                    setIsLoading(false);
                });
        }
    };

    return (
        <div className={cn("fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3", className)}>
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleMenuToggle}
                            className="fixed inset-0 z-[105] cursor-default"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{ transformOrigin: 'bottom right' }}
                            className="fixed bottom-[100px] left-4 right-4 md:left-auto md:right-8 z-[110] w-[calc(100vw-32px)] max-w-[360px] md:w-80 mx-auto bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.9),_0_0_2px_rgba(255,255,255,0.1)] rounded-[32px] p-6 text-slate-200"
                        >
                            {/* Header & Marquee */}
                        <div className="flex items-center gap-3 w-full mb-5 pb-4 border-b border-slate-900/5">
                            <button 
                                onClick={togglePlay}
                                disabled={!hasPlayableTarget}
                                className={cn(
                                    "flex-none h-10 w-10 rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-50",
                                    isPlaying ? "bg-slate-900 text-white shadow-xl" : "bg-white text-slate-500 shadow-sm hover:scale-105"
                                )}
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : isPlaying ? <Pause size={16}/> : <Play size={16} className="ml-1"/>}
                            </button>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    Now Playing
                                </p>
                                {/* Spotify-style Marquee for long text */}
                                <div className="relative w-full overflow-hidden whitespace-nowrap mask-image-fade text-[13px] font-bold text-slate-200">
                                    <div className={cn("inline-block", targetedTrack.title.length > 20 && "animate-marquee")}>
                                        {targetedTrack.title} &nbsp; • &nbsp; {targetedTrack.title}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {playbackUnavailable && (
                            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                                <p className="text-[11px] font-semibold text-slate-300">
                                    Sumber ambience tidak tersedia di perangkat ini saat ini.
                                </p>
                            </div>
                        )}

                        {/* Smart Recommendations */}
                        <div className="space-y-2 mb-6">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                                Rekomendasi Atmosfer
                            </p>
                            <div className="space-y-1.5 overflow-y-auto max-h-[160px] scrollbar-hide">
                                {recommendations.map((track, idx) => {
                                    const isSelected = targetedTrackUrl === track.url;
                                    return (
                                        <button 
                                            key={idx}
                                            onClick={() => handleTrackSelect(track.url)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left group",
                                                isSelected ? "bg-white/10 ring-1 ring-white/5" : "hover:bg-white/5"
                                            )}
                                        >
                                            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-slate-400 text-sm border border-white/5 shadow-inner">
                                                {getTypeIcon(track.type)}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className={cn("text-[12px] font-bold truncate transition-colors", isSelected ? "text-white" : "text-slate-300 group-hover:text-slate-100")}>{track.title}</p>
                                                <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-0.5">{track.type}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Volume Control */}
                        <div className="space-y-3 px-2">
                            <div className="flex justify-between items-center text-slate-400">
                                <VolumeX size={14} />
                                <Volume2 size={14} />
                            </div>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.01" 
                                value={baseVolume}
                                onChange={(e) => setBaseVolume(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-white rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg cursor-pointer"
                            />
                            <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest mt-2 h-3 transition-opacity">
                                {isDucking ? "Focus Mode: Ducking Active" : " "}
                            </p>
                        </div>
                    </motion.div>
                    </>
                )}
            </AnimatePresence>

            <button 
                onClick={handleMenuToggle}
                className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl shadow-black/50 active:scale-90",
                    isMenuOpen ? "bg-white text-black" : "bg-[#111111]/80 backdrop-blur-2xl text-slate-300 border border-white/10 hover:bg-white/10",
                    isPlaying && !isMenuOpen && !isLoading ? "ring-2 ring-white/20" : ""
                )}
            >
                {isLoading ? (
                    <motion.div animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </motion.div>
                ) : isPlaying && !isMenuOpen ? (
                    <WaveformIndicator />
                ) : (
                    <Volume2 className={cn("h-6 w-6")} />
                )}
            </button>
        </div>
    );
}

// Global CSS animation for Marquee
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 10s linear infinite;
        }
        .mask-image-fade {
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
    `;
    document.head.appendChild(style);
}
