import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileTabBar } from './MobileTabBar';
import { StoreSwitcher } from '@/components/ui/store-switcher';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="md:hidden bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <StoreSwitcher />
              <SidebarTrigger className="md:hidden" />
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden md:flex items-center h-14 border-b border-border px-4 bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex-1">
                <StoreSwitcher />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 mobile-container">
            {children}
          </div>
        </main>

        {/* Mobile Tab Bar */}
        <MobileTabBar />
      </div>
    </SidebarProvider>
  );
}