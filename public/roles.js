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
    trades:'<path d="M4 8h13l-3-3M20 16H7l3 3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    delivery:'<path d="M5 8l7-4 7 4v8l-7 4-7-4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 11l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    documents:'<path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    automations:'<circle cx="6" cy="6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="12" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="6" cy="18" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.4 6H14a2 2 0 0 1 2 2v1.6M8.4 18H14a2 2 0 0 0 2-2v-1.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    migrate:'<path d="M12 3v10m0 0l-4-4m4 4l4-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    equity:'<path d="M4 16l5-5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7h5v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    tv:'<rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 20h6M12 16v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    feedback:'<path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1 1 1.9h5c.1-.9.4-1.4 1-1.9A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.5 19h5M10.5 21.5h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    health:'<path d="M3 12h4l2-5 4 10 2-5h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    marketing:'<path d="M3 11l13-6v14L3 13v4H1v-6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M16 8a3 3 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    recovery:'<path d="M3.5 12a8 8 0 1 0 2.3-5.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M3 4v4h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    sentiment:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 14a4 4 0 0 0 7 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/>',
    settings:'<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M18.5 5.5l-2 2M7.5 16.5l-2 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    phone:'<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    eye:'<path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" stroke-width="1.7"/>',
    portal:'<rect x="3" y="4" width="18" height="14" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 8h18M7 21h10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="6" cy="6" r="0.9" fill="currentColor"/>',
    reviews:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    coach:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
    signing:'<path d="M4 19c3-1 4-8 6-8s1 4 3 4 2.5-3 4-3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 6l3 3-8 8H7v-3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    showroom:'<path d="M4 10l1.6-4A2 2 0 0 1 7.5 5h9a2 2 0 0 1 1.9 1.4L20 10M4 10h16v9H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 19v-4h8v4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="7" cy="13" r="0.9" fill="currentColor"/><circle cx="17" cy="13" r="0.9" fill="currentColor"/>',
    training:'<path d="M12 4L2.5 9 12 14l9.5-5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5M21.5 9v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    analytics:'<path d="M4 20V4M20 20H4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M7 15l3.5-4 3 2.5L20 7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="7" r="1.4" fill="currentColor"/>',
    invintel:'<path d="M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v5h-3v-2H6v2H3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="11.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M13.6 13.1L15 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    service:'<path d="M14.5 5.5a3.5 3.5 0 0 1-4.6 4.6L5 15l2 2 4.9-4.9a3.5 3.5 0 0 0 4.6-4.6l-2.2 2.2-1.8-1.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    whiteboard:'<rect x="3" y="4" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 17v3M8.5 20h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M6.5 12l2.5-3 2 2.4L14 7.5l3.5 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    marketplace:'<path d="M4 8h16l-1 3.5a2 2 0 0 1-2 1.5H7a2 2 0 0 1-2-1.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 8l1.4-3.2A1 1 0 0 1 6.3 4h11.4a1 1 0 0 1 .9.8L20 8M6 13v7h12v-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    referrals:'<circle cx="7" cy="8" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.5 18c0-2.6 2-4.2 4.5-4.2s4.5 1.6 4.5 4.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M16 6l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.5 12.5a3 3 0 1 1 3 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    aimanager:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9.5 11.5l1.8 1.8 3.2-3.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    bell:'<path d="M12 3a6 6 0 0 0-6 6c0 4-2 6-2 6h16s-2-2-2-6a6 6 0 0 0-6-6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.7"/>',
    chat:'<path d="M4 5.5h16v10H10l-4 3.5v-3.5H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    knowledge:'<path d="M5 4h9a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M17 7a3 3 0 0 1 3-3v13.5a2.5 2.5 0 0 0-2.5-2.5H17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    dataquality:'<ellipse cx="12" cy="6" rx="7" ry="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 6v6c0 1.4 3.1 2.6 7 2.6M19 6v4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14.5 18l2 2 4-4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    status:'<rect x="3.5" y="4" width="17" height="6" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3.5" y="14" width="17" height="6" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="17" r="1" fill="currentColor"/>',
    developers:'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    stores:'<path d="M4 9l1.4-3.6A1 1 0 0 1 6.3 5h11.4a1 1 0 0 1 .9.6L20 9M4 9h16M4 9v10h16V9M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'
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
        {label:'Equity Mining', href:'/equity', icon:'equity', badge:'11'},
        {label:'Recovery', href:'/recovery', icon:'recovery', badge:'8'},
        {label:'Referrals', href:'/referrals', icon:'referrals', badge:'3'},
        {label:'Trade Center', href:'/trades', icon:'trades'},
        {label:'Delivery Center', href:'/delivery', icon:'delivery', badge:'2'},
        {label:'Inventory', href:'/inventory', icon:'inventory', tag:'Read-only'},
        {label:'Inventory Intel', href:'/invintel', icon:'invintel'},
        {label:'Communications', href:'/communications', icon:'comms', badge:'3'},
        {label:'Team Chat', href:'/chat', icon:'chat', badge:'2'},
        {label:'Reports', href:'/reports', icon:'reports'},
        {label:'CRM Health', href:'/health', icon:'health'},
        {label:'Sales Coach', href:'/coach', icon:'coach'},
        {label:'Training', href:'/training', icon:'training', badge:'2'},
        {label:'My Reviews', href:'/reviews', icon:'reviews'},
        {label:'e-Signature', href:'/signing', icon:'signing'},
        {label:'Knowledge', href:'/knowledge', icon:'knowledge'},
        {label:'Help & Feedback', href:'/feedback', icon:'feedback'},
        {label:'Settings', href:'/settings', icon:'settings'}
      ]
    },
    manager: {
      name:'Dana Morales', title:'Sales Manager', avatar:'DM', home:'/manager',
      nav:[
        {label:'Dashboard', href:'/manager', icon:'home'},
        {label:'AI Manager', href:'/aimanager', icon:'aimanager', tag:'AI'},
        {label:'Showroom Ops', href:'/showroom', icon:'showroom', tag:'Live'},
        {label:'Prospects', href:'/prospects', icon:'prospects', badge:'64'},
        {label:'Customers', href:'/customers', icon:'customers'},
        {label:'Appointments', href:'/appointments', icon:'appt', badge:'23'},
        {label:'Deal Desk', href:'/deals', icon:'deals', badge:'3'},
        {label:'Equity Mining', href:'/equity', icon:'equity', badge:'11'},
        {label:'Recovery', href:'/recovery', icon:'recovery', badge:'8'},
        {label:'Trade Center', href:'/trades', icon:'trades', badge:'2'},
        {label:'Delivery Center', href:'/delivery', icon:'delivery'},
        {label:'Tasks', href:'/tasks', icon:'tasks'},
        {label:'Inventory', href:'/inventory', icon:'inventory'},
        {label:'Inventory Intel', href:'/invintel', icon:'invintel'},
        {label:'Communications', href:'/communications', icon:'comms'},
        {label:'Team Chat', href:'/chat', icon:'chat', badge:'2'},
        {label:'Reports', href:'/reports', icon:'reports'},
        {label:'Workflow Analytics', href:'/analytics', icon:'analytics'},
        {label:'Service Retention', href:'/service', icon:'service', badge:'9'},
        {label:'Marketing Hub', href:'/marketing', icon:'marketing'},
        {label:'Referral Center', href:'/referrals', icon:'referrals', badge:'7'},
        {label:'Dealer TV', href:'/tv', icon:'tv'},
        {label:'Sales Whiteboard', href:'/whiteboard', icon:'whiteboard'},
        {label:'Sales Team', href:'/team', icon:'team', badge:'6'},
        {label:'CRM Health', href:'/health', icon:'health'},
        {label:'Customer Sentiment', href:'/sentiment', icon:'sentiment', badge:'4'},
        {label:'Reputation', href:'/reviews', icon:'reviews', badge:'6'},
        {label:'AI Sales Coach', href:'/coach', icon:'coach'},
        {label:'Training Center', href:'/training', icon:'training'},
        {label:'e-Signature', href:'/signing', icon:'signing', badge:'5'},
        {label:'Customer Portal', href:'/portal', icon:'portal', tag:'Preview'},
        {label:'Document Center', href:'/documents', icon:'documents'},
        {label:'Automation Builder', href:'/automations', icon:'automations'},
        {label:'Knowledge Center', href:'/knowledge', icon:'knowledge'},
        {label:'Data Quality', href:'/dataquality', icon:'dataquality', badge:'12'},
        {label:'System Health', href:'/status', icon:'status'},
        {label:'Multi-Store', href:'/stores', icon:'stores'},
        {label:'Developer Platform', href:'/developers', icon:'developers'},
        {label:'CRM Administration', href:'/admin', icon:'admin'},
        {label:'Marketplace', href:'/marketplace', icon:'marketplace'},
        {label:'Data Migration', href:'/migration', icon:'migrate'},
        {label:'Help & Feedback', href:'/feedback', icon:'feedback'},
        {label:'Settings', href:'/settings', icon:'settings'}
      ]
    },
    receptionist: {
      name:'Riley Brooks', title:'Receptionist', avatar:'RB', home:'/reception',
      nav:[
        {label:'Home', href:'/reception', icon:'home'},
        {label:'Showroom Ops', href:'/showroom', icon:'showroom', tag:'Live'},
        {label:'Appointments', href:'/appointments', icon:'appt', badge:'12'},
        {label:'Customers', href:'/customers', icon:'customers'},
        {label:'Communications', href:'/communications', icon:'comms', badge:'4'},
        {label:'Team Chat', href:'/chat', icon:'chat', badge:'2'},
        {label:'Delivery Center', href:'/delivery', icon:'delivery', badge:'4'},
        {label:'Inventory Lookup', href:'/inventory', icon:'inventory'},
        {label:'Visitor Check-In', href:'/checkin', icon:'checkin', badge:'2'},
        {label:'Training', href:'/training', icon:'training', badge:'1'},
        {label:'Knowledge', href:'/knowledge', icon:'knowledge'},
        {label:'Help & Feedback', href:'/feedback', icon:'feedback'},
        {label:'Settings', href:'/settings', icon:'settings'}
      ]
    },
    bdc: {
      name:'Marcus Reyes', title:'BDC Agent', avatar:'MR', home:'/bdc',
      nav:[
        {label:'Dashboard', href:'/bdc', icon:'home'},
        {label:'Leads', href:'/prospects', icon:'prospects', badge:'14'},
        {label:'Communications', href:'/communications', icon:'comms', badge:'6'},
        {label:'Team Chat', href:'/chat', icon:'chat', badge:'2'},
        {label:'Appointments', href:'/appointments', icon:'appt', badge:'9'},
        {label:'Tasks', href:'/tasks', icon:'tasks', badge:'5'},
        {label:'Customers', href:'/customers', icon:'customers'},
        {label:'Inventory', href:'/inventory', icon:'inventory', tag:'View-only'},
        {label:'Reports', href:'/reports', icon:'reports'},
        {label:'Knowledge', href:'/knowledge', icon:'knowledge'},
        {label:'Help & Feedback', href:'/feedback', icon:'feedback'},
        {label:'Settings', href:'/settings', icon:'settings'}
      ]
    },
    finance: {
      name:'Tom Fielder', title:'Finance Manager', avatar:'TF', home:'/finance',
      nav:[
        {label:'Dashboard', href:'/finance', icon:'home'},
        {label:'Deal Jackets', href:'/jacket', icon:'deals', badge:'7'},
        {label:'Deal Desk', href:'/deals', icon:'deals'},
        {label:'Customers', href:'/customers', icon:'customers'},
        {label:'Documents', href:'/documents', icon:'documents'},
        {label:'Contracts', href:'/signing', icon:'signing', badge:'5'},
        {label:'Deliveries', href:'/delivery', icon:'delivery', badge:'3'},
        {label:'Communications', href:'/communications', icon:'comms'},
        {label:'Team Chat', href:'/chat', icon:'chat', badge:'2'},
        {label:'Reports', href:'/reports', icon:'reports'},
        {label:'Knowledge', href:'/knowledge', icon:'knowledge'},
        {label:'Help & Feedback', href:'/feedback', icon:'feedback'},
        {label:'Settings', href:'/settings', icon:'settings'}
      ]
    },
    gm: {
      name:'Gloria Vance', title:'General Manager', avatar:'GV', home:'/gm',
      nav:[
        {label:'Executive Dashboard', href:'/gm', icon:'aimanager'},
        {label:'AI Manager', href:'/aimanager', icon:'aimanager', tag:'AI'},
        {label:'Showroom Ops', href:'/showroom', icon:'showroom', tag:'Live'},
        {label:'Sales', href:'/manager', icon:'deals'},
        {label:'BDC', href:'/bdc', icon:'prospects'},
        {label:'Finance', href:'/finance', icon:'signing'},
        {label:'Inventory', href:'/invintel', icon:'invintel'},
        {label:'Workflow Analytics', href:'/analytics', icon:'analytics'},
        {label:'Customers', href:'/customers', icon:'customers'},
        {label:'Reports', href:'/reports', icon:'reports'},
        {label:'Employees', href:'/team', icon:'team'},
        {label:'Team Chat', href:'/chat', icon:'chat', badge:'2'},
        {label:'Multi-Store', href:'/stores', icon:'stores'},
        {label:'Knowledge Center', href:'/knowledge', icon:'knowledge'},
        {label:'Data Quality', href:'/dataquality', icon:'dataquality', badge:'12'},
        {label:'System Health', href:'/status', icon:'status'},
        {label:'CRM Administration', href:'/admin', icon:'admin'},
        {label:'Settings', href:'/settings', icon:'settings'}
      ]
    },
    dealerprincipal: {
      name:'Grant Whitfield', title:'Dealer Principal', avatar:'GW', home:'/gm',
      nav:[
        {label:'Executive Dashboard', href:'/gm', icon:'aimanager'},
        {label:'AI Manager', href:'/aimanager', icon:'aimanager', tag:'AI'},
        {label:'Sales', href:'/manager', icon:'deals'},
        {label:'Finance', href:'/finance', icon:'signing'},
        {label:'Inventory', href:'/invintel', icon:'invintel'},
        {label:'Workflow Analytics', href:'/analytics', icon:'analytics'},
        {label:'Customers', href:'/customers', icon:'customers'},
        {label:'Reports', href:'/reports', icon:'reports'},
        {label:'Employees', href:'/team', icon:'team'},
        {label:'Multi-Store', href:'/stores', icon:'stores'},
        {label:'Reputation', href:'/reviews', icon:'reviews', badge:'6'},
        {label:'Customer Sentiment', href:'/sentiment', icon:'sentiment'},
        {label:'CRM Health', href:'/health', icon:'health'},
        {label:'Knowledge Center', href:'/knowledge', icon:'knowledge'},
        {label:'Data Quality', href:'/dataquality', icon:'dataquality', badge:'12'},
        {label:'System Health', href:'/status', icon:'status'},
        {label:'CRM Administration', href:'/admin', icon:'admin'},
        {label:'Settings', href:'/settings', icon:'settings'}
      ]
    },
    admin: {
      name:'Alex Chen', title:'System Administrator', avatar:'AC', home:'/admin',
      nav:[
        {label:'Admin Center', href:'/admin', icon:'admin'},
        {label:'CRM Dashboard', href:'/manager', icon:'home'},
        {label:'Data Quality', href:'/dataquality', icon:'dataquality', badge:'12'},
        {label:'System Health', href:'/status', icon:'status'},
        {label:'Developer Platform', href:'/developers', icon:'developers'},
        {label:'Marketplace', href:'/marketplace', icon:'marketplace'},
        {label:'Multi-Store', href:'/stores', icon:'stores'},
        {label:'AI Manager', href:'/aimanager', icon:'aimanager', tag:'AI'},
        {label:'Automation Builder', href:'/automations', icon:'automations'},
        {label:'Data Migration', href:'/migration', icon:'migrate'},
        {label:'Knowledge Center', href:'/knowledge', icon:'knowledge'},
        {label:'Reports', href:'/reports', icon:'reports'},
        {label:'Help & Feedback', href:'/feedback', icon:'feedback'},
        {label:'Settings', href:'/settings', icon:'settings'}
      ]
    }
  };

  /* ---- Centralized permission model (module.action; "cat.*" = whole module; "*" = superuser). ----
     Field-level keys (field.X) gate sensitive data across pages via [data-requires="field.X"]. */
  var PERMS = {
    salesperson:    ['crm.view','crm.create','crm.edit','crm.assign','customers.personal','inventory.view','reports.personal','comms.call','comms.text','comms.email','comms.video','comms.templates','comms.history'],
    bdc:            ['crm.view','crm.create','crm.edit','crm.assign','customers.personal','inventory.view','reports.personal','comms.call','comms.text','comms.email','comms.templates','comms.bulk','comms.history'],
    receptionist:   ['crm.view','customers.personal','inventory.view','comms.call','comms.text','comms.email','comms.history'],
    manager:        ['crm.*','customers.department','inventory.view','inventory.edit','inventory.price','inventory.cost','inventory.profit','inventory.transfer','inventory.export','reports.personal','reports.department','reports.custom','reports.export','reports.schedule','comms.*','field.vehicleCost','field.grossProfit','view.revenue','admin.automation'],
    finance:        ['crm.view','crm.edit','crm.export','customers.department','inventory.view','reports.department','reports.financial','reports.export','comms.call','comms.text','comms.email','comms.history','finance.*','field.creditScore','field.ssn','field.grossProfit'],
    gm:             ['crm.*','customers.all','inventory.*','reports.*','comms.*','finance.*','exec.dashboard','exec.profitability','exec.forecast','view.revenue','field.vehicleCost','field.grossProfit','field.creditScore','field.ssn','admin.users','admin.roles','admin.settings','admin.audit','admin.automation','admin.marketplace','admin.branding','admin.ai'],
    dealerprincipal:['crm.*','customers.all','inventory.*','reports.*','comms.*','finance.*','exec.dashboard','exec.profitability','exec.forecast','view.revenue','field.vehicleCost','field.grossProfit','field.creditScore','field.ssn','field.employeeComp','admin.users','admin.roles','admin.settings','admin.audit','admin.automation','admin.marketplace','admin.branding','admin.ai'],
    admin:          ['*']
  };
  /* Future roles plug in here with zero architectural change: */
  var COMING = ['bdc','finance','service','gm','marketing','admin'];
  var ROLE_MENU = [
    ['salesperson','Sales Representative','Focused selling workspace', true],
    ['bdc','BDC Agent','Lead handling & appointments', true],
    ['receptionist','Receptionist','Front-desk & check-in', true],
    ['manager','Sales Manager','Team coaching & performance', true],
    ['finance','Finance Manager','F&I & penetration', true],
    ['gm','General Manager','Executive overview', true],
    ['dealerprincipal','Dealer Principal','Full dealership visibility', true],
    ['admin','System Administrator','Unrestricted platform access', true]
  ];

  /* Every known in-app route. Anything here that is NOT in the active role's nav is blocked. */
  var KNOWN = ['/dashboard','/manager','/reception','/prospects','/customers','/appointments','/tasks','/inventory','/communications','/reports','/team','/admin','/checkin','/deals','/trades','/delivery','/documents','/automations','/migration','/equity','/feedback','/health','/marketing','/recovery','/sentiment','/reviews','/coach','/signing','/showroom','/training','/analytics','/invintel','/service','/whiteboard','/marketplace','/referrals','/aimanager','/chat','/bdc','/finance','/gm','/settings','/knowledge','/dataquality','/status','/developers','/stores'];

  function getRole(){ var r = localStorage.getItem('ad_role'); return ROLES[r] ? r : 'salesperson'; }
  function cfg(){ return ROLES[getRole()]; }
  function setRole(r){ if(!ROLES[r]){ toast('That workspace is coming soon'); return; } localStorage.setItem('ad_role', r); location.href = ROLES[r].home; }
  function allowed(role){ var s={}; ROLES[role].nav.forEach(function(n){ if(n.href!=='#') s[n.href]=1; }); return s; }
  function path(){ return (location.pathname.replace(/\/$/,'')||'/'); }

  /* ---- Permission service ---- */
  function can(perm){ if(!perm) return true; var set=PERMS[getRole()]||[]; if(set.indexOf('*')>=0) return true; if(set.indexOf(perm)>=0) return true; var cat=perm.split('.')[0]+'.*'; return set.indexOf(cat)>=0; }
  function canField(f){ return can('field.'+f); }

  /* ---- Real identity vs "View As" impersonation ---- */
  function getRealRole(){ var r=localStorage.getItem('ad_real_role'); if(ROLES[r]) return r; var cur=getRole(); try{ localStorage.setItem('ad_real_role',cur); }catch(e){} return cur; }
  function isImpersonating(){ return getRole()!==getRealRole(); }
  function canImpersonate(){ return ['manager','gm','dealerprincipal','admin'].indexOf(getRealRole())>=0; }
  function returnToAccount(){ var real=getRealRole(); try{ localStorage.setItem('ad_role',real); }catch(e){} location.href = ROLES[real] ? ROLES[real].home : '/dashboard'; }

  /* RBAC guard — blocks restricted routes even via direct URL. System Administrator bypasses. */
  function guard(){
    var role=getRole(), p=path();
    if (KNOWN.indexOf(p) !== -1 && !allowed(role)[p] && !can('*')) { showAccessDenied(p, role); return false; }
    return true;
  }

  /* Premium full-screen Access Denied — shown when a role opens a restricted URL directly. */
  function showAccessDenied(p, role){
    var home = ROLES[role] ? ROLES[role].home : '/dashboard';
    var title = ROLES[role] ? ROLES[role].title : role;
    var st=document.createElement('style'); st.textContent=
      '#adDenied{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;'+
        'background:radial-gradient(900px 500px at 50% -10%,#eaf2ff,transparent 60%),#f6f8fb;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;}'+
      '@media(prefers-color-scheme:dark){#adDenied{background:radial-gradient(900px 500px at 50% -10%,rgba(43,143,255,.14),transparent 60%),#0a1322;}}'+
      '#adDenied .dc{max-width:440px;text-align:center;}'+
      '#adDenied .di{width:76px;height:76px;border-radius:22px;margin:0 auto 22px;display:flex;align-items:center;justify-content:center;color:#dc2626;background:#fdeceb;box-shadow:0 20px 44px -20px rgba(220,38,38,.5);}'+
      '#adDenied .di svg{width:38px;height:38px;}'+
      '#adDenied h1{font-size:26px;font-weight:800;letter-spacing:-.6px;color:#16202e;}'+
      '@media(prefers-color-scheme:dark){#adDenied h1{color:#e8eef9;}}'+
      '#adDenied p{color:#6b7a90;font-size:15.5px;line-height:1.6;margin:12px 0 6px;}'+
      '#adDenied .meta{display:inline-flex;gap:8px;align-items:center;font-size:12.5px;color:#97a4b6;background:rgba(120,140,170,.12);border-radius:999px;padding:6px 14px;margin:8px 0 26px;font-weight:600;}'+
      '#adDenied .meta code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#dc2626;}'+
      '#adDenied a{display:inline-flex;align-items:center;gap:9px;background:linear-gradient(180deg,#3b82f6,#2563eb);color:#fff;text-decoration:none;border-radius:12px;padding:14px 26px;font-size:15px;font-weight:700;box-shadow:0 16px 34px -16px rgba(37,99,235,.75);}'+
      '#adDenied a:hover{filter:brightness(1.06);}';
    document.head.appendChild(st);
    var el=document.createElement('div'); el.id='adDenied';
    el.innerHTML='<div class="dc">'+
      '<div class="di"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="15.5" r="1.4" fill="currentColor"/></svg></div>'+
      '<h1>Access restricted</h1>'+
      '<p>You don’t have permission to access this page.</p>'+
      '<div class="meta"><code>'+p+'</code><span>·</span><span>Signed in as '+title+'</span></div><br>'+
      '<a href="'+home+'">Return to Dashboard</a>'+
    '</div>';
    function mount(){ if(document.getElementById('adDenied')) return; document.body.appendChild(el); }
    if(document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
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
    if(!canImpersonate()) return; /* Only Sales Managers, GMs, Dealer Principals & System Admins can View As */
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

  /* Persistent banner while a privileged user is impersonating another role. */
  function mountBanner(){
    if(!isImpersonating() || document.getElementById('adImpBanner')) return;
    var b=document.createElement('div'); b.id='adImpBanner';
    b.innerHTML='<span class="imp-ic">'+svg('eye')+'</span><span>Viewing as <b>'+cfg().title+'</b></span><button id="impReturn" type="button">Return to My Account</button>';
    document.body.appendChild(b);
    var rb=document.getElementById('impReturn'); if(rb) rb.addEventListener('click', returnToAccount);
  }

  /* Field/widget-level gating: hide any element declaring a permission the role lacks. */
  function applyGates(){
    document.querySelectorAll('[data-requires]').forEach(function(el){ if(!can(el.getAttribute('data-requires'))){ el.setAttribute('data-denied',''); el.style.display='none'; } });
  }

  /* Demo affordance: click your profile picture (topbar top-right or sidebar bottom-left)
     to switch which workspace you're viewing. Sets the base role (not impersonation). */
  function switchAccount(r){ if(!ROLES[r]) return; try{ localStorage.setItem('ad_role', r); localStorage.setItem('ad_real_role', r); }catch(e){} location.href = ROLES[r].home; }
  function mountAccountSwitcher(){
    var triggers=[document.querySelector('.tb-avatar'), document.querySelector('.side-user')].filter(Boolean);
    if(!triggers.length || document.getElementById('adAcctMenu')) return;
    var menu=document.createElement('div'); menu.className='ad-acct'; menu.id='adAcctMenu';
    var ck='<svg class="aa-ck" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    menu.innerHTML='<div class="aa-h">Demo · Switch workspace</div>'+ROLE_MENU.map(function(m){ var on=m[0]===getRole();
      return '<button class="aa-opt'+(on?' on':'')+'" data-r="'+m[0]+'"><span class="aa-av">'+ROLES[m[0]].avatar+'</span><span class="aa-i"><b>'+m[1]+'</b><span>'+m[2]+'</span></span>'+(on?ck:'')+'</button>'; }).join('');
    document.body.appendChild(menu);
    menu.addEventListener('click', function(e){ e.stopPropagation(); });
    menu.querySelectorAll('.aa-opt').forEach(function(b){ b.addEventListener('click', function(){ switchAccount(b.getAttribute('data-r')); }); });
    function place(trigger){ var r=trigger.getBoundingClientRect(), mw=264;
      if(trigger.classList.contains('side-user')){ menu.style.left=Math.max(10,r.left)+'px'; menu.style.top='auto'; menu.style.bottom=(window.innerHeight-r.top+8)+'px'; }
      else { menu.style.left=Math.max(10, Math.min(r.right-mw, window.innerWidth-mw-10))+'px'; menu.style.bottom='auto'; menu.style.top=(r.bottom+8)+'px'; } }
    triggers.forEach(function(t){ t.style.cursor='pointer'; t.setAttribute('title','Switch workspace (demo)');
      t.addEventListener('click', function(e){ e.stopPropagation(); if(menu.classList.contains('open')){ menu.classList.remove('open'); return; } place(t); menu.classList.add('open'); }); });
    document.addEventListener('click', function(){ menu.classList.remove('open'); });
  }

  function injectCSS(){
    var css =
    '.nav a .ro-tag{margin-left:auto;font-size:8.5px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:#8aa0bd;background:rgba(255,255,255,.09);padding:2px 6px;border-radius:5px;}'+
    '.sidebar .nav{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;}.sidebar .nav::-webkit-scrollbar{width:0;height:0;}'+
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
    /* impersonation banner */
    '#adImpBanner{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:9998;display:flex;align-items:center;gap:11px;background:linear-gradient(180deg,#fbbf24,#f59e0b);color:#3a2a05;padding:8px 9px 8px 16px;border-radius:999px;box-shadow:0 16px 34px -14px rgba(245,158,11,.7);font:600 13px Inter,system-ui,sans-serif;max-width:calc(100vw - 24px);}'+
    '#adImpBanner .imp-ic{display:flex;}#adImpBanner .imp-ic svg{width:16px;height:16px;}'+
    '#adImpBanner b{font-weight:800;}'+
    '#adImpBanner button{border:none;background:rgba(0,0,0,.16);color:#241a03;font:700 12px Inter,system-ui,sans-serif;padding:7px 13px;border-radius:999px;cursor:pointer;white-space:nowrap;}#adImpBanner button:hover{background:rgba(0,0,0,.26);}'+
    /* profile-picture account switcher (demo) */
    '.ad-acct{position:fixed;z-index:10000;width:264px;max-height:70vh;overflow-y:auto;background:#0e1c33;border:1px solid rgba(255,255,255,.12);border-radius:14px;box-shadow:0 24px 60px -20px rgba(0,0,0,.7);padding:6px;display:none;}'+
    '.ad-acct.open{display:block;animation:vaIn .16s ease;}'+
    '.aa-h{font-size:10px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:#6f83a0;padding:9px 11px 6px;}'+
    '.aa-opt{width:100%;display:flex;align-items:center;gap:11px;text-align:left;background:none;border:none;border-radius:10px;padding:9px 10px;cursor:pointer;color:#c7d4e6;}'+
    '.aa-opt:hover{background:rgba(255,255,255,.07);}.aa-opt.on{background:rgba(37,99,235,.22);}'+
    '.aa-av{width:32px;height:32px;border-radius:50%;flex:none;background:linear-gradient(135deg,#3f9bff,#0b57b8);color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;}'+
    '.aa-i{flex:1;min-width:0;}.aa-i b{display:block;font-size:13px;font-weight:600;color:#fff;}.aa-i span{font-size:11px;color:#8aa0bd;}'+
    '.aa-ck{width:16px;height:16px;color:#6ea8ff;flex:none;}'+
    /* read-only role gating on shared pages */
    'body[data-role="salesperson"] .add-btn, body[data-role="receptionist"] .add-btn{display:none!important;}'+
    'body[data-role="receptionist"] .vhb[data-hover="tag"], body[data-role="salesperson"] .vhb[data-hover="tag"]{display:none;}'+
    '[data-denied]{display:none!important;}';
    var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  }

  var toastEl;
  function toast(msg){
    if(!toastEl){ toastEl=document.createElement('div'); toastEl.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#0f1b2d;color:#fff;padding:12px 20px;border-radius:12px;font:600 13px Inter,sans-serif;box-shadow:0 20px 40px -16px rgba(0,0,0,.5);opacity:0;transition:all .3s;z-index:9999;'; document.body.appendChild(toastEl); }
    toastEl.textContent=msg; toastEl.style.opacity='1'; toastEl.style.transform='translateX(-50%) translateY(0)';
    clearTimeout(toastEl._t); toastEl._t=setTimeout(function(){ toastEl.style.opacity='0'; toastEl.style.transform='translateX(-50%) translateY(20px)'; }, 2200);
  }

  window.ADRoles = { getRole:getRole, getRealRole:getRealRole, isImpersonating:isImpersonating, canImpersonate:canImpersonate, setRole:setRole, returnToAccount:returnToAccount, cfg:cfg, can:can, canField:canField, applyGates:applyGates, ROLES:ROLES, PERMS:PERMS };

  /* ?as=<role> sets the account's REAL role (not impersonation) and clears any View-As. */
  function applyQueryRole(){
    var m = location.search.match(/[?&]as=([a-z]+)/i);
    if (m && ROLES[m[1]]) { try { localStorage.setItem('ad_role', m[1]); localStorage.setItem('ad_real_role', m[1]); } catch(e){}
      try { history.replaceState(null, '', location.pathname); } catch(e){} }
  }
  function loadAI(){ if(document.getElementById('ad-ai-script')) return; var s=document.createElement('script'); s.id='ad-ai-script'; s.src='/ai.js'; s.async=true; document.body.appendChild(s); }
  function loadNotify(){ if(document.getElementById('ad-notify-script')) return; var s=document.createElement('script'); s.id='ad-notify-script'; s.src='/notify.js'; s.async=true; document.body.appendChild(s); }
  function loadCmdK(){ if(document.getElementById('ad-cmdk-script')) return; var s=document.createElement('script'); s.id='ad-cmdk-script'; s.src='/cmdk.js'; s.async=true; document.body.appendChild(s); }
  function loadTheme(){ if(window.__adTheme||document.getElementById('ad-theme-script')) return; var s=document.createElement('script'); s.id='ad-theme-script'; s.src='/theme.js'; document.head.appendChild(s); }
  function init(){ loadTheme(); applyQueryRole(); if(!guard()) return; injectCSS(); renderNav(); mountViewAs(); mountBanner(); mountAccountSwitcher(); applyGates(); loadAI(); loadNotify(); loadCmdK(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
