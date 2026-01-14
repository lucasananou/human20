import { Check, LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface HabitCardProps {
    id: string;
    label: string;
    desc: string;
    icon: LucideIcon;
    color: string;
    checked: boolean;
    onToggle: () => void;
}

export default function HabitCard({ id, label, desc, icon: Icon, color, checked, onToggle }: HabitCardProps) {
    return (
        <div
            onClick={onToggle}
            className={twMerge(
                "checkbox-wrapper group glass-card p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all duration-300 border border-zinc-800 hover:border-zinc-700",
                checked ? "habit-checked bg-zinc-900/40" : "bg-zinc-900/20"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={clsx(
                    "check-ring w-6 h-6 rounded-md border-2 border-zinc-700 flex items-center justify-center transition-all duration-300",
                    // checked style handled by global css .habit-checked .check-ring but we can add utility here too
                )}>
                    <Check size={14} strokeWidth={3} className={clsx("text-zinc-900 transition-opacity duration-300", checked ? "opacity-100" : "opacity-0")} />
                </div>
                <div>
                    <h4 className="habit-text text-sm font-medium text-zinc-200 transition-colors duration-300">{label}</h4>
                    <p className="text-xs text-zinc-500 font-light tracking-wide">{desc}</p>
                </div>
            </div>
            <div className={twMerge(
                "p-2 rounded-full bg-zinc-900/50 border border-zinc-800 opacity-80 group-hover:opacity-100 transition-opacity",
                color
            )}>
                <Icon size={18} />
            </div>
        </div>
    );
}
