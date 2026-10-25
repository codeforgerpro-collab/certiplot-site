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
  // ---- a link to one village (#v-...): bring its row into view once the page has settled
  if(/^#v-\d+$/.test(location.hash)){ var vt=D.getElementById(location.hash.slice(1)); if(vt) setTimeout(function(){ vt.scrollIntoView({block:'center'}); },60); }
  // ---- the requirements form: name, e-mail and area come from the link in our reply
  D.querySelectorAll('form.details').forEach(function(f){ try{ var u=new URLSearchParams(location.search);
    ['name','email','area','ref'].forEach(function(k){ var v=u.get(k), el=f.querySelector('[name='+k+']'); if(v&&el) el.value=v.slice(0,200); });
    var h=D.getElementById('det-area'); if(h&&u.get('area')) h.textContent=u.get('area').slice(0,80); }catch(e){} });
  // ---- checks before a form leaves: a real e-mail address (and common typos), a phone number when WhatsApp or a call is wanted
  var TYPO={'gmial.com':'gmail.com','gmai.com':'gmail.com','gmal.com':'gmail.com','gamil.com':'gmail.com','gnail.com':'gmail.com','gmaill.com':'gmail.com',
    'gmail.co':'gmail.com','gmail.con':'gmail.com','gmail.cm':'gmail.com','gmail.om':'gmail.com','gmail.gr':'gmail.com','hotmial.com':'hotmail.com',
    'hotmai.com':'hotmail.com','hotnail.com':'hotmail.com','hotmail.co':'hotmail.com','hotmail.con':'hotmail.com','yaho.com':'yahoo.com',
    'yahooo.com':'yahoo.com','yahoo.co':'yahoo.com','yahoo.con':'yahoo.com','outlok.com':'outlook.com','outloo.com':'outlook.com','outlook.co':'outlook.com',
    'outlook.con':'outlook.com','iclod.com':'icloud.com','icloud.co':'icloud.com','icoud.com':'icloud.com','live.co':'live.com','otenet.com':'otenet.gr',
    'mail.r':'mail.ru','yandex.r':'yandex.ru','gmx.d':'gmx.de','web.d':'web.de'};
  function emailOk(v){ return v.length<=254 && v.indexOf('..')<0 && /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/.test(v); }
  function fixMail(v){ var p=v.split('@'); return p.length===2&&TYPO[p[1].toLowerCase()] ? p[0]+'@'+TYPO[p[1].toLowerCase()] : ''; }
  function phoneOk(v,intl){ var t=v.trim(), d=t.replace(/\D/g,''); if(!/^(\+|00)?[\d\s().\/-]{6,24}$/.test(t)||d.length<8||d.length>15) return false; return !intl||/^(\+|00)/.test(t); }
  D.querySelectorAll('form.lead').forEach(function(f){
    var em=f.querySelector('[name=email]'), sg=f.querySelector('.sugg'), ph=f.querySelector('[name=phone]'), rb=f.querySelector('[name=reply_by]');
    function suggest(){ if(!em||!sg) return ''; var v=em.value.trim(), s=fixMail(v); if(sg.getAttribute('data-s')===s) return s; sg.setAttribute('data-s',s); sg.textContent='';
      if(s){ var b=D.createElement('button'); b.type='button'; b.textContent=S.email_typo.replace('{email}',s);
        b.addEventListener('click',function(){ em.value=s; sg.textContent=''; sg.setAttribute('data-s',''); em.removeAttribute('aria-invalid'); }); sg.appendChild(b); }
      return s; }
    function needPhone(){ return !!(rb&&rb.selectedOptions&&rb.selectedOptions[0]&&rb.selectedOptions[0].hasAttribute('data-phone')); }
    function syncPhone(){ if(!ph) return; var n=needPhone(); ph.required=n; ph.parentNode.classList.toggle('need',n); }
    if(em) em.addEventListener('blur',function(){ var v=em.value.trim(); em.value=v; suggest(); if(v) em.setAttribute('aria-invalid',emailOk(v)?'false':'true'); });
    if(ph) ph.addEventListener('blur',function(){ if(ph.value.trim()) ph.setAttribute('aria-invalid',phoneOk(ph.value,needPhone())?'false':'true'); });
    if(rb){ rb.addEventListener('change',function(){ syncPhone(); if(needPhone()&&ph&&!ph.value) ph.focus(); }); syncPhone(); }
  });
  // ---- where the buyer lives: every country (named in the page's language by the browser) and its towns (GeoNames)
  var CC='AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'.split(' ');
  var LG={he:'IL',el:'GR',de:'DE',nl:'NL',ru:'RU',ar:'AE',fr:'FR',es:'ES',en:'GB'};
  D.querySelectorAll('form.lead input[name=country]').forEach(function(inp,ix){
    if(!window.Intl||!Intl.DisplayNames) return; var dn; try{ dn=new Intl.DisplayNames([lang],{type:'region'}); }catch(e){ return; }
    var sel=D.createElement('select'); sel.name='country'; sel.setAttribute('autocomplete','country');
    var o0=D.createElement('option'); o0.value=''; o0.textContent=inp.getAttribute('data-ph')||''; sel.appendChild(o0);
    CC.map(function(c){ var n=''; try{ n=dn.of(c); }catch(e){} return [c,n]; }).filter(function(x){ return x[1]&&x[1]!==x[0]; })
      .sort(function(a,b){ return a[1].localeCompare(b[1],lang); })
      .forEach(function(x){ var o=D.createElement('option'); o.value=x[0]; o.textContent=x[1]; sel.appendChild(o); });
    var guess=''; (navigator.languages||[navigator.language||'']).some(function(l){ var r=(l||'').split('-')[1]; if(r&&r.length===2){ guess=r.toUpperCase(); return true; } return false; });
    if(guess) sel.value=guess;
    inp.parentNode.replaceChild(sel,inp);
    var f=sel.form, city=f&&f.querySelector('input[name=city]'); if(!city) return;
    var dl=D.createElement('datalist'); dl.id='cp-cities-'+ix; f.appendChild(dl); city.setAttribute('list',dl.id);
    var cache={};
    function load(){ var c=sel.value; dl.innerHTML=''; if(!c) return;
      var fill=function(names){ dl.innerHTML=names.slice(0,4000).map(function(n){ return '<option value="'+String(n).replace(/[&"<>]/g,function(m){return {'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[m]})+'">'; }).join(''); };
      if(cache[c]) return fill(cache[c]);
      fetch(root+'assets/cities/'+c+'.json').then(function(r){ return r.json(); }).then(function(n){ cache[c]=n; if(sel.value===c) fill(n); }).catch(function(){}); }
    sel.addEventListener('change',function(){ load(); city.value=''; }); load();
  });
  // ---- Golden Visa: the budget choices become the official minimums (and the area's own minimum is pre-selected)
  D.querySelectorAll('form.lead').forEach(function(f){
    var pu=f.querySelector('[name=purpose]'), bu=f.querySelector('select[name=budget]'), note=f.querySelector('.gvnote');
    if(!pu||!bu||!bu.getAttribute('data-gv')) return;
    var orig=bu.innerHTML, gv=JSON.parse(bu.getAttribute('data-gv')), mn=bu.getAttribute('data-gvmin');
    function sw(){ var on=!!(pu.selectedOptions[0]&&pu.selectedOptions[0].hasAttribute('data-gv'));
      if(on===(bu.getAttribute('data-mode')==='gv')) return; bu.setAttribute('data-mode',on?'gv':'');
      if(on){ bu.innerHTML=gv.map(function(t){ var o=D.createElement('option'); o.textContent=t; return o.outerHTML; }).join('');
        bu.selectedIndex = mn==='800000'?2 : mn==='400000'?1 : mn==='cy'?4 : gv.length-1; }
      else bu.innerHTML=orig;
      if(note) note.hidden=!on; }
    pu.addEventListener('change',sw); sw();
  });
  // ---- the area-check form
  D.querySelectorAll('form.lead').forEach(function(f){
    f.addEventListener('submit',function(e){ e.preventDefault();
      var msg=f.querySelector('.msg'), btn=f.querySelector('button[type=submit]'), em=f.querySelector('[name=email]'), ph=f.querySelector('[name=phone]');
      if(em) em.value=em.value.trim();
      var fd=new FormData(f), data={};
      fd.forEach(function(v,k){ data[k]=(k in data&&data[k])?data[k]+', '+v:v; });
      if(!data.name||!data.email||!data.area||!f.querySelector('[name=consent]').checked){ msg.className='msg bad'; msg.textContent=S.required; return; }
      if(!emailOk(data.email)){ msg.className='msg bad'; msg.textContent=S.email_invalid; em.setAttribute('aria-invalid','true'); em.focus(); return; }
      var typo=fixMail(data.email); if(typo&&!f.getAttribute('data-typo-seen')){ f.setAttribute('data-typo-seen','1'); em.dispatchEvent(new Event('blur'));
        msg.className='msg bad'; msg.textContent=S.email_typo.replace('{email}',typo); em.focus(); return; }
      var opt=f.querySelector('[name=reply_by]'), wantsPhone=!!(opt&&opt.selectedOptions[0]&&opt.selectedOptions[0].hasAttribute('data-phone'));
      if(ph&&(wantsPhone||(data.phone||'').trim())&&!phoneOk(data.phone||'',wantsPhone)){ msg.className='msg bad'; msg.textContent=S.phone_needed; ph.setAttribute('aria-invalid','true'); ph.focus(); return; }
      if(data.phone) data.phone=data.phone.trim().replace(/^00/,'+');
      var cs=f.querySelector('select[name=country]'); if(cs&&cs.value) data.country=cs.selectedOptions[0].textContent+' ('+cs.value+')';
      if(wantsPhone&&data.phone) data.whatsapp='https://wa.me/'+data.phone.replace(/\D/g,'');
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