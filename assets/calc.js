(function(){
  var F=document.getElementById('cp-calc'); if(!F) return;
  var C=JSON.parse(document.getElementById('cp-calc-i18n').textContent), RV=C.rv||{}, lang=document.documentElement.lang;
  function v(id){ return (RV[id]||{}).values||{}; }
  function num(n){ var x=parseFloat(String(n||'').replace(/[^\d.,]/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',','.')); return isFinite(x)?x:0; }
  function eur(x){ return '€'+Math.round(x).toLocaleString(lang); }
  function el(n){ return F.querySelector('[name='+n+']'); }
  var today=new Date().toISOString().slice(0,10);
  function notary(base){ var sc=(v('gr-tax-notary-fees').scale)||[{pct:0.8,up_to_eur:120000},{pct:0.7,up_to_eur:380000},{pct:0.65,up_to_eur:2000000}];
    var left=base, prev=0, fee=0; for(var i=0;i<sc.length&&left>0;i++){ var cap=sc[i].up_to_eur||Infinity, part=Math.min(left,cap-prev); fee+=part*sc[i].pct/100; left-=part; prev=cap; }
    if(left>0) fee+=left*(sc[sc.length-1].pct)/100; return (fee+(v('gr-tax-notary-fees').fixed_fee_eur||20))*1.24; }
  function run(){
    var cy=el('country').value==='cy', P=num(el('price').value), O=num(el('objective').value), nw=el('new').checked, first=el('first').checked,
        married=el('family').value==='married', kids=parseInt(el('children').value||'0',10)||0, size=num(el('size').value),
        ag=num(el('agent').value)/100, lw=num(el('lawyer').value)/100, rows=[];
    F.querySelectorAll('.gr-only').forEach(function(x){ x.hidden=cy; }); F.querySelectorAll('.cy-only').forEach(function(x){ x.hidden=!cy; });
    if(!P){ document.getElementById('cp-calc-out').innerHTML=''; return; }
    if(!cy){
      var fm=v('gr-tax-fma-3pct'), rate=(fm.effective_rate_pct||3.09)/100, vs=v('gr-tax-vat-newbuild-and-suspension'), end=(RV['gr-tax-vat-newbuild-and-suspension']||{}).to||'2026-12-31';
      var base=Math.max(P,O), susp=today<=end;
      if(nw && !susp){ rows.push([C.rows.vat_gr.replace('{date}',end)+' ✗', P*0.24]); }
      else {
        if(nw) rows.push([C.rows.vat_gr.replace('{date}',end), 0]);
        var lim=0, note='';
        if(first){ lim=(married?(fm.first_home_exemption_married_up_to_eur||250000):(fm.first_home_exemption_unmarried_up_to_eur||200000));
          for(var k=1;k<=kids;k++) lim+= k<=2?(fm.first_home_exemption_per_child_first_two_eur||25000):(fm.first_home_exemption_per_child_third_and_more_eur||30000);
          note=' ('+C.rows.fma_exempt.replace('{amount}',eur(lim))+')'; }
        rows.push([C.rows.fma+note, Math.max(0,base-lim)*rate]); }
      rows.push([C.rows.notary, notary(base)]);
      var cd=v('gr-tax-cadastre-registration-fees'); rows.push([C.rows.cadastre, base*(cd.proportional_fee_sale_per_mille||5)/1000+(cd.fixed_fee_sale_eur||3)]);
      if(lw) rows.push([C.rows.lawyer, P*lw*1.24]); if(ag) rows.push([C.rows.agent, P*ag*1.24]);
    } else {
      var vr=v('cy_tax_vat_reduced_5_primary_residence'), maxA=vr.max_total_buildable_area_m2||190, maxV=vr.max_total_transaction_value_eur||475000,
          redA=vr.area_at_reduced_rate_m2||130, redV=350000, vat=0, note='';
      if(nw){
        if(first && size && size<=maxA && P<=maxV){ var share=Math.min(1,redA/size), red=Math.min(P*share,redV); vat=red*0.05+(P-red)*0.19; rows.push([C.rows.cy_vat5, vat]); }
        else { vat=P*0.19; rows.push([C.rows.cy_vat19, vat]); if(first) note=C.vat5_not; }
        rows.push([C.rows.cy_fees_none, 0]);
      } else {
        var bands=(v('cy_tax_transfer_fees').bands)||[{rate_pct:3,up_to_eur:85000},{from_eur:85001,rate_pct:5,up_to_eur:170000},{above_eur:170000,rate_pct:8}];
        var fee=0, prev=0; bands.forEach(function(b){ var cap=b.up_to_eur||Infinity, part=Math.max(0,Math.min(P,cap)-prev); fee+=part*b.rate_pct/100; prev=cap; });
        rows.push([C.rows.cy_fees, fee/2]); }
      rows.push([C.rows.cy_stamp, 0]);
      if(lw) rows.push([C.rows.cy_lawyer, P*lw*1.19]); if(ag) rows.push([C.rows.cy_agent, P*ag*1.19]);
    }
    var tot=rows.reduce(function(a,r){return a+r[1]},0);
    var h='<table class="calc">'+rows.map(function(r){ return '<tr><th>'+r[0].replace(/</g,'&lt;')+'</th><td class="v">'+eur(r[1])+'</td></tr>'; }).join('')
      +'<tr class="tot"><th>'+C.total+'<br><span class="small">'+C.total_pct.replace('{pct}',(100*tot/P).toFixed(1).replace('.',(1.5).toLocaleString(lang).charAt(1)))+'</span></th><td class="v">'+eur(tot)+'</td></tr>'
      +'<tr><th>'+C.grand+'</th><td class="v">'+eur(P+tot)+'</td></tr></table>'+(note?'<p class="small">'+note+'</p>':'');
    document.getElementById('cp-calc-out').innerHTML=h;
  }
  F.addEventListener('submit',function(e){ e.preventDefault(); }); F.addEventListener('input',run); F.addEventListener('change',function(e){ if(e.target.name==='country'){ el('agent').value=el('country').value==='cy'?'0':'2'; } run(); }); run();
})();