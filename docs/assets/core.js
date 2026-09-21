const state={dashboard:null,radar:null,activeTab:0,sessionUser:null};
const $=(sel,root=document)=>root.querySelector(sel);const $$=(sel,root=document)=>[...root.querySelectorAll(sel)];
function b64ToBytes(s){const bin=atob(s),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}
async function loadJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('Falha ao carregar '+url);return r.json()}
async function loadText(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('Falha ao carregar '+url);return r.text()}
async function gunzipText(b64){const ds=new DecompressionStream('gzip');const stream=new Blob([b64ToBytes(b64.trim())]).stream().pipeThrough(ds);return new Response(stream).text()}
function cleanRow(r,w){return Array.from({length:w},(_,i)=>r?.[i]??'')}
function workbookToDashboard(raw){
  const iconMap={'Mapa de oportunidades':'compass','Resumo':'dashboard','Modelos jurídicos':'scale','Obrigações 1º ano':'checklist','Normas e fontes':'book','LTDA por projeto':'building'};
  const tabs=Object.entries(raw.sheets||{}).map(([name,rows])=>{
    const segments=[];let cur=[];
    const push=()=>{if(cur.length){segments.push(cur);cur=[]}};
    for(const row of rows||[]){const nonempty=(row||[]).some(v=>String(v??'').trim()!=='');if(nonempty)cur.push(row);else push()}push();
    const tables=segments.map((seg,idx)=>{
      const width=Math.max(...seg.map(r=>r.length),1);let title=name+(segments.length>1?' · '+(idx+1):'');let start=0;
      const first=cleanRow(seg[0],width);const firstNon=first.filter(v=>String(v??'').trim()!=='');
      if(firstNon.length===1&&seg.length>1){title=String(firstNon[0]);start=1}
      const hdr=cleanRow(seg[start]||[],width);const columns=hdr.map((v,i)=>String(v??'').trim()||'Coluna '+(i+1));
      const seen={};const unique=columns.map(c=>{seen[c]=(seen[c]||0)+1;return seen[c]>1?c+' ('+seen[c]+')':c});
      const data=seg.slice(start+1).map(r=>cleanRow(r,width));
      return {title,description:data.length+' registros',columns:unique,rows:data};
    });
    return {name,icon:iconMap[name]||'dashboard',tables};
  });
  return {meta:{generatedAt:raw.generatedAt,version:'1.0.0',source:raw.source},tabs};
}
async function loadDashboardData(){
  const names=['dbpart1.txt','dbpart2.txt','dbpart3.txt','dbpart4.txt','dbpart5.txt'];
  const chunks=await Promise.all(names.map(n=>loadText('data/'+n+'?v=2')));
  const raw=JSON.parse(await gunzipText(chunks.join('')));
  state.dashboard=workbookToDashboard(raw);
  try{state.radar=await loadJSON('data/radar.json?t='+Date.now())}catch(e){state.radar={meta:{status:'Aguardando primeira atualização',sources:0},findings:[]}}
}
function iconFor(name){const map={compass:'◈',dashboard:'▦',scale:'⚖',checklist:'✓',book:'▤',building:'▥',radar:'◎'};return map[name]||'•'}
function fmtDate(v){if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(d)}
function escapeHTML(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function badgeClass(text){const s=String(text||'').toLowerCase();if(/aberto|sim|alta|ativo|imediato/.test(s)&&!/não/.test(s))return'badge-green';if(/não|encerrad|baixa|inapto/.test(s))return'badge-red';if(/condicional|média|andamento|confirmar/.test(s))return'badge-yellow';if(/empresa|startup|ltda|slu/.test(s))return'badge-blue';return'badge-gray'}
function valueHTML(value,col){const s=String(value??'');if(/^https?:\/\//i.test(s))return'<a class="cell-url" href="'+escapeHTML(s)+'" target="_blank" rel="noopener">Abrir fonte ↗</a>';if(/status|acesso|aceita|aderência|rota|custo administrativo relativo|critério/i.test(col)&&s.length<80)return'<span class="badge '+badgeClass(s)+'">'+escapeHTML(s)+'</span>';return escapeHTML(s)}
function normalize(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}