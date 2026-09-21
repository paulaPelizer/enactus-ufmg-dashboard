const state={auth:null,dashboard:null,radar:null,activeTab:0,sessionUser:null};
const $=(sel,root=document)=>root.querySelector(sel);const $$=(sel,root=document)=>[...root.querySelectorAll(sel)];const enc=new TextEncoder();
function b64ToBytes(s){const bin=atob(s),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}
function bytesToB64(bytes){let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s)}
async function loadJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('Falha ao carregar '+url);return r.json()}
async function loadText(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('Falha ao carregar '+url);return r.text()}
async function verifyLogin(username,password){
  const auth=state.auth||await loadJSON('data/auth.json');state.auth=auth;
  if(username.trim()!==auth.username)return false;
  const material=await crypto.subtle.importKey('raw',enc.encode(password),{name:'PBKDF2'},false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:b64ToBytes(auth.kdf.salt),iterations:auth.kdf.iterations,hash:'SHA-256'},material,256);
  return bytesToB64(new Uint8Array(bits))===auth.passwordHash;
}
async function loadDashboardData(){
  const manifest=await loadJSON('data/dashboard.manifest.json');
  const chunks=await Promise.all(manifest.parts.map(n=>loadText('data/'+n+'?v='+manifest.version)));
  state.dashboard=JSON.parse(chunks.join(''));
  try{state.radar=await loadJSON('data/radar.json?t='+Date.now())}catch(e){state.radar={meta:{status:'Aguardando primeira atualização',sources:0},findings:[]}}
}
function iconFor(name){const map={compass:'◈',dashboard:'▦',scale:'⚖',checklist:'✓',book:'▤',building:'▥',radar:'◎'};return map[name]||'•'}
function fmtDate(v){if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(d)}
function escapeHTML(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function badgeClass(text){const s=String(text||'').toLowerCase();if(/aberto|sim|alta|ativo|imediato/.test(s)&&!/não/.test(s))return'badge-green';if(/não|encerrad|baixa|inapto/.test(s))return'badge-red';if(/condicional|média|andamento|confirmar/.test(s))return'badge-yellow';if(/empresa|startup|ltda|slu/.test(s))return'badge-blue';return'badge-gray'}
function valueHTML(value,col){const s=String(value??'');if(/^https?:\/\//i.test(s))return'<a class="cell-url" href="'+escapeHTML(s)+'" target="_blank" rel="noopener">Abrir fonte ↗</a>';if(/status|acesso|aceita|aderência|rota|custo administrativo relativo|critério/i.test(col)&&s.length<80)return'<span class="badge '+badgeClass(s)+'">'+escapeHTML(s)+'</span>';return escapeHTML(s)}
function normalize(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}