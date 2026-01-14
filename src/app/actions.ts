'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUser(name: string) {
    return await prisma.user.findUnique({
        where: { name },
        include: {
            logs: {
                orderBy: { date: 'desc' },
                take: 365 // Need more history for stats
            }
        }
    });
}

// Stats & Badge Calculation Logic
export async function getUserWithStats(userName: string) {
    const user = await getUser(userName);
    if (!user) return null;

    const logs = user.logs;

    // 1. Calculate Streak (Consecutive days with at least 1 habit completed)
    // Or stricter: Consecutive days with ALL habits? Let's go with "At least 1" for now to be forgiving, 
    // OR "All 5" for "On Fire" specifically.

    // For general streak (showing up daily):
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // We check backwards from yesterday (or today if already completed something)
    // Simply iterating logs since they are ordered desc
    let lastDate = today;

    // Helper to check if a log has activity
    const hasActivity = (log: any) => log.sport || log.nutrition || log.reading || log.work || log.meditation;
    const isPerfect = (log: any) => log.sport && log.nutrition && log.reading && log.work && log.meditation;

    for (const log of logs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);

        const diffDays = (lastDate.getTime() - logDate.getTime()) / (1000 * 3600 * 24);

        if (diffDays <= 1) { // Consecutive (0 = today, 1 = yesterday)
            if (hasActivity(log)) {
                if (diffDays === 1 || (diffDays === 0)) { // Don't double count if multiple entries same day?? (Unlikely with Unique constraint)
                    // If it's today and empty, streak doesn't break but doesn't increment? 
                    // Actually simplest streak logic:
                }
            }
        }
    }

    // Simplified Streak Calculation for "On Fire" (Perfect Days Streak)
    let perfectStreak = 0;
    for (const log of logs) {
        if (isPerfect(log)) {
            perfectStreak++;
        } else {
            // If it's today and not perfect yet, we don't break streak from yesterday
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            if (logDate.getTime() === today.getTime()) continue;

            break;
        }
    }

    // Totals
    // Totals
    const totals = {
        sport: logs.filter((l: any) => l.sport).length,
        nutrition: logs.filter((l: any) => l.nutrition).length,
        reading: logs.filter((l: any) => l.reading).length,
        work: logs.filter((l: any) => l.work).length,
        meditation: logs.filter((l: any) => l.meditation).length,
        perfectDays: logs.filter((l: any) => isPerfect(l)).length
    };

    // Badges
    const labels: any = {
        fire: 'On Fire (7j)',
        athlete: 'Athlète (10x)',
        erudit: 'Erudit (30x)',
        master: 'Maitre (Lvl 20)'
    };

    const badges = [
        { id: 'fire', earned: perfectStreak >= 7, icon: 'Flame', label: labels.fire },
        { id: 'athlete', earned: totals.sport >= 10, icon: 'Dumbbell', label: labels.athlete },
        { id: 'erudit', earned: totals.reading >= 30, icon: 'BookOpen', label: labels.erudit },
        { id: 'master', earned: user.level >= 20, icon: 'Lock', label: labels.master },
    ];

    // Determine Level based on total XP (1 task = 1 XP)
    // We use the 'currency' field as a proxy for XP if we don't have separate XP
    // Or we stick to the calculated Total based on logs (more robust against spending)
    const totalXP = totals.sport + totals.nutrition + totals.reading + totals.work + totals.meditation;

    // Level formula: Level 1 = 0-9 XP, Level 2 = 10-19 XP, etc.
    const calculatedLevel = Math.floor(totalXP / 10) + 1;

    // Update level if needed (async side effect)
    if (calculatedLevel !== user.level) {
        // Only update if calculated level is higher (prevent dowleveling if we change formula?)
        // actually for now let's keep it straight
        if (calculatedLevel > user.level) {
            await prisma.user.update({
                where: { id: user.id },
                data: { level: calculatedLevel }
            });
            user.level = calculatedLevel;
        }
    }

    // Weekly Stats for Dashboard (Last 7 days)
    const weeklyStats = [];
    const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const now = new Date();

    // Iterate from 6 days ago to today (7 days total)
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const dayLetter = days[d.getDay()];

        const dayLog = logs.find((l: any) => {
            const ld = new Date(l.date);
            ld.setHours(0, 0, 0, 0);
            return ld.getTime() === d.getTime();
        });

        let completion = 0;
        if (dayLog) {
            let count = 0;
            if (dayLog.sport) count++;
            if (dayLog.nutrition) count++;
            if (dayLog.reading) count++;
            if (dayLog.work) count++;
            if (dayLog.meditation) count++;
            completion = (count / 5) * 100;
        }

        weeklyStats.push({ day: dayLetter, h: `${Math.round(completion)}%` });
    }

    return {
        ...user,
        stats: {
            currentStreak: perfectStreak, // Using perfect streak for the "Fire" badge logic mainly
            totals,
            badges,
            weeklyStats
        }
    };
}


export async function toggleHabit(userName: string, habitKey: string, dateStr: string) {
    const date = new Date(dateStr);
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const user = await prisma.user.findUnique({ where: { name: userName } });
    if (!user) throw new Error('User not found');

    let log = await prisma.dailyLog.findFirst({
        where: {
            userId: user.id,
            date: { gte: dayStart, lt: dayEnd }
        }
    });


    let currencyChange = 0;

    if (!log) {
        // Creating first entry for the day
        const data: any = { userId: user.id, date: dayStart };
        data[habitKey] = true;
        // First entry can't be perfect unless it's the only habit? No there are 5.
        // So perfection is impossible on single creation unless we default others to true (which we don't).
        await prisma.dailyLog.create({ data });
        // No currency change yet
    } else {
        // Calculate WasPerfect
        const wasPerfect = log.sport && log.nutrition && log.reading && log.work && log.meditation;

        const updateData: any = {};
        // @ts-ignore
        const newValue = !log[habitKey];
        updateData[habitKey] = newValue;

        await prisma.dailyLog.update({ where: { id: log.id }, data: updateData });

        // Calculate IsPerfect (simulate the new state)
        const nextState = { ...log, [habitKey]: newValue };
        const isPerfect = nextState.sport && nextState.nutrition && nextState.reading && nextState.work && nextState.meditation;

        if (!wasPerfect && isPerfect) {
            currencyChange = 1;
        } else if (wasPerfect && !isPerfect) {
            currencyChange = -1;
        }
    }

    if (currencyChange !== 0) {
        await prisma.user.update({
            where: { id: user.id },
            data: { currency: { increment: currencyChange } }
        });
    }

    revalidatePath('/');
    revalidatePath('/analytique');
}

export async function buyJoker(userName: string) {
    const user = await prisma.user.findUnique({ where: { name: userName } });
    if (!user) throw new Error('User not found');

    if (user.currency < 10) {
        return { success: false, message: 'Pas assez de points !' };
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            currency: { decrement: 10 },
            jokers: { increment: 1 }
        }
    });

    revalidatePath('/');
    return { success: true };
}

export async function useJoker(userName: string, habitKey: string, dateStr: string) {
    const user = await prisma.user.findUnique({ where: { name: userName } });
    if (!user) throw new Error('User not found');

    if (user.jokers < 1) {
        return { success: false, message: 'Aucun Joker disponible !' };
    }

    // 1. Consume Joker
    await prisma.user.update({
        where: { id: user.id },
        data: { jokers: { decrement: 1 } }
    });

    // 2. Mark habit as done (reuse logic slightly but force true)
    const date = new Date(dateStr);
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);

    let log = await prisma.dailyLog.findFirst({
        where: { userId: user.id, date: { gte: dayStart, lt: dayEnd } }
    });

    if (!log) {
        const data: any = { userId: user.id, date: dayStart };
        data[habitKey] = true;
        // No currency gain for Joker usage? Or maybe yes? Let's say yes for now to keep streak/logic simple, 
        // OR no because it's "cheating"? 
        // User asked to "validate" the objective. 
        // Usually Jokers keep the streak but don't necessarily give points.
        // Let's NOT give currency for Joker usage to balance it.
        await prisma.dailyLog.create({ data });
    } else {
        const updateData: any = {};
        updateData[habitKey] = true;
        await prisma.dailyLog.update({ where: { id: log.id }, data: updateData });
    }

    revalidatePath('/');
    return { success: true };
}



export async function getUsersList() {
    const users = await prisma.user.findMany();
    // Enrich with stats
    return await Promise.all(users.map(async (u: any) => await getUserWithStats(u.name)));
}

export async function getMonthlyStats(userName: string) {
    const user = await getUser(userName);
    if (!user) return null;

    const logs = user.logs;
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const periodLogs = logs.filter((l: any) => new Date(l.date) >= thirtyDaysAgo);

    // 1. Radar Data (Totals per category over 30 days)
    const totalDays = 30; // Just for relative scaling if needed

    const radarData = [
        { subject: 'Sport', A: periodLogs.filter((l: any) => l.sport).length, fullMark: totalDays },
        { subject: 'Nutrition', A: periodLogs.filter((l: any) => l.nutrition).length, fullMark: totalDays },
        { subject: 'Lecture', A: periodLogs.filter((l: any) => l.reading).length, fullMark: totalDays },
        { subject: 'Travail', A: periodLogs.filter((l: any) => l.work).length, fullMark: totalDays },
        { subject: 'Médit.', A: periodLogs.filter((l: any) => l.meditation).length, fullMark: totalDays },
    ];

    // 2. Line Chart Data (Daily Completion % over 30 days)
    // We need to generate an array of 30 days even if empty
    const lineData = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const dayLog = periodLogs.find((l: any) => {
            const ld = new Date(l.date);
            ld.setHours(0, 0, 0, 0);
            return ld.getTime() === d.getTime();
        });

        let completedCount = 0;
        if (dayLog) {
            if (dayLog.sport) completedCount++;
            if (dayLog.nutrition) completedCount++;
            if (dayLog.reading) completedCount++;
            if (dayLog.work) completedCount++;
            if (dayLog.meditation) completedCount++;
        }

        const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        // Calculate %
        const pct = (completedCount / 5) * 100;

        lineData.push({
            date: dateStr,
            score: pct
        });
    }

    return {
        radarData,
        lineData
    };
}
