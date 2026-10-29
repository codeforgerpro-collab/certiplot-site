(function(){
  var box=document.getElementById('cp-tool'); if(!box) return;
  var D=document, mode=box.getAttribute('data-mode'), I=JSON.parse(D.getElementById('cp-tool-i18n').textContent);
  var root=D.documentElement.getAttribute('data-root')||'./', lang=D.documentElement.lang, out=D.getElementById('cp-tool-out');
  var F=D.getElementById('cp-pc-form'), P=null, LT=null, N=null, byId={};
  var T=mode==='pc'?I.pc:I.sell;
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function n(x){ return Math.round(x).toLocaleString(lang); }
  function num(v){ var x=parseFloat(String(v||'').replace(/[^\d.,]/g,'').replace(/[.,](?=\d{3}(\D|$))/g,'').replace(',','.')); return isFinite(x)?x:0; }
  function norm(t){ return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim(); }
  function ml(m){ if(!m) return ''; var p=String(m).split('-'); return p[1]+'/'+p[0]; }
  function fmt(s,o){ return String(s).replace(/\{(\w+)\}/g,function(_,k){ return k in o?o[k]:'{'+k+'}'; }); }
  function find(){ var q=norm(F.area.value); if(!q||!N) return null;
    return N.find(function(r){ return norm(r[1]+' — '+r[3])===q; })||N.find(function(r){ return norm(r[1])===q; })||N.find(function(r){ return norm(r[1]).indexOf(q)===0; }); }
  function run(){
    var z=find(); if(!z){ out.innerHTML=F.area.value?'<p class="small">'+esc(T.pick||I.pc.pick)+'</p>':''; return; }
    var d=P[z[0]]||{}, kind=F.type.value, r=(d.t||{})[kind], m2=num(F.m2.value), h='', name=z[1];
    try{ history.replaceState(null,'','#'+encodeURIComponent(z[0]+'|'+kind)); }catch(e){}
    var cta=D.getElementById('cp-pc-cta'); if(cta) cta.href=cta.href.split('?')[0]+'?area='+encodeURIComponent(name);
    var sf=D.getElementById('cp-sell-form'); if(sf){ if(!sf.area.value||sf.area.getAttribute('data-auto')){ sf.area.value=name; sf.area.setAttribute('data-auto','1'); }
      sf.kind.value=kind; if(m2&&(!sf.size.value||sf.size.getAttribute('data-auto'))){ sf.size.value=m2; sf.size.setAttribute('data-auto','1'); }
      if(F.built&&F.built.value&&!sf.year_built.value) sf.year_built.value=F.built.value; }
    var via=r&&r[7]&&byId[r[7]]?'<p class="small">'+esc(fmt(I.pc.via,{area:byId[r[7]][1]}))+'</p>':'';
    var A=(I.asking||{}), ak=(d.a||{})[kind], askp='';                // 29 Oct 2026: the approximate asking price
    if(ak&&r&&r[0]) askp='<p class="ask">'+esc(fmt(A.line,{eur:n(r[0]*(1+ak[0])),lo:n(r[0]*(1+ak[1])),hi:n(r[0]*(1+ak[2]))}))
      +'<br><span class="small">'+esc(fmt(A.src,{pct:Math.round(ak[0]*100)}))+'</span></p>';
    if(mode==='pc'){
      var price=num(F.price.value);
      if(price&&m2) h+='<p class="big">'+esc(fmt(T.ask,{eur:n(price/m2)}))+'</p>';
      if(r&&r[0]){
        h+='<p>'+esc(fmt(T.mid,{area:r[7]&&byId[r[7]]?byId[r[7]][1]:name,first:ml(r[4]),last:ml(r[5]),eur:n(r[0]),deeds:n(r[3]),p25:r[1]!=null?n(r[1]):'–',p75:r[2]!=null?n(r[2]):'–'}))
          +' <span class="small">· '+esc(I.grades[r[6]]||'')+'</span></p>'+via+askp;
        if(price&&m2){ var a=price/m2, pct=Math.round(100*(a/r[0]-1)), cls, txt;
          if(r[1]!=null&&a<r[1]){ cls='ok'; txt=T.below; } else if(r[2]==null||a<=r[2]){ cls='ok'; txt=T.within; }
          else { cls=a>r[2]*1.5?'bad':'warn'; txt=fmt(a>r[2]*1.5?T.far_above:T.above,{pct:n(pct)}); }
          var lo=r[1]!=null?r[1]:r[0]*0.7, hi=r[2]!=null?r[2]:r[0]*1.3, mx=Math.max(hi*1.6,a*1.1), sc=function(v){return Math.max(0,Math.min(100,100*v/mx));};
          h+='<p class="verdict '+cls+'">'+esc(txt)+'</p><div class="gauge" aria-hidden="true"><span class="rng" style="inset-inline-start:'+sc(lo)+'%;width:'+(sc(hi)-sc(lo))+'%"></span>'
            +'<span class="mid" style="inset-inline-start:'+sc(r[0])+'%"></span><span class="you" style="inset-inline-start:'+sc(a)+'%"></span></div>'; }
      } else h+='<p>'+esc(T.none)+'</p>';
      if(d.z) h+='<p>'+esc(fmt(T.zone,{lo:n(d.z[0]),hi:n(d.z[1])}))+'</p>';
      if(d.s&&price) h+='<p>'+esc(fmt(T.yield,{income:n(d.s[1]),pct:(100*d.s[1]/price).toFixed(1)}))+'</p>';
    } else {
      if(r&&r[0]&&m2){ h+='<p class="big">'+esc(fmt(T.range,{area:name,lo:n((r[1]||r[0]*0.8)*m2),hi:n((r[2]||r[0]*1.2)*m2),p25:r[1]!=null?n(r[1]):'–',p75:r[2]!=null?n(r[2]):'–',m2:n(m2)}))+'</p>'; }
      if(r&&r[0]) h+='<p>'+esc(fmt(T.mid,{eur:n(r[0]),deeds:n(r[3]),first:ml(r[4]),last:ml(r[5])}))+' <span class="small">· '+esc(I.grades[r[6]]||'')+'</span></p>'+via+askp;
      else h+='<p>'+esc(T.none)+'</p>';
      var lt=((LT||{})[z[0]]||{})[kind]||[];
      if(lt.length) h+='<h3>'+esc(T.latest_h)+'</h3><div class="cmp-wrap"><table class="sales"><tr><th></th><th>m²</th><th>€/m²</th><th></th></tr>'
        +lt.map(function(x){ return '<tr><th>'+esc(ml(x[0]))+'</th><td class="v">'+n(x[1])+'</td><td class="v">€'+n(x[2])+'</td><td class="v">'+esc(x[3]||'–')+'</td></tr>'; }).join('')+'</table></div>';
      var dm=[]; if(r&&r[3]) dm.push(fmt(T.demand_sales,{deeds:n(r[3]),months:r[8]||12}));
      if(d.s) dm.push(fmt(T.demand_str,{active:n(d.s[2]),income:n(d.s[1])}));
      if(dm.length) h+='<h3>'+esc(T.demand_h)+'</h3><ul>'+dm.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';
      h+='<p><a class="cta" href="#valuation">'+esc(T.form_h)+'</a></p>';
    }
    out.innerHTML=h;
  }
  Promise.all([fetch(root+'assets/prices.json').then(function(r){return r.json()}), fetch(root+'assets/pnames-'+lang+'.json').then(function(r){return r.json()}),
               mode==='sell'?fetch(root+'assets/latest.json').then(function(r){return r.json()}):Promise.resolve({})]).then(function(a){
    P=a[0]; N=a[1].filter(function(r){ return P[r[0]]; }); LT=a[2]; N.forEach(function(r){ byId[r[0]]=r; });
    D.getElementById('cp-pc-list').innerHTML=N.map(function(r){ return '<option value="'+esc(r[1]+' — '+r[3])+'"></option>'; }).join('');
    var h=decodeURIComponent((location.hash||'').slice(1)).split('|'), q=new URLSearchParams(location.search);
    if(h[0]&&byId[h[0]]){ F.area.value=byId[h[0]][1]+' — '+byId[h[0]][3]; if(h[1]) F.type.value=h[1]; }
    else if(q.get('area')) F.area.value=q.get('area');
    if(q.get('price')) F.price&&(F.price.value=q.get('price')); if(q.get('m2')) F.m2.value=q.get('m2');
    run(); });
  F.addEventListener('input',run); F.addEventListener('change',run);
})();