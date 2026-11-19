/* =========================================================
   Aptta — Modelos de checklist (HU_F5.1 e HU_F5.8)
   Lista de modelos (próprios e padrão) e editor: informações,
   opções de resposta (com a que indica não conformidade) e
   seções com seus itens.
   ========================================================= */
const ROLES = {
  C:  { label:'Conforme',       hint:'' },
  NC: { label:'Não conforme',   hint:'Libera o plano de ação' },
  NA: { label:'Não se aplica',  hint:'' },
};
const DEFAULT_OPTIONS = () => [{ label:'C', role:'C' }, { label:'N/C', role:'NC' }, { label:'N/A', role:'NA' }];
const TIPOS_MODELO = ['Todos os tipos','Restaurante','Padaria e confeitaria','Pizzaria','Lanchonete','Cafeteria','Cozinha industrial','Hotel','Escola','Indústria de alimentos','Açaiteria','Sorveteria'];

const MODELOS = [
  { id:'padrao-limpeza', tag:'padrao', name:'Checklist Padrão de Limpeza', tipo:'Todos os tipos', lei:'RDC 216/2004',
    desc:'Modelo padrão do sistema para avaliação de limpeza e organização das áreas de produção.', updated:'01/10/2026',
    options: DEFAULT_OPTIONS(), sections: [], count:{ s:8, i:27 } },
  { id:'padrao-auditoria', tag:'padrao', name:'Checklist Padrão de Auditoria de Qualidade', tipo:'Todos os tipos', lei:'RDC 275/2002',
    desc:'Modelo padrão do sistema para verificação dos requisitos de qualidade e conformidade sanitária.', updated:'01/10/2026',
    options: DEFAULT_OPTIONS(), sections: [], count:{ s:8, i:27 } },
  { id:'meu-5s', tag:'meus', name:'Checklist Auditoria 5S', tipo:'Todos os tipos', lei:'',
    desc:'Modelo criado por você para avaliação dos princípios de organização 5S.', updated:'12/09/2026',
    options:[{ label:'Sim', role:'C' }, { label:'Não', role:'NC' }, { label:'N/A', role:'NA' }],
    sections:[
      { name:'Utilização (Seiri)', items:['Só existem na área os materiais necessários para o trabalho.','Itens sem uso foram identificados e retirados.'] },
      { name:'Organização (Seiton)', items:['Cada utensílio tem um lugar definido e identificado.','Os produtos estão armazenados por ordem de validade.'] },
      { name:'Limpeza (Seiso)', items:['Bancadas e equipamentos estão limpos ao fim do turno.','Existe escala de limpeza visível e preenchida.'] },
    ] },
  { id:'meu-acaiteria', tag:'meus', name:'Checklist Diagnóstico Açaiteria', tipo:'Açaiteria', lei:'RDC 216/2004',
    desc:'Modelo criado por você para diagnóstico completo de unidades de açaiteria.', updated:'28/08/2026',
    options: DEFAULT_OPTIONS(),
    sections:[
      { name:'Recebimento', items:['A polpa chega congelada, abaixo de −18 °C.','As embalagens chegam íntegras e identificadas.'] },
      { name:'Manipulação', items:['A polpa é descongelada sob refrigeração.','Os manipuladores usam touca e luvas no preparo.','Os acompanhamentos ficam protegidos e refrigerados.'] },
    ] },
];
const modelCount = m => m.sections.length
  ? { s: m.sections.length, i: m.sections.reduce((a, s) => a + s.items.filter(x => x.trim()).length, 0) }
  : (m.count || { s:0, i:0 });

let MOD_TAB = 'meus', EDIT = null, EDIT_ERR = false;
const escM = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');

/* ---------- lista ---------- */
function renderModelos(){
  const meus = MODELOS.filter(m => m.tag === 'meus').length, padrao = MODELOS.length - meus;
  return `
    <div class="toolbar">
      <div class="pills pills-box" id="modTabs">
        <button data-t="meus" class="${MOD_TAB==='meus'?'active':''}">Meus modelos<span class="n">${meus}</span></button>
        <button data-t="padrao" class="${MOD_TAB==='padrao'?'active':''}">Padrão Aptta<span class="n">${padrao}</span></button>
      </div>
      <span class="spacer"></span>
      <button class="btn btn-primary page-primary" data-mod-new><i data-lucide="plus"></i>Criar modelo</button>
    </div>
    <div id="modList">${modelList()}</div>`;
}
function modelList(){
  const list = MODELOS.filter(m => m.tag === MOD_TAB);
  if (!list.length) return `<div class="card"><div class="placeholder"><div class="ic"><i data-lucide="clipboard-list"></i></div>
    <h3>Você ainda não tem modelos</h3><p>Crie um modelo com as seções e os itens que você costuma avaliar.</p>
    <button class="btn btn-primary btn-sm" data-mod-new style="margin-top:14px"><i data-lucide="plus"></i>Criar modelo</button></div></div>`;
  return `<div class="mod-grid">${list.map(m => { const c = modelCount(m); return `
    <div class="card mod-card">
      <div class="mod-top"><span class="mod-ic"><i data-lucide="${m.tag==='padrao'?'clipboard-check':'clipboard-pen'}"></i></span>
        <span class="tag ${m.tag==='padrao'?'green':'gray'}">${m.tag==='padrao'?'Padrão Aptta':'Meu modelo'}</span></div>
      <b class="mod-name">${escM(m.name)}</b>
      <p class="mod-desc">${escM(m.desc)}</p>
      <div class="mod-meta"><span>${c.s} seções</span><span>${c.i} itens</span>${m.lei ? `<span>${escM(m.lei)}</span>` : ''}</div>
      <div class="mod-answers">${m.options.map(o => `<span class="ans-pill ${o.role==='NC'?'nc':''}">${escM(o.label)}</span>`).join('')}</div>
      <div class="mod-foot"><small>Atualizado em ${m.updated}</small>
        ${m.tag === 'meus'
          ? `<button class="btn btn-outline btn-sm" data-mod-edit="${m.id}"><i data-lucide="pencil"></i>Editar</button>`
          : `<button class="btn btn-outline btn-sm" data-mod-dup="${m.id}"><i data-lucide="copy"></i>Usar como base</button>`}
      </div>
    </div>`; }).join('')}</div>`;
}
function wireModelos(){
  const box = document.getElementById('modTabs');
  if (box) box.querySelectorAll('button').forEach(b => b.onclick = () => {
    MOD_TAB = b.dataset.t; box.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    document.getElementById('modList').innerHTML = modelList(); icons();
  });
}
document.addEventListener('click', e => {
  if (e.target.closest('[data-mod-new]')) return openEditor(null);
  const ed = e.target.closest('[data-mod-edit]'); if (ed) return openEditor(ed.dataset.modEdit);
  const du = e.target.closest('[data-mod-dup]'); if (du) return openEditor(du.dataset.modDup, true);
});

/* ---------- editor ---------- */
function openEditor(id, duplicate){
  go('visitas-modelos');
  const src = id ? MODELOS.find(m => m.id === id) : null;
  if (src){
    EDIT = JSON.parse(JSON.stringify(src));
    if (!EDIT.sections.length) EDIT.sections = defaultSectionsFor(src);
    if (duplicate){ EDIT.id = null; EDIT.tag = 'meus'; EDIT.name = src.name.replace('Checklist Padrão', 'Checklist') + ' (cópia)'; }
  } else {
    EDIT = { id:null, tag:'meus', name:'', desc:'', tipo:'Todos os tipos', lei:'', options: DEFAULT_OPTIONS(), sections:[{ name:'', items:[''] }] };
  }
  EDIT_ERR = false;
  drawEditor();
}
function defaultSectionsFor(m){
  return [
    { name:'Higiene e Segurança', items:['As instalações, os equipamentos, os móveis e os utensílios são mantidos em condições higiênico-sanitárias apropriadas?','O descarte dos resíduos atende ao disposto em legislação específica?'] },
    { name:'Armazenamento e Controle', items:['As matérias-primas e ingredientes são armazenados seguindo o critério de validade (FIFO/FEFO)?'] },
  ];
}
function drawEditor(){
  document.getElementById('pageTitle').textContent = 'Modelos de checklist';
  app.classList.remove('has-fab');
  app.classList.add('in-detail');
  const c = modelCount(EDIT), hasNC = EDIT.options.some(o => o.role === 'NC');
  const nameErr = EDIT_ERR && !EDIT.name.trim(), itemsErr = EDIT_ERR && c.i === 0, ncErr = EDIT_ERR && !hasNC;
  content.innerHTML = `
    <div class="v-gap mod-editor">
      <div><button class="back" data-mod-back><i data-lucide="arrow-left"></i>Voltar para modelos</button></div>
      <div class="section-head"><div><h3>${EDIT.id ? 'Editar modelo' : 'Novo modelo'}</h3><p>As mudanças valem para as próximas aplicações. Checklists já feitos não mudam.</p></div></div>

      <div class="mod-layout">
        <div class="mod-side">
          <div class="card">
            <div class="card-head"><div><div class="card-title">Informações</div></div></div>
            <div class="form-grid" style="grid-template-columns:1fr">
              <div class="field"><label for="mName">Nome do modelo *</label><input id="mName" data-f="name" value="${escM(EDIT.name)}" placeholder="Ex.: Checklist de cozinha industrial">${nameErr ? '<small class="f-err">Dê um nome ao modelo</small>' : ''}</div>
              <div class="field"><label for="mDesc">Descrição</label><input id="mDesc" data-f="desc" value="${escM(EDIT.desc)}" placeholder="Para que serve este modelo"></div>
              <div class="field"><label for="mTipo">Tipo de estabelecimento</label><select id="mTipo" data-f="tipo">${TIPOS_MODELO.map(t => `<option ${EDIT.tipo===t?'selected':''}>${t}</option>`).join('')}</select></div>
              <div class="field"><label for="mLei">Legislação de referência</label><input id="mLei" data-f="lei" value="${escM(EDIT.lei)}" placeholder="Ex.: RDC 216/2004"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-head"><div><div class="card-title">Opções de resposta</div><div class="card-sub">Valem para todos os itens. Marque qual resposta indica não conformidade: ela libera o plano de ação.</div></div></div>
            <div class="opt-list">${EDIT.options.map((o, i) => `
              <div class="opt-row ${o.role==='NC'?'is-nc':''}">
                <input data-opt-label="${i}" value="${escM(o.label)}" maxlength="14" aria-label="Texto da resposta ${i+1}" placeholder="Resposta">
                <select data-opt-role="${i}" aria-label="O que essa resposta significa">${Object.entries(ROLES).map(([k, r]) => `<option value="${k}" ${o.role===k?'selected':''}>${r.label}</option>`).join('')}</select>
                <button class="icon-del" data-opt-del="${i}" ${EDIT.options.length <= 2 ? 'disabled' : ''} aria-label="Remover resposta"><i data-lucide="x"></i></button>
                ${o.role==='NC' ? '<small class="opt-hint"><i data-lucide="list-todo"></i>Gera plano de ação</small>' : ''}
              </div>`).join('')}</div>
            ${ncErr ? '<small class="f-err" style="display:block;margin-top:8px">Marque pelo menos uma resposta como “Não conforme”.</small>' : ''}
            ${EDIT.options.length < 5 ? '<button class="btn btn-ghost btn-sm" data-opt-add style="margin-top:10px"><i data-lucide="plus"></i>Adicionar resposta</button>' : ''}
            <div class="opt-preview"><small>Como aparece no checklist</small>
              <div class="opt-preview-row">${EDIT.options.map(o => `<span class="ans-pill ${o.role==='NC'?'nc':''}">${escM(o.label) || '—'}</span>`).join('')}</div></div>
          </div>
        </div>

        <div class="mod-main">
          ${EDIT.sections.map((s, si) => `
            <div class="card sec-card">
              <div class="sec-head">
                <span class="sec-num">${si + 1}</span>
                <input class="sec-name" data-sec-name="${si}" value="${escM(s.name)}" placeholder="Nome da seção (ex.: Cozinha)" aria-label="Nome da seção ${si+1}">
                <div class="sec-tools">
                  <button class="icon-del" data-sec-up="${si}" ${si===0?'disabled':''} aria-label="Subir seção"><i data-lucide="arrow-up"></i></button>
                  <button class="icon-del" data-sec-down="${si}" ${si===EDIT.sections.length-1?'disabled':''} aria-label="Descer seção"><i data-lucide="arrow-down"></i></button>
                  <button class="icon-del danger" data-sec-del="${si}" aria-label="Excluir seção"><i data-lucide="trash-2"></i></button>
                </div>
              </div>
              <div class="item-list">${s.items.map((it, ii) => `
                <div class="item-row">
                  <span class="item-num">${ii + 1}</span>
                  <textarea rows="1" data-item="${si}:${ii}" placeholder="Escreva o item a ser avaliado" aria-label="Item ${ii+1} da seção ${si+1}">${escM(it)}</textarea>
                  <button class="icon-del" data-item-del="${si}:${ii}" aria-label="Excluir item"><i data-lucide="x"></i></button>
                </div>`).join('')}</div>
              <button class="btn btn-ghost btn-sm" data-item-add="${si}"><i data-lucide="plus"></i>Adicionar item</button>
            </div>`).join('')}
          ${itemsErr ? '<small class="f-err">Adicione pelo menos um item ao modelo.</small>' : ''}
          <button class="add-sec" data-sec-add><i data-lucide="plus"></i>Adicionar seção</button>
        </div>
      </div>

      <div class="mod-bar">
        <span class="mod-count">${c.s} ${c.s===1?'seção':'seções'} · ${c.i} ${c.i===1?'item':'itens'}</span>
        <div><button class="btn btn-ghost" data-mod-back>Cancelar</button><button class="btn btn-primary" data-mod-save><i data-lucide="check"></i>Salvar modelo</button></div>
      </div>
    </div>`;
  icons();
  wireEditor();
  content.querySelectorAll('.item-row textarea').forEach(autoGrow);
}
function autoGrow(t){ t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }
function refreshCount(){
  const c = modelCount(EDIT), el = content.querySelector('.mod-count');
  if (el) el.textContent = `${c.s} ${c.s===1?'seção':'seções'} · ${c.i} ${c.i===1?'item':'itens'}`;
}
function wireEditor(){
  content.querySelectorAll('[data-f]').forEach(el => el.addEventListener('input', () => { EDIT[el.dataset.f] = el.value; }));
  content.querySelectorAll('[data-opt-label]').forEach(el => el.addEventListener('input', () => {
    EDIT.options[+el.dataset.optLabel].label = el.value;
    content.querySelectorAll('.opt-preview .ans-pill')[+el.dataset.optLabel].textContent = el.value || '—';
  }));
  content.querySelectorAll('[data-opt-role]').forEach(el => el.addEventListener('change', () => { EDIT.options[+el.dataset.optRole].role = el.value; drawEditor(); }));
  content.querySelectorAll('[data-sec-name]').forEach(el => el.addEventListener('input', () => { EDIT.sections[+el.dataset.secName].name = el.value; }));
  content.querySelectorAll('[data-item]').forEach(el => {
    el.addEventListener('input', () => { const [s, i] = el.dataset.item.split(':').map(Number); EDIT.sections[s].items[i] = el.value; autoGrow(el); refreshCount(); });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        const [s, i] = el.dataset.item.split(':').map(Number);
        EDIT.sections[s].items.splice(i + 1, 0, '');
        drawEditor();
        const next = content.querySelector(`[data-item="${s}:${i+1}"]`); next && next.focus();
      }
    });
  });
}
content.addEventListener('click', e => {
  if (!EDIT || !content.querySelector('.mod-editor')) return;
  const t = e.target.closest('button'); if (!t) return;
  const d = t.dataset;
  if ('modBack' in d){ EDIT = null; return go('visitas-modelos'); }
  if ('optAdd' in d){ EDIT.options.push({ label:'', role:'C' }); return drawEditor(); }
  if (d.optDel != null){ EDIT.options.splice(+d.optDel, 1); return drawEditor(); }
  if ('secAdd' in d){ EDIT.sections.push({ name:'', items:[''] }); drawEditor(); const n = content.querySelectorAll('.sec-name'); n[n.length-1].focus(); return; }
  if (d.secDel != null){ EDIT.sections.splice(+d.secDel, 1); if (!EDIT.sections.length) EDIT.sections.push({ name:'', items:[''] }); return drawEditor(); }
  if (d.secUp != null){ const i = +d.secUp; [EDIT.sections[i-1], EDIT.sections[i]] = [EDIT.sections[i], EDIT.sections[i-1]]; return drawEditor(); }
  if (d.secDown != null){ const i = +d.secDown; [EDIT.sections[i+1], EDIT.sections[i]] = [EDIT.sections[i], EDIT.sections[i+1]]; return drawEditor(); }
  if (d.itemAdd != null){ const s = +d.itemAdd; EDIT.sections[s].items.push(''); drawEditor(); const n = content.querySelector(`[data-item="${s}:${EDIT.sections[s].items.length-1}"]`); n && n.focus(); return; }
  if (d.itemDel != null){ const [s, i] = d.itemDel.split(':').map(Number); EDIT.sections[s].items.splice(i, 1); return drawEditor(); }
  if ('modSave' in d){
    const c = modelCount(EDIT);
    if (!EDIT.name.trim() || !c.i || !EDIT.options.some(o => o.role === 'NC')){ EDIT_ERR = true; drawEditor(); const er = content.querySelector('.f-err'); er && er.scrollIntoView({ block:'center', behavior:'smooth' }); return; }
    EDIT.options = EDIT.options.map(o => ({ label: o.label.trim() || ROLES[o.role].label, role: o.role }));
    EDIT.sections = EDIT.sections.map(s => ({ name: s.name.trim() || 'Sem nome', items: s.items.map(x => x.trim()).filter(Boolean) })).filter(s => s.items.length);
    EDIT.updated = new Date().toLocaleDateString('pt-BR');
    if (!EDIT.desc.trim()) EDIT.desc = 'Modelo criado por você.';
    if (EDIT.id){ const k = MODELOS.findIndex(m => m.id === EDIT.id); MODELOS[k] = EDIT; }
    else { EDIT.id = 'meu-' + Date.now(); MODELOS.push(EDIT); }
    const nome = EDIT.name; EDIT = null; MOD_TAB = 'meus';
    go('visitas-modelos'); toast(`Modelo “${nome}” salvo`);
  }
});
