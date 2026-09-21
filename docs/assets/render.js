function createStorySection(title, description){
  const s=document.createElement('section');s.className='story-section panel';
  s.innerHTML=`<div class="panel-header"><div><h3 class="panel-title">${escapeHTML(title)}</h3><p class="panel-description">${escapeHTML(description||'')}</p></div></div>`;
  return s;
}
function renderStory(){
  const intro=state.intro; const root=$('#story-content');
  if(!intro){root.innerHTML='<section class="panel empty-state"><strong>Apresentação indisponível</strong></section>';return;}
  root.innerHTML='';

  const hero=document.createElement('section'); hero.className='story-hero';
  hero.innerHTML=`<div class="story-hero-copy"><p class="eyebrow">${escapeHTML(intro.eyebrow||'')}</p><h2>${escapeHTML(intro.title)}</h2><p class="story-lead">${escapeHTML(intro.subtitle)}</p><div class="story-cta-row"><button id="enter-dashboard-main" class="primary-button">${escapeHTML(intro.cta||'Abrir dashboards')}</button><button id="story-jump-problem" class="outline-button">Ver problema central</button></div></div><div class="story-hero-side"><div class="logo-placeholder xl">ESPAÇO PARA<br><strong>LOGO ENACTUS UFMG</strong></div></div>`;
  root.appendChild(hero);

  const flash=document.createElement('section'); flash.className='flash-strip';
  intro.flashes.forEach((item,idx)=>{const c=document.createElement('article');c.className='flash-card'+(idx===0?' active':'');c.innerHTML=`<span class="flash-label">${escapeHTML(item.label)}</span><strong>${escapeHTML(item.value)}</strong><small>${escapeHTML(item.detail)}</small>`;flash.appendChild(c)});
  root.appendChild(flash);

  const problem=createStorySection('Questão principal do problema','Ponto de partida da análise');
  const pbody=document.createElement('div'); pbody.className='story-problem';
  pbody.innerHTML=`<div class="problem-card"><strong>Problema central</strong><p>${escapeHTML(intro.problem)}</p></div><div class="context-list">${(intro.context||[]).map(t=>`<div class="context-item">${escapeHTML(t)}</div>`).join('')}</div>`;
  problem.appendChild(pbody); root.appendChild(problem);

  const hist=createStorySection('Histórico e referências da reflexão','Como chegamos às hipóteses de análise');
  const timeline=document.createElement('div'); timeline.className='story-timeline';
  (intro.history||[]).forEach(item=>{const d=document.createElement('article'); d.className='timeline-item'; d.innerHTML=`<span class="timeline-year">${escapeHTML(item.year)}</span><p>${escapeHTML(item.text)}</p>`; timeline.appendChild(d)});
  hist.appendChild(timeline); root.appendChild(hist);

  const paths=createStorySection('Dois caminhos possíveis','Arquiteturas consideradas para a Enactus UFMG');
  const grid=document.createElement('div'); grid.className='path-grid';
  (intro.paths||[]).forEach(item=>{const card=document.createElement('article'); card.className='path-card'; card.innerHTML=`<span class="path-tag">${escapeHTML(item.tag)}</span><h4>${escapeHTML(item.name)}</h4><p>${escapeHTML(item.summary)}</p><div class="path-columns"><div><strong>Pontos fortes</strong><ul>${(item.pros||[]).map(v=>`<li>${escapeHTML(v)}</li>`).join('')}</ul></div><div><strong>Limites</strong><ul>${(item.cons||[]).map(v=>`<li>${escapeHTML(v)}</li>`).join('')}</ul></div></div>`; grid.appendChild(card)});
  paths.appendChild(grid); root.appendChild(paths);

  const questions=createStorySection('Questões delineadoras','Perguntas que orientaram a pesquisa e a comparação');
  const qlist=document.createElement('div'); qlist.className='question-grid';
  (intro.guidingQuestions||[]).forEach(q=>{const d=document.createElement('div'); d.className='question-card'; d.textContent=q; qlist.appendChild(d)});
  questions.appendChild(qlist); root.appendChild(questions);

  const method=createStorySection('Decisões metodológicas','Como a pesquisa e a análise foram organizadas');
  const wrap=document.createElement('div'); wrap.className='two-col';
  const left=document.createElement('div'); left.className='insight-list';
  (intro.method||[]).forEach(m=>{const el=document.createElement('article'); el.className='insight'; el.innerHTML=`<h4>Etapa</h4><p>${escapeHTML(m)}</p>`; left.appendChild(el)});
  const right=document.createElement('div'); right.className='insight-list';
  (intro.decisions||[]).forEach(m=>{const el=document.createElement('article'); el.className='insight'; el.innerHTML=`<h4>${escapeHTML(m.title)}</h4><p>${escapeHTML(m.text)}</p>`; right.appendChild(el)});
  wrap.append(left,right); method.appendChild(wrap); root.appendChild(method);

  const concl=createStorySection('Conclusões para o grupo','Síntese do que a análise sugere');
  const cl=document.createElement('div'); cl.className='conclusion-grid';
  (intro.conclusions||[]).forEach(c=>{const el=document.createElement('article'); el.className='conclusion-card'; el.innerHTML=`<strong>${escapeHTML(c.title)}</strong><p>${escapeHTML(c.text)}</p>`; cl.appendChild(el)});
  concl.appendChild(cl); if(intro.recommendation){const note=document.createElement('div'); note.className='callout'; note.textContent=intro.recommendation; concl.appendChild(note)} root.appendChild(concl);

  const finalCta=document.createElement('section'); finalCta.className='story-final-cta panel';
  finalCta.innerHTML=`<div><h3>Pronto para entrar nos detalhes?</h3><p>Os dashboards abaixo permitem filtrar integralmente cada aba da planilha: mapa de oportunidades, resumo, modelos jurídicos, obrigações do primeiro ano, normas e fontes e LTDA por projeto.</p></div><button id="enter-dashboard-bottom" class="primary-button">${escapeHTML(intro.cta||'Explorar dashboards completos')}</button>`;
  root.appendChild(finalCta);

  root.querySelector('#enter-dashboard-main')?.addEventListener('click',showApp);
  root.querySelector('#enter-dashboard-bottom')?.addEventListener('click',showApp);
  root.querySelector('#story-jump-problem')?.addEventListener('click',()=>problem.scrollIntoView({behavior:'smooth',block:'start'}));

  const cards=$$('.flash-card',flash); if(cards.length){ let ix=0; setInterval(()=>{cards[ix].classList.remove('active'); ix=(ix+1)%cards.length; cards[ix].classList.add('active')},2200); }
}
function renderSheetTab(tab){
  const content=$('#content');content.innerHTML='';
  const hero=document.createElement('section');hero.className='story-subhero panel';hero.innerHTML=`<div class="panel-header"><div><h3 class="panel-title">${escapeHTML(tab.name)}</h3><p class="panel-description">${escapeHTML(tab.description||'')}</p></div></div>`;content.appendChild(hero);
  (tab.tables||[]).forEach(t=>content.appendChild(createDataTable(t)))
}
function renderRadar(){
  const content=$('#content');content.innerHTML='';const r=state.radar||{meta:{},findings:[]};
  const hero=document.createElement('section');hero.className='panel';hero.innerHTML=`<div class="panel-header"><div><h3 class="panel-title">Radar automático</h3><p class="panel-description">Monitoramento contínuo de fontes e oportunidades</p></div></div>`;content.appendChild(hero);
  const g=document.createElement('div');g.className='kpi-grid';
  [{label:'Última execução',value:r.meta?.lastRun?fmtDate(r.meta.lastRun):'Aguardando'},{label:'Fontes monitoradas',value:r.meta?.sources??0},{label:'Novos achados armazenados',value:r.findings?.length??0},{label:'Status',value:r.meta?.status||'Ativo'}].forEach(k=>{const d=document.createElement('div');d.className='kpi-card';d.innerHTML=`<div class="kpi-label">${escapeHTML(k.label)}</div><div class="kpi-value">${escapeHTML(k.value)}</div><div class="kpi-accent"></div>`;g.appendChild(d)});content.appendChild(g);
  if(!r.findings?.length){const e=document.createElement('section');e.className='panel empty-state';e.innerHTML='<strong>Nenhum achado automático ainda</strong>O radar será preenchido após a primeira execução do monitoramento.';content.appendChild(e);return}
  const cols=['Encontrado em','Fonte','Título','URL','Score','Palavras-chave'];const rows=r.findings.map(x=>[x.foundAt,x.source,x.title,x.url,x.score,(x.keywords||[]).join(', ')]);
  content.appendChild(createDataTable({title:'Achados do radar',description:'Itens detectados automaticamente nas fontes monitoradas.',columns:cols,rows}))
}
function buildNav(){
  const nav=$('#nav-tabs');nav.innerHTML='';const all=[...state.dashboard.tabs,{name:'Radar automático',icon:'radar',radar:true}];
  all.forEach((tab,i)=>{const b=document.createElement('button');b.className='nav-button'+(i===state.activeTab?' active':'');b.innerHTML=`<span class="nav-icon">${iconFor(tab.icon)}</span><span>${escapeHTML(tab.name)}</span>`;b.addEventListener('click',()=>{state.activeTab=i;buildNav();$('#page-title').textContent=tab.name;tab.radar?renderRadar():renderSheetTab(tab)});nav.appendChild(b)})
}
function showApp(){
  $('#story-view')?.classList.add('hidden');$('#app-view')?.classList.remove('hidden');
  $('#session-user').textContent=state.sessionUser||'Enactus UFMG';
  $('#data-updated').textContent=`Base: ${fmtDate(state.dashboard.meta.generatedAt)}`;$('#app-version').textContent=`v${state.dashboard.meta.version}`;
  buildNav();const tab=state.dashboard.tabs[state.activeTab];$('#page-title').textContent=tab.name;renderSheetTab(tab);
  window.scrollTo({top:0,behavior:'smooth'})
}
function showStory(){ $('#app-view')?.classList.add('hidden'); $('#story-view')?.classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'}) }
