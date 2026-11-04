import type { ReactNode } from "react";
import { Activity, RadioTower } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-mark"><Activity size={21} strokeWidth={3} /></div>
          <div>
            <div className="brand-name">Spotrz<span>.</span></div>
            <p className="brand-subtitle">REAL-TIME MATCH DATA DEMO</p>
          </div>
        </div>
        <div className="header-status"><span className="status-dot" /> API + LIVE FEED <RadioTower size={15} /></div>
      </header>
      <main className="page-wrap">{children}</main>
      <footer className="site-footer">
        <span>SPOTRZ / LIVE SPORTS BOARD</span>
        <span>POWERED BY YOUR EXPRESS + WEBSOCKET API</span>
      </footer>
    </div>
  );
}