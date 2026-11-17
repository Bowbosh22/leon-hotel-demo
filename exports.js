(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
function pad(n){return n<10?'0'+n:''+n}
var now=new Date(),cur=now.getFullYear()+'-'+pad(now.getMonth()+1);
$('rm').value=cur;$('rm').max=cur;$('em').value=cur;$('em').max=cur;
function esc(v){v=v==null?'':String(v);return '"'+v.replace(/"/g,'""')+'"'}
function csv(rows){return '﻿'+rows.map(function(r){return r.map(esc).join(';')}).join('\r\n')}
function save(name,text){
  var u=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
  a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000);
}
function inRange(a){
  if($('ep').value!=='month'||!$('em').value)return true;
  var p=$('em').value.split('-'),t=new Date(a.date).getTime();
  return t>=new Date(+p[0],+p[1]-1,1).getTime()&&t<new Date(+p[0],+p[1],1).getTime();
}
function suffix(){return $('ep').value==='month'&&$('em').value?$('em').value:'toutes-periodes'}
function dstr(iso){var d=new Date(iso);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function tstr(iso){var d=new Date(iso);return pad(d.getHours())+':'+pad(d.getMinutes())}
function list(){return Store.all().filter(inRange).sort(function(a,b){return a.date<b.date?-1:1})}
function info(){var n=list().length;$('xinfo').textContent=n+' avis dans la période choisie.'}
$('ep').addEventListener('change',function(){$('em').hidden=this.value!=='month';info()});
$('em').addEventListener('change',info);
$('rep').addEventListener('click',function(){if($('rm').value)location.href='report.html?mois='+$('rm').value});
$('xa').addEventListener('click',function(){
  var rows=[['Code','Date','Heure','Service','Lieu','Note','Détail des notes','Commentaire','Prénom','Nom','Téléphone','E-mail','Accepte d\'être recontacté','Statut','Note interne']];
  list().forEach(function(a){var c=a.contact||{};
    rows.push([a.id,dstr(a.date),tstr(a.date),SVC[a.service],a.lieu||'',a.note,Object.keys(a.details||{}).map(function(k){return k+': '+a.details[k]}).join(' | '),a.comment||'',c.prenom||'',c.nom||'',c.tel||'',c.email||'',a.recontact?'Oui':'Non',a.statut||'Nouveau',a.noteInterne||''])});
  save('avis-leon-hotel-'+suffix()+'.csv',csv(rows));
});
$('xc').addEventListener('click',function(){
  var rows=[['Prénom','Nom','Téléphone','E-mail','Nombre d\'avis','Note moyenne','Dernier avis','À recontacter']];
  var m=new Date();
  window.ClientsData().forEach(function(c){
    var l=c.avis.filter(inRange);if(!l.length)return;
    rows.push([c.prenom,c.nom,c.tel,c.email,l.length,(Math.round(l.reduce(function(s,a){return s+a.note},0)/l.length*10)/10).toString().replace('.',','),dstr(l[0].date),l.some(function(a){return a.recontact})?'Oui':'Non'])});
  save('clients-leon-hotel-'+suffix()+'.csv',csv(rows));
});
Store.ready().then(info);
})();
