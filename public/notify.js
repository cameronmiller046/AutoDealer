/* AutoDealer CRM — global Smart Notifications bell.
   Injected on every page by roles.js (like ai.js). Mounts a bell into the topbar
   with a live unread badge and an actionable dropdown. Links through to /notifications. */
(function(){
  if (window.__adNotifyMounted) return; window.__adNotifyMounted = true;

  var ICONS = {
    lead:'<circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 18c0-3 2.5-5 5.5-5s5.5 2 5.5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M17 7v5M14.5 9.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    deal:'<path d="M4 7h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 12h16" stroke="currentColor" stroke-width="1.6"/>',
    review:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    equity:'<path d="M4 16l5-5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7h5v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    birthday:'<path d="M5 20h14v-6H5zM7 14v-3a5 5 0 0 1 10 0v3M12 3v3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    training:'<path d="M12 4L2.5 9 12 14l9.5-5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 11v4c0 1 2.7 2 6 2s6-1 6-2v-4" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    appt:'<rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" fill="none" stroke="currentColor" stroke-width="1.6"/>'
  };
  var TONE = {
    blue:['#eff4ff','#2563eb'], red:['#fdeaea','#dc2626'], amber:['#fdf0dc','#b7791f'],
    green:['#e7f7ee','#16a34a'], purple:['#f1eafe','#7c3aed'], pink:['#fdeaf3','#db2777']
  };
  // Role-aware feed — the bell shows what matters to THIS role.
  var role = (window.ADRoles && window.ADRoles.getRole && window.ADRoles.getRole()) || 'salesperson';
  var FEEDS = {
    bdc:[
      {id:1,ic:'lead',tone:'red',t:'New internet lead',d:'Jessica Tran — Highlander, pre-qualified. SLA clock running',time:'1m',href:'/prospects',unread:true},
      {id:2,ic:'lead',tone:'amber',t:'SLA warning',d:'Maria Lopez lead un-responded for 4m 40s',time:'4m',href:'/prospects',unread:true},
      {id:3,ic:'appt',tone:'blue',t:'Customer replied',d:'John Smith: "Can we do tomorrow morning instead?"',time:'12m',href:'/communications',unread:true},
      {id:4,ic:'appt',tone:'green',t:'Appointment confirmed',d:'Kevin Anderson confirmed for 3:30 PM today',time:'40m',href:'/appointments',unread:false},
      {id:5,ic:'system',tone:'amber',t:'Missed call',d:'Inbound from (555) 100-2288 — no voicemail',time:'1h',href:'/communications',unread:false}
    ],
    finance:[
      {id:1,ic:'deal',tone:'green',t:'Credit approved',d:'John Smith · Chase Auto @ 6.4% — ready to structure',time:'3m',href:'/finance',unread:true},
      {id:2,ic:'review',tone:'amber',t:'Missing document',d:'David Johnson · proof of insurance needed before delivery',time:'20m',href:'/documents',unread:true},
      {id:3,ic:'deal',tone:'blue',t:'Contract signed',d:'Sarah Lewis e-signed the retail installment contract',time:'35m',href:'/signing',unread:true},
      {id:4,ic:'equity',tone:'green',t:'Funding received',d:'Okafor deal (#D-4455) funded by lender — $38,200',time:'2h',href:'/finance',unread:false},
      {id:5,ic:'appt',tone:'blue',t:'Delivery ready',d:'Whitfield · all docs signed · Jul 29 4:30 PM',time:'3h',href:'/delivery',unread:false}
    ],
    gm:[
      {id:1,ic:'deal',tone:'red',t:'Deal awaiting approval',d:'Nguyen deal stuck at desk 22m — needs a manager',time:'8m',href:'/showroom',unread:true},
      {id:2,ic:'system',tone:'red',t:'SLA breach',d:'Internet lead response exceeded 5-min SLA (weekend)',time:'22m',href:'/analytics',unread:true},
      {id:3,ic:'equity',tone:'green',t:'Sales goal milestone',d:'Store hit 104% of monthly goal with 6 days left',time:'1h',href:'/gm',unread:true},
      {id:4,ic:'deal',tone:'amber',t:'Inventory aging alert',d:'Silverado stock depletes in ~12 days at current pace',time:'2h',href:'/invintel',unread:true},
      {id:5,ic:'review',tone:'amber',t:'Critical customer issue',d:'2★ Google review unanswered for 40 min',time:'2h',href:'/reviews',unread:false},
      {id:6,ic:'system',tone:'blue',t:'System health',d:'DMS sync (CDK) delayed 4 min — self-recovering',time:'3h',href:'/admin',unread:false}
    ],
    _default:[
      {id:1,ic:'lead',tone:'red',t:'Hot lead just came in',d:'Jessica Tran — 2025 Highlander, financing pre-qualified',time:'2m',href:'/prospects',unread:true},
      {id:2,ic:'deal',tone:'amber',t:'Deal waiting at the desk',d:'Nguyen Family (Jordan) has been at desk 22 min',time:'8m',href:'/showroom',unread:true},
      {id:3,ic:'review',tone:'amber',t:'New review needs a reply',d:'Maria Gonzalez left a 2★ review on Google',time:'40m',href:'/reviews',unread:true},
      {id:4,ic:'equity',tone:'green',t:'3 customers hit positive equity',d:'AI found upgrade opportunities worth ~$14K gross',time:'1h',href:'/equity',unread:true},
      {id:5,ic:'appt',tone:'blue',t:'Delivery confirmed',d:'Sarah Whitfield confirmed Jul 29 · 4:30 PM',time:'2h',href:'/delivery',unread:false},
      {id:6,ic:'birthday',tone:'pink',t:'Customer birthday tomorrow',d:'Robert Chen — a quick note goes a long way',time:'3h',href:'/customers',unread:false},
      {id:7,ic:'training',tone:'purple',t:'Required course due soon',d:'Adverse Action & Privacy — due in 3 days',time:'5h',href:'/training',unread:false}
    ]
  };
  var FEED = FEEDS[role] || FEEDS._default;
  window.ADNotify = { feed: FEED };

  function css(){
    var s = document.createElement('style'); s.id='ad-nt-style';
    s.textContent = [
      '.ad-nt-wrap{position:relative;display:flex;align-items:center;}',
      '.ad-nt-btn{width:40px;height:40px;border-radius:11px;border:1px solid #e7ecf3;background:#fff;display:flex;align-items:center;justify-content:center;color:#3a4a63;position:relative;cursor:pointer;transition:.15s;}',
      '.ad-nt-btn:hover{background:#eff4ff;border-color:#d5e0f5;color:#2563eb;}',
      '.ad-nt-btn svg{width:19px;height:19px;}',
      '.ad-nt-btn.ring{animation:adntRing .6s ease;}@keyframes adntRing{0%,100%{transform:rotate(0)}20%{transform:rotate(-12deg)}40%{transform:rotate(10deg)}60%{transform:rotate(-6deg)}80%{transform:rotate(4deg)}}',
      '.ad-nt-badge{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:9px;background:#ef4444;color:#fff;font:800 10px Inter,sans-serif;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid #fff;}',
      '.ad-nt-badge.hide{display:none;}',
      '.ad-nt-pop{position:absolute;top:calc(100% + 10px);right:0;width:380px;max-width:calc(100vw - 32px);background:#fff;border:1px solid #e7ecf3;border-radius:16px;box-shadow:0 30px 70px -28px rgba(15,27,45,.5);opacity:0;transform:translateY(-8px) scale(.98);pointer-events:none;transition:.18s;z-index:200;overflow:hidden;}',
      '.ad-nt-pop.open{opacity:1;transform:none;pointer-events:auto;}',
      '.ad-nt-h{display:flex;align-items:center;gap:10px;padding:15px 18px;border-bottom:1px solid #eef2f8;}',
      '.ad-nt-h b{font:800 15px Inter,sans-serif;color:#16202e;}',
      '.ad-nt-h .ad-nt-ct{font:700 11px Inter,sans-serif;color:#fff;background:#2563eb;border-radius:999px;padding:2px 8px;}',
      '.ad-nt-h .ad-nt-clear{margin-left:auto;font:700 12px Inter,sans-serif;color:#2563eb;background:none;border:none;cursor:pointer;}',
      '.ad-nt-h .ad-nt-clear:hover{text-decoration:underline;}',
      '.ad-nt-list{max-height:400px;overflow-y:auto;}',
      '.ad-nt-item{display:flex;gap:12px;padding:13px 18px;border-top:1px solid #f2f5fa;cursor:pointer;text-decoration:none;position:relative;transition:.12s;}',
      '.ad-nt-item:first-child{border-top:none;}',
      '.ad-nt-item:hover{background:#f8faff;}',
      '.ad-nt-item.unread{background:#fbfcff;}',
      '.ad-nt-ic{width:36px;height:36px;border-radius:10px;flex:none;display:flex;align-items:center;justify-content:center;}.ad-nt-ic svg{width:18px;height:18px;}',
      '.ad-nt-tx{flex:1;min-width:0;}',
      '.ad-nt-tx b{font:700 13.5px Inter,sans-serif;color:#16202e;display:block;}',
      '.ad-nt-tx span{font:500 12px Inter,sans-serif;color:#6b7a90;display:block;margin-top:2px;line-height:1.4;}',
      '.ad-nt-tx .ad-nt-tm{color:#97a4b6;font-size:11px;margin-top:4px;font-weight:600;}',
      '.ad-nt-dot{width:8px;height:8px;border-radius:50%;background:#2563eb;flex:none;margin-top:6px;}',
      '.ad-nt-item:not(.unread) .ad-nt-dot{visibility:hidden;}',
      '.ad-nt-f{padding:11px 18px;border-top:1px solid #eef2f8;text-align:center;}',
      '.ad-nt-f a{font:700 13px Inter,sans-serif;color:#2563eb;text-decoration:none;}.ad-nt-f a:hover{text-decoration:underline;}',
      '.ad-nt-empty{padding:34px 18px;text-align:center;color:#97a4b6;font:600 13px Inter,sans-serif;}'
    ].join('');
    document.head.appendChild(s);
  }

  function unreadCount(){ return FEED.filter(function(n){return n.unread;}).length; }

  function itemHTML(n){
    var tn = TONE[n.tone]||TONE.blue;
    return '<a class="ad-nt-item'+(n.unread?' unread':'')+'" href="'+n.href+'" data-id="'+n.id+'">'+
      '<span class="ad-nt-ic" style="background:'+tn[0]+';color:'+tn[1]+'"><svg viewBox="0 0 24 24">'+ICONS[n.ic]+'</svg></span>'+
      '<span class="ad-nt-tx"><b>'+n.t+'</b><span>'+n.d+'</span><span class="ad-nt-tm">'+n.time+' ago</span></span>'+
      '<span class="ad-nt-dot"></span></a>';
  }

  var wrap, pop, badge, listEl, ctEl;
  function renderList(){
    listEl.innerHTML = FEED.length ? FEED.map(itemHTML).join('') : '<div class="ad-nt-empty">You\'re all caught up 🎉</div>';
    var u = unreadCount();
    badge.textContent = u; badge.className = 'ad-nt-badge'+(u?'':' hide');
    ctEl.textContent = u+' new';
    // clicking an item marks it read (navigation follows)
    listEl.querySelectorAll('.ad-nt-item').forEach(function(a){
      a.addEventListener('click', function(){ var id=+a.getAttribute('data-id'); var n=FEED.filter(function(x){return x.id===id;})[0]; if(n) n.unread=false; });
    });
  }

  function mount(){
    var bar = document.querySelector('.topbar'); if(!bar) return false;
    if (document.querySelector('.ad-nt-wrap')) return true;
    wrap = document.createElement('div'); wrap.className='ad-nt-wrap';
    wrap.innerHTML =
      '<button class="ad-nt-btn" id="adNtBtn" aria-label="Notifications">'+
        '<svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0-6 6c0 4-2 6-2 6h16s-2-2-2-6a6 6 0 0 0-6-6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>'+
        '<span class="ad-nt-badge" id="adNtBadge">0</span>'+
      '</button>'+
      '<div class="ad-nt-pop" id="adNtPop">'+
        '<div class="ad-nt-h"><b>Notifications</b><span class="ad-nt-ct" id="adNtCt">0 new</span><button class="ad-nt-clear" id="adNtClear">Mark all read</button></div>'+
        '<div class="ad-nt-list" id="adNtList"></div>'+
        '<div class="ad-nt-f"><a href="/notifications">View all notifications →</a></div>'+
      '</div>';
    // remove the static placeholder notification bell so we don't show two (this one is the live one)
    bar.querySelectorAll('.ib[aria-label="Notifications"], .ib[aria-label="Alerts"]').forEach(function(b){ b.remove(); });
    // place before the avatar in the topbar (avatar may be nested in a wrapper, so anchor to its parent)
    var av = bar.querySelector('.tb-avatar');
    if (av && av.parentNode) av.parentNode.insertBefore(wrap, av); else bar.appendChild(wrap);

    pop = document.getElementById('adNtPop');
    badge = document.getElementById('adNtBadge');
    listEl = document.getElementById('adNtList');
    ctEl = document.getElementById('adNtCt');
    renderList();

    var btn = document.getElementById('adNtBtn');
    btn.addEventListener('click', function(e){ e.stopPropagation(); pop.classList.toggle('open'); });
    document.addEventListener('click', function(e){ if(!wrap.contains(e.target)) pop.classList.remove('open'); });
    document.getElementById('adNtClear').addEventListener('click', function(e){ e.stopPropagation(); FEED.forEach(function(n){n.unread=false;}); renderList(); });

    // gentle ring to draw attention on first load if unread
    if (unreadCount()) setTimeout(function(){ btn.classList.add('ring'); setTimeout(function(){btn.classList.remove('ring');},700); }, 900);
    return true;
  }

  function boot(){ css(); if(!mount()){ var tries=0, iv=setInterval(function(){ tries++; if(mount()||tries>20) clearInterval(iv); },150); } }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
