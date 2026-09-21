function fallbackDashboard(){
  return {
    meta:{generatedAt:new Date().toISOString(),version:'MVP',source:'Fallback temporário'},
    tabs:[
      {name:'Mapa de oportunidades',icon:'compass',tables:[{
        title:'Mapa de oportunidades · MVP',
        description:'Fallback temporário para validar o acesso e a interface.',
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

async function login(e){
  e.preventDefault();
  const user=$('#username').value.trim();
  const pass=$('#password').value;
  const err=$('#login-error');
  const btn=$('#login-form .primary-button');
  err.textContent='';
  btn.disabled=true;
  btn.textContent='Entrando…';

  try{
    if(user!=='admin.enactus' || pass!=='mvp2026'){
      throw new Error('Usuário ou senha inválidos.');
    }

    try{
      await loadDashboardData();
    }catch(dataError){
      console.error('Falha ao carregar a base completa:',dataError);
      state.dashboard=fallbackDashboard();
      state.radar={meta:{status:'MVP em modo fallback',sources:0},findings:[]};
    }

    state.sessionUser=user;
    showApp();
  }catch(ex){
    err.textContent=ex.message||'Não foi possível entrar.';
  }finally{
    btn.disabled=false;
    btn.textContent='Entrar no painel';
  }
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
  $('#login-form').addEventListener('submit',login);
  $('#toggle-password').addEventListener('click',()=>{
    const p=$('#password');
    p.type=p.type==='password'?'text':'password';
  });
  $('#logout-button').addEventListener('click',()=>location.reload());
  $('#refresh-radar').addEventListener('click',refreshRadar);
});