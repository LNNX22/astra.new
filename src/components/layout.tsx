
import { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import { ModeToggle } from "@/components/mode-toggle";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 h-full flex flex-col">
          <header className="flex justify-end mb-4">
            <ModeToggle />
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
