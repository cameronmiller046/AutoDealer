/* AutoDealer — shared marketing site header.
   Single source of truth for the top nav across every marketing page.
   Injects a sticky, dark, glass-on-scroll header (matches the homepage) at the
   top of <body>, highlights the active page, and provides a mobile menu.
   Include on any page with: <script src="/sitenav.js"></script> (place right after <body>). */
(function(){
  if (window.__adSiteNav) return; window.__adSiteNav = true;

  var css = document.createElement('style');
  css.textContent = [
    '.sn-nav{position:sticky;top:0;z-index:100;background:#060d1a;border-bottom:1px solid transparent;transition:background .3s ease,box-shadow .3s ease,border-color .3s ease;}',
    '.sn-nav.sn-scrolled{background:rgba(6,13,26,.82);backdrop-filter:saturate(1.5) blur(16px);-webkit-backdrop-filter:saturate(1.5) blur(16px);border-bottom-color:rgba(255,255,255,.08);box-shadow:0 10px 34px -18px rgba(0,0,0,.7);}',
    '.sn-in{width:100%;max-width:1320px;margin:0 auto;padding:20px 40px;display:flex;align-items:center;gap:40px;}',
    '.sn-wm{font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:24px;font-weight:900;letter-spacing:.5px;color:#fff;line-height:1;text-decoration:none;}',
    '.sn-wm b{color:#2b8fff;}',
    '.sn-wm .sn-sw{display:block;width:96px;height:8px;margin-bottom:3px;}',
    '.sn-links{display:flex;align-items:center;gap:30px;margin:0 auto;}',
    '.sn-links a{color:#cdd9ec;font-size:15px;font-weight:500;text-decoration:none;padding:4px 0;transition:color .18s ease;}',
    '.sn-links a:hover{color:#fff;}',
    '.sn-links a.sn-on{color:#fff;}',
    '.sn-right{display:flex;align-items:center;gap:22px;}',
    '.sn-login{color:#eaf1fb;font-size:15px;font-weight:600;text-decoration:none;}',
    '.sn-login:hover{color:#fff;}',
    '.sn-btn{background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;border:none;border-radius:10px;padding:13px 24px;font-size:15px;font-weight:700;text-decoration:none;box-shadow:0 12px 30px -12px rgba(37,99,235,.85);transition:transform .18s ease,filter .18s ease;display:inline-block;}',
    '.sn-btn:hover{filter:brightness(1.07);transform:translateY(-2px);}',
    '.sn-ham{display:none;margin-left:auto;background:none;border:1px solid rgba(255,255,255,.22);border-radius:9px;padding:9px 10px;color:#fff;cursor:pointer;line-height:0;}',
    '@media(max-width:1024px){.sn-links{display:none;}.sn-right{display:none;}.sn-ham{display:inline-flex;}.sn-in{padding:16px 22px;}}',
    '.sn-mob{display:none;flex-direction:column;background:rgba(6,13,26,.98);border-bottom:1px solid rgba(255,255,255,.08);padding:6px 22px 20px;}',
    '.sn-mob.sn-open{display:flex;}',
    '.sn-mob a{color:#cdd9ec;font-size:16px;font-weight:600;text-decoration:none;padding:13px 4px;border-bottom:1px solid rgba(255,255,255,.06);}',
    '.sn-mob a.sn-on{color:#6ea8ff;}',
    '.sn-mrow{display:flex;gap:12px;margin-top:16px;}',
    '.sn-mrow a{flex:1;text-align:center;border-radius:10px;padding:13px;border-bottom:none;}',
    '.sn-mrow .sn-login{border:1px solid rgba(255,255,255,.2);color:#fff;}',
    '.sn-mrow .sn-btn{color:#fff;}'
  ].join('');
  document.head.appendChild(css);

  var LINKS = [
    ['/features','Features'],['/solutions','Solutions'],['/pricing','Pricing'],
    ['/resources','Resources'],['/about','About'],['/contact','Contact']
  ];
  var path = (location.pathname.replace(/\/+$/,'') || '/');
  function on(href){ return href === path ? ' class="sn-on"' : ''; }
  function links(){ return LINKS.map(function(l){ return '<a href="'+l[0]+'"'+on(l[0])+'>'+l[1]+'</a>'; }).join(''); }

  var wm = '<a class="sn-wm" href="/"><svg class="sn-sw" viewBox="0 0 96 8"><path d="M2 6 C24 1, 72 1, 94 5" fill="none" stroke="#2b8fff" stroke-width="2.2" stroke-linecap="round"/></svg>AUTO<b>DEALER</b></a>';

  var nav = document.createElement('nav');
  nav.className = 'sn-nav';
  nav.setAttribute('id','snNav');
  nav.innerHTML =
    '<div class="sn-in">' + wm +
      '<div class="sn-links">' + links() + '</div>' +
      '<div class="sn-right"><a class="sn-login" href="/login">Log In</a><a class="sn-btn" href="/demo">Request Demo</a></div>' +
      '<button class="sn-ham" id="snHam" aria-label="Open menu"><svg width="20" height="14" viewBox="0 0 20 14"><path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" stroke-width="2"/></svg></button>' +
    '</div>' +
    '<div class="sn-mob" id="snMob">' + links() +
      '<div class="sn-mrow"><a class="sn-login" href="/login">Log In</a><a class="sn-btn" href="/demo">Request Demo</a></div>' +
    '</div>';

  function mount(){
    document.body.insertBefore(nav, document.body.firstChild);
    var onScroll = function(){ nav.classList.toggle('sn-scrolled', window.scrollY > 12); };
    window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
    var ham = document.getElementById('snHam'), mob = document.getElementById('snMob');
    if (ham) ham.addEventListener('click', function(){ mob.classList.toggle('sn-open'); });
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
