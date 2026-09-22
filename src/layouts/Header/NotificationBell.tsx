
import React, { useRef } from 'react';
import { Button } from 'primereact/Button';
import { Bell } from 'lucide-react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ComingSoonPlaceholder } from '@/components/ui/ComingSoonPlaceholder';

export function NotificationBell() {
  const op = useRef<OverlayPanel>(null);

  return (
    <>
      <Button unstyled
        className="header-icon-btn relative !p-1.5 sm:!p-2.5"
        onClick={(e) => op.current?.toggle(e)}
        title="View Notifications"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
      </Button>

      <OverlayPanel ref={op} className="w-[300px] shadow-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-white dark:bg-slate-900">
           <ComingSoonPlaceholder moduleName="Notifications" />
        </div>
      </OverlayPanel>
    </>
  );
}
