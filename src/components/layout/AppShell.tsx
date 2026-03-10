import { BottomNav } from "./BottomNav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-900 flex justify-center">
      <div className="mobile-container pb-20">
        <header className="sticky top-0 z-40 w-full h-14 bottom-nav-blur border-b border-border flex items-center px-4 justify-between">
          <h1 className="font-headline font-bold text-primary tracking-tight text-lg">
            TheChoosenTalks
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <span className="text-xs font-bold">TC</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  )
}