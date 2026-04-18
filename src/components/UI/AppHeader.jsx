import { BarChart3, Home } from 'lucide-react';

export default function AppHeader({ view, setView }) {
    return (
        <header
            className="sticky top-0 z-50 w-full bg-brand-bg/60 backdrop-blur-xl backdrop-saturate-150 border-b border-white/5"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
            <div className="max-w-[var(--shell-max-w)] mx-auto px-[var(--shell-pad-x)] py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/favicon.png" className="h-8 w-8 object-contain" alt="Logo" />
                    <span className="font-extrabold text-lg tracking-tighter text-white uppercase">CU Bettr</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-white/40 animate-pulsate-opacity">
                        HABIT STACKER
                    </span>
                    <button
                        onClick={() => setView(view === 'home' ? 'history' : 'home')}
                        className="h-10 w-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center border border-white/5 transition-all active:scale-95"
                        aria-label={view === 'home' ? 'Open history' : 'Open home'}
                    >
                        {view === 'home'
                            ? <BarChart3 size={20} className="text-brand-primary" />
                            : <Home size={20} className="text-brand-accent2" />}
                    </button>
                </div>
            </div>
        </header>
    );
}
