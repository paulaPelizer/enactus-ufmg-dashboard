const state={dashboard:null,intro:null,radar:null,activeTab:0,sessionUser:'Enactus UFMG'};
const $=(sel,root=document)=>root.querySelector(sel);const $$=(sel,root=document)=>[...root.querySelectorAll(sel)];
async function loadJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('Falha ao carregar '+url);return r.json()}
async function loadText(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('Falha ao carregar '+url);return r.text()}
async function loadDashboardData(){
  const manifest=await loadJSON('data/site.manifest.json?v=2');
  const chunks=await Promise.all((manifest.parts||[]).map(n=>loadText('data/'+n+'?v='+manifest.version)));
  const raw=JSON.parse(chunks.join(''));
  state.dashboard={meta:raw.meta,tabs:raw.tabs};
  state.intro=raw.intro;
  try{state.radar=await loadJSON('data/radar.json?t='+Date.now())}catch(e){state.radar={meta:{status:'Aguardando primeira atualização',sources:0},findings:[]}}
}
function iconFor(name){const map={compass:'◈',dashboard:'▦',scale:'⚖',checklist:'✓',book:'▤',building:'▥',radar:'◎'};return map[name]||'•'}
function fmtDate(v){if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(d)}
function escapeHTML(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function badgeClass(text){const s=String(text||'').toLowerCase();if(/aberto|sim|alta|ativo|imediato/.test(s)&&!/não/.test(s))return'badge-green';if(/não|encerrad|baixa|inapto/.test(s))return'badge-red';if(/condicional|média|andamento|confirmar/.test(s))return'badge-yellow';if(/empresa|startup|ltda|slu/.test(s))return'badge-blue';return'badge-gray'}
function valueHTML(value,col){const s=String(value??'');if(/^https?:\/\//i.test(s))return'<a class="cell-url" href="'+escapeHTML(s)+'" target="_blank" rel="noopener">Abrir fonte ↗</a>';if(/status|acesso|aceita|aderência|rota|custo administrativo relativo|critério|grupo/i.test(col)&&s.length<90)return'<span class="badge '+badgeClass(s)+'">'+escapeHTML(s)+'</span>';return escapeHTML(s)}
function normalize(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
