Store.ready().then(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var MOISL=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
function two(n){return n<10?'0'+n:''+n}
function fmt(x){return (Math.round(x*10)/10).toFixed(1).replace('.',',')}
function avg(l){return l.length?l.reduce(function(s,a){return s+a.note},0)/l.length:null}
var q=new URLSearchParams(location.search).get('mois'),n=new Date();
if(!/^\d{4}-\d{2}$/.test(q||''))q=n.getFullYear()+'-'+two(n.getMonth()+1);
var y=+q.slice(0,4),m=+q.slice(5,7)-1;
var t0=new Date(y,m,1).getTime(),t1=new Date(y,m+1,1).getTime(),p0=new Date(y,m-1,1).getTime();
var ALL=Store.all();
function inR(a,s,e){var t=new Date(a.date).getTime();return t>=s&&t<e}
var L=ALL.filter(function(a){return inR(a,t0,t1)}),P=ALL.filter(function(a){return inR(a,p0,t0)});
var title=MOISL[m].charAt(0).toUpperCase()+MOISL[m].slice(1)+' '+y;
function dlt(c,p,dec){if(p==null||c==null)return 'Mois précédent : aucune donnée';var d=c-p;if(Math.abs(d)<(dec?.05:.5))return '= mois précédent';return (d>0?'+':'')+(dec?fmt(d):Math.round(d))+' vs mois précédent'}
var h='<header><div><h1>Rapport de satisfaction clients</h1><div class="mois">'+title+'</div></div><div><div class="wm" style="align-items:flex-end"><b>LEON</b><i>HOTEL</i></div><div class="gen">Édité le '+n.getDate()+' '+MOIS[n.getMonth()]+' '+n.getFullYear()+'</div></div></header>';
if(!L.length){
  h+='<p class="empty2"><b>Aucun avis pour '+esc(title)+'.</b> Choisissez un autre mois depuis la page Exports.</p>';
}else{
  var a=avg(L),sat=L.filter(function(x){return x.note>=4}).length,neg=L.filter(function(x){return x.note<=2}),open=neg.filter(function(x){return (x.statut||'Nouveau')!=='Clos'&&(x.statut||'Nouveau')!=='Traité'}).length;
  h+='<div class="k4"><div><span>Avis reçus</span><b>'+L.length+'</b><small>'+(P.length?dlt(L.length,P.length,false):'Mois précédent : aucune donnée')+'</small></div>'+
     '<div><span>Note moyenne</span><b>'+fmt(a)+' / 5</b><small>'+dlt(a,avg(P),true)+'</small></div>'+
     '<div><span>Clients satisfaits</span><b>'+Math.round(sat*100/L.length)+' %</b><small>4 et 5 étoiles</small></div>'+
     '<div><span>Avis négatifs</span><b>'+neg.length+'</b><small>'+open+' à suivre</small></div></div>';
  /* évolution quotidienne */
  var nd=new Date(y,m+1,0).getDate(),b=[];
  for(var i=1;i<=nd;i++){var s=new Date(y,m,i).getTime(),e=new Date(y,m,i+1).getTime(),l=L.filter(function(x){return inR(x,s,e)});b.push({s:s,e:e,l:i+'/'+(m+1),lo:i+' '+MOIS[m],n:l.length,a:avg(l)})}
  h+='<h3>Évolution de la note moyenne</h3><div class="chart">'+Charts.line(b)+'</div><h3>Nombre d\'avis par jour</h3><div class="chart">'+Charts.bars(b)+'</div>';
  /* étoiles + services */
  var d='';for(var s2=5;s2>=1;s2--){var c=L.filter(function(x){return x.note===s2}).length,pc=Math.round(c*100/L.length);
    d+='<div class="ds"><span class="n">'+s2+' ★</span><div class="bar"><i class="'+(s2>=4?'':(s2===3?'mid':'low'))+'" style="width:'+pc+'%"></i></div><span class="c">'+c+' <small>('+pc+' %)</small></span></div>'}
  var sv='<table class="t"><tr><th>Service</th><th class="r">Avis</th><th class="r">Note</th></tr>'+Object.keys(SVC).map(function(k){var l=L.filter(function(x){return x.service===k});return '<tr><td>'+SVC[k]+'</td><td class="r">'+l.length+'</td><td class="r">'+(l.length?fmt(avg(l)):'–')+'</td></tr>'}).join('')+'</table>';
  h+='<div class="two"><div><h3>Répartition des étoiles</h3>'+d+'</div><div><h3>Par service</h3>'+sv+'</div></div>';
  /* lieux à surveiller */
  var byL={};L.forEach(function(x){var k=x.lieu||SVC[x.service];(byL[k]=byL[k]||[]).push(x)});
  var lw=Object.keys(byL).map(function(k){return {k:k,n:byL[k].length,a:avg(byL[k])}}).filter(function(o){return o.n>=2}).sort(function(p,q){return p.a-q.a}).slice(0,5);
  var st={Nouveau:0,'En cours':0,'Traité':0,Clos:0};neg.forEach(function(x){st[x.statut||'Nouveau']++});
  h+='<div class="two"><div><h3>Lieux à surveiller</h3>'+(lw.length?'<table class="t"><tr><th>Lieu</th><th class="r">Avis</th><th class="r">Note</th></tr>'+lw.map(function(o){return '<tr><td>'+esc(o.k)+'</td><td class="r">'+o.n+'</td><td class="r">'+fmt(o.a)+'</td></tr>'}).join('')+'</table>':'<p class="empty2">Pas assez d\'avis par lieu.</p>')+'</div>'+
     '<div><h3>Suivi des réclamations</h3><table class="t"><tr><th>Statut</th><th class="r">Avis</th></tr>'+Object.keys(st).map(function(k){return '<tr><td>'+k+'</td><td class="r">'+st[k]+'</td></tr>'}).join('')+'</table></div></div>';
  /* commentaires */
  function qs(l,cls){return l.map(function(x){return '<div class="q2 '+cls+'">« '+esc(x.comment)+' »<small>'+(x.lieu||SVC[x.service])+' · '+x.note+' ★ · '+new Date(x.date).getDate()+' '+MOIS[m]+'</small></div>'}).join('')}
  var neg5=neg.filter(function(x){return x.comment}).slice(0,5),pos3=L.filter(function(x){return x.note>=4&&x.comment}).sort(function(p,q){return q.note-p.note}).slice(0,3);
  h+='<h3>Principaux commentaires négatifs</h3>'+(neg5.length?qs(neg5,'neg'):'<p class="empty2">Aucun commentaire négatif ce mois-ci.</p>')+'<h3>Commentaires positifs</h3>'+(pos3.length?qs(pos3,'pos'):'<p class="empty2">Aucun commentaire positif.</p>');
}
h+='<div class="foot3">Rapport généré par la plateforme d\'avis du Léon Hotel · Atelier KPM</div>';
$('sheet').innerHTML=h;
document.title='Rapport '+title+' — Léon Hotel';
$('pr').addEventListener('click',function(){window.print()});
});
