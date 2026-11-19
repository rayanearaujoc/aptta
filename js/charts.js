/* =========================================================
   Aptta — gráficos em SVG puro (linha, barras, rosca, medidor, sparkline)
   ========================================================= */
const C = { green:'#1D9E75', dark:'#0F6E56', tint:'#D3EBE0', red:'#B3352F', grid:'#ECEEEA', faint:'#9AA19D' };

/* curva suave passando pelos pontos */
function smoothPath(pts){
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++){
    const [x0,y0] = pts[i], [x1,y1] = pts[i+1], cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

/* linhas: series = [{values, color, area}] */
function lineChart({labels, series, max, height = 200, width = 560, ticks = 4, fmt = v => v}){
  const W = width, H = height, L = 40, R = 8, T = 10, B = 26;
  const iw = W - L - R, ih = H - T - B, n = labels.length;
  const x = i => L + (n === 1 ? iw / 2 : i * iw / (n - 1));
  const y = v => T + ih - (v / max) * ih;
  let g = '';
  for (let k = 0; k <= ticks; k++){
    const v = max * k / ticks, yy = y(v).toFixed(1);
    g += `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="${C.grid}"/>`;
    g += `<text x="${L-10}" y="${+yy+3}" text-anchor="end">${fmt(v)}</text>`;
  }
  labels.forEach((l,i) => g += `<text x="${x(i)}" y="${H-6}" text-anchor="middle">${l}</text>`);
  series.forEach(s => {
    const pts = s.values.map((v,i) => [+x(i).toFixed(1), +y(v).toFixed(1)]);
    const d = smoothPath(pts);
    if (s.area) g += `<path d="${d} L${pts[pts.length-1][0]},${T+ih} L${pts[0][0]},${T+ih} Z" fill="${s.color}" opacity=".08"/>`;
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linecap="round"${s.dash ? ' stroke-dasharray="5 5"' : ''}/>`;
    if (s.dots) pts.forEach(([px,py]) => g += `<circle cx="${px}" cy="${py}" r="3.5" fill="#fff" stroke="${s.color}" stroke-width="2"/>`);
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

/* barras agrupadas: series = [{values, color}] */
function barChart({labels, series, max, height = 210, width = 560, ticks = 4, fmt = v => v}){
  const W = width, H = height, L = 36, R = 4, T = 10, B = 26;
  const iw = W - L - R, ih = H - T - B, n = labels.length, slot = iw / n;
  const bw = Math.min(W > 800 ? 34 : 16, slot / (series.length + 1.6)), gap = 6;
  const y = v => T + ih - (v / max) * ih;
  let g = '';
  for (let k = 0; k <= ticks; k++){
    const v = max * k / ticks, yy = y(v).toFixed(1);
    g += `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="${C.grid}"/>`;
    g += `<text x="${L-8}" y="${+yy+3}" text-anchor="end">${fmt(v)}</text>`;
  }
  labels.forEach((l,i) => {
    const groupW = series.length * bw + (series.length - 1) * gap;
    const x0 = L + i * slot + (slot - groupW) / 2;
    series.forEach((s,j) => {
      const v = s.values[i], yy = y(v), h = T + ih - yy;
      g += `<rect x="${(x0 + j*(bw+gap)).toFixed(1)}" y="${yy.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${s.color}"/>`;
    });
    g += `<text x="${(L + i*slot + slot/2).toFixed(1)}" y="${H-6}" text-anchor="middle">${l}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

/* rosca: parts = [{value, color}] */
function donut({parts, size = 150, stroke = 26, center = ''}){
  const r = (size - stroke) / 2, c = size / 2, circ = 2 * Math.PI * r;
  const total = parts.reduce((s,p) => s + p.value, 0);
  let off = 0, g = '';
  parts.forEach(p => {
    const len = circ * p.value / total;
    g += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${p.color}" stroke-width="${stroke}" stroke-dasharray="${len.toFixed(2)} ${(circ-len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})"/>`;
    off += len;
  });
  if (center) g += `<text x="${c}" y="${c+5}" text-anchor="middle" style="font-size:15px;font-weight:700;fill:#181B19">${center}</text>`;
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">${g}</svg>`;
}

/* medidor circular de progresso */
function gauge({pct, size = 150, stroke = 16}){
  const r = (size - stroke) / 2, c = size / 2, circ = 2 * Math.PI * r, len = circ * pct / 100;
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${C.tint}" stroke-width="${stroke}"/>
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${C.green}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${len.toFixed(2)} ${circ.toFixed(2)}" transform="rotate(-90 ${c} ${c})"/>
    <text x="${c}" y="${c+7}" text-anchor="middle" style="font-size:22px;font-weight:700;fill:#181B19">${pct}%</text>
  </svg>`;
}

/* sparkline */
function sparkline(values, color = C.green, w = 96, h = 40){
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v,i) => [+(i * w / (values.length - 1)).toFixed(1), +(h - 4 - (v - min) / (max - min || 1) * (h - 8)).toFixed(1)]);
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><path d="${smoothPath(pts)}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/></svg>`;
}

/* ===== Evolução: linha com rótulos em cada ponto e destaque no último ===== */
let EVO_ID = 0;
function evoLine({labels, values, min = 0, max = 10, fmt = v => v, height = 260, width = 560, color = '#1D9E75', dark = '#0F6E56', ticks = 4}){
  const id = 'evo' + (++EVO_ID);
  const W = width, H = height, L = 34, R = 28, T = 40, B = 30;
  const iw = W - L - R, ih = H - T - B, n = values.length;
  const x = i => L + (n === 1 ? iw / 2 : i * iw / (n - 1));
  const y = v => T + ih - (v - min) / (max - min) * ih;
  const pts = values.map((v, i) => [x(i), y(v)]);
  const line = smoothPath(pts);
  const area = `${line} L${x(n-1)},${T+ih} L${x(0)},${T+ih} Z`;
  let g = '';
  for (let k = 0; k <= ticks; k++){
    const v = min + (max - min) * k / ticks, yy = y(v);
    g += `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="#ECEEEA" ${k ? 'stroke-dasharray="3 4"' : ''}/>`;
    g += `<text x="${L-10}" y="${yy+4}" text-anchor="end" font-size="11" fill="#9AA19D">${fmt(v)}</text>`;
  }
  const first = y(values[0]);
  const base = `<line x1="${L}" x2="${W-R}" y1="${first}" y2="${first}" stroke="${dark}" stroke-opacity=".35" stroke-dasharray="5 5"/>
    <text x="${W-R}" y="${first+16}" text-anchor="end" font-size="10.5" font-weight="600" fill="${dark}" fill-opacity=".7">início ${fmt(values[0])}</text>`;
  const dots = pts.map(([px, py], i) => {
    const last = i === n - 1, v = fmt(values[i]);
    if (last){
      const w = 12 + v.length * 8;
      return `<line x1="${px}" x2="${px}" y1="${py}" y2="${T+ih}" stroke="${dark}" stroke-opacity=".25"/>
        <circle cx="${px}" cy="${py}" r="11" fill="${color}" fill-opacity=".18"/>
        <circle cx="${px}" cy="${py}" r="6" fill="${dark}" stroke="#fff" stroke-width="2.5"/>
        <rect x="${px - w/2}" y="${py - 38}" width="${w}" height="24" rx="12" fill="${dark}"/>
        <text x="${px}" y="${py - 22}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#fff">${v}</text>`;
    }
    return `<circle cx="${px}" cy="${py}" r="4.5" fill="#fff" stroke="${color}" stroke-width="2.5"/>
      <text x="${px}" y="${py - 13}" text-anchor="middle" font-size="12" font-weight="700" fill="#4D534F">${v}</text>`;
  }).join('');
  const lbl = labels.map((l, i) => `<text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="11.5" font-weight="${i===n-1?700:500}" fill="${i===n-1?'#181B19':'#9AA19D'}">${l}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" style="display:block;overflow:visible">
    <defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".32"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${g}${base}<path d="${area}" fill="url(#${id})"/><path d="${line}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>${dots}${lbl}</svg>`;
}

/* ===== Evolução: barras que escurecem com o tempo, valor em cada uma e ganho entre elas ===== */
function evoBars({labels, values, min = 0, max = 100, fmt = v => v, height = 260, width = 560, ticks = 4}){
  const id = 'evb' + (++EVO_ID);
  const W = width, H = height, L = 40, R = 12, T = 40, B = 30;
  const iw = W - L - R, ih = H - T - B, n = values.length, slot = iw / n;
  const bw = Math.min(72, slot * 0.5);
  const y = v => T + ih - (v - min) / (max - min) * ih;
  const ramp = ['#9FD3BE', '#5DBB97', '#1D9E75', '#0F6E56'];
  const col = i => ramp[Math.round(i * (ramp.length - 1) / Math.max(1, n - 1))];
  let g = '';
  for (let k = 0; k <= ticks; k++){
    const v = min + (max - min) * k / ticks, yy = y(v);
    g += `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="#ECEEEA" ${k ? 'stroke-dasharray="3 4"' : ''}/>`;
    g += `<text x="${L-10}" y="${yy+4}" text-anchor="end" font-size="11" fill="#9AA19D">${fmt(v)}</text>`;
  }
  let bars = '', gains = '';
  values.forEach((v, i) => {
    const cx = L + slot * i + slot / 2, top = y(v), last = i === n - 1;
    bars += `<rect x="${cx - bw/2}" y="${top}" width="${bw}" height="${T + ih - top}" rx="10" fill="${col(i)}"/>`;
    bars += last
      ? `<rect x="${cx - 26}" y="${top - 32}" width="52" height="24" rx="12" fill="#0F6E56"/><text x="${cx}" y="${top - 16}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#fff">${fmt(v)}</text>`
      : `<text x="${cx}" y="${top - 10}" text-anchor="middle" font-size="12" font-weight="700" fill="#4D534F">${fmt(v)}</text>`;
    bars += `<text x="${cx}" y="${H-8}" text-anchor="middle" font-size="11.5" font-weight="${last?700:500}" fill="${last?'#181B19':'#9AA19D'}">${labels[i]}</text>`;
    if (i > 0){
      const d = v - values[i-1], gx = L + slot * i, gy = (y(v) + y(values[i-1])) / 2 - 2;
      if (d) gains += `<text x="${gx}" y="${gy}" text-anchor="middle" font-size="11" font-weight="700" fill="${d > 0 ? '#0F6E56' : '#B3352F'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d)}</text>`;
    }
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" style="display:block;overflow:visible">${g}${bars}${gains}</svg>`;
}

/* ===== Desempenho em relação à meta: linha da meta + quanto cada resultado ficou acima ou abaixo ===== */
function metaChart({labels, values, meta, min, max, fmt = v => v, delta = v => v, height = 300, width = 640, ticks = 4}){
  const W = width, H = height, L = 44, R = 70, T = 34, B = 34;
  const iw = W - L - R, ih = H - T - B, n = values.length;
  const slot = iw / n;
  const x = i => L + slot * i + slot / 2;
  const y = v => T + ih - (v - min) / (max - min) * ih;
  const ym = y(meta);
  const GOOD = '#0F6E56', BAD = '#B3352F';
  let g = '';
  for (let k = 0; k <= ticks; k++){
    const v = min + (max - min) * k / ticks, yy = y(v);
    g += `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="#ECEEEA"/>`;
    g += `<text x="${L-10}" y="${yy+4}" text-anchor="end" font-size="11" fill="#9AA19D">${fmt(v)}</text>`;
  }
  const zones = `<rect x="${L}" y="${T}" width="${iw}" height="${ym - T}" fill="#EBF5F0" opacity=".55"/>
    <rect x="${L}" y="${ym}" width="${iw}" height="${T + ih - ym}" fill="#FBEDEC" opacity=".55"/>`;
  const trend = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
  const metaLine = `<line x1="${L}" x2="${W-R}" y1="${ym}" y2="${ym}" stroke="${GOOD}" stroke-width="2"/>
    <rect x="${W-R+6}" y="${ym-12}" width="${R-8}" height="24" rx="12" fill="${GOOD}"/>
    <text x="${W-R+6+(R-8)/2}" y="${ym+4}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">Meta ${fmt(meta)}</text>`;
  let pts = '';
  values.forEach((v, i) => {
    const px = x(i), py = y(v), d = v - meta, ok = d >= 0, c = ok ? GOOD : BAD;
    const up = py <= ym;
    pts += `<line x1="${px}" x2="${px}" y1="${ym}" y2="${py}" stroke="${c}" stroke-width="6" stroke-linecap="round" opacity=".22"/>`;
    pts += `<circle cx="${px}" cy="${py}" r="7" fill="${c}" stroke="#fff" stroke-width="3"/>`;
    const ly = up ? py - 16 : py + 26;
    pts += `<text x="${px}" y="${ly}" text-anchor="middle" font-size="13" font-weight="700" fill="#181B19">${fmt(v)}</text>`;
    pts += `<text x="${px}" y="${up ? ly - 15 : ly + 15}" text-anchor="middle" font-size="11" font-weight="700" fill="${c}">${d === 0 ? 'na meta' : (d > 0 ? '+' : '−') + delta(Math.abs(d))}</text>`;
    pts += `<text x="${px}" y="${H-10}" text-anchor="middle" font-size="11.5" font-weight="${i===n-1?700:500}" fill="${i===n-1?'#181B19':'#9AA19D'}">${labels[i]}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Resultados em relação à meta" style="display:block;overflow:visible">
    ${zones}${g}<path d="${trend}" fill="none" stroke="#9AA19D" stroke-width="1.5" stroke-dasharray="4 4"/>${metaLine}${pts}</svg>`;
}

/* ===== Desempenho: linha simples, com meta opcional tracejada ===== */
function perfLine({labels, values, meta = null, min, max, fmt = v => v, height = 280, width = 640, ticks = 4, color = '#1D9E75'}){
  const W = width, H = height, L = 44, R = meta !== null ? 64 : 20, T = 30, B = 32;
  const iw = W - L - R, ih = H - T - B, n = values.length;
  const x = i => L + (n === 1 ? iw / 2 : i * iw / (n - 1));
  const y = v => T + ih - (v - min) / (max - min) * ih;
  let g = '';
  for (let k = 0; k <= ticks; k++){
    const v = min + (max - min) * k / ticks, yy = y(v);
    g += `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="#ECEEEA"/>`;
    g += `<text x="${L-10}" y="${yy+4}" text-anchor="end" font-size="11" fill="#9AA19D">${fmt(v)}</text>`;
  }
  const pts = values.map((v, i) => [x(i), y(v)]);
  const line = `<path d="${smoothPath(pts)}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
  let m = '';
  if (meta !== null){
    const ym = y(meta);
    m = `<line x1="${L}" x2="${W-R}" y1="${ym}" y2="${ym}" stroke="#4D534F" stroke-width="1.5" stroke-dasharray="6 5"/>
      <text x="${W-R+8}" y="${ym-3}" font-size="10.5" font-weight="600" fill="#6B726E">Meta</text>
      <text x="${W-R+8}" y="${ym+11}" font-size="11.5" font-weight="700" fill="#181B19">${fmt(meta)}</text>`;
  }
  const dots = pts.map(([px, py], i) => `<circle cx="${px}" cy="${py}" r="4.5" fill="#fff" stroke="${color}" stroke-width="2.5"/>
    <text x="${px}" y="${py - 12}" text-anchor="middle" font-size="12" font-weight="700" fill="#181B19">${fmt(values[i])}</text>
    <text x="${px}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#9AA19D">${labels[i]}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" style="display:block;overflow:visible;font-family:'Open Sans',Arial,sans-serif">${g}${m}${line}${dots}</svg>`;
}

/* ===== tendência mínima: uma linha fina mostrando se subiu ou desceu ===== */
function trendLine(values, color = '#1D9E75', w = 44, h = 16){
  const mn = Math.min(...values), mx = Math.max(...values), n = values.length;
  const pts = values.map((v, i) => `${(i * (w - 4) / (n - 1) + 2).toFixed(1)},${(h - 2 - (mx === mn ? (h - 4) / 2 : (v - mn) / (mx - mn) * (h - 4))).toFixed(1)}`).join(' ');
  return `<svg class="trend" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
