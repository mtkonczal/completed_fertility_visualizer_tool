export interface RawDataPoint {
  year: number;
  age: number;
  avg_no_children: number;
}

export interface ChartDataPoint {
  [key: string]: number | string;
}

export enum ViewMode {
  BY_AGE = 'BY_AGE',
  BY_YEAR = 'BY_YEAR',
  BY_BIRTH_YEAR = 'BY_BIRTH_YEAR',
  BY_BIRTH_YEAR_AGE = 'BY_BIRTH_YEAR_AGE',
}

export interface Dataset {
  raw: RawDataPoint[];
  years: number[];
  ages: number[];
  birthYears: number[];
}