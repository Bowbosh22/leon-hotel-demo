/* Graphiques SVG partagés (statistiques + rapport). */
(function(){
'use strict';
var MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function line(b){
  var W=340,H=170,L=26,R=10,T=10,B=26,pw=W-L-R,ph=H-T-B,n=b.length;
  function X(i){return L+(n===1?pw/2:i*pw/(n-1))}function Y(v){return T+ph-(v-1)/4*ph}
  var g='',i;for(i=1;i<=5;i++)g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(i)+'" y2="'+Y(i)+'" class="gl"/><text x="'+(L-6)+'" y="'+(Y(i)+3.5)+'" class="ax" text-anchor="end">'+i+'</text>';
  var pts=[];b.forEach(function(x,i){if(x.a!=null)pts.push([X(i),Y(x.a),i])});
  var path=pts.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)}).join(' ');
  var area=pts.length>1?'<path d="'+path+' L'+pts[pts.length-1][0].toFixed(1)+' '+Y(1)+' L'+pts[0][0].toFixed(1)+' '+Y(1)+' Z" fill="rgba(42,98,196,.12)"/>':'';
  var dots=pts.map(function(p){return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(n>14?2.4:3.6)+'" fill="#2a62c4"/>'}).join('');
  var step=Math.ceil(n/6),xl='';b.forEach(function(x,i){if(i%step===0||i===n-1&&n<8)xl+='<text x="'+X(i)+'" y="'+(H-8)+'" class="ax" text-anchor="middle">'+esc(x.l)+'</text>'});
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Évolution de la note moyenne">'+g+area+'<path d="'+path+'" fill="none" stroke="#2a62c4" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>'+dots+xl+'<rect class="hit" x="'+L+'" y="'+T+'" width="'+pw+'" height="'+ph+'" fill="transparent"/><line id="cur1" y1="'+T+'" y2="'+(T+ph)+'" class="cur" visibility="hidden"/></svg>';
}
function bars(b){
  var W=340,H=130,L=26,R=10,T=14,B=22,pw=W-L-R,ph=H-T-B,n=b.length,mx=Math.max.apply(null,b.map(function(x){return x.n}).concat([1]));
  var bw=Math.max(2,pw/n*.62),o='<text x="'+(L-6)+'" y="'+(T+3.5)+'" class="ax" text-anchor="end">'+mx+'</text><text x="'+(L-6)+'" y="'+(T+ph+3.5)+'" class="ax" text-anchor="end">0</text><line x1="'+L+'" x2="'+(W-R)+'" y1="'+(T+ph)+'" y2="'+(T+ph)+'" class="gl"/>';
  b.forEach(function(x,i){var h=x.n/mx*ph,cx=L+(i+.5)*pw/n;if(x.n)o+='<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+(T+ph-h).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="1.5" fill="#1f9a35"/>'});
  var step=Math.ceil(n/6);b.forEach(function(x,i){if(i%step===0)o+='<text x="'+(L+(i+.5)*pw/n)+'" y="'+(H-6)+'" class="ax" text-anchor="middle">'+esc(x.l)+'</text>'});
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Nombre d\'avis par période">'+o+'</svg>';
}

window.Charts={line:line,bars:bars};
})();
