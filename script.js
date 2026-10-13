(function(){
  // Menu plein écran
  var btn=document.getElementById('menuBtn'),ov=document.getElementById('overlay'),close=document.getElementById('menuClose');
  function open(){ov.hidden=false;btn.setAttribute('aria-expanded','true');document.body.classList.add('lock');close.focus();}
  function shut(){ov.hidden=true;btn.setAttribute('aria-expanded','false');document.body.classList.remove('lock');btn.focus();}
  if(btn&&ov&&close){
    btn.addEventListener('click',open);
    close.addEventListener('click',shut);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden)shut();});
    ov.addEventListener('click',function(e){var a=e.target.closest('a');if(a&&a.getAttribute('href').indexOf('#')>-1&&a.pathname===location.pathname){shut();}});
  }
  // Boîte de réservation directe : fermable, mémorisée pour la session
  var rate=document.getElementById('rate'),x=document.getElementById('rateX');
  if(rate&&x){
    try{if(sessionStorage.getItem('rateClosed')==='1')rate.hidden=true;}catch(e){}
    x.addEventListener('click',function(){rate.hidden=true;try{sessionStorage.setItem('rateClosed','1');}catch(e){}});
  }
  // Vidéo d'en-tête : démarre en sourdine, pause possible, respecte « réduire les animations »
  var v=document.querySelector('video.vid'),ctl=document.getElementById('vidCtl');
  if(v&&ctl){
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    v.addEventListener('canplay',function(){v.classList.add('on');ctl.hidden=false;if(reduce){v.pause();ctl.textContent='Lecture';}else{var p=v.play();if(p&&p.catch)p.catch(function(){ctl.textContent='Lecture';});}});
    ctl.addEventListener('click',function(){if(v.paused){v.play();ctl.textContent='Pause';}else{v.pause();ctl.textContent='Lecture';}});
    v.load();
  }
})();
// Accueil : barre transparente sur la vidéo, pleine au défilement
(function(){
  if(!document.body.classList.contains('home'))return;
  var h=document.querySelector('header.site'),p=document.querySelector('.promo'),root=document.documentElement;
  function upd(){
    var ph=p?p.offsetHeight:0,y=window.pageYOffset||0;
    root.style.setProperty('--ph',ph+'px');
    root.style.setProperty('--ht',Math.max(0,ph-y)+'px');
    var sc=y>Math.max(40,ph);if(h)h.classList.toggle('solid',sc);document.body.classList.toggle('scrolled',y>window.innerHeight*0.6);
  }
  upd();window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);
})();
