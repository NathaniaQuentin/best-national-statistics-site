// NusaData — the figures behind the site.
// Every figure carries its source and year. Values are rounded published
// figures from Statistics Indonesia (BPS), the World Bank and the Ministry
// of Health's SSGI survey. Nothing here is fetched at run time.

const NUSA = {
  country: 'Indonesia',
  tagline: 'Indonesia in numbers',
  updated: 'Figures as published for 2023–2024',
};

// National indicators: one row per indicator, grouped by theme.
const INDICATORS = [
  // ---- Economy ----
  { id: 'gdp', name: 'Gross domestic product (nominal)', value: 'Rp 22,139 trillion', numeric: 22139, unit: 'Rp trillion', year: 2024, source: 'BPS', theme: 'Economy', note: 'Current prices, 2024' },
  { id: 'gdp-pc', name: 'GDP per capita', value: 'US$ 4,925', numeric: 4925, unit: 'US$', year: 2024, source: 'World Bank', theme: 'Economy', note: 'Current US$, 2024' },
  { id: 'growth', name: 'Real GDP growth', value: '5.03%', numeric: 5.03, unit: '%', year: 2024, source: 'BPS', theme: 'Economy', note: 'Year on year, 2024' },
  { id: 'inflation', name: 'Consumer price inflation', value: '1.57%', numeric: 1.57, unit: '%', year: 2024, source: 'BPS', theme: 'Economy', note: 'Year on year, December 2024' },
  { id: 'exports', name: 'Exports of goods', value: 'US$ 264.7 billion', numeric: 264.7, unit: 'US$ billion', year: 2024, source: 'BPS', theme: 'Economy', note: 'Full year 2024' },
  { id: 'debt', name: 'Government debt', value: '≈ 39% of GDP', numeric: 39, unit: '% of GDP', year: 2024, source: 'Ministry of Finance', theme: 'Economy', note: 'End of 2024' },
  // ---- Population ----
  { id: 'population', name: 'Total population', value: '281.6 million', numeric: 281.6, unit: 'million', year: 2024, source: 'BPS', theme: 'Population', note: 'Mid-year estimate, 2024' },
  { id: 'density', name: 'Population density', value: '147 people / km²', numeric: 147, unit: 'per km²', year: 2024, source: 'BPS', theme: 'Population', note: 'Mid-year estimate, 2024' },
  { id: 'median-age', name: 'Median age', value: '30.1 years', numeric: 30.1, unit: 'years', year: 2024, source: 'BPS', theme: 'Population', note: '2024' },
  { id: 'urban', name: 'Urban population share', value: '58.6%', numeric: 58.6, unit: '%', year: 2024, source: 'BPS', theme: 'Population', note: '2024' },
  // ---- Health ----
  { id: 'life-exp', name: 'Life expectancy at birth', value: '74.2 years', numeric: 74.2, unit: 'years', year: 2024, source: 'BPS', theme: 'Health', note: '2024' },
  { id: 'imr', name: 'Infant mortality rate', value: '16.4 per 1,000 live births', numeric: 16.4, unit: 'per 1,000', year: 2023, source: 'World Bank', theme: 'Health', note: '2023' },
  { id: 'stunting', name: 'Stunting prevalence, under-5s', value: '21.5%', numeric: 21.5, unit: '%', year: 2023, source: 'SSGI, Ministry of Health', theme: 'Health', note: '2023 survey' },
  // ---- Education ----
  { id: 'literacy', name: 'Adult literacy rate (15+)', value: '96.4%', numeric: 96.4, unit: '%', year: 2023, source: 'BPS', theme: 'Education', note: '2023' },
  { id: 'schooling', name: 'Mean years of schooling', value: '9.2 years', numeric: 9.2, unit: 'years', year: 2024, source: 'BPS', theme: 'Education', note: '2024' },
  { id: 'enrolment', name: 'Primary net enrolment rate', value: '97.8%', numeric: 97.8, unit: '%', year: 2023, source: 'BPS', theme: 'Education', note: '2023' },
  { id: 'hdi', name: 'Human Development Index', value: '75.02', numeric: 75.02, unit: 'index', year: 2024, source: 'BPS', theme: 'Education', note: '2024' },
  // ---- Employment ----
  { id: 'unemployment', name: 'Open unemployment rate', value: '4.91%', numeric: 4.91, unit: '%', year: 2024, source: 'BPS', theme: 'Employment', note: 'August 2024' },
  { id: 'poverty', name: 'Poverty rate', value: '8.57%', numeric: 8.57, unit: '%', year: 2024, source: 'BPS', theme: 'Employment', note: 'September 2024' },
  { id: 'lfpr', name: 'Labour force participation rate', value: '70.63%', numeric: 70.63, unit: '%', year: 2024, source: 'BPS', theme: 'Employment', note: 'August 2024' },
  { id: 'informal', name: 'Informal employment share', value: '59.2%', numeric: 59.2, unit: '%', year: 2024, source: 'BPS', theme: 'Employment', note: 'August 2024' },
];

// Time series, 2019–2024. Each series: label, unit, source, and values per year.
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];
const SERIES = {
  growth:      { label: 'Real GDP growth', unit: '%', source: 'BPS', values: [5.02, -2.07, 3.70, 5.31, 5.05, 5.03] },
  inflation:   { label: 'Consumer price inflation', unit: '%', source: 'BPS', values: [2.72, 1.68, 1.87, 5.51, 2.61, 1.57] },
  poverty:     { label: 'Poverty rate', unit: '%', source: 'BPS', values: [9.22, 10.19, 9.71, 9.57, 9.36, 8.57] },
  unemployment:{ label: 'Open unemployment rate', unit: '%', source: 'BPS', values: [5.28, 7.07, 6.49, 5.86, 5.45, 4.91] },
  population:  { label: 'Population', unit: 'million', source: 'BPS', values: [266.9, 270.2, 273.9, 275.8, 278.7, 281.6] },
  gdpPc:       { label: 'GDP per capita', unit: 'US$', source: 'World Bank', values: [4136, 3870, 4333, 4784, 4919, 4925] },
};

// Provinces: population (millions, BPS mid-year estimate 2024), poverty rate
// (%, BPS September 2024), open unemployment rate (%, BPS August 2024),
// Human Development Index (BPS 2024). Figures rounded to one decimal.
const PROVINCES = [
  { name: 'Jawa Barat', island: 'Java', population: 50.35, poverty: 7.3, unemployment: 6.3, hdi: 74.9 },
  { name: 'Jawa Timur', island: 'Java', population: 41.81, poverty: 9.8, unemployment: 4.2, hdi: 75.4 },
  { name: 'Jawa Tengah', island: 'Java', population: 37.89, poverty: 10.5, unemployment: 4.8, hdi: 73.7 },
  { name: 'Sumatera Utara', island: 'Sumatra', population: 15.59, poverty: 8.0, unemployment: 5.6, hdi: 75.5 },
  { name: 'Banten', island: 'Java', population: 12.43, poverty: 5.7, unemployment: 7.0, hdi: 75.6 },
  { name: 'DKI Jakarta', island: 'Java', population: 10.56, poverty: 4.1, unemployment: 5.9, hdi: 83.0 },
  { name: 'Sulawesi Selatan', island: 'Sulawesi', population: 9.36, poverty: 7.6, unemployment: 4.3, hdi: 74.4 },
  { name: 'Lampung', island: 'Sumatra', population: 9.28, poverty: 10.7, unemployment: 4.1, hdi: 72.4 },
  { name: 'Sumatera Selatan', island: 'Sumatra', population: 9.05, poverty: 11.1, unemployment: 4.2, hdi: 73.6 },
  { name: 'Riau', island: 'Sumatra', population: 6.97, poverty: 6.3, unemployment: 4.3, hdi: 75.6 },
  { name: 'Kalimantan Barat', island: 'Kalimantan', population: 5.66, poverty: 6.6, unemployment: 4.4, hdi: 71.9 },
  { name: 'Papua', island: 'Papua', population: 1.07, poverty: 34.5, unemployment: 3.1, hdi: 63.0 },
];
