(function(){
  function make(el){ if(!window.L||!el||el.getAttribute('data-on')) return null; el.setAttribute('data-on','1');
    var lat=parseFloat(el.getAttribute('data-lat')), lon=parseFloat(el.getAttribute('data-lon')), z=parseFloat(el.getAttribute('data-zoom'))||11;
    var map=L.map(el,{scrollWheelZoom:false,minZoom:5,maxZoom:17}).setView([lat,lon],z);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    L.tileLayer(el.getAttribute('data-tiles'),{maxZoom:19,attribution:el.getAttribute('data-attr')}).addTo(map);
    L.circleMarker([lat,lon],{radius:8,color:'#14233b',weight:2,fillColor:'#a3262a',fillOpacity:.95}).addTo(map);
    map.on('focus',function(){ map.scrollWheelZoom.enable(); }); map.on('blur',function(){ map.scrollWheelZoom.disable(); });
    return map; }
  window.cpAreaMap=make;
  function all(){ Array.prototype.forEach.call(document.querySelectorAll('.area-map[data-lat]'),make); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',all); else all();
})();