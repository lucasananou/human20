'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LevelUpModal from '@/components/LevelUpModal';
import HabitCard from '@/components/HabitCard';
import { Dumbbell, Carrot, Book, Briefcase, BrainCircuit, Calendar, Flame, Lock, BookOpen, Unlock, Star, Medal } from 'lucide-react';
import clsx from 'clsx';
import { toggleHabit, buyJoker, useJoker } from '@/app/actions';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';

// Configuration Data
const habitsData = [
    { id: 'sport', label: 'Séance de Sport', icon: Dumbbell, color: 'text-indigo-400', desc: 'Musculation ou Cardio 45min' },
    { id: 'nutrition', label: 'Nutrition Saine', icon: Carrot, color: 'text-emerald-400', desc: 'Pas de sucre raffiné, 2L d\'eau' },
    { id: 'reading', label: 'Lecture', icon: Book, color: 'text-amber-400', desc: 'Minimum 20 pages' },
    { id: 'work', label: 'Deep Work', icon: Briefcase, color: 'text-blue-400', desc: '4h de travail sans distraction' },
    { id: 'meditation', label: 'Méditation', icon: BrainCircuit, color: 'text-violet-400', desc: '10 minutes de calme' }
];

interface DashboardClientProps {
    initialUser: any;
    allUsers: any[];
}

// Icon Mapping
const iconMap: any = {
    Flame, Dumbbell, BookOpen, Lock, Unlock, Star, Medal
};

export default function DashboardClient({ initialUser, allUsers }: DashboardClientProps) {
    const [currentUser, setCurrentUser] = useState(initialUser?.name || 'Lucas');

    // Find full user object from props based on selection
    const user = allUsers.find(u => u.name === currentUser) || initialUser;

    // Level Up Logic
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [prevLevel, setPrevLevel] = useState(user?.level || 1);

    useEffect(() => {
        if (user?.level > prevLevel) {
            setShowLevelModal(true);
            setPrevLevel(user.level);
        }
    }, [user?.level, prevLevel]);

    // Get today's log - Robust Comparison
    const today = new Date().toISOString().split('T')[0];
    const todaysLog = user?.logs?.find((l: any) => {
        const logDate = new Date(l.date).toISOString().split('T')[0];
        return logDate === today;
    }) || null;

    const [localCompleted, setLocalCompleted] = useState<string[]>([]);

    useEffect(() => {
        // Sync local state with DB data when user/log changes
        const completed = [];
        if (todaysLog?.sport) completed.push('sport');
        if (todaysLog?.nutrition) completed.push('nutrition');
        if (todaysLog?.reading) completed.push('reading');
        if (todaysLog?.work) completed.push('work');
        if (todaysLog?.meditation) completed.push('meditation');
        setLocalCompleted(completed);
    }, [todaysLog]);

    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
        setCurrentDate(new Date().toLocaleDateString('fr-FR', options));
    }, []);

    // Sounds
    const [playCheck] = useSound('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3', { volume: 0.5 });
    const [playSuccess] = useSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', { volume: 0.5 });
    const [playFireworks] = useSound('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', { volume: 0.6 });

    const triggerOneHundredPercentConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleToggle = async (habitId: string) => {
        // Optimistic Update
        const wasCompleted = localCompleted.includes(habitId);

        let newCompleted = wasCompleted
            ? localCompleted.filter(id => id !== habitId)
            : [...localCompleted, habitId];

        setLocalCompleted(newCompleted);

        // Celebration Check (If adding made it 100%)
        if (!wasCompleted && newCompleted.length === habitsData.length) {
            playFireworks();
            triggerOneHundredPercentConfetti();
        } else if (!wasCompleted) {
            playCheck();
        }

        try {
            await toggleHabit(currentUser, habitId, today);
        } catch (e) {
            console.error("Failed to toggle", e);
            // Revert on error
            setLocalCompleted(localCompleted);
        }
    };

    const completedCount = localCompleted.length;
    const totalCount = habitsData.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const getMotivationText = (pct: number) => {
        if (pct === 0) return "La journée commence, on attaque !";
        if (pct < 50) return "Bon début, continue sur cette lancée.";
        if (pct < 100) return "Presque là ! Encore un petit effort.";
        return "Incroyable ! Grosse victoire aujoud'hui 🔥";
    };

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-300 font-sans">
            <LevelUpModal
                level={user?.level || 1}
                isOpen={showLevelModal}
                onClose={() => setShowLevelModal(false)}
            />
            <Sidebar currentUser={currentUser} onSwitchUser={setCurrentUser} allUsers={allUsers} />

            <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 mb-20 md:mb-0 max-w-7xl mx-auto w-full">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-1">
                            Bonjour, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">{currentUser}</span>
                        </h1>
                        <p className="text-sm text-zinc-400 flex items-center gap-2">
                            <Calendar size={14} />
                            <span className="capitalize">{currentDate}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {/* Currency & Jokers */}
                            <div className="glass-card px-3 py-2 rounded-full flex items-center gap-3 mr-2">
                                <div className="flex items-center gap-1 text-amber-400">
                                    <span className="text-xs font-bold">{user?.currency || 0}</span>
                                    <span className="text-[10px] uppercase font-medium text-amber-500/80">Pts</span>
                                </div>
                                <div className="w-px h-3 bg-zinc-700"></div>
                                <button
                                    onClick={async () => {
                                        if ((user?.currency || 0) >= 10) {
                                            await buyJoker(currentUser);
                                        } else {
                                            alert("Pas assez de points ! Il faut 10 points.");
                                        }
                                    }}
                                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                                    title="Acheter un Joker (10 Pts)"
                                >
                                    <span className="text-xs font-bold">{user?.jokers || 0}</span>
                                    <span className="text-lg leading-none">🃏</span>
                                </button>
                            </div>

                            <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-medium text-zinc-300">Niveau <span className="text-white">{user?.level || 1}</span></span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Daily Habits */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Progress Card */}
                        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/20"></div>

                            <div className="relative z-10 flex justify-between items-end mb-4">
                                <div>
                                    <h2 className="text-lg font-medium text-white tracking-tight">Score du Jour</h2>
                                    <p className={clsx("text-sm mt-1 transition-colors", percentage === 100 ? "text-emerald-400 font-semibold" : "text-zinc-400")}>
                                        {getMotivationText(percentage)}
                                    </p>
                                </div>
                                <div className="text-3xl font-semibold text-white tracking-tighter">{percentage}%</div>
                            </div>

                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={clsx("h-full transition-all duration-700 ease-out", percentage === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-violet-500")}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Habits List */}
                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-4">Objectifs Quotidiens</h3>
                            <div className="space-y-3">
                                {habitsData.map(habit => (
                                    <HabitCard
                                        key={habit.id}
                                        {...habit}
                                        checked={localCompleted.includes(habit.id)}
                                        onToggle={() => handleToggle(habit.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats & Badges */}
                    <div className="space-y-6">

                        {/* Weekly Chart */}
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-medium text-white">Activité Semaine</h3>
                                <span className="text-xs text-zinc-500">Série: {user?.stats?.currentStreak || 0}j</span>
                            </div>

                            <div className="flex items-end justify-between h-32 gap-2">
                                {(user?.stats?.weeklyStats || []).map((bar: any, i: number) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                                        <div className={clsx(
                                            "w-full rounded-t-sm transition-all relative overflow-hidden",
                                            bar.h === '0%' ? "bg-zinc-800 h-1" : "bg-gradient-to-t from-purple-900 to-purple-500 hover:to-purple-400 opacity-80 group-hover:opacity-100"
                                        )}
                                            style={{ height: bar.h === '0%' ? '4px' : bar.h }}
                                        >
                                            {/* Fill effect */}
                                            {bar.h !== '0%' && (
                                                <div className="absolute bottom-0 left-0 w-full h-full bg-purple-500/20 blur-sm"></div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-zinc-500 uppercase">{bar.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Badges / Rewards */}
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-sm font-medium text-white mb-4">Trophées</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {user?.stats?.badges?.map((badge: any) => {
                                    const Icon = iconMap[badge.icon] || Star;
                                    return (
                                        <div
                                            key={badge.id}
                                            className={clsx(
                                                "aspect-square rounded-lg flex items-center justify-center group relative cursor-help transition-all duration-300",
                                                badge.earned
                                                    ? "bg-zinc-800/50 border border-zinc-700 hover:border-amber-500/50 text-amber-400"
                                                    : "bg-zinc-900 border border-dashed border-zinc-800 text-zinc-700 grayscale"
                                            )}
                                        >
                                            <Icon size={badge.id === 'master' ? 16 : 20} />

                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] bg-zinc-900 border border-zinc-700 px-2 py-1 rounded whitespace-nowrap transition-opacity z-50 pointer-events-none">
                                                {badge.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                <p className="text-xs text-zinc-500">Prochaine récompense: <span className="text-zinc-300">Niveau {(user?.level || 1) + 1}</span></p>
                                <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-zinc-600 w-[70%]"></div>
                                </div>
                            </div>
                        </div>


                        {/* Joker Usage Section */}
                        <div className="glass-card rounded-xl p-6 border border-purple-900/30">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h3 className="text-sm font-medium text-white flex items-center gap-2 whitespace-nowrap">
                                    <span className="text-lg">🃏</span> Utiliser un Joker
                                </h3>
                                <span className="text-xs text-zinc-500 whitespace-nowrap text-right">{user?.jokers || 0} disponible(s)</span>
                            </div>

                            <div className="space-y-2">
                                {habitsData.filter(h => !localCompleted.includes(h.id)).length === 0 ? (
                                    <p className="text-xs text-zinc-500 italic">Tout est complété aujourd'hui !</p>
                                ) : (
                                    habitsData.filter(h => !localCompleted.includes(h.id)).map(habit => (
                                        <button
                                            key={habit.id}
                                            disabled={(user?.jokers || 0) < 1}
                                            onClick={async () => {
                                                if ((user?.jokers || 0) > 0) {
                                                    // Optimistic update
                                                    setLocalCompleted([...localCompleted, habit.id]);
                                                    await useJoker(currentUser, habit.id, today);
                                                    playCheck(); // Feedback sound
                                                }
                                            }}
                                            className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 transition-colors border border-dashed border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <span className="text-xs text-zinc-400 group-hover:text-zinc-300">{habit.label}</span>
                                            <span className="text-[10px] text-purple-400 border border-purple-900/50 px-1.5 py-0.5 rounded">Utiliser</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}
