'use client';

import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';

interface LevelUpModalProps {
    level: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function LevelUpModal({ level, isOpen, onClose }: LevelUpModalProps) {
    const [playWin] = useSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', { volume: 0.7 });

    useEffect(() => {
        if (isOpen) {
            playWin();
            const duration = 3 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [isOpen, playWin]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl p-8 max-w-sm w-full relative text-center shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                    <X size={20} />
                </button>

                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                    <Trophy size={40} strokeWidth={1.5} />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">NIVEAU {level} !</h2>
                <p className="text-zinc-400 mb-8">
                    Incroyable ! Tu deviens une meilleure version de toi-même.
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                    Continuer
                </button>
            </div>
        </div>
    );
}
