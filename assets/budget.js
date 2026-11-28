(function(){
  var box=document.getElementById('cp-budget'); if(!box) return;
  var D=document, I=JSON.parse(D.getElementById('cp-budget-i18n').textContent), X=I.x;
  var root=D.documentElement.getAttribute('data-root')||'./', lang=D.documentElement.lang;
  var F=D.getElementById('cp-bg-form'), out=D.getElementById('cp-bg-out'), mapEl=D.getElementById('cp-bg-map'), q=new URLSearchParams(location.search);
  var P=null, N=[], C={}, map=null, layer=null, SHOWN=40;
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function n(x){ return Math.round(x).toLocaleString(lang); }
  function num(v){ var x=parseFloat(String(v||'').replace(/[^\d.,]/g,'').replace(/[.,](?=\d{3}(\D|$))/g,'').replace(',','.')); return isFinite(x)?x:0; }
  function fmt(s,o){ return String(s).replace(/\{(\w+)\}/g,function(_,k){ return k in o?o[k]:'{'+k+'}'; }); }
  function run(push){
    var budget=num(F.budget.value), m2=num(F.m2.value), kind=F.type.value, sort=F.sort.value, msg=F.querySelector('.msg');
    if(!budget||!m2){ if(msg){ msg.className='msg full bad'; msg.textContent=X.need; } return; }
    if(msg) msg.textContent='';
    if(push){ try{ history.replaceState(null,'','?budget='+budget+'&m2='+m2+'&k='+kind+'&sort='+sort); }catch(e){} }
    var rows=[];
    N.forEach(function(r){ if(r[4]!=='municipality') return; var d=P[r[0]]||{}, t=(d.t||{})[kind];
      if(!t||!t[0]||t[7]||t[6]==='too_few') return;                       // its own figure, at least 10 contracts
      var ak=(d.a||{})[kind], ask=t[0]*(1+(ak?ak[0]:0)), need=ask*m2; if(need>budget) return;
      rows.push({r:r,t:t,ask:ask,buys:budget/ask,y:(d.s&&d.s[1])?100*d.s[1]/need:0}); });
    rows.sort(sort==='yield'?function(a,b){ return b.y-a.y; }:sort==='dear'?function(a,b){ return b.ask-a.ask; }:function(a,b){ return b.buys-a.buys; });
    if(!rows.length){ out.innerHTML='<p>'+esc(X.none)+'</p>'; mapEl.hidden=true; return; }
    var top=rows.slice(0,SHOWN), h='<p>'+esc(fmt(X.count,{n:n(rows.length),m2:n(m2),budget:n(budget),shown:n(top.length)}))+'</p>';
    h+='<div class="cmp-wrap"><table class="sales"><tr><th>'+esc(X.c_area)+'</th><th>'+esc(X.c_decl)+'</th><th>'+esc(X.c_ask)+'</th><th>'+esc(X.c_buys)+'</th><th>'+esc(X.c_yield)+'</th><th></th></tr>';
    top.forEach(function(x){ var r=x.r;
      h+='<tr><th><a href="'+esc(root+r[2])+'">'+esc(r[1])+'</a><br><span class="small">'+esc(r[3])+' · '+esc((I.grades||{})[x.t[6]]||'')+'</span></th>'
        +'<td class="v">€'+n(x.t[0])+'</td><td class="v">≈ €'+n(Math.round(x.ask/10)*10)+'</td><td class="v">≈ '+n(x.buys)+' m²</td>'
        +'<td class="v">'+(x.y?esc(fmt(X.per_year,{pct:x.y.toFixed(1)})):'–')+'</td>'
        +'<td class="small"><a href="'+esc(I.pc)+'?m2='+m2+'#'+encodeURIComponent(r[0]+'|'+kind)+'">'+esc(X.c_check)+'</a></td></tr>'; });
    out.innerHTML=h+'</table></div>';
    if(window.L){ mapEl.hidden=false;
      if(!map){ map=L.map(mapEl,{scrollWheelZoom:false,minZoom:5,maxZoom:15}).setView([38.4,24.2],6);
        map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
        L.tileLayer(I.tiles,{maxZoom:19,attribution:I.attr}).addTo(map); layer=L.layerGroup().addTo(map); }
      layer.clearLayers(); var pts=[];
      top.forEach(function(x){ var c=C[x.r[0]]; if(!c) return; pts.push([c[0],c[1]]);
        L.circleMarker([c[0],c[1]],{radius:7,color:'#0f2a44',weight:2,fillColor:'#c9a45c',fillOpacity:.95}).addTo(layer)
          .bindPopup('<b>'+esc(x.r[1])+'</b><br>≈ €'+n(Math.round(x.ask/10)*10)+'/m² · ≈ '+n(x.buys)+' m²<br><a href="'+esc(root+x.r[2])+'">'+esc(x.r[1])+' →</a>'); });
      if(pts.length) map.fitBounds(pts,{padding:[24,24],maxZoom:10}); map.invalidateSize(); }
  }
  F.addEventListener('submit',function(e){ e.preventDefault(); run(true); });
  Promise.all([fetch(root+'assets/prices.json').then(function(r){ return r.json(); }), fetch(root+'assets/pnames-'+lang+'.json').then(function(r){ return r.json(); }),
               fetch(root+'assets/coords.json').then(function(r){ return r.json(); }).catch(function(){ return {}; })]).then(function(a){
    P=a[0]; N=a[1].filter(function(r){ return P[r[0]]; }); C=a[2]||{};
    if(q.get('budget')){ F.budget.value=q.get('budget'); if(q.get('m2')) F.m2.value=q.get('m2'); if(q.get('k')) F.type.value=q.get('k'); if(q.get('sort')) F.sort.value=q.get('sort'); run(false); } });
})();