/* =========================================================
   Aptta — shell: navegação, Início (dashboard), Clientes
   ========================================================= */
const app = document.getElementById('app');
const content = document.getElementById('content');
const icons = () => { if (window.lucide) lucide.createIcons(); };

const PAGES = {
  'inicio':          { title:'Início', render: renderInicio },
  'clientes':        { title:'Clientes', render: renderClientes, after: wireClientes },
  'visitas-hist':    { title:'Histórico de visitas', icon:'history', desc:'Visitas técnicas e checklists já realizados, com os relatórios.' },
  'visitas-modelos': { title:'Modelos de checklist', icon:'list-checks', desc:'Crie e edite os modelos usados nas visitas.' },
  'calendario':      { title:'Calendário', render: renderCalendario, after: wireCalendario },
  'planos':          { title:'Planos de ação', icon:'list-todo', desc:'Painel dos planos de ação de todos os clientes: abertos, vencidos e concluídos.' },
  'financeiro':      { title:'Financeiro', icon:'wallet', desc:'Recebimentos, despesas e cobranças em um só lugar.' },
  'cfg':             { title:'Configurações', icon:'settings', desc:'Perfil, plano, notificações e integrações da sua conta.' },
};

function placeholder(p){
  return `<div class="card"><div class="placeholder">
    <div class="ic"><i data-lucide="${p.icon}"></i></div>
    <h3>${p.title}</h3><p>${p.desc}</p></div></div>`;
}

function setActive(page){
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.subnav a').forEach(a => a.classList.remove('active'));
  const top = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (top) top.classList.add('active');
  const sub = document.querySelector(`.subnav a[data-page="${page}"]`);
  if (sub){
    sub.classList.add('active');
    const parent = sub.parentElement.previousElementSibling;
    parent.classList.add('active','open');
  }
}

function go(page){
  const p = PAGES[page]; if (!p) return;
  document.getElementById('pageTitle').textContent = p.title;
  app.classList.toggle('hide-topsearch', page === 'clientes' || page === 'calendario');
  content.innerHTML = p.render ? p.render() : placeholder(p);
  setActive(page);
  app.classList.remove('nav-open');
  window.scrollTo(0,0);
  if (p.after) p.after();
  icons();
}

/* símbolo da marca, para usar esmaecido no fundo */
const MARK = (cls, fill) => `<svg class="${cls}" viewBox="0 0 62 62" aria-hidden="true"><path fill="${fill}" d="M51.334 0C57.0037 0.00020936 61.5996 4.59684 61.5996 10.2666V61.5986H43.8672C38.1973 61.5986 33.6006 57.002 33.6006 51.332V25.666H0.000976562V9.1416C0.00118129 4.09287 4.09478 0 9.14355 0H51.334ZM26.0137 48.9902C26.0137 55.953 20.369 61.5975 13.4062 61.5977H0V45.5908C3.00486e-05 38.628 5.64465 32.9835 12.6074 32.9834H26.0137V48.9902Z"/></svg>`;

/* ================= INÍCIO ================= */
function renderInicio(){
  const proximas = [
    { i:0, tipo:'Visita técnica', desc:'Retorno: conferir os planos de ação da cozinha e da câmara fria.', feitos:3, total:5, data:'Hoje, 14h' },
    { i:2, tipo:'Checklist', desc:'Checklist padrão de limpeza. 1 plano de ação vencido.', feitos:1, total:4, data:'Qui, 19/11 · 10h' },
    { i:6, tipo:'Checklist', desc:'Auditoria de boas práticas da cantina.', feitos:4, total:4, data:'Sex, 20/11 · 9h' },
    { i:4, tipo:'Visita técnica', desc:'Primeira visita do mês. Partir da última visita.', feitos:2, total:6, data:'Seg, 23/11 · 14h' },
  ];
  const tipos = [['Padaria e confeitaria',3],['Restaurante',2],['Lanchonete',2],['Pizzaria',1],['Cantina escolar',1],['Outros',4]];
  const tmax = Math.max(...tipos.map(t => t[1]));
  return `<div class="dash home">

    <div class="hero col-12 h-hero">
      ${MARK('mark','#fff')}
      <div class="hero-top">
        <div><h3>Você tem 3 visitas esta semana</h3><p>A próxima é hoje, às 14h, na Padaria Central.</p></div>
        <div class="hero-actions"><button class="btn btn-light btn-sm" data-nova-visita-home><i data-lucide="plus"></i>Nova visita</button></div>
      </div>
    </div>

    <div class="col-12 mini-row h-kpis kpi3">
      <div class="card mini-kpi is-link" data-page="clientes" role="link" tabindex="0" aria-label="Ver clientes ativos"><i data-lucide="arrow-up-right" class="kpi-go"></i><div><div class="lbl">Clientes ativos</div><div class="val">10</div><div class="meta">de 13 na carteira</div></div></div>
      <div class="card mini-kpi"><div><div class="lbl">Visitas no mês</div><div class="val">12</div><div class="meta"><span class="trend-up">+3</span> que outubro</div></div></div>
      <div class="card mini-kpi is-link" data-page="planos" role="link" tabindex="0" aria-label="Ver planos vencidos"><i data-lucide="arrow-up-right" class="kpi-go"></i><div><div class="lbl">Planos vencidos</div><div class="val" style="color:var(--danger)">2</div><div class="meta">precisam de atenção</div></div></div>
    </div>

    <div class="card col-8 h-prox">
      <div class="card-head"><div><div class="card-title">Próximas visitas</div><div class="card-sub">Agenda dos próximos 7 dias</div></div><button class="btn btn-outline btn-sm" data-page="calendario">Ver calendário</button></div>
      <div class="next-list">${proximas.map(v => { const c = CLIENTES[v.i]; return `
        <div class="next-row" data-idx="${v.i}">
          <div class="next-ava">${clientFace(c)}</div>
          <div class="next-txt"><b>${c.n}</b><small>${v.tipo}</small></div>
          <span class="next-when">${v.data}</span>
          <i data-lucide="chevron-right"></i>
        </div>`; }).join('')}</div>
    </div>

    <div class="card col-4 gauge-center h-gauge">
      <div class="card-head" style="margin-bottom:8px"><div style="text-align:left"><div class="card-title">Planos de ação</div><div class="card-sub">Toda a carteira</div></div><button class="btn btn-ghost btn-sm" data-page="planos">Ver planos</button></div>
      ${gauge({pct:68})}
      <div class="pct">Concluídos <b>17 de 25</b></div>
    </div>

    <div class="card col-8 h-vis">
      <div class="card-head"><div><div class="card-title">Visitas realizadas</div><div class="card-sub">Por semana, em novembro</div></div>
        <div class="legend"><span><i style="background:${C.green}"></i>Visita técnica</span><span><i style="background:${C.dark}"></i>Checklist</span></div></div>
      <div class="chart">${barChart({width: Math.max(300, Math.round(content.clientWidth * (window.innerWidth > 960 ? 0.64 : 1)) - 48), height: 190, labels:['Sem 1','Sem 2','Sem 3','Sem 4'], max:4, ticks:4, fmt:v => v, series:[{values:[2,2,1,1], color:C.green},{values:[1,2,0,2], color:C.dark}]})}</div>
    </div>

    <div class="card col-4 h-quick">
      <div class="card-head"><div><div class="card-title">Ações rápidas</div><div class="card-sub">O que você mais faz no dia a dia</div></div></div>
      <div class="quick-grid">
        <button class="quick" data-page="calendario"><span class="qi"><i data-lucide="calendar-plus"></i></span><b>Agendar visita</b></button>
        <button class="quick" data-novo-cliente><span class="qi"><i data-lucide="user-plus"></i></span><b>Cadastrar cliente</b></button>
        <button class="quick" data-page="financeiro"><span class="qi"><i data-lucide="receipt"></i></span><b>Registrar cobrança</b></button>
        <button class="quick" data-page="financeiro"><span class="qi"><i data-lucide="wallet"></i></span><b>Lançar despesa</b></button>
      </div>
    </div>

  </div>`;
}

/* ================= CALENDÁRIO ================= */
/* hoje: 18/11/2026. tipo: v = visita técnica, c = checklist */
const AGENDA = [
  {d:'2026-11-03', h:'9h',  i:5,  k:'v'}, {d:'2026-11-05', h:'10h', i:6,  k:'c'},
  {d:'2026-11-06', h:'14h', i:4,  k:'v'}, {d:'2026-11-10', h:'9h',  i:3,  k:'c'},
  {d:'2026-11-12', h:'15h', i:9,  k:'v'}, {d:'2026-11-13', h:'10h', i:8,  k:'c'},
  {d:'2026-11-17', h:'9h',  i:11, k:'v'}, {d:'2026-11-18', h:'14h', i:0,  k:'v'},
  {d:'2026-11-19', h:'10h', i:2,  k:'c'}, {d:'2026-11-20', h:'9h',  i:6,  k:'c'},
  {d:'2026-11-20', h:'15h', i:12, k:'v'}, {d:'2026-11-23', h:'14h', i:4,  k:'v'},
  {d:'2026-11-26', h:'10h', i:1,  k:'v'}, {d:'2026-11-27', h:'15h', i:7,  k:'c'},
  {d:'2026-12-02', h:'9h',  i:5,  k:'c'}, {d:'2026-12-04', h:'14h', i:0,  k:'c'},
];
const TODAY = '2026-11-18';
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
let CAL_Y = 2026, CAL_M = 10, CAL_SEL = TODAY;
const iso = (y,m,d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const evCls = e => e.d < TODAY ? 'done' : (e.k === 'c' ? 'chk' : '');
const evTipo = e => e.k === 'c' ? 'Checklist' : 'Visita técnica';

function renderCalendario(){
  return `<div class="cal">
    <div class="card" id="calMain"></div>
    <div class="card" id="calSide"></div>
  </div>`;
}
function drawCalendario(){
  const first = new Date(CAL_Y, CAL_M, 1), start = first.getDay();
  const days = new Date(CAL_Y, CAL_M + 1, 0).getDate();
  const prevDays = new Date(CAL_Y, CAL_M, 0).getDate();
  const cells = [];
  for (let k = 0; k < 42; k++){
    const n = k - start + 1;
    let y = CAL_Y, m = CAL_M, d = n, out = false;
    if (n < 1){ m = CAL_M - 1; d = prevDays + n; out = true; }
    else if (n > days){ m = CAL_M + 1; d = n - days; out = true; }
    if (m < 0){ m = 11; y--; } if (m > 11){ m = 0; y++; }
    cells.push({ key: iso(y,m,d), d, out });
  }
  const rows = cells.slice(35).every(c => c.out) ? cells.slice(0,35) : cells;
  const total = AGENDA.filter(e => e.d.startsWith(iso(CAL_Y,CAL_M,1).slice(0,7))).length;
  document.getElementById('calMain').innerHTML = `
    <div class="cal-head">
      <div class="cal-nav">
        <button class="icon-btn" data-cal="-1" aria-label="Mês anterior"><i data-lucide="chevron-left"></i></button>
        <button class="icon-btn" data-cal="1" aria-label="Próximo mês"><i data-lucide="chevron-right"></i></button>
        <div><h3>${MESES[CAL_M]} ${CAL_Y}</h3><div class="card-sub">${total} ${total === 1 ? 'visita' : 'visitas'} no mês</div></div>
      </div>
      <div style="display:flex;gap:8px"><button class="btn btn-outline btn-sm" data-cal="hoje">Hoje</button><button class="btn btn-primary btn-sm"><i data-lucide="plus"></i>Agendar visita</button></div>
    </div>
    <div class="cal-week">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(w => `<div>${w}</div>`).join('')}</div>
    <div class="cal-grid">${rows.map(c => {
      const evs = AGENDA.filter(e => e.d === c.key);
      return `<div class="cal-day ${c.out?'out':''} ${c.key===TODAY?'today':''} ${c.key===CAL_SEL?'sel':''}" data-day="${c.key}">
        <span class="n">${c.d}</span>
        ${evs.slice(0,2).map(e => `<span class="ev ${evCls(e)}">${e.h} ${CLIENTES[e.i].n}</span>`).join('')}
        ${evs.length > 2 ? `<span class="ev-more">+${evs.length-2} mais</span>` : ''}
        ${evs.length ? `<span class="dots">${evs.map(e => `<i class="${evCls(e)}"></i>`).join('')}</span>` : ''}
      </div>`; }).join('')}</div>
    <div class="cal-legend"><span><i style="background:var(--green-50);border:1px solid var(--green-100)"></i>Visita técnica</span><span><i style="background:var(--green-700)"></i>Checklist</span><span><i style="background:var(--surface-sunken);border:1px solid var(--line)"></i>Realizada</span></div>`;

  const [y,m,d] = CAL_SEL.split('-').map(Number);
  const dt = new Date(y, m-1, d);
  const label = CAL_SEL === TODAY ? 'Hoje' : (w => w[0].toUpperCase() + w.slice(1))(dt.toLocaleDateString('pt-BR', { weekday:'long' }));
  const dayEvs = AGENDA.filter(e => e.d === CAL_SEL);
  const prox = AGENDA.filter(e => e.d > CAL_SEL).slice(0,3);
  const item = (e, showDate) => `<div class="agenda-item" data-idx="${e.i}">
      <span class="time">${showDate ? e.d.slice(8)+'/'+e.d.slice(5,7) : e.h}</span><span class="bar ${evCls(e)}"></span>
      <div><b>${CLIENTES[e.i].n}</b><small>${evTipo(e)}${showDate ? ' · ' + e.h : ''}${e.d < TODAY ? ' · realizada' : ''}</small></div></div>`;
  document.getElementById('calSide').innerHTML = `
    <div class="card-head" style="margin-bottom:8px"><div><div class="card-title">${label}</div><div class="card-sub">${dt.toLocaleDateString('pt-BR', { day:'numeric', month:'long' })}</div></div></div>
    ${dayEvs.length ? dayEvs.map(e => item(e)).join('') : '<div class="agenda-empty">Nenhuma visita neste dia.</div>'}
    ${prox.length ? `<div class="card-title" style="font-size:14px;margin-top:18px">Depois</div>${prox.map(e => item(e, true)).join('')}` : ''}
    <div class="sync"><i data-lucide="refresh-cw"></i>Sincronizado com o Google Agenda</div>`;
  icons();
}
function wireCalendario(){
  drawCalendario();
  document.getElementById('calMain').addEventListener('click', e => {
    const nav = e.target.closest('[data-cal]');
    if (nav){
      if (nav.dataset.cal === 'hoje'){ CAL_Y = 2026; CAL_M = 10; CAL_SEL = TODAY; }
      else { CAL_M += +nav.dataset.cal; if (CAL_M < 0){ CAL_M = 11; CAL_Y--; } if (CAL_M > 11){ CAL_M = 0; CAL_Y++; } }
      return drawCalendario();
    }
    const day = e.target.closest('[data-day]');
    if (day){ CAL_SEL = day.dataset.day; drawCalendario(); }
  });
}

/* ================= CLIENTES ================= */
let FILTER = 'ativos', QUERY = '', VIEW = 'grid', PAGE = 1;
const PER_PAGE = 8;

function renderClientes(){
  const ativos = CLIENTES.filter(c => c.s).length;
  return `
    <div class="toolbar">
      <label class="search"><input id="cliSearch" type="text" placeholder="Buscar cliente pelo nome" value="${QUERY}" /><i data-lucide="search"></i></label>
      <div class="pills pills-box" id="cliFilter">
        <button data-f="todos" class="${FILTER==='todos'?'active':''}">Todos<span class="n">${CLIENTES.length}</span></button>
        <button data-f="ativos" class="${FILTER==='ativos'?'active':''}">Ativos<span class="n">${ativos}</span></button>
        <button data-f="inativos" class="${FILTER==='inativos'?'active':''}">Inativos<span class="n">${CLIENTES.length - ativos}</span></button>
      </div>
      <span class="spacer"></span>
      <div class="view-toggle" id="cliView">
        <button data-v="list" class="${VIEW==='list'?'active':''}" aria-label="Ver em lista"><i data-lucide="list"></i></button>
        <button data-v="grid" class="${VIEW==='grid'?'active':''}" aria-label="Ver em cartões"><i data-lucide="layout-grid"></i></button>
      </div>
      <button class="btn btn-primary" data-novo-cliente><i data-lucide="plus"></i>Novo cliente</button>
    </div>
    <div id="cliList"></div>`;
}

function filteredClients(){
  const q = QUERY.trim().toLowerCase();
  return CLIENTES.map((c,i) => ({...c, i})).filter(c =>
    (FILTER === 'todos' || (FILTER === 'ativos' ? c.s : !c.s)) && (!q || c.n.toLowerCase().includes(q)));
}

function pager(total){
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const from = total ? (PAGE - 1) * PER_PAGE + 1 : 0, to = Math.min(total, PAGE * PER_PAGE);
  let nums = '';
  for (let i = 1; i <= pages; i++) nums += `<button class="pg-num ${i===PAGE?'active':''}" data-pg="${i}" ${i===PAGE?'aria-current="page"':''}>${i}</button>`;
  return `<div class="pager"><span class="pg-info">Mostrando <b>${from}–${to}</b> de <b>${total}</b> clientes</span>
    <div class="pg-btns"><button class="pg-arrow" data-pg="${PAGE-1}" ${PAGE===1?'disabled':''} aria-label="Página anterior"><i data-lucide="chevron-left"></i></button>${nums}
    <button class="pg-arrow" data-pg="${PAGE+1}" ${PAGE===pages?'disabled':''} aria-label="Próxima página"><i data-lucide="chevron-right"></i></button></div></div>`;
}

function drawClients(){
  const all = filteredClients(), box = document.getElementById('cliList');
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  if (PAGE > pages) PAGE = pages;
  const list = all.slice((PAGE - 1) * PER_PAGE, PAGE * PER_PAGE);
  if (!list.length){
    box.innerHTML = `<div class="card"><div class="placeholder"><div class="ic"><i data-lucide="search-x"></i></div>
      <h3>Nenhum cliente encontrado</h3><p>Nenhum resultado para "${QUERY}".</p>
      <button class="btn btn-ghost btn-sm" id="clearSearch" style="margin-top:14px">Limpar busca</button></div></div>`;
    document.getElementById('clearSearch').onclick = () => { QUERY = ''; document.getElementById('cliSearch').value = ''; drawClients(); };
    icons(); return;
  }
  const status = c => `<span class="badge ${c.s?'on':'off'}">${c.s?'Ativo':'Inativo'}</span>`;
  if (VIEW === 'grid'){
    box.innerHTML = `<div class="client-grid">${list.map(c => `
      <div class="client-card" data-idx="${c.i}">
        <div class="cc-top">
          <div class="cc-ava">${clientFace(c)}<span class="st ${c.s?'':'off'}"></span></div>
          <div style="min-width:0"><div class="cc-name">${c.n}</div><div class="cc-type">${c.t}</div>
            ${c.ov ? `<div class="cc-link is-alert">Plano de ação vencido</div>` : `<div class="cc-link">Ver perfil</div>`}</div>
          <i data-lucide="chevron-right" class="cc-go"></i>
        </div>
        <div class="cc-rows">
          <div class="cc-row"><span class="ic"><i data-lucide="calendar-check"></i></span>${c.d ? `Última visita ${c.d}` : 'Nenhuma visita ainda'}</div>
          ${c.r ? `<div class="cc-row"><span class="ic"><i data-lucide="clock-3"></i></span>${c.r}</div>` : ''}
        </div>
      </div>`).join('')}</div>
      ${pager(all.length)}`;
  } else {
    box.innerHTML = `<div class="table-card"><table>
      <thead><tr><th>Cliente</th><th>Tipo de estabelecimento</th><th>Status</th><th>Última visita</th><th></th></tr></thead>
      <tbody>${list.map(c => `<tr data-idx="${c.i}">
        <td><div class="cell-main"><div class="vc-ava">${clientFace(c)}</div><div><b>${c.n}</b>${c.ov?`<div class="cell-sub" style="color:var(--danger)">Plano de ação vencido</div>`:''}</div></div></td>
        <td data-th="Tipo">${c.t}</td>
        <td data-th="Status">${status(c)}</td>
        <td data-th="Última visita" class="m-hide">${c.d}<div class="cell-sub">${c.r}</div></td>
        <td class="cell-go m-hide"><i data-lucide="chevron-right"></i></td>
      </tr>`).join('')}</tbody></table></div>${pager(all.length)}`;
  }
  box.querySelectorAll('[data-pg]').forEach(b => b.onclick = () => { PAGE = +b.dataset.pg; drawClients(); document.getElementById('content').scrollIntoView({block:'start'}); window.scrollTo({top:0, behavior:'smooth'}); });
  icons();
}

function wireClientes(){
  drawClients();
  document.getElementById('cliSearch').addEventListener('input', e => { QUERY = e.target.value; PAGE = 1; drawClients(); });
  document.querySelectorAll('#cliFilter button').forEach(b => b.onclick = () => {
    FILTER = b.dataset.f; PAGE = 1;
    document.querySelectorAll('#cliFilter button').forEach(x => x.classList.toggle('active', x === b));
    drawClients();
  });
  document.querySelectorAll('#cliView button').forEach(b => b.onclick = () => {
    VIEW = b.dataset.v;
    document.querySelectorAll('#cliView button').forEach(x => x.classList.toggle('active', x === b));
    drawClients();
  });
}

/* ================= EVENTOS GLOBAIS ================= */
document.addEventListener('click', e => {
  const pg = e.target.closest('[data-page]');
  if (pg && !e.target.closest('#content [data-idx]')){ e.preventDefault(); go(pg.dataset.page); return; }
  const tg = e.target.closest('.nav-item[data-toggle]');
  if (tg){ if (app.classList.contains('collapsed')) app.classList.remove('collapsed'); tg.classList.toggle('open'); }
});

document.getElementById('menuBtn').onclick = () => {
  if (window.innerWidth <= 960) app.classList.toggle('nav-open');
  else app.classList.toggle('collapsed');
};
document.getElementById('backdrop').onclick = () => app.classList.remove('nav-open');

const userMenu = document.getElementById('userMenu');
userMenu.addEventListener('click', e => { e.stopPropagation(); userMenu.classList.toggle('open'); });
document.addEventListener('click', () => userMenu.classList.remove('open'));

const toggleChat = () => app.classList.toggle('chat-open');
document.getElementById('fab').onclick = toggleChat;
document.getElementById('chatClose').onclick = () => app.classList.remove('chat-open');
