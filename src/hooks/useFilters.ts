import { useState, useCallback, useMemo } from 'react';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterGroup {
    id: string;
    label: string;
    options: FilterOption[];
}

export function useFilters() {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

    const toggleFilters = useCallback(() => setShowFilters(prev => !prev), []);
    const openFilters = useCallback(() => setShowFilters(true), []);
    const closeFilters = useCallback(() => setShowFilters(false), []);

    const handleFilterChange = useCallback((groupId: string, value: string) => {
        setSelectedFilters(prev => {
            const current = prev[groupId] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [groupId]: updated };
        });
    }, []);

    const clearFilters = useCallback(() => setSelectedFilters({}), []);

    const hasActiveFilters = useMemo(
        () => Object.values(selectedFilters).some(arr => arr.length > 0),
        [selectedFilters]
    );

    const activeFilterCount = useMemo(
        () => Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0),
        [selectedFilters]
    );

    const isMatch = useCallback((fieldMap: Record<string, string | number | null | undefined>) => {
        return Object.entries(fieldMap).every(([groupId, fieldValue]) => {
            if (!selectedFilters[groupId]?.length) return true;
            return selectedFilters[groupId].includes(String(fieldValue ?? ''));
        });
    }, [selectedFilters]);

    return {
        showFilters,
        selectedFilters,
        toggleFilters,
        openFilters,
        closeFilters,
        handleFilterChange,
        clearFilters,
        hasActiveFilters,
        activeFilterCount,
        isMatch,
    };
}
