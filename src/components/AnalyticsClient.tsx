'use client';

import { useState } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import Sidebar from '@/components/Sidebar';
import clsx from 'clsx';
import { getMonthlyStats } from '@/app/actions';

interface AnalyticsClientProps {
    initialUser: string;
    initialData: any;
    allUsers: any[];
}

export default function AnalyticsClient({ initialUser, initialData, allUsers }: AnalyticsClientProps) {
    const [currentUser, setCurrentUser] = useState(initialUser);
    const [data, setData] = useState(initialData);

    // Multi-Duel Mode State
    // Map of userName -> their stats data
    const [opponentsData, setOpponentsData] = useState<Record<string, any>>({});
    const [selectedOpponents, setSelectedOpponents] = useState<string[]>([]);

    // Available opponents (everyone except current user)
    const availableOpponents = allUsers.filter(u => u.name !== currentUser);

    const handleSwitchUser = async (user: string) => {
        setCurrentUser(user);
        const stats = await getMonthlyStats(user);
        setData(stats);

        // Reset duel selection when switching main user
        setSelectedOpponents([]);
        setOpponentsData({});
    };

    const toggleOpponent = async (opponentName: string) => {
        if (selectedOpponents.includes(opponentName)) {
            // Remove
            setSelectedOpponents(prev => prev.filter(name => name !== opponentName));
        } else {
            // Add
            // Check if we already fetched data
            if (!opponentsData[opponentName]) {
                const stats = await getMonthlyStats(opponentName);
                setOpponentsData(prev => ({ ...prev, [opponentName]: stats }));
            }
            setSelectedOpponents(prev => [...prev, opponentName]);
        }
    };

    if (!data) return <div className="p-10 text-white">Chargement...</div>;

    // Colors Palette
    const colors: Record<string, string> = {
        [currentUser]: '#10b981', // Emerald (Green)
        'Nicolas': '#ef4444', // Red
        'Louis': '#3b82f6', // Blue
        'Lucas': '#6366f1', // Indigo (Purple-ish)
        // Fallbacks
        'default': '#f59e0b' // Amber
    };

    const getColor = (name: string) => colors[name] || colors['default'];

    // Merge data for Radar Chart
    const radarChartData = data.radarData.map((d: any, i: number) => {
        const merged: any = { ...d };
        selectedOpponents.forEach(opponent => {
            if (opponentsData[opponent]) {
                merged[opponent] = opponentsData[opponent].radarData[i]?.A;
            }
        });
        return merged;
    });

    // Merge data for Line Chart
    const lineChartData = data.lineData.map((d: any, i: number) => {
        const merged: any = { ...d };
        selectedOpponents.forEach(opponent => {
            if (opponentsData[opponent]) {
                merged[opponent] = opponentsData[opponent].lineData[i]?.score;
            }
        });
        return merged;
    });

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-300 font-sans">
            <Sidebar currentUser={currentUser} onSwitchUser={handleSwitchUser} allUsers={allUsers} />

            <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 mb-20 md:mb-0 max-w-7xl mx-auto w-full">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-1">
                            Analytique
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Analyse détaillée pour <span className="font-medium" style={{ color: getColor(currentUser) }}>{currentUser}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        <span className="text-xs text-zinc-500 uppercase tracking-widest mr-2 whitespace-nowrap">Comparer :</span>
                        {availableOpponents.map(opp => (
                            <button
                                key={opp.name}
                                onClick={() => toggleOpponent(opp.name)}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium whitespace-nowrap",
                                    selectedOpponents.includes(opp.name)
                                        ? "bg-zinc-800 text-white border-zinc-600"
                                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                                )}
                                style={selectedOpponents.includes(opp.name) ? { borderColor: getColor(opp.name), color: getColor(opp.name) } : {}}
                            >
                                <span className={selectedOpponents.includes(opp.name) ? "" : "grayscale opacity-50"}>⚔️</span>
                                {opp.name}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Radar Chart: Balance */}
                    <div className="glass-card rounded-xl p-6 flex flex-col items-center">
                        <h3 className="text-lg font-medium text-white mb-6 w-full text-left">
                            Équilibre
                        </h3>
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                                    <PolarGrid stroke="#3f3f46" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />

                                    {/* Main User */}
                                    <Radar
                                        name={currentUser}
                                        dataKey="A"
                                        stroke={getColor(currentUser)}
                                        strokeWidth={3}
                                        fill={getColor(currentUser)}
                                        fillOpacity={0.1}
                                    />

                                    {/* Opponents */}
                                    {selectedOpponents.map(opp => (
                                        <Radar
                                            key={opp}
                                            name={opp}
                                            dataKey={opp}
                                            stroke={getColor(opp)}
                                            strokeWidth={2}
                                            fill={getColor(opp)}
                                            fillOpacity={0.1}
                                        />
                                    ))}

                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Line Chart: Consistency */}
                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-6">
                            Cohérence
                        </h3>
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#52525b"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        stroke="#52525b"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 100]}
                                        hide
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                    />

                                    {/* Main User */}
                                    <Line
                                        type="monotone"
                                        name={currentUser}
                                        dataKey="score"
                                        stroke={getColor(currentUser)}
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 5, fill: '#fff' }}
                                    />

                                    {/* Opponents */}
                                    {selectedOpponents.map(opp => (
                                        <Line
                                            key={opp}
                                            type="monotone"
                                            name={opp}
                                            dataKey={opp}
                                            stroke={getColor(opp)}
                                            strokeWidth={2}
                                            dot={false}
                                            strokeDasharray="4 4"
                                            activeDot={{ r: 4, fill: '#fff' }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Summary Stats Grid */}
                    <div className="lg:col-span-2 glass-card rounded-xl p-6">
                        <h3 className="text-sm font-medium text-white mb-4">Résumé Comparatif</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Main User Stat */}
                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800" style={{ borderColor: `${getColor(currentUser)}30` }}>
                                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(currentUser) }}></div>
                                    Moyenne {currentUser}
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {Math.round(data.lineData.reduce((acc: any, curr: any) => acc + curr.score, 0) / 30)}%
                                </div>
                            </div>

                            {/* Opponents stats */}
                            {selectedOpponents.map(opp => {
                                const oppData = opponentsData[opp];
                                if (!oppData) return null;
                                return (
                                    <div key={opp} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800" style={{ borderColor: `${getColor(opp)}30` }}>
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(opp) }}></div>
                                            Moyenne {opp}
                                        </div>
                                        <div className="text-2xl font-bold text-zinc-300">
                                            {Math.round(oppData.lineData.reduce((acc: any, curr: any) => acc + curr.score, 0) / 30)}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
