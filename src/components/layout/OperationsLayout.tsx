import { DashboardNav } from "./DashboardNav";

interface OperationsLayoutProps {
  children: React.ReactNode;
}

export function OperationsLayout({ children }: OperationsLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Dashboard Navigation */}
      <DashboardNav />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
