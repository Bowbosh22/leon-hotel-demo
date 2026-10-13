(function(){
  var b=document.querySelector('.menu-toggle'),m=document.getElementById('menu');
  if(!b||!m)return;
  b.addEventListener('click',function(){
    var o=m.classList.toggle('open');
    b.setAttribute('aria-expanded',o?'true':'false');
    b.textContent=o?'Fermer':'Menu';
  });
})();
