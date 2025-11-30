import React, { useState, useRef, useEffect } from 'react';
import { ViewMode } from '../types';

interface ControlPanelProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isSmoothed: boolean;
  setIsSmoothed: (smoothed: boolean) => void;
  availableKeys: number[];
  selectedKeys: number[];
  toggleKey: (key: number) => void;
  selectAll: () => void;
  clearAll: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  viewMode,
  setViewMode,
  isSmoothed,
  setIsSmoothed,
  availableKeys,
  selectedKeys,
  toggleKey,
  selectAll,
  clearAll,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  let selectionLabel = 'Select Years';
  if (viewMode === ViewMode.BY_YEAR) selectionLabel = 'Select Ages';
  else if (viewMode === ViewMode.BY_BIRTH_YEAR || viewMode === ViewMode.BY_BIRTH_YEAR_AGE) selectionLabel = 'Select Birth Years';

  // Scroll to bottom when switching to Birth Year view to show recent cohorts first
  useEffect(() => {
    if ((viewMode === ViewMode.BY_BIRTH_YEAR || viewMode === ViewMode.BY_BIRTH_YEAR_AGE) && scrollContainerRef.current) {
      // Small timeout ensures the DOM has updated with the new list of keys
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [viewMode, availableKeys]);

  return (
    <div className="bg-white border-r border-blue-100 w-full md:w-64 flex flex-col h-full shadow-lg z-10 font-sans shrink-0 relative">
      <div className="p-4 border-b border-blue-100 bg-blue-50/50">
        <h1 className="text-lg font-bold text-blue-900 leading-tight">Completed Fertility</h1>
        <p className="text-xs text-blue-500 mt-1">Visualizer Tool</p>
      </div>

      {/* View Mode Toggle */}
      <div className="p-4 space-y-4 border-b border-blue-50">
        <div>
          <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">X-Axis Variable</label>
          <div className="flex flex-col gap-1.5 bg-blue-50/50 p-1.5 rounded-md">
            <button
              onClick={() => setViewMode(ViewMode.BY_AGE)}
              className={`py-1.5 px-2 text-xs font-semibold rounded transition-all text-left ${
                viewMode === ViewMode.BY_AGE
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100'
                  : 'text-blue-400 hover:text-blue-600 hover:bg-blue-100/50'
              }`}
            >
              Age
            </button>
            <button
              onClick={() => setViewMode(ViewMode.BY_YEAR)}
              className={`py-1.5 px-2 text-xs font-semibold rounded transition-all text-left ${
                viewMode === ViewMode.BY_YEAR
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100'
                  : 'text-blue-400 hover:text-blue-600 hover:bg-blue-100/50'
              }`}
            >
              Year
            </button>
             <button
              onClick={() => setViewMode(ViewMode.BY_BIRTH_YEAR_AGE)}
              className={`py-1.5 px-2 text-xs font-semibold rounded transition-all text-left ${
                viewMode === ViewMode.BY_BIRTH_YEAR_AGE
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100'
                  : 'text-blue-400 hover:text-blue-600 hover:bg-blue-100/50'
              }`}
            >
              Birth Year (Cohort by Age)
            </button>
            <button
              onClick={() => setViewMode(ViewMode.BY_BIRTH_YEAR)}
              className={`py-1.5 px-2 text-xs font-semibold rounded transition-all text-left ${
                viewMode === ViewMode.BY_BIRTH_YEAR
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100'
                  : 'text-blue-400 hover:text-blue-600 hover:bg-blue-100/50'
              }`}
            >
              Birth Year (Cohort by Year)
            </button>
          </div>
        </div>

        {/* Smoothing Toggle */}
        <div>
            <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={isSmoothed}
                        onChange={(e) => setIsSmoothed(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">3-Year Age Average</span>
            </label>
        </div>

        <div className="flex justify-between items-end pt-2 border-t border-dashed border-slate-200">
           <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider">
            {selectionLabel}
           </label>
           <div className="space-x-2">
             <button onClick={selectAll} className="text-[10px] font-medium text-blue-600 hover:text-blue-800 uppercase tracking-wide">All</button>
             <button onClick={clearAll} className="text-[10px] font-medium text-slate-400 hover:text-slate-600 uppercase tracking-wide">Clear</button>
           </div>
        </div>
      </div>

      {/* Compact Grid of Keys */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-slate-50/30 min-h-0"
      >
        <div className="grid grid-cols-4 gap-1">
          {availableKeys.map((key) => {
             const isSelected = selectedKeys.includes(key);
             return (
                <button
                  key={key}
                  onClick={() => toggleKey(key)}
                  className={`px-1 py-1.5 text-[10px] font-medium rounded border transition-all text-center ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {key}
                </button>
             )
          })}
        </div>
      </div>
      
      {/* Footer with Info Pop-up */}
      <div className="p-3 bg-white border-t border-blue-100 relative">
        {showInfo && (
          <div className="absolute bottom-full left-0 w-full bg-blue-50/95 backdrop-blur-md border-t border-b border-blue-200 shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.1)] z-20 max-h-[400px] flex flex-col">
             <div className="flex justify-between items-start p-4 pb-2 shrink-0">
                 <h3 className="font-bold text-blue-900 text-xs">About this data</h3>
                 <button 
                    onClick={() => setShowInfo(false)} 
                    className="text-slate-400 hover:text-blue-600 -mt-1 -mr-1 p-1"
                    aria-label="Close"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
             </div>
             <div className="overflow-y-auto p-4 pt-0 text-[10px] text-slate-600 custom-scrollbar">
                <p className="mb-4">This tool visualizes completed fertility data from the Current Population Survey Fertility Supplement. In 2022, the survey question for completed fertility we're using was "Altogether how many children (have/has) (name/you) ever given birth to?"</p>
                <p className="mb-4">The data was compiled from IPUMS, using FRSUPPWT weights throughout:</p>
                <p className="mb-4 italic pl-2 border-l-2 border-blue-200">Sarah Flood, Miriam King, Renae Rodgers, Steven Ruggles, J. Robert Warren, Daniel Backman, Etienne Breton, Grace Cooper, Julia A. Rivera Drew, Stephanie Richards, David Van Riper, and Kari C.W. Williams. IPUMS CPS: Version 13.0 [dataset]. Minneapolis, MN: IPUMS, 2025. https://doi.org/10.18128/D030.V13.0</p>
                <p className="mb-4">Completed fertility is taken by totaling (FREVER*FRSUPPWT)/SUM(FRSUPPWT), grouped by the year and age. Three-year age average is average of those values across ages (e.g. 34 is the average of 33 to 35) and is recommend to help smoothing of this data.</p>            
                <p className="mb-1">Calculations from Mike Konczal.</p>
                <a 
                  href="https://mikekonczal.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  mikekonczal.com
                </a>
            </div>
          </div>
        )}

        <button 
          onClick={() => setShowInfo(!showInfo)}
          className={`text-[11px] text-blue-600 underline hover:text-blue-800 w-full text-center font-medium transition-colors ${showInfo ? 'text-blue-800' : ''}`}
        >
          {showInfo ? 'Hide Details' : 'About this data'}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;