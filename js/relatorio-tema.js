/* =========================================================
   Aptta — tema do relatório (checklist e visita técnica)
   Pensado para imprimir: fundo branco, texto escuro, cor só como acento.
   A marca em destaque é a da consultora; o símbolo da Aptta fica pequeno no rodapé.
   ========================================================= */
(function(){
  const MARK = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 62"><path fill="#9AA19D" d="M51.334 0C57.0037 0.00020936 61.5996 4.59684 61.5996 10.2666V61.5986H43.8672C38.1973 61.5986 33.6006 57.002 33.6006 51.332V25.666H0.000976562V9.1416C0.00118129 4.09287 4.09478 0 9.14355 0H51.334ZM26.0137 48.9902C26.0137 55.953 20.369 61.5975 13.4062 61.5977H0V45.5908C3.00486e-05 38.628 5.64465 32.9835 12.6074 32.9834H26.0137V48.9902Z"/></svg>');
  const CSS = `
  .r-page{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;color:#181B19;font-size:11px}
  .r-page *{-webkit-print-color-adjust:exact;print-color-adjust:exact}

  /* cabeçalho: marca da consultora */
  .r-topband{display:block !important;background:none !important;padding:0 0 14px !important;margin:0 !important;border-bottom:1px solid #E5E7E3}
  .r-topband:has(> .r-clogo),.r-topband > div:has(> .r-clogo){display:grid !important;grid-template-columns:auto 1fr;column-gap:12px;align-items:center}
  .r-clogo{grid-row:span 2;width:44px;height:44px;border-radius:10px;border:1px solid #E5E7E3;background:#fff;display:grid;place-items:center;overflow:hidden;
    font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:15px;color:#181B19}
  .r-clogo img{width:100%;height:100%;object-fit:contain}
  .r-consult-name{color:#181B19 !important;font-size:12.5px !important;font-weight:700 !important;margin:0 !important;align-self:end}
  .r-consult-sub{color:#6B726E !important;font-size:10px !important;margin:1px 0 0 !important;align-self:start}

  /* título e dados */
  .r-eyebrow{display:block !important;background:none !important;color:#0F6E56 !important;padding:0 !important;border-radius:0 !important;font-size:9.5px !important;letter-spacing:.8px !important;margin:20px 0 6px !important;font-weight:700 !important}
  .r-title{font-family:'Playfair Display',Georgia,serif !important;font-weight:700 !important;font-size:19px !important;line-height:1.25 !important;color:#181B19 !important;margin:0 0 16px !important}
  .r-meta-grid{background:none !important;border-radius:0 !important;padding:0 !important;gap:8px 28px !important;margin-bottom:18px !important}
  .r-meta-item .k{color:#6B726E !important;font-size:9.5px !important;font-weight:600 !important}
  .r-meta-item .v{color:#181B19 !important;font-size:11.5px !important}

  /* números do resumo: sem fundos, só divisórias */
  .r-summary{gap:0 !important;border:1px solid #E5E7E3;border-radius:10px;overflow:hidden;margin-bottom:16px !important;flex-wrap:nowrap !important}
  .r-summary-card{flex:1 !important;border:0 !important;border-right:1px solid #E5E7E3 !important;border-radius:0 !important;background:#fff !important;padding:10px 6px !important;min-width:0 !important}
  .r-summary-card:last-child{border-right:0 !important}
  .r-summary-card .num{color:#181B19 !important;font-size:17px !important}
  .r-summary-card .lbl{color:#6B726E !important;font-size:9px !important}
  .r-summary-card.ok .num{color:#0F6E56 !important}
  .r-summary-card.nc .num{color:#B3352F !important}
  .r-summary-card.pct{background:#fff !important}
  .r-summary-card.pct .num{color:#0F6E56 !important}.r-summary-card.pct .lbl{color:#6B726E !important}

  /* gráficos */
  .r-chart-box{border:1px solid #E5E7E3 !important;background:#fff !important;border-radius:10px !important;padding:12px 14px !important;margin-bottom:12px !important}
  .r-chart-box h4{font-family:'Open Sans',sans-serif !important;font-size:10.5px !important;font-weight:700 !important;color:#181B19 !important;margin:0 0 10px !important}
  .r-pie-row svg{max-width:120px;height:auto}
  .r-pie-legend-item{font-size:9.5px !important}
  .r-bar-list{gap:8px !important}
  .r-bar-head .cat-label,.r-bar-head .bar-pct{font-size:10px !important}
  .r-bar-track{background:#EEF0EC !important;height:5px !important;border-radius:999px !important}
  .r-bar-fill{background:#1D9E75 !important;border-radius:999px !important}
  .r-footer{border-top-color:#E5E7E3 !important;margin-top:14px !important}
  .r-footer-tag{font-size:8.5px !important;color:#9AA19D !important}
  .r-footer-tag:last-child{display:flex;align-items:center;gap:5px}
  .r-footer-tag:last-child::before{content:'';width:10px;height:10px;background:url("${MARK}") center/contain no-repeat}
  .r-footer-tag b{color:#6B726E !important}

  /* seções */
  .r-section-title{font-family:'Playfair Display',Georgia,serif !important;font-size:15px !important;font-weight:700 !important;color:#181B19 !important;padding:0 0 8px !important;margin:0 0 12px !important;border-bottom:1px solid #E5E7E3;display:block}
  .r-intro{color:#4D534F !important;font-size:10.5px !important;line-height:1.55 !important;margin:0 0 14px !important}
  .r-category-title{background:none !important;color:#181B19 !important;border-radius:0 !important;padding:0 0 6px !important;border-left:0;border-bottom:1.5px solid #181B19;font-size:12.5px !important;font-weight:700 !important;margin:20px 0 10px !important}
  .r-category-title::after{display:none !important}
  .r-category-title .r-cat-grade{margin-left:auto;background:none !important;color:#0F6E56 !important;border:1px solid #D3EBE0;font-size:9.5px !important;padding:2px 8px !important}
  .r-category-title .r-cat-grade.none{color:#9AA19D !important;border-color:#E5E7E3}

  /* apontamentos */
  .r-item{padding:10px 0 !important}
  .r-item + .r-item{border-top:1px solid #EEF0EC !important}
  .r-item-text{color:#181B19 !important;font-size:11px !important;line-height:1.5 !important}
  .r-nc-label{display:inline-block !important;background:none !important;color:#B3352F !important;padding:0 !important;font-size:9px !important;margin:0 0 4px !important}
  .r-item-comment{background:none !important;border-left:2px solid #E5E7E3 !important;border-radius:0 !important;padding:2px 0 2px 10px !important;font-style:normal !important;color:#4D534F !important;font-size:10.5px !important}

  /* não conformidade: pergunta + fotos grandes + observação + plano */
  .r-find{padding:16px 0 22px;border-bottom:1px solid #E5E7E3;break-inside:avoid;page-break-inside:avoid}
  .r-find + .r-find{margin-top:6px}
  .r-find:last-child{border-bottom:0}
  .r-find-q{margin:0 0 10px;font-size:11.5px;line-height:1.5;font-weight:600;color:#181B19}
  .r-find-tag{display:inline-block;margin-right:8px;padding:1px 7px;border-radius:999px;border:1px solid #F0C9C6;color:#B3352F;font-size:9px;font-weight:700;vertical-align:1px}
  .r-find-photos,.r-item-photos{display:grid !important;grid-template-columns:repeat(3,minmax(0,1fr)) !important;gap:6px !important;margin:0 0 10px !important;max-width:520px}
  .r-find-photos .ph,.r-item-photos .ph{width:100% !important;height:auto !important;aspect-ratio:4/3 !important;border-radius:6px !important;border:0 !important;background-size:cover;background-position:center;background-color:#F1F2EF}
  .r-item-text + .r-item-photos{margin-top:10px !important}
  .r-find-note{margin:0 0 10px;font-size:10.5px;line-height:1.55;color:#4D534F}
  .r-find-note b{color:#181B19}
  .r-find-noplan{margin:0;font-size:10px;color:#9AA19D;font-style:italic}

  /* plano de ação: neutro, em linhas */
  .r-plan-box{display:block !important;background:#fff !important;border:1px solid #D3EBE0 !important;border-radius:8px !important;padding:0 !important;margin:12px 0 0 !important;overflow:hidden;break-inside:avoid;page-break-inside:avoid}
  .r-plan-rail{display:none !important}
  .r-plan-box > div:last-child{padding:0 !important}
  .r-plan-label{display:block !important;background:#0F6E56 !important;color:#fff !important;text-transform:none !important;letter-spacing:0 !important;font-family:'Open Sans',sans-serif !important;font-size:10.5px !important;font-weight:700 !important;padding:7px 12px !important;margin:0 !important;border-bottom:0}
  .r-plan-row{display:grid !important;grid-template-columns:140px minmax(0,1fr);gap:10px;margin:0 !important;padding:7px 12px !important;border-top:1px solid #EEF0EC;font-size:10.5px !important;line-height:1.5 !important;color:#181B19 !important}
  .r-plan-label + .r-plan-row{border-top:0}
  .r-plan-row .lbl{color:#6B726E !important;font-weight:600 !important}
  .r-plan-dates-row{display:grid !important;grid-template-columns:1fr 1fr;gap:0 !important;margin:0 !important;border-top:1px solid #EEF0EC}
  .r-plan-dates-row .r-plan-row{grid-template-columns:auto 1fr;border-top:0;gap:6px}
  .r-plan-dates-row .r-plan-row + .r-plan-row{border-left:1px solid #EEF0EC}
  .r-plan-dates-row .r-plan-row .r-num{font-weight:700;color:#181B19}
  @media (max-width:520px){ .r-plan-row{grid-template-columns:1fr !important;gap:1px !important} .r-plan-dates-row .r-plan-row{grid-template-columns:auto 1fr !important;gap:6px !important} }

  /* lista de verificação e assinaturas */
  .r-check-legend{border-bottom-color:#E5E7E3 !important;margin-bottom:10px !important;padding-bottom:10px !important}
  .r-check-legend-item{font-size:9.5px !important}
  .r-check-row{border-bottom-color:#EEF0EC !important;padding:7px 0 !important}
  .r-check-row-text{font-size:10.5px !important}
  .r-check-status{width:15px !important;height:15px !important}
  .r-check-status.ok{background:#1D9E75 !important}.r-check-status.nc{background:#B3352F !important}.r-check-status.na{background:#9AA19D !important}
  .r-sig-block{background:none;border-radius:0;padding:0 !important}
  .r-sig-block + .r-sig-block{border-top:1px solid #EEF0EC !important;margin-top:16px !important;padding-top:14px !important}
  .r-sig-heading{font-size:10.5px !important}
  .r-sig-preview{font-size:15px !important}
  .r-sig-preview,.r-sig-blank-line{border-bottom-color:#9AA19D !important}
  .r-notes{font-size:11px !important}
  .print-btn{background:#1D9E75 !important}
  `;
  window.REPORT_THEME_CSS = CSS;

  /* prévia dentro do app: mesmo cabeçalho claro das outras telas */
  const PREVIEW = CSS + `
  .report-shell{background:#ECF1EE !important}
  .report-topbar{background:#fff !important;box-shadow:0 1px 0 #E5E7E3 !important}
  .report-topbar .report-back,.report-topbar button{color:#4D534F !important}
  .report-topbar-title{color:#181B19 !important;font-family:'Playfair Display',Georgia,serif !important;font-weight:700 !important}
  .report-pages{padding-left:16px !important;padding-right:16px !important}
  .r-page{border-radius:14px !important;box-shadow:0 1px 2px rgba(24,27,25,.04),0 6px 20px rgba(24,27,25,.06) !important}
  .report-sig-card{border-radius:14px !important;box-shadow:0 1px 2px rgba(24,27,25,.04),0 6px 20px rgba(24,27,25,.06) !important}
  .report-bottombar{background:#fff !important;border-top:1px solid #E5E7E3 !important}
  .report-bottombar button{border-radius:999px !important;font-size:13.5px !important;font-weight:600 !important}
  .report-finalize-btn,.report-bottombar button:last-child{background:#1D9E75 !important;color:#fff !important}
  .r-sig-toggle-btn{border-radius:999px !important}
  .r-sig-toggle-btn.selected{background:#1D9E75 !important;border-color:#1D9E75 !important}
  .r-page-toggle-label{color:#4D534F !important}
  .r-page-toggle ~ .r-topband,.r-page-toggle ~ * .r-topband{margin-top:26px !important}
  .r-page-toggle{top:14px !important;right:16px !important}
  @media (min-width:761px){ .report-pages .r-page,.report-pages .report-sig-card{max-width:620px !important} .report-pages .r-page{padding:28px 32px !important} }
  `;
  const st = document.createElement('style');
  st.textContent = PREVIEW;
  (document.head || document.documentElement).appendChild(st);
})();
