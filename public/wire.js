/* AutoDealer — universal button wiring + role-gated multi-step create flows.
   Gives every otherwise-inert control real, role-aware behavior so the whole product is demo-ready:
     • hamburger  -> slide the sidebar (mobile) with a dismiss backdrop
     • segmented filters / tabs / pills -> real active-state toggle
     • top-bar icon buttons (calls / messages / notifications) -> route to the right workspace
     • "New / Add / Create / Compose / Upload …" -> a guided multi-step WIZARD that collects every
       field required to complete the action, ending in a Confirmation step (e.g. New Prospect =
       Customer Info -> Vehicle of Interest -> Trade Vehicle -> Confirmation)
     • quick actions (Call / Text / Email / Video …) -> contextual toast feedback
     • anything still inert -> a graceful toast so nothing feels dead
   ROLE GATING: actions map to permission keys and are hidden for roles that lack them
   (via window.ADRoles.can), so a Sales Rep never sees "Add Vehicle" / "Create Dashboard" / "Export".
   SAFETY: a <button> is left completely untouched if it has an onclick, if its id/class/data-*
   tokens appear in the page's inline scripts, or if an ancestor id is referenced in script — so it
   never double-fires on already-wired / container-delegated buttons.  Loaded by roles.js. */
(function(){
  if (window.__adWire) return; window.__adWire = true;

  function can(perm){ try { return !perm || (window.ADRoles && window.ADRoles.can ? window.ADRoles.can(perm) : true); } catch(e){ return true; } }

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

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ---------------- base modal shell ---------------- */
  function shell(opts){
    var scrim = document.createElement('div');
    scrim.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(8,15,28,.5);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity .2s;';
    var card = document.createElement('div'); card.setAttribute('data-adui','');
    card.style.cssText = 'width:100%;max-width:'+(opts.width||560)+'px;max-height:92vh;display:flex;flex-direction:column;background:var(--card,#fff);color:var(--text,#16202e);border:1px solid var(--line,rgba(15,27,45,.1));'
      + 'border-radius:18px;box-shadow:0 40px 90px -40px rgba(0,0,0,.55);overflow:hidden;transform:translateY(10px) scale(.98);transition:transform .24s cubic-bezier(.2,.8,.2,1);';
    scrim.appendChild(card); document.body.appendChild(scrim);
    requestAnimationFrame(function(){ scrim.style.opacity='1'; card.style.transform='translateY(0) scale(1)'; });
    function close(){ scrim.style.opacity='0'; card.style.transform='translateY(10px) scale(.98)'; setTimeout(function(){ scrim.remove(); }, 200); document.removeEventListener('keydown', onKey); }
    function onKey(e){ if(e.key==='Escape') close(); }
    document.addEventListener('keydown', onKey);
    scrim.addEventListener('click', function(e){ if(e.target===scrim) close(); });
    return { scrim:scrim, card:card, close:close };
  }

  /* ---------------- generic single modal (fallback for unknown labels) ---------------- */
  function field(label, attrs, tag){
    tag = tag||'input';
    var ctl = tag==='textarea' ? '<textarea '+(attrs||'')+' style="'+CTL+';min-height:84px;resize:vertical"></textarea>'
      : tag==='select' ? '<select '+(attrs||'')+' style="'+CTL+'"></select>'
      : '<input '+(attrs||'')+' style="'+CTL+'">';
    return '<label style="display:block;margin-bottom:13px"><span style="'+LBL+'">'+esc(label)+'</span>'+ctl+'</label>';
  }
  var CTL = 'width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--line,rgba(15,27,45,.14));border-radius:10px;background:var(--bg,#fff);color:var(--text,#16202e);font:inherit;font-size:14px';
  var LBL = 'display:block;font-size:12.5px;font-weight:600;color:var(--muted,#6b7a90);margin-bottom:6px';
  function simpleModal(title, bodyHTML, okLabel){
    var s = shell({width:460});
    s.card.innerHTML = header(title,'Demo workspace') + '<div style="padding:20px;overflow:auto">'+bodyHTML+'</div>' + footer([['Cancel','x'],[okLabel||'Save','ok']]);
    wireFooter(s, function(){ s.close(); toast('✓ '+title+' saved'); });
    var f=s.card.querySelector('input,select,textarea'); if(f) setTimeout(function(){f.focus();},60);
  }
  function header(title, sub){
    return '<div style="display:flex;align-items:flex-start;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--line,rgba(15,27,45,.08));flex:none">'
      + '<div><div style="font-size:16px;font-weight:700">'+esc(title)+'</div>'
      + (sub?'<div id="adWzSub" style="font-size:12.5px;color:var(--muted,#6b7a90);margin-top:2px">'+esc(sub)+'</div>':'')+'</div>'
      + '<button data-x style="border:none;background:var(--bg,#f1f5f9);width:32px;height:32px;border-radius:9px;color:var(--muted,#6b7a90);font-size:18px;cursor:pointer;flex:none">&times;</button></div>';
  }
  function footer(btns){
    return '<div id="adWzFoot" style="display:flex;gap:10px;justify-content:flex-end;padding:14px 20px;border-top:1px solid var(--line,rgba(15,27,45,.08));background:var(--bg,#f8fafc);flex:none">'
      + btns.map(function(b){ var ok=b[1]==='ok'; return '<button data-'+b[1]+' style="padding:10px '+(ok?'18':'16')+'px;border-radius:10px;font-weight:600;font-size:13.5px;cursor:pointer;border:'+(ok?'none':'1px solid var(--line,rgba(15,27,45,.12))')+';background:'+(ok?'linear-gradient(180deg,#3b82f6,#2563eb)':'var(--card,#fff)')+';color:'+(ok?'#fff':'var(--text,#16202e)')+'">'+esc(b[0])+'</button>'; }).join('') + '</div>';
  }
  function wireFooter(s, onOk){
    s.card.querySelectorAll('[data-x]').forEach(function(b){ b.addEventListener('click', s.close); });
    var ok=s.card.querySelector('[data-ok]'); if(ok) ok.addEventListener('click', onOk);
  }

  /* ================= MULTI-STEP WIZARD ================= */
  /* field spec: {key,label,type,req,ph,opts:[],half,dep,note}
     types: text tel email number date time money select textarea toggle summary */
  function fieldCtl(f, val){
    var base = 'data-key="'+f.key+'"' + (f.req?' data-req="1"':'');
    var v = val==null?'':val;
    if (f.type==='select'){
      var opts = (f.opts||[]).map(function(o){ return '<option'+(o===v?' selected':'')+'>'+esc(o)+'</option>'; }).join('');
      if (!f.req) opts = '<option value=""'+(v?'':' selected')+'>Select…</option>'+opts;
      return '<select '+base+' style="'+CTL+'">'+opts+'</select>';
    }
    if (f.type==='textarea') return '<textarea '+base+' placeholder="'+esc(f.ph||'')+'" style="'+CTL+';min-height:80px;resize:vertical">'+esc(v)+'</textarea>';
    if (f.type==='toggle'){
      var on = !!v;
      return '<button type="button" data-toggle="'+f.key+'" '+base+' aria-pressed="'+on+'" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;border:1px solid var(--line,rgba(15,27,45,.14));border-radius:11px;padding:11px 13px;background:'+(on?'rgba(59,130,246,.08)':'var(--bg,#fff)')+';color:var(--text,#16202e);font:inherit;font-weight:600;font-size:13.5px;cursor:pointer">'
        + '<span style="width:40px;height:23px;border-radius:999px;flex:none;background:'+(on?'#2563eb':'#cbd5e1')+';position:relative;transition:background .18s"><span style="position:absolute;top:2px;left:'+(on?'19':'2')+'px;width:19px;height:19px;border-radius:50%;background:#fff;transition:left .18s;box-shadow:0 1px 3px rgba(0,0,0,.3)"></span></span>'
        + esc(f.label)+'</button>';
    }
    var itype = f.type==='money'||f.type==='number' ? 'text' : (f.type||'text');
    var im = f.type==='money'||f.type==='number' ? ' inputmode="numeric"' : (f.type==='tel'?' inputmode="tel"':'');
    var pre = f.type==='money' ? '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted,#6b7a90);font-size:14px;pointer-events:none">$</span>' : '';
    var pad = f.type==='money' ? ';padding-left:22px' : '';
    return '<div style="position:relative">'+pre+'<input '+base+' type="'+itype+'"'+im+' placeholder="'+esc(f.ph||'')+'" value="'+esc(v)+'" style="'+CTL+pad+'"></div>';
  }
  function wizard(spec){
    var steps = spec.steps.slice(), idx = 0, values = {};
    var s = shell({width:580});
    s.card.innerHTML = header(spec.title, '') + '<div id="adWzSteps" style="padding:16px 20px 4px;flex:none"></div>'
      + '<div id="adWzBody" style="padding:6px 20px 18px;overflow:auto;flex:1 1 auto"></div>'
      + '<div id="adWzFoot"></div>';
    var stepsEl = s.card.querySelector('#adWzSteps'), bodyEl = s.card.querySelector('#adWzBody'), footEl = s.card.querySelector('#adWzFoot');
    s.card.querySelectorAll('[data-x]').forEach(function(b){ b.addEventListener('click', s.close); });

    function shown(f){ if(f.dep) return !!values[f.dep]; return true; }
    function collect(){
      bodyEl.querySelectorAll('[data-key]').forEach(function(el){
        if (el.getAttribute('data-toggle')) return; // toggles update on click
        values[el.getAttribute('data-key')] = el.value;
      });
    }
    function indicator(){
      return '<div style="display:flex;align-items:center;gap:6px">'+steps.map(function(st,i){
        var done=i<idx, cur=i===idx;
        var circle='<span style="width:24px;height:24px;border-radius:50%;flex:none;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;'
          +(cur?'background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff':done?'background:#16a34a;color:#fff':'background:var(--bg,#eef2f7);color:var(--muted,#94a3b8)')+'">'+(done?'✓':(i+1))+'</span>';
        var lab='<span style="font-size:11.5px;font-weight:'+(cur?'700':'600')+';color:'+(cur?'var(--text,#16202e)':'var(--muted,#94a3b8)')+';white-space:nowrap">'+esc(st.title)+'</span>';
        var line=i<steps.length-1?'<span style="flex:1;height:2px;min-width:10px;background:'+(done?'#16a34a':'var(--line,#e5eaf1)')+'"></span>':'';
        return '<span style="display:inline-flex;align-items:center;gap:6px">'+circle+lab+'</span>'+line;
      }).join('')+'</div>';
    }
    function summaryHTML(){
      var rows=[];
      steps.forEach(function(st){ if(st.summary) return; (st.fields||[]).forEach(function(f){
        if(f.type==='summary') return;
        if(f.type==='vehicle'){
          var veh=[values.vyear,values.vmake,values.vmodel,values.vtrim].filter(Boolean).join(' ');
          if(veh) rows.push(['Vehicle of interest', veh]);
          if(values.vbody) rows.push(['Body type', values.vbody]);
          if(values.vfeatures && values.vfeatures.length) rows.push(['Requested features', vFeatNames(values.vfeatures).join(', ')]);
          return;
        }
        if(f.type==='toggle'){ rows.push([f.label, values[f.key]?'Yes':'No']); return; }
        var v = values[f.key];
        if(v!=null && v!=='' && shown(f)) rows.push([f.label, (f.type==='money'?'$':'')+v]);
      }); });
      if(!rows.length) rows.push(['—','No details entered']);
      return '<div style="border:1px solid var(--line,rgba(15,27,45,.1));border-radius:12px;overflow:hidden">'
        + rows.map(function(r,i){ return '<div style="display:flex;justify-content:space-between;gap:14px;padding:10px 14px;'+(i?'border-top:1px solid var(--line,rgba(15,27,45,.07))':'')+'">'
          + '<span style="font-size:12.5px;color:var(--muted,#6b7a90);font-weight:600">'+esc(r[0])+'</span>'
          + '<span style="font-size:13.5px;font-weight:600;text-align:right">'+esc(r[1])+'</span></div>'; }).join('')
        + '</div><div style="margin-top:12px;font-size:12.5px;color:var(--muted,#6b7a90)">Review the details above, then confirm. This is a live demo — no data is saved.</div>';
    }
    function render(){
      stepsEl.innerHTML = indicator();
      var st = steps[idx];
      if (st.fields && st.fields.length===1 && st.fields[0].type==='summary'){
        bodyEl.innerHTML = '<div style="font-size:14px;font-weight:700;margin:6px 0 12px">'+esc(st.title)+'</div>'+summaryHTML();
      } else {
        var vis = (st.fields||[]).filter(shown);
        bodyEl.innerHTML = (st.intro?'<div style="font-size:12.5px;color:var(--muted,#6b7a90);margin:2px 0 12px">'+esc(st.intro)+'</div>':'')
          + '<div style="display:flex;flex-wrap:wrap;gap:12px">' + vis.map(function(f){
            if(f.type==='vehicle') return '<div style="flex:0 0 100%;max-width:100%" data-vehicle></div>';
            var w = f.half ? 'calc(50% - 6px)' : '100%';
            var lab = f.type==='toggle' ? '' : '<span style="'+LBL+'">'+esc(f.label)+(f.req?' <span style="color:#e5484d">*</span>':'')+'</span>';
            return '<label style="flex:0 0 '+w+';max-width:'+w+';display:block">'+lab+fieldCtl(f, values[f.key])+(f.note?'<span style="display:block;font-size:11.5px;color:var(--muted,#94a3b8);margin-top:5px">'+esc(f.note)+'</span>':'')+'</label>';
          }).join('') + '</div>';
      }
      // vehicle composite picker(s)
      bodyEl.querySelectorAll('[data-vehicle]').forEach(function(el){ vehiclePicker(el, values); });
      // toggles
      bodyEl.querySelectorAll('[data-toggle]').forEach(function(b){ b.addEventListener('click', function(){ var k=b.getAttribute('data-toggle'); values[k]=values[k]?'':'1'; collect(); render(); }); });
      // footer
      var btns = [];
      if (idx>0) btns.push(['‹ Back','back']);
      btns.push(['Cancel','x']);
      if (idx<steps.length-1) btns.push(['Next ›','next']);
      else btns.push([spec.okLabel||'Create','ok']);
      footEl.innerHTML = '<div style="display:flex;gap:10px;justify-content:space-between;align-items:center;padding:14px 20px;border-top:1px solid var(--line,rgba(15,27,45,.08));background:var(--bg,#f8fafc)">'
        + '<div>'+(idx>0?'<button data-back style="padding:10px 15px;border-radius:10px;border:1px solid var(--line,rgba(15,27,45,.12));background:var(--card,#fff);color:var(--text,#16202e);font-weight:600;font-size:13.5px;cursor:pointer">‹ Back</button>':'')+'</div>'
        + '<div style="display:flex;gap:10px">'
        + '<button data-x style="padding:10px 16px;border-radius:10px;border:1px solid var(--line,rgba(15,27,45,.12));background:var(--card,#fff);color:var(--text,#16202e);font-weight:600;font-size:13.5px;cursor:pointer">Cancel</button>'
        + (idx<steps.length-1
            ? '<button data-next style="padding:10px 20px;border-radius:10px;border:none;background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;font-weight:600;font-size:13.5px;cursor:pointer">Next ›</button>'
            : '<button data-ok style="padding:10px 20px;border-radius:10px;border:none;background:linear-gradient(180deg,#16a34a,#15803d);color:#fff;font-weight:600;font-size:13.5px;cursor:pointer">'+esc(spec.okLabel||'Create')+'</button>')
        + '</div></div>';
      footEl.querySelectorAll('[data-x]').forEach(function(b){ b.addEventListener('click', s.close); });
      var bk=footEl.querySelector('[data-back]'); if(bk) bk.addEventListener('click', function(){ collect(); idx--; render(); });
      var nx=footEl.querySelector('[data-next]'); if(nx) nx.addEventListener('click', function(){ if(validate()){ collect(); idx++; render(); } });
      var okb=footEl.querySelector('[data-ok]'); if(okb) okb.addEventListener('click', function(){ if(validate()){ collect(); s.close(); toast('✓ '+(spec.done||spec.title+' created')); if(spec.onDone) spec.onDone(values); } });
      var first=bodyEl.querySelector('input,select,textarea'); if(first) setTimeout(function(){ try{first.focus();}catch(e){} },50);
    }
    function validate(){
      collect();
      var missing=[];
      (steps[idx].fields||[]).filter(shown).forEach(function(f){
        if(!f.req) return;
        if(f.type==='vehicle'){ ['vmake','vmodel'].forEach(function(k){ var el=bodyEl.querySelector('[data-key="'+k+'"]'); if(el && !String(values[k]||'').trim()){ missing.push(el); el.style.borderColor='#e5484d'; el.style.boxShadow='0 0 0 3px rgba(229,72,77,.12)'; } }); return; }
        var el=bodyEl.querySelector('[data-key="'+f.key+'"]');
        if(el && !String(values[f.key]||'').trim()){ missing.push(el); el.style.borderColor='#e5484d'; el.style.boxShadow='0 0 0 3px rgba(229,72,77,.12)'; }
      });
      if(missing.length){ toast('Please complete the required field'+(missing.length>1?'s':''), 'error'); try{missing[0].focus();}catch(e){} return false; }
      return true;
    }
    render();
  }

  /* ================= VEHICLE CATALOG + CASCADING PICKER =================
     Real-world cascading logic: Body / Make / Model / Year / Trim all constrain
     one another (choosing a body type narrows the makes, models AND the year
     range, and choosing a year narrows the bodies/models — and vice versa).
     Requested-features grid lists 19 options and grays out any not available on
     the chosen model/trim (higher trims unlock more; body type & drivetrain gate
     the rest). */
  function vUniq(a){ var s={},o=[]; a.forEach(function(x){ if(!s[x]){s[x]=1;o.push(x);} }); return o; }
  function vm(make,model,body,years,trims,fl){ fl=fl||{}; return {make:make,model:model,body:body,years:years,trims:trims,ev:!!fl.ev,lux:!!fl.lux,tow:!!fl.tow,rows3:!!fl.rows3,sport:!!fl.sport}; }
  var VMODELS = [
    vm('Toyota','RAV4','SUV',[2019,2025],['LE','XLE','XLE Premium','Adventure','TRD Off-Road','Limited'],{tow:1}),
    vm('Toyota','Camry','Sedan',[2018,2025],['LE','SE','XSE','XLE','TRD']),
    vm('Toyota','Corolla','Sedan',[2020,2025],['L','LE','SE','XSE']),
    vm('Toyota','Highlander','SUV',[2020,2025],['L','LE','XLE','Limited','Platinum'],{rows3:1,tow:1}),
    vm('Toyota','Tacoma','Truck',[2016,2025],['SR','SR5','TRD Sport','TRD Off-Road','Limited','TRD Pro'],{tow:1}),
    vm('Toyota','Tundra','Truck',[2022,2025],['SR','SR5','Limited','Platinum','1794','TRD Pro'],{tow:1}),
    vm('Toyota','bZ4X','SUV',[2023,2025],['XLE','Limited'],{ev:1}),
    vm('Honda','Civic','Sedan',[2016,2025],['LX','Sport','EX','Touring']),
    vm('Honda','Accord','Sedan',[2018,2025],['LX','Sport','EX-L','Touring']),
    vm('Honda','CR-V','SUV',[2017,2025],['LX','EX','EX-L','Touring'],{tow:1}),
    vm('Honda','Pilot','SUV',[2016,2025],['Sport','EX-L','Touring','Elite'],{rows3:1,tow:1}),
    vm('Honda','Ridgeline','Truck',[2017,2025],['Sport','RTL','TrailSport','Black Edition'],{tow:1}),
    vm('Ford','F-150','Truck',[2015,2025],['XL','XLT','Lariat','King Ranch','Platinum','Raptor'],{tow:1}),
    vm('Ford','Explorer','SUV',[2020,2025],['Base','XLT','Limited','ST','Platinum'],{rows3:1,tow:1}),
    vm('Ford','Escape','SUV',[2020,2025],['Base','SE','SEL','Titanium']),
    vm('Ford','Mustang','Coupe',[2015,2025],['EcoBoost','GT','Mach 1','Dark Horse'],{sport:1}),
    vm('Ford','Bronco','SUV',[2021,2025],['Base','Big Bend','Badlands','Wildtrak','Raptor'],{tow:1}),
    vm('Ford','Mustang Mach-E','SUV',[2021,2025],['Select','Premium','GT'],{ev:1}),
    vm('Chevrolet','Silverado 1500','Truck',[2019,2025],['WT','Custom','LT','RST','LTZ','High Country'],{tow:1}),
    vm('Chevrolet','Equinox','SUV',[2018,2025],['LS','LT','RS','Premier']),
    vm('Chevrolet','Tahoe','SUV',[2021,2025],['LS','LT','RST','Z71','Premier','High Country'],{rows3:1,tow:1}),
    vm('Chevrolet','Corvette','Coupe',[2020,2025],['Stingray','Z06'],{sport:1}),
    vm('Chevrolet','Malibu','Sedan',[2019,2024],['LS','LT','RS','Premier']),
    vm('Jeep','Wrangler','SUV',[2018,2025],['Sport','Sahara','Rubicon'],{tow:1}),
    vm('Jeep','Grand Cherokee','SUV',[2022,2025],['Laredo','Limited','Overland','Summit'],{rows3:1,tow:1}),
    vm('Jeep','Gladiator','Truck',[2020,2025],['Sport','Willys','Rubicon','Mojave'],{tow:1}),
    vm('Tesla','Model 3','Sedan',[2018,2025],['Standard','Long Range','Performance'],{ev:1,sport:1}),
    vm('Tesla','Model Y','SUV',[2020,2025],['Long Range','Performance'],{ev:1}),
    vm('BMW','3 Series','Sedan',[2019,2025],['330i','M340i','M3'],{lux:1,sport:1}),
    vm('BMW','X5','SUV',[2019,2025],['xDrive40i','M50i','X5 M'],{lux:1,tow:1,rows3:1}),
    vm('BMW','X3','SUV',[2018,2025],['xDrive30i','M40i'],{lux:1})
  ];
  /* The full 2000-onward catalog (50+ brands, hundreds of models) lives in /vehicles.js and is
     loaded on demand; the array above is only a fallback if that file can't be fetched. */
  function cat(){ return (window.AD_VEHICLES && window.AD_VEHICLES.length) ? window.AD_VEHICLES : VMODELS; }
  var __vehCbs = [];
  function ensureVehicles(cb){
    if (window.AD_VEHICLES){ if(cb) cb(); return; }
    if (cb) __vehCbs.push(cb);
    if (window.__adVehLoading) return; window.__adVehLoading = true;
    var s = document.createElement('script'); s.src='/vehicles.js';
    s.onload = function(){ __vehCbs.splice(0).forEach(function(f){ try{ f(); }catch(e){} }); };
    s.onerror = function(){ window.__adVehLoading = false; };
    document.head.appendChild(s);
  }
  var VFEATURES = [
    {id:'carplay',name:'Apple CarPlay / Android Auto'},{id:'bt',name:'Bluetooth & hands-free'},
    {id:'camera',name:'Backup camera'},{id:'remote',name:'Remote start'},
    {id:'powergate',name:'Power liftgate'},{id:'heated',name:'Heated front seats'},
    {id:'lane',name:'Lane-keep assist'},{id:'blindspot',name:'Blind-spot monitor'},
    {id:'adcruise',name:'Adaptive cruise control'},{id:'nav',name:'Built-in navigation'},
    {id:'wireless',name:'Wireless phone charging'},{id:'audio',name:'Premium audio (JBL/Bose)'},
    {id:'leather',name:'Leather upholstery'},{id:'sunroof',name:'Panoramic sunroof'},
    {id:'cam360',name:'360° camera'},{id:'vented',name:'Ventilated seats'},
    {id:'awd',name:'AWD / 4x4'},{id:'tow',name:'Tow package'},
    {id:'thirdrow',name:'Third-row seating'},{id:'evfast',name:'DC fast charging'}
  ];
  function vFeatNames(ids){ return (ids||[]).map(function(id){ var f=VFEATURES.filter(function(x){return x.id===id;})[0]; return f?f.name:id; }); }
  function vAvail(fid, mo, ti, tc){
    var tier = (ti==null) ? 1 : (tc>1 ? ti/(tc-1) : 1);
    switch(fid){
      case 'carplay': case 'bt': case 'camera': case 'remote': return true;
      case 'powergate': return mo.body==='SUV'||mo.body==='Truck';
      case 'lane': return tier>=0.2;
      case 'heated': return tier>=0.25;
      case 'blindspot': return tier>=0.3;
      case 'adcruise': return mo.ev||mo.lux ? true : tier>=0.34;
      case 'nav': return tier>=0.34;
      case 'wireless': return tier>=0.34;
      case 'audio': return mo.lux ? true : tier>=0.5;
      case 'leather': return mo.lux ? true : tier>=0.5;
      case 'sunroof': return tier>=0.5;
      case 'cam360': return mo.lux ? tier>=0.5 : tier>=0.7;
      case 'vented': return mo.lux ? tier>=0.5 : tier>=0.8;
      case 'awd': return (mo.body==='SUV'||mo.body==='Truck'||mo.ev) ? true : (mo.lux ? tier>=0.5 : false);
      case 'tow': return mo.body==='Truck' ? true : (mo.tow ? tier>=0.25 : false);
      case 'thirdrow': return !!mo.rows3;
      case 'evfast': return !!mo.ev;
    }
    return false;
  }
  function vehiclePicker(mount, values){
    values.vfeatures = values.vfeatures || [];
    function allowed(skip){ return cat().filter(function(mm){
      if(skip!=='make' && values.vmake && mm.make!==values.vmake) return false;
      if(skip!=='body' && values.vbody && mm.body!==values.vbody) return false;
      if(skip!=='model' && values.vmodel && mm.model!==values.vmodel) return false;
      if(skip!=='year' && values.vyear && !(mm.years[0]<=+values.vyear && +values.vyear<=mm.years[1])) return false;
      return true; }); }
    function modelObj(){ if(!values.vmodel) return null; var c=cat().filter(function(mm){ return mm.model===values.vmodel && (!values.vmake||mm.make===values.vmake); }); return c[0]||null; }
    function draw(){
      // If the body type was auto-derived from a model and that model is no longer valid
      // (e.g. the user switched make), drop the stale body so it doesn't over-filter.
      if(!modelObj() && values.__bodyAuto){ values.vbody=''; values.__bodyAuto=false; }
      function yr(mm){ return !values.vyear || (mm.years[0]<=+values.vyear && +values.vyear<=mm.years[1]); }
      // Make/Model/Trim is a hierarchy — an upstream field is never narrowed by a downstream one;
      // Body <-> Year are cross-constraints. So Make ignores the chosen model; Model respects make+body+year.
      var makes=vUniq(cat().filter(function(mm){ return (!values.vbody||mm.body===values.vbody)&&yr(mm); }).map(function(x){return x.make;})).sort();
      var models=vUniq(cat().filter(function(mm){ return (!values.vmake||mm.make===values.vmake)&&(!values.vbody||mm.body===values.vbody)&&yr(mm); }).map(function(x){return x.model;})).sort();
      var bodies=vUniq(cat().filter(function(mm){ return (!values.vmake||mm.make===values.vmake)&&(!values.vmodel||mm.model===values.vmodel)&&yr(mm); }).map(function(x){return x.body;})).sort();
      var yset={}; cat().filter(function(mm){ return (!values.vmake||mm.make===values.vmake)&&(!values.vbody||mm.body===values.vbody)&&(!values.vmodel||mm.model===values.vmodel); }).forEach(function(x){ for(var y=x.years[1];y>=x.years[0];y--) if(y>=2000) yset[y]=1; });
      var years=Object.keys(yset).map(Number).sort(function(a,b){return b-a;});
      if(values.vmake&&makes.indexOf(values.vmake)<0) values.vmake='';
      if(values.vbody&&bodies.indexOf(values.vbody)<0) values.vbody='';
      if(values.vmodel&&models.indexOf(values.vmodel)<0) values.vmodel='';
      if(values.vyear&&years.indexOf(+values.vyear)<0) values.vyear='';
      var mo=modelObj(); var trims=mo?mo.trims:[]; if(values.vtrim&&trims.indexOf(values.vtrim)<0) values.vtrim='';
      if(mo){ values.vbody = mo.body; values.__bodyAuto = true; values.vmake = mo.make; }   // model implies its make & body (a Model 3 is a Tesla Sedan)
      var ti = mo&&values.vtrim ? trims.indexOf(values.vtrim) : null;
      if(mo) values.vfeatures = values.vfeatures.filter(function(id){ return vAvail(id,mo,ti,trims.length); });
      function sel(key,label,opts,req){
        var ph = req?'Select…':'Any';
        var o='<option value="">'+ph+'</option>'+opts.map(function(v){ return '<option'+(String(v)===String(values[key]||'')?' selected':'')+'>'+esc(v)+'</option>'; }).join('');
        return '<label style="flex:0 0 calc(50% - 6px);max-width:calc(50% - 6px);display:block"><span style="'+LBL+'">'+esc(label)+(req?' <span style="color:#e5484d">*</span>':'')+'</span><select data-key="'+key+'"'+(req?' data-req="1"':'')+' style="'+CTL+'">'+o+'</select></label>';
      }
      var trimOpts = mo ? ('<option value="">Any trim</option>'+trims.map(function(v){return '<option'+(v===values.vtrim?' selected':'')+'>'+esc(v)+'</option>';}).join('')) : '<option value="">Select a model first</option>';
      var trimSel='<label style="flex:0 0 calc(50% - 6px);max-width:calc(50% - 6px);display:block"><span style="'+LBL+'">Trim</span><select data-key="vtrim"'+(mo?'':' disabled')+' style="'+CTL+(mo?'':';opacity:.55')+'">'+trimOpts+'</select></label>';
      var selects='<div style="display:flex;flex-wrap:wrap;gap:12px">'
        + sel('vbody','Body type',bodies,false) + sel('vmake','Make',makes,true)
        + sel('vmodel','Model',models,true) + sel('vyear','Year',years,false) + trimSel + '</div>';
      var feat;
      if(!mo){ feat='<div style="margin-top:16px;padding:14px;border:1px dashed var(--line,#dfe6ef);border-radius:12px;font-size:12.5px;color:var(--muted,#94a3b8)">Select a make &amp; model to choose requested features available for that vehicle.</div>'; }
      else {
        var chips=VFEATURES.map(function(f){ var av=vAvail(f.id,mo,ti,trims.length); var onSel=values.vfeatures.indexOf(f.id)>=0;
          var base='display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;font-size:12.5px;font-weight:600;border:1px solid ';
          var st = !av ? base+'var(--line,#e5eaf1);color:var(--faint,#aab4c2);background:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(120,130,150,.06) 5px,rgba(120,130,150,.06) 10px);cursor:not-allowed;opacity:.7'
            : onSel ? base+'transparent;color:#fff;background:linear-gradient(180deg,#3b82f6,#2563eb);cursor:pointer;box-shadow:0 6px 14px -8px rgba(37,99,235,.8)'
            : base+'var(--line,#dbe4f0);color:var(--text,#16202e);background:var(--bg,#fff);cursor:pointer';
          var mark = !av ? '<span style="font-size:9.5px;font-weight:700;letter-spacing:.3px;opacity:.85">N/A</span>' : '<span style="font-size:11px">'+(onSel?'✓':'+')+'</span>';
          return '<span class="vf-chip" data-av="'+(av?1:0)+'" data-fid="'+f.id+'" title="'+(av?'Click to request':'Not available on this model/trim')+'" style="'+st+'">'+mark+esc(f.name)+'</span>';
        }).join('');
        var count=values.vfeatures.length;
        feat='<div style="margin-top:16px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;gap:10px"><span style="'+LBL+';margin:0">Requested features'+(count?' · '+count+' selected':'')+'</span><span style="font-size:11px;color:var(--faint,#aab4c2)">Grayed = not available on this trim</span></div><div style="display:flex;flex-wrap:wrap;gap:8px">'+chips+'</div></div>';
      }
      mount.innerHTML = selects + feat;
      mount.querySelectorAll('select[data-key]').forEach(function(s){ s.addEventListener('change', function(){
        var k=s.getAttribute('data-key'); values[k]=s.value;
        if(k==='vbody') values.__bodyAuto=false;
        // the just-changed field is authoritative: drop a now-conflicting model/trim so it can't fight the new choice
        if(k!=='vmodel' && k!=='vtrim' && values.vmodel){
          var ok = cat().some(function(mm){ return mm.model===values.vmodel
            && (!values.vmake || mm.make===values.vmake)
            && (!values.vbody || mm.body===values.vbody)
            && (!values.vyear || (mm.years[0]<=+values.vyear && +values.vyear<=mm.years[1])); });
          if(!ok){ values.vmodel=''; values.vtrim=''; }
        }
        if(k==='vmodel') values.vtrim='';
        draw();
      }); });
      mount.querySelectorAll('.vf-chip').forEach(function(c){ if(c.getAttribute('data-av')!=='1') return; c.addEventListener('click', function(){ var id=c.getAttribute('data-fid'); var i=values.vfeatures.indexOf(id); if(i>=0) values.vfeatures.splice(i,1); else values.vfeatures.push(id); draw(); }); });
    }
    draw();
    ensureVehicles(function(){ draw(); });   // upgrade to the full catalog when it loads
  }

  /* ---------------- action registry (label -> wizard spec) ---------------- */
  var SRC=['Walk-in','Web lead','Phone-up','Referral','Marketplace','Service drive','Trade-in','Repeat customer'];
  var COND=['Excellent','Good','Fair','Rough'];
  var CONFIRM = { title:'Confirmation', fields:[{type:'summary'}] };
  var ACTIONS = {
    prospect: { perm:'crm.create', title:'New Prospect', okLabel:'Create Prospect', done:'Prospect created', steps:[
      { title:'Customer Info', fields:[
        {key:'first',label:'First name',type:'text',req:true,half:true,ph:'Jordan'},
        {key:'last',label:'Last name',type:'text',req:true,half:true,ph:'Blake'},
        {key:'phone',label:'Mobile phone',type:'tel',req:true,half:true,ph:'(555) 000-1234'},
        {key:'email',label:'Email',type:'email',half:true,ph:'jordan@email.com'},
        {key:'pref',label:'Preferred contact',type:'select',half:true,opts:['Phone','Text','Email']},
        {key:'source',label:'Lead source',type:'select',req:true,half:true,opts:SRC} ]},
      { title:'Vehicle of Interest', fields:[
        {key:'vehicle',type:'vehicle',req:true},
        {key:'vcond',label:'New or used',type:'select',half:true,opts:['New','Used','Certified','Either']},
        {key:'budget',label:'Budget',type:'money',half:true,ph:'35,000'},
        {key:'ftype',label:'Purchase type',type:'select',half:true,opts:['Finance','Lease','Cash']},
        {key:'timeframe',label:'Buying timeframe',type:'select',half:true,opts:['This week','This month','1–3 months','Just looking']} ]},
      { title:'Trade Vehicle', intro:'Does the customer have a vehicle to trade in?', fields:[
        {key:'has_trade',label:'This customer has a trade-in',type:'toggle'},
        {key:'tyear',label:'Year',type:'number',half:true,dep:'has_trade',ph:'2019'},
        {key:'tmake',label:'Make',type:'text',half:true,dep:'has_trade',ph:'Honda'},
        {key:'tmodel',label:'Model',type:'text',half:true,dep:'has_trade',ph:'Civic'},
        {key:'tmileage',label:'Mileage',type:'number',half:true,dep:'has_trade',ph:'48,200'},
        {key:'tpayoff',label:'Estimated payoff',type:'money',half:true,dep:'has_trade',ph:'12,500'},
        {key:'tcond',label:'Condition',type:'select',half:true,dep:'has_trade',opts:COND} ]},
      CONFIRM ] },
    appointment: { perm:'crm.create', title:'New Appointment', okLabel:'Schedule', done:'Appointment scheduled', steps:[
      { title:'Details', fields:[
        {key:'cust',label:'Customer',type:'text',req:true,ph:'Search or enter name'},
        {key:'date',label:'Date',type:'date',req:true,half:true},
        {key:'time',label:'Time',type:'time',req:true,half:true},
        {key:'type',label:'Appointment type',type:'select',req:true,half:true,opts:['Sales consult','Test drive','Delivery','Trade appraisal','Service','Follow-up']},
        {key:'dur',label:'Duration',type:'select',half:true,opts:['30 min','45 min','60 min','90 min']} ]},
      { title:'Assignment', fields:[
        {key:'rep',label:'Assigned to',type:'select',half:true,opts:['Me','Sales team','BDC','Assign later']},
        {key:'loc',label:'Location',type:'select',half:true,opts:['Showroom','Virtual','Off-site']},
        {key:'vehicle',label:'Vehicle (optional)',type:'text',ph:'2024 RAV4 XLE — Stk T4821'},
        {key:'notes',label:'Notes',type:'textarea',ph:'Anything the team should know…'} ]},
      CONFIRM ] },
    deal: { perm:'crm.create', title:'New Deal', okLabel:'Submit Deal', done:'Deal submitted to desk', steps:[
      { title:'Customer & Vehicle', fields:[
        {key:'cust',label:'Customer',type:'text',req:true,ph:'Search customer…'},
        {key:'vehicle',label:'Vehicle',type:'text',req:true,ph:'2024 RAV4 XLE — Stk T4821'},
        {key:'dtype',label:'Deal type',type:'select',req:true,half:true,opts:['Finance','Lease','Cash']},
        {key:'stock',label:'Stock #',type:'text',half:true,ph:'T4821'} ]},
      { title:'Numbers', fields:[
        {key:'price',label:'Sale price',type:'money',req:true,half:true,ph:'32,995'},
        {key:'trade',label:'Trade allowance',type:'money',half:true,ph:'0'},
        {key:'down',label:'Cash down',type:'money',half:true,ph:'3,000'},
        {key:'apr',label:'APR %',type:'text',half:true,ph:'6.9'},
        {key:'term',label:'Term',type:'select',half:true,opts:['36 mo','48 mo','60 mo','72 mo','84 mo']},
        {key:'monthly',label:'Est. payment',type:'money',half:true,ph:'549'} ]},
      CONFIRM ] },
    vehicle: { perm:'inventory.edit', title:'Add Vehicle', okLabel:'Add to Inventory', done:'Vehicle added to inventory', steps:[
      { title:'Identity', fields:[
        {key:'year',label:'Year',type:'number',req:true,half:true,ph:'2024'},
        {key:'make',label:'Make',type:'text',req:true,half:true,ph:'Toyota'},
        {key:'model',label:'Model',type:'text',req:true,half:true,ph:'RAV4'},
        {key:'trim',label:'Trim',type:'text',half:true,ph:'XLE Premium'},
        {key:'vin',label:'VIN',type:'text',req:true,ph:'1HGBH41JXMN109186'},
        {key:'stock',label:'Stock #',type:'text',half:true,ph:'T4821'},
        {key:'body',label:'Body style',type:'select',half:true,opts:['Sedan','SUV','Truck','Coupe','Van','Hatchback']} ]},
      { title:'Pricing & Details', fields:[
        {key:'mileage',label:'Mileage',type:'number',half:true,ph:'12'},
        {key:'ext',label:'Exterior color',type:'text',half:true,ph:'Blueprint'},
        {key:'intc',label:'Interior color',type:'text',half:true,ph:'Black'},
        {key:'ask',label:'Asking price',type:'money',req:true,half:true,ph:'34,995'},
        {key:'cost',label:'Unit cost',type:'money',half:true,ph:'30,100',note:'Visible to managers only'},
        {key:'status',label:'Status',type:'select',half:true,opts:['Available','In transit','In recon','On hold','Sold']} ]},
      CONFIRM ] },
    appraisal: { perm:'crm.create', title:'New Appraisal', okLabel:'Start Appraisal', done:'Appraisal started', steps:[
      { title:'Vehicle', fields:[
        {key:'year',label:'Year',type:'number',req:true,half:true,ph:'2019'},
        {key:'make',label:'Make',type:'text',req:true,half:true,ph:'Honda'},
        {key:'model',label:'Model',type:'text',req:true,half:true,ph:'Civic'},
        {key:'trim',label:'Trim',type:'text',half:true,ph:'EX'},
        {key:'vin',label:'VIN',type:'text',ph:'2HGFC…'},
        {key:'mileage',label:'Mileage',type:'number',req:true,half:true,ph:'48,200'} ]},
      { title:'Condition', fields:[
        {key:'ext',label:'Exterior',type:'select',half:true,opts:COND},
        {key:'intc',label:'Interior',type:'select',half:true,opts:COND},
        {key:'mech',label:'Mechanical',type:'select',half:true,opts:COND},
        {key:'tires',label:'Tires',type:'select',half:true,opts:['New','Good','50%','Worn']},
        {key:'accidents',label:'Accidents',type:'select',half:true,opts:['None reported','1 minor','1 major','2+']},
        {key:'notes',label:'Reconditioning notes',type:'textarea',ph:'Needs front bumper, detail…'} ]},
      { title:'Valuation', fields:[
        {key:'source',label:'Value source',type:'select',half:true,opts:['MMR','KBB','Black Book','Manual']},
        {key:'value',label:'Appraised value',type:'money',req:true,half:true,ph:'16,750'},
        {key:'payoff',label:'Payoff owed',type:'money',half:true,ph:'12,500'},
        {key:'offer',label:'Customer offer',type:'money',half:true,ph:'16,000'} ]},
      CONFIRM ] },
    task: { perm:'crm.create', title:'Create Task', okLabel:'Create Task', done:'Task created', steps:[
      { title:'Details', fields:[
        {key:'task',label:'Task',type:'text',req:true,ph:'Call back about financing'},
        {key:'assign',label:'Assign to',type:'select',half:true,opts:['Me','Sales team','BDC','Manager']},
        {key:'due',label:'Due date',type:'date',req:true,half:true},
        {key:'time',label:'Time',type:'time',half:true},
        {key:'priority',label:'Priority',type:'select',half:true,opts:['High','Normal','Low']},
        {key:'related',label:'Related to',type:'text',ph:'Customer / deal (optional)'} ]},
      CONFIRM ] },
    message: { perm:'comms.email', title:'New Message', okLabel:'Send', done:'Message sent', steps:[
      { title:'Recipient', fields:[
        {key:'channel',label:'Channel',type:'select',req:true,half:true,opts:['Email','SMS','Both']},
        {key:'to',label:'To',type:'text',req:true,half:true,ph:'customer@email.com'},
        {key:'template',label:'Template',type:'select',half:true,opts:['— None —','Follow-up','Appointment reminder','Thank you','We-owe']} ]},
      { title:'Compose', fields:[
        {key:'subject',label:'Subject',type:'text',ph:'Following up on your visit'},
        {key:'body',label:'Message',type:'textarea',req:true,ph:'Hi Jordan, thanks for stopping by…'} ]},
      CONFIRM ] },
    upload: { perm:'crm.create', title:'Upload Document', okLabel:'Upload', done:'Document uploaded', steps:[
      { title:'File', fields:[
        {key:'fname',label:'Document name',type:'text',req:true,ph:'Driver license — front'},
        {key:'category',label:'Category',type:'select',req:true,half:true,opts:['Contract','ID / License','Insurance','Trade docs','Credit app','Other']},
        {key:'related',label:'Related customer',type:'text',half:true,ph:'Search customer…'} ]},
      { title:'Details', fields:[
        {key:'signers',label:'Requires signature from',type:'select',half:true,opts:['No signature','Buyer','Buyer + Co-buyer','Buyer + Salesperson','All parties']},
        {key:'notes',label:'Notes',type:'textarea',ph:'Optional notes…'} ]},
      CONFIRM ] },
    dashboard: { perm:'reports.custom', title:'Create Dashboard', okLabel:'Create Dashboard', done:'Dashboard created', steps:[
      { title:'Basics', fields:[
        {key:'name',label:'Dashboard name',type:'text',req:true,ph:'Sales Performance — Q3'},
        {key:'audience',label:'Audience',type:'select',half:true,opts:['Just me','Sales team','Managers','Executives']},
        {key:'layout',label:'Layout',type:'select',half:true,opts:['Grid','Columns','Single column']} ]},
      { title:'Widgets', fields:[
        {key:'metrics',label:'Primary metric',type:'select',half:true,opts:['Units sold','Gross profit','Lead conversion','Appointments','F&I penetration']},
        {key:'range',label:'Default range',type:'select',half:true,opts:['Today','7 days','MTD','QTD','YTD']} ]},
      CONFIRM ] },
    campaign: { perm:'admin.automation', title:'New Campaign', okLabel:'Launch Campaign', done:'Campaign launched', steps:[
      { title:'Basics', fields:[
        {key:'name',label:'Campaign name',type:'text',req:true,ph:'Spring Sales Event'},
        {key:'channel',label:'Channel',type:'select',req:true,half:true,opts:['Email','SMS','Both']},
        {key:'audience',label:'Audience',type:'select',req:true,half:true,opts:['All customers','Equity owners','Lapsed leads','Service customers']} ]},
      { title:'Schedule', fields:[
        {key:'start',label:'Start date',type:'date',half:true},
        {key:'send',label:'Send time',type:'time',half:true},
        {key:'msg',label:'Message',type:'textarea',req:true,ph:'Your offer message…'} ]},
      CONFIRM ] }
  };

  function actionKey(label){
    var L = (label||'').toLowerCase();
    if (/prospect|lead/.test(L)) return 'prospect';
    if (/appraisal/.test(L)) return 'appraisal';
    if (/trade/.test(L)) return 'appraisal';
    if (/appointment|schedule|book/.test(L)) return 'appointment';
    if (/deal/.test(L)) return 'deal';
    if (/vehicle|inventory|stock unit/.test(L)) return 'vehicle';
    if (/task|to-?do/.test(L)) return 'task';
    if (/compose|message|email|text|sms/.test(L)) return 'message';
    if (/upload|import file|document|attach/.test(L)) return 'upload';
    if (/dashboard|report|widget/.test(L)) return 'dashboard';
    if (/campaign|blast|broadcast/.test(L)) return 'campaign';
    return null;
  }
  function openAction(label){
    var k = actionKey(label);
    if (k && ACTIONS[k]){
      if (!can(ACTIONS[k].perm)){ toast('You don’t have permission for this action', 'error'); return; }
      wizard(ACTIONS[k]); return;
    }
    simpleModal(label||'New', field(label||'Details','placeholder="…"') + '<div style="font-size:12.5px;color:var(--muted,#6b7a90)">Live demo — no data is saved.</div>', 'Save');
  }
  // expose the create-modal name kept from earlier API
  function createModal(label){ openAction(label); }

  /* ---------------- classification (same test as offline audit) ---------------- */
  var inlineScript = '';
  function collectScripts(){ var out=[]; document.querySelectorAll('script:not([src])').forEach(function(s){ out.push(s.textContent||''); }); inlineScript = out.join('\n'); }
  var GENERIC = {btn:1,'btn-primary':1,'btn-sm':1,'btn-lg':1,'btn-ghost':1,on:1,active:1,sel:1,primary:1,ghost:1,pill:1,tab:1};
  function isWired(btn){
    if (btn.hasAttribute('onclick')) return true;
    if (btn.getAttribute('type')==='submit') return true;
    if (btn.__adWired) return true;
    var toks = [];
    if (btn.id) toks.push(btn.id);
    btn.classList.forEach(function(c){ if(!GENERIC[c]) toks.push(c); });
    for (var a=0;a<btn.attributes.length;a++){ var an=btn.attributes[a].name; if (an.indexOf('data-')===0) toks.push(an); }
    for (var i=0;i<toks.length;i++){ if (inlineScript.indexOf(toks[i]) !== -1) return true; }
    var p = btn.parentElement, hops = 0;
    while (p && hops < 3){ if (p.id && inlineScript.indexOf(p.id) !== -1) return true; hops++; p = p.parentElement; }
    return false;
  }

  var ACTIVE = ['on','active','sel','selected','current','is-active','tab-on','seg-on'];
  function activeClassIn(group){ for (var i=0;i<group.length;i++){ for (var j=0;j<ACTIVE.length;j++){ if (group[i].classList.contains(ACTIVE[j])) return ACTIVE[j]; } } return null; }
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
  function injectCSS(){
    if (document.getElementById('adWireCSS')) return;
    var s = document.createElement('style'); s.id='adWireCSS';
    s.textContent = '@media(max-width:900px){.sidebar.ad-open{display:flex!important;position:fixed;top:0;left:0;bottom:0;z-index:40;width:min(80vw,300px);animation:adSlide .28s cubic-bezier(.2,.8,.2,1)}}'
      + '@keyframes adSlide{from{transform:translateX(-100%)}to{transform:translateX(0)}}'
      + '[data-ad-hidden]{display:none!important}';
    document.head.appendChild(s);
  }

  var TOPBAR_ROUTE = { 'calls':'/communications','messages':'/communications','notifications':'/notifications' };
  function labelOf(btn){ return (btn.getAttribute('aria-label')||btn.getAttribute('title')||btn.textContent||'').replace(/\s+/g,' ').trim(); }

  function handle(btn){
    var lbl = labelOf(btn);
    if (btn.classList.contains('hamb')){ sidebarToggle(); return; }
    var seg = segInfo(btn);
    if (seg){ seg.sibs.forEach(function(s){ ACTIVE.forEach(function(a){ s.classList.remove(a); }); }); btn.classList.add(seg.active); if (lbl) toast('Showing: '+lbl, 'info'); return; }
    if (btn.classList.contains('ib')){
      var key=(btn.getAttribute('aria-label')||'').toLowerCase();
      for (var k in TOPBAR_ROUTE){ if (key.indexOf(k)!==-1){ location.href=TOPBAR_ROUTE[k]; return; } }
      toast(lbl||'Notifications','info'); return;
    }
    if (btn.classList.contains('quick-add')){ quickAddMenu(btn); return; }
    if (actionKey(lbl) || /^(new|add|create|compose|upload|import|schedule|book|submit|start|launch)\b/i.test(lbl) || /add-btn|compose-btn/.test(btn.className) || (btn.classList.contains('qbtn')&&btn.classList.contains('primary'))){
      openAction(lbl||'New'); return;
    }
    var verb = lbl.toLowerCase();
    var VERBS = { call:'📞 Starting call…', text:'💬 Opening SMS…', email:'✉️ Composing email…', video:'🎥 Launching video call…',
      export:'⬇️ Preparing export…', assign:'✅ Assigned', 'follow-up':'⏰ Follow-up set', reminder:'🔔 Reminder sent',
      'send reminder':'🔔 Reminder sent', note:'📝 Note added', service:'🔧 Opening service…', upgrade:'⬆️ Upgrade path opened' };
    for (var v in VERBS){ if (verb===v || verb.indexOf(v)===0){ toast(VERBS[v]); return; } }
    if (lbl) toast(lbl);
    else if (btn.animate){ btn.animate([{transform:'scale(.94)'},{transform:'scale(1)'}],{duration:160}); }
  }

  function quickAddMenu(btn){
    var existing = document.getElementById('adQAMenu'); if(existing){ existing.remove(); return; }
    var r = btn.getBoundingClientRect();
    var items = [['New Prospect','👤','crm.create'],['New Appointment','📅','crm.create'],['New Deal','🤝','crm.create'],['Add Vehicle','🚗','inventory.edit'],['Create Task','✅','crm.create'],['New Message','✉️','comms.email']].filter(function(it){ return can(it[2]); });
    var m = document.createElement('div'); m.id='adQAMenu'; m.setAttribute('data-adui','');
    m.style.cssText='position:fixed;z-index:99997;top:'+(r.bottom+8)+'px;left:'+r.left+'px;min-width:220px;background:var(--card,#fff);border:1px solid var(--line,rgba(15,27,45,.1));border-radius:14px;box-shadow:0 24px 60px -24px rgba(10,22,40,.5);overflow:hidden;padding:6px;';
    m.innerHTML = items.map(function(it){ return '<button class="ad-qa-i" data-l="'+it[0]+'" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;border:none;background:none;padding:10px 12px;border-radius:9px;font:600 13.5px system-ui;color:var(--text,#16202e);cursor:pointer"><span style="font-size:16px">'+it[1]+'</span>'+it[0]+'</button>'; }).join('');
    document.body.appendChild(m);
    m.querySelectorAll('.ad-qa-i').forEach(function(b){ b.addEventListener('mouseenter',function(){ b.style.background='var(--bg,#f1f5f9)'; }); b.addEventListener('mouseleave',function(){ b.style.background='none'; });
      b.addEventListener('click', function(){ m.remove(); openAction(b.getAttribute('data-l')); }); });
    setTimeout(function(){ document.addEventListener('click', function off(ev){ if(!m.contains(ev.target)&&ev.target!==btn){ m.remove(); document.removeEventListener('click', off); } }); }, 0);
  }

  /* ---------------- role gating: hide action buttons the role can't perform ---------------- */
  var VERB_PERM = { export:'reports.export' };
  function permForButton(btn){
    var lbl = labelOf(btn); if(!lbl) return null;
    var k = actionKey(lbl);
    if (k && ACTIONS[k] && /^(new|add|create|compose|upload|import|schedule|book|submit|start|launch|quick add)\b/i.test(lbl)) return ACTIONS[k].perm;
    // "Quick Add" and generic "New X" create entrypoints
    if (/quick add/i.test(lbl)) return 'crm.create';
    var lc = lbl.toLowerCase();
    for (var v in VERB_PERM){ if (lc===v || lc.indexOf(v)===0) return VERB_PERM[v]; }
    return null;
  }
  function gate(btn){
    var perm = permForButton(btn);
    if (perm && !can(perm)){ btn.setAttribute('data-ad-hidden',''); return true; }
    return false;
  }

  /* ---------------- boot ---------------- */
  function wireOne(btn){
    if (btn.__adSeen) return; btn.__adSeen = true;
    if (btn.closest && btn.closest('[data-adui]')) return;   // wire.js's own modal / menu UI
    if (gate(btn)) return;              // hidden for this role → no handler needed
    if (isWired(btn)) return;
    btn.__adWired = true;
    btn.addEventListener('click', function(){ handle(btn); });
    if (!btn.style.cursor) btn.style.cursor = 'pointer';
  }
  function wireAll(){ collectScripts(); injectCSS(); document.querySelectorAll('button').forEach(wireOne); ensureVehicles(); }
  function boot(){ wireAll();
    var mo = new MutationObserver(function(muts){ var add=false; muts.forEach(function(m){ if(m.addedNodes&&m.addedNodes.length) add=true; });
      if(add){ clearTimeout(boot._t); boot._t=setTimeout(function(){ collectScripts(); document.querySelectorAll('button').forEach(wireOne); }, 120); } });
    try { mo.observe(document.body, {childList:true, subtree:true}); } catch(e){}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.ADWire = { toast:toast, wizard:wizard, openAction:openAction, createModal:createModal, ACTIONS:ACTIONS };
})();
