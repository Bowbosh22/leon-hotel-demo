/* Accès aux données et à l'authentification.
   - Mode démonstration (config.js vide) : localStorage + mot de passe de démo.
   - Mode en ligne (config.js rempli) : base Supabase, comptes e-mail + mot de passe, rôles. */
(function(){
'use strict';
var CFG=window.LEON_CFG||{},URL_=String(CFG.SUPABASE_URL||'').replace(/\/+$/,''),KEY_=String(CFG.SUPABASE_ANON_KEY||'').trim();
var REMOTE=!!(URL_&&KEY_);
var LKEY='leon_avis_v1',SKEY='leon_sess',DEMO_PW='leon2026',AK='leon_admin';
var mem=[],cache=[];
window.SVC={hebergement:'Hébergement',restaurant:'Restaurant',patisserie:'Pâtisserie',fastfood:'Fast-food'};
window.STATUTS=['Nouveau','En cours','Traité','Clos'];

function http(method,path,o){
  o=o||{};var h={apikey:KEY_,'Content-Type':'application/json'};if(o.token)h['Authorization']='Bearer '+o.token;
  if(o.h)for(var k in o.h)h[k]=o.h[k];
  var ctl=typeof AbortController!=='undefined'?new AbortController():null,tm=ctl&&setTimeout(function(){ctl.abort()},20000);
  return fetch(URL_+path,{method:method,headers:h,body:o.body?JSON.stringify(o.body):undefined,signal:ctl?ctl.signal:undefined}).then(function(r){
    if(tm)clearTimeout(tm);
    return r.text().then(function(t){
      var d=null;try{d=t?JSON.parse(t):null}catch(e){}
      if(!r.ok){var e=new Error((d&&(d.message||d.msg||d.error_description||d.hint))||('Erreur '+r.status));e.status=r.status;e.body=d;throw e}
      return {status:r.status,data:d};
    });
  },function(err){if(tm)clearTimeout(tm);var e=new Error('Connexion impossible. Vérifiez votre accès Internet.');e.network=true;throw e});
}
function sess(){try{return JSON.parse(localStorage.getItem(SKEY)||'null')}catch(e){return null}}
function setSess(s){try{if(s)localStorage.setItem(SKEY,JSON.stringify(s));else localStorage.removeItem(SKEY)}catch(e){}}
function now(){return Math.floor(Date.now()/1000)}
function mk(d,old){return {access_token:d.access_token,refresh_token:d.refresh_token,expires_at:now()+(d.expires_in||3600),user:{id:d.user&&d.user.id||old&&old.user.id,email:d.user&&d.user.email||old&&old.user.email},role:old&&old.role}}

window.Auth={
  remote:REMOTE,
  isIn:function(){
    if(!REMOTE){try{return sessionStorage.getItem(AK)==='1'}catch(e){return false}}
    var s=sess();return !!(s&&s.refresh_token&&s.role);
  },
  role:function(){if(!REMOTE)return 'direction';var s=sess();return s&&s.role||''},
  email:function(){var s=sess();return s&&s.user&&s.user.email||''},
  login:function(email,pw){
    if(!REMOTE){
      if(String(pw).trim()===DEMO_PW){try{sessionStorage.setItem(AK,'1')}catch(e){}return Promise.resolve({role:'direction'})}
      return Promise.reject(new Error('Mot de passe incorrect.'));
    }
    return http('POST','/auth/v1/token?grant_type=password',{body:{email:String(email).trim(),password:pw}}).then(function(r){
      var s=mk(r.data);
      return http('GET','/rest/v1/staff?select=role&user_id=eq.'+encodeURIComponent(s.user.id),{token:s.access_token}).then(function(q){
        if(!q.data||!q.data.length)throw new Error("Ce compte n'a pas accès à l'espace direction.");
        s.role=q.data[0].role;setSess(s);return s;
      });
    },function(e){if(e.status===400||e.status===401||e.status===422)throw new Error('E-mail ou mot de passe incorrect.');throw e});
  },
  token:function(){
    var s=sess();if(!s)return Promise.reject(new Error('Session expirée'));
    if(s.expires_at-60>now())return Promise.resolve(s.access_token);
    return http('POST','/auth/v1/token?grant_type=refresh_token',{body:{refresh_token:s.refresh_token}}).then(function(r){
      var n=mk(r.data,s);n.role=s.role;setSess(n);return n.access_token;
    },function(e){if(!e.network){setSess(null)}throw e});
  },
  out:function(){
    if(!REMOTE){try{sessionStorage.removeItem(AK)}catch(e){}return}
    var s=sess();setSess(null);readyP=null;cache=[];
    if(s)http('POST','/auth/v1/logout',{token:s.access_token}).catch(function(){});
  }
};

function fromRow(r){
  var has=r.prenom||r.nom||r.tel||r.email;
  return {id:r.id,date:r.created_at,service:r.service,lieu:r.lieu||null,note:r.note,details:r.details||{},comment:r.comment||'',lang:r.lang||'fr',
    contact:has?{prenom:r.prenom||'',nom:r.nom||'',tel:r.tel||'',email:r.email||''}:null,recontact:!!r.recontact,
    statut:r.statut||'Nouveau',historique:r.historique||[],noteInterne:r.note_interne||''};
}
function toRow(a){
  var c=a.contact||{};
  return {id:a.id,service:a.service,lieu:a.lieu||null,note:a.note,details:a.details||{},comment:a.comment||null,lang:a.lang||'fr',
    prenom:c.prenom||null,nom:c.nom||null,tel:c.tel||null,email:c.email||null,recontact:!!a.recontact};
}
function fetchAll(){
  var out=[],from=0,step=1000;
  function page(){
    return Auth.token().then(function(t){return http('GET','/rest/v1/reviews?select=*&order=created_at.asc',{token:t,h:{'Range-Unit':'items',Range:from+'-'+(from+step-1)}})}).then(function(r){
      var d=r.data||[];out=out.concat(d);
      if(d.length===step&&out.length<20000){from+=step;return page()}
      return out;
    });
  }
  return page();
}
function bar(msg){
  if(!document.body)return;
  var b=document.getElementById('dberr');
  if(!b){b=document.createElement('div');b.id='dberr';b.setAttribute('role','alert');
    b.style.cssText='position:fixed;left:0;right:0;top:0;z-index:99999;background:#b3261e;color:#fff;font:600 14px system-ui,sans-serif;padding:10px 14px;text-align:center';document.body.appendChild(b)}
  b.textContent=msg;
}
var readyP=null;
window.Store={
  remote:REMOTE,
  ready:function(){
    if(readyP)return readyP;
    if(!REMOTE||!Auth.isIn())return Promise.resolve();
    if(readyP)return readyP;
    readyP=fetchAll().then(function(rows){cache=rows.map(fromRow)},function(e){
      if(!Auth.isIn()){location.replace('admin.html');return}
      bar(e.message||'Impossible de charger les avis.');
    });
    return readyP;
  },
  all:function(){
    if(REMOTE)return cache.slice();
    try{return JSON.parse(localStorage.getItem(LKEY)||'[]')}catch(e){return mem.slice()}
  },
  save:function(l){if(REMOTE)return;try{localStorage.setItem(LKEY,JSON.stringify(l))}catch(e){mem=l}},
  add:function(a){
    if(REMOTE)return http('POST','/rest/v1/reviews',{body:toRow(a),h:{Prefer:'return=minimal'}});
    var l=this.all();l.push(a);this.save(l);return Promise.resolve();
  },
  clear:function(){this.save([])},
  update:function(id,fn){
    if(!REMOTE){var l=this.all();for(var i=0;i<l.length;i++){if(l[i].id===id){fn(l[i]);break}}this.save(l);return Promise.resolve(true)}
    var o=null;for(var j=0;j<cache.length;j++){if(cache[j].id===id){o=cache[j];break}}
    if(!o)return Promise.resolve(false);fn(o);
    return Auth.token().then(function(t){return http('PATCH','/rest/v1/reviews?id=eq.'+encodeURIComponent(id),{token:t,h:{Prefer:'return=minimal'},body:{statut:o.statut||'Nouveau',note_interne:o.noteInterne||null,historique:o.historique||[]}})}).then(function(){return true},function(e){bar('Modification non enregistrée : '+e.message);return false});
  },
  watch:function(fn){
    if(!REMOTE){window.addEventListener('storage',function(e){if(e.key===LKEY)fn()});return}
    setInterval(function(){
      if(!Auth.isIn())return;
      fetchAll().then(function(rows){
        var n=rows.map(fromRow),sig=function(l){return l.length+'|'+(l.length?l[l.length-1].id:'')};
        if(sig(n)!==sig(cache)){cache=n;fn()}
      }).catch(function(){});
    },Number(CFG.POLL_MS)||30000);
  },
  cfg:function(){try{return JSON.parse(localStorage.getItem('leon_cfg')||'{}')}catch(e){return {}}},
  setCfg:function(c){try{localStorage.setItem('leon_cfg',JSON.stringify(c))}catch(e){}}
};
})();
