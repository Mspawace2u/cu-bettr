import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Check,
    Flame,
    Sparkles,
    BarChart3,
    ArrowLeft,
    Trophy,
    Gauge,
    Loader2,
    CheckCircle2,
    Circle,
    Terminal,
    Trash2,
    PlusCircle,
    ChevronDown,
    Home
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const App = () => {
    const [view, setView] = useState('home');
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLayering, setIsLayering] = useState(false);
    const [newHabitName, setNewHabitName] = useState("");
    const [showDevTools, setShowDevTools] = useState(false);
    const [expandedHabits, setExpandedHabits] = useState(new Set());

    // Helper: Format date to Weekday, MM-DD-YYYY
    const formatFullDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    // Initial load from Supabase
    useEffect(() => {
        const fetchHabits = async () => {
            setLoading(true);
            const { data: habitsData, error: habitsError } = await supabase
                .from('habits')
                .select(`
                    *,
                    entries (*)
                `)
                .order('created_at', { ascending: true });

            if (habitsError) {
                console.error('Error fetching habits:', habitsError);
            } else {
                setHabits(habitsData || []);
            }
            setLoading(false);
        };

        fetchHabits();
    }, []);

    // Logic Helpers
    const isHabitDoneToday = (habit) => {
        if (!habit?.entries) return false;
        const today = new Date().toDateString();
        return habit.entries.some(e => new Date(e.created_at || e.date).toDateString() === today);
    };

    const getStreak = (habit) => {
        if (!habit?.entries || habit.entries.length === 0) return 0;
        const sortedEntries = [...habit.entries].sort((a, b) => 
            new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
        );
        let count = 0;
        let checkDate = new Date();
        const doneToday = isHabitDoneToday(habit);
        if (!doneToday) checkDate.setDate(checkDate.getDate() - 1);
        const uniqueDates = new Set(sortedEntries.map(e => new Date(e.created_at || e.date).toDateString()));
        while (uniqueDates.has(checkDate.toDateString())) {
            count++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
        return count;
    };

    const getMasteryCount = (habit) => {
        if (!habit?.entries) return 0;
        // Mastered = Resistance 1 or 2
        return habit.entries.filter(e => e.resistance <= 2).length;
    };

    const todayResistanceForFocus = useMemo(() => {
        const focusHabit = habits[habits.length - 1];
        if (!focusHabit?.entries) return 0;
        const today = new Date().toDateString();
        const todayEntry = focusHabit.entries.find(e => new Date(e.created_at || e.date).toDateString() === today);
        return todayEntry?.resistance || 0;
    }, [habits]);

    const handleComplete = async (habitId, resistance) => {
        const entry = {
            habit_id: habitId,
            resistance,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('entries')
            .insert([entry])
            .select();

        if (error) {
            console.error('Error saving entry:', error);
            return;
        }

        const updatedHabits = [...habits];
        const habitIndex = updatedHabits.findIndex(h => h.id === habitId);
        if (habitIndex > -1) {
            updatedHabits[habitIndex].entries.push(data[0]);
            setHabits(updatedHabits);
        }

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.8 },
            colors: ["#ffe44d", "#9b5cff", "#2de2e6", "#ff2f92"]
        });
    };

    const handleAddLayer = async () => {
        if (!newHabitName.trim()) return;
        const { data, error } = await supabase.from('habits').insert([{ name: newHabitName }]).select();
        if (error) {
            console.error('Error adding habit:', error);
            return;
        }
        const newHabit = { ...data[0], entries: [] };
        setHabits([...habits, newHabit]);
        setNewHabitName("");
        setIsLayering(false);
        confetti({ particleCount: 200, colors: ["#ffe44d", "#2de2e6"] });
    };

    const toggleHabitExpand = (id) => {
        const next = new Set(expandedHabits);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedHabits(next);
    };

    // --- TESTING TOOLS (EASY TO REMOVE) ---
    const debugMockMastery = async () => {
        if (!focusHabit) return;
        const mockEntries = Array.from({ length: 5 }).map((_, i) => ({
            habit_id: focusHabit.id,
            resistance: 1,
            created_at: new Date(Date.now() - (i + 1) * 86400000).toISOString()
        }));
        const { data, error } = await supabase.from('entries').insert(mockEntries).select();
        if (!error) {
            const updatedHabits = [...habits];
            updatedHabits[updatedHabits.length - 1].entries.push(...data);
            setHabits(updatedHabits);
            confetti({ particleCount: 50 });
        }
    };

    const debugClearToday = async () => {
        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);
        const { error } = await supabase.from('entries').delete().gt('created_at', todayStart.toISOString());
        if (!error) {
            const resetHabits = habits.map(h => ({
                ...h,
                entries: h.entries.filter(e => new Date(e.created_at || e.date) < todayStart)
            }));
            setHabits(resetHabits);
        }
    };

    const debugAddTestHabit = async () => {
        const { data, error } = await supabase.from('habits').insert([{ name: `Test Foundation ${habits.length}` }]).select();
        if (!error) {
            setHabits([...habits, { ...data[0], entries: [] }]);
        }
    };
    // --------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-primary h-12 w-12" />
            </div>
        );
    }

    const focusHabit = habits[habits.length - 1];
    const foundationHabits = habits.slice(0, -1).reverse();
    const readyToStack = focusHabit && getMasteryCount(focusHabit) >= 5 && todayResistanceForFocus > 0 && todayResistanceForFocus < 3;

    return (
        <div className="min-h-screen bg-brand-bg text-brand-foreground font-sans selection:bg-brand-primary/30">
            <header className="fixed top-0 inset-x-0 h-20 px-6 flex items-center justify-between bg-brand-bg/80 backdrop-blur-3xl z-50 border-b border-white/5">
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
                    >
                        {view === 'home' ? <BarChart3 size={20} className="text-brand-primary" /> : <Home size={20} className="text-brand-accent2" />}
                    </button>
                </div>
            </header>

            <main className="pt-28 max-w-md mx-auto pb-32">
                {view === 'home' ? (
                    <div className="px-6 space-y-6">
                        {habits.length === 0 ? (
                             <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Sparkles size={48} className="text-brand-accent2 mb-4 opacity-50" />
                                <h3 className="text-xl font-bold mb-2 text-white">The Clean Slate</h3>
                                <p className="text-sm text-brand-muted mb-8 text-balance px-12">No habits active in the stack. Ready to start building foundation?</p>
                                <button onClick={() => setIsLayering(true)} className="px-10 py-4 bg-brand-primary text-brand-bg rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,228,77,0.3)]">Place First Layer</button>
                             </div>
                        ) : (
                            <>
                                {/* Focus Habit (Newest on Top) */}
                                <div className="space-y-4">
                                     <span className="font-mono text-[10px] text-brand-muted tracking-[0.3em] uppercase font-bold pl-2 block mb-2">Focus Layer</span>
                                     <FocusHabitCard 
                                        habit={focusHabit} 
                                        isDone={isHabitDoneToday(focusHabit)} 
                                        streak={getStreak(focusHabit)}
                                        onLog={(res) => handleComplete(focusHabit.id, res)}
                                     />
                                </div>

                                {/* Stack Suggestion */}
                                {readyToStack && !isLayering && (
                                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-8 border border-brand-primary/20 rounded-[32px] relative overflow-hidden group bg-brand-card shadow-[0_0_30px_rgba(255,228,77,0.05)]">
                                        <Flame className="absolute right-6 top-6 text-brand-primary h-18 w-18 -rotate-12 transition-transform group-hover:scale-110 duration-500" strokeWidth={0.5} />
                                        <h3 className="text-xl font-bold text-white mb-2 relative z-10 flex items-center gap-2">
                                            Add another?
                                        </h3>
                                        <p className="text-xs text-brand-muted leading-relaxed mb-8 relative z-10 max-w-[80%]">You slayed it. Add a new layer to your stack when ready.</p>
                                        <button onClick={() => setIsLayering(true)} className="w-full relative p-[1.5px] rounded-full bg-gradient-to-r from-brand-accent2 via-brand-secondary to-brand-accent1 animate-rainbow-glow bg-[length:200%_auto] hover:scale-[1.02] transition-transform shadow-lg shadow-brand-primary/10">
                                            <div className="bg-brand-bg text-white rounded-full py-4 text-center font-mono text-[11px] font-black tracking-[0.4em] uppercase">Stack New Habit</div>
                                        </button>
                                    </motion.div>
                                )}

                                {/* Foundation Habits (The Rest) */}
                                {foundationHabits.length > 0 && (
                                    <div className="space-y-4 pt-4">
                                        <span className="font-mono text-[10px] text-brand-muted tracking-[0.3em] uppercase font-bold pl-2 block mb-2">Foundation Layers</span>
                                        <div className="space-y-3">
                                            {foundationHabits.map(h => (
                                                <FoundationHabitCard 
                                                    key={h.id} 
                                                    habit={h} 
                                                    isDone={isHabitDoneToday(h)} 
                                                    streak={getStreak(h)}
                                                    onToggle={() => handleComplete(h.id, 1)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="px-6 space-y-4">
                        <div className="mb-8 pl-2">
                             <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Progress</h2>
                             <p className="text-[10px] text-brand-muted font-mono uppercase tracking-[0.3em] mt-1">Your Bettr Habits</p>
                        </div>
                        {habits.slice().reverse().map((h) => (
                            <div key={h.id} className="bg-brand-card p-6 rounded-[24px] border border-white/5 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-lg tracking-tight truncate pr-4">{h.name}</h3>
                                        <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest mt-1">{h.entries.length} log{h.entries.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <button 
                                        onClick={() => toggleHabitExpand(h.id)}
                                        className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all border ${expandedHabits.has(h.id) ? 'bg-brand-secondary border-brand-secondary text-white shadow-[0_0_15px_rgba(155,92,255,0.4)]' : 'bg-transparent border-brand-secondary text-brand-secondary hover:bg-brand-secondary/10'}`}
                                    >
                                        <ChevronDown size={20} className={`transition-transform duration-300 ${expandedHabits.has(h.id) ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                                
                                <AnimatePresence>
                                    {expandedHabits.has(h.id) && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <div className="space-y-3 pt-6">
                                                {h.entries.slice().reverse().map((e, idx) => (
                                                    <div key={idx} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                                                        <span className="text-xs font-medium text-brand-muted">{formatFullDate(e.created_at || e.date)}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.resistance === 1 ? "#2de2e6" : e.resistance === 2 ? "#ffe44d" : "#ff2f92" }} />
                                                            <span className="font-mono text-[9px] uppercase tracking-tighter text-white/60">R{e.resistance}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <AnimatePresence>
                {isLayering && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-brand-bg/95 backdrop-blur-3xl p-10 flex items-center justify-center">
                        <div className="w-full max-w-sm">
                            <h2 className="text-4xl font-black tracking-tighter mb-4 text-white uppercase">New Layer</h2>
                            <p className="text-xs text-brand-muted mb-8 font-mono uppercase tracking-widest">Stacking leads to mastery.</p>
                            <input
                                autoFocus type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-6 mb-8 focus:outline-none focus:border-brand-primary text-white font-mono placeholder:text-white/20 text-lg"
                                placeholder="What's next?"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddLayer()}
                            />
                            <button onClick={handleAddLayer} className="w-full bg-brand-primary text-brand-bg rounded-xl py-6 font-mono text-xs font-black tracking-[0.4em] uppercase shadow-[0_0_30px_rgba(255,228,77,0.2)]">Commit Layer</button>
                            <button onClick={() => setIsLayering(false)} className="w-full text-brand-muted font-mono text-[10px] uppercase mt-8 tracking-[0.3em] hover:text-white transition-colors">Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TESTING TOOLS OVERLAY */}
            <div className={`fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3 ${!showDevTools ? 'opacity-40 hover:opacity-100' : ''}`}>
                <AnimatePresence>
                    {showDevTools && (
                        <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }} className="bg-zinc-900 border border-white/10 p-4 rounded-3xl shadow-2xl flex flex-col gap-2 min-w-[200px]">
                            <p className="text-[10px] font-black font-mono text-brand-primary uppercase tracking-[0.3em] mb-2 px-2 italic">Test Lab</p>
                            <button onClick={debugClearToday} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-xl transition-colors text-[10px] uppercase font-bold tracking-widest text-white/70">
                                <Trash2 size={14} className="text-rose-500" /> Clear Today
                            </button>
                            <button onClick={debugMockMastery} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-xl transition-colors text-[10px] uppercase font-bold tracking-widest text-white/70">
                                <Trophy size={14} className="text-brand-primary" /> Mock Mastery
                            </button>
                            <button onClick={debugAddTestHabit} className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-xl transition-colors text-[10px] uppercase font-bold tracking-widest text-white/70">
                                <PlusCircle size={14} className="text-brand-accent2" /> Add Foundation
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button 
                    onClick={() => setShowDevTools(!showDevTools)}
                    className="h-12 w-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center shadow-2xl text-white/40 hover:text-white transition-all active:rotate-45"
                >
                    <Terminal size={20} />
                </button>
            </div>
        </div>
    );
};

const FocusHabitCard = ({ habit, isDone, streak, onLog }) => (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-brand-card rounded-[32px] p-8 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="flex gap-6 mb-10 relative z-10">
            <div className="flex-1 flex gap-4 min-w-0">
                <div className="w-[3px] flex-shrink-0 bg-gradient-to-b from-brand-secondary to-transparent shadow-[0_0_15px_#9b5cff] rounded-full" />
                <div className="min-w-0">
                    <span className="font-mono text-[10px] text-brand-muted tracking-[0.2em] uppercase font-bold">Current Target</span>
                    <h2 className="text-2xl font-black tracking-tight text-white mt-1 leading-tight break-words">{habit?.name}</h2>
                </div>
            </div>
            <StreakDisplay count={streak} />
        </div>

        {!isDone ? (
            <ResistanceControl onComplete={onLog} />
        ) : (
            <div className="flex flex-col items-center py-6 text-center">
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    className="h-20 w-20 rounded-full p-[2px] bg-gradient-to-tr from-brand-secondary via-brand-accent1 to-brand-accent2 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(155,92,255,0.2)]"
                >
                    <div className="h-full w-full rounded-full bg-brand-card flex items-center justify-center">
                        <Check size={40} className="text-brand-primary" />
                    </div>
                </motion.div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-accent2 font-black">LOGGED FOR TODAY</p>
            </div>
        )}
    </motion.div>
);

const FoundationHabitCard = ({ habit, isDone, streak, onToggle }) => (
    <div className={`p-5 rounded-2xl border transition-all ${isDone ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-brand-card border-white/10 shadow-lg'}`}>
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <button 
                    disabled={isDone}
                    onClick={onToggle}
                    className={`h-10 w-10 flex items-center justify-center transition-all ${isDone ? 'text-brand-accent1' : 'text-white/20 hover:text-white/40'}`}
                >
                    {isDone ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>
                <div className="min-w-0">
                    <h3 className={`font-bold text-sm tracking-tight truncate ${isDone ? 'text-white/40 line-through' : 'text-white/90'}`}>{habit.name}</h3>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mt-0.5">Integrated Layer</p>
                </div>
            </div>
            <StreakDisplay count={streak} small />
        </div>
    </div>
);

const StreakDisplay = ({ count, small = false }) => {
    if (count === 0) return null;
    return (
        <div className={`flex-shrink-0 flex flex-col items-start ${small ? 'pt-0.5' : 'pt-1'}`}>
            <div className={`flex items-center text-brand-primary ${small ? 'gap-1' : 'gap-1.5'}`}>
                <Flame size={small ? 14 : 18} fill="currentColor" />
                <span className={`font-black tracking-tighter leading-none ${small ? 'text-lg' : 'text-2xl'}`}>{count}</span>
            </div>
            <span className={`font-mono uppercase tracking-widest text-brand-muted mt-0.5 ml-0.5 ${small ? 'text-[7px]' : 'text-[9px]'}`}>Day</span>
        </div>
    );
};

const ResistanceControl = ({ onComplete }) => {
    const [val, setVal] = useState(1);
    const cur = [
        { v: 1, label: "Zero Friction", c: "#2de2e6" }, 
        { v: 2, label: "Medium Effort", c: "#ffe44d" }, 
        { v: 3, label: "High Demand", c: "#ff2f92" }
    ].find(l => l.v === val);

    return (
        <div className="space-y-10">
            <div>
                <div className="flex justify-between items-end mb-4 font-mono uppercase tracking-widest text-[10px] font-black">
                    <span className="text-brand-muted">Friction Gauge</span>
                    <span style={{ color: cur.c }}>{cur.label}</span>
                </div>
                <input type="range" min="1" max="3" step="1" value={val} onChange={(e) => setVal(parseInt(e.target.value))} className="w-full accent-brand-primary" />
            </div>
            <button onClick={() => onComplete(val)} className="w-full relative p-[1.5px] rounded-full bg-gradient-to-r from-brand-accent2 via-brand-secondary to-brand-accent1 hover:brightness-110 active:scale-95 transition-all">
                <div className="bg-brand-bg text-white rounded-full py-5 text-center font-mono text-xs font-black tracking-[0.3em] uppercase">Log It</div>
            </button>
        </div>
    );
};

export default App;
