function createDataTable(table){
  const tpl=$('#table-template').content.cloneNode(true);
  const panel=$('.data-panel',tpl); $('.panel-title',panel).textContent=table.title;
  $('.panel-description',panel).textContent=table.description||`${table.rows.length} registros`;
  const thead=$('thead',panel), tbody=$('tbody',panel), search=$('.global-search',panel), filtersBox=$('.column-filters',panel), count=$('.row-count',panel);
  const columns=table.columns; let rows=table.rows.map((r,i)=>({r,i})); let sort={col:-1,dir:1}; const colFilters={};
  const tr=document.createElement('tr');
  columns.forEach((c,i)=>{ const th=document.createElement('th'); th.textContent=c||`Coluna ${i+1}`; th.dataset.col=i; th.title='Clique para ordenar'; th.addEventListener('click',()=>{ sort.dir=sort.col===i?-sort.dir:1; sort.col=i; render();}); tr.appendChild(th); });
  thead.appendChild(tr);
  columns.forEach((c,i)=>{
    const vals=[...new Set(table.rows.map(r=>String(r[i]??'').trim()).filter(Boolean))];
    const field=document.createElement('div'); field.className='filter-field'; const label=document.createElement('label'); label.textContent=c||`Coluna ${i+1}`; field.appendChild(label);
    let control; const avg=vals.length?vals.reduce((a,v)=>a+v.length,0)/vals.length:0;
    if(vals.length>0 && vals.length<=18 && avg<70){ control=document.createElement('select'); control.innerHTML='<option value="">Todos</option>'+vals.sort((a,b)=>a.localeCompare(b,'pt-BR')).map(v=>`<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`).join(''); }
    else { control=document.createElement('input'); control.type='search'; control.placeholder='Contém…'; }
    control.addEventListener('input',()=>{colFilters[i]=control.value;render();}); field.appendChild(control); filtersBox.appendChild(field);
  });
  function getFiltered(){
    const q=normalize(search.value);
    let out=rows.filter(({r})=>{
      if(q && !r.some(v=>normalize(v).includes(q))) return false;
      for(const [idx,val] of Object.entries(colFilters)){
        if(!val) continue; const cell=String(r[idx]??'');
        const control=$$('.filter-field',filtersBox)[idx]?.querySelector('select,input');
        if(control?.tagName==='SELECT'){if(cell!==val)return false;} else if(!normalize(cell).includes(normalize(val))) return false;
      }
      return true;
    });
    if(sort.col>=0) out=out.sort((a,b)=>String(a.r[sort.col]??'').localeCompare(String(b.r[sort.col]??''),'pt-BR',{numeric:true})*sort.dir);
    return out;
  }
  function render(){
    const out=getFiltered(); tbody.innerHTML=''; count.textContent=`${out.length} de ${rows.length}`;
    const frag=document.createDocumentFragment();
    out.forEach(({r})=>{ const rr=document.createElement('tr'); if(r.some(v=>/ABERTO|RECÉM-PUBLICADO/i.test(String(v)))) rr.classList.add('row-open'); columns.forEach((c,i)=>{const td=document.createElement('td');td.innerHTML=valueHTML(r[i],c);rr.appendChild(td);});frag.appendChild(rr);});
    tbody.appendChild(frag);
  }
  search.addEventListener('input',render);
  $('.filters-toggle',panel).addEventListener('click',()=>filtersBox.classList.toggle('hidden'));
  $('.clear-filters',panel).addEventListener('click',()=>{search.value='';$$('input,select',filtersBox).forEach(x=>x.value='');Object.keys(colFilters).forEach(k=>delete colFilters[k]);render();});
  $('.export-csv',panel).addEventListener('click',()=>{
    const data=getFiltered().map(x=>x.r); const csv=[columns,...data].map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(';')).join('\n');
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${table.title.replace(/[^a-z0-9]+/gi,'_').toLowerCase()}.csv`; a.click(); URL.revokeObjectURL(a.href);
  });
  render(); return tpl;
}