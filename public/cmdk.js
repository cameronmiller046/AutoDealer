/* AutoDealer — Universal Search + Command Palette (⌘K / Ctrl-K).
   Global, injected on every page by roles.js (like ai.js / notify.js). Spotlight-style
   overlay: search customers, inventory, pages, settings — and run actions. Also hijacks
   any topbar .tsearch input so the existing search boxes open the palette. */
(function(){
  if (window.__adCmdkMounted) return; window.__adCmdkMounted = true;
  var role = (window.ADRoles && window.ADRoles.getRole && window.ADRoles.getRole()) || 'salesperson';

  var IC = {
    nav:'<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    cust:'<circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" fill="none" stroke="currentColor" stroke-width="1.7"/>',
    car:'<path d="M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v5h-3v-2H6v2H3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    plus:'<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    cal:'<rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" fill="none" stroke="currentColor" stroke-width="1.7"/>',
    text:'<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    phone:'<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    ai:'<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" fill="currentColor"/>',
    rep:'<path d="M4 20V4M20 20H4" fill="none" stroke="currentColor" stroke-width="1.7"/><rect x="7" y="12" width="3" height="5" fill="currentColor"/><rect x="12" y="8" width="3" height="9" fill="currentColor"/><rect x="17" y="5" width="3" height="12" fill="currentColor"/>',
    set:'<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    doc:'<path d="M6 3h8l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 3v4h4" stroke="currentColor" stroke-width="1.5"/>'
  };
  function svg(k){ return '<svg viewBox="0 0 24 24">'+(IC[k]||IC.nav)+'</svg>'; }

  var ACTIONS = [
    {t:'act', g:'Actions', ic:'plus', label:'Create Prospect', hint:'Add a new lead', run:function(){ toast('New prospect created'); }},
    {t:'nav', g:'Actions', ic:'cal', label:'Schedule Appointment', href:'/appointments'},
    {t:'act', g:'Actions', ic:'text', label:'Send a Text', run:function(){ toast('Text composer opened'); }},
    {t:'act', g:'Actions', ic:'phone', label:'Call a Customer', run:function(){ toast('Dialer opened'); }},
    {t:'ai',  g:'Actions', ic:'ai', label:'Launch AutoDealer AI', hint:'Ask anything'},
    {t:'act', g:'Actions', ic:'doc', label:'New Signature Request', run:function(){ location.href='/signing'; }}
  ];
  var ROUTES = [
    ['Home / Dashboard','/dashboard'],['Executive Dashboard','/gm'],['AI Manager','/aimanager'],['Showroom Ops','/showroom'],
    ['Prospects / Leads','/prospects'],['Customers','/customers'],['Appointments','/appointments'],['Tasks','/tasks'],
    ['Deal Desk','/deals'],['Equity Mining','/equity'],['Recovery','/recovery'],['Trade Center','/trades'],['Delivery Center','/delivery'],
    ['Inventory','/inventory'],['Inventory Intelligence','/invintel'],['Communications','/communications'],['Team Chat','/chat'],
    ['Reports','/reports'],['Workflow Analytics','/analytics'],['Marketing Hub','/marketing'],['Dealer TV','/tv'],['Sales Whiteboard','/whiteboard'],
    ['Reputation / Reviews','/reviews'],['AI Sales Coach','/coach'],['Training Center','/training'],['e-Signature / Contracts','/signing'],
    ['Customer Sentiment','/sentiment'],['Service Retention','/service'],['Referral Center','/referrals'],['Customer Portal','/portal'],
    ['Document Center','/documents'],['Automation Builder','/automations'],['Marketplace','/marketplace'],['Data Migration','/migration'],
    ['CRM Health','/health'],['Notifications','/notifications'],['Help & Feedback','/feedback'],['Admin Center','/admin'],['Settings','/settings'],
    ['Finance Dashboard','/finance'],['BDC Dashboard','/bdc'],['Knowledge Center','/knowledge'],['Data Quality Center','/dataquality'],
    ['System Health','/status'],['Developer Platform','/developers'],['Multi-Store Management','/stores'],['Customer Journey','/journey']
  ];
  var CUSTOMERS = [
    ['John Smith','Silverado LT · (555) 200-1180','#3b82f6'],['Sarah Whitfield','2025 Highlander · Deal #D-4471','#db2777'],
    ['Robert Chen','2020 Highlander · service due','#0891b2'],['Jennifer Adams','5★ review · repeat buyer','#8b5cf6'],
    ['The Nguyen Family','Grand Highlander · at desk','#16a34a'],['Jessica Tran','Hot lead · pre-qualified','#dc2626'],
    ['David Okafor','Deal funded · #D-4455','#f59e0b'],['Maria Gonzalez','2★ review · needs reply','#6366f1']
  ];
  var INVENTORY = [
    ['2025 Toyota Highlander Platinum','Stock T-19043 · VIN 5TD…8842','#334155'],
    ['2025 4Runner TRD Pro','Stock T-19110 · 5 days','#334155'],
    ['2024 Camry XSE','Stock T-18820 · 71 days · reprice','#b7791f'],
    ['2022 Tacoma TRD (Used)','Stock U-4390 · 94 days · wholesale','#dc2626'],
    ['2025 Grand Highlander','Stock T-19088 · 12 days','#334155']
  ];

  function css(){ var s=document.createElement('style'); s.id='ad-ck-style'; s.textContent=[
    '.ad-ck-scrim{position:fixed;inset:0;background:rgba(10,20,36,.5);backdrop-filter:blur(3px);z-index:9995;opacity:0;pointer-events:none;transition:opacity .15s;}',
    '.ad-ck-scrim.open{opacity:1;pointer-events:auto;}',
    '.ad-ck{position:fixed;left:50%;top:14vh;transform:translateX(-50%) scale(.98);width:min(640px,94vw);background:#fff;border:1px solid #e7ecf3;border-radius:16px;box-shadow:0 40px 90px -30px rgba(15,27,45,.6);z-index:9996;opacity:0;pointer-events:none;transition:.16s;overflow:hidden;font-family:Inter,system-ui,sans-serif;}',
    '.ad-ck.open{opacity:1;pointer-events:auto;transform:translateX(-50%) scale(1);}',
    '.ad-ck-in{display:flex;align-items:center;gap:12px;padding:15px 18px;border-bottom:1px solid #eef2f8;}',
    '.ad-ck-in svg{width:19px;height:19px;color:#97a4b6;flex:none;}',
    '.ad-ck-in input{flex:1;border:none;outline:none;font:inherit;font-size:16px;color:#16202e;background:none;}',
    '.ad-ck-in input::placeholder{color:#97a4b6;}',
    '.ad-ck-esc{font-size:10.5px;font-weight:700;color:#97a4b6;border:1px solid #e7ecf3;border-radius:6px;padding:3px 7px;flex:none;}',
    '.ad-ck-res{max-height:52vh;overflow-y:auto;padding:8px;}',
    '.ad-ck-g{font-size:10.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#97a4b6;padding:10px 12px 6px;}',
    '.ad-ck-row{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;cursor:pointer;}',
    '.ad-ck-row.sel{background:#eef4ff;}',
    '.ad-ck-ic{width:32px;height:32px;border-radius:9px;flex:none;display:flex;align-items:center;justify-content:center;background:#f1f4f9;color:#4a5a70;}.ad-ck-ic svg{width:17px;height:17px;}',
    '.ad-ck-row.sel .ad-ck-ic{background:#dbe8ff;color:#2563eb;}',
    '.ad-ck-av{width:32px;height:32px;border-radius:50%;flex:none;color:#fff;font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;}',
    '.ad-ck-tx{flex:1;min-width:0;}.ad-ck-tx b{font-size:14px;font-weight:600;color:#16202e;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.ad-ck-tx span{font-size:12px;color:#6b7a90;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.ad-ck-en{font-size:11px;color:#c3ccd8;flex:none;}.ad-ck-row.sel .ad-ck-en{color:#2563eb;}',
    '.ad-ck-empty{padding:34px 18px;text-align:center;color:#97a4b6;font-size:13.5px;}',
    '.ad-ck-foot{display:flex;align-items:center;gap:14px;padding:9px 16px;border-top:1px solid #eef2f8;font-size:11px;color:#97a4b6;}',
    '.ad-ck-foot b{font-weight:700;color:#6b7a90;background:#f1f4f9;border-radius:5px;padding:2px 6px;font-size:10.5px;}',
    '.ad-ck-foot .sp{margin-left:auto;}'
  ].join(''); document.head.appendChild(s); }

  var scrim, box, input, res, items=[], sel=0;

  function build(){
    css();
    scrim=document.createElement('div'); scrim.className='ad-ck-scrim';
    box=document.createElement('div'); box.className='ad-ck';
    box.innerHTML=''+
      '<div class="ad-ck-in">'+svg('nav').replace(IC.nav,'<circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M14 14l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>')+
        '<input id="adCkInput" placeholder="Search customers, inventory, pages — or type a command…" autocomplete="off" spellcheck="false" />'+
        '<span class="ad-ck-esc">ESC</span></div>'+
      '<div class="ad-ck-res" id="adCkRes"></div>'+
      '<div class="ad-ck-foot"><b>↑↓</b> navigate <b>↵</b> select <span class="sp"></span><b>⌘K</b> anytime</div>';
    document.body.appendChild(scrim); document.body.appendChild(box);
    input=document.getElementById('adCkInput'); res=document.getElementById('adCkRes');
    scrim.addEventListener('click', close);
    input.addEventListener('input', function(){ sel=0; render(); });
    input.addEventListener('keydown', onKey);
  }

  function fuzzy(q,s){ q=q.toLowerCase(); s=s.toLowerCase(); var qi=0; for(var i=0;i<s.length&&qi<q.length;i++){ if(s[i]===q[qi]) qi++; } return qi===q.length; }

  function collect(q){
    var out=[];
    function add(list){ list.forEach(function(it){ if(!q || fuzzy(q,it.label)||(it.sub&&fuzzy(q,it.sub))) out.push(it); }); }
    // actions always first (filtered)
    add(ACTIONS);
    add(CUSTOMERS.map(function(c){ return {t:'nav',g:'Customers',label:c[0],sub:c[1],color:c[2],av:true,href:'/customer'}; }));
    add(INVENTORY.map(function(v){ return {t:'nav',g:'Inventory',ic:'car',label:v[0],sub:v[1],href:'/inventory'}; }));
    add(ROUTES.map(function(r){ return {t:'nav',g:'Navigate',ic:'nav',label:r[0],sub:r[1],href:r[1]}; }));
    return out;
  }

  function render(){
    var q=input.value.trim();
    items=collect(q);
    if(!items.length){ res.innerHTML='<div class="ad-ck-empty">No results for “'+q+'”</div>'; return; }
    var html='', lastG=null;
    items.forEach(function(it,i){
      if(it.g!==lastG){ html+='<div class="ad-ck-g">'+it.g+'</div>'; lastG=it.g; }
      var icon = it.av ? '<span class="ad-ck-av" style="background:'+it.color+'">'+it.label.split(' ').map(function(x){return x[0];}).slice(0,2).join('').toUpperCase()+'</span>'
                       : '<span class="ad-ck-ic">'+svg(it.ic||'nav')+'</span>';
      html+='<div class="ad-ck-row'+(i===sel?' sel':'')+'" data-i="'+i+'">'+icon+
        '<div class="ad-ck-tx"><b>'+it.label+'</b>'+(it.sub||it.hint?('<span>'+(it.sub||it.hint)+'</span>'):'')+'</div>'+
        '<span class="ad-ck-en">'+(it.t==='nav'?'Open':it.t==='ai'?'Launch':'Run')+' ↵</span></div>';
    });
    res.innerHTML=html;
    res.querySelectorAll('.ad-ck-row').forEach(function(r){ r.addEventListener('click', function(){ sel=+r.getAttribute('data-i'); choose(); }); r.addEventListener('mousemove', function(){ if(sel!==+r.getAttribute('data-i')){ sel=+r.getAttribute('data-i'); paint(); } }); });
  }
  function paint(){ res.querySelectorAll('.ad-ck-row').forEach(function(r){ r.classList.toggle('sel', +r.getAttribute('data-i')===sel); }); var el=res.querySelector('.ad-ck-row.sel'); if(el) el.scrollIntoView({block:'nearest'}); }

  function onKey(e){
    if(e.key==='ArrowDown'){ e.preventDefault(); sel=Math.min(items.length-1,sel+1); paint(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); sel=Math.max(0,sel-1); paint(); }
    else if(e.key==='Enter'){ e.preventDefault(); choose(); }
    else if(e.key==='Escape'){ e.preventDefault(); close(); }
  }
  function choose(){ var it=items[sel]; if(!it) return; close();
    if(it.t==='ai'){ if(window.ADAI&&window.ADAI.open) window.ADAI.open(); else toast('AI assistant'); return; }
    if(it.t==='nav' && it.href){ location.href=it.href; return; }
    if(it.t==='act' && it.run){ it.run(); return; }
  }

  function open(){ if(!scrim) build(); scrim.classList.add('open'); box.classList.add('open'); input.value=''; sel=0; render(); setTimeout(function(){ input.focus(); },30); }
  function close(){ if(!box) return; scrim.classList.remove('open'); box.classList.remove('open'); }

  // global hotkey
  document.addEventListener('keydown', function(e){
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); (box&&box.classList.contains('open'))?close():open(); }
  });
  // hijack existing topbar search inputs to open the palette
  function wireSearch(){ document.querySelectorAll('.tsearch input, .ad-nt-wrap ~ *').forEach(function(){}); document.querySelectorAll('.tsearch input').forEach(function(inp){ if(inp.dataset.ck) return; inp.dataset.ck='1'; inp.setAttribute('readonly','readonly'); inp.style.cursor='pointer'; inp.addEventListener('focus', open); inp.addEventListener('click', open); }); }

  var toastEl;
  function toast(msg){ if(!toastEl){ toastEl=document.createElement('div'); toastEl.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(16px);background:#0f1b2d;color:#fff;padding:11px 18px;border-radius:11px;font:600 13px Inter,sans-serif;box-shadow:0 20px 40px -16px rgba(0,0,0,.5);opacity:0;transition:.25s;z-index:9999;'; document.body.appendChild(toastEl); } toastEl.textContent=msg; toastEl.style.opacity='1'; toastEl.style.transform='translateX(-50%) translateY(0)'; clearTimeout(toastEl._t); toastEl._t=setTimeout(function(){ toastEl.style.opacity='0'; toastEl.style.transform='translateX(-50%) translateY(16px)'; },2000); }

  window.ADCmdK = { open:open, close:close };
  function boot(){ build(); wireSearch(); setTimeout(wireSearch, 400); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
