// NusaData — views and charts.
// Plain ES scripts, no libraries: hash routing, SVG charts drawn by hand,
// a searchable indicator table and a province comparison tool.

const app = document.getElementById('app');
const TEAL = '#0e4f4a';
const TEAL_MID = '#17756d';
const TEAL_LIGHT = '#dcebe8';
const AMBER = '#e8a33d';
const INK = '#1d2a28';
const MUTED = '#5b6b68';
const GRID = '#e2ddd0';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmt(n, decimals) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals || 0, maximumFractionDigits: decimals || 0 });
}

function sourceLine(source, year, note) {
  return '<p class="src">Source: ' + esc(source) + ', ' + year + (note ? ' — ' + esc(note) : '') + '</p>';
}

/* ---------------- SVG charts ---------------- */

// Line chart for a time series. fromYear trims the left of the range.
function lineChart(seriesKey, fromYear) {
  const s = SERIES[seriesKey];
  const idx = YEARS.map(function (y, i) { return i; }).filter(function (i) { return YEARS[i] >= fromYear; });
  const vals = idx.map(function (i) { return s.values[i]; });
  const labels = idx.map(function (i) { return YEARS[i]; });
  const W = 560, H = 238, PL = 44, PR = 14, PT = 22, PB = 30;
  const lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
  const pad = (hi - lo) * 0.15 || 1;
  const ymin = lo - pad, ymax = hi + pad;
  const x = function (i) { return PL + (i * (W - PL - PR)) / Math.max(vals.length - 1, 1); };
  const y = function (v) { return PT + (1 - (v - ymin) / (ymax - ymin)) * (H - PT - PB); };
  let g = '';
  for (let t = 0; t <= 4; t++) {
    const v = ymin + ((ymax - ymin) * t) / 4;
    const yy = y(v);
    g += '<line x1="' + PL + '" y1="' + yy.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + yy.toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>';
    g += '<text x="' + (PL - 6) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="' + MUTED + '">' + fmt(v, 1) + '</text>';
  }
  const pts = vals.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); }).join(' ');
  let area = 'M' + x(0).toFixed(1) + ',' + y(vals[0]).toFixed(1);
  vals.forEach(function (v, i) { area += ' L' + x(i).toFixed(1) + ',' + y(v).toFixed(1); });
  area += ' L' + x(vals.length - 1).toFixed(1) + ',' + (H - PB) + ' L' + x(0).toFixed(1) + ',' + (H - PB) + ' Z';
  g += '<path d="' + area + '" fill="' + TEAL_LIGHT + '" opacity="0.55"/>';
  g += '<polyline points="' + pts + '" fill="none" stroke="' + TEAL_MID + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
  vals.forEach(function (v, i) {
    g += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="4" fill="#fff" stroke="' + TEAL + '" stroke-width="2"/>';
    // Put the value below the point when the point sits near the top edge,
    // so the label never collides with the axis tick labels.
    const labelY = (y(v) - PT < 22) ? (y(v) + 18) : (y(v) - 10);
    g += '<text x="' + x(i).toFixed(1) + '" y="' + labelY.toFixed(1) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + INK + '">' + fmt(v, 1) + '</text>';
    g += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="11.5" fill="' + MUTED + '">' + labels[i] + '</text>';
  });
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(s.label) + ' chart, ' + fromYear + ' to 2024">' + g + '</svg>';
}

// Vertical bar chart for a time series.
function barChart(seriesKey, fromYear, color) {
  const s = SERIES[seriesKey];
  const idx = YEARS.map(function (y, i) { return i; }).filter(function (i) { return YEARS[i] >= fromYear; });
  const vals = idx.map(function (i) { return s.values[i]; });
  const labels = idx.map(function (i) { return YEARS[i]; });
  const W = 560, H = 238, PL = 44, PR = 14, PT = 26, PB = 30;
  const max = Math.max.apply(null, vals) * 1.15;
  const slot = (W - PL - PR) / vals.length;
  const bw = Math.min(52, slot * 0.6);
  let g = '';
  for (let t = 0; t <= 4; t++) {
    const v = (max * t) / 4;
    const yy = PT + (1 - v / max) * (H - PT - PB);
    g += '<line x1="' + PL + '" y1="' + yy.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + yy.toFixed(1) + '" stroke="' + GRID + '" stroke-width="1"/>';
    g += '<text x="' + (PL - 6) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="' + MUTED + '">' + fmt(v, 1) + '</text>';
  }
  vals.forEach(function (v, i) {
    const bh = (v / max) * (H - PT - PB);
    const bx = PL + i * slot + (slot - bw) / 2;
    const by = H - PB - bh;
    g += '<rect x="' + bx.toFixed(1) + '" y="' + by.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="4" fill="' + color + '"/>';
    g += '<text x="' + (bx + bw / 2).toFixed(1) + '" y="' + (by - 6).toFixed(1) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + INK + '">' + fmt(v, 1) + '</text>';
    g += '<text x="' + (bx + bw / 2).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="11.5" fill="' + MUTED + '">' + labels[i] + '</text>';
  });
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(s.label) + ' bar chart, ' + fromYear + ' to 2024">' + g + '</svg>';
}

// Horizontal bar chart: items are {label, value, display, color?}.
function hbarChart(items, maxValue, unit) {
  const W = 560, rowH = 34, labelW = 150, valW = 74, PT = 8, PB = 6;
  const H = PT + PB + items.length * rowH;
  const barMax = W - labelW - valW - 16;
  let g = '';
  items.forEach(function (it, i) {
    const y = PT + i * rowH;
    const bw = Math.max(2, (it.value / maxValue) * barMax);
    g += '<text x="' + (labelW - 8) + '" y="' + (y + 17) + '" text-anchor="end" font-size="13" fill="' + INK + '">' + esc(it.label) + '</text>';
    g += '<rect x="' + labelW + '" y="' + (y + 6) + '" width="' + bw.toFixed(1) + '" height="15" rx="3" fill="' + (it.color || TEAL_MID) + '"/>';
    g += '<text x="' + (labelW + bw + 8).toFixed(1) + '" y="' + (y + 18) + '" font-size="12.5" font-weight="700" fill="' + INK + '">' + esc(it.display) + (unit ? ' ' + unit : '') + '</text>';
  });
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Bar chart">' + g + '</svg>';
}

/* ---------------- shared pieces ---------------- */

function kpiCard(ind, changeText, changeClass) {
  return '<div class="card kpi"><div class="kpi-label">' + esc(ind.name) + '</div>' +
    '<div class="kpi-value">' + esc(ind.value) + '</div>' +
    (changeText ? '<div class="kpi-change ' + changeClass + '">' + esc(changeText) + '</div>' : '') +
    sourceLine(ind.source, ind.year, ind.note) + '</div>';
}

function indicatorRows(list) {
  if (!list.length) return '<tr><td colspan="5" class="empty">No indicators match that search.</td></tr>';
  return list.map(function (ind) {
    return '<tr><td><strong>' + esc(ind.name) + '</strong><br><span class="pill">' + esc(ind.theme) + '</span></td>' +
      '<td class="num"><strong>' + esc(ind.value) + '</strong></td>' +
      '<td class="num">' + ind.year + '</td><td>' + esc(ind.source) + '</td><td>' + esc(ind.note) + '</td></tr>';
  }).join('');
}

function indicatorTable(list, title) {
  return '<div class="card"><h3>' + esc(title) + '</h3>' +
    '<div class="table-wrap"><table><thead><tr><th>Indicator</th><th class="num">Value</th><th class="num">Year</th><th>Source</th><th>Note</th></tr></thead>' +
    '<tbody>' + indicatorRows(list) + '</tbody></table></div></div>';
}

function provinceRows(list) {
  if (!list.length) return '<tr><td colspan="6" class="empty">No province matches that search.</td></tr>';
  const maxPop = Math.max.apply(null, PROVINCES.map(function (p) { return p.population; }));
  return list.map(function (p) {
    const w = (p.population / maxPop * 100).toFixed(0);
    return '<tr><td><strong>' + esc(p.name) + '</strong><br><span class="pill">' + esc(p.island) + '</span></td>' +
      '<td class="num"><span class="bar-track"><span class="bar-fill" style="width:' + w + '%"></span></span>' + fmt(p.population, 2) + ' m</td>' +
      '<td class="num">' + fmt(p.poverty, 1) + '%</td>' +
      '<td class="num">' + fmt(p.unemployment, 1) + '%</td>' +
      '<td class="num">' + fmt(p.hdi, 1) + '</td>' +
      '<td>BPS, 2024</td></tr>';
  }).join('');
}

function setActiveNav(route) {
  document.querySelectorAll('.main-nav a').forEach(function (a) {
    a.classList.toggle('active', a.getAttribute('data-route') === route);
  });
}

/* ---------------- routes ---------------- */

let startYear = 2019;       // year selector state for time-series charts
let comparePicked = ['DKI Jakarta', 'Jawa Barat', 'Papua']; // compare selection

function viewOverview() {
  const byId = {};
  INDICATORS.forEach(function (i) { byId[i.id] = i; });
  const top5 = PROVINCES.slice().sort(function (a, b) { return b.population - a.population; }).slice(0, 5);
  app.innerHTML =
    '<div class="page-head"><p class="eyebrow">National statistics · Indonesia</p>' +
    '<h1>Indonesia in numbers</h1>' +
    '<p>281.6 million people, 38 provinces, one clear picture. Every figure below names its source and year — start with the headlines, then dig into the economy, the population and the regions.</p></div>' +
    '<div class="grid grid-4 section">' +
    kpiCard(byId.population, '▲ 0.9% on 2023', 'up') +
    kpiCard(byId.growth, 'Real growth, 2024', 'up') +
    kpiCard(byId.poverty, '▼ 0.79 points on 2023', 'up') +
    kpiCard(byId.unemployment, '▼ 0.54 points on 2023', 'up') +
    '</div>' +
    '<div class="grid grid-2 section">' +
    '<div class="card"><p class="chart-title">Real GDP growth, 2019–2024</p><p class="chart-sub">Percent change year on year. The 2020 dip is the pandemic recession; growth has held above 5% since 2022.</p>' +
    lineChart('growth', 2019) + sourceLine('BPS', 2024, 'National accounts') + '</div>' +
    '<div class="card"><p class="chart-title">Poverty rate, 2019–2024</p><p class="chart-sub">Share of the population below the poverty line. Down to 8.57% in September 2024 — the lowest on record.</p>' +
    barChart('poverty', 2019, AMBER) + sourceLine('BPS', 2024, 'September 2024') + '</div>' +
    '</div>' +
    '<div class="section"><div class="card"><p class="chart-title">Largest provinces by population, 2024</p>' +
    '<p class="chart-sub">More than half of Indonesians live on Java. Jawa Barat alone holds about 50 million people.</p>' +
    hbarChart(top5.map(function (p) { return { label: p.name, value: p.population, display: fmt(p.population, 1) }; }), 50.35, 'million') +
    sourceLine('BPS', 2024, 'Mid-year estimates') + '</div></div>' +
    '<div class="section">' + indicatorTable(INDICATORS.slice(0, 8), 'Headline indicators') +
    '<p class="section-note">See the full table — all ' + INDICATORS.length + ' indicators with search and filtering — on the <a href="#/economy">Economy</a> page.</p></div>';
}

function yearSelectHtml() {
  let opts = '';
  YEARS.slice(0, 5).forEach(function (y) {
    opts += '<option value="' + y + '"' + (y === startYear ? ' selected' : '') + '>From ' + y + '</option>';
  });
  return '<label for="year-from">Show series from</label><select id="year-from">' + opts + '</select>';
}

function viewEconomy() {
  app.innerHTML =
    '<div class="page-head"><p class="eyebrow">Economy</p><h1>Growth, prices and trade</h1>' +
    '<p>Indonesia is the world’s 16th-largest economy. GDP grew 5.03% in 2024, inflation eased to 1.57%, and exports reached US$ 264.7 billion.</p></div>' +
    '<div class="controls">' + yearSelectHtml() + '<span class="section-note">The year selector redraws both charts below.</span></div>' +
    '<div class="grid grid-2 section">' +
    '<div class="card"><p class="chart-title">Real GDP growth</p><p class="chart-sub">Percent, year on year.</p>' +
    '<div id="chart-growth">' + lineChart('growth', startYear) + '</div>' + sourceLine('BPS', 2024, 'National accounts') + '</div>' +
    '<div class="card"><p class="chart-title">Consumer price inflation</p><p class="chart-sub">Percent, year on year. The 2022 spike followed the fuel-price adjustment.</p>' +
    '<div id="chart-inflation">' + lineChart('inflation', startYear) + '</div>' + sourceLine('BPS', 2024, 'December 2024') + '</div>' +
    '</div>' +
    '<div class="grid grid-2 section">' +
    '<div class="card"><p class="chart-title">GDP per capita</p><p class="chart-sub">Current US dollars.</p>' +
    barChart('gdpPc', startYear, TEAL_MID) + sourceLine('World Bank', 2024, 'World Development Indicators') + '</div>' +
    '<div class="card"><p class="chart-title">Exports of goods</p><p class="chart-sub">Indonesia’s exports hit US$ 264.7 billion in 2024, with coal, palm oil and nickel products among the largest items.</p>' +
    '<p style="font-size:15px">Coal, palm oil, nickel and electronics lead a broad export mix. The trade surplus has run every year since 2020.</p>' +
    sourceLine('BPS', 2024, 'Full year 2024') + '</div>' +
    '</div>' +
    '<div class="section"><div class="controls"><label for="ind-search">Search indicators</label>' +
    '<input type="search" id="ind-search" placeholder="Try “inflation”, “GDP”, “literacy”…">' +
    '<label for="ind-theme">Theme</label><select id="ind-theme"><option value="">All themes</option>' +
    ['Economy', 'Population', 'Health', 'Education', 'Employment'].map(function (t) { return '<option>' + t + '</option>'; }).join('') +
    '</select></div>' +
    '<div id="ind-table">' + indicatorTable(INDICATORS, 'All indicators — ' + INDICATORS.length + ' figures') + '</div></div>';

  document.getElementById('year-from').addEventListener('change', function (e) {
    startYear = Number(e.target.value);
    document.getElementById('chart-growth').innerHTML = lineChart('growth', startYear);
    document.getElementById('chart-inflation').innerHTML = lineChart('inflation', startYear);
  });
  const search = document.getElementById('ind-search');
  const theme = document.getElementById('ind-theme');
  const applyFilter = function () {
    const q = search.value.trim().toLowerCase();
    const t = theme.value;
    const list = INDICATORS.filter(function (ind) {
      return (!t || ind.theme === t) &&
        (!q || (ind.name + ' ' + ind.value + ' ' + ind.source).toLowerCase().indexOf(q) !== -1);
    });
    document.getElementById('ind-table').innerHTML = indicatorTable(list, 'All indicators — ' + list.length + ' of ' + INDICATORS.length + ' shown');
  };
  search.addEventListener('input', applyFilter);
  theme.addEventListener('change', applyFilter);
}

function viewPopulation() {
  app.innerHTML =
    '<div class="page-head"><p class="eyebrow">Population</p><h1>281.6 million people</h1>' +
    '<p>Indonesia is the world’s fourth most populous country. The population grows by about 2–3 million a year, the median age is 30.1, and 58.6% now live in towns and cities.</p></div>' +
    '<div class="controls">' + yearSelectHtml() + '</div>' +
    '<div class="grid grid-2 section">' +
    '<div class="card"><p class="chart-title">Population, 2019–2024</p><p class="chart-sub">Millions, mid-year estimates.</p>' +
    '<div id="chart-pop">' + lineChart('population', startYear) + '</div>' + sourceLine('BPS', 2024, 'Mid-year estimates') + '</div>' +
    '<div class="card"><p class="chart-title">Population by province</p><p class="chart-sub">Millions, 2024. Java’s three big provinces hold over 130 million people between them.</p>' +
    hbarChart(PROVINCES.slice().sort(function (a, b) { return b.population - a.population; }).slice(0, 8).map(function (p) { return { label: p.name, value: p.population, display: fmt(p.population, 1) }; }), 50.35, 'million') +
    sourceLine('BPS', 2024, 'Mid-year estimates') + '</div>' +
    '</div>' +
    '<div class="grid grid-4 section">' +
    '<div class="card kpi"><div class="kpi-label">Median age</div><div class="kpi-value">30.1 <small>years</small></div>' + sourceLine('BPS', 2024) + '</div>' +
    '<div class="card kpi"><div class="kpi-label">Urban share</div><div class="kpi-value">58.6<small>%</small></div>' + sourceLine('BPS', 2024) + '</div>' +
    '<div class="card kpi"><div class="kpi-label">Density</div><div class="kpi-value">147 <small>/ km²</small></div>' + sourceLine('BPS', 2024) + '</div>' +
    '<div class="card kpi"><div class="kpi-label">Life expectancy</div><div class="kpi-value">74.2 <small>years</small></div>' + sourceLine('BPS', 2024) + '</div>' +
    '</div>' +
    '<div class="section"><div class="card"><h3>How the population is spread</h3>' +
    '<p>Java — 7% of the land — holds 56% of the people. Kalimantan, the largest island, holds under 7%. That imbalance shapes everything from infrastructure spending to where new universities open.</p>' +
    sourceLine('BPS', 2024, 'Mid-year estimates') + '</div></div>';
  document.getElementById('year-from').addEventListener('change', function (e) {
    startYear = Number(e.target.value);
    document.getElementById('chart-pop').innerHTML = lineChart('population', startYear);
  });
}

function viewRegions() {
  app.innerHTML =
    '<div class="page-head"><p class="eyebrow">Regions</p><h1>Every province, side by side</h1>' +
    '<p>Twelve provinces shown here — from Jawa Barat’s 50 million people to Papua’s 1 million — with population, poverty, unemployment and human development. Search to find one fast.</p></div>' +
    '<div class="controls"><label for="prov-search">Search provinces</label>' +
    '<input type="search" id="prov-search" placeholder="Try “Java”, “Papua”, “Sulawesi”…"></div>' +
    '<div class="section"><div class="card"><h3>Provinces — 2024</h3>' +
    '<div class="table-wrap"><table><thead><tr><th>Province</th><th class="num">Population</th><th class="num">Poverty</th><th class="num">Unemployment</th><th class="num">HDI</th><th>Source</th></tr></thead>' +
    '<tbody id="prov-body">' + provinceRows(PROVINCES) + '</tbody></table></div>' +
    '<p class="src">Population: BPS mid-year estimate 2024. Poverty: BPS, September 2024. Unemployment: BPS, August 2024. HDI: BPS, 2024. Figures rounded.</p></div></div>' +
    '<div class="section"><div class="card"><h3>The gap that matters</h3>' +
    '<p>Poverty in Papua (34.5%) is more than eight times Jakarta’s (4.1%), while Jakarta’s HDI (83.0) leads the country and Papua’s (63.0) trails it. Use <a href="#/compare">Compare</a> to put any three provinces head to head.</p></div></div>';
  document.getElementById('prov-search').addEventListener('input', function (e) {
    const q = e.target.value.trim().toLowerCase();
    const list = PROVINCES.filter(function (p) {
      return !q || (p.name + ' ' + p.island).toLowerCase().indexOf(q) !== -1;
    });
    document.getElementById('prov-body').innerHTML = provinceRows(list);
  });
}

function viewCompare() {
  const picked = PROVINCES.filter(function (p) { return comparePicked.indexOf(p.name) !== -1; });
  const chips = PROVINCES.map(function (p) {
    const on = comparePicked.indexOf(p.name) !== -1;
    return '<button class="chip" data-prov="' + esc(p.name) + '" aria-pressed="' + on + '">' + esc(p.name) + '</button>';
  }).join('');
  const metricCard = function (key, title, unit, decimals) {
    const items = picked.map(function (p) { return { label: p.name, value: p[key], display: fmt(p[key], decimals) }; });
    const max = Math.max.apply(null, items.map(function (i) { return i.value; })) * 1.1;
    return '<div class="card"><p class="chart-title">' + title + '</p><p class="chart-sub">' + unit + ', 2024.</p>' +
      hbarChart(items, max, '') + sourceLine('BPS', 2024) + '</div>';
  };
  let table = '';
  if (picked.length) {
    table = '<div class="section"><div class="card"><h3>Head to head</h3><div class="table-wrap"><table><thead><tr><th>Measure</th>' +
      picked.map(function (p) { return '<th class="num">' + esc(p.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      '<tr><td>Population</td>' + picked.map(function (p) { return '<td class="num">' + fmt(p.population, 2) + ' m</td>'; }).join('') + '</tr>' +
      '<tr><td>Poverty rate</td>' + picked.map(function (p) { return '<td class="num">' + fmt(p.poverty, 1) + '%</td>'; }).join('') + '</tr>' +
      '<tr><td>Unemployment rate</td>' + picked.map(function (p) { return '<td class="num">' + fmt(p.unemployment, 1) + '%</td>'; }).join('') + '</tr>' +
      '<tr><td>Human Development Index</td>' + picked.map(function (p) { return '<td class="num">' + fmt(p.hdi, 1) + '</td>'; }).join('') + '</tr>' +
      '</tbody></table></div>' + sourceLine('BPS', 2024, 'Population mid-year; poverty September; unemployment August; HDI 2024') + '</div></div>';
  } else {
    table = '<div class="section"><p class="empty">Pick at least one province above to compare.</p></div>';
  }
  app.innerHTML =
    '<div class="page-head"><p class="eyebrow">Compare</p><h1>Provinces head to head</h1>' +
    '<p>Pick up to three provinces and see their population, poverty, unemployment and human development side by side.</p></div>' +
    '<div class="controls"><span class="section-note">Choose up to 3:</span></div>' +
    '<div class="chip-row" id="compare-chips">' + chips + '</div>' +
    (picked.length ? '<div class="grid grid-2 section">' +
      metricCard('population', 'Population', 'Millions', 2) +
      metricCard('poverty', 'Poverty rate', 'Percent of population', 1) +
      metricCard('unemployment', 'Unemployment rate', 'Percent of labour force', 1) +
      metricCard('hdi', 'Human Development Index', 'Index, 0–100', 1) +
      '</div>' + table : table);
  document.querySelectorAll('#compare-chips .chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      const name = chip.getAttribute('data-prov');
      const i = comparePicked.indexOf(name);
      if (i !== -1) { comparePicked.splice(i, 1); }
      else if (comparePicked.length < 3) { comparePicked.push(name); }
      else { return; }
      viewCompare();
    });
  });
}

/* ---------------- router ---------------- */

const ROUTES = {
  '': viewOverview,
  'economy': viewEconomy,
  'population': viewPopulation,
  'regions': viewRegions,
  'compare': viewCompare,
};

function route() {
  const hash = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  const fn = ROUTES[hash] || viewOverview;
  setActiveNav(ROUTES[hash] ? hash : '');
  fn();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();
