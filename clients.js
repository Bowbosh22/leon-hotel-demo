(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
var STAR='<svg viewBox="0 0 24 24"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z"/></svg>';
function stars(n){var o='';for(var i=1;i<=5;i++)o+=STAR.replace('<svg','<svg class="'+(i<=Math.round(n)?'on':'')+'"');return o}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
function two(n){return n<10?'0'+n:''+n}
function dt(iso){var d=new Date(iso);return d.getDate()+' '+MOIS[d.getMonth()]+' '+d.getFullYear()}
function fmt(x){return (Math.round(x*10)/10).toFixed(1).replace('.',',')}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
/* regroupe les avis par client (e-mail, sinon téléphone, sinon nom) */
function clients(){
  var map={};
  Store.all().forEach(function(a){
    var c=a.contact;if(!c)return;
    var tel=String(c.tel||'').replace(/\D/g,''),mail=String(c.email||'').trim().toLowerCase(),nom=norm((c.prenom||'')+' '+(c.nom||'')).trim();
    var k=mail||tel||nom;if(!k)return;
    var o=map[k]||(map[k]={prenom:'',nom:'',tel:'',email:'',avis:[],rec:false});
    if(c.prenom&&!o.prenom)o.prenom=c.prenom;if(c.nom&&!o.nom)o.nom=c.nom;if(c.tel&&!o.tel)o.tel=c.tel;if(c.email&&!o.email)o.email=c.email;
    o.avis.push(a);if(a.recontact)o.rec=true;
  });
  return Object.keys(map).map(function(k){var o=map[k];o.avis.sort(function(a,b){return a.date<b.date?1:-1});
    o.moy=o.avis.reduce(function(s,a){return s+a.note},0)/o.avis.length;o.last=o.avis[0].date;return o}).sort(function(a,b){return a.last<b.last?1:-1});
}
window.ClientsData=clients;
if(!$('list'))return;
var filt='all';
function name(c){var n=(c.prenom+' '+c.nom).trim();return n||'Client sans nom'}
function card(c){
  var ct=[c.tel,c.email].filter(Boolean).map(esc).join(' · ')||'—';
  var digits=String(c.tel||'').replace(/\D/g,'');
  var acts=(c.tel?'<a href="tel:+'+digits+'">Appeler</a><a href="https://wa.me/'+digits+'" target="_blank" rel="noopener">WhatsApp</a>':'')+(c.email?'<a href="mailto:'+esc(c.email)+'">E-mail</a>':'');
  var h=c.avis.map(function(a){var lieu=a.lieu?SVC[a.service]+' · '+a.lieu:SVC[a.service];
    return '<div class="rv"><div class="hd"><b>'+esc(lieu)+(a.note<=2?' <span class="tag neg">'+(a.statut||'Nouveau')+'</span>':'')+'</b><span>'+dt(a.date)+'</span></div><div class="sts">'+stars(a.note)+'</div>'+(a.comment?'<p>'+esc(a.comment)+'</p>':'<p class="who"><i>Pas de commentaire</i></p>')+'</div>'}).join('');
  return '<details class="cl"><summary><div class="nm"><span>'+esc(name(c))+'</span>'+(c.rec?'<span class="tag rec">À recontacter</span>':'')+'</div>'+
    '<div class="ct">'+ct+'</div><div class="meta"><span class="sts">'+stars(c.moy)+'</span><span>'+c.avis.length+' avis · moy. '+fmt(c.moy)+'</span><span>Dernier : '+dt(c.last)+'</span></div></summary>'+
    '<div class="hist2">'+(acts?'<div class="acts2">'+acts+'</div>':'')+h+'</div></details>';
}
function render(){
  var q=norm($('q').value).trim(),all=clients();
  var l=all.filter(function(c){
    if(filt==='rec'&&!c.rec)return false;
    if(!q)return true;
    var hay=norm(name(c)+' '+c.tel+' '+c.email)+' '+String(c.tel).replace(/\D/g,'');
    return q.split(/\s+/).every(function(w){return hay.indexOf(w.replace(/\D/g,'').length>=3?w.replace(/\D/g,''):w)>-1});
  });
  $('list').innerHTML=l.map(card).join('');
  $('none').hidden=l.length>0;$('list').hidden=!l.length;
  $('nonetxt').textContent=all.length?'Essayez une autre recherche.':'Les clients qui laissent leurs coordonnées apparaîtront ici (chargez des avis d\'exemple depuis le tableau de bord).';
  $('cnt').textContent=all.length?l.length+' client'+(l.length>1?'s':'')+(l.length!==all.length?' sur '+all.length:''):'';
}
$('q').addEventListener('input',render);
$('f').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;filt=b.dataset.f;document.querySelectorAll('#f button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});render()});
Store.ready().then(render);
})();
