(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
var MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'],JOURS=['dim','lun','mar','mer','jeu','ven','sam'];
function fmt(x){return (Math.round(x*10)/10).toFixed(1).replace('.',',')}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var period='month',ALL=[],anchor=new Date();
var MOISL=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],JOURSL=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
function sod(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function pad(n){return n<10?'0'+n:''+n}
function shift(d,k){
  if(period==='day')return new Date(d.getFullYear(),d.getMonth(),d.getDate()+k);
  if(period==='week')return new Date(d.getFullYear(),d.getMonth(),d.getDate()+7*k);
  if(period==='month')return new Date(d.getFullYear(),d.getMonth()+k,1);
  return new Date(d.getFullYear()+k,0,1);
}
function mondayOf(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate()-((d.getDay()+6)%7))}
function buckets(an){
  var now=new Date(),o=[],i,t;
  if(period==='day'){t=sod(an).getTime();for(i=0;i<24;i++)o.push({s:t+i*36e5,e:t+(i+1)*36e5,l:i+'h',lo:i+'h – '+(i+1)+'h'})}
  else if(period==='week'){var m=mondayOf(an);
    for(i=0;i<7;i++){var d=new Date(m.getFullYear(),m.getMonth(),m.getDate()+i),e=new Date(m.getFullYear(),m.getMonth(),m.getDate()+i+1);
      o.push({s:d.getTime(),e:e.getTime(),l:JOURS[d.getDay()]+' '+d.getDate(),lo:JOURSL[d.getDay()]+' '+d.getDate()+' '+MOIS[d.getMonth()]})}}
  else if(period==='month'){var n=new Date(an.getFullYear(),an.getMonth()+1,0).getDate();
    for(i=1;i<=n;i++){var d2=new Date(an.getFullYear(),an.getMonth(),i),e2=new Date(an.getFullYear(),an.getMonth(),i+1);
      o.push({s:d2.getTime(),e:e2.getTime(),l:i+'/'+(an.getMonth()+1),lo:JOURSL[d2.getDay()]+' '+i+' '+MOIS[an.getMonth()]})}}
  else if(period==='year'){
    for(i=0;i<12;i++){var m1=new Date(an.getFullYear(),i,1),m2=new Date(an.getFullYear(),i+1,1);
      o.push({s:m1.getTime(),e:m2.getTime(),l:MOIS[i],lo:MOISL[i]+' '+an.getFullYear()})}}
  else{
    var first=now,list=ALL.map(function(a){return new Date(a.date).getTime()}),n2=12;
    if(list.length){first=new Date(Math.min.apply(null,list));n2=Math.min(36,(now.getFullYear()-first.getFullYear())*12+now.getMonth()-first.getMonth()+1)}
    for(i=n2-1;i>=0;i--){var m3=new Date(now.getFullYear(),now.getMonth()-i,1),m4=new Date(now.getFullYear(),now.getMonth()-i+1,1);
      o.push({s:m3.getTime(),e:m4.getTime(),l:MOIS[m3.getMonth()],lo:MOISL[m3.getMonth()]+' '+m3.getFullYear()})}
  }
  return o;
}
function plabel(){
  var d=anchor;
  if(period==='day')return JOURSL[d.getDay()]+' '+d.getDate()+' '+MOISL[d.getMonth()]+' '+d.getFullYear();
  if(period==='week'){var m=mondayOf(d),e=new Date(m.getFullYear(),m.getMonth(),m.getDate()+6);return 'Semaine du '+m.getDate()+(m.getMonth()!==e.getMonth()?' '+MOIS[m.getMonth()]:'')+' au '+e.getDate()+' '+MOIS[e.getMonth()]+' '+e.getFullYear()}
  if(period==='month')return MOISL[d.getMonth()].charAt(0).toUpperCase()+MOISL[d.getMonth()].slice(1)+' '+d.getFullYear();
  return 'Année '+d.getFullYear();
}
function isCurrent(){var b=buckets(anchor),n=Date.now();return n>=b[0].s&&n<b[b.length-1].e}
function syncNav(){
  var all=period==='all';$('nav').hidden=all;$('todayB').hidden=all||isCurrent();
  if(all)return;
  $('plab').textContent=plabel();
  var pk=$('pick'),py=$('pickY');
  if(period==='year'){pk.hidden=true;py.hidden=false;
    var y0=new Date().getFullYear(),mn=y0;ALL.forEach(function(a){mn=Math.min(mn,new Date(a.date).getFullYear())});
    var o='';for(var y=y0;y>=mn;y--)o+='<option value="'+y+'">'+y+'</option>';py.innerHTML=o;py.value=String(anchor.getFullYear())}
  else{py.hidden=true;pk.hidden=false;pk.type=period==='month'?'month':'date';
    pk.max=period==='month'?new Date().getFullYear()+'-'+pad(new Date().getMonth()+1):new Date().getFullYear()+'-'+pad(new Date().getMonth()+1)+'-'+pad(new Date().getDate());
    pk.value=period==='month'?anchor.getFullYear()+'-'+pad(anchor.getMonth()+1):anchor.getFullYear()+'-'+pad(anchor.getMonth()+1)+'-'+pad(anchor.getDate())}
  $('nx').disabled=isCurrent()||buckets(shift(anchor,1))[0].s>Date.now();
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
  var d=cur-prev;if(Math.abs(d)<(dec?0.05:0.5))return '= période précédente';
  var s=(d>0?'+':'')+(dec?fmt(d):Math.round(d));return s+(unit||'')+' vs période précédente';
}
function render(){
  var b=buckets(anchor),t0=b[0].s,t1=b[b.length-1].e;syncNav();
  var cur=ALL.filter(function(a){var t=new Date(a.date).getTime();return t>=t0&&t<t1&&pass(a)});
  var prev=null;
  if(period!=='all'){var pb=buckets(shift(anchor,-1)),p0=pb[0].s,p1=pb[pb.length-1].e;
    prev=ALL.filter(function(a){var t=new Date(a.date).getTime();return t>=p0&&t<p1&&pass(a)})}
  $('none').hidden=cur.length>0;$('st').hidden=cur.length===0;
  if(!cur.length)return;
  b.forEach(function(x){var l=cur.filter(function(a){var t=new Date(a.date).getTime();return t>=x.s&&t<x.e});x.n=l.length;x.a=avg(l)});
  $('k1').textContent=cur.length;$('k1d').textContent=prev&&prev.length?delta(cur.length,prev.length,'',false):'';
  $('k2').textContent=fmt(avg(cur));$('k2d').textContent=prev&&prev.length?delta(avg(cur),avg(prev),'',true):'';
  $('ch1').innerHTML=Charts.line(b);$('ch2').innerHTML=Charts.bars(b);
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
$('per').addEventListener('click',function(e){var x=e.target.closest('button');if(!x)return;period=x.dataset.p;if(period==='month')anchor=new Date(anchor.getFullYear(),anchor.getMonth(),1);if(period==='year')anchor=new Date(anchor.getFullYear(),0,1);document.querySelectorAll('#per button').forEach(function(y){y.setAttribute('aria-pressed',y===x)});render()});
$('pv').addEventListener('click',function(){anchor=shift(anchor,-1);render()});
$('nx').addEventListener('click',function(){anchor=shift(anchor,1);render()});
$('todayB').addEventListener('click',function(){anchor=new Date();render()});
$('pick').addEventListener('change',function(){var v=this.value;if(!v)return;var p=v.split('-');anchor=period==='month'?new Date(+p[0],+p[1]-1,1):new Date(+p[0],+p[1]-1,+p[2]);render()});
$('pickY').addEventListener('change',function(){anchor=new Date(+this.value,0,1);render()});
['fs','fn','fl'].forEach(function(i){$(i).addEventListener('change',render)});
Store.ready().then(function(){ALL=Store.all();fill();render()});
})();
