(function(){var t=null,ok={register:1,classic:1,night:1,aegean:1,future:1,neon:1,contrast:1};
try{t=localStorage.getItem('cp-theme-v2')}catch(e){}
if(!ok[t]) t='register';   // LOOK-1: the Survey sheet (it follows the system's light or dark setting itself)
document.documentElement.setAttribute('data-theme',t);})();