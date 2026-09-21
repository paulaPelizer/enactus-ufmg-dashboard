from __future__ import annotations
import json, re, sys, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
DOCS = REPO / 'docs'
STATE = HERE.parent / 'radar_state.json'
PUBLIC_KEY = HERE / 'public_key.pem'
sys.path.insert(0, str(HERE))
from crypto_utils import encrypt_payload, load_public_key

SOURCES = [
    ('Enactus Brasil', 'https://enactus.org.br/'),
    ('Finep', 'https://www.finep.gov.br/chamadas-publicas'),
    ('FAPEMIG', 'https://fapemig.br/oportunidades/chamadas-e-editais'),
    ('MEMP', 'https://www.gov.br/memp/pt-br/acesso-a-informacao/editais'),
    ('MDA', 'https://www.gov.br/mda/pt-br/acesso-a-informacao/participacao-social/Editais-de-chamamento-publico/2026'),
    ('Ministério das Cidades', 'https://www.gov.br/cidades/pt-br/acesso-a-informacao/participacao-social/editais-de-chamamento-publico'),
    ('Economia Solidária / MTE', 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/economia-solidaria/editais-e-chamamentos-publicos'),
    ('Fundo Brasil', 'https://www.fundobrasil.org.br/nosso-trabalho/apoio-a-sociedade-civil/editais-gerais-e-especificos/'),
    ('Petrobras Socioambiental', 'https://petrobras.com.br/sustentabilidade/selecoes-publicas'),
    ('BNDES / Negócios de Impacto', 'https://www.gov.br/mdic/pt-br/assuntos/enimpacto/agenda'),
]
INTENT={'edital':5,'chamamento':5,'inscrições':4,'inscricoes':4,'seleção':4,'selecao':4,'prêmio':4,'premio':4,'subvenção':5,'subvencao':5,'aceleração':4,'aceleracao':4,'financiamento':4,'fomento':4,'bolsa':3,'programa':2,'oportunidade':3}
THEMES={'empreendedorismo':3,'inovação':3,'inovacao':3,'sustentabilidade':3,'impacto':2,'social':2,'comunidade':2,'comunidades':2,'educação':2,'educacao':2,'resíduos':3,'residuos':3,'reciclagem':3,'startup':3,'startups':3,'osc':3,'associação':2,'associacao':2,'mulheres':2,'economia solidária':3,'economia solidaria':3,'bioeconomia':3,'clima':2,'agricultura familiar':3,'tecnologia':2,'universidade':1}
HEADERS={'User-Agent':'Mozilla/5.0 (compatible; EnactusUFMGRadar/1.0; +https://github.com/paulaPelizer/enactus-ufmg-dashboard)'}

def norm(s): return re.sub(r'\s+',' ',s or '').strip().lower()
def score_text(text):
    t=norm(text); score=0; hits=[]; theme_hits=[]
    for k,w in INTENT.items():
        if k in t: score+=w; hits.append(k)
    for k,w in THEMES.items():
        if k in t: score+=w; theme_hits.append(k)
    if not hits and len(theme_hits)<2: return 0,[]
    return score, sorted(set(hits+theme_hits))
def load_state():
    if STATE.exists():
        try: return json.loads(STATE.read_text(encoding='utf-8'))
        except Exception: pass
    return {'seen':{},'history':[]}
def canonical_url(url):
    p=urlparse(url); return p._replace(fragment='').geturl().rstrip('/')
def crawl_source(name,url):
    r=requests.get(url,headers=HEADERS,timeout=30); r.raise_for_status()
    soup=BeautifulSoup(r.text,'html.parser'); out=[]
    for a in soup.find_all('a',href=True):
        title=' '.join(a.stripped_strings); href=canonical_url(urljoin(url,a.get('href')))
        if not href.startswith('http') or len(title)<4: continue
        score,keywords=score_text(f'{title} {href}')
        if score<5: continue
        out.append({'source':name,'title':title[:260],'url':href,'score':score,'keywords':keywords})
    best={}
    for x in out:
        if x['url'] not in best or x['score']>best[x['url']]['score']: best[x['url']]=x
    return sorted(best.values(),key=lambda x:(-x['score'],x['title']))[:80]
def main():
    state=load_state(); seen=state.setdefault('seen',{}); now=datetime.now(timezone.utc).isoformat()
    findings=[]; source_status=[]
    for name,url in SOURCES:
        try:
            items=crawl_source(name,url); new_count=0
            for x in items:
                if x['url'] not in seen: x['foundAt']=now; findings.append(x); new_count+=1
                seen[x['url']]={'lastSeen':now,'source':name,'title':x['title'],'score':x['score']}
            source_status.append({'source':name,'url':url,'ok':True,'candidates':len(items),'new':new_count})
        except Exception as e:
            source_status.append({'source':name,'url':url,'ok':False,'error':str(e)[:220],'candidates':0,'new':0})
        time.sleep(.4)
    history=state.setdefault('history',[]); history.extend(findings)
    state['history']=sorted(history,key=lambda x:x.get('foundAt',''),reverse=True)[:300]
    if len(seen)>2500:
        state['seen']=dict(sorted(seen.items(),key=lambda kv:kv[1].get('lastSeen',''),reverse=True)[:2500])
    state['lastRun']=now; STATE.write_text(json.dumps(state,ensure_ascii=False,indent=2),encoding='utf-8')
    payload={'meta':{'lastRun':now,'status':'Radar executado com sucesso' if any(x['ok'] for x in source_status) else 'Falha ao consultar as fontes','sources':len(SOURCES),'sourcesOk':sum(1 for x in source_status if x['ok']),'newThisRun':len(findings),'sourceStatus':source_status},'findings':state['history'][:200]}
    pub=load_public_key(str(PUBLIC_KEY)); package=encrypt_payload(payload,pub)
    out=DOCS/'data'/'radar.enc.json'; out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(package,indent=2),encoding='utf-8')
    print(json.dumps({'new':len(findings),'sources_ok':payload['meta']['sourcesOk']},ensure_ascii=False))
if __name__=='__main__': main()
