/* Accès aux données (démo : localStorage). Sera remplacé par la base en ligne. */
(function(){
'use strict';
var KEY='leon_avis_v1',mem=[];
window.SVC={hebergement:'Hébergement',restaurant:'Restaurant',patisserie:'Pâtisserie',fastfood:'Fast-food'};
window.Store={
  all:function(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return mem}},
  save:function(l){try{localStorage.setItem(KEY,JSON.stringify(l))}catch(e){mem=l}},
  add:function(a){var l=this.all();l.push(a);this.save(l)},
  clear:function(){this.save([])}
};
/* Authentification de démonstration (côté navigateur, non sécurisée). La vraie connexion viendra avec la base en ligne. */
var PW='leon2026',AK='leon_admin';
window.Auth={
  isIn:function(){try{return sessionStorage.getItem(AK)==='1'}catch(e){return false}},
  login:function(p){if(String(p).trim()===PW){try{sessionStorage.setItem(AK,'1')}catch(e){}return true}return false},
  out:function(){try{sessionStorage.removeItem(AK)}catch(e){}}
};
})();
