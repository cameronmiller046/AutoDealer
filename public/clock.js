/* AutoDealer — employee time clock (clock in / break / clock out).
   Injected into the topbar on every app page by roles.js (like notify.js).
   Shows the current shift status with a live running timer and a dropdown to
   clock in, start/end a break, and clock out. State + today's totals persist
   per user in localStorage, so the timer keeps running as you move between pages. */
(function(){
  if (window.__adClock) return; window.__adClock = true;

  function role(){ try { return (window.ADRoles && ADRoles.getRole && ADRoles.getRole()) || 'salesperson'; } catch(e){ return 'salesperson'; } }
  function who(){ try { return (window.ADRoles && ADRoles.cfg && ADRoles.cfg().name) || 'You'; } catch(e){ return 'You'; } }
  var KEY = 'ad_clock_' + role();
  function today(){ var d = new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function fresh(){ return { status:'out', since:0, worked:0, breakMs:0, breakSince:0, day:today(), log:[] }; }
  function load(){ try { var s = JSON.parse(localStorage.getItem(KEY)); if(!s) return fresh(); if(s.day !== today()){ /* new day resets today's totals */ return fresh(); } return s; } catch(e){ return fresh(); } }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
  var S = load();

  function pad(n){ return (n<10?'0':'')+n; }
  function fmt(ms){ if(ms<0) ms=0; var s=Math.floor(ms/1000); var h=Math.floor(s/3600); var m=Math.floor((s%3600)/60); return pad(h)+':'+pad(m)+':'+pad(s%60); }
  function fmtShort(ms){ var s=Math.floor(ms/1000); var h=Math.floor(s/3600); var m=Math.floor((s%3600)/60); return (h?h+'h ':'')+m+'m'; }
  function workedNow(){ return S.worked + (S.status==='in' ? (Date.now()-S.since) : 0); }
  function breakNow(){ return S.breakMs + (S.status==='break' ? (Date.now()-S.breakSince) : 0); }
  function stamp(){ var d=new Date(); return pad(d.getHours())+':'+pad(d.getMinutes()); }
  function logEvt(t){ S.log.unshift({ t:t, at:stamp() }); S.log = S.log.slice(0,12); }

  /* ---- actions ---- */
  function clockIn(){ if(S.status!=='out') return; S.status='in'; S.since=Date.now(); S.day=today(); logEvt('Clocked in'); save(); render(); toast('Clocked in','Have a great shift, '+who().split(' ')[0]+'!'); }
  function startBreak(){ if(S.status!=='in') return; S.worked += Date.now()-S.since; S.status='break'; S.breakSince=Date.now(); logEvt('Break started'); save(); render(); toast('On break','The clock is paused.'); }
  function endBreak(){ if(S.status!=='break') return; S.breakMs += Date.now()-S.breakSince; S.status='in'; S.since=Date.now(); logEvt('Break ended'); save(); render(); toast('Back on the clock','Break time logged.'); }
  function clockOut(){ if(S.status==='out') return; if(S.status==='in') S.worked += Date.now()-S.since; if(S.status==='break') S.breakMs += Date.now()-S.breakSince; S.status='out'; S.since=0; S.breakSince=0; logEvt('Clocked out'); save(); render(); toast('Clocked out','Worked '+fmtShort(S.worked)+' today. See you next shift!'); }

  function toast(msg, sub){
    if (window.adToast){ window.adToast(msg); return; }
    var t=document.getElementById('adClkToast');
    if(!t){ t=document.createElement('div'); t.id='adClkToast'; t.style.cssText='position:fixed;right:18px;bottom:18px;z-index:99999;background:var(--card,#fff);color:var(--text,#16202e);border:1px solid var(--line,rgba(15,27,45,.1));border-left:3px solid #16a34a;border-radius:12px;padding:12px 15px;font:600 13.5px system-ui;box-shadow:0 18px 40px -18px rgba(10,22,40,.5);opacity:0;transform:translateY(8px);transition:.28s;'; document.body.appendChild(t); }
    t.innerHTML='<div>'+msg+'</div><div style="font-weight:500;font-size:12px;color:var(--muted,#6b7a90);margin-top:2px">'+(sub||'')+'</div>';
    requestAnimationFrame(function(){ t.style.opacity='1'; t.style.transform='none'; });
    clearTimeout(t._x); t._x=setTimeout(function(){ t.style.opacity='0'; t.style.transform='translateY(8px)'; }, 2600);
  }

  /* ---- styles ---- */
  function css(){
    if(document.getElementById('ad-clk-style')) return;
    var s=document.createElement('style'); s.id='ad-clk-style';
    s.textContent = [
      '.ad-clk{position:relative;flex:none;}',
      '.ad-clk-btn{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 13px;border-radius:11px;border:1px solid #e7ecf3;background:#fff;color:#3a4a63;font:700 13px Inter,system-ui,sans-serif;cursor:pointer;white-space:nowrap;transition:.15s;}',
      '.ad-clk-btn:hover{border-color:#cfe0f7;}',
      '.ad-clk-btn .cd{width:8px;height:8px;border-radius:50%;background:#9aa7ba;flex:none;}',
      '.ad-clk-btn.in{border-color:rgba(22,163,74,.4);color:#15803d;background:rgba(22,163,74,.08);} .ad-clk-btn.in .cd{background:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.18);animation:adclkp 1.6s infinite;}',
      '.ad-clk-btn.brk{border-color:rgba(217,119,6,.4);color:#b45309;background:rgba(245,158,11,.1);} .ad-clk-btn.brk .cd{background:#d97706;}',
      '.ad-clk-btn.out{color:#2563eb;border-color:#cfe0f7;background:rgba(37,99,235,.06);}',
      '@keyframes adclkp{50%{opacity:.4;}}',
      '.ad-clk-mono{font-variant-numeric:tabular-nums;letter-spacing:.3px;}',
      '.ad-clk-pop{position:absolute;top:calc(100% + 10px);right:0;width:288px;background:#fff;border:1px solid #e7ecf3;border-radius:16px;box-shadow:0 30px 70px -28px rgba(15,27,45,.5);opacity:0;transform:translateY(-8px) scale(.98);pointer-events:none;transition:.18s;z-index:200;overflow:hidden;}',
      '.ad-clk-pop.open{opacity:1;transform:none;pointer-events:auto;}',
      '.ad-clk-hd{padding:16px 17px;border-bottom:1px solid #eef2f8;}',
      '.ad-clk-hd .st{font:800 15px Inter,sans-serif;color:#16202e;display:flex;align-items:center;gap:8px;}',
      '.ad-clk-hd .big{font:900 28px/1 Inter,sans-serif;color:#16202e;margin-top:10px;letter-spacing:-.5px;} .ad-clk-hd .big.brk{color:#b45309;}',
      '.ad-clk-hd .lbl{font-size:11.5px;color:#8697ad;font-weight:600;margin-top:3px;}',
      '.ad-clk-tot{display:flex;gap:10px;padding:12px 17px;border-bottom:1px solid #eef2f8;}',
      '.ad-clk-tot .c{flex:1;background:#f6f8fb;border-radius:10px;padding:9px 11px;} .ad-clk-tot .c b{display:block;font:800 16px Inter,sans-serif;color:#16202e;} .ad-clk-tot .c span{font-size:11px;color:#8697ad;font-weight:600;}',
      '.ad-clk-acts{padding:12px 14px;display:flex;flex-direction:column;gap:8px;}',
      '.ad-clk-acts button{width:100%;padding:11px;border-radius:10px;font:700 13.5px Inter,sans-serif;cursor:pointer;border:1px solid transparent;}',
      '.ad-clk-in{background:linear-gradient(180deg,#22c55e,#16a34a);color:#fff;} .ad-clk-out{background:linear-gradient(180deg,#f87171,#ef4444);color:#fff;}',
      '.ad-clk-brk{background:#fff;border:1px solid #e7ecf3;color:#b45309;} .ad-clk-brk.end{color:#15803d;}',
      '.ad-clk-log{max-height:132px;overflow:auto;border-top:1px solid #eef2f8;padding:8px 0;}',
      '.ad-clk-log .r{display:flex;justify-content:space-between;padding:6px 17px;font-size:12.5px;color:#5a6b83;} .ad-clk-log .r b{color:#16202e;font-weight:600;}',
      /* dark theme */
      'html[data-theme="dark"] .ad-clk-btn{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:#cdd9ec;}',
      'html[data-theme="dark"] .ad-clk-pop{background:#141f34;border-color:rgba(255,255,255,.1);}',
      'html[data-theme="dark"] .ad-clk-hd,html[data-theme="dark"] .ad-clk-tot{border-color:rgba(255,255,255,.08);}',
      'html[data-theme="dark"] .ad-clk-hd .st,html[data-theme="dark"] .ad-clk-hd .big,html[data-theme="dark"] .ad-clk-tot .c b{color:#e6edf7;}',
      'html[data-theme="dark"] .ad-clk-tot .c{background:rgba(255,255,255,.05);}',
      'html[data-theme="dark"] .ad-clk-brk{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);}',
      'html[data-theme="dark"] .ad-clk-log{border-color:rgba(255,255,255,.08);} html[data-theme="dark"] .ad-clk-log .r b{color:#e6edf7;}'
    ].join('');
    document.head.appendChild(s);
  }

  var wrap, btn, pop;
  function statusText(){ return S.status==='in'?'On the clock':S.status==='break'?'On break':'Clocked out'; }
  function render(){
    if(!btn) return;
    btn.className='ad-clk-btn '+(S.status==='in'?'in':S.status==='break'?'brk':'out');
    if(S.status==='out'){ btn.innerHTML='<span class="cd"></span><svg viewBox="0 0 24 24" style="width:15px;height:15px" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2" stroke-linecap="round"/></svg>Clock In'; }
    else { btn.innerHTML='<span class="cd"></span><span class="ad-clk-mono">'+fmt(S.status==='break'?breakNow():workedNow())+'</span>'; }
    if(pop && pop.classList.contains('open')) renderPop();
  }
  function renderPop(){
    var onBreak=S.status==='break';
    pop.innerHTML =
      '<div class="ad-clk-hd"><div class="st"><span style="width:9px;height:9px;border-radius:50%;background:'+(S.status==='in'?'#16a34a':S.status==='break'?'#d97706':'#9aa7ba')+'"></span>'+statusText()+'</div>'
        + '<div class="big'+(onBreak?' brk':'')+' ad-clk-mono">'+fmt(onBreak?breakNow():workedNow())+'</div>'
        + '<div class="lbl">'+(S.status==='out'?'Not clocked in':onBreak?'Break time':'Worked today')+'</div></div>'
      + '<div class="ad-clk-tot"><div class="c"><b class="ad-clk-mono">'+fmtShort(workedNow())+'</b><span>Worked today</span></div><div class="c"><b class="ad-clk-mono">'+fmtShort(breakNow())+'</b><span>Break today</span></div></div>'
      + '<div class="ad-clk-acts">'
        + (S.status==='out'
            ? '<button class="ad-clk-in" data-a="in">Clock In</button>'
            : (onBreak
                ? '<button class="ad-clk-brk end" data-a="endbreak">End Break</button><button class="ad-clk-out" data-a="out">Clock Out</button>'
                : '<button class="ad-clk-brk" data-a="break">Start Break</button><button class="ad-clk-out" data-a="out">Clock Out</button>'))
      + '</div>'
      + (S.log.length ? '<div class="ad-clk-log">'+S.log.map(function(e){ return '<div class="r"><b>'+e.t+'</b><span>'+e.at+'</span></div>'; }).join('')+'</div>' : '');
    pop.querySelectorAll('[data-a]').forEach(function(b){ b.addEventListener('click', function(){ var a=b.getAttribute('data-a'); if(a==='in')clockIn(); else if(a==='break')startBreak(); else if(a==='endbreak')endBreak(); else if(a==='out')clockOut(); }); });
  }

  function mount(){
    var bar=document.querySelector('.topbar'); if(!bar) return false;
    if(document.querySelector('.ad-clk')) return true;
    css();
    wrap=document.createElement('div'); wrap.className='ad-clk';
    btn=document.createElement('button'); btn.className='ad-clk-btn out'; btn.type='button'; btn.setAttribute('aria-label','Time clock');
    pop=document.createElement('div'); pop.className='ad-clk-pop';
    wrap.appendChild(btn); wrap.appendChild(pop);
    var av=bar.querySelector('.tb-avatar');
    if(av && av.parentNode) av.parentNode.insertBefore(wrap, av); else bar.appendChild(wrap);
    btn.addEventListener('click', function(e){ e.stopPropagation(); var open=pop.classList.toggle('open'); if(open) renderPop(); });
    document.addEventListener('click', function(e){ if(!wrap.contains(e.target)) pop.classList.remove('open'); });
    render();
    setInterval(function(){ if(S.status!=='out') render(); }, 1000);
    return true;
  }
  function boot(){ if(!mount()){ var n=0, iv=setInterval(function(){ n++; if(mount()||n>20) clearInterval(iv); }, 150); } }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.ADClock = { get:function(){ return { status:S.status, worked:workedNow(), breakMs:breakNow() }; }, clockIn:clockIn, clockOut:clockOut, startBreak:startBreak, endBreak:endBreak };
})();
