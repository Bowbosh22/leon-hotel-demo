(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
var STAR='<svg viewBox="0 0 24 24"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z"/></svg>';
function stars(n,sz){var o='';for(var i=1;i<=5;i++)o+=STAR.replace('<svg','<svg class="'+(i<=Math.round(n)?'on':'')+'"');return o}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
function two(n){return n<10?'0'+n:''+n}
function when(iso){
  var d=new Date(iso),n=new Date(),hm=two(d.getHours())+':'+two(d.getMinutes());
  var a=new Date(n.getFullYear(),n.getMonth(),n.getDate()),b=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  var diff=Math.round((a-b)/864e5);
  if(diff===0)return "Aujourd'hui "+hm; if(diff===1)return 'Hier '+hm;
  return d.getDate()+' '+MOIS[d.getMonth()]+' · '+hm;
}
function fmt(x){return (Math.round(x*10)/10).toFixed(1).replace('.',',')}

/* ---- données d'exemple (démo) ---- */
function seed(){
  var r=1234;function rnd(){r=(r*9301+49297)%233280;return r/233280}
  var P={hebergement:[
    [5,'Chambre très propre et personnel accueillant. Je reviendrai.'],[5,'Excellent séjour, literie confortable.'],[4,'Bon séjour, le Wi-Fi pourrait être plus rapide.'],
    [4,'Chambre agréable et calme.'],[5,'Accueil chaleureux à la réception.'],[3,'Correct, mais la climatisation était bruyante.'],
    [2,"Pas d'eau chaude ce matin, c'est dommage."],[1,'Chambre pas nettoyée à notre arrivée. Très déçu.'],[4,''],[5,'']],
   restaurant:[[5,'Plats délicieux, service rapide.'],[4,'Très bon repas, un peu de bruit.'],[5,'Le poisson braisé était excellent !'],[3,"Longue attente avant d'être servis."],
    [2,'Plat froid à la livraison à la table.'],[4,''],[5,''],[4,'Bon rapport qualité/prix.']],
   patisserie:[[5,'Croissants frais, un régal.'],[5,'Gâteau d\'anniversaire parfait.'],[4,'Très bon pain, merci.'],[3,'Bon mais cher.'],[5,''],[4,'']],
   fastfood:[[4,'Rapide et efficace.'],[5,'Burger excellent.'],[3,'Frites tièdes.'],[2,"Trop d'attente pour un fast-food."],[4,''],[5,'Très bon !']]};
  var rooms=['101','102','104','105','108','201','203','205','207','210'],out=[],now=Date.now();
  var keys=['hebergement','hebergement','restaurant','restaurant','patisserie','fastfood','hebergement','restaurant'];
  for(var i=0;i<64;i++){
    var s=keys[Math.floor(rnd()*keys.length)],pool=P[s],it=pool[Math.floor(rnd()*pool.length)];
    var ago=Math.floor(rnd()*30*864e5*(i<10?0.1:1));
    var rec=it[1]&&rnd()<.3;
    out.push({id:'DEMO-'+(1000+i),date:new Date(now-ago).toISOString(),service:s,lieu:s==='hebergement'?'Chambre '+rooms[Math.floor(rnd()*rooms.length)]:null,
      note:it[0],details:{},comment:it[1],lang:'fr',contact:rec?{prenom:['Awa','Jean','Marie','Paul','Grâce'][Math.floor(rnd()*5)],nom:'',tel:'+242 06 '+Math.floor(100+rnd()*899)+' 00 00',email:''}:null,recontact:rec,statut:'Nouveau'});
  }
  out.sort(function(a,b){return a.date<b.date?-1:1});
  Store.save(out);
}

/* ---- affichage ---- */
var shown=8;
function revHtml(a,alert){
  var lieu=a.lieu?SVC[a.service]+' · '+a.lieu:SVC[a.service];
  var who=a.contact&&(a.contact.prenom||a.contact.nom||a.contact.tel||a.contact.email)?
    '<div class="who">'+esc([a.contact.prenom,a.contact.nom].filter(Boolean).join(' '))+(a.contact.tel?' · '+esc(a.contact.tel):'')+(a.contact.email?' · '+esc(a.contact.email):'')+(a.recontact?' · <b>souhaite être recontacté(e)</b>':'')+'</div>':'';
  return '<div class="rv'+(alert?' alert':'')+'"><div class="hd"><b>'+esc(lieu)+'</b><span>'+when(a.date)+'</span></div>'+
    '<div class="sts">'+stars(a.note)+'</div>'+(a.comment?'<p>'+esc(a.comment)+'</p>':'<p class="who"><i>Pas de commentaire</i></p>')+who+'</div>';
}
function render(){
  var L=Store.all().sort(function(a,b){return a.date<b.date?1:-1});
  $('empty').hidden=L.length>0;$('main').hidden=L.length===0;
  $('upd').textContent=L.length?'Mis à jour à '+two(new Date().getHours())+':'+two(new Date().getMinutes()):'';
  if(!L.length)return;
  var sum=0,sat=0;L.forEach(function(a){sum+=a.note;if(a.note>=4)sat++});
  var avg=sum/L.length;
  $('avg').textContent=fmt(avg);$('avgst').innerHTML=stars(avg);
  $('cnt').textContent=L.length;$('sat').textContent=Math.round(sat*100/L.length)+' %';
  var warn=L.filter(function(a){return a.note<=2&&a.statut==='Nouveau'});
  $('warnC').hidden=!warn.length;$('warnN').textContent=warn.length;
  $('warn').innerHTML=warn.slice(0,6).map(function(a){return revHtml(a,true)}).join('');
  $('bysvc').innerHTML=Object.keys(SVC).map(function(k){
    var l=L.filter(function(a){return a.service===k});
    if(!l.length)return '<div class="sv"><div class="row"><span>'+SVC[k]+'</span><small>aucun avis</small></div><div class="bar"></div></div>';
    var m=l.reduce(function(s,a){return s+a.note},0)/l.length,c=m>=4?'':(m>=3?'mid':'low');
    return '<div class="sv"><div class="row"><span>'+SVC[k]+'</span><span>'+fmt(m)+' / 5 <small>· '+l.length+' avis</small></span></div><div class="bar"><i class="'+c+'" style="width:'+(m*20)+'%"></i></div></div>';
  }).join('');
  $('recent').innerHTML=L.slice(0,shown).map(function(a){return revHtml(a,false)}).join('');
  $('more').hidden=L.length<=shown;
}
function show(){
  var ok=Auth.isIn();$('login').hidden=ok;$('dash').hidden=!ok;
  if(ok)render();
}
$('lf').addEventListener('submit',function(e){
  e.preventDefault();
  if(Auth.login($('pw').value)){
    var n=new URLSearchParams(location.search).get('next');
    if(n&&/^[a-z]+\.html$/.test(n)){location.replace(n);return}
    $('pw').value='';show();
  }else $('lerr').textContent='Mot de passe incorrect.';
});
$('out').addEventListener('click',function(){Auth.out();$('lerr').textContent='';show()});
$('seed').addEventListener('click',function(){seed();render()});
$('clr').addEventListener('click',function(){if(confirm('Effacer tous les avis enregistrés sur cet appareil ?')){Store.clear();render()}});
$('more').addEventListener('click',function(){shown+=8;render()});
show();
})();
