(function(){
  var D=document, root=D.documentElement.getAttribute('data-root')||'./', lang=D.documentElement.lang;
  var S=JSON.parse(D.getElementById('cp-i18n').textContent);
  function unmail(c){ try{ return atob(c).split('').reverse().join('') }catch(e){ return '' } }
  var MAIL=unmail(S.mail||''); S.error=S.error.replace('{email}',MAIL);
  D.querySelectorAll('a.em').forEach(function(a){ var m=unmail(a.getAttribute('data-e')); if(m){ a.textContent=m; a.href='mailto:'+m; } });
  // ---- area search
  var idx=null;
  function load(cb){ if(idx) return cb(idx);
    fetch(root+'assets/search-'+lang+'.json').then(function(r){return r.json()}).then(function(j){idx=j;cb(j)}).catch(function(){}); }
  function norm(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }
  D.querySelectorAll('.search input').forEach(function(inp){
    var box=inp.parentNode, ul=D.createElement('ul'), on=-1; ul.hidden=true; box.appendChild(ul);
    function show(){ var q=norm(inp.value.trim()); if(q.length<2){ul.hidden=true;return}
      load(function(j){ var hits=[]; for(var i=0;i<j.length&&hits.length<12;i++){ if(norm(j[i][0]+' '+j[i][1]).indexOf(q)>=0) hits.push(j[i]); }
        ul.innerHTML = hits.length ? hits.map(function(h,k){return '<li><a href="'+root+h[2]+'">'+h[0].replace(/</g,'&lt;')+' <small>'+h[3].replace(/</g,'&lt;')+'</small></a></li>'}).join('')
                                   : '<li><small>'+S.none+'</small></li>';
        ul.hidden=false; on=-1; }); }
    inp.addEventListener('input',show); inp.addEventListener('focus',function(){load(function(){})});
    inp.addEventListener('keydown',function(e){ var a=ul.querySelectorAll('a'); if(!a.length) return;
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); on=(on+(e.key==='ArrowDown'?1:-1)+a.length)%a.length;
        a.forEach(function(x,i){x.classList.toggle('on',i===on)}); }
      if(e.key==='Enter'){ e.preventDefault(); location.href=(a[on]||a[0]).href; } });
    D.addEventListener('click',function(e){ if(!box.contains(e.target)) ul.hidden=true; });
  });
  // ---- buyer checklist (kept in this browser only)
  var cl=D.getElementById('checklist');
  if(cl){ var key='certiplot-checklist', st={}; try{ st=JSON.parse(localStorage.getItem(key)||'{}') }catch(e){}
    var boxes=cl.querySelectorAll('input[type=checkbox]'), bar=D.querySelector('.bar i'), out=D.getElementById('progress');
    function upd(){ var n=0; boxes.forEach(function(b){ if(b.checked) n++; }); if(bar) bar.style.width=(100*n/boxes.length)+'%';
      if(out) out.textContent=S.progress.replace('{done}',n).replace('{total}',boxes.length); }
    boxes.forEach(function(b){ b.checked=!!st[b.id]; b.addEventListener('change',function(){ st[b.id]=b.checked; try{localStorage.setItem(key,JSON.stringify(st))}catch(e){} upd(); }); });
    var rs=D.getElementById('reset'); if(rs) rs.addEventListener('click',function(){ st={}; try{localStorage.removeItem(key)}catch(e){} boxes.forEach(function(b){b.checked=false}); upd(); });
    var pr=D.getElementById('print'); if(pr) pr.addEventListener('click',function(){ window.print(); });
    upd(); }
  // ---- the visitor's date and time, and the time in Greece & Cyprus when it differs
  var ck=D.querySelector('header .clock'), ct=D.getElementById('clk');
  if(ck&&ct&&window.Intl){ var loc=lang==='en'?undefined:lang;
    var tick=function(){ try{ var n=new Date(), o={weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'};
      var mine=new Intl.DateTimeFormat(loc,o).format(n), gr=new Intl.DateTimeFormat(loc,{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Athens'}).format(n),
          same=new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Athens'}).format(n)===new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit'}).format(n);
      ct.setAttribute('datetime',n.toISOString());
      ct.innerHTML=same? '<b>'+mine+'</b> · '+ck.getAttribute('data-gr') : ck.getAttribute('data-you')+': <b>'+mine+'</b> · '+ck.getAttribute('data-gr')+': <b>'+gr+'</b>';
    }catch(e){} }; tick(); setInterval(tick,30000); }
  // ---- the requirements form: name, e-mail and area come from the link in our reply
  D.querySelectorAll('form.details').forEach(function(f){ try{ var u=new URLSearchParams(location.search);
    ['name','email','area','ref'].forEach(function(k){ var v=u.get(k), el=f.querySelector('[name='+k+']'); if(v&&el) el.value=v.slice(0,200); });
    var h=D.getElementById('det-area'); if(h&&u.get('area')) h.textContent=u.get('area').slice(0,80); }catch(e){} });
  // ---- the area-check form
  D.querySelectorAll('form.lead').forEach(function(f){
    f.addEventListener('submit',function(e){ e.preventDefault();
      var msg=f.querySelector('.msg'), btn=f.querySelector('button[type=submit]'), fd=new FormData(f), data={};
      fd.forEach(function(v,k){ data[k]=(k in data&&data[k])?data[k]+', '+v:v; });
      if(!data.name||!data.email||!data.area||!f.querySelector('[name=consent]').checked){ msg.className='msg bad'; msg.textContent=S.required; return; }
      if(data.botcheck) return;
      data.language=lang; data.page=location.href;
      var det=f.classList.contains('details'); if(det&&data.ref) data.ref=String(data.ref);
      var subject=(det?'Certiplot details - ':'Certiplot lead - ')+data.area+' - '+lang.toUpperCase()+(det?'':' - '+(data.purpose||''));
      var key=f.getAttribute('data-key'), mail=unmail(f.getAttribute('data-email')||'');
      if(!key){ var body=Object.keys(data).filter(function(k){return k!=='consent'&&k!=='botcheck'}).map(function(k){return k+': '+data[k]}).join('\n');
        location.href='mailto:'+mail+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body); msg.className='msg bad'; msg.textContent=S.error; return; }
      btn.disabled=true; var old=btn.textContent; btn.textContent=S.sending;
      data.access_key=key; data.subject=subject; data.from_name='Certiplot website'; data.replyto=data.email; delete data.consent;
      fetch(S.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json()}).then(function(j){ if(!j.success) throw 0; msg.className='msg ok'; msg.textContent=det?(f.getAttribute('data-thanks')||S.thanks):S.thanks;
            var nx=f.getAttribute('data-next'); if(nx){ var q='?name='+encodeURIComponent(data.name)+'&email='+encodeURIComponent(data.email)+'&area='+encodeURIComponent(data.area);
              var a=D.createElement('a'); a.className='cta'; a.href=nx+q; a.textContent=f.getAttribute('data-next-label')||''; msg.appendChild(D.createElement('br')); msg.appendChild(a); }
            f.reset();
            if(window.goatcounter&&goatcounter.count) goatcounter.count({path:'lead-sent',event:true}); })
        .catch(function(){ msg.className='msg bad'; msg.textContent=S.error; })
        .finally(function(){ btn.disabled=false; btn.textContent=old; });
    });
  });
})();