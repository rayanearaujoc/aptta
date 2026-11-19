/* =========================================================
   Aptta — Perfil do cliente
   ========================================================= */
let CURRENT = null, PVIEW = 'visitas', CFGTAB = 'dados', COBR = 0;
const BACK_MAP = { desempenho:'visitas', config:'visitas', cobranca:'financeiro' };

const CHARGES = [
  { ref:'Mensalidade de outubro', venc:'10/10/2026', v:450, st:'Pago', cls:'on', forma:'Link de pagamento', emiss:'01/10/2026',
    hist:[{t:'Cobrança criada',d:'01/10/2026 às 09:12'},{t:'Link de pagamento enviado ao cliente',d:'01/10/2026 às 09:13'},{t:'Cliente abriu o link',d:'03/10/2026 às 18:40'},{t:'Pagamento confirmado',d:'08/10/2026 às 11:05'}] },
  { ref:'Mensalidade de novembro', venc:'25/11/2026', v:450, st:'Pendente', cls:'warn', forma:'Link de pagamento', emiss:'01/11/2026',
    hist:[{t:'Cobrança criada',d:'01/11/2026 às 09:10'},{t:'Link de pagamento enviado ao cliente',d:'01/11/2026 às 09:11'},{t:'Aguardando pagamento',d:'—',pending:1}] },
  { ref:'Visita avulsa', venc:'28/09/2026', v:200, st:'Atrasado', cls:'late', forma:'Apenas lembrete', emiss:'20/09/2026',
    hist:[{t:'Cobrança criada',d:'20/09/2026 às 14:00'},{t:'Lembrete enviado para você',d:'27/09/2026 às 10:00'},{t:'Venceu sem pagamento',d:'28/09/2026',pending:1}] },
];
const VISITS = [
  { t:'Visita técnica', d:'30/09/2026', nota:'8,6', sl:'nota', ic:'notebook-pen' },
  { t:'Checklist padrão de limpeza', d:'15/08/2026', nota:'92%', sl:'conformidade', ic:'list-checks' },
  { t:'Visita técnica', d:'20/06/2026', nota:'7,9', sl:'nota', ic:'notebook-pen' },
  { t:'Checklist padrão de limpeza', d:'02/05/2026', nota:'85%', sl:'conformidade', ic:'list-checks' },
];

document.addEventListener('click', e => { if (e.target.closest('[data-nova-visita-home]')) openNovaVisita(true); });

/* abre o perfil a partir de qualquer elemento com data-idx (cartão, linha, próxima visita) */
content.addEventListener('click', e => {
  const el = e.target.closest('[data-idx]');
  if (el){ CURRENT = +el.dataset.idx; PVIEW = 'visitas'; CFGTAB = 'dados'; renderProfile(); }
});

function renderProfile(){
  const c = CLIENTES[CURRENT];
  document.getElementById('pageTitle').textContent = 'Clientes';
  app.classList.remove('hide-topsearch');
  setActive('clientes');
  const parent = BACK_MAP[PVIEW];
  const back = parent
    ? `<button class="back" data-pview="${parent}"><i data-lucide="arrow-left"></i>Voltar</button>`
    : `<button class="back" data-back><i data-lucide="arrow-left"></i>Voltar para clientes</button>`;

  let body;
  if (PVIEW === 'desempenho') body = viewDesempenho(c);
  else if (PVIEW === 'cobranca') body = viewCobranca();
  else if (PVIEW === 'config') body = viewConfig(c);
  else body = `
    <div class="tabs">
      <button class="tab ${PVIEW==='visitas'?'active':''}" data-pview="visitas">Visitas</button>
      <button class="tab ${PVIEW==='financeiro'?'active':''}" data-pview="financeiro">Financeiro</button>
    </div>
    ${PVIEW === 'financeiro' ? tabFinanceiro() : tabVisitas()}`;

  content.innerHTML = `<div class="v-gap">
    <div>${back}</div>
    ${PVIEW === 'desempenho' ? '' : `${c.ov ? `<div class="alert"><i data-lucide="triangle-alert"></i>Este cliente tem um plano de ação vencido.</div>` : ''}
    <div class="card profile-head">
      <div class="ph-left">
        <div class="cc-ava">${clientFace(c)}<span class="st ${c.s?'':'off'}"></span></div>
        <div><div class="ph-name"><h2>${c.n}</h2><span class="badge ${c.s?'on':'off'}">${c.s?'Ativo':'Inativo'}</span></div>
          <div class="ph-type">${c.t}</div></div>
      </div>
      <button class="icon-btn" data-pview="config" aria-label="Configurações do cliente" title="Configurações do cliente"><i data-lucide="settings"></i></button>
    </div>`}
    ${body}
  </div>`;
  window.scrollTo(0,0);
  wireProfile();
  icons();
}

function tabVisitas(){
  return `
    <div class="section-head"><div><h3>Suas visitas</h3><p>Visitas técnicas e checklists feitos neste cliente</p></div><button class="btn btn-primary" data-nova-visita><i data-lucide="plus"></i>Nova visita</button></div>
    <div class="kpis">
      <div class="card mini-kpi"><div><div class="lbl">Nota média</div><div class="val">8,6</div><div class="meta"><span class="trend-up">+0,7</span> que a anterior</div></div>${sparkline([7.2,7.9,8.1,8.6])}</div>
      <div class="card mini-kpi"><div><div class="lbl">Visitas realizadas</div><div class="val">4</div><div class="meta">desde maio</div></div>${sparkline([1,2,3,4])}</div>
      <div class="card mini-kpi span"><div><div class="lbl">Planos de ação abertos</div><div class="val">2</div><div class="meta">de 5 criados</div></div>${donut({parts:[{value:3,color:C.green},{value:2,color:C.tint}], size:64, stroke:9})}</div>
    </div>
    <div class="card perf-link" data-pview="desempenho">
      <span class="ic"><i data-lucide="trending-up"></i></span>
      <span class="txt"><b>Ver desempenho</b><small>Evolução das notas das visitas e checklists, pronta para enviar ao cliente</small></span>
      <i data-lucide="chevron-right"></i>
    </div>
    <div class="table-card"><div class="card-head" style="padding:20px 20px 0;margin-bottom:8px"><div><div class="card-title">Histórico de visitas</div><div class="card-sub">Da mais recente para a mais antiga</div></div></div><table>
      <thead><tr><th>Visita</th><th>Data</th><th style="text-align:right">Resultado</th><th></th></tr></thead>
      <tbody>${VISITS.map(v => `<tr>
        <td><div class="cell-main"><div class="row-ic"><i data-lucide="${v.ic}" style="width:16px;height:16px"></i></div><b>${v.t}</b></div></td>
        <td data-th="Data">${v.d}<div class="cell-sub">Finalizada</div></td>
        <td data-th="Resultado" class="res"><b>${v.nota}</b><small>${v.sl}</small></td>
        <td class="cell-go m-hide"><i data-lucide="chevron-right"></i></td>
      </tr>`).join('')}</tbody></table></div>`;
}

function tabFinanceiro(){
  return `
    <div class="section-head"><div><h3>Financeiro</h3><p>Cobranças e pagamentos deste cliente</p></div><button class="btn btn-primary"><i data-lucide="plus"></i>Nova cobrança</button></div>
    <div class="kpis">
      <div class="card mini-kpi"><div><div class="lbl">Recebido</div><div class="val" style="color:var(--green-700)">${money(450)}</div><div class="meta">1 cobrança paga</div></div></div>
      <div class="card mini-kpi"><div><div class="lbl">Atrasado</div><div class="val" style="color:var(--danger)">${money(200)}</div><div class="meta">1 cobrança vencida</div></div></div>
      <div class="card mini-kpi span feature">${MARK('mark','#fff')}<div><div class="lbl">Pendente</div><div class="val">${money(450)}</div><div class="meta">Mensalidade de novembro · vence em 25/11</div></div></div>
    </div>
    <div class="table-card"><div class="card-head" style="padding:20px 20px 0;margin-bottom:8px"><div><div class="card-title">Cobranças</div><div class="card-sub">Toque em uma cobrança para ver o histórico</div></div></div><table>
      <thead><tr><th>Cobrança</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr></thead>
      <tbody>${CHARGES.map((x,i) => `<tr data-cobr="${i}">
        <td><div class="cell-main"><div class="row-ic"><i data-lucide="receipt" style="width:16px;height:16px"></i></div><div><b>${x.ref}</b><div class="cell-sub">${x.forma}</div></div></div></td>
        <td data-th="Vencimento">${x.venc}</td>
        <td data-th="Valor">${money(x.v)}</td>
        <td data-th="Status"><span class="badge ${x.cls}">${x.st}</span></td>
        <td class="cell-go m-hide"><i data-lucide="chevron-right"></i></td>
      </tr>`).join('')}</tbody></table></div>`;
}

function viewCobranca(){
  const x = CHARGES[COBR];
  return `
    <div class="card">
      <div class="card-head"><div><div class="card-sub">Cobrança</div><div class="card-title" style="font-size:16px">${x.ref}</div></div><span class="badge ${x.cls}">${x.st}</span></div>
      <div class="detail-rows">
        <div><small>Valor</small><b>${money(x.v)}</b></div>
        <div><small>Vencimento</small><b>${x.venc}</b></div>
        <div><small>Forma de cobrança</small><b>${x.forma}</b></div>
        <div><small>Criada em</small><b>${x.emiss}</b></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><div class="card-title">Histórico da cobrança</div><div class="card-sub">Cada etapa, da criação ao pagamento</div></div></div>
      <div class="timeline">${x.hist.map(h => `<div class="tl-item ${h.pending?'pending':''}"><b>${h.t}</b><small>${h.d}</small></div>`).join('')}</div>
    </div>`;
}

let PERF_KIND = 'visita';
const PERF = {
  visita:    { label:'Visita técnica', unit:'nota', meta:null, step:0.5, min:0, max:10,
               labels:['20/03','12/04','20/06','28/07','30/09'], values:[6.9,7.4,7.9,7.6,8.6] },
  checklist: { label:'Checklist', unit:'conformidade', meta:null, step:5, min:0, max:100,
               labels:['10/03','02/05','03/07','15/08','14/10'], values:[78,85,89,92,95] },
};
const fmtNota = v => v.toLocaleString('pt-BR', { minimumFractionDigits:1, maximumFractionDigits:1 });
function perfFmt(k){ return k === 'visita' ? fmtNota : v => Math.round(v) + '%'; }
function perfDelta(k){ return k === 'visita' ? fmtNota : v => Math.round(v) + ' p.p.'; }

function viewDesempenho(c){
  return `
    <div class="section-head"><div><h3>Desempenho</h3><p>Evolução dos resultados de ${c.n}</p></div><button class="btn btn-primary" data-download><i data-lucide="download"></i>Baixar imagem</button></div>
    <div class="card perf-card" id="perfCard">${perfBody()}</div>`;
}
function perfScale(){
  const P = PERF[PERF_KIND], vals = P.values, meta = P.meta;
  const all = meta !== null ? [...vals, meta] : vals;
  const step = PERF_KIND === 'visita' ? 1 : 10;
  const min = Math.max(P.min, Math.floor((Math.min(...all) - step / 2) / step) * step);
  const max = Math.min(P.max, Math.ceil((Math.max(...all) + step / 2) / step) * step);
  return { min, max, ticks: (max - min) / step };
}
function perfChart(width){
  const P = PERF[PERF_KIND], sc = perfScale();
  return perfLine({ width, height: width < 500 ? 260 : 300, labels:P.labels, values:P.values, meta:P.meta, min:sc.min, max:sc.max, ticks:sc.ticks, fmt:perfFmt(PERF_KIND) });
}
function perfBody(){
  const P = PERF[PERF_KIND];
  const w = Math.max(300, content.clientWidth - 48);
  return `
    <div class="perf-top">
      <div class="seg perf-seg" role="tablist">
        <button class="${PERF_KIND==='visita'?'active':''}" data-kind="visita">Visita técnica</button>
        <button class="${PERF_KIND==='checklist'?'active':''}" data-kind="checklist">Checklist</button>
      </div>
      <label class="meta-field"><span>${PERF_KIND === 'visita' ? 'Nota ideal' : 'Conformidade ideal (%)'}</span>
        <input id="perfMeta" type="text" inputmode="decimal" placeholder="Sem meta" value="${P.meta === null ? '' : String(P.meta).replace('.', ',')}"></label>
    </div>
    <div class="perf-head"><b>${PERF_KIND === 'visita' ? 'Notas das visitas técnicas' : 'Conformidade dos checklists'}</b><small>${PERF_KIND === 'visita' ? 'De 0 a 10, por visita' : 'Percentual de itens conformes, por aplicação'}</small></div>
    <div class="evo-chart" id="perfChart">${perfChart(w)}</div>`;
}
function wirePerf(){
  const card = document.getElementById('perfCard'); if (!card) return;
  const bindMeta = () => {
    const inp = card.querySelector('#perfMeta'); if (!inp) return;
    inp.oninput = () => {
      const P = PERF[PERF_KIND], raw = inp.value.replace(',', '.').trim(), v = parseFloat(raw);
      P.meta = raw === '' || isNaN(v) || v <= 0 ? null : Math.min(P.max, v);
      document.getElementById('perfChart').innerHTML = perfChart(Math.max(300, content.clientWidth - 48));
    };
  };
  card.onclick = e => {
    const k = e.target.closest('[data-kind]');
    if (k){ PERF_KIND = k.dataset.kind; card.innerHTML = perfBody(); icons(); bindMeta(); }
  };
  bindMeta();
  const dl = content.querySelector('[data-download]'); if (dl) dl.onclick = downloadPerf;
}

/* gera a imagem (PNG) do desempenho para enviar ao cliente */
function downloadPerf(){
  const c = CLIENTES[CURRENT], P = PERF[PERF_KIND], f = perfFmt(PERF_KIND);
  const W = 1200, H = 640, chart = perfChart(1100).replace('width="100%"', 'x="50" y="222" width="1100" height="300"');
  const titulo = PERF_KIND === 'visita' ? 'Notas das visitas técnicas' : 'Conformidade dos checklists';
  const sub = (PERF_KIND === 'visita' ? 'De 0 a 10, por visita' : 'Percentual de itens conformes') + (P.meta !== null ? ` · Meta: ${f(P.meta)}` : '');
  const hoje = new Date().toLocaleDateString('pt-BR');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="font-family:'Open Sans',Arial,sans-serif">
    <rect width="${W}" height="${H}" fill="#fff"/>
    <text x="50" y="70" font-size="15" font-weight="600" fill="#0F6E56">Desempenho</text>
    <text x="50" y="112" font-size="34" font-weight="700" fill="#181B19" style="font-family:'Playfair Display',Georgia,serif">${esc(c.n)}</text>
    <text x="50" y="160" font-size="18" font-weight="600" fill="#181B19">${esc(titulo)}</text>
    <text x="50" y="186" font-size="14" fill="#6B726E">${esc(sub)}</text>
    ${chart}
    <line x1="50" x2="1150" y1="580" y2="580" stroke="#E5E7E3"/>
    <text x="50" y="606" font-size="12" fill="#9AA19D">Gerado em ${hoje}</text>
    <text x="1150" y="606" font-size="12" fill="#9AA19D" text-anchor="end">aptta</text>
  </svg>`;
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2;
    const ctx = cv.getContext('2d'); ctx.scale(2, 2); ctx.drawImage(img, 0, 0);
    cv.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = `desempenho-${c.n.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}-${PERF_KIND}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      toast('Imagem do desempenho baixada');
    }, 'image/png');
  };
  img.onerror = () => toast('Não foi possível gerar a imagem');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function viewConfig(c){
  const tabs = [
    {k:'dados', ic:'file-text', lb:'Dados cadastrais'},
    {k:'notif', ic:'bell', lb:'Notificações e cobrança'},
    {k:'equipe', ic:'users', lb:'Equipe do restaurante'},
    {k:'inativar', ic:'power', lb:'Inativar cliente'},
  ];
  const sec = CFGTAB === 'notif' ? cfgNotif() : CFGTAB === 'equipe' ? cfgEquipe() : CFGTAB === 'inativar' ? cfgInativar() : cfgDados(c);
  return `<div class="cfg">
    <nav class="cfg-nav">${tabs.map(t => `<button class="cfg-item ${CFGTAB===t.k?'active':''} ${t.k==='inativar'?'danger':''}" data-cfgtab="${t.k}"><i data-lucide="${t.ic}"></i>${t.lb}</button>`).join('')}</nav>
    <div class="card">${sec}</div>
  </div>`;
}
function cfgDados(c){
  return `<div class="card-head"><div><div class="card-title">Dados cadastrais</div><div class="card-sub">Edite as informações do cliente a qualquer momento</div></div></div>
    <div class="nc-photo" style="margin-bottom:18px">
      <label class="nc-ava" for="cfgLogo" title="Trocar logomarca">${c.logo ? `<img src="${c.logo}" alt="">` : initials(c.n)}<span class="nc-cam"><i data-lucide="camera"></i></span></label>
      <input id="cfgLogo" type="file" accept="image/*" hidden>
      <div><b>Logomarca do estabelecimento</b><small>Aparece no perfil, nos cards e nos relatórios.</small>
        <div class="nc-photo-actions"><label for="cfgLogo" class="btn btn-outline btn-sm"><i data-lucide="upload"></i>${c.logo ? 'Trocar imagem' : 'Enviar imagem'}</label>
        ${c.logo ? `<button class="btn btn-ghost btn-sm" data-cfg-rmlogo>Remover</button>` : ''}</div></div>
    </div>
    <div class="form-grid">
      <div class="field full"><label>Nome fantasia</label><input value="${c.n}"></div>
      <div class="field"><label>Tipo de estabelecimento</label><input value="${c.t}"></div>
      <div class="field"><label>WhatsApp de contato</label><input value="(62) 9 9856-0741"></div>
      <div class="field"><label>CNPJ ou CPF</label><input placeholder="000.000.000/0001-01"></div>
      <div class="field"><label>Razão social</label><input placeholder="Razão social"></div>
      <div class="field"><label>Nome do responsável</label><input placeholder="Nome do responsável"></div>
      <div class="field"><label>E-mail de contato</label><input placeholder="empresa@exemplo.com"></div>
      <div class="field"><label>CEP</label><input placeholder="00000-000"></div>
      <div class="field"><label>Endereço completo</label><input placeholder="Rua, número, bairro e cidade"></div>
    </div>
    <div class="form-foot"><button class="btn btn-ghost">Cancelar</button><button class="btn btn-primary">Salvar alterações</button></div>`;
}
function cfgNotif(){
  return `<div class="card-head"><div><div class="card-title">Notificações e cobrança</div><div class="card-sub">Vale só para este cliente</div></div></div>
    <div class="setting"><div><b>Habilitar cobranças</b><small>Permite criar cobranças para este cliente</small></div><div class="switch on"></div></div>
    <div class="setting"><div><b>Forma de cobrança padrão</b><small>Link de pagamento: o cliente recebe um link para pagar. Apenas lembrete: só você é avisada.</small></div>
      <select class="sel"><option>Link de pagamento</option><option>Apenas lembrete</option></select></div>
    <div class="setting"><div><b>Avisos automáticos ao cliente</b><small>Lembrete de vencimento e confirmação de pagamento do link</small></div><div class="switch on"></div></div>
    <div class="setting"><div><b>Lembretes para você</b><small>Aviso quando uma cobrança deste cliente vencer</small></div><div class="switch"></div></div>
    <div class="form-foot"><button class="btn btn-primary">Salvar</button></div>`;
}
function cfgEquipe(){
  const m = [{n:'Carlos Mendes',cg:'Gerente',sign:1},{n:'Ana Souza',cg:'Nutricionista responsável',sign:1},{n:'Pedro Lima',cg:'Cozinheiro-chefe',sign:0}];
  return `<div class="card-head"><div><div class="card-title">Equipe do restaurante</div><div class="card-sub">Pessoas do estabelecimento (sem acesso ao sistema)</div></div><button class="btn btn-outline btn-sm"><i data-lucide="plus"></i>Adicionar membro</button></div>
    ${m.map(x => `<div class="member"><div class="avatar" style="width:36px;height:36px;font-size:13px">${initials(x.n)}</div><div class="txt"><b>${x.n}</b><small>${x.cg}</small></div>${x.sign?'<span class="badge on">Assina relatórios</span>':''}<button class="kebab" aria-label="Editar"><i data-lucide="pencil"></i></button></div>`).join('')}`;
}
function cfgInativar(){
  return `<div class="danger-card"><div><b>Inativar cliente</b><small>O cadastro e todo o histórico são mantidos. Novas visitas ficam bloqueadas até você reativar.</small></div><button class="btn btn-danger">Inativar cliente</button></div>`;
}

function wireProfile(){
  content.querySelectorAll('[data-pview]').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); PVIEW = el.dataset.pview; renderProfile(); }));
  const back = content.querySelector('[data-back]'); if (back) back.onclick = () => go('clientes');
  content.querySelectorAll('[data-cfgtab]').forEach(el => el.onclick = () => { CFGTAB = el.dataset.cfgtab; renderProfile(); });
  content.querySelectorAll('tr[data-cobr]').forEach(tr => tr.onclick = () => { COBR = +tr.dataset.cobr; PVIEW = 'cobranca'; renderProfile(); });
  content.querySelectorAll('.switch').forEach(s => s.onclick = () => s.classList.toggle('on'));
  const lg = content.querySelector('#cfgLogo');
  if (lg) lg.onchange = e => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => { CLIENTES[CURRENT].logo = r.result; renderProfile(); }; r.readAsDataURL(file); };
  const rm = content.querySelector('[data-cfg-rmlogo]'); if (rm) rm.onclick = () => { CLIENTES[CURRENT].logo = ''; renderProfile(); };
  const nv = content.querySelector('[data-nova-visita]'); if (nv) nv.onclick = () => openNovaVisita();
  wirePerf();
}

/* ===== Enviar desempenho ao cliente ===== */
function openSend(){
  const c = CLIENTES[CURRENT];
  const team = [{n:'Carlos Mendes',cg:'Gerente',on:1},{n:'Ana Souza',cg:'Nutricionista responsável',on:0}];
  let canal = 'whatsapp';
  const m = document.createElement('div');
  m.className = 'modal';
  const draw = () => {
    m.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="sendTitle">
      <div class="modal-head"><div><h3 id="sendTitle">Enviar desempenho</h3><p>O cliente recebe um link com os gráficos desta página</p></div><button class="kebab" data-close aria-label="Fechar"><i data-lucide="x"></i></button></div>
      <div class="modal-body">
        <div><div class="field-lbl">Para quem</div><div style="display:grid;gap:8px">
          ${team.map((t,i) => `<div class="pick ${t.on?'on':''}" data-pick="${i}"><div class="avatar" style="width:34px;height:34px;font-size:12px">${initials(t.n)}</div><div class="txt"><b>${t.n}</b><small>${t.cg}</small></div><span class="ck"><i data-lucide="check"></i></span></div>`).join('')}
        </div></div>
        <div><div class="field-lbl">Enviar por</div><div class="seg">
          <button class="${canal==='whatsapp'?'active':''}" data-canal="whatsapp"><i data-lucide="message-circle"></i>WhatsApp</button>
          <button class="${canal==='email'?'active':''}" data-canal="email"><i data-lucide="mail"></i>E-mail</button>
        </div></div>
        <div><div class="field-lbl">Mensagem</div><div class="preview">Olá! Segue o acompanhamento da ${c.n}: a nota média subiu para 8,6 e a conformidade dos checklists chegou a 95%. Veja os detalhes: <a>aptta.com/r/7KQ2</a></div></div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-go><i data-lucide="send"></i>Enviar</button></div>
    </div>`;
    icons();
  };
  m.addEventListener('click', e => {
    if (e.target === m || e.target.closest('[data-close]')) return m.remove();
    const pk = e.target.closest('[data-pick]'); if (pk){ team[+pk.dataset.pick].on ^= 1; return draw(); }
    const cn = e.target.closest('[data-canal]'); if (cn){ canal = cn.dataset.canal; return draw(); }
    if (e.target.closest('[data-go]')){
      const who = team.filter(t => t.on).map(t => t.n.split(' ')[0]);
      if (!who.length) return;
      m.remove();
      toast(`Desempenho enviado para ${who.join(' e ')} por ${canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}`);
    }
  });
  document.body.appendChild(m);
  draw();
}
function toast(msg){
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role','status');
  t.innerHTML = `<i data-lucide="circle-check"></i>${msg}`;
  document.body.appendChild(t); icons();
  setTimeout(() => t.remove(), 3200);
}


/* ===== Novo cliente (HU_F2.1 — cadastro progressivo) ===== */
const TIPOS_ESTAB = ['Restaurante','Padaria','Confeitaria','Pizzaria','Lanchonete','Cafeteria','Cozinha industrial','Hotel','Escola','Indústria de alimentos','Outro'];
function openNovoCliente(){
  const f = { logo:'', n:'', t:'', w:'', doc:'', rs:'', resp:'', mail:'', cep:'', end:'', cob:true, forma:'Link de pagamento', avisos:true, lembr:false };
  let openSec = { extra:false, fin:false }, cnpjMsg = null, tried = false;
  const m = document.createElement('div');
  m.className = 'modal';
  const req = () => f.n.trim() && f.t && f.w.replace(/\D/g,'').length >= 10;
  const err = (k, msg) => tried && !k ? `<small class="f-err">${msg}</small>` : '';
  const draw = () => {
    const ok = req();
    m.innerHTML = `<div class="modal-box nc-box" role="dialog" aria-modal="true" aria-labelledby="ncTitle">
      <div class="modal-head"><div><h3 id="ncTitle">Novo cliente</h3><p>Só os campos com * são obrigatórios. O resto pode ser completado depois, no perfil.</p></div>
        <button class="kebab" data-close aria-label="Fechar"><i data-lucide="x"></i></button></div>
      <div class="modal-body">
        <div class="nc-photo">
          <label class="nc-ava" for="ncLogo" title="Adicionar logomarca">${f.logo ? `<img src="${f.logo}" alt="">` : (f.n.trim() ? initials(f.n) : '<i data-lucide="store"></i>')}
            <span class="nc-cam"><i data-lucide="camera"></i></span></label>
          <input id="ncLogo" type="file" accept="image/*" hidden>
          <div><b>Logomarca do estabelecimento</b><small>Opcional. Aparece no perfil, nos cards e nos relatórios.</small>
            <div class="nc-photo-actions"><label for="ncLogo" class="btn btn-outline btn-sm"><i data-lucide="upload"></i>${f.logo ? 'Trocar imagem' : 'Enviar imagem'}</label>
            ${f.logo ? `<button class="btn btn-ghost btn-sm" data-rmlogo>Remover</button>` : ''}</div></div>
        </div>
        <div class="form-grid">
          <div class="field full"><label for="ncN">Nome fantasia *</label><input id="ncN" data-k="n" value="${f.n}" placeholder="Ex.: Padaria Central">${err(f.n.trim(),'Informe o nome fantasia')}</div>
          <div class="field"><label for="ncT">Tipo de estabelecimento *</label><select id="ncT" data-k="t"><option value="">Selecione</option>${TIPOS_ESTAB.map(t => `<option ${f.t===t?'selected':''}>${t}</option>`).join('')}</select>${err(f.t,'Escolha o tipo')}</div>
          <div class="field"><label for="ncW">WhatsApp de contato *</label><input id="ncW" data-k="w" value="${f.w}" inputmode="tel" placeholder="(00) 0 0000-0000">${err(f.w.replace(/\D/g,'').length >= 10,'Informe um WhatsApp válido')}</div>
        </div>

        <button class="nc-sec ${openSec.extra?'open':''}" data-sec="extra"><span><b>Dados complementares</b><small>CNPJ, razão social, endereço, responsável e e-mail</small></span><i data-lucide="chevron-down"></i></button>
        ${openSec.extra ? `<div class="form-grid nc-sec-body">
          <div class="field full"><label for="ncDoc">CNPJ ou CPF</label>
            <div class="nc-inline"><input id="ncDoc" data-k="doc" value="${f.doc}" inputmode="numeric" placeholder="00.000.000/0001-00"><button class="btn btn-outline btn-sm" data-cnpj><i data-lucide="search"></i>Buscar dados</button></div>
            ${cnpjMsg ? `<small class="${cnpjMsg.ok?'f-ok':'f-warn'}">${cnpjMsg.t}</small>` : ''}</div>
          <div class="field full"><label for="ncRs">Razão social</label><input id="ncRs" data-k="rs" value="${f.rs}" placeholder="Razão social"></div>
          <div class="field"><label for="ncCep">CEP</label><input id="ncCep" data-k="cep" value="${f.cep}" inputmode="numeric" placeholder="00000-000"></div>
          <div class="field"><label for="ncEnd">Endereço completo</label><input id="ncEnd" data-k="end" value="${f.end}" placeholder="Rua, número, bairro e cidade"></div>
          <div class="field"><label for="ncResp">Nome do responsável</label><input id="ncResp" data-k="resp" value="${f.resp}" placeholder="Quem atende você"></div>
          <div class="field"><label for="ncMail">E-mail de contato</label><input id="ncMail" data-k="mail" value="${f.mail}" type="email" placeholder="empresa@exemplo.com">
            <small class="f-hint" ${f.mail.trim() ? 'hidden' : ''}>Sem e-mail, o cliente não recebe avisos por e-mail.</small></div>
        </div>` : ''}

        <button class="nc-sec ${openSec.fin?'open':''}" data-sec="fin"><span><b>Cobrança e avisos</b><small>Pode configurar agora ou depois</small></span><i data-lucide="chevron-down"></i></button>
        ${openSec.fin ? `<div class="nc-sec-body">
          <div class="setting" style="border-top:0"><div><b>Habilitar cobranças</b><small>Permite criar cobranças para este cliente</small></div><div class="switch ${f.cob?'on':''}" data-sw="cob" role="switch" aria-checked="${f.cob}"></div></div>
          ${f.cob ? `<div class="setting"><div><b>Forma de cobrança padrão</b><small>Link de pagamento: o cliente recebe um link para pagar. Apenas lembrete: só você é avisada.</small></div>
            <select class="sel" data-k="forma"><option ${f.forma==='Link de pagamento'?'selected':''}>Link de pagamento</option><option ${f.forma==='Apenas lembrete'?'selected':''}>Apenas lembrete</option></select></div>
          <div class="setting"><div><b>Avisos automáticos ao cliente</b><small>Lembrete de vencimento e confirmação de pagamento</small></div><div class="switch ${f.avisos?'on':''}" data-sw="avisos" role="switch" aria-checked="${f.avisos}"></div></div>` : ''}
          <div class="setting"><div><b>Lembretes para você</b><small>Aviso quando uma cobrança deste cliente vencer</small></div><div class="switch ${f.lembr?'on':''}" data-sw="lembr" role="switch" aria-checked="${f.lembr}"></div></div>
        </div>` : ''}
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-create><i data-lucide="check"></i>Cadastrar cliente</button></div>
    </div>`;
    icons();
    m.querySelectorAll('[data-k]').forEach(el => {
      el.addEventListener('input', () => {
        let v = el.value;
        if (el.dataset.k === 'w'){ const d = v.replace(/\D/g,'').slice(0,11); v = d.length > 10 ? `(${d.slice(0,2)}) ${d.slice(2,3)} ${d.slice(3,7)}-${d.slice(7)}` : d.length > 6 ? `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}` : d.length > 2 ? `(${d.slice(0,2)}) ${d.slice(2)}` : d; el.value = v; }
        if (el.dataset.k === 'cep'){ const d = v.replace(/\D/g,'').slice(0,8); v = d.length > 5 ? d.slice(0,5) + '-' + d.slice(5) : d; el.value = v; }
        f[el.dataset.k] = v;
        if (el.dataset.k === 'n' && !f.logo){
          m.querySelector('.nc-ava').innerHTML = (f.n.trim() ? initials(f.n) : '<i data-lucide="store"></i>') + '<span class="nc-cam"><i data-lucide="camera"></i></span>'; icons();
        }
        if (el.dataset.k === 'mail'){ const h = el.parentNode.querySelector('.f-hint'); if (h) h.hidden = !!v.trim(); }
        const er = el.parentNode.querySelector('.f-err'); if (er) er.remove();
      });
      el.addEventListener('change', () => { f[el.dataset.k] = el.value; const er = el.parentNode.querySelector('.f-err'); if (er) er.remove(); });
    });
    m.querySelector('#ncLogo').onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const r = new FileReader(); r.onload = () => { f.logo = r.result; draw(); }; r.readAsDataURL(file);
    };
  };
  m.addEventListener('click', e => {
    if (e.target === m || e.target.closest('[data-close]')) return m.remove();
    const sec = e.target.closest('[data-sec]'); if (sec){ openSec[sec.dataset.sec] = !openSec[sec.dataset.sec]; return draw(); }
    const sw = e.target.closest('[data-sw]'); if (sw){ f[sw.dataset.sw] = !f[sw.dataset.sw]; return draw(); }
    if (e.target.closest('[data-rmlogo]')){ f.logo = ''; return draw(); }
    if (e.target.closest('[data-cnpj]')){
      const d = f.doc.replace(/\D/g,'');
      if (d.length === 14){ f.rs = f.rs || (f.n.trim() ? f.n.trim() + ' Comércio de Alimentos LTDA' : 'Comércio de Alimentos LTDA'); f.end = f.end || 'Av. T-63, 1200, Setor Bueno, Goiânia - GO'; f.cep = f.cep || '74230-100';
        cnpjMsg = { ok:true, t:'Dados encontrados. Confira a razão social e o endereço antes de salvar.' }; }
      else cnpjMsg = { ok:false, t:'Não foi possível consultar este documento. Preencha os dados manualmente.' };
      return draw();
    }
    if (e.target.closest('[data-create]')){
      tried = true;
      if (!req()) return draw();
      CLIENTES.unshift({ n:f.n.trim(), t:f.t, s:1, d:'', r:'', logo:f.logo });
      m.remove();
      if (typeof PAGE !== 'undefined') PAGE = 1;
      if (typeof FILTER !== 'undefined') FILTER = 'ativos';
      go('clientes');
      toast(`${f.n.trim()} cadastrado como cliente ativo`);
    }
  });
  document.body.appendChild(m);
  draw();
  setTimeout(() => { const n = m.querySelector('#ncN'); n && n.focus(); }, 30);
}
document.addEventListener('click', e => { if (e.target.closest('[data-novo-cliente]')) openNovoCliente(); });

/* ===== Nova visita: tipo → modelo (checklist) ou início (visita técnica) ===== */
const TEMPLATES = [
  { id:'padrao-limpeza',   tag:'padrao', name:'Checklist Padrão de Limpeza', desc:'Modelo padrão do sistema para avaliação de limpeza e organização das áreas de produção.' },
  { id:'padrao-auditoria', tag:'padrao', name:'Checklist Padrão de Auditoria de Qualidade', desc:'Modelo padrão do sistema para verificação dos requisitos de qualidade e conformidade sanitária.' },
  { id:'meu-5s',           tag:'meus',   name:'Checklist Auditoria 5S', desc:'Modelo criado por você para avaliação dos princípios de organização 5S.' },
  { id:'meu-acaiteria',    tag:'meus',   name:'Checklist Diagnóstico Açaiteria', desc:'Modelo criado por você para diagnóstico completo de unidades de açaiteria.' }
];
const TEMPLATE_TAG_LABEL = { padrao:'Aptta', meus:'Meus' };
/* visitas técnicas anteriores (simulação; no app real vem do backend) */
const PREVIOUS_VISITS = {
  'Padaria Central': {
    date: '01/09/2026',
    topics: [
      { name:'Sorveteria (produção)', grade:6,
        items:[
          { text:'Manter a porta do refrigerador sempre limpa.', photos:['static/imagem1.jpg'] },
          { text:'Atentar para a data de validade dos produtos das prateleiras (03/09).', photos:[] }
        ],
        plan:{ whatToFix:'Limpeza diária da porta do refrigerador e conferência das validades.', howToFix:'Incluir os dois itens no checklist de abertura da equipe.', responsible:'estabelecimento', startDate:'01/09/2026', endDate:'08/09/2026' } },
      { name:'Confeitaria', grade:7,
        items:[ { text:'Aparas de bolo vencidas no freezer. Realizar o descarte.', photos:['static/imagem2.jpg'] } ],
        plan:null },
      { name:'Cozinha', grade:5,
        items:[
          { text:'Ralo da pia com acúmulo de sujeira.', photos:['static/imagem3.jpg', 'static/imagem4.jpg'] },
          { text:'', photos:['static/imagem5.jpg'] }
        ],
        plan:{ whatToFix:'Higienização do ralo e da pia ao fim de cada turno.', howToFix:'Definir escala de limpeza e treinar a equipe da cozinha.', responsible:'estabelecimento', startDate:'01/09/2026', endDate:'15/09/2026' } },
      { name:'Panificação e câmara fria', grade:4,
        items:[ { text:'Caixas de papelão (manteigas) diretamente no piso da câmara.', photos:['static/imagem6.jpg'] } ],
        plan:{ whatToFix:'Retirar caixas do piso e armazenar em estrados.', howToFix:'Comprar estrados plásticos e reorganizar a câmara.', responsible:'externo', startDate:'01/09/2026', endDate:'30/09/2026' } },
      { name:'Estoque', grade:8,
        items:[ { text:'Bolacha Maizena vencendo em 19/10/26, aproximadamente 20 unidades.', photos:[] } ],
        plan:null }
    ]
  }
};

function openNovaVisita(fromHome){
  fromHome = fromHome === true;
  let cIdx = fromHome ? null : CURRENT;
  let client = cIdx === null ? null : CLIENTES[cIdx].n;
  let last = client ? (PREVIOUS_VISITS[client] || null) : null;
  let step = fromHome ? 'client' : 'type', type = null, tpl = null, start = null, wip = false, q = '';
  const m = document.createElement('div');
  m.className = 'modal';
  const opt = (attr, val, on, ic, title, sub, desc, dashed) => `
    <button class="nv-opt ${on?'on':''}" ${attr}="${val}">
      <span class="ic ${dashed?'dashed':''}"><i data-lucide="${ic}"></i></span>
      <span class="txt"><b>${title}</b>${sub ? `<span class="sub">${sub}</span>` : ''}<small>${desc}</small></span>
      <span class="radio"></span>
    </button>`;
  const head = (title, sub, back) => `
    <div class="modal-head"><div>
      ${back ? `<button class="nv-back" data-nv-back><i data-lucide="arrow-left"></i>Voltar</button><div style="height:10px"></div>` : ''}
      <h3 id="nvTitle">${title}</h3><p>${sub}</p></div>
      <button class="kebab" data-close aria-label="Fechar"><i data-lucide="x"></i></button></div>`;
  const draw = () => {
    let body, ok;
    if (step === 'client'){
      ok = cIdx !== null;
      const list = CLIENTES.map((c, i) => ({ c, i })).filter(x => x.c.s);
      body = head('Nova visita', 'Para qual cliente é esta visita?') + `<div class="modal-body">
        <div class="nv-search"><i data-lucide="search"></i><input id="nvQ" type="text" placeholder="Buscar cliente" value="${q}" autocomplete="off"></div>
        <div class="nv-clients">${list.map(x => `<button class="nv-client ${cIdx===x.i?'on':''}" data-client="${x.i}" data-name="${x.c.n.toLowerCase()} ${x.c.t.toLowerCase()}">
            <span class="cc-ava">${clientFace(x.c)}</span><span class="txt"><b>${x.c.n}</b><small>${x.c.t}</small></span><span class="radio"></span></button>`).join('')}
          <p class="nv-none" hidden>Nenhum cliente encontrado.</p></div>
      </div>`;
    } else if (step === 'type'){
      ok = !!type;
      body = head(fromHome ? 'Tipo de visita' : 'Nova visita', 'Escolha como você quer fazer a avaliação de ' + client, fromHome) + `<div class="modal-body"><div class="nv-list">
        ${opt('data-type','checklist', type==='checklist', 'list-checks', 'Checklist', 'Avaliação guiada', 'Responda aos itens definidos para garantir que todos os pontos sejam verificados.')}
        ${opt('data-type','visita', type==='visita', 'notebook-pen', 'Visita técnica', 'Você define o que registrar', 'Registre observações, fotos e informações relevantes conforme a visita.')}
      </div></div>`;
    } else if (step === 'template'){
      ok = !!tpl;
      body = head('Escolha o modelo', 'Selecione o modelo de checklist que será aplicado nesta visita', true) + `<div class="modal-body"><div class="nv-list">
        ${TEMPLATES.map(t => `<button class="nv-opt ${tpl===t.id?'on':''}" data-tpl="${t.id}">
          <span class="ic"><i data-lucide="${t.tag==='padrao'?'clipboard-check':'clipboard-pen'}"></i></span>
          <span class="txt"><b>${t.name}</b><small>${t.desc}</small><span class="tag ${t.tag==='padrao'?'green':'gray'}">${TEMPLATE_TAG_LABEL[t.tag]}</span></span>
          <span class="radio"></span></button>`).join('')}
        <button class="nv-opt new" data-new-tpl>
          <span class="ic dashed"><i data-lucide="plus"></i></span>
          <span class="txt"><b>Criar novo modelo</b><small>Você poderá montar seus próprios modelos na página do seu perfil.</small></span></button>
        ${wip ? `<div class="nv-note"><i data-lucide="info"></i>A criação de modelos personalizados ainda está sendo implementada. Em breve isso estará disponível no seu perfil.</div>` : ''}
      </div></div>`;
    } else {
      ok = !!start;
      body = head('Como quer começar?', client + ' já tem uma visita técnica registrada', true) + `<div class="modal-body"><div class="nv-list">
        ${opt('data-start','anterior', start==='anterior', 'history', 'Partir da última visita', 'Visita de ' + last.date, 'Os mesmos tópicos, sem apontamentos. Dentro de cada um você vê o que foi registrado da última vez.')}
        ${opt('data-start','zero', start==='zero', 'plus', 'Começar do zero', '', 'Nenhum tópico pronto. Você cria cada um conforme avança pela visita.', true)}
      </div></div>`;
    }
    m.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="nvTitle">${body}
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" data-nv-go ${ok?'':'disabled'}>Continuar</button></div></div>`;
    icons();
    const qi = m.querySelector('#nvQ');
    if (qi){
      const filter = () => { q = qi.value; const t = q.trim().toLowerCase(); let n = 0;
        m.querySelectorAll('[data-client]').forEach(b => { const show = !t || b.dataset.name.includes(t); b.hidden = !show; if (show) n++; });
        m.querySelector('.nv-none').hidden = n > 0; };
      qi.oninput = filter; filter();
      if (!q) setTimeout(() => qi.focus(), 30);
    }
  };
  const leave = (url) => {
    try{ localStorage.setItem('apttaRetornoCliente', fromHome ? 'inicio' : String(cIdx)); }catch(e){}
    window.location.href = url;
  };
  const startVisit = mode => {
    const payload = { mode, client };
    if (mode === 'anterior' && last) payload.previous = last;
    try{ localStorage.setItem('visitaTecnicaInicio', JSON.stringify(payload)); }catch(e){}
    leave('visita-tecnica.html');
  };
  m.addEventListener('click', e => {
    if (e.target === m || e.target.closest('[data-close]')) return m.remove();
    if (e.target.closest('[data-nv-back]')){
      if (step === 'type'){ step = 'client'; type = null; return draw(); }
      step = 'type'; tpl = null; start = null; wip = false; return draw(); }
    const cl = e.target.closest('[data-client]'); if (cl){ cIdx = +cl.dataset.client; client = CLIENTES[cIdx].n; last = PREVIOUS_VISITS[client] || null; return draw(); }
    const t = e.target.closest('[data-type]'); if (t){ type = t.dataset.type; return draw(); }
    const tp = e.target.closest('[data-tpl]'); if (tp){ tpl = tpl === tp.dataset.tpl ? null : tp.dataset.tpl; return draw(); }
    if (e.target.closest('[data-new-tpl]')){ wip = true; return draw(); }
    const st = e.target.closest('[data-start]'); if (st){ start = st.dataset.start; return draw(); }
    const go = e.target.closest('[data-nv-go]');
    if (go && !go.disabled){
      if (step === 'client'){ step = 'type'; return draw(); }
      if (step === 'type'){
        if (type === 'checklist'){ step = 'template'; return draw(); }
        if (last){ step = 'start'; return draw(); }
        return startVisit('zero');
      }
      if (step === 'template'){
        const t = TEMPLATES.find(x => x.id === tpl);
        try{ localStorage.setItem('checklistTemplateAtivo', JSON.stringify({ id:t.id, name:t.name, tag:t.tag, client })); }catch(err){}
        return leave('checklist.html');
      }
      return startVisit(start);
    }
  });
  document.body.appendChild(m);
  draw();
}

/* inicia: volta para o cliente quando a pessoa sai de uma visita */
(function(){
  let back = null;
  try{ back = localStorage.getItem('apttaRetornoCliente'); localStorage.removeItem('apttaRetornoCliente'); }catch(e){}
  if (back === 'inicio') go('inicio');
  else if (back !== null && CLIENTES[+back]){ go('clientes'); CURRENT = +back; PVIEW = 'visitas'; renderProfile(); }
  else go('inicio');
})();
