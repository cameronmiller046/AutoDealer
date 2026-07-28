/* AutoDealer — AI communication summaries (ADSummary).
   Generates concise, contextual summaries for a whole conversation and for individual
   communications (calls, texts, emails, videos). Used by the contact center, the call
   screen, and the customer timeline. (Demo intelligence: deterministic from the
   message content, channel mix, sentiment cues, and vehicle/deal context.)
     ADSummary.conversation(c)  -> { overview, topics[], sentiment:{k,c}, nextStep, commitment }
     ADSummary.message(m, c)    -> one-line summary string for a single message */
(function(){
  if (window.ADSummary) return;
  function first(n){ return (n||'the customer').split(' ')[0]; }
  function vshort(v){ return (v||'the vehicle').replace(/^\d+\s+/,''); }

  var KW = [
    [/financ|apr|payment|month|rate|\bdown\b|lease/i,'Financing'],
    [/trade|trade-in|payoff|equity/i,'Trade-in'],
    [/test drive|\bdrive\b|come in|saturday|sunday|visit|appointment|stop by/i,'Test drive / visit'],
    [/price|best price|discount|deal|out the door|otd|lowest/i,'Pricing'],
    [/tow|package|feature|color|trim|awd|4wd|mileage|options|spec/i,'Features & specs'],
    [/available|in stock|arriv|when|ready|hold/i,'Availability'],
    [/warranty|service|maintenance|recall/i,'Service']
  ];
  function topics(c){ var t={}, txt=((c.msgs||[]).map(function(m){return (m.body||'')+' '+(m.subject||'');}).join(' ')+' '+(c.veh||'')); KW.forEach(function(k){ if(k[0].test(txt)) t[k[1]]=1; }); var arr=Object.keys(t); return arr.length?arr.slice(0,4):['General inquiry']; }
  function sentiment(c){ var msgs=c.msgs||[]; var txt=msgs.map(function(m){return m.body||'';}).join(' ').toLowerCase();
    var noAns=msgs.some(function(m){return /no answer|missed|voicemail/i.test(m.status||'');});
    if(/thank|love|great|perfect|awesome|excited|see you|looking forward|sounds good|yes/.test(txt)) return {k:'Positive',c:'#16a34a'};
    if(/best price|too (much|expensive|high)|not sure|still thinking|hold off|maybe later|shopping around/.test(txt)) return {k:'Price-sensitive',c:'#d97706'};
    if(noAns && msgs.filter(function(m){return m.dir==='in';}).length===0) return {k:'Needs a nudge',c:'#d97706'};
    return {k:'Engaged',c:'#2563eb'};
  }
  function lastInbound(c){ var ins=(c.msgs||[]).filter(function(m){return m.dir==='in' && /text|facebook|chat/.test(m.type);}); return ins.length?ins[ins.length-1].body:''; }

  function conversation(c){
    c=c||{}; var msgs=c.msgs||[]; var s=sentiment(c), tp=topics(c), li=lastInbound(c);
    var calls=msgs.filter(function(m){return m.type==='call';}).length,
        emails=msgs.filter(function(m){return m.type==='email';}).length,
        vids=msgs.filter(function(m){return m.type==='video';}).length,
        texts=msgs.filter(function(m){return /text|facebook|chat/.test(m.type);}).length;
    var mix=[]; if(texts)mix.push(texts+' text'+(texts>1?'s':'')); if(calls)mix.push(calls+' call'+(calls>1?'s':'')); if(emails)mix.push(emails+' email'+(emails>1?'s':'')); if(vids)mix.push(vids+' video'+(vids>1?'s':''));
    var mood = s.k==='Positive'?'engaged and positive':s.k==='Price-sensitive'?'focused on price':s.k==='Needs a nudge'?'gone quiet and needs a nudge':'actively engaged';
    var overview = first(c.name)+' is '+mood+' on the '+vshort(c.veh)+'.'+(mix.length?(' Conversation so far: '+mix.join(', ')+'.'):'')+(li?(' Latest from them: “'+li.slice(0,90)+'”.'):'');
    var next = c.rec || (s.k==='Price-sensitive'?'Send a payment estimate and offer to hold the vehicle at today’s price.':s.k==='Needs a nudge'?'Send a friendly check-in text, then follow with a call if no reply.':'Confirm the next step — offer a test drive or lock an appointment.');
    var commitment = msgs.some(function(m){return m.type==='appt'||/test drive|saturday|appointment|come in|stop by/i.test(m.body||'');}) ? 'Test drive / visit has been discussed.' : (c.timeline?('Buying timeline: '+c.timeline+'.'):'No firm commitment yet.');
    return { overview:overview, topics:tp, sentiment:s, nextStep:next, commitment:commitment };
  }

  function message(m,c){
    c=c||{}; if(!m) return '';
    if(m.type==='call'){ var conn=/connected/i.test(m.status||''); return conn
      ? ('Live call — reviewed the '+vshort(c.veh)+' and pricing; customer engaged and agreed to next steps.')
      : ('Call not connected ('+(m.status||'no answer')+') — voicemail left; follow up by text within the hour.'); }
    if(m.type==='email'){ var opened=/open/i.test((m.status||'')+' '+(m.foot||'')); return 'Email “'+(m.subject||'message')+'”'+(opened?' — opened'+(/click/i.test(m.foot||'')?' and clicked':'')+' by the customer; strong moment to follow up.':' — sent, awaiting an open.'); }
    if(m.type==='video'){ var w=m.watch||0; return 'Personalized video ('+(m.subject||'walkaround')+') — '+(w>=70?('watched '+w+'%; high intent, call now.'):w>0?('watched '+w+'% so far.'):'not opened yet.'); }
    if(/text|facebook|chat/.test(m.type)){ return (m.dir==='in'?'Customer asked: ':'You replied: ')+'“'+(m.body||'').slice(0,80)+'”'; }
    if(m.type==='note'){ return 'Internal note logged.'; }
    return '';
  }

  window.ADSummary = { conversation:conversation, message:message };
})();
