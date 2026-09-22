import { CheckboxInput } from "@/components/forms/CheckboxInput";
import React, { useMemo, useState } from 'react';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from 'primereact/Button';

interface FilterOption {
    label: string;
    value: string;
}

interface FilterGroup {
    id: string;
    label: string;
    options: FilterOption[];
}

interface FilterPanelProps {
    groups: FilterGroup[];
    selectedFilters: Record<string, string[]>;
    onFilterChange: (groupId: string, value: string) => void;
    onClear: () => void;
    className?: string;
}

export function FilterPanel({
    groups,
    selectedFilters,
    onFilterChange,
    onClear,
    className = ""
}: FilterPanelProps) {
    const activeCount = useMemo(
        () => Object.values(selectedFilters).reduce((s, a) => s + a.length, 0),
        [selectedFilters]
    );
    
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
        groups.reduce((acc, g) => ({ ...acc, [g.id]: g.id === 'status' }), {})
    );

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className={`flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 transition-all ${className}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-brand-teal-600" />
                    <h2 className="font-bold text-slate-800 dark:text-white text-[14px] uppercase tracking-wider">Filters</h2>
                    {activeCount > 0 && (
                        <span className="bg-brand-teal-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center translate-y-[-1px]">
                            {activeCount}
                        </span>
                    )}
                </div>
                {activeCount > 0 && (
                    <Button
                        unstyled
                        onClick={onClear}
                        className="text-[11px] font-bold text-slate-400 hover:text-brand-teal-600 transition-colors uppercase tracking-widest"
                    >
                        Reset
                    </Button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {groups.map(group => {
                    const isExpanded = expandedGroups[group.id];
                    const groupActiveCount = selectedFilters[group.id]?.length || 0;
                    
                    return (
                        <div key={group.id} className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className="w-full flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.1em]">{group.label}</h3>
                                    {groupActiveCount > 0 && (
                                        <span className="bg-brand-teal-100 dark:bg-brand-teal-900/40 text-brand-teal-700 dark:text-brand-teal-400 text-[10px] font-bold px-1.5 rounded-sm">
                                            {groupActiveCount}
                                        </span>
                                    )}
                                </div>
                                {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                            </button>
                            
                            {isExpanded && (
                                <div className="p-3 space-y-1 border-t border-slate-100 dark:border-slate-800">
                                    {group.options.map(option => {
                                        const isSelected = selectedFilters[group.id]?.includes(option.value);
                                        return (
                                            <label key={option.value} className="flex items-center gap-2.5 cursor-pointer group px-2 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="relative flex items-center">
                                                    <CheckboxInput
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => onFilterChange(group.id, option.value)}
                                                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-teal-600 focus:ring-brand-teal-600/20 focus:ring-offset-0 bg-transparent"
                                                    />
                                                </div>
                                                <span className={`text-[12.5px] font-medium truncate block w-full transition-colors ${isSelected ? 'text-brand-teal-600 dark:text-brand-teal-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`} title={option.label}>
                                                    {option.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
