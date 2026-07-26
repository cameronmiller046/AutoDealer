/* AutoDealer CRM — Role-Based Workspace engine (config-driven RBAC).
   One config object drives navigation, identity, route guards and the demo "View As" switcher.
   Add a future role by adding one entry to ROLES — no per-page conditionals. */
(function () {
  var IC = {
    home:'<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    prospects:'<circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="17.5" cy="9" r="2.3" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    customers:'<circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    appt:'<rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    tasks:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 12.5l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    inventory:'<path d="M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v5h-3v-2H6v2H3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    comms:'<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    reports:'<path d="M4 20V4M20 20H4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="12" width="3" height="5" fill="currentColor"/><rect x="12" y="8" width="3" height="9" fill="currentColor"/><rect x="17" y="5" width="3" height="12" fill="currentColor"/>',
    team:'<circle cx="7" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M2.5 18c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4M12.5 18c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    admin:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="11" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 13v2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    checkin:'<rect x="5" y="4" width="14" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 4h6v2.5H9zM8.5 13l2 2 4-4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    deals:'<path d="M4 7h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 7V5.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V7M4 12h16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
    settings:'<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M18.5 5.5l-2 2M7.5 16.5l-2 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    phone:'<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    eye:'<path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" stroke-width="1.7"/>'
  };
  function svg(k){ return '<svg viewBox="0 0 24 24">'+(IC[k]||'')+'</svg>'; }

  /* ---- Role configuration: the single source of truth ---- */
  var ROLES = {
    salesperson: {
      name:'Cameron Miller', title:'Sales Representative', avatar:'CM', home:'/dashboard',
      nav:[
        {label:'Home', href:'/dashboard', icon:'home'},
        {label:'Prospects', href:'/prospects', icon:'prospects', badge:'18'},
        {label:'Customers', href:'/customers', icon:'customers'},
        {label:'Appointments', href:'/appointments', icon:'appt', badge:'5'},
        {label:'Tasks', href:'/tasks', icon:'tasks', badge:'7'},
        {label:'Deal Desk', href:'/deals', icon:'deals', badge:'4'},
        {label:'Inventory', href:'/inventory', icon:'inventory', tag:'Read-only'},
        {label:'Communications', href:'/communications', icon:'comms', badge:'3'},
        {label:'Reports', href:'/reports', icon:'reports'},
        {label:'Settings', href:'#', icon:'settings'}
      ]
    },
    manager: {
      name:'Dana Morales', title:'Sales Manager', avatar:'DM', home:'/manager',
      nav:[
        {label:'Dashboard', href:'/manager', icon:'home'},
        {label:'Prospects', href:'/prospects', icon:'prospects', badge:'64'},
        {label:'Customers', href:'/customers', icon:'customers'},
        {label:'Appointments', href:'/appointments', icon:'appt', badge:'23'},
        {label:'Deal Desk', href:'/deals', icon:'deals', badge:'3'},
        {label:'Tasks', href:'/tasks', icon:'tasks'},
        {label:'Inventory', href:'/inventory', icon:'inventory'},
        {label:'Communications', href:'/communications', icon:'comms'},
        {label:'Reports', href:'/reports', icon:'reports'},
        {label:'Sales Team', href:'/team', icon:'team', badge:'6'},
        {label:'CRM Administration', href:'/admin', icon:'admin'},
        {label:'Settings', href:'#', icon:'settings'}
      ]
    },
    receptionist: {
      name:'Riley Brooks', title:'Receptionist', avatar:'RB', home:'/reception',
      nav:[
        {label:'Home', href:'/reception', icon:'home'},
        {label:'Appointments', href:'/appointments', icon:'appt', badge:'12'},
        {label:'Customers', href:'/customers', icon:'customers'},
        {label:'Communications', href:'/communications', icon:'comms', badge:'4'},
        {label:'Inventory Lookup', href:'/inventory', icon:'inventory'},
        {label:'Visitor Check-In', href:'/checkin', icon:'checkin', badge:'2'},
        {label:'Settings', href:'#', icon:'settings'}
      ]
    }
  };
  /* Future roles plug in here with zero architectural change: */
  var COMING = ['bdc','finance','service','gm','marketing','admin'];
  var ROLE_MENU = [
    ['salesperson','Salesperson','Focused selling workspace', true],
    ['manager','Sales Manager','Team coaching & performance', true],
    ['receptionist','Receptionist','Front-desk & check-in', true],
    ['bdc','BDC Agent','Lead handling', false],
    ['finance','Finance Manager','F&I & penetration', false],
    ['gm','General Manager','Executive overview', false]
  ];

  /* Every known in-app route. Anything here that is NOT in the active role's nav is blocked. */
  var KNOWN = ['/dashboard','/manager','/reception','/prospects','/customers','/appointments','/tasks','/inventory','/communications','/reports','/team','/admin','/checkin','/deals'];

  function getRole(){ var r = localStorage.getItem('ad_role'); return ROLES[r] ? r : 'salesperson'; }
  function cfg(){ return ROLES[getRole()]; }
  function setRole(r){ if(!ROLES[r]){ toast('That workspace is coming soon'); return; } localStorage.setItem('ad_role', r); location.href = ROLES[r].home; }
  function allowed(role){ var s={}; ROLES[role].nav.forEach(function(n){ if(n.href!=='#') s[n.href]=1; }); return s; }
  function path(){ return (location.pathname.replace(/\/$/,'')||'/'); }

  /* RBAC guard — blocks restricted routes even via direct URL. */
  function guard(){
    var role=getRole(), p=path();
    if (KNOWN.indexOf(p) !== -1 && !allowed(role)[p]) { location.replace(ROLES[role].home); return false; }
    return true;
  }

  function renderNav(){
    var nav=document.querySelector('.nav'); if(!nav) return;
    var r=cfg(), p=path();
    nav.innerHTML = r.nav.map(function(n){
      var on = n.href!=='#' && p===n.href;
      var right = n.badge ? '<span class="nb">'+n.badge+'</span>' : (n.tag ? '<span class="ro-tag">'+n.tag+'</span>' : '');
      return '<a class="'+(on?'on':'')+'" href="'+n.href+'">'+svg(n.icon)+n.label+right+'</a>';
    }).join('');
    var su=document.querySelector('.side-user');
    if(su){ var av=su.querySelector('.av'), b=su.querySelector('.meta b'), s=su.querySelector('.meta span');
      if(av) av.textContent=r.avatar; if(b) b.textContent=r.name; if(s) s.textContent=r.title; }
    document.body.setAttribute('data-role', getRole());
  }

  function mountViewAs(){
    var sb=document.querySelector('.sidebar'); if(!sb || document.getElementById('vaWrap')) return;
    var su=document.querySelector('.side-user');
    var wrap=document.createElement('div'); wrap.className='va-wrap'; wrap.id='vaWrap';
    wrap.innerHTML =
      '<button class="va-btn" id="vaBtn">'+svg('eye')+'<span>View As</span><b id="vaCur">'+cfg().title+'</b>'+
        '<svg class="va-chev" viewBox="0 0 12 8"><path d="M1 5l5-4 5 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'+
      '<div class="va-menu" id="vaMenu"><div class="va-h">Demo · Switch workspace</div>'+
        ROLE_MENU.map(function(m){ var active=m[0]===getRole();
          return '<button class="va-opt'+(active?' on':'')+(m[3]?'':' soon')+'" data-r="'+m[0]+'"><b>'+m[1]+(m[3]?'':' <span class="soon-t">soon</span>')+'</b><span>'+m[2]+'</span></button>'; }).join('')+
      '</div>';
    if(su) sb.insertBefore(wrap, su); else sb.appendChild(wrap);
    var menu=document.getElementById('vaMenu');
    document.getElementById('vaBtn').addEventListener('click', function(e){ e.stopPropagation(); menu.classList.toggle('open'); });
    document.addEventListener('click', function(){ menu.classList.remove('open'); });
    menu.querySelectorAll('.va-opt').forEach(function(b){ b.addEventListener('click', function(){ setRole(b.getAttribute('data-r')); }); });
  }

  function injectCSS(){
    var css =
    '.nav a .ro-tag{margin-left:auto;font-size:8.5px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:#8aa0bd;background:rgba(255,255,255,.09);padding:2px 6px;border-radius:5px;}'+
    '.va-wrap{position:relative;margin-top:auto;padding:6px 2px 10px;}'+
    '.va-btn{width:100%;display:flex;align-items:center;gap:9px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);color:#c7d4e6;border-radius:12px;padding:9px 12px;font:inherit;font-size:12.5px;cursor:pointer;}'+
    '.va-btn:hover{background:rgba(255,255,255,.09);}'+
    '.va-btn svg{width:16px;height:16px;flex:none;color:#7fa8e6;}.va-btn span{color:#8aa0bd;}.va-btn b{color:#fff;font-weight:600;margin-left:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'+
    '.va-btn .va-chev{margin-left:auto;width:11px;height:11px;color:#7e90a8;}'+
    '.va-menu{position:absolute;left:2px;right:2px;bottom:calc(100% + 6px);background:#0e1c33;border:1px solid rgba(255,255,255,.12);border-radius:13px;box-shadow:0 20px 50px -20px rgba(0,0,0,.7);padding:6px;display:none;z-index:60;}'+
    '.va-menu.open{display:block;animation:vaIn .16s ease;}@keyframes vaIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'+
    '.va-h{font-size:10px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:#6f83a0;padding:8px 10px 6px;}'+
    '.va-opt{width:100%;text-align:left;background:none;border:none;border-radius:9px;padding:9px 11px;cursor:pointer;color:#c7d4e6;}'+
    '.va-opt:hover{background:rgba(255,255,255,.07);}.va-opt.on{background:rgba(37,99,235,.22);}'+
    '.va-opt b{display:block;font-size:13px;font-weight:600;color:#fff;}.va-opt span{font-size:11px;color:#8aa0bd;}'+
    '.va-opt.soon{opacity:.55;}.va-opt .soon-t{font-size:8.5px;font-weight:800;letter-spacing:.3px;text-transform:uppercase;color:#8aa0bd;background:rgba(255,255,255,.1);padding:1px 5px;border-radius:4px;vertical-align:1px;}'+
    /* read-only role gating on shared pages */
    'body[data-role="salesperson"] .add-btn, body[data-role="receptionist"] .add-btn{display:none!important;}'+
    'body[data-role="receptionist"] .vhb[data-hover="tag"], body[data-role="salesperson"] .vhb[data-hover="tag"]{display:none;}';
    var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  }

  var toastEl;
  function toast(msg){
    if(!toastEl){ toastEl=document.createElement('div'); toastEl.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#0f1b2d;color:#fff;padding:12px 20px;border-radius:12px;font:600 13px Inter,sans-serif;box-shadow:0 20px 40px -16px rgba(0,0,0,.5);opacity:0;transition:all .3s;z-index:9999;'; document.body.appendChild(toastEl); }
    toastEl.textContent=msg; toastEl.style.opacity='1'; toastEl.style.transform='translateX(-50%) translateY(0)';
    clearTimeout(toastEl._t); toastEl._t=setTimeout(function(){ toastEl.style.opacity='0'; toastEl.style.transform='translateX(-50%) translateY(20px)'; }, 2200);
  }

  window.ADRoles = { getRole:getRole, setRole:setRole, cfg:cfg, ROLES:ROLES };

  function applyQueryRole(){
    var m = location.search.match(/[?&]as=([a-z]+)/i);
    if (m && ROLES[m[1]]) { localStorage.setItem('ad_role', m[1]);
      try { history.replaceState(null, '', location.pathname); } catch(e){} }
  }
  function init(){ applyQueryRole(); if(!guard()) return; injectCSS(); renderNav(); mountViewAs(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
