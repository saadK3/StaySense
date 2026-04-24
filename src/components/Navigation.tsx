"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Hotel, AlertCircle, Sparkles, MessageSquare, Menu, ArrowLeft, Search } from "lucide-react";
import { Button } from "./ui/button";

export function Navigation({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const params = useParams();
  
  const hotelId = params?.id as string;

  // Collapse sidebar by default on mobile screens. We use a simple effect for this.
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Menu items change depending on if we are viewing a specific hotel
  const navItems = hotelId ? [
    { name: "Dashboard", href: `/hotel/${hotelId}/dashboard`, icon: Hotel },
    { name: "Insights", href: `/hotel/${hotelId}/insights`, icon: AlertCircle },
    { name: "Recommendations", href: `/hotel/${hotelId}/recommendations`, icon: Sparkles },
    { name: "AI Chat", href: `/hotel/${hotelId}/chat`, icon: MessageSquare },
  ] : [
    { name: "Search Properties", href: `/`, icon: Search },
    { name: "Global Insights", href: `/`, icon: AlertCircle },
    { name: "Platform Settings", href: `/`, icon: Sparkles },
  ];

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden relative">
      
      {/* Sidebar Navigation */}
      <aside className={`
        flex-shrink-0 fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-card flex flex-col transition-all duration-300 ease-in-out md:relative
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:-ml-64"}
      `}>
        <div className="flex h-[65px] items-center p-6 border-b border-border">
          <h1 className="text-xl font-bold font-heading text-primary flex items-center gap-2 truncate">
            <Sparkles className="w-5 h-5 shrink-0" />
            StaySense AI
          </h1>
        </div>
        {hotelId && (
          <div className="p-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground mb-2">
                <ArrowLeft className="w-4 h-4 mr-2 shrink-0" />
                Back to Search
              </Button>
            </Link>
          </div>
        )}
        <nav className={`flex-1 px-4 ${!hotelId ? 'pt-4' : ''} pb-4 space-y-1 overflow-y-auto`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
           <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Unified Topbar */}
        <header className="flex-none flex items-center justify-between p-4 border-b border-border bg-card shadow-sm z-10 h-[65px]">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="shrink-0 text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </Button>
            {!sidebarOpen && (
              <div className="flex items-center gap-2 md:hidden animate-in fade-in zoom-in duration-300">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <span className="font-bold font-heading text-lg">StaySense AI</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
