'use client';

import { useRouter } from 'next/navigation';
import { User, ArrowRight } from 'lucide-react';

export default function UserSelection({ users }: { users: any[] }) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
            <div className="mb-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-2xl tracking-tighter shadow-lg shadow-indigo-500/20">
                    H2
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Human 2.0</h1>
                <p className="text-zinc-400">Qui s'entraîne aujourd'hui ?</p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                {users.map((user) => (
                    <button
                        key={user.name}
                        onClick={() => router.push(`/?user=${user.name}`)}
                        className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-4 rounded-xl flex items-center justify-between transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                                <User size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-white font-medium">{user.name}</div>
                                <div className="text-xs text-zinc-500">Niveau {user.level || 1}</div>
                            </div>
                        </div>
                        <ArrowRight size={20} className="text-zinc-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />

                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 pointer-events-none" />
                    </button>
                ))}
            </div>

            <p className="mt-12 text-xs text-zinc-600 uppercase tracking-widest">Sélectionnez votre profil</p>
        </div>
    );
}
