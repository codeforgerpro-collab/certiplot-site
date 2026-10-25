(function(){
  var box=document.getElementById('cp-compare'); if(!box) return;
  var C=JSON.parse(document.getElementById('cp-compare-i18n').textContent), root=document.documentElement.getAttribute('data-root')||'./';
  var data=null, chosen=[], ins=box.querySelectorAll('input.pick'), out=document.getElementById('cp-compare-out');
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function norm(t){ return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); }
  function render(){
    if(!chosen.length){ out.innerHTML='<p class="small">'+esc(C.empty)+'</p>'; return; }
    var h='<div class="cmp-wrap"><table class="cmp"><tr><th></th>'+chosen.map(function(r,i){ return '<th><a href="'+esc(root+r[1])+'">'+esc(r[0])+'</a><br><span class="small">'+esc(r[2])+'</span><br><button type="button" data-i="'+i+'" class="rm">'+esc(C.remove)+'</button></th>'; }).join('')+'</tr>';
    Object.keys(C.rows).forEach(function(k){ if(!chosen.some(function(r){return r[3][k]})) return;
      h+='<tr><th>'+esc(C.rows[k])+'</th>'+chosen.map(function(r){ return '<td>'+esc(r[3][k]||'–')+'</td>'; }).join('')+'</tr>'; });
    out.innerHTML=h+'</table></div>';
    out.querySelectorAll('button.rm').forEach(function(b){ b.addEventListener('click',function(){ chosen.splice(+b.getAttribute('data-i'),1); render(); }); });
  }
  var RANK={municipality:0,municipal_unit:1,regional_unit:2,district:2,region:3};
  function best(list){ return list.sort(function(a,b){ var ra=(a[4] in RANK)?RANK[a[4]]:5, rb=(b[4] in RANK)?RANK[b[4]]:5; return ra-rb; })[0]; }
  function pick(inp){ var q=norm(inp.value); if(!data||!q) return;
    var hit=data.find(function(r){ return norm(r[0]+' — '+r[2])===q; })||best(data.filter(function(r){ return norm(r[0])===q; }))||best(data.filter(function(r){ return norm(r[0]).indexOf(q)===0; }));
    if(hit && chosen.indexOf(hit)<0){ chosen.push(hit); if(chosen.length>3) chosen.shift(); inp.value=''; render(); } }
  fetch(root+box.getAttribute('data-src')).then(function(r){return r.json()}).then(function(j){ data=j;
    var dl=document.getElementById('cp-compare-list'); dl.innerHTML=j.map(function(r){ return '<option value="'+esc(r[0]+' — '+r[2])+'"></option>'; }).join('');
    var pre=(location.hash||'').slice(1).split(',').map(decodeURIComponent).filter(Boolean);
    pre.forEach(function(n){ var h=j.find(function(r){return r[1]===n||r[0]===n}); if(h) chosen.push(h); }); render(); });
  ins.forEach(function(inp){ inp.addEventListener('change',function(){ pick(inp); }); inp.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); pick(inp); } }); });
  render();
})();