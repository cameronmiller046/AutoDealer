/* AutoDealer — VehicleImage: premium vehicle-image / placeholder system.
   Renders uploaded dealership photos when present; otherwise a premium, body-style
   vehicle silhouette with a subtle "Photos coming soon" overlay (never a broken image
   or "?"). Role-gated Upload Photos, instant fade-in on upload, gallery + hover cycling,
   skeleton loading, missing-image fallback, and full light/dark support.
   Reusable across the CRM and Customer Portal.
     VehicleImage.render(vehicle, opts) -> HTML string   (opts: {uploadable, big})
     VehicleImage.wire(scopeEl, { onUpload:(id, dataUrls)=>{} })
   A vehicle "has photos" when vehicle.images is a non-empty array of URLs/data-URIs. */
(function(){
  if (window.VehicleImage) return;

  /* ---- theme-aware styles (injected once) ---- */
  var css = document.createElement('style'); css.id = 'ad-vi-style';
  css.textContent = [
    ':root{--vi-bg1:#eef2f8;--vi-bg2:#dde5f0;--vi-fill:#aeb9c9;--vi-glass:#cdd7e5;--vi-wheel:#2b3444;--vi-hub:#c9d3e0;--vi-pill:rgba(255,255,255,.82);--vi-pilltext:#516074;--vi-pillbr:rgba(15,27,45,.10);}',
    'html[data-theme="dark"]{--vi-bg1:#172138;--vi-bg2:#0e1830;--vi-fill:#3c4a64;--vi-glass:#4a5b7a;--vi-wheel:#0a1120;--vi-hub:#4a5b7a;--vi-pill:rgba(20,31,52,.72);--vi-pilltext:#aebfd4;--vi-pillbr:rgba(255,255,255,.12);}',
    '.vi{position:absolute;inset:0;overflow:hidden;}',
    '.vi-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(130% 120% at 50% -10%,var(--vi-bg1),var(--vi-bg2));}',
    '.vi-sil{width:78%;max-width:340px;height:auto;filter:drop-shadow(0 10px 16px rgba(15,27,45,.12));}',
    '.vi-sil .body{fill:var(--vi-fill);} .vi-sil .glass{fill:var(--vi-glass);}',
    '.vi-wheel{fill:var(--vi-wheel);} .vi-hub{fill:var(--vi-hub);}',
    '.vi-cap{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:inline-flex;align-items:center;gap:6px;background:var(--vi-pill);color:var(--vi-pilltext);border:1px solid var(--vi-pillbr);border-radius:999px;padding:5px 12px;font:700 11.5px Inter,system-ui,sans-serif;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);white-space:nowrap;}',
    '.vi-cap svg{width:13px;height:13px;}',
    '.vi-up{position:absolute;top:12px;right:12px;display:inline-flex;align-items:center;gap:6px;background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;border:none;border-radius:9px;padding:7px 12px;font:700 12px Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 20px -8px rgba(37,99,235,.85);z-index:4;}',
    '.vi-up:hover{filter:brightness(1.06);} .vi-up svg{width:14px;height:14px;}',
    '.vi.big .vi-up{top:16px;right:16px;padding:9px 14px;font-size:13px;}',
    '.vi-photos{position:absolute;inset:0;background:var(--vi-bg2);}',
    '.vi-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .45s ease;}',
    '.vi-img.on{opacity:1;}',
    '.vi-count{position:absolute;bottom:10px;right:10px;background:rgba(9,16,28,.72);color:#fff;font:700 11px Inter,system-ui,sans-serif;padding:3px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:5px;z-index:3;}',
    '.vi-count svg{width:12px;height:12px;}',
    '.vi-dots{position:absolute;bottom:11px;left:50%;transform:translateX(-50%);display:flex;gap:5px;z-index:3;}',
    '.vi-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.5);} .vi-dots i.on{background:#fff;width:16px;border-radius:3px;}',
    '.vi-skel{position:absolute;inset:0;background:linear-gradient(100deg,var(--vi-bg2) 30%,var(--vi-bg1) 50%,var(--vi-bg2) 70%);background-size:200% 100%;animation:viSkel 1.15s infinite linear;}',
    '@keyframes viSkel{to{background-position:-200% 0;}}'
  ].join('');
  (document.head||document.documentElement).appendChild(css);

  /* ---- body-style silhouettes (viewBox 0 0 162 52, wheels @ x46/x122) ---- */
  var BODY = {
    truck:'M12 40 L12 31 C12 29 14 28 18 27 L32 17 C35 14 39 13 46 13 L74 13 L79 27 L150 27 L150 40 Z',
    suv:'M12 40 L12 32 C12 30 14 29 18 28 L32 16 C35 13 40 12 48 12 L112 12 C122 12 128 14 134 21 L147 29 C152 31 152 38 150 40 Z',
    sedan:'M10 40 C10 34 14 33 20 32 L40 21 C46 17 60 16 80 16 C102 16 122 20 134 27 L147 31 C153 33 153 39 150 40 Z',
    coupe:'M10 40 C10 34 14 33 22 32 L42 22 C52 15 66 14 86 15 C112 16 134 24 148 31 C153 33 153 39 150 40 Z',
    convertible:'M10 40 C10 35 14 34 22 33 L44 28 C58 25 92 25 122 28 L148 33 C153 35 153 39 150 40 Z',
    wagon:'M10 40 C10 34 14 33 20 32 L40 21 C46 17 60 16 82 16 L130 16 C139 16 145 18 149 25 L150 40 Z',
    hatchback:'M12 40 C12 34 16 33 22 32 L40 21 C46 17 58 16 76 16 C100 16 118 20 129 27 L133 40 Z',
    minivan:'M10 40 L10 30 C10 27 12 26 16 25 L34 15 C38 12 44 11 54 11 L128 11 C138 11 145 13 149 21 L150 40 Z',
    commercial:'M10 40 L10 26 C10 24 12 23 16 23 L34 15 C36 13 39 12 44 12 L58 12 L60 23 L150 23 L150 40 Z'
  };
  BODY.van = BODY.minivan; BODY.generic = BODY.sedan; BODY.ev = null; /* ev resolved to underlying body */
  var WIN = {
    truck:'M40 26 L48 18 L70 18 L73 26 Z',
    suv:'M40 26 L50 16 L108 16 L124 26 Z',
    sedan:'M46 30 L58 20 L104 21 L120 29 Z',
    coupe:'M50 30 L64 20 L98 20 L124 30 Z',
    convertible:'M52 32 L60 22 L72 22 L74 32 Z',
    wagon:'M46 30 L58 20 L126 20 L132 30 Z',
    hatchback:'M46 30 L56 20 L110 21 L123 29 Z',
    minivan:'M40 24 L50 14 L120 14 L134 24 Z',
    commercial:'M40 22 L46 15 L56 15 L57 22 Z'
  };
  WIN.van = WIN.minivan; WIN.generic = WIN.sedan;

  function detect(v){
    v = v || {};
    var s = String(v.body||'').toLowerCase();
    var m = ((v.make||'')+' '+(v.model||'')+' '+(v.trim||'')).toLowerCase();
    var all = s+' '+m;
    var ev = !!v.ev || /\belectric\b|\bev\b|e-tron|mach-e|lightning|\bbolt\b|ioniq|model [3sxy]|lyriq|\bleaf\b|id\.|rivian|lucid|solterra|bz4x|recharge|polestar|cybertruck/.test(all);
    var body;
    if(/minivan|sienna|odyssey|pacifica|carnival|sedona|quest/.test(all)) body='minivan';
    else if(/box truck|cutaway|f-[45]50|\bnpr\b|\bnqr\b/.test(all)) body='commercial';
    else if(/\bvan\b|transit|promaster|express|savana|sprinter/.test(all)) body='van';
    else if(s==='truck'||/silverado|sierra|f-150|f-250|f-350|\bram\b|tacoma|tundra|colorado|canyon|ranger|frontier|titan|gladiator|ridgeline|maverick|santa cruz|cybertruck/.test(all)) body='truck';
    else if(/convertible|cabriolet|spyder|roadster|miata|boxster|\bz4\b/.test(all)) body='convertible';
    else if(/coupe|corvette|mustang(?! mach)|camaro|supra|gr86|\bbrz\b|challenger|\b911\b|\bgt\b|\bnsx\b|\brc\b|\blc\b/.test(all)) body='coupe';
    else if(/wagon|outback|allroad|cross country/.test(all)) body='wagon';
    else if(/hatchback|\bgolf\b|veloster|\bgti\b|\bgr corolla\b|integra/.test(all)) body='hatchback';
    else if(s==='suv'||/\bsuv\b|tahoe|suburban|explorer|highlander|pilot|4runner|wrangler|bronco|rav4|cr-v|equinox|traverse|expedition|escalade|blazer|grand cherokee|telluride|palisade|mach-e|model [xy]|x[357]|q[3578]|gl[cebs]|gx|lx|nx|rx/.test(all)) body='suv';
    else if(s==='sedan') body='sedan';
    else body='generic';
    return { body:body, ev:ev };
  }

  function ic(k){ var p = k==='cam'?'<rect x="3" y="7" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 7l1.2-2h4.6l1.2 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'
    : k==='up'?'<path d="M12 15V4M8 8l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'
    : k==='img'?'<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8.5" cy="10" r="1.6" fill="currentColor"/><path d="M5 17l4.5-4.5 3 2.5L16 11l3 3.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>':'';
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'; }

  function silhouette(det, hex){
    var bk = det.body==='ev' ? 'suv' : det.body;
    var b = BODY[bk]||BODY.sedan, w = WIN[bk]||WIN.sedan;
    return '<svg class="vi-sil" viewBox="0 0 162 52" aria-hidden="true">'
      + '<path class="body" d="'+b+'"/>'
      + (hex?'<path d="'+b+'" fill="'+hex+'" opacity="0.12"/>':'')
      + '<path class="glass" d="'+w+'"/>'
      + '<circle class="vi-wheel" cx="46" cy="41" r="10"/><circle class="vi-hub" cx="46" cy="41" r="4.4"/>'
      + '<circle class="vi-wheel" cx="122" cy="41" r="10"/><circle class="vi-hub" cx="122" cy="41" r="4.4"/>'
      + (det.ev?'<g transform="translate(140,11)"><circle r="7.5" fill="#16a34a"/><path d="M1 -4 L-3 1 L0 1 L-1 4 L3 -1 L0 -1 Z" fill="#fff"/></g>':'')
      + '</svg>';
  }

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function title(v){ return [v.year, v.make, v.model, v.trim].filter(Boolean).join(' '); }
  function canEdit(){ try{ return !!(window.ADRoles && ADRoles.can && ADRoles.can('inventory.edit')); }catch(e){ return false; } }

  function render(v, opts){
    opts = opts || {};
    var det = detect(v);
    var cls = 'vi'+(opts.big?' big':'');
    var imgs = (v && v.images && v.images.length) ? v.images : null;
    if (imgs){
      var alt = title(v) + ' photo';
      var first = imgs.map(function(u,i){ return '<img class="vi-img'+(i===0?' on':'')+'" data-i="'+i+'" src="'+esc(u)+'" alt="'+esc(alt)+'" loading="lazy">'; }).join('');
      var count = imgs.length>1 ? '<span class="vi-count">'+ic('cam')+imgs.length+'</span>' : '';
      var dots = imgs.length>1 ? '<div class="vi-dots">'+imgs.map(function(_,i){return '<i class="'+(i===0?'on':'')+'"></i>';}).join('')+'</div>' : '';
      var up = (opts.uploadable && canEdit()) ? '<button class="vi-up" data-vi-up="'+(v.id!=null?v.id:'')+'" title="Add photos">'+ic('up')+'Add</button>' : '';
      return '<div class="'+cls+'" role="img" aria-label="'+esc(title(v)+' — '+imgs.length+' photo'+(imgs.length>1?'s':''))+'"><div class="vi-photos" data-vi-gallery="'+imgs.length+'"><div class="vi-skel"></div>'+first+count+dots+'</div>'+up+'</div>';
    }
    var upBtn = (opts.uploadable && canEdit())
      ? '<button class="vi-up" data-vi-up="'+(v.id!=null?v.id:'')+'" title="Upload dealership photos">'+ic('up')+'Upload Photos</button>' : '';
    var cap = '<span class="vi-cap">'+ic('img')+(opts.big?'Awaiting dealer photos':'Photos coming soon')+'</span>';
    return '<div class="'+cls+'" role="img" aria-label="'+esc('No dealership photos available for '+title(v)+'.')+'">'
      + '<div class="vi-ph">'+silhouette(det, v&&v.hex)+cap+'</div>'+upBtn+'</div>';
  }

  /* ---- wiring: uploads + hover cycling + skeleton removal ---- */
  function readFiles(files, cb){
    var out=[], n=files.length, done=0; if(!n) return cb(out);
    Array.prototype.forEach.call(files, function(f){ if(!/^image\//.test(f.type)){ if(++done===n) cb(out); return; }
      var r=new FileReader(); r.onload=function(){ out.push(r.result); if(++done===n) cb(out); }; r.onerror=function(){ if(++done===n) cb(out); }; r.readAsDataURL(f); });
  }
  function wire(scope, hooks){
    scope = scope || document; hooks = hooks || {};
    scope.querySelectorAll('[data-vi-up]').forEach(function(btn){
      if(btn.__viWired) return; btn.__viWired = true;
      btn.addEventListener('click', function(e){ e.stopPropagation();
        var inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.multiple=true; inp.style.display='none';
        document.body.appendChild(inp);
        inp.addEventListener('change', function(){ readFiles(inp.files, function(urls){ inp.remove(); if(urls.length && hooks.onUpload) hooks.onUpload(btn.getAttribute('data-vi-up'), urls); }); });
        inp.click();
      });
    });
    // real <img> load -> reveal + drop skeleton
    scope.querySelectorAll('.vi-img').forEach(function(img){
      if(img.complete){ img.classList.add('on'); var sk=img.parentNode.querySelector('.vi-skel'); if(sk) sk.style.display='none'; }
      else img.addEventListener('load', function(){ img.classList.add('on'); var sk=img.parentNode.querySelector('.vi-skel'); if(sk) sk.style.display='none'; });
      img.addEventListener('error', function(){ img.remove(); }); // missing/corrupt -> silently drop; placeholder is used when none remain
    });
    // desktop hover cycling
    scope.querySelectorAll('[data-vi-gallery]').forEach(function(g){
      if(+g.getAttribute('data-vi-gallery')<2 || g.__viCyc) return; g.__viCyc=true;
      var imgs=g.querySelectorAll('.vi-img'), dots=g.querySelectorAll('.vi-dots i'), iv=null, i=0;
      function show(n){ imgs.forEach(function(im,k){ im.classList.toggle('on', k===n); }); dots.forEach(function(d,k){ d.classList.toggle('on', k===n); }); }
      g.addEventListener('mouseenter', function(){ iv=setInterval(function(){ i=(i+1)%imgs.length; show(i); }, 900); });
      g.addEventListener('mouseleave', function(){ clearInterval(iv); i=0; show(0); });
    });
  }

  window.VehicleImage = { render:render, wire:wire, detect:detect, silhouette:silhouette, canEdit:canEdit };
})();
