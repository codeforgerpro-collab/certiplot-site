(function(){
  var box=document.getElementById('cp-proof'); if(!box) return;
  var D=document, I=JSON.parse(D.getElementById('cp-proof-i18n').textContent), X=I.x, PC=I.pc, A=I.asking||{};
  var root=D.documentElement.getAttribute('data-root')||'./', lang=D.documentElement.lang;
  var F=D.getElementById('cp-pr-form'), out=D.getElementById('cp-pr-out'), q=new URLSearchParams(location.search);
  var P=null, N=[], byId={}, R={}, S=null, CO={}, dataOk=false, sigOk=null;
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function n(x){ return Math.round(x).toLocaleString(lang); }
  function num(v){ var x=parseFloat(String(v||'').replace(/[^\d.,]/g,'').replace(/[.,](?=\d{3}(\D|$))/g,'').replace(',','.')); return isFinite(x)?x:0; }
  function norm(t){ return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim(); }
  function ml(m){ if(!m) return ''; var p=String(m).split('-'); return p[1]+'/'+p[0]; }
  function fmt(s,o){ return String(s).replace(/\{(\w+)\}/g,function(_,k){ return k in o?o[k]:'{'+k+'}'; }); }
  function hex(buf){ return Array.prototype.map.call(new Uint8Array(buf),function(b){ return ('0'+b.toString(16)).slice(-2); }).join(''); }
  function sha(buf){ return crypto.subtle.digest('SHA-256',buf).then(hex); }
  function b64(s){ var bin=atob(s), a=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i); return a; }
  function codeOf(b,z,k,m2,price,d){ var r=(d.t||{})[k]||[], zz=d.z||[];
    var s=['v1',b,z,k,m2,price,r[0],r[1],r[2],r[3],r[5],zz[0],zz[1]].map(function(v){ return v==null?'':String(v); }).join('|');
    return sha(new TextEncoder().encode(s)).then(function(h){ return h.slice(0,16); }); }
  function url(z,k,m2,price,code){ return location.origin+location.pathname+'?z='+encodeURIComponent(z)+'&k='+k+'&m2='+m2+'&price='+price+(code?'&b='+S.build+'&code='+code:''); }
  function find(){ var v=norm(F.area.value); if(!v) return null;
    return N.find(function(r){ return norm(r[1]+' — '+r[3])===v; })||N.find(function(r){ return norm(r[1])===v; })||N.find(function(r){ return norm(r[1]).indexOf(v)===0; }); }
  function checkSig(){ if(!S.sig||!S.pub||!window.crypto||!crypto.subtle) return Promise.resolve(null);
    return crypto.subtle.importKey('raw',b64(S.pub),{name:'Ed25519'},false,['verify'])
      .then(function(key){ return crypto.subtle.verify({name:'Ed25519'},key,b64(S.sig),new TextEncoder().encode(S.msg)); })
      .catch(function(){ return null; }); }
  function render(){
    var z=q.get('z'), k=q.get('k')||'apartment', m2=num(q.get('m2')), price=num(q.get('price'));
    if(!z||!byId[z]){ out.innerHTML=''; box.classList.remove('has'); return; }
    box.classList.add('has');
    var d=P[z]||{}, r=(d.t||{})[k], name=byId[z][1], where=byId[z][3], txt='';
    codeOf(S.build,z,k,m2,price,d).then(function(code){
      var h='';
      if(q.get('code')){ var b=q.get('b')||'', cls='bad', t=X.v_bad;
        if(b===S.build){ if(q.get('code')===code&&dataOk){ cls='ok'; t=X.v_ok; } }
        else { var old=(S.history||[]).filter(function(x){ return x.b===b; })[0];
          if(old){ cls='warn'; t=fmt(X.v_old,{b:b,date:old.date}); } else t=X.v_unknown; }
        h+='<p class="verdict '+cls+'" role="status">'+esc(t)+'</p>'; }
      h+='<article class="proof"><div class="pr-head"><p class="pr-brand">Certiplot · '+esc(X.h1)+'</p><h1>'+esc(name)+'</h1>'
        +(where?'<p class="small">'+esc(where)+'</p>':'')
        +'<p>'+esc(fmt(X.rep_for,{kind:(I.types||{})[k]||k,m2:n(m2),price:n(price)}))+(q.get('code')?'':' · '+esc(fmt(X.made,{date:new Date().toISOString().slice(0,10)})))+'</p></div>';
      h+='<h3>'+esc(X.s_price)+'</h3>';
      if(price&&m2) h+='<p class="big">'+esc(fmt(PC.ask,{eur:n(price/m2)}))+'</p>';
      if(r&&r[0]){
        h+='<p>'+esc(fmt(PC.mid,{area:r[7]&&byId[r[7]]?byId[r[7]][1]:name,first:ml(r[4]),last:ml(r[5]),eur:n(r[0]),deeds:n(r[3]),p25:r[1]!=null?n(r[1]):'–',p75:r[2]!=null?n(r[2]):'–'}))
          +' <span class="small">· '+esc((I.grades||{})[r[6]]||'')+'</span></p>';
        if(r[7]&&byId[r[7]]) h+='<p class="small">'+esc(fmt(PC.via,{area:byId[r[7]][1]}))+'</p>';
        var ak=(d.a||{})[k]; if(ak&&A.line) h+='<p class="ask">'+esc(fmt(A.line,{eur:n(r[0]*(1+ak[0])),lo:n(r[0]*(1+ak[1])),hi:n(r[0]*(1+ak[2]))}))+'</p>';
        if(price&&m2){ var a=price/m2, pct=Math.round(100*(a/r[0]-1)), cls2;
          if(r[1]!=null&&a<r[1]){ cls2='ok'; txt=PC.below; } else if(r[2]==null||a<=r[2]){ cls2='ok'; txt=PC.within; }
          else { cls2=a>r[2]*1.5?'bad':'warn'; txt=fmt(a>r[2]*1.5?PC.far_above:PC.above,{pct:n(pct)}); }
          var lo=r[1]!=null?r[1]:r[0]*0.7, hi=r[2]!=null?r[2]:r[0]*1.3, mx=Math.max(hi*1.6,a*1.1), sc=function(v){ return Math.max(0,Math.min(100,100*v/mx)); };
          h+='<p class="verdict '+cls2+'">'+esc(txt)+'</p><div class="gauge" aria-hidden="true"><span class="rng" style="inset-inline-start:'+sc(lo)+'%;width:'+(sc(hi)-sc(lo))+'%"></span>'
            +'<span class="mid" style="inset-inline-start:'+sc(r[0])+'%"></span><span class="you" style="inset-inline-start:'+sc(a)+'%"></span></div>'; }
      } else h+='<p>'+esc(PC.none)+'</p>';
      if(d.z) h+='<p>'+esc(fmt(PC.zone,{lo:n(d.z[0]),hi:n(d.z[1])}))+'</p>';
      if(d.s&&price) h+='<p>'+esc(fmt(PC.yield,{income:n(d.s[1]),pct:(100*d.s[1]/price).toFixed(1)}))+'</p>';
      if(typeof d.g==='number') h+='<p>'+esc(fmt(X.gv,{min:n(d.g)}))+'</p>';
      h+='<h3>'+esc(X.s_risk)+'</h3>';
      var rr=R[z]||[];
      h+=rr.length?'<table>'+rr.map(function(x){ return '<tr><th>'+esc(x[0])+'</th><td class="v">'+esc(x[1])+'</td><td class="small">'+esc(x[2])+'</td></tr>'; }).join('')+'</table>'
                  :'<p class="small">'+esc(X.no_risk)+'</p>';
      h+='<h3>'+esc(X.s_check)+'</h3><ol>'+X.checks.map(function(c){ return '<li>'+esc(c)+'</li>'; }).join('')+'</ol>';
      var vurl=url(z,k,m2,price,code), svg='';
      try{ var qr=qrcode(0,'M'); qr.addData(vurl); qr.make(); svg=qr.createSvgTag({cellSize:3,margin:2,scalable:true}); }catch(e){ svg=''; }
      h+='<section class="pr-seal"><div><h3>'+esc(X.s_seal)+'</h3><p>'+esc(fmt(X.seal_line,{b:S.build,date:S.date}))+'</p><p>'+esc(fmt(X.code_line,{code:code}))+'</p>'
        +'<p class="small">'+esc(dataOk?X.ok_data:X.bad_data)+' '+esc(sigOk===true?X.sig_ok:sigOk===false?X.sig_bad:X.sig_na)+'</p>'
        +'<p class="small pr-url">'+esc(vurl)+'</p></div>'+(svg?'<div class="pr-qr">'+svg+'<p class="small">'+esc(X.qr)+'</p></div>':'')+'</section>';
      h+='<p class="small">'+esc(X.note)+'</p></article>';
      var st=name+': '+(txt?txt+' — ':'')+(price&&m2?fmt(PC.ask,{eur:n(price/m2)})+' · ':'')+'Certiplot';
      h+='<p class="pr-act"><button type="button" class="cta" data-act="print">'+esc(X.print)+'</button>'
        +'<a class="cta alt" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(st+' '+vurl)+'">'+esc(X.wa)+'</a>'
        +'<button type="button" class="cta alt" data-act="copy" data-url="'+esc(vurl)+'">'+esc(X.copy)+'</button>'
        +'<a class="cta alt" href="'+esc(location.pathname)+'">'+esc(X.again)+'</a></p>';
      h+='<section class="band"><h2>'+esc(X.cta_h)+'</h2><p>'+esc(X.cta_p)+'</p><a class="cta" href="'+esc(I.contact_href)+'?area='+encodeURIComponent(name)+'">'+esc(I.check)+'</a></section>';
      out.innerHTML=h;
      var c=CO[z], head=out.querySelector('.pr-head');                 // PLUS-1: the area on the map
      if(c&&head&&window.cpAreaMap){ var m=D.createElement('div'); m.className='area-map'; m.setAttribute('data-lat',c[0]); m.setAttribute('data-lon',c[1]);
        m.setAttribute('data-zoom',c[2]||11); m.setAttribute('data-tiles',I.tiles); m.setAttribute('data-attr',I.attr); head.parentNode.insertBefore(m,head.nextSibling); window.cpAreaMap(m); }
    });
  }
  out.addEventListener('click',function(e){ var b=e.target.closest('[data-act]'); if(!b) return;
    if(b.getAttribute('data-act')==='print') window.print();
    else if(b.getAttribute('data-act')==='copy'&&navigator.clipboard) navigator.clipboard.writeText(b.getAttribute('data-url')).then(function(){ b.textContent=X.copied; }); });
  if(F) F.addEventListener('submit',function(e){ e.preventDefault(); var z=find(), msg=F.querySelector('.msg');
    if(!z){ if(msg){ msg.className='msg full bad'; msg.textContent=X.pick; } return; }
    location.search='?z='+encodeURIComponent(z[0])+'&k='+F.type.value+'&m2='+num(F.m2.value)+'&price='+num(F.price.value); });
  Promise.all([fetch(root+'assets/prices.json').then(function(r){ return r.arrayBuffer(); }),
               fetch(root+'assets/pnames-'+lang+'.json').then(function(r){ return r.json(); }),
               fetch(root+'assets/risks-'+lang+'.json').then(function(r){ return r.json(); }).catch(function(){ return {}; }),
               fetch(root+'assets/seal.json').then(function(r){ return r.json(); }),
               fetch(root+'assets/coords.json').then(function(r){ return r.json(); }).catch(function(){ return {}; })]).then(function(a){
    P=JSON.parse(new TextDecoder().decode(a[0])); N=a[1].filter(function(r){ return P[r[0]]; }); N.forEach(function(r){ byId[r[0]]=r; }); R=a[2]||{}; S=a[3]; CO=a[4]||{};
    var dl=D.getElementById('cp-pr-list'); if(dl) dl.innerHTML=N.map(function(r){ return '<option value="'+esc(r[1]+' — '+r[3])+'"></option>'; }).join('');
    if(q.get('area')&&F) F.area.value=q.get('area');
    return Promise.all([sha(a[0]),checkSig()]); }).then(function(v){ dataOk=(v[0]===S.data_sha256); sigOk=v[1]; render(); })
   .catch(function(){ out.innerHTML=''; });
})();