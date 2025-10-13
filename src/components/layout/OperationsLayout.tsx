import { DashboardNav } from "./DashboardNav";

interface OperationsLayoutProps {
  children: React.ReactNode;
}

export function OperationsLayout({ children }: OperationsLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Dashboard Navigation */}
      <DashboardNav />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
