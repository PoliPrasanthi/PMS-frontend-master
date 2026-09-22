import { CheckboxInput } from "@/components/forms/CheckboxInput";
import React, { useMemo, useState } from 'react';
import { X, Filter, ChevronDown, ChevronRight } from 'lucide-react';
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

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    groups: FilterGroup[];
    selectedFilters: Record<string, string[]>;
    onFilterChange: (groupId: string, value: string) => void;
    onClear: () => void;
}

export function FilterSidebar({
    isOpen,
    onClose,
    groups,
    selectedFilters,
    onFilterChange,
    onClear
}: FilterSidebarProps) {
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

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] z-[55] transition-opacity"
                onClick={onClose}
            />
            <div className="fixed inset-y-0 right-0 w-[300px] bg-theme-surface shadow-2xl z-[60] border-l border-theme-border animate-in slide-in-from-right duration-300">
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-theme-border flex items-center justify-between bg-theme-neutral">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-brand-teal-600" />
                            <h2 className="font-bold text-theme-primary text-[16px]">Filters</h2>
                            {activeCount > 0 && (
                                <span className="bg-brand-teal-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {activeCount}
                                </span>
                            )}
                        </div>
                        <Button
                            icon={<X className="w-5 h-5" />}
                            className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-border/50 transition-colors"
                            onClick={onClose}
                            unstyled
                        />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {groups.map(group => {
                            const isExpanded = expandedGroups[group.id];
                            const groupActiveCount = selectedFilters[group.id]?.length || 0;
                            
                            return (
                                <div key={group.id} className="border border-theme-border rounded-lg bg-theme-surface overflow-hidden">
                                    <button
                                        onClick={() => toggleGroup(group.id)}
                                        className="w-full flex items-center justify-between p-3 bg-theme-neutral/50 hover:bg-theme-neutral transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[12px] font-bold text-theme-secondary uppercase tracking-wider">{group.label}</h3>
                                            {groupActiveCount > 0 && (
                                                <span className="bg-brand-teal-100 dark:bg-brand-teal-900/40 text-brand-teal-700 dark:text-brand-teal-400 text-[10px] font-bold px-1.5 rounded-sm">
                                                    {groupActiveCount}
                                                </span>
                                            )}
                                        </div>
                                        {isExpanded ? <ChevronDown size={14} className="text-theme-secondary" /> : <ChevronRight size={14} className="text-theme-secondary" />}
                                    </button>
                                    
                                    {isExpanded && (
                                        <div className="p-3 space-y-1 border-t border-theme-border/50">
                                            {group.options.map(option => {
                                                const isSelected = selectedFilters[group.id]?.includes(option.value);
                                                return (
                                                    <label key={option.value} className="flex items-center gap-2.5 cursor-pointer group px-2 py-1.5 rounded-md hover:bg-theme-neutral transition-colors">
                                                        <div className="relative flex items-center">
                                                            <CheckboxInput
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => onFilterChange(group.id, option.value)}
                                                                className="w-4 h-4 rounded border-theme-border text-brand-teal-600 focus:ring-brand-teal-600/20 bg-transparent"
                                                            />
                                                        </div>
                                                        <span className={`text-[13.5px] font-medium truncate block w-full transition-colors ${isSelected ? 'text-brand-teal-600' : 'text-theme-secondary group-hover:text-theme-primary'}`} title={option.label}>
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

                    {activeCount > 0 && (
                        <div className="p-4 border-t border-theme-border bg-theme-surface">
                            <Button
                                className="w-full py-2.5 px-4 bg-brand-rose-50 hover:bg-brand-rose-100 text-brand-rose-600 border border-brand-rose-200 font-semibold rounded-xl text-[13px] transition-colors"
                                onClick={onClear}
                                unstyled
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
