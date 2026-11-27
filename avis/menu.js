/* En-tête et menu de l'espace direction. */
(function(){
function build(){
var el=document.getElementById('hdr');if(!el)return;
var act=el.getAttribute('data-active');
var items=[['accueil.html','Accueil','home'],['admin.html','Avis','dash'],['stats.html','Stats','stats'],['clients.html','Clients','clients'],['reservations.html','Réservations','resa'],['abonnes.html','Abonnés','abo'],['exports.html','Exports','exports'],['qr.html','QR codes','qr']];
if(Auth.role()!=='direction')items=items.filter(function(i){return i[2]!=='exports'&&i[2]!=='qr'});
el.className='hdr noprint';
el.innerHTML='<div class="top"><div class="wm"><b>LEON</b><i>HOTEL</i></div><button type="button" class="pill" id="out2">Quitter</button></div>'+
 '<nav class="menu" aria-label="Espace direction">'+items.map(function(i){return '<a href="'+i[0]+'"'+(i[2]===act?' aria-current="page"':'')+'>'+i[1]+'</a>'}).join('')+'</nav>';
if(window.Resa){Resa.ready().then(function(){var n=Resa.all().filter(function(r){return (r.statut||'Nouvelle')==='Nouvelle'}).length,a=el.querySelector('a[href="reservations.html"]');
  if(n&&a&&!a.querySelector('.nb')){var b=document.createElement('span');b.className='nb';b.textContent=n;a.appendChild(b)}})}
document.getElementById('out2').addEventListener('click',function(){Auth.out();location.href='admin.html'});
}
window.Menu={build:build};
build();
})();
