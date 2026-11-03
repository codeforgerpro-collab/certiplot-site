(function(){
  var box=document.getElementById('cp-start'); if(!box) return;
  var D=document, I=JSON.parse(D.getElementById('cp-st-i18n').textContent), X=I.X, B=I.B, S=I.S, LK=I.links;
  var root=D.documentElement.getAttribute('data-root')||'./', lang=D.documentElement.lang;
  var P=null, LT=null, N=null, byId={}, loading=null;
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function n(x){ return Math.round(x).toLocaleString(lang); }
  function num(v){ var x=parseFloat(String(v||'').replace(/[^\d.,]/g,'').replace(/[.,](?=\d{3}(\D|$))/g,'').replace(',','.')); return isFinite(x)?x:0; }
  function norm(t){ return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim(); }
  function fmt(s,o){ return String(s).replace(/\{(\w+)\}/g,function(_,k){ return k in o?o[k]:'{'+k+'}'; }); }
  function ml(m){ if(!m) return ''; var q=String(m).split('-'); return q[1]+'/'+q[0]; }
  function url(k,extra){ return root+k+(extra||''); }
  function find(q){ q=norm(q); if(!q||!N) return null;
    return N.find(function(r){ return norm(r[1]+' — '+r[3])===q; })||N.find(function(r){ return norm(r[1])===q; })||N.find(function(r){ return norm(r[1]).indexOf(q)===0; }); }
  function load(){
    if(loading) return loading;
    loading=Promise.all([fetch(root+'assets/prices.json').then(function(r){return r.json()}),
                         fetch(root+'assets/pnames-'+lang+'.json').then(function(r){return r.json()}),
                         fetch(root+'assets/latest.json').then(function(r){return r.json()}).catch(function(){return {};})]).then(function(a){
      P=a[0]; LT=a[2]; N=a[1].filter(function(r){ return P[r[0]]; }); N.forEach(function(r){ byId[r[0]]=r; });
      D.getElementById('cp-st-list').innerHTML=N.map(function(r){ return '<option value="'+esc(r[1]+' — '+r[3])+'"></option>'; }).join('');
    });
    return loading;
  }
  // ---- one step of the plan: title, text (or bullets), optional button
  function step(title,body,link){
    var inner=Array.isArray(body)?'<ul>'+body.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'<p>'+esc(body)+'</p>';
    return '<li><h3>'+esc(title)+'</h3>'+inner+(link?'<p><a class="cta alt" href="'+esc(link[0])+'">'+esc(link[1])+'</a></p>':'')+'</li>';
  }
  function show(pane,head,steps,cta){
    var o=pane.querySelector('.st-out');
    o.innerHTML='<div class="st-head"><p class="st-nx">'+esc(X.next)+'</p><p class="st-h">'+esc(head)+'</p></div>'
      +'<h2 class="st-plan" tabindex="-1">'+esc(X.plan)+'</h2><ol class="st-steps">'+steps.join('')+'</ol>'
      +'<div class="st-end"><p>'+esc(cta[0])+'</p><a class="cta" href="'+esc(cta[1])+'">'+esc(cta[2])+'</a></div>';
    var h=o.querySelector('.st-plan'); try{ h.focus({preventScroll:true}); o.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){ }
  }
  // ---- the request form: shown under the plan, with the area filled in; the big button scrolls to it
  function request(name,pane){
    var q=D.getElementById('st-req'); if(!q) return;
    pane.appendChild(q); q.hidden=false;
    var a=q.querySelector('[name=area]'); if(a) a.value=name;
    Array.prototype.forEach.call(pane.querySelectorAll('a[href="#st-req"]'),function(l){
      l.setAttribute('href','#st-req'); l.addEventListener('click',function(e){ e.preventDefault(); q.scrollIntoView({behavior:'smooth',block:'start'}); var f=q.querySelector('[name=name]'); if(f) try{ f.focus({preventScroll:true}); }catch(x){} }); });
  }
  // ---- buyer
  function buyer(F,pane,only){
    var z=find(F.area.value), budget=F.budget?num(F.budget.value):0, size=F.size?num(F.size.value):0, kind=F.type.value, msg=F.querySelector('.msg');
    if(!z){ msg.textContent=X.pick; return; } msg.textContent='';
    var d=P[z[0]]||{}, r=(d.t||{})[kind], name=z[1], steps=[], head, tn=(I.types[kind]||kind).toLowerCase();
    var cta=[X.done_buy,'#st-req',X.go_free];
    var areaStep=step(B.area_t,B.area,[url(z[2]),B.area_go])+step(B.chk_t,B.chk,[url(LK.compare),B.chk_go]);
    if(r&&r[0]&&!budget){
      var m0=r[0], q1=r[1]!=null?r[1]:m0*0.8, q3=r[2]!=null?r[2]:m0*1.2, ak0=(d.a||{})[kind];
      head=B.head_area;
      steps.push(step(B.snap_t,[fmt(B.snap,{area:name,type:tn,eur:n(m0),p25:n(q1),p75:n(q3),deeds:n(r[3]),first:ml(r[4]),last:ml(r[5])})]
        .concat(ak0?[fmt(B.ask,{pct:Math.round(ak0[0]*100),eur:n(m0*(1+ak0[0]))})]:[])));
      steps.push(areaStep);
    } else if(r&&r[0]){
      var med=r[0], p25=r[1]!=null?r[1]:med*0.8, p75=r[2]!=null?r[2]:med*1.2;
      var t=fmt(B.buys,{area:name,type:tn,eur:n(med),p25:n(p25),p75:n(p75),deeds:n(r[3]),budget:n(budget),mid:n(budget/med),lo:n(budget/p75),hi:n(budget/p25)});
      var fit='', head2=B.head_buys;
      if(size){ var lo=size*p25, hi=size*p75, o={size:n(size),lo:n(lo),hi:n(hi)};
        if(budget<lo){ fit=fmt(B.fit_low,o); head2=B.head_low; } else if(budget<=hi){ fit=fmt(B.fit_ok,o); head2=B.head_fit; } else { fit=fmt(B.fit_high,o); head2=B.head_fit; } }
      head=head2;
      var ak=(d.a||{})[kind], askt=ak?fmt(B.ask,{pct:Math.round(ak[0]*100),eur:n(med*(1+ak[0]))}):'';
      steps.push(step(B.buys_t,[t].concat(fit?[fit]:[]).concat(askt?[askt]:[])));
      steps.push(areaStep);
    } else { head=B.head_none; steps.push(step(B.buys_t,B.none)); steps.push(areaStep); }
    if(only){ steps.push(step(B.check_t,B.check,[url(LK.pricecheck,'#'+encodeURIComponent(z[0]+'|'+kind)),X.go_pc])); steps.push(step(B.dd_t,B.dd[kind]||B.dd.apartment));
      steps.push(step(B.free_t,B.free,[cta[1],X.go_free])); show(pane,head,steps,cta); request(name,pane); return; }
    if(budget) steps.push(step(B.total_t,fmt(B.total,{budget:n(budget)}),[url(LK.calc),X.go_calc]));
    else steps.push(step(B.total_t,B.total0,[url(LK.calc),X.go_calc]));
    steps.push(step(B.check_t,B.check,[url(LK.pricecheck,(size?'?m2='+encodeURIComponent(size):'')+'#'+encodeURIComponent(z[0]+'|'+kind)),X.go_pc]));
    steps.push(step(B.dd_t,B.dd[kind]||B.dd.apartment));
    var pu=F.purpose.value;
    if(pu==='rent'){ steps.push(step(B.rent_t,d.s&&budget?fmt(B.rent,{income:n(d.s[1]),pct:(100*d.s[1]/budget).toFixed(1)}):B.rent_none)); }
    else if(pu==='holiday'){ steps.push(step(B.holiday_t,B.holiday)); } else { steps.push(step(B.live_t,B.live)); }
    if(F.abroad&&F.abroad.checked) steps.push(step(B.abroad_t,B.abroad));
    if(d.g&&budget&&budget>=d.g) steps.push(step('',fmt(B.gv,{gv:n(d.g)})).replace('<h3></h3>',''));
    steps.push(step(B.list_t,B.list,[url(LK.checklist),X.go_list]));
    steps.push(step(B.free_t,B.free,[cta[1],X.go_free]));
    show(pane,head,steps,cta); request(name,pane);
  }
  // ---- seller
  function seller(F,pane){
    var z=find(F.area.value), size=num(F.size.value), kind=F.type.value, hope=num(F.hope.value), when=parseInt(F.when.value,10)||0, msg=F.querySelector('.msg');
    if(!z){ msg.textContent=X.pick; return; } if(!size){ msg.textContent=X.need_s; return; } msg.textContent='';
    var d=P[z[0]]||{}, r=(d.t||{})[kind], name=z[1], steps=[], head;
    var cta=[X.done_sell,url(LK.sell,'?m2='+encodeURIComponent(size)+'#'+encodeURIComponent(z[0]+'|'+kind)),X.go_val];
    if(r&&r[0]){
      var med=r[0], p25=r[1]!=null?r[1]:med*0.8, p75=r[2]!=null?r[2]:med*1.2, lo=p25*size, hi=p75*size;
      steps.push(step(S.range_t,fmt(S.range,{area:name,lo:n(lo),hi:n(hi),p25:n(p25),p75:n(p75),size:n(size),eur:n(med),deeds:n(r[3])})+(I.grades[r[6]]?' ('+I.grades[r[6]]+')':'')));
      head=S.head_range;
      var pt=[]; // price advice
      if(hope){ if(hope<lo){ pt.push(S.hope_low); head=S.head_check; } else if(hope<=hi){ pt.push(S.hope_ok); head=S.head_ok; }
        else { pt.push(hope>hi*1.5?S.hope_far:S.hope_high); head=S.head_check; } }
      var ak=(d.a||{})[kind]; if(ak) pt.push(fmt(S.ask,{eur:n(med*(1+ak[0])),lo:n(med*(1+ak[1])),hi:n(med*(1+ak[2]))}));
      pt.push([S.price_fast,S.price_mid,S.price_slow,S.price_look][Math.max(0,Math.min(3,when))]);
      steps.push(step(S.price_t,pt));
      var per=(r[3]||0)/(r[8]||12), perT=per<10?per.toFixed(1):n(per);
      steps.push(step(S.demand_t,fmt(per<1?S.demand_low:(per<6?S.demand_mid:S.demand_high),{per:perT})));
    } else { head=S.head_none; steps.push(step(S.range_t,S.none)); }
    var docs=S.docs.slice(), sit=F.situation.value;
    if(S['docs_'+sit]) docs=docs.concat(S['docs_'+sit]); if(kind==='plot') docs=docs.concat(S.docs_plot);
    steps.push(step(S.docs_t,docs));
    steps.push(step(S.gr_t,S.gr.concat([S.gr_note])));
    steps.push(step(S.agent_t,S.agent)); steps.push(step(S.tax_t,S.tax));
    steps.push(step(S.free_t,S.free,[cta[1],X.go_val]));
    show(pane,head,steps,cta);
  }
  // ---- choosing a side
  var panes={buy:D.getElementById('st-buy'),area:D.getElementById('st-area'),sell:D.getElementById('st-sell')}, pick=box.querySelector('.st-pick');
  function side(){
    var s=(location.hash||'').replace('#','');
    Object.keys(panes).forEach(function(k){ panes[k].hidden=(k!==s); });
    pick.classList.toggle('chosen',!!panes[s]);
    if(panes[s]){ load(); var f=panes[s].querySelector('input[name=area]'); try{ f.focus({preventScroll:true}); }catch(e){} }
  }
  Array.prototype.forEach.call(box.querySelectorAll('.st-tile'),function(a){ a.addEventListener('click',function(e){ e.preventDefault();
    try{ history.pushState(null,'','#'+a.getAttribute('data-side')); }catch(x){ location.hash=a.getAttribute('data-side'); } side(); }); });
  window.addEventListener('hashchange',side);
  Array.prototype.forEach.call(box.querySelectorAll('form.st-form'),function(F){
    F.addEventListener('submit',function(e){ e.preventDefault(); var pane=F.closest('.st-pane');
      load().then(function(){ var k=pane.getAttribute('data-pane'); (k==='sell'?seller:buyer)(F,pane,k==='area'); }); });
  });
  side();
})();