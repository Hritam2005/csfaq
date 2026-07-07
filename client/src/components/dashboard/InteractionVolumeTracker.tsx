import React, { useState, useMemo } from 'react';
import { ChevronDown, BookOpen, Search, Award, X, Sparkles, HelpCircle } from 'lucide-react';
import { cn } from '../ui/Button';
import { PacManGame } from './PacManGame';

interface DayContribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  weekIndex: number; // 0 to 51
}

export const InteractionVolumeTracker: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [hoveredDay, setHoveredDay] = useState<DayContribution | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Easter Egg & Gamification States
  const [titleClicks, setTitleClicks] = useState<number>(0);
  const [isPlayingPacman, setIsPlayingPacman] = useState<boolean>(false);
  const [showPacmanBrief, setShowPacmanBrief] = useState<boolean>(false);
  const [showBreakOverNotif, setShowBreakOverNotif] = useState<boolean>(false);

  const handleTitleClick = () => {
    const nextClicks = titleClicks + 1;
    if (nextClicks >= 5) {
      setTitleClicks(0);
      setIsPlayingPacman(true);
      setShowBreakOverNotif(false);
    } else {
      setTitleClicks(nextClicks);
    }
  };

  const handleEndPacman = (timeoutReached: boolean) => {
    setIsPlayingPacman(false);
    if (timeoutReached) {
      setShowBreakOverNotif(true);
    }
  };

  // Generate realistic GitHub-style dummy interaction data for 52 weeks (364 days)
  const { weeks, totalCount, monthPositions } = useMemo(() => {
    const generatedWeeks: DayContribution[][] = [];
    let cumulativeCount = 0;
    
    // Different totals depending on selected dummy year
    const baseMultiplier = selectedYear === '2026' ? 1.2 : selectedYear === '2025' ? 1.5 : 0.8;
    
    // We generate 52 weeks x 7 days = 364 days
    const startDate = new Date(parseInt(selectedYear), 0, 1); // Jan 1st of selected year
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsFound: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < 52; w++) {
      const currentWeek: DayContribution[] = [];
      for (let d = 0; d < 7; d++) {
        const dayOffset = w * 7 + d;
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayOffset);
        
        const monthIndex = currentDate.getMonth();
        if (monthIndex !== lastMonth && w < 50) {
          monthsFound.push({ name: monthNames[monthIndex], weekIndex: w });
          lastMonth = monthIndex;
        }

        const dateString = currentDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        // Deterministic pseudo-random pattern based on week and day for organic GitHub look
        const seed = Math.sin(w * 13 + d * 7 + parseInt(selectedYear) * 31) * 10000;
        const rand = seed - Math.floor(seed);
        
        let count = 0;
        let level: 0 | 1 | 2 | 3 | 4 = 0;

        // Weekdays have higher chance of interaction
        const isWeekday = d >= 1 && d <= 5;
        const activityChance = isWeekday ? 0.72 : 0.35;

        if (rand < activityChance) {
          // Determine intensity
          const intensityRand = (seed * 7) - Math.floor(seed * 7);
          if (intensityRand > 0.85) {
            count = Math.floor((12 + intensityRand * 15) * baseMultiplier);
            level = 4;
          } else if (intensityRand > 0.65) {
            count = Math.floor((7 + intensityRand * 6) * baseMultiplier);
            level = 3;
          } else if (intensityRand > 0.35) {
            count = Math.floor((3 + intensityRand * 4) * baseMultiplier);
            level = 2;
          } else {
            count = Math.floor((1 + intensityRand * 2) * baseMultiplier);
            level = 1;
          }
        }

        cumulativeCount += count;
        currentWeek.push({
          date: dateString,
          count,
          level,
          dayOfWeek: d,
          weekIndex: w
        });
      }
      generatedWeeks.push(currentWeek);
    }

    return {
      weeks: generatedWeeks,
      totalCount: cumulativeCount,
      monthPositions: monthsFound
    };
  }, [selectedYear]);

  // Color mapping matching GitHub's exact dark & light green scale
  const getColorClass = (level: number) => {
    switch (level) {
      case 4:
        return "bg-[#216e39] dark:bg-[#39d353] border border-black/[0.04] dark:border-[#39d353] shadow-[0_0_6px_rgba(57,211,83,0.35)]";
      case 3:
        return "bg-[#30a14e] dark:bg-[#26a641] border border-black/[0.04] dark:border-[#26a641]";
      case 2:
        return "bg-[#40c463] dark:bg-[#006d32] border border-black/[0.04] dark:border-[#006d32]";
      case 1:
        return "bg-[#9be9a8] dark:bg-[#0e4429] border border-black/[0.04] dark:border-[#0e4429]";
      case 0:
      default:
        return "bg-[#ebedf0] dark:bg-[#161b22] border border-black/[0.04] dark:border-[#1b1f24]";
    }
  };

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Explanation Modal / Banner when user clicks "Learn how we calculate..." */}
      {showExplanation && (
        <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-50/90 via-white to-emerald-50/90 p-6 shadow-lg backdrop-blur-xl dark:border-cyan-500/30 dark:from-[#0d1117] dark:via-[#161b22] dark:to-[#0e4429]/30 transition-all animate-in fade-in zoom-in-95 duration-200">
          <button 
            onClick={() => setShowExplanation(false)}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 dark:bg-cyan-400/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                How Vicharanashala Interaction Volume is Calculated
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Just like GitHub tracks code commits, Vicharanashala quantifies your daily engagement across the IIT Ropar research & crowd-sourced FAQ ecosystem. Every knowledge action strengthens collective wisdom:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-[#161b22]/80 border border-gray-200/60 dark:border-white/10 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#39d353] shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">AI Assistant Queries & Searches (+1 pt)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-[#161b22]/80 border border-gray-200/60 dark:border-white/10 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#26a641] shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">FAQ Reading & Bookmarks (+2 pts)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-[#161b22]/80 border border-gray-200/60 dark:border-white/10 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#006d32] shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">Spurti Milestone Awards (+5 pts)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-[#161b22]/80 border border-gray-200/60 dark:border-white/10 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0e4429] shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">Crowd-Sourced FAQ Submissions (+10 pts)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Break Over Notification Alert */}
      {showBreakOverNotif && (
        <div className="relative overflow-hidden rounded-xl border border-amber-500 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 shadow-lg dark:border-amber-400 dark:from-amber-950/80 dark:via-orange-950/80 dark:to-amber-950/80 animate-in fade-in slide-in-from-top-4 duration-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-black text-lg shadow-md animate-bounce">
              ⏰
            </span>
            <div>
              <h4 className="font-extrabold text-amber-900 dark:text-amber-200 text-base">
                Break Over! Go Study!
              </h4>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                Your 5-minute Pac-Man study break has ended. Time to get back to your Vicharanashala research contributions!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBreakOverNotif(false)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
          >
            Got it, Let's Study!
          </button>
        </div>
      )}

      {isPlayingPacman ? (
        <PacManGame onExit={handleEndPacman} />
      ) : (
        <>
          {/* Top Header Row: Title with Secret Easter Egg Icon & Settings Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 relative">
                <h2 
                  onClick={handleTitleClick}
                  className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2"
                  title="Click 5 times for a secret study break!"
                >
                  <span>Interaction Volume</span>
                </h2>
                
                {/* Brief Icon for Pac Man feature */}
                <div className="relative inline-flex items-center group/tooltip">
                  <button 
                    onClick={() => setShowPacmanBrief(!showPacmanBrief)}
                    onMouseEnter={() => setShowPacmanBrief(true)}
                    onMouseLeave={() => setShowPacmanBrief(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                    aria-label="How to activate secret study break game"
                  >
                    <HelpCircle className="h-4 w-4 text-amber-500/80 hover:text-amber-500 animate-pulse" />
                  </button>

                  {/* Tooltip / Brief Card */}
                  {showPacmanBrief && (
                    <div className="absolute left-0 top-8 w-72 sm:w-80 p-3.5 rounded-xl border border-amber-500/30 bg-white dark:bg-[#161b22] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-xs font-sans">
                      <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 mb-1.5 pb-1 border-b border-gray-100 dark:border-gray-800">
                        <span>🎮 Secret Easter Egg: Pac-Man Break!</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                        Need a quick mental refresher? Click the <strong>"Interaction Volume"</strong> title <strong>5 times</strong> to collapse this tracker into a fully playable <strong>Real Pac-Man game</strong> for a 5-minute study break!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400">
                <strong className="font-semibold text-gray-900 dark:text-white">{totalCount.toLocaleString()} interactions</strong> in {selectedYear}
              </p>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-[#8b949e] dark:hover:text-gray-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-[#30363d] transition-all"
              >
                <span>Interaction settings</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showSettings && "rotate-180")} />
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-xs font-bold text-gray-900 dark:text-white mb-2 pb-1.5 border-b border-gray-100 dark:border-[#30363d]">
                    Interaction Activity Settings
                  </p>
                  <label className="flex items-center gap-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-0 dark:border-gray-700 dark:bg-gray-800" />
                    <span>Include private research queries</span>
                  </label>
                  <label className="flex items-center gap-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-0 dark:border-gray-700 dark:bg-gray-800" />
                    <span>Include Spurti point redemptions</span>
                  </label>
                  <label className="flex items-center gap-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-0 dark:border-gray-700 dark:bg-gray-800" />
                    <span>Show archived FAQ interactions</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Main Container: Graph Card + Year Selector */}
          <div className="flex flex-col xl:flex-row items-start gap-4">
            
            {/* Graph Card (Exact GitHub Dark Mode & Light Mode Aesthetics) */}
            <div className="flex-1 w-full min-w-0 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-[#30363d] dark:bg-[#0d1117] transition-colors">
              
              {/* Interactive Floating Tooltip Bar */}
              <div className="h-6 mb-3 flex items-center justify-between text-xs transition-all">
                {hoveredDay ? (
                  <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white animate-in fade-in duration-150">
                    <span className={cn("w-3 h-3 rounded-sm shrink-0", getColorClass(hoveredDay.level))} />
                    <span>
                      <strong className="font-bold">{hoveredDay.count === 0 ? 'No' : hoveredDay.count} interaction{hoveredDay.count === 1 ? '' : 's'}</strong> on {hoveredDay.date}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-[#8b949e] italic text-xs">
                    Hover over any day to see interaction volume details
                  </span>
                )}
              </div>

              {/* Grid Area with Horizontal Scrolling */}
              <div className="overflow-x-auto pb-3 custom-scrollbar">
                <div className="inline-flex flex-col min-w-[660px]">
                  
                  {/* Month Labels Top Row */}
                  <div className="relative h-5 ml-8 text-[11px] font-medium text-gray-500 dark:text-[#8b949e] select-none mb-1">
                    {monthPositions.map((m, idx) => (
                      <span 
                        key={idx}
                        style={{ left: `${m.weekIndex * 13}px` }}
                        className="absolute top-0 whitespace-nowrap"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>

                  {/* Day Labels + Week Columns Grid */}
                  <div className="flex gap-2 items-start">
                    
                    {/* Day Labels Column (Mon, Wed, Fri aligned exactly like GitHub) */}
                    <div className="flex flex-col justify-between h-[96px] text-[10px] font-normal text-gray-400 dark:text-[#8b949e] pt-1 pr-1 select-none w-7 shrink-0">
                      <span className="h-[11px]"></span>
                      <span className="h-[11px] leading-3">Mon</span>
                      <span className="h-[11px]"></span>
                      <span className="h-[11px] leading-3">Wed</span>
                      <span className="h-[11px]"></span>
                      <span className="h-[11px] leading-3">Fri</span>
                      <span className="h-[11px]"></span>
                    </div>

                    {/* 52 Columns of Weeks */}
                    <div className="flex gap-[3px]">
                      {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-[3px]">
                          {week.map((day, dayIdx) => (
                            <div
                              key={dayIdx}
                              onMouseEnter={() => setHoveredDay(day)}
                              onMouseLeave={() => setHoveredDay(null)}
                              className={cn(
                                "w-[11px] h-[11px] rounded-[2px] transition-transform duration-100 cursor-pointer hover:scale-125 hover:z-20",
                                getColorClass(day.level),
                                hoveredDay?.date === day.date && "ring-2 ring-blue-500 dark:ring-white scale-125 z-20"
                              )}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer inside Graph Card */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#21262d] flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-[#8b949e]">
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="hover:text-blue-600 dark:hover:text-[#58a6ff] transition-colors font-medium flex items-center gap-1.5 group"
                >
                  <span>Learn how we calculate interaction volume</span>
                  <HelpCircle className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Color Legend: Less [ ][ ][ ][ ][ ] More */}
                <div className="flex items-center gap-1.5 select-none">
                  <span className="text-[11px] mr-0.5">Less</span>
                  <span className={cn("w-[11px] h-[11px] rounded-[2px]", getColorClass(0))} title="No interactions" />
                  <span className={cn("w-[11px] h-[11px] rounded-[2px]", getColorClass(1))} title="1-2 interactions" />
                  <span className={cn("w-[11px] h-[11px] rounded-[2px]", getColorClass(2))} title="3-5 interactions" />
                  <span className={cn("w-[11px] h-[11px] rounded-[2px]", getColorClass(3))} title="6-9 interactions" />
                  <span className={cn("w-[11px] h-[11px] rounded-[2px]", getColorClass(4))} title="10+ interactions" />
                  <span className="text-[11px] ml-0.5">More</span>
                </div>
              </div>
            </div>

            {/* Year Selector Column (Right side on Desktop, row on smaller screens) */}
            <div className="flex flex-row xl:flex-col gap-2 shrink-0 w-full xl:w-24">
              {['2026', '2025', '2024'].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all w-full text-center shrink-0",
                    selectedYear === year
                      ? "bg-blue-600 dark:bg-[#1f6feb] text-white shadow-sm font-bold scale-[1.02]"
                      : "bg-transparent text-gray-600 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d]"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Contribution / Interaction Activity Section Below (GitHub Timeline Style) */}
          <div className="pt-2">
            <h3 className="text-base sm:text-lg font-normal text-gray-900 dark:text-white mb-4">
              Interaction activity
            </h3>
            
            {/* Month Dividing Header */}
            <div className="flex items-center gap-3 my-5">
              <span className="text-xs font-semibold text-gray-700 dark:text-[#8b949e]">
                {selectedYear === '2026' ? 'July 2026' : selectedYear === '2025' ? 'December 2025' : 'November 2024'}
              </span>
              <div className="flex-1 h-[1px] bg-gray-200 dark:bg-[#30363d]" />
            </div>

            {/* Vertical Timeline Activity List */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200 dark:before:bg-[#30363d]">
              
              {/* Timeline Item 1 */}
              <div className="relative group">
                <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-[#1f6feb]/20 text-blue-600 dark:text-[#58a6ff] ring-4 ring-white dark:ring-[#0d1117] transition-transform group-hover:scale-110">
                  <Search className="h-3 w-3" />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    Conducted <strong className="font-bold text-blue-600 dark:text-[#58a6ff]">8 AI Assistant queries</strong> & knowledge retrievals
                  </p>
                  <span className="text-xs text-gray-400 dark:text-[#8b949e] shrink-0">
                    {selectedYear === '2026' ? 'July 6' : selectedYear === '2025' ? 'Dec 28' : 'Nov 18'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-0.5">
                  Vicharanashala Core Research FAQ · IIT Ropar Mentorship System
                </p>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative group">
                <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-[#238636]/20 text-emerald-600 dark:text-[#39d353] ring-4 ring-white dark:ring-[#0d1117] transition-transform group-hover:scale-110">
                  <BookOpen className="h-3 w-3" />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    Bookmarked <strong className="font-bold text-emerald-600 dark:text-[#39d353]">5 technical answers</strong> & verification guidelines
                  </p>
                  <span className="text-xs text-gray-400 dark:text-[#8b949e] shrink-0">
                    {selectedYear === '2026' ? 'July 4' : selectedYear === '2025' ? 'Dec 21' : 'Nov 12'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-0.5">
                  NOC Timelines, Stipend Disbursement & Rosetta GPU cluster documentation
                </p>
              </div>

              {/* Timeline Item 3 */}
              <div className="relative group">
                <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 dark:bg-[#a371f7]/20 text-purple-600 dark:text-[#d2a8ff] ring-4 ring-white dark:ring-[#0d1117] transition-transform group-hover:scale-110">
                  <Award className="h-3 w-3" />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    Earned <strong className="font-bold text-purple-600 dark:text-[#d2a8ff]">150 Spurti Points</strong> for peer verification review
                  </p>
                  <span className="text-xs text-gray-400 dark:text-[#8b949e] shrink-0">
                    {selectedYear === '2026' ? 'July 1' : selectedYear === '2025' ? 'Dec 14' : 'Nov 05'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-0.5">
                  Samagama Credits reward program · Crowd-Sourced contribution recognition
                </p>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};
