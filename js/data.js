/* =========================================================
   Aptta — dados de exemplo e helpers compartilhados
   ========================================================= */
const CLIENTES = [
  {n:"Padaria Central", t:"Padaria", s:1, d:"30/09/2026", r:"Há 4 dias"},
  {n:"Açaiteria Tropical", t:"Açaiteria", s:0, d:"25/09/2026", r:"Há 9 dias"},
  {n:"Nostra Pizzaria", t:"Pizzaria", s:1, d:"27/08/2026", r:"Há 1 mês", ov:1},
  {n:"Buffet Festa & Sabor", t:"Buffet", s:1, d:"12/08/2026", r:"Há 1 mês"},
  {n:"Restaurante Sabor do Cerrado", t:"Restaurante", s:1, d:"26/07/2026", r:"Há 2 meses"},
  {n:"Moriá pães", t:"Padaria", s:1, d:"22/07/2026", r:"Há 2 meses"},
  {n:"Escola Aprender", t:"Cantina Escolar", s:1, d:"10/07/2026", r:"Há 2 meses"},
  {n:"Restaurante Sabor Caseiro", t:"Restaurante", s:1, d:"27/06/2026", r:"Há 3 meses"},
  {n:"Lanchonete Bom Gosto", t:"Lanchonete", s:0, d:"12/06/2026", r:"Há 3 meses"},
  {n:"Pense Gelado", t:"Sorveteria", s:1, d:"04/06/2026", r:"Há 3 meses"},
  {n:"Nossa senhora Aparecida P.", t:"Lanchonete", s:1, d:"27/03/2026", r:"Há 6 meses"},
  {n:"Cafeteria Grão Dourado", t:"Cafeteria", s:1, d:"01/03/2026", r:""},
  {n:"Empório Bela Vista", t:"Empório", s:0, d:"12/08/2025", r:"Há 1 ano"},
];

const initials = (name)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const money = v=>'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2});

/* foto do cliente: logomarca enviada ou iniciais (verde escuro, letra clara) */
function clientFace(c){ return c.logo ? `<img src="${c.logo}" alt="">` : initials(c.n); }
