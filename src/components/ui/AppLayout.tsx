'use client';

import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { BottomTabBar } from './BottomTabBar';


type LayoutRole = 'patient' | 'guardian' | 'caretaker';

interface AppLayoutProps {
    role: LayoutRole;
    children: React.ReactNode;
    userName?: string;
    alertCount?: number;
}

export function AppLayout({ role, children, userName, alertCount }: AppLayoutProps) {
    if (role === 'patient') {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-surface-soft)', position: 'relative' }}>
                <AppHeader variant="patient" userName={userName} />
                <main
                    style={{
                        paddingBottom: 80, /* space for bottom tab bar */
                    }}
                    id="main-content"
                >
                    {children}
                </main>
                <BottomTabBar />
            </div>
        );
    }

    // Guardian or Caretaker — full shell with sidebar
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-surface-soft)' }}>
            <AppHeader
                variant="default"
                userName={userName}
                alertCount={alertCount}
            />
            <div style={{ display: 'flex', maxWidth: '100%' }}>
                <AppSidebar role={role as 'guardian' | 'caretaker'} />
                <main
                    id="main-content"
                    style={{
                        flex: 1,
                        minWidth: 0,
                        background: 'var(--bg-surface-soft)',
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
