function fallbackSiteData(){
  return {
    meta:{generatedAt:new Date().toISOString(),version:'2.0.0-mvp',source:'fallback'},
    intro:{eyebrow:'Enactus UFMG · estudo estratégico',title:'CNPJ, oportunidades e caminhos institucionais para a Enactus UFMG',subtitle:'Versão de segurança do MVP para não deixar a apresentação indisponível.',problem:'Como estruturar a Enactus UFMG para ampliar oportunidades sem gerar burocracia excessiva?',context:['Esta é uma base mínima enquanto a base principal carrega.'],history:[],paths:[{name:'CNPJ do time',tag:'Institucional',summary:'Estrutura coletiva mais aderente à lógica de OSC.',pros:['Favorece institucionalidade'],cons:['Não substitui empresa']},{name:'CNPJ por projeto',tag:'Empresarial',summary:'Estrutura de spin-off para soluções maduras.',pros:['Acessa trilhas de startup'],cons:['Multiplica governança']}],guidingQuestions:['Quais oportunidades um CNPJ desbloqueia?'],method:['Mapeamento de oportunidades e comparação entre modelos.'],flashes:[{label:'MVP',value:'ativo',detail:'Modo de contingência'}],decisions:[],conclusions:[{title:'Síntese',text:'O modelo ideal tende a ser híbrido.'}],cta:'Explorar dashboards completos',recommendation:''},
    tabs:[{name:'Mapa de oportunidades',icon:'compass',description:'Fallback temporário.',tables:[{title:'Mapa de oportunidades · MVP',description:'3 registros',columns:['Oportunidade','Tipo','Melhor veículo'],rows:[['Programa Centelha 3 – Minas Gerais','Subvenção / inovação','LTDA/SLU ME/EPP'],['Prêmio Mulheres Inovadoras','Aceleração / prêmio','Startup/LTDA'],['Chamamentos públicos para OSC','Termo de fomento/colaboração','Associação/OSC']]}]}]
  }
}
async function boot(){
  try{ await loadDashboardData(); }
  catch(err){ console.error('Falha ao carregar base principal',err); const fb=fallbackSiteData(); state.dashboard={meta:fb.meta,tabs:fb.tabs}; state.intro=fb.intro; state.radar={meta:{status:'MVP em modo fallback',sources:0},findings:[]}; }
  renderStory();
}
async function refreshRadar(){ const b=$('#refresh-radar'),old=b.textContent; b.textContent='Atualizando…'; b.disabled=true; try{ state.radar=await loadJSON('data/radar.json?t='+Date.now()); if(state.activeTab===state.dashboard.tabs.length) renderRadar(); }catch(e){ alert('Não foi possível recarregar o Radar agora.'); }finally{ b.textContent=old; b.disabled=false; } }
document.addEventListener('DOMContentLoaded',()=>{ $('#enter-dashboard-top')?.addEventListener('click',showApp); $('#back-to-story')?.addEventListener('click',showStory); $('#refresh-radar')?.addEventListener('click',refreshRadar); boot(); });
