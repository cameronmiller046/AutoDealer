/* AutoDealer — shared in-call recording screen (ADCall).
   The default action for every Call button across the CRM: a live softphone with
   running timer, "Connected · Recording", animated waveform, mute / keypad /
   record / end controls, live Call Notes, Disposition, Schedule Follow-up, and an
   AI Call Summary. On disposition it logs the call — to the current customer
   timeline (window.ADCustomer.log) when available, otherwise to the session store.
   Loaded by roles.js on every app page.  Usage:  ADCall.open({name,phone,ini,color,id}) */
(function(){
  if (window.ADCall) return;

  var css = document.createElement('style'); css.id = 'ad-call-style';
  css.textContent = [
    '.adc-scrim{position:fixed;inset:0;z-index:90;background:rgba(10,20,36,.42);opacity:0;pointer-events:none;transition:opacity .22s;}',
    '.adc-scrim.show{opacity:1;pointer-events:auto;}',
    '.adc{position:fixed;top:0;right:0;bottom:0;width:min(440px,96vw);background:var(--card,#fff);color:var(--text,#16202e);z-index:91;box-shadow:-30px 0 70px -30px rgba(10,20,36,.5);transform:translateX(100%);transition:transform .28s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;}',
    '.adc.show{transform:none;}',
    '.adc-hero{position:relative;text-align:center;padding:30px 20px 18px;border-bottom:1px solid var(--line,#eef1f6);background:radial-gradient(120% 90% at 50% -10%,rgba(59,130,246,.12),transparent 65%);flex:none;}',
    '.adc-x{position:absolute;top:16px;right:16px;border:none;background:var(--bg,#f1f5f9);width:36px;height:36px;border-radius:11px;color:var(--muted,#6b7a90);cursor:pointer;}',
    '.adc-x svg{width:18px;height:18px;}',
    '.adc-av{width:72px;height:72px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font:800 24px Inter,system-ui,sans-serif;}',
    '.adc-name{font-size:22px;font-weight:800;letter-spacing:-.4px;}',
    '.adc-num{color:var(--muted,#6b7a90);font-size:14px;margin-top:2px;}',
    '.adc-timer{font:900 27px/1 Inter,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin:14px 0 4px;letter-spacing:-.5px;}',
    '.adc-stat{font-size:12.5px;font-weight:700;color:#16a34a;display:inline-flex;align-items:center;gap:7px;}',
    '.adc-stat .d{width:8px;height:8px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.2);}',
    '.adc-stat.ended{color:var(--muted,#6b7a90);} .adc-stat.ended .d{background:var(--muted,#6b7a90);box-shadow:none;}',
    '.adc-wave{display:flex;align-items:center;justify-content:center;gap:3px;height:28px;margin-top:14px;}',
    '.adc-wave i{width:3px;border-radius:2px;background:#3b82f6;height:6px;animation:adcw 1s infinite ease-in-out;}',
    '.adc-wave.off i{animation:none;height:4px;background:var(--line,#cbd5e1);}',
    '@keyframes adcw{0%,100%{height:6px}50%{height:22px}}',
    '.adc-pad{display:flex;align-items:center;justify-content:center;gap:16px;padding:18px 20px;flex:none;}',
    '.adc-pb{width:52px;height:52px;border-radius:50%;border:1px solid var(--line,#e7ecf3);background:var(--card,#fff);color:var(--text,#3a4a63);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:.14s;}',
    '.adc-pb:hover{background:var(--bg,#f1f5f9);} .adc-pb svg{width:22px;height:22px;}',
    '.adc-pb.on{background:#eef4ff;border-color:#cfe0f7;color:#2563eb;}',
    '.adc-pb.rec{color:#dc2626;} .adc-pb.rec.on{background:rgba(220,38,38,.1);border-color:rgba(220,38,38,.3);}',
    '.adc-pb.end{width:66px;height:66px;background:#ef4444;border:none;color:#fff;box-shadow:0 12px 26px -12px rgba(239,68,68,.8);} .adc-pb.end svg{width:26px;height:26px;}',
    '.adc-body{padding:6px 20px 22px;overflow:auto;flex:1;}',
    '.adc-sec{margin-top:16px;} .adc-sec h4{font-size:12.5px;font-weight:800;color:var(--text,#16202e);margin-bottom:9px;display:flex;align-items:center;gap:7px;} .adc-sec h4 .spark{color:#7c3aed;} .adc-sec h4 .spark svg{width:15px;height:15px;}',
    '.adc-sec textarea{width:100%;box-sizing:border-box;min-height:78px;resize:vertical;padding:11px 12px;border:1px solid var(--line,#e7ecf3);border-radius:11px;font:inherit;font-size:13.5px;background:var(--bg,#fff);color:var(--text,#16202e);}',
    '.adc-sec textarea:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.15);}',
    '.adc-chips{display:flex;flex-wrap:wrap;gap:8px;}',
    '.adc-chips button{border:1px solid var(--line,#e7ecf3);background:var(--card,#fff);color:var(--text,#16202e);border-radius:10px;padding:9px 13px;font:700 12.5px Inter,system-ui,sans-serif;cursor:pointer;transition:.14s;}',
    '.adc-chips button:hover{border-color:#cfe0f7;color:#2563eb;} .adc-chips button.on{background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;border-color:transparent;}',
    '.adc-ai{background:linear-gradient(135deg,rgba(79,141,255,.1),rgba(124,92,255,.07));border:1px solid rgba(79,141,255,.2);border-radius:12px;padding:13px 15px;font-size:12.5px;color:var(--muted,#6b7a90);line-height:1.5;}',
    'html[data-theme="dark"] .adc-pb.on{background:rgba(37,99,235,.2);}',
    '.adc-dialpad{display:none;padding:2px 20px 12px;} .adc-dialpad.show{display:block;}',
    '.adc-dd-disp{width:100%;box-sizing:border-box;text-align:center;font:800 22px Inter,system-ui,sans-serif;letter-spacing:3px;padding:10px;border:1px solid var(--line,#e7ecf3);border-radius:11px;background:var(--bg,#f6f8fb);color:var(--text,#16202e);margin-bottom:10px;min-height:44px;}',
    '.adc-dd-disp:empty::before{content:"Enter digits";color:var(--faint,#97a4b6);font-weight:600;letter-spacing:.5px;font-size:14px;}',
    '.adc-dd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;}',
    '.adc-dd-grid button{height:50px;border-radius:12px;border:1px solid var(--line,#e7ecf3);background:var(--card,#fff);color:var(--text,#16202e);font:700 20px Inter,system-ui,sans-serif;cursor:pointer;transition:.1s;line-height:1;}',
    '.adc-dd-grid button:hover{background:var(--bg,#f1f5f9);} .adc-dd-grid button:active{transform:scale(.94);} .adc-dd-grid button small{display:block;font-size:8.5px;color:var(--muted,#6b7a90);font-weight:800;letter-spacing:1.2px;margin-top:2px;}',
    '.adc-dd-actions{display:flex;gap:9px;margin-top:9px;} .adc-dd-actions button{flex:1;border-radius:10px;padding:9px;font:700 12.5px Inter,system-ui,sans-serif;cursor:pointer;border:1px solid var(--line,#e7ecf3);background:var(--card,#fff);color:var(--text,#16202e);}',
    '.adc-fu-custom{display:none;margin-top:10px;gap:8px;align-items:center;} .adc-fu-custom.show{display:flex;} .adc-fu-custom input{flex:1;min-width:0;padding:9px 11px;border:1px solid var(--line,#e7ecf3);border-radius:10px;font:inherit;background:var(--bg,#fff);color:var(--text,#16202e);} .adc-fu-custom button{border:none;background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;border-radius:10px;padding:9px 14px;font:700 12.5px Inter,system-ui,sans-serif;cursor:pointer;white-space:nowrap;}',
    '.adc-fu-msg{font-size:12px;color:#16a34a;font-weight:700;margin-top:9px;min-height:14px;}',
    '.adc-tr{margin-top:10px;border-top:1px dashed var(--line,#e7ecf3);padding-top:10px;} .adc-tr-h{font-size:11px;font-weight:800;color:var(--muted,#6b7a90);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;} .adc-tr-l{font-size:12.5px;line-height:1.5;color:var(--text,#16202e);margin:4px 0;} .adc-tr-l b{color:var(--muted,#6b7a90);font-weight:800;}'
  ].join('');
  (document.head||document.documentElement).appendChild(css);

  function I(k){ var p = {
    x:'<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    mute:'<path d="M9 4a3 3 0 0 1 6 0v5M15 12a3 3 0 0 1-5.5 1.7M5 5l14 14M6 11a6 6 0 0 0 9.3 5M12 19v3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    keypad:'<circle cx="6" cy="6" r="1.6" fill="currentColor"/><circle cx="12" cy="6" r="1.6" fill="currentColor"/><circle cx="18" cy="6" r="1.6" fill="currentColor"/><circle cx="6" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18" cy="12" r="1.6" fill="currentColor"/><circle cx="6" cy="18" r="1.6" fill="currentColor"/><circle cx="12" cy="18" r="1.6" fill="currentColor"/><circle cx="18" cy="18" r="1.6" fill="currentColor"/>',
    record:'<circle cx="12" cy="12" r="6" fill="currentColor"/>',
    endcall:'<path d="M3 10c5-4 13-4 18 0l-2.5 3-3.5-1v-2.2a12 12 0 0 0-6 0V12l-3.5 1z" fill="currentColor" transform="rotate(135 12 12)"/>'
  }[k]||''; return '<svg viewBox="0 0 24 24">'+p+'</svg>'; }

  function initials(n){ return (n||'?').split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase(); }
  function two(n){ return (n<10?'0':'')+n; }
  function toast(m){ if(window.adToast) window.adToast(m); }

  function open(contact){
    contact = contact || {};
    var name = contact.name || 'Outbound Call';
    var phone = contact.phone || '';
    var ini = contact.ini || initials(name);
    var color = contact.color || '#7c3aed';

    var scrim = document.createElement('div'); scrim.className='adc-scrim';
    var p = document.createElement('div'); p.className='adc';
    p.innerHTML =
      '<div class="adc-hero"><button class="adc-x" data-x>'+I('x')+'</button>'
        + '<span class="adc-av" style="background:'+color+'">'+ini+'</span>'
        + '<div class="adc-name">'+name+'</div>'+(phone?'<div class="adc-num">'+phone+'</div>':'')
        + '<div class="adc-timer" id="adcTimer">00:00</div><div class="adc-stat" id="adcStat"><span class="d"></span>Connected · Recording</div>'
        + '<div class="adc-wave" id="adcWave">'+Array.from({length:22}).map(function(_,i){return '<i style="animation-delay:'+((i%6)*0.09)+'s"></i>';}).join('')+'</div></div>'
      + '<div class="adc-pad"><button class="adc-pb" data-c="mute" title="Mute">'+I('mute')+'</button><button class="adc-pb" data-c="pad" title="Keypad">'+I('keypad')+'</button><button class="adc-pb rec on" data-c="rec" title="Recording">'+I('record')+'</button><button class="adc-pb end" data-c="end" title="End call">'+I('endcall')+'</button></div>'
      + '<div class="adc-dialpad" id="adcDialpad"><div class="adc-dd-disp" id="adcDdDisp"></div><div class="adc-dd-grid">'+[['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']].map(function(k){return '<button data-k="'+k[0]+'">'+k[0]+'<small>'+k[1]+'</small></button>';}).join('')+'</div><div class="adc-dd-actions"><button data-dd="back">⌫ Delete</button><button data-dd="clear">Clear</button></div></div>'
      + '<div class="adc-body">'
        + '<div class="adc-sec"><h4>Call Notes</h4><textarea id="adcNotes" placeholder="Type notes during the call…"></textarea></div>'
        + '<div class="adc-sec"><h4>Disposition</h4><div class="adc-chips" id="adcDisp">'+['Connected','Left Voicemail','No Answer','Busy','Wrong Number','Callback Requested','Sold','Lost'].map(function(d,i){return '<button'+(i===0?' class="on"':'')+' data-d="'+d+'">'+d+'</button>';}).join('')+'</div></div>'
        + '<div class="adc-sec"><h4>Schedule Follow-up</h4><div class="adc-chips" id="adcFu">'+['Tomorrow','In 3 Days','Next Week','Custom'].map(function(f){return '<button data-f="'+f+'">'+f+'</button>';}).join('')+'</div><div class="adc-fu-custom" id="adcFuCustom"><input type="datetime-local" id="adcFuDt"><button data-fu-save>Schedule</button></div><div class="adc-fu-msg" id="adcFuMsg"></div></div>'
        + '<div class="adc-sec"><h4><span class="spark">'+ic_spark()+'</span>AI Call Summary</h4><div class="adc-ai" id="adcAi">Live transcription is running. When the call ends, a summary of key topics, commitments, and a recommended next step will appear here.</div></div>'
      + '</div>';
    document.body.appendChild(scrim); document.body.appendChild(p);
    requestAnimationFrame(function(){ scrim.classList.add('show'); p.classList.add('show'); });

    var secs=0, iv=setInterval(function(){ secs++; var el=p.querySelector('#adcTimer'); if(el) el.textContent=two(Math.floor(secs/60))+':'+two(secs%60); },1000);
    var disp='Connected', ended=false, recording=true, muted=false, logged=false;
    function first(n){ return (n||'there').split(' ')[0]; }
    function vshort(v){ return (v||'the vehicle').replace(/^\d+\s+/,''); }

    // The X (top-right), Esc, or backdrop close the window — and log the call on the way out.
    function close(){ if(!logged) logCall(); clearInterval(iv); scrim.classList.remove('show'); p.classList.remove('show'); setTimeout(function(){ scrim.remove(); p.remove(); },300); document.removeEventListener('keydown',esc); }
    function esc(e){ if(e.key==='Escape') close(); }
    document.addEventListener('keydown',esc);
    scrim.addEventListener('click', close);
    p.querySelector('[data-x]').addEventListener('click', close);

    // End button ends the call and generates the summary + transcript — it does NOT close the window.
    function endCall(){ if(ended) return; ended=true; clearInterval(iv); recording=false;
      p.querySelector('#adcStat').classList.add('ended'); p.querySelector('#adcStat').innerHTML='<span class="d"></span>Call ended · '+p.querySelector('#adcTimer').textContent;
      p.querySelector('#adcWave').classList.add('off');
      var end=p.querySelector('.adc-pb.end'); if(end){ end.disabled=true; end.style.opacity='.5'; end.title='Call ended — press ✕ to close'; }
      genSummary();
      logCall();
      toast('Call ended · '+p.querySelector('#adcTimer').textContent);
    }
    function genSummary(){
      var ai=p.querySelector('#adcAi'); if(!ai) return;
      var dur=p.querySelector('#adcTimer').textContent, notes=(p.querySelector('#adcNotes').value||'').trim();
      var summ = (window.ADSummary) ? window.ADSummary.message({type:'call',status:disp,dir:'out'}, {veh:contact.veh,name:name})
        : ('Discussed the '+vshort(contact.veh)+'; call marked '+disp+'.');
      var next = disp==='Sold'?'Start the paperwork and schedule delivery.'
        : disp==='Lost'?'Log the reason lost and add to a win-back campaign.'
        : /voicemail|no answer|busy|wrong/i.test(disp)?'Send a follow-up text now, then retry the call tomorrow.'
        : 'Send a follow-up text with the numbers, then confirm the appointment.';
      ai.innerHTML = '<div style="font-weight:700;color:var(--text,#16202e);margin-bottom:6px">'+summ+'</div>'
        + '<div style="margin:6px 0 4px"><b style="color:#2563eb">Recommended next step —</b> '+next+'</div>'
        + '<div class="adc-tr"><div class="adc-tr-h">Auto-transcript · '+dur+' · '+disp+'</div>'
          + '<div class="adc-tr-l"><b>You:</b> Hi '+first(name)+', thanks for taking my call — wanted to go over the '+vshort(contact.veh)+'.</div>'
          + '<div class="adc-tr-l"><b>'+first(name)+':</b> Is the tow package included, and what would the payments look like?</div>'
          + '<div class="adc-tr-l"><b>You:</b> It is — I’ll text you the numbers and get you set for a test drive.</div>'
          + (notes?'<div class="adc-tr-l" style="color:var(--muted,#6b7a90)"><b>Notes:</b> '+notes+'</div>':'')
        + '</div>';
    }
    function logCall(){
      if(logged) return; logged=true;
      var dur=p.querySelector('#adcTimer').textContent, notes=(p.querySelector('#adcNotes').value||'').trim();
      var rec={ kind:'call', dir:'out', title:'Call — '+disp, detail:(dur!=='00:00'?dur+' · ':'')+(notes||'No notes'), ts:Date.now(), status:'done', disp:disp };
      try { if(window.ADCustomer && window.ADCustomer.log) window.ADCustomer.log(rec); else if(window.ADStore) window.ADStore.add('calls', Object.assign({contact:name,phone:phone}, rec)); } catch(e){}
    }

    // Choosing a disposition ends the call (if still live) and refreshes the summary — but keeps the window open.
    p.querySelectorAll('#adcDisp [data-d]').forEach(function(b){ b.addEventListener('click', function(){ p.querySelectorAll('#adcDisp button').forEach(function(x){x.classList.remove('on');}); b.classList.add('on'); disp=b.dataset.d; if(!ended) endCall(); else genSummary(); }); });
    // ---- Schedule Follow-up (working, incl. Custom date/time) ----
    function fmtWhen(ts){ var d=new Date(ts), h=d.getHours(), ap=h<12?'AM':'PM'; h=h%12||12; return d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})+' · '+h+':'+two(d.getMinutes())+' '+ap; }
    function scheduleFu(ts){
      try { var fu={ kind:'followup', dir:'out', title:'Follow-up call — '+name, detail:'Scheduled from the call.', ts:ts, status:'scheduled', priority:'High', assignee:'You' };
        if(window.ADCustomer && window.ADCustomer.log) window.ADCustomer.log(fu); else if(window.ADStore) window.ADStore.add('follow_ups', fu); } catch(e){}
      var m=p.querySelector('#adcFuMsg'); if(m) m.textContent='✓ Follow-up set for '+fmtWhen(ts); toast('Follow-up set for '+fmtWhen(ts));
    }
    p.querySelectorAll('#adcFu [data-f]').forEach(function(b){ b.addEventListener('click', function(){ p.querySelectorAll('#adcFu button').forEach(function(x){x.classList.remove('on');}); b.classList.add('on');
      var when=b.dataset.f, cust=p.querySelector('#adcFuCustom');
      if(when==='Custom'){ cust.classList.add('show'); var inp=p.querySelector('#adcFuDt'); var d=new Date(); d.setDate(d.getDate()+1); d.setHours(10,0,0,0); inp.value=d.getFullYear()+'-'+two(d.getMonth()+1)+'-'+two(d.getDate())+'T'+two(d.getHours())+':'+two(d.getMinutes()); inp.focus(); return; }
      cust.classList.remove('show');
      var off=when==='Tomorrow'?1:when==='In 3 Days'?3:when==='Next Week'?7:1; var d=new Date(); d.setDate(d.getDate()+off); d.setHours(10,0,0,0); scheduleFu(d.getTime());
    }); });
    var fuSave=p.querySelector('[data-fu-save]'); if(fuSave) fuSave.addEventListener('click', function(){ var v=p.querySelector('#adcFuDt').value; if(!v){ return; } scheduleFu(new Date(v).getTime()); });

    // ---- Dialpad (working DTMF keypad with tones) ----
    var actx; function beep(key){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); var o=actx.createOscillator(), g=actx.createGain();
      var f={'1':697,'2':770,'3':852,'4':941,'5':1209,'6':1336,'7':1477,'8':1633,'9':1000,'0':600,'*':700,'#':900}[key]||700;
      o.type='sine'; o.frequency.value=f; g.gain.value=0.07; o.connect(g); g.connect(actx.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime+0.14); o.stop(actx.currentTime+0.15); } catch(e){} }
    var dispEl=p.querySelector('#adcDdDisp');
    p.querySelectorAll('#adcDialpad [data-k]').forEach(function(b){ b.addEventListener('click', function(){ if(dispEl.textContent.length<24) dispEl.textContent+=b.dataset.k; beep(b.dataset.k); }); });
    p.querySelectorAll('#adcDialpad [data-dd]').forEach(function(b){ b.addEventListener('click', function(){ if(b.dataset.dd==='back') dispEl.textContent=dispEl.textContent.slice(0,-1); else dispEl.textContent=''; }); });

    p.querySelectorAll('.adc-pad [data-c]').forEach(function(b){ b.addEventListener('click', function(){ var c=b.dataset.c;
      if(c==='end') endCall();
      else if(c==='mute'){ muted=!muted; b.classList.toggle('on',muted); toast(muted?'Muted':'Unmuted'); }
      else if(c==='rec'){ recording=!recording; b.classList.toggle('on',recording); p.querySelector('#adcWave').classList.toggle('off',!recording); toast(recording?'Recording resumed':'Recording paused'); }
      else if(c==='pad'){ var dp=p.querySelector('#adcDialpad'); var open=dp.classList.toggle('show'); b.classList.toggle('on',open); }
    }); });
    var t=p.querySelector('#adcNotes'); if(t) setTimeout(function(){ t.focus(); },200);
    return { close:close };
  }
  function ic_spark(){ return '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" fill="currentColor"/></svg>'; }

  window.ADCall = { open:open };
})();
