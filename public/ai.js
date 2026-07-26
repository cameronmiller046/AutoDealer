/* AutoDealer AI — persistent, context-aware assistant injected on every CRM page (loaded by roles.js).
   Floating button -> slide-out chat. Knows the current page/customer/vehicle, suggests prompts,
   and performs actions (drafts, bookings, lookups) rather than only answering. Role-aware. */
(function () {
  if (window.__adAiMounted) return; window.__adAiMounted = true;

  var role = (window.ADRoles && window.ADRoles.getRole && window.ADRoles.getRole()) || 'salesperson';
  var isMgr = (role === 'manager');

  /* ---------- context ---------- */
  var PAGES = {
    '/dashboard':['Home',null], '/manager':['Manager Dashboard',null], '/reception':['Front Desk',null],
    '/prospects':['Prospects',null], '/customers':['Customers',null], '/customer':['Customer 360','John Smith'],
    '/appointments':['Appointments',null], '/tasks':['Tasks',null], '/inventory':['Inventory',null],
    '/communications':['Communications','John Smith'], '/reports':['Reports',null], '/deals':['Deal Desk',null],
    '/trades':['Trade Center',null], '/delivery':['Delivery Center',null], '/documents':['Document Center',null],
    '/automations':['Automation Builder',null], '/team':['Sales Team',null], '/checkin':['Visitor Check-In',null], '/admin':['CRM Administration',null],
    '/bdc':['BDC Dashboard',null], '/finance':['Finance Dashboard',null], '/gm':['Executive Dashboard',null],
    '/jacket':['Deal Jacket',null], '/signing':['Contracts',null], '/invintel':['Inventory Intelligence',null]
  };

  /* ---------- specialized AI persona per role ---------- */
  var ROLE_AI = {
    bdc:{ name:'BDC AI', sub:'Your lead-response coach', greet:'I help you respond faster and book more appointments. Which lead should we work first?',
      suggest:['Who needs a response right now?','Write a text to this lead','Book an appointment','Prioritize my lead queue'] },
    finance:{ name:'Finance AI', sub:'Your F&I copilot', greet:'I help you move deals from approval to delivery — lenders, paperwork, products, and funding. What deal are we working?',
      suggest:['Which deals are waiting on finance?','Find missing paperwork','Recommend F&I products','Best lender for this deal'] },
    gm:{ name:'Executive AI', sub:'Your dealership command center', greet:'I watch the whole store and surface what needs your decision. What would you like to know?',
      suggest:['Summarize dealership performance','Where are the bottlenecks?','Forecast this month','Any staffing or inventory actions?'] },
    manager:{ name:'AutoDealer AI', sub:'Your dealership coworker' },
    salesperson:{ name:'AutoDealer AI', sub:'Your dealership coworker' },
    receptionist:{ name:'AutoDealer AI', sub:'Your front-desk assistant' }
  };
  var persona = ROLE_AI[role] || ROLE_AI.salesperson;
  function ctx() {
    var p = (location.pathname.replace(/\/$/,'')||'/');
    var m = PAGES[p] || ['AutoDealer', null];
    var entity = m[1];
    var crumb = document.getElementById('crumbName'); if (crumb && crumb.textContent) entity = crumb.textContent.trim();
    return { page:m[0], path:p, entity:entity };
  }

  var SUGGEST = {
    '/customer':['Summarize this customer','Write a follow-up text','Estimate close probability','Recommend next action'],
    '/customers':['Show customers likely to buy this month','Who has overdue follow-ups?','Summarize my top customer'],
    '/inventory':['Which vehicles should be discounted?','Show aged inventory','Match customers to new arrivals'],
    '/reports':['Explain this chart','Compare Silverado sales vs last month','Who has the fastest response time?'],
    '/appointments':['Summarize today’s appointments','Prepare me for my next appointment','Who hasn’t confirmed?'],
    '/communications':['Draft a reply','Summarize this conversation','Write a follow-up text'],
    '/deals':['Structure this deal to $650/mo','Which deals are stuck?','Summarize deals awaiting finance'],
    '/tasks':['What should I do next?','Show overdue follow-ups','Summarize my day'],
    '/trades':['Which trades have negative equity?','Summarize pending appraisals'],
    '/delivery':['Which deliveries are ready?','What’s left on my next delivery?'],
    '/manager':['Who’s behind on follow-ups?','Summarize team performance','Which reps need coaching?'],
    '/reception':['Who’s waiting in the lobby?','Summarize today’s appointments'],
    'default':['Summarize my day','Who’s likely to buy this week?','Draft a follow-up text','Schedule an appointment']
  };
  function suggestions(){ return SUGGEST[ctx().path] || (persona.suggest) || SUGGEST['default']; }

  /* ---------- response engine (canned but context/role aware; performs "actions") ---------- */
  function avatar(ini,c){ return '<span class="ad-ai-av2" style="background:'+c+'">'+ini+'</span>'; }
  function respond(qraw){
    var q = qraw.toLowerCase(), c = ctx(), who = c.entity || 'John Smith';
    function txt(t){ return {text:t}; }
    function card(t, html){ return {text:t, card:html}; }

    /* ---- BDC AI ---- */
    if (role==='bdc'){
      if (/respon|contact|work first|prioriti|queue|hot/.test(q)){
        return card('Here’s your lead queue, ranked by intent and how long they’ve waited:',
          listCard([['Jessica Tran','JT','#dc2626','2m · pre-qualified · CALL NOW'],['John Smith','JS','#3b82f6','4m · Silverado · viewed pricing 3×'],['Kevin Anderson','KA','#0891b2','18m · opened 2 emails'],['Maria Lopez','ML','#8b5cf6','1h · form fill · no reply yet']]));
      }
      if (/(text|message|write|reply|email).*lead|write.*text|draft/.test(q) || /(text|reply)/.test(q)){
        return card('Drafted a fast, appointment-first response:',
          draftCard('Text · Jessica Tran', 'Hi Jessica! This is Marcus at Premier Auto — great news, you’re pre-qualified on the Highlander. I can hold it for you. Are you free today at 4:30 or would tomorrow morning work better?'));
      }
      if (/book|appointment|schedul/.test(q)){
        return card('Booked it and sent the confirmation — SLA clock stopped.',
          doneCard('Appointment set', 'Jessica Tran · Today 4:30 PM · assigned to Cameron Miller · confirmation text sent'));
      }
      if (/sla|slow|behind|overdue|missed/.test(q)){
        return card('2 leads are approaching the 5-minute SLA — respond now:',
          listCard([['Jessica Tran','JT','#dc2626','4m 10s · SLA in 50s'],['Maria Lopez','ML','#d97706','4m 40s · SLA in 20s']]));
      }
    }
    /* ---- Finance AI ---- */
    if (role==='finance'){
      if (/wait|finance|queue|blocking|stuck/.test(q)){
        return card('3 deals are in your finance queue right now:',
          listCard([['John Smith · Silverado','JS','#3b82f6','Approved · waiting on warranty selection'],['Sarah Lewis · Tahoe','SL','#8b5cf6','Contract out for signature'],['David Johnson · F-150','DJ','#f59e0b','Missing proof of insurance']]));
      }
      if (/paperwork|document|missing/.test(q)){
        return card('AI found a missing document blocking delivery:',
          doneCard('Action needed', 'David Johnson · <b>proof of insurance</b> not on file. I drafted a request text — send before the 2:00 PM delivery.'));
      }
      if (/product|gap|warranty|f&i|penetrat|bundle/.test(q)){
        return card('F&I product recommendations for the Smith deal:',
          listCard([['VSC (Vehicle Service Contract)','','#16a34a','High fit · truck, 72mo term'],['GAP coverage','','#2563eb','Recommended · high LTV'],['Tire & wheel','','#0891b2','Good attach with off-road pkg']]));
      }
      if (/lender|apr|rate|refinanc|approv/.test(q)){
        return card('Best lender options for this credit tier (720 FICO):',
          listCard([['Chase Auto','','#0057b8','6.4% · buy-rate · fastest funding'],['Ally','','#7c3aed','6.6% · flat available'],['Credit Union','','#16a34a','5.9% · member · slower approval']]));
      }
      if (/fund|delay/.test(q)){
        return card('1 deal has a funding delay:',
          doneCard('Funding follow-up', 'Sarah Lewis · Ally hasn’t funded after 3 days — missing odometer statement. I flagged it and drafted a lender note.'));
      }
    }
    /* ---- General Manager / Executive AI ---- */
    if (role==='gm'){
      if (/summar|performanc|how.*doing|overview|store/.test(q)){
        return card('Dealership snapshot — right now:',
          '<div class="ad-ai-sum">'+row('Sold today','7 units')+row('Pace to goal','<b style="color:#16a34a">104%</b>')+row('Gross MTD','$412K')+row('Appointments','23 · 78% confirmed')+row('Finance penetration','<b style="color:#16a34a">+8%</b>')+row('Red flags','2 need attention')+'</div><div class="ad-ai-rec">→ Clear the stuck desk deal and the 2★ review to protect the cushion.</div>');
      }
      if (/bottleneck|stuck|problem|slow|where/.test(q)){
        return card('Top bottlenecks costing you units:',
          listCard([['Negotiation stage','','#dc2626','2.1 days avg · 3× your next-slowest'],['Silverado inventory','','#d97706','Depletes in ~12 days at current pace'],['BDC weekend SLA','','#d97706','Response time up to 9m Fri–Sat']]));
      }
      if (/forecast|project|month|end/.test(q)){
        return card('Month-end forecast:',
          doneCard('On track for 83 units', 'vs 80 goal (104%). Holding 3.2 units/day gets you there. Upside to 86 if you convert the 9 equity-upgrade opportunities.'));
      }
      if (/staff|inventory|acqui|hire|action|recommend/.test(q)){
        return card('AI recommends 2 actions this week:',
          listCard([['Acquire Silverado inventory','','#d97706','Stock depletes in 12 days · demand strong'],['Add BDC weekend coverage','','#2563eb','Recovers ~6 appointments/week'],['Reprice 11 aged units','','#16a34a','Frees ~$0.7M floor plan']]));
      }
      if (/employee|rep|team|coach|who/.test(q)){
        return card('Team performance — who needs attention:',
          listCard([['Marcus Bell','MB','#16a34a','Top performer · model his closes'],['Sarah — 22 overdue follow-ups','SL','#dc2626','Coaching needed'],['Devon & Priya','DW','#d97706','Below 80 coaching score']]));
      }
    }

    if (/summar/.test(q) && (/customer/.test(q) || c.entity || c.path==='/customer')){
      return card('Here’s the 360° summary for '+who+':',
        '<div class="ad-ai-sum">'+
        row('Interested in','2026 Silverado LT')+row('Trade','2019 Ford F-150')+row('Budget','$650 / month')+
        row('Appointment','Tomorrow 3:00 PM')+row('Sentiment','<b style="color:#16a34a">Positive</b>')+row('Close probability','84%')+
        '</div><div class="ad-ai-rec">→ Call before 10 AM to lock in the appointment.</div>');
    }
    if (/(follow.?up|text|message)/.test(q) && !/email/.test(q)){
      return card('Drafted a follow-up text to '+who+':',
        draftCard('Text · '+who, 'Hi '+who.split(' ')[0]+'! Just checking in before your appointment tomorrow — everything’s ready for you on the Silverado. Any questions before you come in?'));
    }
    if (/email/.test(q)){
      return card('Drafted an email to '+who+':',
        draftCard('Email · Following up on the Silverado', 'Hi '+who.split(' ')[0]+', great chatting today. I’ve attached a few payment options on the Silverado LT around your $650/mo target. Happy to adjust the terms — just let me know what works.'));
    }
    if (/schedul|appointment|book/.test(q)){
      return card('Done — I booked it and added it to your schedule.',
        doneCard('Appointment scheduled', who+' · Test Drive · Tomorrow 3:00 PM · assigned to you'));
    }
    if (/(likely|ready).*(buy|purchase|upgrade)/.test(q) || /who.*buy/.test(q)){
      return card('Top customers likely to buy this month, ranked by AI equity + engagement:',
        listCard([['John Smith','JS','#3b82f6','92% · lease ends in 9mo'],['Priya Nair','PN','#f43f5e','88% · +$6.4k equity'],['Kevin Anderson','KA','#0ea5e9','66% · trade value up $1.4k'],['Robert Brown','RB','#14b8a6','78% · finance approved']]));
    }
    if (/overdue|behind/.test(q)){
      if (isMgr) return card('5 reps have overdue follow-ups — concentrated in two queues:',
        listCard([['Michael Davis','MD','#14b8a6','7 overdue · not logged in today'],['Priya Nair','PN','#f43f5e','4 overdue'],['Sarah Johnson','SJ','#8b5cf6','3 overdue']]));
      return card('You have 2 overdue follow-ups. Want me to draft messages for both?',
        listCard([['Marcus Webb','MB','#10b981','No reply in 4 days'],['Grace Kim','GK','#eab308','Awaiting availability']]));
    }
    if (/today.*appoint|summar.*today|appoint.*today/.test(q)){
      return card('You have 5 appointments today. Here’s the rundown:',
        listCard([['9:00 · John Smith','JS','#3b82f6','Test Drive · Silverado · Confirmed'],['10:30 · Amanda Harris','AH','#ec4899','Sales · Equinox · Confirmed'],['1:00 · Robert Brown','RB','#14b8a6','Finance · Confirmed'],['2:00 · Sarah Lewis','SL','#8b5cf6','Delivery · Tahoe']]));
    }
    if (/payment|monthly|calculat|\$\d/.test(q)){
      var m = q.match(/\$?(\d{3,4})/); var target = m?('$'+m[1]):'$650';
      return card('For the Silverado LT ($74,300, $5k down, $4,800 net trade):',
        doneCard('Estimated payment', '72 mo @ 6.9% = <b>$1,140/mo</b>. To hit '+target+'/mo, add ~$8,900 down or extend to 84 mo ($1,009/mo).'));
    }
    if (/discount|aged|sitting|price.?drop/.test(q)){
      return card('These vehicles are aging and are strong discount candidates:',
        listCard([['2023 Corvette Stingray','','#c62b2b','64 days · recommend -$500'],['2022 F-150 XLT','','#b6bac0','52 days · in service'],['2024 Equinox RS','','#3a7ca5','41 days · steady interest']]));
    }
    if (/match.*(customer|arrival|inventory)/.test(q)){
      return card('4 customers match today’s Colorado Trail Boss arrival:',
        listCard([['Amanda Harris','AH','#ec4899','Requested a Trail Boss'],['Kevin Anderson','KA','#0ea5e9','Views trucks weekly'],['David Johnson','DJ','#f59e0b','Trade upgrade fit']]));
    }
    if (/explain.*chart|explain this|what.*chart/.test(q)){
      return txt('Sales are up 14% vs last month, driven by a 26% jump in Silverado deliveries. The dip mid-month lines up with the show-rate drop — appointments were set but not confirmed. Recovering confirmations would close the gap.');
    }
    if (/report|generate/.test(q)){
      return card('Generated a manager summary report for this week.',
        doneCard('Report ready', 'Sales +14% · Show rate -6% · Closing 34% · 3 reps flagged for coaching. Exported as PDF.'));
    }
    if (/prospect|new lead|create.*customer/.test(q)){
      return card('Created a new prospect and assigned it to you.',
        doneCard('Prospect created', 'Added to your Prospects — Needs Action queue with a first-touch task due in 30 min.'));
    }
    if (/stuck|awaiting finance|which deal/.test(q)){
      return card('2 deals are stuck in the pipeline:',
        listCard([['Sarah Lewis','SL','#8b5cf6','Finance · 3 days, no F&I response'],['David Johnson','DJ','#f59e0b','Trade · negative equity to resolve']]));
    }
    if (/coach|need help|improve/.test(q) && isMgr){
      return card('Two reps would benefit from coaching this week:',
        listCard([['Michael Davis','MD','#14b8a6','Low CRM logins · slow response'],['Sarah Johnson','SJ','#8b5cf6','Response time up to 6m today']]));
    }
    if (/waiting|lobby/.test(q)){
      return card('2 guests are waiting in the lobby:',
        listCard([['Michael Williams','MW','#a855f7','7 min · looking at Tahoe · unassigned'],['Jessica Davis','JD','#6366f1','3 min · looking at Accord']]));
    }
    if (/day|my schedule|what.*do next|priorit/.test(q)){
      return card('Here’s your focus for today:',
        listCard([['Call John Smith','','#2563eb','Viewed pricing 3× · appt tomorrow'],['Text Marcus Webb','','#0891b2','No reply in 4 days'],['Prep 2 PM delivery','','#16a34a','Sarah Lewis · Tahoe']]));
    }
    return txt('On the '+c.page+' page I can summarize, draft messages, schedule appointments, look up customers or inventory, calculate payments, and take actions for you. Try a suggested prompt below, or tell me what you need.');
  }
  function row(k,v){ return '<div class="ad-ai-row"><span>'+k+'</span><b>'+v+'</b></div>'; }
  function draftCard(title, body){ return '<div class="ad-ai-draft"><div class="ad-ai-dh">'+title+'</div><div class="ad-ai-db">'+body+'</div><div class="ad-ai-da"><button class="ad-ai-b1" data-act="send">Send</button><button class="ad-ai-b2" data-act="edit">Edit</button></div></div>'; }
  function doneCard(title, body){ return '<div class="ad-ai-done"><span class="ad-ai-dck"><svg viewBox="0 0 24 24"><path d="M5 12.5l4 4 10-10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><b>'+title+'</b><span>'+body+'</span></div></div>'; }
  function listCard(items){ return '<div class="ad-ai-list">'+items.map(function(it){ return '<div class="ad-ai-li">'+(it[1]?'<span class="ad-ai-av3" style="background:'+it[2]+'">'+it[1]+'</span>':'<span class="ad-ai-dot" style="background:'+it[2]+'"></span>')+'<div><b>'+it[0]+'</b><span>'+it[3]+'</span></div></div>'; }).join('')+'</div>'; }

  /* ---------- DOM + styles ---------- */
  function css(){ return ''+
  '.ad-ai-fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#2563eb);box-shadow:0 14px 34px -10px rgba(37,99,235,.7);display:flex;align-items:center;justify-content:center;z-index:9990;transition:transform .15s;}'+
  '.ad-ai-fab:hover{transform:scale(1.06);}.ad-ai-fab svg{width:26px;height:26px;color:#fff;}'+
  '.ad-ai-fab::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 0 rgba(124,58,237,.5);animation:adaiPulse 2.4s infinite;}'+
  '@keyframes adaiPulse{0%{box-shadow:0 0 0 0 rgba(124,58,237,.5)}70%{box-shadow:0 0 0 14px rgba(124,58,237,0)}100%{box-shadow:0 0 0 0 rgba(124,58,237,0)}}'+
  '.ad-ai-scrim{position:fixed;inset:0;background:rgba(10,20,36,.35);z-index:9991;opacity:0;pointer-events:none;transition:opacity .2s;}.ad-ai-scrim.show{opacity:1;pointer-events:auto;}'+
  '.ad-ai-panel{position:fixed;top:0;right:0;bottom:0;width:410px;max-width:96vw;background:#f6f8fb;z-index:9992;box-shadow:-20px 0 60px -30px rgba(0,0,0,.5);transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;font-family:Inter,system-ui,sans-serif;}'+
  '.ad-ai-panel.open{transform:none;}'+
  '.ad-ai-hd{background:linear-gradient(135deg,#0f1b3a,#0a1c38);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:11px;}'+
  '.ad-ai-hd .logo{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#3b82f6);display:flex;align-items:center;justify-content:center;flex:none;}.ad-ai-hd .logo svg{width:19px;height:19px;color:#fff;}'+
  '.ad-ai-hd b{font-size:15px;font-weight:800;}.ad-ai-hd .sub{font-size:11.5px;color:#9db4d6;}'+
  '.ad-ai-hd .x{margin-left:auto;background:rgba(255,255,255,.12);border:none;color:#fff;width:32px;height:32px;border-radius:9px;cursor:pointer;}.ad-ai-hd .x svg{width:16px;height:16px;}'+
  '.ad-ai-hd .hbtn{background:rgba(255,255,255,.12);border:none;color:#fff;width:32px;height:32px;border-radius:9px;cursor:pointer;}.ad-ai-hd .hbtn svg{width:16px;height:16px;}'+
  '.ad-ai-ctx{display:flex;align-items:center;gap:7px;padding:9px 18px;background:#eef4ff;border-bottom:1px solid #e2ebfa;font-size:12px;color:#3358a8;font-weight:600;}.ad-ai-ctx svg{width:14px;height:14px;}.ad-ai-ctx b{color:#1e3a8a;}'+
  '.ad-ai-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;}'+
  '.ad-ai-msg{display:flex;gap:9px;max-width:92%;}.ad-ai-msg.user{margin-left:auto;flex-direction:row-reverse;}'+
  '.ad-ai-msg .a{width:26px;height:26px;border-radius:8px;flex:none;display:flex;align-items:center;justify-content:center;}.ad-ai-msg .a svg{width:15px;height:15px;color:#fff;}'+
  '.ad-ai-ai .a{background:linear-gradient(135deg,#7c3aed,#3b82f6);}'+
  '.ad-ai-bub{padding:10px 13px;border-radius:14px;font-size:13.5px;line-height:1.5;}'+
  '.ad-ai-ai .ad-ai-bub{background:#fff;border:1px solid #eef1f6;border-bottom-left-radius:5px;color:#16202e;box-shadow:0 1px 2px rgba(16,32,60,.04);}'+
  '.ad-ai-user .ad-ai-bub{background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;border-bottom-right-radius:5px;}'+
  '.ad-ai-chips{display:flex;flex-wrap:wrap;gap:7px;padding:2px 2px 4px;}'+
  '.ad-ai-chip{border:1px solid #dbe4f0;background:#fff;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:600;color:#3358a8;cursor:pointer;}.ad-ai-chip:hover{background:#2563eb;color:#fff;border-color:#2563eb;}'+
  '.ad-ai-typing{display:inline-flex;gap:4px;padding:12px 14px;}.ad-ai-typing i{width:7px;height:7px;border-radius:50%;background:#c3ccd8;animation:adaiTd 1.2s infinite;}.ad-ai-typing i:nth-child(2){animation-delay:.2s}.ad-ai-typing i:nth-child(3){animation-delay:.4s}@keyframes adaiTd{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}'+
  '.ad-ai-sum{margin-top:8px;border:1px solid #eef1f6;border-radius:10px;overflow:hidden;}.ad-ai-row{display:flex;justify-content:space-between;padding:8px 12px;font-size:12.5px;border-top:1px solid #f2f5f9;}.ad-ai-row:first-child{border-top:none;}.ad-ai-row span{color:#6b7a90;}.ad-ai-row b{font-weight:600;}'+
  '.ad-ai-rec{margin-top:9px;color:#16a34a;font-weight:700;font-size:12.5px;}'+
  '.ad-ai-draft{margin-top:8px;border:1px solid #eef1f6;border-radius:11px;overflow:hidden;background:#fff;}.ad-ai-dh{padding:9px 12px;background:#f7f9fc;font-size:11px;font-weight:800;letter-spacing:.3px;text-transform:uppercase;color:#6b7a90;border-bottom:1px solid #eef1f6;}.ad-ai-db{padding:11px 12px;font-size:13px;color:#334155;line-height:1.5;}.ad-ai-da{display:flex;gap:7px;padding:0 12px 12px;}.ad-ai-b1{border:none;background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;border-radius:8px;padding:8px 15px;font-size:12.5px;font-weight:700;cursor:pointer;}.ad-ai-b2{border:1px solid #eef1f6;background:#fff;color:#16202e;border-radius:8px;padding:8px 13px;font-size:12.5px;font-weight:700;cursor:pointer;}'+
  '.ad-ai-done{margin-top:8px;display:flex;gap:11px;align-items:flex-start;background:linear-gradient(180deg,#f2fbf5,#fff);border:1px solid #cdebd8;border-radius:11px;padding:12px;}.ad-ai-dck{width:26px;height:26px;border-radius:50%;background:#16a34a;color:#fff;display:flex;align-items:center;justify-content:center;flex:none;}.ad-ai-dck svg{width:15px;height:15px;}.ad-ai-done b{font-size:13px;font-weight:700;display:block;}.ad-ai-done span{font-size:12.5px;color:#475569;line-height:1.5;}'+
  '.ad-ai-list{margin-top:8px;border:1px solid #eef1f6;border-radius:11px;overflow:hidden;}.ad-ai-li{display:flex;gap:10px;align-items:center;padding:10px 12px;border-top:1px solid #f2f5f9;}.ad-ai-li:first-child{border-top:none;}.ad-ai-av3{width:30px;height:30px;border-radius:50%;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none;}.ad-ai-dot{width:10px;height:10px;border-radius:50%;flex:none;}.ad-ai-li b{font-size:13px;font-weight:600;display:block;}.ad-ai-li span{font-size:11.5px;color:#6b7a90;}'+
  '.ad-ai-foot{border-top:1px solid #eef1f6;background:#fff;padding:12px;}'+
  '.ad-ai-inp{display:flex;align-items:flex-end;gap:8px;border:1px solid #e2e8f2;border-radius:13px;padding:8px 10px;}.ad-ai-inp:focus-within{border-color:#2563eb;box-shadow:0 0 0 3px #eef4ff;}'+
  '.ad-ai-inp textarea{flex:1;border:none;outline:none;resize:none;font:inherit;font-size:13.5px;max-height:90px;min-height:22px;padding:2px 0;background:none;}'+
  '.ad-ai-mic,.ad-ai-snd{border:none;width:34px;height:34px;border-radius:9px;flex:none;cursor:pointer;display:flex;align-items:center;justify-content:center;}.ad-ai-mic{background:#f1f4f8;color:#6b7a90;}.ad-ai-mic.rec{background:#fdeaea;color:#dc2626;}.ad-ai-mic svg{width:17px;height:17px;}.ad-ai-snd{background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;}.ad-ai-snd svg{width:17px;height:17px;}'+
  '.ad-ai-hint{text-align:center;font-size:10.5px;color:#97a4b6;margin-top:7px;}'+
  '@media (max-width:560px){.ad-ai-fab{bottom:16px;right:16px;}}'; }

  var sparkle='<svg viewBox="0 0 24 24"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" fill="currentColor"/></svg>';
  var st=document.createElement('style'); st.textContent=css(); document.head.appendChild(st);

  var fab=document.createElement('button'); fab.className='ad-ai-fab'; fab.id='ad-ai-fab'; fab.setAttribute('aria-label','AutoDealer AI'); fab.innerHTML=sparkle;
  var scrim=document.createElement('div'); scrim.className='ad-ai-scrim';
  var panel=document.createElement('aside'); panel.className='ad-ai-panel'; panel.setAttribute('aria-hidden','true');
  panel.innerHTML=''+
    '<div class="ad-ai-hd"><span class="logo">'+sparkle+'</span><div><b>'+persona.name+'</b><div class="sub">'+persona.sub+'</div></div>'+
      '<button class="hbtn" id="adAiNew" title="New chat"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'+
      '<button class="x" id="adAiClose"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>'+
    '<div class="ad-ai-ctx" id="adAiCtx"></div>'+
    '<div class="ad-ai-body" id="adAiBody"></div>'+
    '<div class="ad-ai-foot"><div class="ad-ai-inp"><textarea id="adAiText" rows="1" placeholder="Ask anything, or tell me to do something…"></textarea>'+
      '<button class="ad-ai-mic" id="adAiMic" title="Voice"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button>'+
      '<button class="ad-ai-snd" id="adAiSend"><svg viewBox="0 0 24 24"><path d="M4 12l16-8-6 16-2.5-6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M11.5 14L20 4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></button></div>'+
      '<div class="ad-ai-hint">AutoDealer AI knows your current page · answers are role-aware</div></div>';
  document.body.appendChild(fab); document.body.appendChild(scrim); document.body.appendChild(panel);

  var body=document.getElementById('adAiBody');
  function open(){ panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); scrim.classList.add('show'); refreshCtx(); if(!body.dataset.init){ greet(); body.dataset.init='1'; } setTimeout(function(){ var t=document.getElementById('adAiText'); if(t) t.focus(); },200); }
  function close(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); scrim.classList.remove('show'); }
  fab.addEventListener('click', open); scrim.addEventListener('click', close);
  document.getElementById('adAiClose').addEventListener('click', close);
  document.getElementById('adAiNew').addEventListener('click', function(){ body.innerHTML=''; greet(); });

  function refreshCtx(){ var c=ctx(); var el=document.getElementById('adAiCtx');
    el.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v4l2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'+(c.entity?('Viewing <b>'+c.entity+'</b> · '+c.page):('Page: <b>'+c.page+'</b>')); }

  function addUser(t){ var d=document.createElement('div'); d.className='ad-ai-msg user ad-ai-user'; d.innerHTML='<span class="a" style="background:linear-gradient(135deg,#3f9bff,#0b57b8)"><svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="3.4" fill="#fff"/><path d="M5.5 19c0-3.2 3-5 6.5-5s6.5 1.8 6.5 5" fill="#fff"/></svg></span><div class="ad-ai-bub">'+t+'</div>'; body.appendChild(d); body.scrollTop=body.scrollHeight; }
  function addChips(){ var arr=suggestions(); var d=document.createElement('div'); d.className='ad-ai-chips'; d.innerHTML=arr.map(function(s){ return '<button class="ad-ai-chip">'+s+'</button>'; }).join(''); body.appendChild(d); d.querySelectorAll('.ad-ai-chip').forEach(function(b){ b.addEventListener('click', function(){ ask(b.textContent); }); }); body.scrollTop=body.scrollHeight; }
  function greet(){ var c=ctx(); var intro=persona.greet?(' '+persona.greet):' Ask me anything or tell me to take an action — here are some ideas:'; var m=document.createElement('div'); m.className='ad-ai-msg ad-ai-ai'; m.innerHTML='<span class="a">'+sparkle+'</span><div class="ad-ai-bub">Hi! I’m <b>'+persona.name+'</b>. I can see you’re on <b>'+c.page+'</b>'+(c.entity?(' looking at <b>'+c.entity+'</b>'):'')+'.'+intro+'</div>'; body.appendChild(m); addChips(); }

  function stream(html, card){
    var wrap=document.createElement('div'); wrap.className='ad-ai-msg ad-ai-ai'; wrap.innerHTML='<span class="a">'+sparkle+'</span><div class="ad-ai-bub"><span class="ad-ai-typing"><i></i><i></i><i></i></span></div>';
    body.appendChild(wrap); body.scrollTop=body.scrollHeight;
    var bub=wrap.querySelector('.ad-ai-bub');
    setTimeout(function(){
      var words=html.split(' '), i=0; bub.innerHTML='';
      (function typ(){ if(i<words.length){ bub.innerHTML+=(i?' ':'')+words[i++]; body.scrollTop=body.scrollHeight; setTimeout(typ, 22); }
        else if(card){ var cd=document.createElement('div'); cd.innerHTML=card; bub.appendChild(cd.firstChild||cd); wireCard(bub); body.scrollTop=body.scrollHeight; } })();
    }, 480);
  }
  function wireCard(scope){ scope.querySelectorAll('[data-act]').forEach(function(b){ b.addEventListener('click', function(){ var a=b.getAttribute('data-act'); toast(a==='send'?'Message sent ✓':'Opening editor…'); }); }); }

  function ask(q){ if(!q||!q.trim()) return; addUser(q.trim()); var r=respond(q.trim()); stream(r.text, r.card); var t=document.getElementById('adAiText'); if(t){ t.value=''; t.style.height='auto'; } }

  var ta=document.getElementById('adAiText');
  ta.addEventListener('input', function(){ ta.style.height='auto'; ta.style.height=Math.min(90,ta.scrollHeight)+'px'; });
  ta.addEventListener('keydown', function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); ask(ta.value); } });
  document.getElementById('adAiSend').addEventListener('click', function(){ ask(ta.value); });

  /* voice */
  var mic=document.getElementById('adAiMic');
  mic.addEventListener('click', function(){
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ toast('Voice input isn’t available in this browser'); return; }
    try{ var r=new SR(); r.lang='en-US'; r.onstart=function(){ mic.classList.add('rec'); toast('Listening…'); };
      r.onresult=function(e){ ta.value=e.results[0][0].transcript; }; r.onend=function(){ mic.classList.remove('rec'); }; r.start(); }
    catch(err){ toast('Voice input unavailable'); }
  });

  document.addEventListener('keydown', function(e){ if(e.key==='Escape'&&panel.classList.contains('open')) close();
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='j'){ e.preventDefault(); panel.classList.contains('open')?close():open(); } });

  var toastEl;
  function toast(msg){ if(!toastEl){ toastEl=document.createElement('div'); toastEl.style.cssText='position:fixed;bottom:92px;right:24px;background:#0f1b2d;color:#fff;padding:11px 16px;border-radius:11px;font:600 12.5px Inter,sans-serif;box-shadow:0 20px 40px -16px rgba(0,0,0,.5);opacity:0;transform:translateY(12px);transition:all .25s;z-index:9999;'; document.body.appendChild(toastEl); } toastEl.textContent=msg; toastEl.style.opacity='1'; toastEl.style.transform='none'; clearTimeout(toastEl._t); toastEl._t=setTimeout(function(){ toastEl.style.opacity='0'; toastEl.style.transform='translateY(12px)'; },2200); }

  window.ADAI={ open:open, close:close, ask:ask };
})();
