(function(){var t=null,ok={classic:1,night:1,aegean:1,future:1,neon:1,contrast:1};
try{t=localStorage.getItem('cp-theme-v2')}catch(e){}
if(!ok[t]) t=(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'night':'classic';
document.documentElement.setAttribute('data-theme',t);})();