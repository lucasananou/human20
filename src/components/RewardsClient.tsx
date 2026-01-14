'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Trophy, Star, Lock, Zap, Crown, Flame, Dumbbell, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import { buyJoker } from '@/app/actions';
import useSound from 'use-sound';
import confetti from 'canvas-confetti';

interface RewardsClientProps {
    initialUser: any;
    allUsers: any[];
}

const iconMap: any = {
    Flame, Dumbbell, BookOpen, Lock, Trophy, Zap, Crown, Star
};

export default function RewardsClient({ initialUser, allUsers }: RewardsClientProps) {
    const [currentUser, setCurrentUser] = useState(initialUser?.name || 'Lucas');
    const user = allUsers.find(u => u.name === currentUser) || initialUser;

    const [playBuy] = useSound('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3');

    const handleBuyJoker = async () => {
        if (user.currency >= 10) {
            playBuy();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            await buyJoker(currentUser);
        } else {
            alert("Pas assez de points !");
        }
    };

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-300 font-sans">
            <Sidebar currentUser={currentUser} onSwitchUser={setCurrentUser} allUsers={allUsers} />

            <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 mb-20 md:mb-0 max-w-7xl mx-auto w-full">
                <header className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-1">
                        Récompenses
                    </h1>
                    <p className="text-sm text-zinc-400">
                        Gérez vos points et admirez vos trophées.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Store Section */}
                    <div className="glass-card rounded-xl p-8 border border-zinc-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="relative z-10">
                            <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                                <Zap className="text-amber-400" size={20} />
                                Boutique
                            </h2>

                            <div className="bg-zinc-900/50 rounded-lg p-6 flex flex-col items-center text-center border border-zinc-800">
                                <div className="text-4xl font-bold text-amber-400 mb-1">{user?.currency || 0}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Points Disponibles</div>

                                <button
                                    onClick={handleBuyJoker}
                                    disabled={(user?.currency || 0) < 10}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 group"
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">🃏</span>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-sm">Acheter un Joker</span>
                                        <span className="text-[10px] opacity-70">Coût: 10 Points</span>
                                    </div>
                                </button>
                                <p className="text-xs text-zinc-500 mt-4 max-w-xs">
                                    Utilisez un joker pour sauver votre série en cas d'oubli d'une journée.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Trophies Section */}
                    <div className="glass-card rounded-xl p-8 border border-zinc-800">
                        <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                            <Trophy className="text-yellow-500" size={20} />
                            Collection de Trophées
                        </h2>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {user?.stats?.badges?.map((badge: any) => {
                                const Icon = iconMap[badge.icon] || Star;
                                return (
                                    <div
                                        key={badge.id}
                                        className={clsx(
                                            "aspect-square rounded-xl flex flex-col items-center justify-center gap-2 p-2 text-center border transition-all",
                                            badge.earned
                                                ? "bg-zinc-800/50 border-zinc-700 hover:border-amber-500/50 text-amber-400"
                                                : "bg-zinc-900/50 border-zinc-800 text-zinc-700 grayscale opacity-50"
                                        )}
                                    >
                                        <Icon size={24} strokeWidth={1.5} />
                                        <span className="text-[10px] font-medium leading-tight">{badge.label}</span>
                                    </div>
                                )
                            })}
                            {/* Empty Slots Filler */}
                            {[...Array(Math.max(0, 12 - (user?.stats?.badges?.length || 0)))].map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square rounded-xl bg-zinc-900/30 border border-dashed border-zinc-800/50 flex items-center justify-center">
                                    <Lock size={16} className="text-zinc-800" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
