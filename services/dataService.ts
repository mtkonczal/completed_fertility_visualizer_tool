import { RawDataPoint, Dataset, ChartDataPoint } from '../types';
import { CSV_DATA } from '../constants';

export const parseCSV = (): Dataset => {
  const lines = CSV_DATA.trim().split('\n');
  const headers = lines[0].split(',');
  
  const raw: RawDataPoint[] = [];
  const yearsSet = new Set<number>();
  const agesSet = new Set<number>();
  const birthYearsSet = new Set<number>();

  // Skip header (i=1)
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',');
    if (currentLine.length < 3) continue;

    const year = parseInt(currentLine[0], 10);
    const age = parseInt(currentLine[1], 10);
    const avg_no_children = parseFloat(currentLine[2]);

    if (!isNaN(year) && !isNaN(age) && !isNaN(avg_no_children)) {
      raw.push({ year, age, avg_no_children });
      yearsSet.add(year);
      agesSet.add(age);
      birthYearsSet.add(year - age);
    }
  }

  return {
    raw,
    years: Array.from(yearsSet).sort((a, b) => a - b),
    ages: Array.from(agesSet).sort((a, b) => a - b),
    birthYears: Array.from(birthYearsSet).sort((a, b) => a - b),
  };
};

// Calculate 3-year moving average across ages for each year
export const getSmoothedData = (raw: RawDataPoint[]): RawDataPoint[] => {
  // Group by year for quick lookups
  const dataByYear = new Map<number, Map<number, number>>();
  
  raw.forEach(point => {
    if (!dataByYear.has(point.year)) {
      dataByYear.set(point.year, new Map());
    }
    dataByYear.get(point.year)!.set(point.age, point.avg_no_children);
  });

  const smoothed: RawDataPoint[] = [];

  raw.forEach(point => {
    const yearData = dataByYear.get(point.year);
    if (!yearData) return;

    const prev = yearData.get(point.age - 1);
    const current = point.avg_no_children;
    const next = yearData.get(point.age + 1);

    // Strict 3-year average: requires all 3 points
    // This "shaves off" the first and last age of the sequence as requested
    if (prev !== undefined && next !== undefined) {
      const avg = (prev + current + next) / 3;
      smoothed.push({
        year: point.year,
        age: point.age,
        avg_no_children: avg
      });
    }
  });

  return smoothed;
};

// Transform for "By Age" view (X-axis = Age, Lines = Years)
export const pivotByAge = (data: RawDataPoint[], allAges: number[]): ChartDataPoint[] => {
  // Initialize structure: [{age: 15}, {age: 16}, ...]
  const result: ChartDataPoint[] = allAges.map(age => ({ age }));

  data.forEach(point => {
    const row = result.find(r => r.age === point.age);
    if (row) {
      row[point.year] = point.avg_no_children;
    }
  });

  return result;
};

// Transform for "By Year" view (X-axis = Year, Lines = Ages)
export const pivotByYear = (data: RawDataPoint[], allYears: number[]): ChartDataPoint[] => {
  // Initialize structure: [{year: 1976}, {year: 1977}, ...]
  const result: ChartDataPoint[] = allYears.map(year => ({ year }));

  data.forEach(point => {
    const row = result.find(r => r.year === point.year);
    if (row) {
      row[point.age] = point.avg_no_children;
    }
  });

  return result;
};

// Transform for "By Birth Year" view (X-axis = Calendar Year, Lines = Birth Years)
export const pivotByBirthYear = (data: RawDataPoint[], allYears: number[]): ChartDataPoint[] => {
  // Initialize structure: [{year: 1976}, {year: 1977}, ...]
  // We use Calendar Year for X-axis to see how a cohort evolves over time
  const result: ChartDataPoint[] = allYears.map(year => ({ year }));

  data.forEach(point => {
    const birthYear = point.year - point.age;
    const row = result.find(r => r.year === point.year);
    if (row) {
      row[birthYear] = point.avg_no_children;
    }
  });

  return result;
};

// Transform for "By Birth Year by Age" view (X-axis = Age, Lines = Birth Years)
export const pivotBirthYearByAge = (data: RawDataPoint[], allAges: number[]): ChartDataPoint[] => {
  // Initialize structure: [{age: 15}, {age: 16}, ...]
  const result: ChartDataPoint[] = allAges.map(age => ({ age }));

  data.forEach(point => {
    const birthYear = point.year - point.age;
    const row = result.find(r => r.age === point.age);
    if (row) {
      row[birthYear] = point.avg_no_children;
    }
  });

  return result;
};