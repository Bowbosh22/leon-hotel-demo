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
  var CL=[['Awa','Ndinga','+242 06 412 31 08','awa.ndinga@mail.com'],['Jean','Mavoungou','+242 05 521 77 90',''],['Marie','Okemba','+242 06 788 02 14','marie.okemba@mail.com'],['Paul','Itoua','+242 05 604 19 33',''],['Grâce','Mabiala','+242 06 230 45 61','grace.m@mail.com'],['Patrick','Bouanga','+242 06 933 88 02',''],['Sandrine','Ebata','','sandrine.ebata@mail.com'],['Olivier','Tsoumou','+242 05 117 64 25','o.tsoumou@mail.com'],['Nadège','Loubaki','+242 06 355 90 17',''],['Thierry','Malonga','+242 05 842 36 70','thierry.m@mail.com'],['Chantal','Kiongo','+242 06 470 51 83',''],['David','Moukoko','+33 6 12 34 56 78','david.moukoko@mail.com']];
  var rooms=['101','102','104','105','108','201','203','205','207','210'],out=[],now=Date.now();
  var keys=['hebergement','hebergement','restaurant','restaurant','patisserie','fastfood','hebergement','restaurant'];
  for(var i=0;i<150;i++){
    var s=keys[Math.floor(rnd()*keys.length)],pool=P[s],it=pool[Math.floor(rnd()*pool.length)];
    var ago=Math.floor(rnd()*180*864e5*(i<14?0.06:(i<60?0.25:1)));
    var rec=rnd()<.38;var cl=CL[Math.floor(rnd()*CL.length)];
    out.push({id:'DEMO-'+(1000+i),date:new Date(now-ago).toISOString(),service:s,lieu:s==='hebergement'?'Chambre '+rooms[Math.floor(rnd()*rooms.length)]:null,
      note:it[0],details:{},comment:it[1],lang:'fr',contact:rec?{prenom:cl[0],nom:cl[1],tel:cl[2],email:cl[3]}:null,recontact:rec&&rnd()<.15,statut:'Nouveau'});
  }
  out.sort(function(a,b){return a.date<b.date?-1:1});
  var k=0;for(var j=out.length-1;j>=0;j--){if(out[j].note<=2){var age=(now-new Date(out[j].date).getTime())/864e5,st;
    if(age>14)st=(k%3===0)?'Traité':'Clos';else st=['Nouveau','Nouveau','Nouveau','En cours','En cours','Traité','Clos'][k%7];
    k++;out[j].statut=st;if(st!=='Nouveau')out[j].historique=[{s:st,date:new Date(new Date(out[j].date).getTime()+36e5*3).toISOString()}]}}
  Store.save(out);
}

/* ---- affichage ---- */
var shown=8,tab='Nouveau',known={};
function seuil(){return +(Store.cfg().seuil||2)}
function st(a){return a.statut||'Nouveau'}
function revHtml(a,mode){
  var lieu=a.lieu?SVC[a.service]+' · '+a.lieu:SVC[a.service];
  var who=a.contact&&(a.contact.prenom||a.contact.nom||a.contact.tel||a.contact.email)?
    '<div class="who">'+esc([a.contact.prenom,a.contact.nom].filter(Boolean).join(' '))+(a.contact.tel?' · '+esc(a.contact.tel):'')+(a.contact.email?' · '+esc(a.contact.email):'')+(a.recontact?' · <b>souhaite être recontacté(e)</b>':'')+'</div>':'';
  var tag=(mode!=='recl'&&a.note<=seuil())?' <span class="tag neg">'+st(a)+'</span>':'';
  var h='<div class="rv'+(mode==='recl'&&st(a)==='Nouveau'?' alert':'')+'"><div class="hd"><b>'+esc(lieu)+tag+'</b><span>'+when(a.date)+'</span></div>'+
    '<div class="sts">'+stars(a.note)+'</div>'+(a.comment?'<p>'+esc(a.comment)+'</p>':'<p class="who"><i>Pas de commentaire</i></p>')+who;
  if(mode==='recl'){
    h+='<div class="chips">'+STATUTS.map(function(x){return '<button type="button" class="s-'+x.slice(0,2)+(x===st(a)?' on':'')+'" data-id="'+esc(a.id)+'" data-s="'+x+'">'+x+'</button>'}).join('')+'</div>'+
      '<textarea class="note" data-id="'+esc(a.id)+'" placeholder="Note interne (action prise, responsable…)" maxlength="500">'+esc(a.noteInterne||'')+'</textarea>'+
      '<div class="noterow"><button type="button" class="notesave" data-id="'+esc(a.id)+'" disabled>Valider</button><span class="notemsg" role="status"></span></div>';
    var hi=a.historique&&a.historique.length?a.historique[a.historique.length-1]:null;
    if(hi)h+='<div class="hist">'+esc(hi.s)+' · '+when(hi.date)+'</div>';
  }
  return h+'</div>';
}
function render(){
  var L=Store.all().sort(function(a,b){return a.date<b.date?1:-1});
  $('empty').hidden=L.length>0;$('main').hidden=L.length===0;$('banner').hidden=true;
  $('upd').textContent=L.length?'Mis à jour à '+two(new Date().getHours())+':'+two(new Date().getMinutes()):'';
  known={};L.forEach(function(a){known[a.id]=1});
  if(!L.length)return;
  var sum=0,sat=0;L.forEach(function(a){sum+=a.note;if(a.note>=4)sat++});
  var avg=sum/L.length;
  $('avg').textContent=fmt(avg);$('avgst').innerHTML=stars(avg);
  $('cnt').textContent=L.length;$('sat').textContent=Math.round(sat*100/L.length)+' %';
  /* réclamations */
  $('seuil').value=String(seuil());
  var neg=L.filter(function(a){return a.note<=seuil()}),cn={};
  STATUTS.forEach(function(x){cn[x]=0});neg.forEach(function(a){cn[st(a)]++});
  if(cn['Nouveau']>0){$('banner').hidden=false;$('banner').textContent='⚠ '+cn['Nouveau']+(cn['Nouveau']>1?' nouveaux avis négatifs':' nouvel avis négatif')+' à traiter'}
  $('tabs').innerHTML=STATUTS.map(function(x){return '<button type="button" role="tab" data-t="'+x+'" aria-selected="'+(x===tab)+'"><b>'+cn[x]+'</b>'+x+'</button>'}).join('');
  var lst=neg.filter(function(a){return st(a)===tab});
  $('recl').innerHTML=lst.length?lst.slice(0,10).map(function(a){return revHtml(a,'recl')}).join('')+(lst.length>10?'<p class="empt">+ '+(lst.length-10)+' autres</p>':''):'<p class="empt">Aucun avis « '+tab+' ».</p>';
  $('bysvc').innerHTML=Object.keys(SVC).map(function(k){
    var l=L.filter(function(a){return a.service===k});
    if(!l.length)return '<div class="sv"><div class="row"><span>'+SVC[k]+'</span><small>aucun avis</small></div><div class="bar"></div></div>';
    var m=l.reduce(function(s,a){return s+a.note},0)/l.length,c=m>=4?'':(m>=3?'mid':'low');
    return '<div class="sv"><div class="row"><span>'+SVC[k]+'</span><span>'+fmt(m)+' / 5 <small>· '+l.length+' avis</small></span></div><div class="bar"><i class="'+c+'" style="width:'+(m*20)+'%"></i></div></div>';
  }).join('');
  $('recent').innerHTML=L.slice(0,shown).map(function(a){return revHtml(a,'')}).join('');
  $('more').hidden=L.length<=shown;
}
var tt;function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},5000)}
$('tabs').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;tab=b.dataset.t;render()});
function dirty(card){var b=card.querySelector('.notesave'),m=card.querySelector('.notemsg');b.disabled=false;m.className='notemsg dirty';m.textContent='Modifications non validées'}
$('recl').addEventListener('click',function(e){var b=e.target.closest('.chips button');if(!b)return;var card=b.closest('.rv');
  card.querySelectorAll('.chips button').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');dirty(card)});
$('recl').addEventListener('input',function(e){var t=e.target.closest('textarea.note');if(t)dirty(t.closest('.rv'))});
$('recl').addEventListener('click',function(e){var b=e.target.closest('button.notesave');if(!b)return;var card=b.closest('.rv'),t=card.querySelector('textarea.note'),m=card.querySelector('.notemsg'),sel=card.querySelector('.chips button.sel'),ns=sel?sel.dataset.s:null,txt=t.value.trim();
  b.disabled=true;m.className='notemsg';m.textContent='Enregistrement…';
  Promise.resolve(Store.update(b.dataset.id,function(a){if(ns&&ns!==st(a)){a.statut=ns;(a.historique=a.historique||[]).push({s:ns,date:new Date().toISOString()})}a.noteInterne=txt})).then(function(ok){
    if(ok){toast('✓ Validé : '+(ns||'note')+' enregistré'+(ns?'':'e'));if(ns)tab=ns;render()}
    else{b.disabled=false;m.className='notemsg err';m.textContent='✕ Échec, réessayez'}})});
$('seuil').addEventListener('change',function(){var c=Store.cfg();c.seuil=+$('seuil').value;Store.setCfg(c);render()});
$('banner').addEventListener('click',function(){tab='Nouveau';render()});
/* alerte en direct : un avis négatif arrive pendant que la direction consulte le tableau de bord */
Store.watch(function(){
  if(!Auth.isIn())return;
  var fresh=Store.all().filter(function(a){return !known[a.id]&&a.note<=seuil()});
  render();
  if(fresh.length){var a=fresh[fresh.length-1];toast('Nouvel avis négatif : '+(a.lieu||SVC[a.service])+' · '+a.note+' ★')}
});
function show(){
  var ok=Auth.isIn();$('login').hidden=ok;$('dash').hidden=!ok;
  if(ok){if(window.Menu)Menu.build();Store.ready().then(render)}
}
if(Auth.remote){$('em').hidden=false;$('seed').hidden=true;$('clr').hidden=true;$('lerr').textContent=''}
$('lf').addEventListener('submit',function(e){
  e.preventDefault();$('lerr').textContent='';
  var b=$('lf').querySelector('button');b.disabled=true;
  Auth.login($('em').value,$('pw').value).then(function(){
    var n=new URLSearchParams(location.search).get('next');
    if(n&&/^[a-z]+\.html$/.test(n)){location.replace(n);return}
    $('pw').value='';b.disabled=false;show();
  },function(err){b.disabled=false;$('lerr').textContent=err.message||'Connexion impossible.'});
});
$('seed').addEventListener('click',function(){seed();render()});
$('clr').addEventListener('click',function(){if(confirm('Effacer tous les avis enregistrés sur cet appareil ?')){Store.clear();render()}});
$('more').addEventListener('click',function(){shown+=8;render()});
show();
})();
