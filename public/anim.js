/* AutoDealer — site-wide premium animations for the marketing site.
   Lightweight, dependency-free. Scroll-reveal (fade+rise with stagger), hero entrance,
   nav shadow on scroll. Respects prefers-reduced-motion (leaves everything visible). */
(function(){
  if (window.__adAnim) return; window.__adAnim = true;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent =
    '.a-reveal{opacity:0;transform:translateY(26px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1);will-change:opacity,transform;}'+
    '.a-reveal.a-in{opacity:1;transform:none;}'+
    '.a-nav{transition:background .3s ease,box-shadow .3s ease,border-color .3s ease;}'+
    '.a-nav.a-scrolled{background:rgba(6,13,26,.86);backdrop-filter:saturate(1.4) blur(14px);box-shadow:0 10px 34px -18px rgba(0,0,0,.7);}'+
    '@media (prefers-reduced-motion: reduce){.a-reveal{opacity:1 !important;transform:none !important;transition:none !important;}}';
  document.head.appendChild(css);

  function boot(){
    // nav shadow on scroll
    var nav = document.querySelector('nav.nav, .nav, .site-nav');
    if (nav){ nav.classList.add('a-nav');
      var onScroll = function(){ nav.classList.toggle('a-scrolled', window.scrollY > 12); };
      window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
    }
    if (reduce) return;

    // reveal targets — structural elements common across the marketing pages
    var sel = ['.hero-copy','.preview','section > .container > h2','.rule','.feat','.card','.pcard','.tcard','.fcard',
      '.qa','.inc','.mig','.roi-in','.roi-out','.plat','.mig-step','.badges','.toggle-wrap','.cmp',
      '.pill-tag','.ai-tag','.plan-note','.section-head'].join(',');

    var targets = [];
    document.querySelectorAll(sel).forEach(function(el){
      if (el.closest('.preview') && !el.classList.contains('preview')) return; // don't animate dashboard-preview internals
      el.classList.add('a-reveal'); targets.push(el);
    });

    // stagger siblings within the same parent
    var counters = new WeakMap();
    targets.forEach(function(el){
      var p = el.parentNode; var i = counters.get(p) || 0; counters.set(p, i+1);
      if (i > 0 && i < 9) el.style.transitionDelay = (i*70)+'ms';
    });

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('a-in'); io.unobserve(e.target); } });
    }, {threshold:0.12, rootMargin:'0px 0px -6% 0px'});
    targets.forEach(function(el){ io.observe(el); });

    // reveal anything already in the viewport on load (hero entrance)
    requestAnimationFrame(function(){
      var vh = window.innerHeight;
      targets.forEach(function(el){ var r = el.getBoundingClientRect(); if (r.top < vh*0.92) el.classList.add('a-in'); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
