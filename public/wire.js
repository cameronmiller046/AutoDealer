/* AutoDealer — universal button wiring.
   Gives every otherwise-inert control real behavior so the whole product is demo-ready:
     • hamburger  -> slide the sidebar (mobile) with a dismiss backdrop
     • segmented filters / tabs / pills -> real active-state toggle (+ optional filter hook)
     • top-bar icon buttons (calls / messages / notifications) -> route to the right workspace
     • "New / Add / Create / Compose / Upload" -> a working create modal with a success toast
     • quick actions (Call / Text / Email / Video …) -> contextual toast feedback
     • anything still inert -> a graceful toast so nothing feels dead
   To stay safe it classifies each <button> with the SAME test as the offline audit: a button is
   considered already-wired (and left untouched) if it has an onclick attribute or any of its
   id / class tokens appear in the page's own inline scripts.  Loaded by roles.js on every app page. */
(function(){
  if (window.__adWire) return; window.__adWire = true;

  /* ---------------- toast ---------------- */
  function ensureToastHost(){
    var h = document.getElementById('adToastHost');
    if (h) return h;
    h = document.createElement('div'); h.id = 'adToastHost';
    h.style.cssText = 'position:fixed;z-index:99999;right:18px;bottom:18px;display:flex;flex-direction:column;gap:10px;align-items:flex-end;pointer-events:none;';
    (document.body||document.documentElement).appendChild(h);
    return h;
  }
  function toast(msg, kind){
    var host = ensureToastHost();
    var t = document.createElement('div');
    var accent = kind==='error' ? '#e5484d' : (kind==='info' ? '#3b82f6' : '#16a34a');
    t.style.cssText = 'pointer-events:auto;min-width:200px;max-width:360px;background:var(--card,#fff);color:var(--text,#16202e);'
      + 'border:1px solid var(--line,rgba(15,27,45,.1));border-left:3px solid '+accent+';border-radius:12px;'
      + 'padding:12px 15px;font:600 13.5px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;'
      + 'box-shadow:0 18px 40px -18px rgba(10,22,40,.5);transform:translateY(8px);opacity:0;transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .28s;';
    t.textContent = msg;
    host.appendChild(t);
    requestAnimationFrame(function(){ t.style.transform='translateY(0)'; t.style.opacity='1'; });
    setTimeout(function(){ t.style.transform='translateY(8px)'; t.style.opacity='0'; setTimeout(function(){ t.remove(); }, 300); }, 2600);
  }
  window.adToast = toast;

  /* ---------------- generic modal ---------------- */
  function modal(opts){
    var scrim = document.createElement('div');
    scrim.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(8,15,28,.5);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity .2s;';
    var card = document.createElement('div');
    card.style.cssText = 'width:100%;max-width:'+(opts.width||460)+'px;background:var(--card,#fff);color:var(--text,#16202e);border:1px solid var(--line,rgba(15,27,45,.1));'
      + 'border-radius:18px;box-shadow:0 40px 90px -40px rgba(0,0,0,.55);overflow:hidden;transform:translateY(10px) scale(.98);transition:transform .24s cubic-bezier(.2,.8,.2,1);';
    var head = '<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--line,rgba(15,27,45,.08))">'
      + '<div><div style="font-size:16px;font-weight:700">'+esc(opts.title||'Action')+'</div>'
      + (opts.sub?'<div style="font-size:12.5px;color:var(--muted,#6b7a90);margin-top:2px">'+esc(opts.sub)+'</div>':'')+'</div>'
      + '<button data-x style="border:none;background:var(--bg,#f1f5f9);width:32px;height:32px;border-radius:9px;color:var(--muted,#6b7a90);font-size:18px;cursor:pointer">&times;</button></div>';
    card.innerHTML = head + '<div style="padding:20px">'+(opts.body||'')+'</div>'
      + '<div style="display:flex;gap:10px;justify-content:flex-end;padding:14px 20px;border-top:1px solid var(--line,rgba(15,27,45,.08));background:var(--bg,#f8fafc)">'
      + '<button data-x style="padding:10px 16px;border-radius:10px;border:1px solid var(--line,rgba(15,27,45,.12));background:var(--card,#fff);color:var(--text,#16202e);font-weight:600;font-size:13.5px;cursor:pointer">Cancel</button>'
      + '<button data-ok style="padding:10px 18px;border-radius:10px;border:none;background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;font-weight:600;font-size:13.5px;cursor:pointer">'+esc(opts.okLabel||'Save')+'</button></div>';
    scrim.appendChild(card); document.body.appendChild(scrim);
    requestAnimationFrame(function(){ scrim.style.opacity='1'; card.style.transform='translateY(0) scale(1)'; });
    var first = card.querySelector('input,select,textarea'); if(first) setTimeout(function(){ first.focus(); }, 60);
    function close(){ scrim.style.opacity='0'; card.style.transform='translateY(10px) scale(.98)'; setTimeout(function(){ scrim.remove(); }, 200); document.removeEventListener('keydown', onKey); }
    function onKey(e){ if(e.key==='Escape') close(); }
    document.addEventListener('keydown', onKey);
    scrim.addEventListener('click', function(e){ if(e.target===scrim) close(); });
    card.querySelectorAll('[data-x]').forEach(function(b){ b.addEventListener('click', close); });
    card.querySelector('[data-ok]').addEventListener('click', function(){ if(opts.onOk && opts.onOk(card)===false) return; close(); if(opts.done) opts.done(); });
    return { card:card, close:close };
  }
  function field(label, attrs, tag){
    tag = tag||'input';
    var ctl = tag==='textarea' ? '<textarea '+(attrs||'')+' style="width:100%;box-sizing:border-box;min-height:84px;resize:vertical;padding:10px 12px;border:1px solid var(--line,rgba(15,27,45,.14));border-radius:10px;background:var(--bg,#fff);color:var(--text,#16202e);font:inherit;font-size:14px"></textarea>'
      : tag==='select' ? '<select '+(attrs||'')+' style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--line,rgba(15,27,45,.14));border-radius:10px;background:var(--bg,#fff);color:var(--text,#16202e);font:inherit;font-size:14px"></select>'
      : '<input '+(attrs||'')+' style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--line,rgba(15,27,45,.14));border-radius:10px;background:var(--bg,#fff);color:var(--text,#16202e);font:inherit;font-size:14px">';
    return '<label style="display:block;margin-bottom:13px"><span style="display:block;font-size:12.5px;font-weight:600;color:var(--muted,#6b7a90);margin-bottom:6px">'+esc(label)+'</span>'+ctl+'</label>';
  }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ---------------- create-modal presets by keyword ---------------- */
  function createModal(label){
    var L = label.toLowerCase(), body, title = label, ok = 'Create';
    if (/prospect|lead/.test(L)){
      body = field('Full name','placeholder="Jordan Blake"') + field('Phone','placeholder="(555) 000-1234"') + field('Email','type="email" placeholder="jordan@email.com"')
        + field('Interested in','placeholder="2024 RAV4 XLE"') + field('Source','','select');
      title='New Prospect';
    } else if (/appointment|schedule|book/.test(L)){
      body = field('Customer','placeholder="Search customer…"') + field('Date','type="date"') + field('Time','type="time"') + field('Type','','select') + field('Notes','','textarea');
      title='New Appointment'; ok='Schedule';
    } else if (/vehicle|inventory|stock/.test(L)){
      body = field('Year / Make / Model','placeholder="2024 Toyota RAV4"') + field('VIN','placeholder="1HGBH41JXMN109186"') + field('Stock #','placeholder="T4821"') + field('Asking price','placeholder="$32,995"');
      title='Add Vehicle'; ok='Add to inventory';
    } else if (/appraisal|trade/.test(L)){
      body = field('Year / Make / Model','placeholder="2019 Honda Civic"') + field('VIN','') + field('Mileage','placeholder="48,200"') + field('Condition','','select');
      title='New Appraisal'; ok='Start appraisal';
    } else if (/compose|message|email|new email|send/.test(L)){
      body = field('To','placeholder="customer@email.com"') + field('Subject','placeholder="Following up on your visit"') + field('Message','','textarea');
      title='New Message'; ok='Send';
    } else if (/upload|import|document|file/.test(L)){
      body = '<div style="border:2px dashed var(--line,rgba(15,27,45,.2));border-radius:14px;padding:30px;text-align:center;color:var(--muted,#6b7a90);font-size:13.5px">Drag files here, or <label style="color:#2563eb;font-weight:600;cursor:pointer">browse<input type="file" multiple style="display:none"></label></div>'
        + '<div style="margin-top:12px">'+field('Category','','select')+'</div>';
      title='Upload'; ok='Upload';
    } else if (/task|to-?do/.test(L)){
      body = field('Task','placeholder="Call back about financing"') + field('Assign to','','select') + field('Due','type="date"') + field('Priority','','select');
      title='Create Task'; ok='Create task';
    } else if (/dashboard|report|widget/.test(L)){
      body = field('Dashboard name','placeholder="Sales Performance — Q3"') + field('Audience','','select') + field('Layout','','select');
      title='Create Dashboard'; ok='Create';
    } else if (/deal|submit/.test(L)){
      body = field('Customer','placeholder="Search customer…"') + field('Vehicle','placeholder="2024 RAV4 XLE — Stk T4821"') + field('Sale price','placeholder="$32,995"') + field('Type','','select');
      title='New Deal'; ok='Submit deal';
    } else if (/campaign/.test(L)){
      body = field('Campaign name','') + field('Channel','','select') + field('Audience','','select');
      ok='Launch';
    } else {
      body = field(label, '') + '<div style="font-size:12.5px;color:var(--muted,#6b7a90)">This is a live demo — no data is saved.</div>';
    }
    var m = modal({ title:title, sub:'Demo workspace', okLabel:ok, body:body, done:function(){ toast('✓ '+title+' saved'); } });
    // populate any empty selects with sensible options
    m.card.querySelectorAll('select').forEach(function(sel){
      if (sel.options.length) return;
      var opts = /source/i.test(prevLabel(sel)) ? ['Walk-in','Web lead','Phone-up','Referral','Marketplace']
        : /type/i.test(prevLabel(sel)) ? ['Sales consult','Test drive','Delivery','Service','Follow-up']
        : /priority/i.test(prevLabel(sel)) ? ['High','Normal','Low']
        : /condition/i.test(prevLabel(sel)) ? ['Excellent','Good','Fair','Rough']
        : /audience|assign/i.test(prevLabel(sel)) ? ['Me','Sales team','BDC','Managers']
        : /channel/i.test(prevLabel(sel)) ? ['Email','SMS','Both']
        : /layout/i.test(prevLabel(sel)) ? ['Grid','Columns','Single']
        : /category/i.test(prevLabel(sel)) ? ['Contract','ID / License','Insurance','Trade docs','Other']
        : ['Option 1','Option 2','Option 3'];
      sel.innerHTML = opts.map(function(o){ return '<option>'+o+'</option>'; }).join('');
    });
  }
  function prevLabel(el){ var l = el.closest('label'); return l ? l.textContent : ''; }

  /* ---------------- classification ---------------- */
  var inlineScript = '';
  function collectScripts(){
    var out = [];
    document.querySelectorAll('script:not([src])').forEach(function(s){ out.push(s.textContent||''); });
    inlineScript = out.join('\n');
  }
  var GENERIC = {btn:1,'btn-primary':1,'btn-sm':1,'btn-lg':1,'btn-ghost':1,on:1,active:1,sel:1,primary:1,ghost:1,pill:1,tab:1};
  function isWired(btn){
    if (btn.hasAttribute('onclick')) return true;
    if (btn.getAttribute('type')==='submit') return true;
    if (btn.__adWired) return true;
    var toks = [];
    if (btn.id) toks.push(btn.id);
    btn.classList.forEach(function(c){ if(!GENERIC[c]) toks.push(c); });
    // data-* attributes signal a container-delegated handler (e.g. <button data-v="grid"> read by a parent)
    for (var a=0;a<btn.attributes.length;a++){ var an=btn.attributes[a].name; if (an.indexOf('data-')===0) toks.push(an); }
    for (var i=0;i<toks.length;i++){ if (inlineScript.indexOf(toks[i]) !== -1) return true; }
    // sits inside a control whose own id is referenced in script (parent-level delegation)
    var p = btn.parentElement, hops = 0;
    while (p && hops < 3){ if (p.id && inlineScript.indexOf(p.id) !== -1) return true; hops++; p = p.parentElement; }
    return false;
  }

  var ACTIVE = ['on','active','sel','selected','current','is-active','tab-on','seg-on'];
  function activeClassIn(group){
    for (var i=0;i<group.length;i++){ for (var j=0;j<ACTIVE.length;j++){ if (group[i].classList.contains(ACTIVE[j])) return ACTIVE[j]; } }
    return null;
  }
  function segInfo(btn){
    var p = btn.parentElement; if(!p) return null;
    var sibs = Array.prototype.filter.call(p.children, function(c){ return c.tagName==='BUTTON'; });
    if (sibs.length < 2) return null;
    var pc = (p.className||'')+' '+((p.parentElement&&p.parentElement.className)||'');
    var looksSeg = /seg|tab|toggle|range|period|filter|view|switch|chips?|pills?/i.test(pc);
    var act = activeClassIn(sibs);
    if (!act && !looksSeg) return null;
    return { sibs:sibs, active:act||'on' };
  }

  /* ---------------- behavior ---------------- */
  function sidebarToggle(){
    var sb = document.querySelector('.sidebar'); if(!sb) return;
    var open = sb.classList.toggle('ad-open');
    var bd = document.getElementById('adSideBackdrop');
    if (open){
      if(!bd){ bd = document.createElement('div'); bd.id='adSideBackdrop';
        bd.style.cssText='position:fixed;inset:0;z-index:39;background:rgba(6,12,24,.5);opacity:0;transition:opacity .25s;';
        document.body.appendChild(bd);
        bd.addEventListener('click', function(){ sb.classList.remove('ad-open'); bd.style.opacity='0'; setTimeout(function(){ bd.remove(); },250); });
      }
      requestAnimationFrame(function(){ bd.style.opacity='1'; });
    } else if (bd){ bd.style.opacity='0'; setTimeout(function(){ bd.remove(); },250); }
  }
  function injectSidebarCSS(){
    if (document.getElementById('adWireCSS')) return;
    var s = document.createElement('style'); s.id='adWireCSS';
    s.textContent = '@media(max-width:900px){.sidebar.ad-open{display:flex!important;position:fixed;top:0;left:0;bottom:0;z-index:40;width:min(80vw,300px);animation:adSlide .28s cubic-bezier(.2,.8,.2,1)}}'
      + '@keyframes adSlide{from{transform:translateX(-100%)}to{transform:translateX(0)}}'
      + '.ad-seg-on-anim{transition:background .2s,color .2s,border-color .2s}';
    document.head.appendChild(s);
  }

  var TOPBAR_ROUTE = { 'calls':'/communications','messages':'/communications','notifications':'/notifications' };
  function labelOf(btn){
    var t = (btn.getAttribute('aria-label')||btn.getAttribute('title')||btn.textContent||'').replace(/\s+/g,' ').trim();
    return t;
  }

  function handle(btn, e){
    var lbl = labelOf(btn);
    // 1) hamburger
    if (btn.classList.contains('hamb')){ sidebarToggle(); return; }
    // 2) segmented / tab / pill toggle
    var seg = segInfo(btn);
    if (seg){ seg.sibs.forEach(function(s){ ACTIVE.forEach(function(a){ s.classList.remove(a); }); }); btn.classList.add(seg.active);
      if (lbl) toast('Showing: '+lbl, 'info'); return; }
    // 3) top-bar icon buttons
    if (btn.classList.contains('ib')){
      var key = (btn.getAttribute('aria-label')||'').toLowerCase();
      for (var k in TOPBAR_ROUTE){ if (key.indexOf(k)!==-1){ location.href = TOPBAR_ROUTE[k]; return; } }
      toast(lbl||'Notifications', 'info'); return;
    }
    // 4) quick-add menu
    if (btn.classList.contains('quick-add')){ quickAddMenu(btn); return; }
    // 5) create / primary actions
    if (/^(new|add|create|compose|upload|import|schedule|book|submit|start|launch)\b/i.test(lbl) || /add-btn|compose-btn/.test(btn.className) || (btn.classList.contains('qbtn')&&btn.classList.contains('primary'))){
      createModal(lbl||'New'); return;
    }
    // 6) quick-action verbs
    var verb = lbl.toLowerCase();
    var VERBS = { call:'📞 Starting call…', text:'💬 Opening SMS…', email:'✉️ Composing email…', video:'🎥 Launching video call…',
      export:'⬇️ Preparing export…', assign:'✅ Assigned', 'follow-up':'⏰ Follow-up set', reminder:'🔔 Reminder sent',
      'send reminder':'🔔 Reminder sent', note:'📝 Note added', service:'🔧 Opening service…', upgrade:'⬆️ Upgrade path opened' };
    for (var v in VERBS){ if (verb===v || verb.indexOf(v)===0){ toast(VERBS[v]); return; } }
    // 7) graceful fallback
    if (lbl) toast(lbl);
    else { btn.animate&&btn.animate([{transform:'scale(.94)'},{transform:'scale(1)'}],{duration:160}); }
  }

  function quickAddMenu(btn){
    var existing = document.getElementById('adQAMenu'); if(existing){ existing.remove(); return; }
    var r = btn.getBoundingClientRect();
    var m = document.createElement('div'); m.id='adQAMenu';
    m.style.cssText='position:fixed;z-index:99997;top:'+(r.bottom+8)+'px;left:'+r.left+'px;min-width:220px;background:var(--card,#fff);border:1px solid var(--line,rgba(15,27,45,.1));border-radius:14px;box-shadow:0 24px 60px -24px rgba(10,22,40,.5);overflow:hidden;padding:6px;';
    var items = [['New Prospect','👤'],['New Appointment','📅'],['New Deal','🤝'],['Add Vehicle','🚗'],['Create Task','✅'],['New Message','✉️']];
    m.innerHTML = items.map(function(it){ return '<button class="ad-qa-i" data-l="'+it[0]+'" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;border:none;background:none;padding:10px 12px;border-radius:9px;font:600 13.5px system-ui;color:var(--text,#16202e);cursor:pointer"><span style="font-size:16px">'+it[1]+'</span>'+it[0]+'</button>'; }).join('');
    document.body.appendChild(m);
    m.querySelectorAll('.ad-qa-i').forEach(function(b){ b.addEventListener('mouseenter',function(){ b.style.background='var(--bg,#f1f5f9)'; }); b.addEventListener('mouseleave',function(){ b.style.background='none'; });
      b.addEventListener('click', function(){ m.remove(); createModal(b.getAttribute('data-l')); }); });
    setTimeout(function(){ document.addEventListener('click', function off(ev){ if(!m.contains(ev.target)&&ev.target!==btn){ m.remove(); document.removeEventListener('click', off); } }); }, 0);
  }

  /* ---------------- boot ---------------- */
  function wireAll(){
    collectScripts(); injectSidebarCSS();
    document.querySelectorAll('button').forEach(function(btn){
      if (isWired(btn)) return;
      btn.__adWired = true;
      btn.addEventListener('click', function(e){ handle(btn, e); });
      if (!btn.style.cursor) btn.style.cursor = 'pointer';
    });
  }
  function boot(){ wireAll();
    // re-wire buttons added later by page scripts (lightweight, debounced)
    var mo = new MutationObserver(function(muts){
      var add=false; muts.forEach(function(m){ if(m.addedNodes&&m.addedNodes.length) add=true; });
      if(add){ clearTimeout(boot._t); boot._t=setTimeout(function(){
        document.querySelectorAll('button:not([onclick])').forEach(function(btn){ if(btn.__adWired) return; if(isWired(btn)) { btn.__adWired=true; return; } btn.__adWired=true; btn.addEventListener('click', function(e){ handle(btn,e); }); if(!btn.style.cursor) btn.style.cursor='pointer'; });
      }, 120); }
    });
    try { mo.observe(document.body, {childList:true, subtree:true}); } catch(e){}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.ADWire = { toast:toast, modal:modal, createModal:createModal };
})();
