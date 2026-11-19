/* Calendário para os campos de data do plano de ação (checklist e visita técnica).
   O campo continua aceitando digitação (dd/mm/aaaa); o calendário só preenche o mesmo campo. */
(function(){
  const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const pad = n => String(n).padStart(2, '0');
  const parse = s => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || ''); return m ? new Date(+m[3], +m[2]-1, +m[1]) : null; };
  const fmt = d => `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  const same = (a, b) => a && b && a.toDateString() === b.toDateString();
  let pop = null, input = null, view = null;

  function close(){ if (pop){ pop.remove(); pop = null; input = null; } }
  function minDate(inp){
    if (inp.dataset.field !== 'end') return null;
    const wrap = inp.closest('.sheet-panel, .body, body');
    const start = wrap && wrap.querySelector('input.date-input[data-field="start"]');
    return start ? parse(start.value) : null;
  }
  function draw(){
    const sel = parse(input.value), today = new Date(), min = minDate(input);
    const y = view.getFullYear(), m = view.getMonth();
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    let cells = '';
    for (let k = 0; k < 42; k++){
      const d = new Date(y, m, k - first + 1);
      if (k >= 35 && d.getMonth() !== m) break;
      const dis = min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate());
      cells += `<button type="button" data-d="${fmt(d)}" class="${d.getMonth()!==m?'out':''} ${same(d,today)?'today':''} ${same(d,sel)?'sel':''}" ${dis?'disabled':''}>${d.getDate()}</button>`;
    }
    pop.innerHTML = `<div class="ap-cal-head"><button type="button" data-nav="-1" aria-label="Mês anterior">‹</button><b>${MESES[m]} ${y}</b><button type="button" data-nav="1" aria-label="Próximo mês">›</button></div>
      <div class="ap-cal-grid">${['D','S','T','Q','Q','S','S'].map(w => `<span>${w}</span>`).join('')}${cells}</div>
      <div class="ap-cal-foot"><button type="button" data-today>Hoje</button><button type="button" data-clear>Limpar</button></div>`;
  }
  function open(inp){
    if (input === inp) return;
    close();
    input = inp;
    const sel = parse(inp.value) || minDate(inp) || new Date();
    view = new Date(sel.getFullYear(), sel.getMonth(), 1);
    pop = document.createElement('div');
    pop.className = 'ap-cal';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Escolher data');
    document.body.appendChild(pop);
    draw();
    place();
  }
  function place(){
    if (!pop || !input) return;
    const r = input.getBoundingClientRect(), h = pop.offsetHeight, w = pop.offsetWidth;
    const below = window.innerHeight - r.bottom, above = r.top;
    const top = (below >= h + 12 || below >= above) ? r.bottom + 6 : r.top - h - 6;
    pop.style.top = Math.max(8, Math.min(top, window.innerHeight - h - 8)) + 'px';
    pop.style.left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) + 'px';
  }
  window.addEventListener('resize', place);
  document.addEventListener('scroll', place, true);
  function set(val){
    input.value = val;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    close();
  }
  document.addEventListener('click', e => {
    if (pop && pop.contains(e.target)){
      e.stopPropagation();
      const nav = e.target.closest('[data-nav]');
      if (nav){ view = new Date(view.getFullYear(), view.getMonth() + (+nav.dataset.nav), 1); return draw(); }
      const d = e.target.closest('[data-d]'); if (d && !d.disabled) return set(d.dataset.d);
      if (e.target.closest('[data-today]')) return set(fmt(new Date()));
      if (e.target.closest('[data-clear]')) return set('');
      return;
    }
    const wrap = e.target.closest('.date-input-wrap');
    if (wrap && (e.target.closest('svg') || e.target.matches('input.date-input'))){
      if (e.target.closest('svg')) e.stopPropagation();
      const inp = wrap.querySelector('input.date-input');
      if (inp) return open(inp);
    }
    if (!wrap) close();
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
