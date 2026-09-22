
import React, { useRef, useState } from 'react';
import { DataTable as PrimeDataTable, DataTableRowEditCompleteEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import { useEffect } from 'react';

export interface PMSColumn<T> {
    field: keyof T & string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    filterMatchMode?: FilterMatchMode;
    editable?: boolean;
    width?: string;
    body?: (row: T) => React.ReactNode;
    editor?: (options: any) => React.ReactNode;
}

interface PMSDataTableProps<T extends object> {
    columns: PMSColumn<T>[];
    data: T[];
    dataKey?: string;
    loading?: boolean;
    editMode?: 'row' | 'cell';
    onRowEdit?: (updated: T) => void;
    filterDisplay?: 'row' | 'menu';
    onRowClick?: (row: T) => void;
    itemsPerPage?: number;
    emptyMessage?: string;
    className?: string;
    scrollHeight?: string;
    forceVirtual?: boolean;
    lazy?: boolean;
    totalRecords?: number;
    first?: number;
    rows?: number;
    onPage?: (event: any) => void;
}

const VIRTUAL_ITEM_SIZE = 46;

function defaultTextEditor(options: any) {
    return (
        <InputText
            type="text"
            value={options.value}
            onChange={(e) => options.editorCallback(e.target.value)}
            className="w-full"
            style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                padding: '4px 8px',
            }}
        />
    );
}

export function PMSDataTable<T extends object>({
    columns,
    data,
    dataKey = 'id',
    loading = false,
    editMode,
    onRowEdit,
    filterDisplay = 'menu',
    onRowClick,
    itemsPerPage = 50,
    emptyMessage = 'No records found.',
    className = '',
    scrollHeight = '100%',
    forceVirtual = false,
    lazy = false,
    totalRecords,
    first: externalFirst,
    rows: externalRows,
    onPage: externalOnPage,
}: PMSDataTableProps<T>) {
    const dt = useRef<PrimeDataTable<T[]>>(null);
    const useVirtual = forceVirtual;
    const [pageKey, setPageKey] = useState(0);
    const [internalFirst, setInternalFirst] = useState(0);
    const [internalRows, setInternalRows] = useState(itemsPerPage);

    const first = externalFirst !== undefined ? externalFirst : internalFirst;
    const rows = externalRows !== undefined ? externalRows : internalRows;

    function handleRowEditComplete(e: DataTableRowEditCompleteEvent) {
        if (onRowEdit) onRowEdit(e.newData as T);
    }

    const tableStyle: React.CSSProperties = {
        '--p-datatable-header-background': 'var(--bg-secondary)',
        '--p-datatable-header-color': 'var(--text-secondary)',
        '--p-datatable-body-background': 'var(--bg-card)',
        '--p-datatable-body-color': 'var(--text-primary)',
        '--p-datatable-row-hover-background': 'var(--bg-hover)',
        '--p-datatable-border-color': 'var(--border-color)',
    } as React.CSSProperties;

    // Show paginator if we have more records than current rows setting, or if we are already on a different page, or if lazy loading is enabled
    const showPaginator = lazy || (!useVirtual && (data.length > itemsPerPage || data.length > rows || first > 0));

    return (
        <>
            <Tooltip target="[data-pr-tooltip], .p-bug-tooltip, .p-task-tooltip, .task-name-tooltip" mouseTrack mouseTrackLeft={10} key={`${pageKey}-${data.length}`} />
            <PrimeDataTable<T[]>
                ref={dt}
                value={data}
                dataKey={dataKey}
                loading={loading}
                editMode={editMode}
                onRowEditComplete={handleRowEditComplete}
                onRowClick={onRowClick ? (e) => onRowClick(e.data as T) : undefined}
                rowClassName={(data) => onRowClick ? 'cursor-pointer' : ''}
                lazy={lazy}
                paginator={showPaginator}
                totalRecords={lazy ? totalRecords : undefined}
                first={first}
                rows={rows}
                paginatorTemplate="PrevPageLink PageLinks NextPageLink"
                onPage={(e: any) => {
                    if (loading) return; // Prevent PrimeReact from resetting first=0 when totalRecords is 0 during mount
                    if (externalOnPage) {
                        externalOnPage(e);
                    } else {
                        setInternalFirst(e.first);
                        setInternalRows(e.rows);
                    }
                    setPageKey((k) => k + 1);
                }}
                onSort={() => setPageKey((k) => k + 1)}
                onFilter={() => setPageKey((k) => k + 1)}
                scrollable
                scrollHeight={scrollHeight}
                virtualScrollerOptions={
                    useVirtual ? { itemSize: VIRTUAL_ITEM_SIZE, lazy: false } : undefined
                }
                emptyMessage={emptyMessage}
                className={`pms-datatable ${className}`}
                style={tableStyle}
                rowHover
                size="small"
                showGridlines
                stripedRows
                resizableColumns
                columnResizeMode="expand"
                pt={{
                    header:       { className: 'pms-dt-header' },
                    headerRow:    { className: 'pms-dt-header-row' },
                    bodyRow:      { className: 'pms-dt-row' },
                    column:       { bodyCell: { className: 'pms-dt-cell' }, headerCell: { className: 'pms-dt-head-cell' } },
                }}
            >
                {columns.map((col) => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        sortable={col.sortable}
                        body={col.body ?? undefined}
                        editor={col.editable ? (col.editor ?? defaultTextEditor) : undefined}
                        style={col.width ? { width: col.width } : undefined}
                    />
                ))}

                {editMode === 'row' && (
                    <Column
                        rowEditor
                        header="Edit"
                        headerStyle={{ width: '80px', minWidth: '80px' }}
                        bodyStyle={{ textAlign: 'center' }}
                    />
                )}
            </PrimeDataTable>
        </>
    );
}
