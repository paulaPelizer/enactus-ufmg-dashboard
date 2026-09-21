function fallbackDashboard(){
  return {
    meta:{generatedAt:new Date().toISOString(),version:'MVP',source:'Fallback temporário'},
    tabs:[
      {name:'Mapa de oportunidades',icon:'compass',tables:[{
        title:'Mapa de oportunidades · MVP',
        description:'Fallback temporário para validar a interface enquanto a base completa é estabilizada.',
        columns:['Oportunidade','Tipo','Exige CNPJ?','Aceita CNPJ novo?','Melhor veículo'],
        rows:[
          ['Programa Centelha 3 – Minas Gerais','Subvenção / inovação','Pode ser constituído após aprovação','Sim','LTDA/SLU ME/EPP'],
          ['Prêmio Mulheres Inovadoras','Aceleração / prêmio','Sim','Sim, conforme regra da edição','Startup/LTDA'],
          ['Chamamentos públicos para OSC','Termo de fomento/colaboração','Sim','Geralmente não no início','Associação/OSC']
        ]
      }]},
      {name:'Modelos jurídicos',icon:'scale',tables:[{
        title:'Modelos jurídicos · MVP',
        description:'Comparação resumida para validação da interface.',
        columns:['Modelo','Acesso a editais OSC','Acesso a editais startup','Carga inicial'],
        rows:[
          ['Associação privada','Alta após maturação','Baixa','Baixa a média'],
          ['LTDA/SLU','Baixa','Alta','Média'],
          ['LTDA por projeto','Baixa','Alta por projeto','Multiplica por CNPJ']
        ]
      }]}
    ]
  };
}

async function boot(){
  const content=$('#content');
  if(content) content.innerHTML='<div class="empty-state"><strong>Carregando dashboard…</strong></div>';
  try{
    await loadDashboardData();
  }catch(dataError){
    console.error('Falha ao carregar a base completa:',dataError);
    state.dashboard=fallbackDashboard();
    state.radar={meta:{status:'MVP em modo fallback',sources:0},findings:[]};
  }
  state.sessionUser='MVP público';
  showApp();
}

async function refreshRadar(){
  const b=$('#refresh-radar'),old=b.textContent;
  b.textContent='Atualizando…';
  b.disabled=true;
  try{
    state.radar=await loadJSON('data/radar.json?t='+Date.now());
    if(state.activeTab===state.dashboard.tabs.length)renderRadar();
  }catch(e){
    alert('Não foi possível recarregar o Radar agora.');
  }finally{
    b.textContent=old;
    b.disabled=false;
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  $('#refresh-radar')?.addEventListener('click',refreshRadar);
  boot();
});