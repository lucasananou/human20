import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BarChart2, Trophy } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
    currentUser: string;
    onSwitchUser: (user: string) => void;
}

// Simplified dynamic switcher
export default function Sidebar({ currentUser, allUsers = [] }: SidebarProps & { allUsers?: any[] }) {
    const pathname = usePathname();
    const router = useRouter();

    // Default users if allUsers is empty (should not happen usually)
    const users = allUsers.length > 0 ? allUsers : [{ name: 'Lucas' }, { name: 'Nicolas' }];

    return (
        <>
            <nav className="md:hidden fixed bottom-0 w-full glass-card border-t border-zinc-800 z-50 flex justify-around py-4 px-2">
                <Link href={`/?user=${currentUser}`} className={clsx("flex flex-col items-center gap-1 transition-colors", pathname === '/' ? "text-white" : "text-zinc-400 hover:text-white")}>
                    <LayoutDashboard size={20} strokeWidth={1.5} />
                    <span className="text-[10px] font-medium">Journal</span>
                </Link>
                <Link href={`/analytique?user=${currentUser}`} className={clsx("flex flex-col items-center gap-1 transition-colors", pathname === '/analytique' ? "text-white" : "text-zinc-400 hover:text-white")}>
                    <BarChart2 size={20} strokeWidth={1.5} />
                    <span className="text-[10px] font-medium">Stats</span>
                </Link>
                <Link href={`/recompenses?user=${currentUser}`} className={clsx("flex flex-col items-center gap-1 transition-colors", pathname === '/recompenses' ? "text-white" : "text-zinc-400 hover:text-white")}>
                    <Trophy size={20} strokeWidth={1.5} />
                    <span className="text-[10px] font-medium">Trophées</span>
                </Link>
            </nav>

            <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-950/50 p-6 fixed h-full z-40">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm tracking-tighter">H2</div>
                    <span className="text-base font-semibold tracking-tight text-white">Human 2.0</span>
                </div>

                <div className="space-y-1">
                    <Link href={`/?user=${currentUser}`} className={clsx("w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all", pathname === '/' ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50")}>
                        <LayoutDashboard size={18} strokeWidth={1.5} />
                        Tableau de bord
                    </Link>
                    <Link href={`/analytique?user=${currentUser}`} className={clsx("w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all", pathname === '/analytique' ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50")}>
                        <BarChart2 size={18} strokeWidth={1.5} />
                        Analytique
                    </Link>
                    <Link href={`/recompenses?user=${currentUser}`} className={clsx("w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all", pathname === '/recompenses' ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50")}>
                        <Trophy size={18} strokeWidth={1.5} />
                        Récompenses
                    </Link>
                </div>

                <div className="mt-auto pt-6 border-t border-zinc-800">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Comptes</p>
                    <div className="flex flex-col gap-1">
                        {users.map((u: any) => (
                            <button
                                key={u.name}
                                onClick={() => router.push(`${pathname}?user=${u.name}`)}
                                className={clsx(
                                    "w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-between",
                                    currentUser === u.name
                                        ? "bg-zinc-800 text-white border border-zinc-700"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                                )}
                            >
                                {u.name}
                                {currentUser === u.name && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
}
