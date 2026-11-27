(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var C=window.LEON_CFG||{},L=[],isDir=Auth.role()==='direction';
function two(n){return n<10?'0'+n:''+n}
function dt(iso){var d=new Date(iso);return two(d.getDate())+'/'+two(d.getMonth()+1)+'/'+d.getFullYear()}
function api(method,path){return Auth.token().then(function(t){return fetch(C.SUPABASE_URL+'/rest/v1/'+path,{method:method,headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:'Bearer '+t,Prefer:'return=minimal'}})})}
function load(){
  if(!C.SUPABASE_URL){$('err').hidden=false;$('err').textContent='Base de données non configurée.';return Promise.resolve()}
  return Auth.token().then(function(t){return fetch(C.SUPABASE_URL+'/rest/v1/abonnes?select=*&order=created_at.desc&limit=5000',{headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:'Bearer '+t}})})
  .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
  .then(function(d){L=d;draw()},function(){$('err').hidden=false;$('err').textContent="Impossible de charger les abonnés. Vérifiez que le fichier abonnes.sql a bien été exécuté dans Supabase."});
}
function view(){var q=$('q').value.trim().toLowerCase();return L.filter(function(a){return !q||(a.nom||'').toLowerCase().indexOf(q)>-1||(a.email||'').toLowerCase().indexOf(q)>-1})}
function draw(){
  var v=view();$('cnt').textContent=L.length+' abonné'+(L.length>1?'s':'')+(v.length!==L.length?' · '+v.length+' affiché'+(v.length>1?'s':''):'');
  $('none').hidden=L.length>0;
  $('list').innerHTML=v.map(function(a){return '<div class="card"><p><b>'+esc(a.nom)+'</b></p><p class="sub"><a href="mailto:'+esc(a.email)+'">'+esc(a.email)+'</a> · inscrit le '+dt(a.created_at)+'</p>'+(isDir?'<p><button type="button" class="act del" data-id="'+esc(a.id)+'">Supprimer</button></p>':'')+'</div>'}).join('');
}
function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;setTimeout(function(){t.hidden=true},2200)}
$('q').addEventListener('input',draw);
$('list').addEventListener('click',function(e){var b=e.target.closest('.del');if(!b||!confirm('Supprimer cet abonné ?'))return;
  api('DELETE','abonnes?id=eq.'+encodeURIComponent(b.dataset.id)).then(function(r){if(r.ok){L=L.filter(function(a){return a.id!==b.dataset.id});draw();toast('Abonné supprimé')}else toast('Suppression impossible')})});
function q(s){return '"'+String(s==null?'':s).replace(/"/g,'""')+'"'}
$('csv').addEventListener('click',function(){
  var rows=['Nom;E-mail;Date d\'inscription'].concat(view().map(function(a){return [q(a.nom),q(a.email),dt(a.created_at)].join(';')}));
  var blob=new Blob(['﻿'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(blob),l=document.createElement('a');
  l.href=u;l.download='abonnes-leon-hotel.csv';document.body.appendChild(l);l.click();l.remove();setTimeout(function(){URL.revokeObjectURL(u)},500)});
$('copy').addEventListener('click',function(){var t=view().map(function(a){return a.email}).join(', ');
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast('E-mails copiés')},function(){toast('Copie impossible')})});
load();
})();
