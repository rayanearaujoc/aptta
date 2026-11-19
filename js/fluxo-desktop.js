/* Checklist no computador: índice das categorias com progresso, ao lado das perguntas */
(function(){
  const app = document.querySelector('.app');
  const body = document.getElementById('questions-container');
  if (!app || !body) return;
  const aside = document.createElement('nav');
  aside.className = 'ck-aside';
  aside.setAttribute('aria-label', 'Categorias do checklist');
  app.appendChild(aside);
  let busy = false;

  function groups(){
    const out = [];
    let cur = null;
    [...body.children].forEach(el => {
      if (el.classList.contains('category-header')){ cur = { el, name: el.textContent.trim(), total: 0, done: 0 }; out.push(cur); }
      else if (cur && el.classList.contains('q-card')){ cur.total++; if (el.classList.contains('answered')) cur.done++; }
    });
    return out;
  }
  function place(){
    const h = document.getElementById('app-header') || document.querySelector('.header');
    aside.style.top = ((h ? h.offsetHeight : 90) + 24) + 'px';
  }
  function draw(){
    if (busy) return; busy = true;
    const g = groups();
    app.classList.toggle('has-aside', g.length > 1);
    aside.style.display = g.length > 1 ? '' : 'none';
    if (g.length > 1){
      const top = body.scrollTop + 40;
      let active = 0;
      g.forEach((x, i) => { if (x.el.offsetTop <= top) active = i; });
      aside.innerHTML = '<h4>Categorias</h4>' + g.map((x, i) =>
        `<button type="button" data-i="${i}" class="${i === active ? 'active' : ''} ${x.done === x.total ? 'done' : ''}"><span>${x.name}</span><span>${x.done}/${x.total}</span></button>`).join('');
      aside.querySelectorAll('button').forEach(b => b.onclick = () => {
        const el = g[+b.dataset.i].el;
        body.scrollTo({ top: el.offsetTop - 8, behavior: 'smooth' });
      });
      place();
    }
    busy = false;
  }
  new MutationObserver(() => requestAnimationFrame(draw)).observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  body.addEventListener('scroll', () => requestAnimationFrame(draw), { passive: true });
  window.addEventListener('resize', place);
  draw();
})();
