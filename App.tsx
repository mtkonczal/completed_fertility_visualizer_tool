import React, { useState, useEffect, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import FertilityChart from './components/FertilityChart';
import { parseCSV, pivotByAge, pivotByYear, pivotByBirthYear, pivotBirthYearByAge, getSmoothedData } from './services/dataService';
import { ViewMode, Dataset, ChartDataPoint } from './types';

const App: React.FC = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.BY_AGE);
  const [isSmoothed, setIsSmoothed] = useState<boolean>(true);
  
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedAges, setSelectedAges] = useState<number[]>([]);
  const [selectedBirthYears, setSelectedBirthYears] = useState<number[]>([]);

  useEffect(() => {
    const data = parseCSV();
    setDataset(data);
    
    // Default selections per user request
    // "Make the default x-axis variable age, and the selected year choices 2000 and 2024"
    // ViewMode default is BY_AGE.
    const defaultYears = [2000, 2024].filter(y => data.years.includes(y));
    setSelectedYears(defaultYears);
    
    // Select ages like 25, 30, 35, 42
    const defaultAges = [25, 30, 35, 42];
    setSelectedAges(data.ages.filter(a => defaultAges.includes(a)));

    // Default birth year (cohort by Age) with 1990, 1980, and 1986 as the only default on.
    const defaultBirthYears = [1980, 1986, 1990].filter(y => data.birthYears.includes(y));
    setSelectedBirthYears(defaultBirthYears);

  }, []);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!dataset) return [];

    const sourceData = isSmoothed ? getSmoothedData(dataset.raw) : dataset.raw;

    if (viewMode === ViewMode.BY_AGE) {
      return pivotByAge(sourceData, dataset.ages);
    } else if (viewMode === ViewMode.BY_YEAR) {
      return pivotByYear(sourceData, dataset.years);
    } else if (viewMode === ViewMode.BY_BIRTH_YEAR) {
      // Birth Year view (X-axis = Calendar Year)
      return pivotByBirthYear(sourceData, dataset.years);
    } else {
      // Birth Year by Age view (X-axis = Age)
      return pivotBirthYearByAge(sourceData, dataset.ages);
    }
  }, [dataset, viewMode, isSmoothed]);

  // Determine which keys are active based on view mode
  let activeKeys: number[] = [];
  let availableKeys: number[] = [];
  
  if (viewMode === ViewMode.BY_AGE) {
    activeKeys = selectedYears;
    availableKeys = dataset?.years || [];
  } else if (viewMode === ViewMode.BY_YEAR) {
    activeKeys = selectedAges;
    availableKeys = dataset?.ages || [];
  } else {
    // Both Birth Year modes share the same selection state (selecting birth cohorts)
    activeKeys = selectedBirthYears;
    availableKeys = dataset?.birthYears || [];
  }

  const toggleKey = (key: number) => {
    if (viewMode === ViewMode.BY_AGE) {
      setSelectedYears(prev => 
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    } else if (viewMode === ViewMode.BY_YEAR) {
      setSelectedAges(prev => 
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    } else {
      setSelectedBirthYears(prev => 
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    }
  };

  const selectAll = () => {
    if (!dataset) return;
    if (viewMode === ViewMode.BY_AGE) {
      setSelectedYears(dataset.years);
    } else if (viewMode === ViewMode.BY_YEAR) {
      setSelectedAges(dataset.ages);
    } else {
      setSelectedBirthYears(dataset.birthYears);
    }
  };

  const clearAll = () => {
    if (viewMode === ViewMode.BY_AGE) {
      setSelectedYears([]);
    } else if (viewMode === ViewMode.BY_YEAR) {
      setSelectedAges([]);
    } else {
      setSelectedBirthYears([]);
    }
  };

  if (!dataset) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading dataset...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-blue-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-[1200px] aspect-video bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col md:flex-row border border-blue-100">
        {/* Controls Sidebar */}
        <ControlPanel 
          viewMode={viewMode}
          setViewMode={setViewMode}
          isSmoothed={isSmoothed}
          setIsSmoothed={setIsSmoothed}
          availableKeys={availableKeys}
          selectedKeys={activeKeys}
          toggleKey={toggleKey}
          selectAll={selectAll}
          clearAll={clearAll}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 h-full min-w-0 flex flex-col overflow-hidden">
          <FertilityChart 
            data={chartData}
            viewMode={viewMode}
            selectedKeys={activeKeys}
          />
        </main>
      </div>
    </div>
  );
};

export default App;