(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
var MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'],JOURS=['dim','lun','mar','mer','jeu','ven','sam'];
function fmt(x){return (Math.round(x*10)/10).toFixed(1).replace('.',',')}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var period='month',ALL=[];
function sod(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function buckets(){
  var now=new Date(),o=[],i,t;
  if(period==='day'){t=sod(now).getTime();for(i=0;i<24;i++)o.push({s:t+i*36e5,e:t+(i+1)*36e5,l:i+'h',lo:i+'h – '+(i+1)+'h'})}
  else if(period==='week'||period==='month'){
    var n=period==='week'?7:30;
    for(i=n-1;i>=0;i--){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i),e=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i+1);
      o.push({s:d.getTime(),e:e.getTime(),l:period==='week'?JOURS[d.getDay()]+' '+d.getDate():d.getDate()+'/'+(d.getMonth()+1),lo:JOURS[d.getDay()]+' '+d.getDate()+' '+MOIS[d.getMonth()]})}
  }else{
    var first=now,list=ALL.map(function(a){return new Date(a.date).getTime()});
    var n2=12;
    if(period==='all'&&list.length){first=new Date(Math.min.apply(null,list));n2=Math.min(24,(now.getFullYear()-first.getFullYear())*12+now.getMonth()-first.getMonth()+1)}
    for(i=n2-1;i>=0;i--){var m=new Date(now.getFullYear(),now.getMonth()-i,1),m2=new Date(now.getFullYear(),now.getMonth()-i+1,1);
      o.push({s:m.getTime(),e:m2.getTime(),l:MOIS[m.getMonth()],lo:MOIS[m.getMonth()]+' '+m.getFullYear()})}
  }
  return o;
}
function key(a){return a.lieu||a.service}
function label(a){return a.lieu?SVC[a.service]+' · '+a.lieu:SVC[a.service]}
function fill(){
  var sel=$('fs'),v=sel.value;
  sel.innerHTML='<option value="">Tous les services</option>'+Object.keys(SVC).map(function(k){return '<option value="'+k+'">'+SVC[k]+'</option>'}).join('');sel.value=v;
  var seen={},ls=[];ALL.forEach(function(a){var k=key(a);if(!seen[k]){seen[k]=1;ls.push({k:k,l:label(a)})}});
  ls.sort(function(a,b){return a.l.localeCompare(b.l,'fr',{numeric:true})});
  var lv=$('fl').value;$('fl').innerHTML='<option value="">Toutes les chambres et QR codes</option>'+ls.map(function(x){return '<option value="'+esc(x.k)+'">'+esc(x.l)+'</option>'}).join('');$('fl').value=lv;
}
function pass(a,skipSvc){
  if(!skipSvc&&$('fs').value&&a.service!==$('fs').value)return false;
  if($('fn').value&&a.note!==+$('fn').value)return false;
  if($('fl').value&&key(a)!==$('fl').value)return false;
  return true;
}
function avg(l){return l.length?l.reduce(function(s,a){return s+a.note},0)/l.length:null}
function delta(cur,prev,unit,dec){
  if(prev==null||cur==null)return '';
  var d=cur-prev;if(Math.abs(d)<0.05&&dec)return '= période précédente';
  var s=(d>0?'+':'')+(dec?fmt(d):Math.round(d));return s+(unit||'')+' vs période précédente';
}
function line(b){
  var W=340,H=170,L=26,R=10,T=10,B=26,pw=W-L-R,ph=H-T-B,n=b.length;
  function X(i){return L+(n===1?pw/2:i*pw/(n-1))}function Y(v){return T+ph-(v-1)/4*ph}
  var g='',i;for(i=1;i<=5;i++)g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(i)+'" y2="'+Y(i)+'" class="gl"/><text x="'+(L-6)+'" y="'+(Y(i)+3.5)+'" class="ax" text-anchor="end">'+i+'</text>';
  var pts=[];b.forEach(function(x,i){if(x.a!=null)pts.push([X(i),Y(x.a),i])});
  var path=pts.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)}).join(' ');
  var area=pts.length>1?'<path d="'+path+' L'+pts[pts.length-1][0].toFixed(1)+' '+Y(1)+' L'+pts[0][0].toFixed(1)+' '+Y(1)+' Z" fill="rgba(42,98,196,.12)"/>':'';
  var dots=pts.map(function(p){return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(n>14?2.4:3.6)+'" fill="#2a62c4"/>'}).join('');
  var step=Math.ceil(n/6),xl='';b.forEach(function(x,i){if(i%step===0||i===n-1&&n<8)xl+='<text x="'+X(i)+'" y="'+(H-8)+'" class="ax" text-anchor="middle">'+esc(x.l)+'</text>'});
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Évolution de la note moyenne">'+g+area+'<path d="'+path+'" fill="none" stroke="#2a62c4" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>'+dots+xl+'<rect class="hit" x="'+L+'" y="'+T+'" width="'+pw+'" height="'+ph+'" fill="transparent"/><line id="cur1" y1="'+T+'" y2="'+(T+ph)+'" class="cur" visibility="hidden"/></svg>';
}
function bars(b){
  var W=340,H=130,L=26,R=10,T=14,B=22,pw=W-L-R,ph=H-T-B,n=b.length,mx=Math.max.apply(null,b.map(function(x){return x.n}).concat([1]));
  var bw=Math.max(2,pw/n*.62),o='<text x="'+(L-6)+'" y="'+(T+3.5)+'" class="ax" text-anchor="end">'+mx+'</text><text x="'+(L-6)+'" y="'+(T+ph+3.5)+'" class="ax" text-anchor="end">0</text><line x1="'+L+'" x2="'+(W-R)+'" y1="'+(T+ph)+'" y2="'+(T+ph)+'" class="gl"/>';
  b.forEach(function(x,i){var h=x.n/mx*ph,cx=L+(i+.5)*pw/n;if(x.n)o+='<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+(T+ph-h).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="1.5" fill="#1f9a35"/>'});
  var step=Math.ceil(n/6);b.forEach(function(x,i){if(i%step===0)o+='<text x="'+(L+(i+.5)*pw/n)+'" y="'+(H-6)+'" class="ax" text-anchor="middle">'+esc(x.l)+'</text>'});
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Nombre d\'avis par période">'+o+'</svg>';
}
function render(){
  var b=buckets(),t0=b[0].s,t1=b[b.length-1].e,span=t1-t0;
  var cur=ALL.filter(function(a){var t=new Date(a.date).getTime();return t>=t0&&t<t1&&pass(a)});
  var prev=null;
  if(period!=='all'){var p0=period==='year'?new Date(new Date(t0).getFullYear()-1,new Date(t0).getMonth(),1).getTime():t0-span;
    prev=ALL.filter(function(a){var t=new Date(a.date).getTime();return t>=p0&&t<t0&&pass(a)})}
  $('none').hidden=cur.length>0;$('st').hidden=cur.length===0;
  if(!cur.length)return;
  b.forEach(function(x){var l=cur.filter(function(a){var t=new Date(a.date).getTime();return t>=x.s&&t<x.e});x.n=l.length;x.a=avg(l)});
  $('k1').textContent=cur.length;$('k1d').textContent=prev&&prev.length?delta(cur.length,prev.length,'',false):'';
  $('k2').textContent=fmt(avg(cur));$('k2d').textContent=prev&&prev.length?delta(avg(cur),avg(prev),'',true):'';
  $('ch1').innerHTML=line(b);$('ch2').innerHTML=bars(b);
  $('ro1').textContent='Touchez le graphique pour voir le détail de chaque période.';
  var svg=$('ch1').querySelector('svg');
  function pick(ev){var r=svg.getBoundingClientRect(),cx=(ev.touches?ev.touches[0].clientX:ev.clientX),x=(cx-r.left)/r.width*340,L=26,pw=304,n=b.length;
    var i=Math.max(0,Math.min(n-1,Math.round((x-L)/pw*(n-1))));var o=b[i],c=$('cur1');
    c.setAttribute('x1',L+(n===1?pw/2:i*pw/(n-1)));c.setAttribute('x2',c.getAttribute('x1'));c.setAttribute('visibility','visible');
    $('ro1').innerHTML='<b>'+esc(o.lo)+'</b> · '+o.n+' avis'+(o.a!=null?' · note '+fmt(o.a)+' / 5':'')}
  svg.querySelector('.hit').addEventListener('click',pick);svg.querySelector('.hit').addEventListener('touchstart',pick,{passive:true});
  var d='';for(var s=5;s>=1;s--){var c=cur.filter(function(a){return a.note===s}).length,pc=Math.round(c*100/cur.length);
    d+='<div class="ds"><span class="n">'+s+' ★</span><div class="bar"><i class="'+(s>=4?'':(s===3?'mid':'low')) +'" style="width:'+pc+'%"></i></div><span class="c">'+c+' <small>('+pc+' %)</small></span></div>'}
  $('dist').innerHTML=d;
  /* comparaison : respecte tous les filtres sauf le service */
  var base=ALL.filter(function(a){var t=new Date(a.date).getTime();return t>=t0&&t<t1&&pass(a,true)});
  $('cmp').innerHTML=Object.keys(SVC).map(function(k){var l=base.filter(function(a){return a.service===k});
    if(!l.length)return '<div class="sv"><div class="row"><span>'+SVC[k]+'</span><small>aucun avis</small></div><div class="bar"></div></div>';
    var m=avg(l),c=m>=4?'':(m>=3?'mid':'low');
    return '<div class="sv'+($('fs').value===k?' sel':'')+'"><div class="row"><span>'+SVC[k]+'</span><span>'+fmt(m)+' / 5 <small>· '+l.length+' avis</small></span></div><div class="bar"><i class="'+c+'" style="width:'+(m*20)+'%"></i></div></div>'}).join('');
}
$('per').addEventListener('click',function(e){var x=e.target.closest('button');if(!x)return;period=x.dataset.p;document.querySelectorAll('#per button').forEach(function(y){y.setAttribute('aria-pressed',y===x)});render()});
['fs','fn','fl'].forEach(function(i){$(i).addEventListener('change',render)});
ALL=Store.all();fill();render();
})();
