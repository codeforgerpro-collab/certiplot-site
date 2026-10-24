(function(){
  var el=document.getElementById('cp-map'); if(!el||!window.L) return;
  var M=JSON.parse(document.getElementById('cp-map-i18n').textContent), root=document.documentElement.getAttribute('data-root')||'./';
  var map=L.map(el,{scrollWheelZoom:false,worldCopyJump:false,minZoom:3,maxZoom:17,zoomSnap:0.5}).setView([37.6,26.5],6);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
  L.tileLayer(el.getAttribute('data-tiles'),{maxZoom:19,attribution:el.getAttribute('data-attr')}).addTo(map);
  map.on('focus',function(){map.scrollWheelZoom.enable()}); map.on('blur',function(){map.scrollWheelZoom.disable()});
  var COL=['#f4e3b5','#e7c578','#cf9b3e','#a8652a','#6e3518'], CY='#3b82c4', NONE='#9aa3ad';
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  fetch(root+el.getAttribute('data-src')).then(function(r){return r.json()}).then(function(rows){
    var vals=rows.map(function(r){return r[7]}).filter(function(v){return v>0}).sort(function(a,b){return a-b});
    function q(p){return vals.length?vals[Math.min(vals.length-1,Math.floor(p*vals.length))]:0}
    var cut=[q(.2),q(.4),q(.6),q(.8)];
    function col(r){ if(r[8]==='cy') return CY; var v=r[7]; if(!(v>0)) return NONE; for(var i=0;i<4;i++){ if(v<cut[i]) return COL[i]; } return COL[4]; }
    var pts=[];
    rows.forEach(function(r){
      var m=L.circleMarker([r[1],r[2]],{radius:7,weight:1.5,color:'#1d2430',opacity:.55,fillColor:col(r),fillOpacity:.9});
      var h='<b>'+esc(r[0])+'</b><br><small>'+esc(r[4])+'</small>';
      if(r[5]) h+='<br>'+esc(M.zone)+': <b>'+esc(r[5])+'</b>';
      if(r[6]) h+='<br>'+esc(M.declared)+': <b>'+esc(r[6])+'</b>';
      if(!r[5]&&!r[6]) h+='<br><small>'+esc(M.no_figure)+'</small>';
      h+='<br><a class="cta" href="'+esc(root+r[3])+'">'+esc(M.open)+'</a>';
      m.bindPopup(h,{maxWidth:280}); m.bindTooltip(r[0],{direction:'top',offset:[0,-6]}); m.addTo(map); pts.push([r[1],r[2]]);
    });
    if(pts.length) map.fitBounds(pts,{padding:[20,20]});
    // towns and villages: shown from zoom 10, on a canvas (thousands of points stay fast)
    var vsrc=el.getAttribute('data-villages'), vlayer=null, vload=false, cv=L.canvas({padding:.3});
    function villages(){ if(!vsrc) return; var on=map.getZoom()>=10;
      if(on&&!vload){ vload=true; fetch(root+vsrc).then(function(r){return r.json()}).then(function(vs){
          vlayer=L.layerGroup(vs.map(function(v){ var m=L.circleMarker([v[1],v[2]],{renderer:cv,radius:4.5,weight:1,color:'#1d2430',opacity:.5,
              fillColor:col([0,0,0,0,0,0,0,v[6],v[7]||'gr']),fillOpacity:.85});
            m.bindPopup('<b>'+esc(v[0])+'</b><br><small>'+esc(v[4])+'</small>'+(v[5]?'<br>'+esc(M.zone)+': <b>'+esc(v[5])+'</b>':'<br><small>'+esc(M.no_figure)+'</small>')
              +'<br><a class="cta" href="'+esc(root+v[3])+'">'+esc(M.open)+'</a>',{maxWidth:260});
            m.bindTooltip(v[0],{direction:'top',offset:[0,-4]}); return m; }));
          if(map.getZoom()>=10) vlayer.addTo(map); }).catch(function(){}); }
      else if(vlayer){ if(on&&!map.hasLayer(vlayer)) vlayer.addTo(map); if(!on&&map.hasLayer(vlayer)) map.removeLayer(vlayer); } }
    map.on('zoomend',villages); villages();
    var lg=document.getElementById('cp-map-legend');
    if(lg&&vals.length){ var f=function(v){return '€'+Math.round(v).toLocaleString(document.documentElement.lang)};
      lg.innerHTML='<b>'+esc(M.legend)+'</b><span class="sw">'+COL.map(function(c,i){return '<i style="background:'+c+'" title="'+(i?f(cut[i-1]):'')+'"></i>'}).join('')+'</span>'
        +'<small>'+esc(M.low)+' '+f(vals[0])+' → '+f(vals[vals.length-1])+' '+esc(M.high)+'</small><span class="cyk"><i style="background:'+CY+'"></i>'+esc(M.cyprus)+'</span>'; }
  }).catch(function(){});
})();