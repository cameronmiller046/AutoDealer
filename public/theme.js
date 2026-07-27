/* AutoDealer — global theme engine (Light / Dark / System).
   One source of truth for appearance across the CRM, Customer Portal, auth, and settings.
   Reads prefers-color-scheme on first visit, persists the user's choice, applies
   data-theme to <html>, and flips the shared design tokens + common surfaces.
   Include with <script src="/theme.js"></script> (roles.js auto-loads it on every app page). */
(function(){
  if (window.__adTheme) return; window.__adTheme = true;
  var KEY = 'ad_theme';                 // 'light' | 'dark' | 'system'
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pref(){ try { return localStorage.getItem(KEY) || 'system'; } catch(e){ return 'system'; } }
  function setPref(v){ try { localStorage.setItem(KEY, v); } catch(e){} }
  function resolved(){ var p = pref(); return p === 'system' ? (mq && mq.matches ? 'dark' : 'light') : p; }

  /* ---- design tokens: dark overrides for the shared CSS variables + common light surfaces ---- */
  var tokenCSS =
    ':root{color-scheme:light;}' +
    'html[data-theme="dark"]{color-scheme:dark;' +
      '--bg:#0b1220!important;--bg2:#0b1220!important;--card:#141f34!important;--text:#e6edf7!important;' +
      '--ink:#e6edf7!important;--ink2:#aebfd4!important;' +
      '--muted:#94a6bf!important;--faint:#6a7c96!important;--line:rgba(255,255,255,0.09)!important;--line2:rgba(255,255,255,0.06)!important;' +
      '--accent-soft:rgba(59,130,246,0.18)!important;--blue-soft:rgba(59,130,246,0.16)!important;--sidebar:#0a1526!important;--sidebar-2:#060d18!important;' +
      '--shadow:0 1px 2px rgba(0,0,0,0.4),0 16px 34px -20px rgba(0,0,0,0.7)!important;' +
      '--shadow-lg:0 40px 90px -40px rgba(0,0,0,0.8)!important;' +
    '}' +
    /* body + generic surfaces that hardcode white */
    'html[data-theme="dark"] body{background:var(--bg);color:var(--text);}' +
    'html[data-theme="dark"] .card,html[data-theme="dark"] .kp,html[data-theme="dark"] .kpi,html[data-theme="dark"] .list,html[data-theme="dark"] .tpl,html[data-theme="dark"] .panel,html[data-theme="dark"] .sect,html[data-theme="dark"] .modal,html[data-theme="dark"] .box,html[data-theme="dark"] .tile,html[data-theme="dark"] .widget,html[data-theme="dark"] .stat,html[data-theme="dark"] .stats-card,html[data-theme="dark"] .icard,html[data-theme="dark"] .fcard,html[data-theme="dark"] .tcard,html[data-theme="dark"] .lbc,html[data-theme="dark"] .camp,html[data-theme="dark"] .qa,html[data-theme="dark"] .web-card,html[data-theme="dark"] .fr-card,html[data-theme="dark"] .cat,html[data-theme="dark"] .news,html[data-theme="dark"] .hours,html[data-theme="dark"] .ent,html[data-theme="dark"] .sec-chip,html[data-theme="dark"] .del,html[data-theme="dark"] .cfg-tier,html[data-theme="dark"] .wk-col,html[data-theme="dark"] .mo-cell,html[data-theme="dark"] .sc,html[data-theme="dark"] .del-card,html[data-theme="dark"] .rc-card{background:var(--card)!important;border-color:var(--line)!important;}' +
    'html[data-theme="dark"] .topbar{background:rgba(11,18,32,0.82)!important;border-bottom-color:var(--line)!important;}' +
    'html[data-theme="dark"] .panel,html[data-theme="dark"] .panel-body{background:var(--bg)!important;}' +
    'html[data-theme="dark"] .panel-hd,html[data-theme="dark"] .modal-hd,html[data-theme="dark"] .card-h,html[data-theme="dark"] .lhead{background:var(--card)!important;border-color:var(--line)!important;}' +
    /* inputs / search */
    'html[data-theme="dark"] input,html[data-theme="dark"] select,html[data-theme="dark"] textarea{background:rgba(255,255,255,0.05)!important;color:var(--text)!important;border-color:var(--line)!important;}' +
    'html[data-theme="dark"] .tsearch,html[data-theme="dark"] .psearch,html[data-theme="dark"] .linkbox input,html[data-theme="dark"] .hsearch{background:rgba(255,255,255,0.05)!important;border-color:var(--line)!important;}' +
    'html[data-theme="dark"] ::placeholder{color:var(--faint)!important;}' +
    /* white "ghost" buttons and hovers */
    'html[data-theme="dark"] .btn-ghost,html[data-theme="dark"] .pbtn,html[data-theme="dark"] .refbtn,html[data-theme="dark"] .rowbtn,html[data-theme="dark"] .pa-ghost,html[data-theme="dark"] .mf-ghost,html[data-theme="dark"] .btn-out,html[data-theme="dark"] .pill,html[data-theme="dark"] .rq-actions button,html[data-theme="dark"] .lb-period{background:rgba(255,255,255,0.05)!important;border-color:var(--line)!important;color:var(--text)!important;}' +
    'html[data-theme="dark"] .erow:hover,html[data-theme="dark"] .ref:hover,html[data-theme="dark"] tr:hover{background:rgba(255,255,255,0.03)!important;}' +
    'html[data-theme="dark"] .lb-period button.on{background:var(--card)!important;}' +
    /* the light rendered "document" surfaces should stay light (paper) — leave .page/.k-page as-is */
    '';

  /* ---- smooth cross-fade on theme change (respects reduced motion) ---- */
  var animCSS = reduce ? '' :
    'html.theme-anim,html.theme-anim body,html.theme-anim .topbar,html.theme-anim .card,html.theme-anim .kp,html.theme-anim .list,html.theme-anim .panel,html.theme-anim .sect,html.theme-anim .modal,html.theme-anim .sidebar,html.theme-anim input,html.theme-anim select,html.theme-anim textarea{transition:background-color .38s ease,border-color .38s ease,color .28s ease!important;}';

  /* ---- theme toggle control ---- */
  var toggleCSS =
    '.ad-theme{display:inline-flex;align-items:center;gap:2px;background:rgba(15,27,45,0.05);border:1px solid rgba(15,27,45,0.1);border-radius:999px;padding:3px;flex:none;box-shadow:0 1px 2px rgba(16,32,60,0.04);}' +
    'html[data-theme="dark"] .ad-theme{background:rgba(255,255,255,0.06)!important;border-color:rgba(255,255,255,0.12)!important;}' +
    '.ad-theme button{border:none;background:none;width:30px;height:28px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;color:var(--muted,#6b7a90);cursor:pointer;}' +
    '.ad-theme button svg{width:16px;height:16px;}' +
    '.ad-theme button.on{background:var(--accent,#2563eb);color:#fff;box-shadow:0 6px 14px -6px rgba(37,99,235,.8);}' +
    '.ad-theme button:hover:not(.on){color:var(--text,#16202e);}' +
    '.ad-theme-float{position:fixed;top:16px;right:16px;z-index:9997;}';

  function ICON(k){
    var p = {
      light:'<circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      dark:'<path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" fill="currentColor"/>',
      system:'<rect x="3" y="4.5" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 20h8M12 16.5V20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
    };
    return '<svg viewBox="0 0 24 24">'+p[k]+'</svg>';
  }

  function apply(animate){
    var t = resolved();
    if (animate && !reduce){ document.documentElement.classList.add('theme-anim'); setTimeout(function(){ document.documentElement.classList.remove('theme-anim'); }, 460); }
    document.documentElement.setAttribute('data-theme', t);
    // reflect active state on any mounted toggles
    document.querySelectorAll('.ad-theme').forEach(function(tg){
      tg.querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-t')===pref()); });
    });
  }

  function buildToggle(){
    var wrap = document.createElement('div'); wrap.className = 'ad-theme'; wrap.setAttribute('role','group'); wrap.setAttribute('aria-label','Appearance');
    [['light','Light'],['dark','Dark'],['system','System']].forEach(function(o){
      var b = document.createElement('button'); b.type='button'; b.setAttribute('data-t',o[0]); b.title=o[1]+' theme'; b.setAttribute('aria-label',o[1]+' theme');
      b.innerHTML = ICON(o[0]);
      b.addEventListener('click', function(){ setPref(o[0]); apply(true); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  function mountToggle(){
    if (document.querySelector('.ad-theme')) return;
    var tb = document.querySelector('.topbar');
    var toggle = buildToggle();
    var av = tb && tb.querySelector('.tb-avatar');
    if (av && av.parentNode){
      av.parentNode.insertBefore(toggle, av);   // sibling of the avatar, whatever its wrapper is
    } else if (tb){
      tb.appendChild(toggle);
    } else {
      toggle.classList.add('ad-theme-float');
      document.body.appendChild(toggle);
    }
    apply(false);
  }

  // inject styles immediately (before paint) to avoid a flash
  var s = document.createElement('style'); s.textContent = tokenCSS + animCSS + toggleCSS; document.head.appendChild(s);
  apply(false); // set data-theme ASAP

  // react to OS theme changes while in "system" mode
  if (mq){ var onSys = function(){ if (pref()==='system') apply(true); }; if (mq.addEventListener) mq.addEventListener('change', onSys); else if (mq.addListener) mq.addListener(onSys); }

  function boot(){ mountToggle(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.ADTheme = { get:pref, resolved:resolved, set:function(v){ setPref(v); apply(true); } };
})();
