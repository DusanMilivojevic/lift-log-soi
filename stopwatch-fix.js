(()=>{
  const STORAGE_KEY='lift-log-soi-stopwatch-v1';
  let elapsedMs=0;
  let startedAt=null;

  function loadState(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(saved&&Number.isFinite(saved.elapsedMs))elapsedMs=Math.max(0,saved.elapsedMs);
      if(saved&&Number.isFinite(saved.startedAt))startedAt=saved.startedAt;
    }catch(e){
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function saveState(){
    localStorage.setItem(STORAGE_KEY,JSON.stringify({elapsedMs,startedAt}));
  }

  function currentElapsedMs(){
    return elapsedMs+(startedAt!==null?Math.max(0,Date.now()-startedAt):0);
  }

  function render(){
    const totalSeconds=Math.floor(currentElapsedMs()/1000);
    stopwatchSeconds=totalSeconds;
    const minutes=Math.floor(totalSeconds/60);
    const seconds=totalSeconds%60;
    const display=document.querySelector('#stopwatchDisplay');
    if(display)display.textContent=String(minutes).padStart(2,'0')+':'+String(seconds).padStart(2,'0');
  }

  function stopTicker(){
    if(stopwatchInterval){
      clearInterval(stopwatchInterval);
      stopwatchInterval=null;
    }
  }

  function startTicker(){
    stopTicker();
    stopwatchInterval=setInterval(render,250);
  }

  window.toggleStopwatch=function(){
    const button=document.querySelector('#stopwatchStart');
    if(startedAt!==null){
      elapsedMs=currentElapsedMs();
      startedAt=null;
      stopTicker();
      saveState();
      render();
      if(button)button.textContent='Start';
      return;
    }

    startedAt=Date.now();
    saveState();
    startTicker();
    render();
    if(button)button.textContent='Pause';
  };

  window.resetStopwatch=function(){
    stopTicker();
    elapsedMs=0;
    startedAt=null;
    stopwatchSeconds=0;
    localStorage.removeItem(STORAGE_KEY);
    render();
    const button=document.querySelector('#stopwatchStart');
    if(button)button.textContent='Start';
  };

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)render();
  });
  window.addEventListener('focus',render);
  window.addEventListener('pageshow',render);

  loadState();
  render();
  const button=document.querySelector('#stopwatchStart');
  if(startedAt!==null){
    if(button)button.textContent='Pause';
    startTicker();
  }else if(button){
    button.textContent='Start';
  }
})();
