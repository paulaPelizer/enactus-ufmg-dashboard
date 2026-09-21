function renderKpis(items){
  const grid=document.createElement('div');grid.className='kpi-grid';
  items.forEach(k=>{const d=document.createElement('div');d.className='kpi-card';d.innerHTML=`<div class="kpi-label">${escapeHTML(k.label)}</div><div class="kpi-value">${escapeHTML(k.value)}</div><div class="kpi-accent"></div>`;grid.appendChild(d)});return grid
}
function renderOverview(ov){
  const frag=document.createDocumentFragment();
  const hero=document.createElement('section');hero.className='hero';hero.innerHTML=`<div><p class="eyebrow">Visão executiva</p><h3>${escapeHTML(ov.title)}</h3><p>Leitura consolidada do mapa de oportunidades, maturidade do CNPJ, modelos de organização e caminhos para projetos Enactus UFMG.</p></div><div class="hero-logo-slot"><div class="logo-placeholder">ESPAÇO PARA<br><strong>LOGO ENACTUS UFMG</strong></div></div>`;frag.appendChild(hero);frag.appendChild(renderKpis(ov.kpis));
  const two=document.createElement('div');two.className='two-col';
  const p1=document.createElement('section');p1.className='panel';p1.innerHTML='<div class="panel-header"><div><h3 class="panel-title">Principais achados</h3><p class="panel-description">Implicações e horizonte de ação</p></div></div><div class="insight-list"></div>';
  ov.findings.forEach(x=>{const d=document.createElement('article');d.className='insight';d.innerHTML=`<h4>${escapeHTML(x.Achado)}</h4><p>${escapeHTML(x.Implicação)}</p><div class="mini">${escapeHTML(x.Horizonte)} · ${escapeHTML(x.Base)}</div>`;$('.insight-list',p1).appendChild(d)});
  const p2=document.createElement('section');p2.className='panel';p2.innerHTML='<div class="panel-header"><div><h3 class="panel-title">Distribuição por rota</h3><p class="panel-description">Portas de entrada mapeadas</p></div></div><div class="bar-list"></div>';
  const max=Math.max(...ov.routes.map(x=>Number(x.Qtde)||0),1);ov.routes.forEach(x=>{const row=document.createElement('div');row.className='bar-row';row.innerHTML=`<span>${escapeHTML(x.Rota)}</span><div class="bar-track"><div class="bar-fill" style="width:${(Number(x.Qtde)||0)/max*100}%"></div></div><strong>${escapeHTML(x.Qtde)}</strong>`;$('.bar-list',p2).appendChild(row)});
  two.append(p1,p2);frag.appendChild(two);return frag
}
function renderSheetTab(tab){
  const content=$('#content');content.innerHTML='';
  if(tab.overview)content.appendChild(renderOverview(tab.overview));
  if(tab.kpis)content.appendChild(renderKpis(tab.kpis));
  if(tab.note){const c=document.createElement('div');c.className='callout';c.textContent=tab.note;content.appendChild(c)}
  (tab.tables||[]).forEach(t=>content.appendChild(createDataTable(t)))
}
function renderRadar(){
  const content=$('#content');content.innerHTML='';const r=state.radar||{meta:{},findings:[]};
  const hero=document.createElement('section');hero.className='hero';hero.innerHTML=`<div><p class="eyebrow">Monitoramento automático</p><h3>Radar de editais e oportunidades</h3><p>Monitores agendados consultam fontes públicas selecionadas e destacam novos links aderentes a empreendedorismo social, inovação, sustentabilidade e projetos comunitários.</p></div><div class="hero-logo-slot"><div class="radar-status"><span class="pulse"></span><strong>Radar ativo</strong></div></div>`;content.appendChild(hero);
  content.appendChild(renderKpis([{label:'Última execução',value:r.meta?.lastRun?fmtDate(r.meta.lastRun):'Aguardando'},{label:'Fontes monitoradas',value:r.meta?.sources??0},{label:'Novos achados armazenados',value:r.findings?.length??0},{label:'Status',value:r.meta?.status||'Ativo após deploy'}]));
  if(!r.findings?.length){const e=document.createElement('section');e.className='panel empty-state';e.innerHTML='<strong>Nenhum achado automático ainda</strong>O radar será preenchido após a primeira execução do monitoramento.';content.appendChild(e);return}
  const cols=['Encontrado em','Fonte','Título','URL','Score','Palavras-chave'];const rows=r.findings.map(x=>[x.foundAt,x.source,x.title,x.url,x.score,(x.keywords||[]).join(', ')]);
  content.appendChild(createDataTable({title:'Achados do radar',description:'Itens detectados automaticamente nas fontes monitoradas.',columns:cols,rows}))
}
function buildNav(){
  const nav=$('#nav-tabs');nav.innerHTML='';const all=[...state.dashboard.tabs,{name:'Radar automático',icon:'radar',radar:true}];
  all.forEach((tab,i)=>{const b=document.createElement('button');b.className='nav-button'+(i===state.activeTab?' active':'');b.innerHTML=`<span class="nav-icon">${iconFor(tab.icon)}</span><span>${escapeHTML(tab.name)}</span>`;b.addEventListener('click',()=>{state.activeTab=i;buildNav();$('#page-title').textContent=tab.name;tab.radar?renderRadar():renderSheetTab(tab)});nav.appendChild(b)})
}
function showApp(){
  $('#login-view')?.classList.add('hidden');
  $('#app-view')?.classList.remove('hidden');
  const session=$('#session-user'); if(session) session.textContent=state.sessionUser||'MVP público';
  $('#data-updated').textContent=`Base: ${fmtDate(state.dashboard.meta.generatedAt)}`;
  $('#app-version').textContent=`v${state.dashboard.meta.version}`;
  buildNav();
  const tab=state.dashboard.tabs[state.activeTab];
  $('#page-title').textContent=tab.name;
  renderSheetTab(tab);
}