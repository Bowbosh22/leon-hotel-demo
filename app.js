/* Léon Hotel — plateforme d'avis. Étape 1 : parcours client.
   Stockage : localStorage (démo). L'objet Store est le seul point d'accès aux données :
   il sera remplacé par la base en ligne dans la version finale. */
(function(){
'use strict';
var Store=window.Store;
var ICON={
  hebergement:'<svg viewBox="0 0 24 24"><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M3 14h18M6 9V6h5v3"/></svg>',
  restaurant:'<svg viewBox="0 0 24 24"><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10"/></svg>',
  patisserie:'<svg viewBox="0 0 24 24"><path d="M5 12h14v2a7 7 0 0 1-14 0v-2zM8 12c0-3 1.5-5 4-5s4 2 4 5M12 4v3"/></svg>',
  fastfood:'<svg viewBox="0 0 24 24"><path d="M4 11h16a8 8 0 0 0-16 0zM4 15h16M5 19h14a1 1 0 0 0 1-1v-1H4v1a1 1 0 0 0 1 1z"/></svg>'
};
var STAR='<svg viewBox="0 0 24 24"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z"/></svg>';
var T={
 fr:{svc:{hebergement:'Hébergement',restaurant:'Restaurant',patisserie:'Pâtisserie',fastfood:'Fast-food'},
  title:'Votre avis nous intéresse',sub:'30 secondes, sans compte.',pick:'Que souhaitez-vous évaluer ?',
  rate:'Votre note',lab:['Très décevant','Décevant','Correct','Bien','Excellent !'],
  more:'Noter plus en détail (facultatif)',
  crit:{hebergement:['Propreté','Confort','Accueil','Rapport qualité/prix'],restaurant:['Qualité des plats','Service','Temps d\'attente','Rapport qualité/prix'],patisserie:['Qualité','Accueil','Temps d\'attente','Rapport qualité/prix'],fastfood:['Qualité','Rapidité','Accueil','Rapport qualité/prix']},
  comment:'Votre commentaire',opt:'(facultatif)',ph:'Ce que vous avez apprécié, ou ce que nous pourrions améliorer…',
  contact:'Vos coordonnées',first:'Prénom',last:'Nom',phone:'Téléphone',email:'E-mail',
  consent:'J\'accepte d\'être recontacté(e) concernant mon expérience.',
  contactHint:'Ces informations ne sont jamais obligatoires.',
  send:'Envoyer mon avis',needRate:'Choisissez une note pour envoyer.',
  thx:'Merci pour votre avis !',thx2:'Vos remarques nous aident à nous améliorer.',again:'Donner un autre avis',sendErr:"L'envoi a échoué. Vérifiez votre connexion et réessayez.",
  foot:'Léon Hotel · Brazzaville'},
 en:{svc:{hebergement:'Accommodation',restaurant:'Restaurant',patisserie:'Pastry shop',fastfood:'Fast food'},
  title:'We value your feedback',sub:'30 seconds, no account needed.',pick:'What would you like to rate?',
  rate:'Your rating',lab:['Very disappointing','Disappointing','Fair','Good','Excellent!'],
  more:'Rate in more detail (optional)',
  crit:{hebergement:['Cleanliness','Comfort','Welcome','Value for money'],restaurant:['Food quality','Service','Waiting time','Value for money'],patisserie:['Quality','Welcome','Waiting time','Value for money'],fastfood:['Quality','Speed','Welcome','Value for money']},
  comment:'Your comment',opt:'(optional)',ph:'What you enjoyed, or what we could improve…',
  contact:'Your details',first:'First name',last:'Last name',phone:'Phone',email:'Email',
  consent:'I agree to be contacted about my experience.',
  contactHint:'This information is never required.',
  send:'Send my review',needRate:'Choose a rating to send.',
  thx:'Thank you for your review!',thx2:'Your feedback helps us improve.',again:'Leave another review',sendErr:'Sending failed. Check your connection and try again.',
  foot:'Léon Hotel · Brazzaville'}
};
var $=function(i){return document.getElementById(i)};
var q=new URLSearchParams(location.search);
var lang=(q.get('lang')||'').slice(0,2);
if(lang!=='fr'&&lang!=='en'){try{lang=localStorage.getItem('leon_lang')||''}catch(e){}}
if(lang!=='fr'&&lang!=='en')lang=(navigator.language||'fr').slice(0,2)==='en'?'en':'fr';
var S={service:null,lieu:null,note:0,det:{}};
/* ?lieu=chambre-101 | restaurant | patisserie | fast-food … → service + emplacement */
function parseLieu(v){
  v=(v||'').toLowerCase().trim(); if(!v)return;
  var m=v.match(/^chambre[-_ ]?(\w+)$/);
  if(m){S.service='hebergement';S.lieu='Chambre '+m[1].toUpperCase();return}
  var map={hebergement:'hebergement',restaurant:'restaurant',patisserie:'patisserie','fast-food':'fastfood',fastfood:'fastfood'};
  if(map[v]){S.service=map[v];S.lieu=null}
}
parseLieu(q.get('lieu'));
function t(){return T[lang]}
function stars(n,cls){var o='';for(var i=1;i<=n;i++)o+='<button type="button" data-v="'+i+'" aria-label="'+i+'">'+STAR+'</button>';return o}
function render(){
  var L=t();document.documentElement.lang=lang;
  document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.l===lang)});
  $('title').textContent=L.title;$('sub').textContent=L.sub;$('foot').textContent=L.foot;
  document.title=L.title+' — Léon Hotel';
  $('pickT').textContent=L.pick;
  $('svcs').innerHTML=Object.keys(L.svc).map(function(k){return '<button type="button" data-s="'+k+'">'+ICON[k]+'<span>'+L.svc[k]+'</span></button>'}).join('');
  if(S.service){var w=L.svc[S.service]+(S.lieu?' · '+S.lieu:'');$('where').textContent=w;$('where').hidden=false}else $('where').hidden=true;
  $('pick').hidden=!!S.service;$('form').hidden=!S.service;
  $('rateT').textContent=L.rate;
  var cur=S.note;$('stars').innerHTML=stars(5);paint('stars',cur);$('rlabel').textContent=cur?L.lab[cur-1]:'';
  $('moreS').textContent=L.more;
  if(S.service){$('crits').innerHTML=L.crit[S.service].map(function(c,i){return '<div class="crit"><span>'+c+'</span><div class="mini" data-i="'+i+'">'+stars(5)+'</div></div>'}).join('');
    document.querySelectorAll('.mini').forEach(function(m){paint(m,S.det[m.dataset.i]||0)})}
  $('comT').innerHTML=L.comment+' <span class="opt">'+L.opt+'</span>';$('com').placeholder=L.ph;
  $('conT').innerHTML=L.contact+' <span class="opt">'+L.opt+'</span>';
  $('first').placeholder=L.first;$('last').placeholder=L.last;$('phone').placeholder=L.phone;$('email').placeholder=L.email;
  $('consentT').textContent=L.consent;$('conH').textContent=L.contactHint;
  $('send').textContent=L.send;$('send').disabled=!S.note;$('hint').textContent=S.note?'':L.needRate;
  $('thx').textContent=L.thx;$('thx2').textContent=L.thx2;$('again').textContent=L.again;
}
function paint(el,n){var e=typeof el==='string'?$(el):el;e.querySelectorAll('button').forEach(function(b,i){b.classList.toggle('on',i<n)})}
$('svcs').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;S.service=b.dataset.s;S.lieu=null;render();$('form').scrollIntoView({behavior:'smooth'})});
$('stars').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;S.note=+b.dataset.v;paint('stars',S.note);$('rlabel').textContent=t().lab[S.note-1];$('send').disabled=false;$('hint').textContent=''});
$('crits').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var m=b.closest('.mini');S.det[m.dataset.i]=+b.dataset.v;paint(m,+b.dataset.v)});
document.querySelector('.lang').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;lang=b.dataset.l;try{localStorage.setItem('leon_lang',lang)}catch(x){}render()});
$('form').addEventListener('submit',function(e){
  e.preventDefault();if(!S.note)return;
  var L=t(),crit=L.crit[S.service],det={};
  Object.keys(S.det).forEach(function(i){det[crit[i]]=S.det[i]});
  var f=$('first').value.trim(),l=$('last').value.trim(),p=$('phone').value.trim(),m=$('email').value.trim();
  var has=f||l||p||m;
  var rec={id:'AV-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase(),date:new Date().toISOString(),service:S.service,lieu:S.lieu,note:S.note,details:det,
    comment:$('com').value.trim(),lang:lang,contact:has?{prenom:f,nom:l,tel:p,email:m}:null,recontact:has&&$('consent').checked,statut:'Nouveau'};
  var done=function(){
    $('got').innerHTML=[1,2,3,4,5].map(function(i){return STAR.replace('<svg','<svg class="'+(i<=S.note?'on':'')+'"')}).join('');
    $('form').hidden=true;$('pick').hidden=true;$('where').hidden=true;document.querySelector('.hero').hidden=true;$('done').hidden=false;window.scrollTo(0,0);
  };
  if($('website')&&$('website').value){done();return}   /* champ piège anti-robots : on fait semblant, sans enregistrer */
  $('send').disabled=true;
  Promise.resolve(Store.add(rec)).then(done,function(){$('send').disabled=false;$('hint').textContent=t().sendErr;$('hint').style.color='#b3261e'});
});
$('again').addEventListener('click',function(){
  S.note=0;S.det={};$('hint').style.color='';$('com').value='';['first','last','phone','email'].forEach(function(i){$(i).value=''});$('consent').checked=false;
  $('done').hidden=true;document.querySelector('.hero').hidden=false;render();window.scrollTo(0,0)});
render();
})();
