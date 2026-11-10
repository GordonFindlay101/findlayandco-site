/* Findlay & Co article layer, Nov 2026 */
(function(){
  var d=document,w=window;
  var reduce=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body=d.querySelector('.cs-body')||d.querySelector('main.art-wrap')||d.querySelector('main');
  if(!body)return;
  var each=function(list,fn){Array.prototype.forEach.call(list,fn);};
  var io=null,watch=function(el){if(io)io.observe(el);else el.classList.add('is-in');};
  if(!reduce&&'IntersectionObserver' in w){
    io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
  }

  /* Reveals */
  each(body.querySelectorAll(':scope > p, :scope > ul, :scope > ol, :scope > figure, :scope > .cs-note, :scope > .table-scroll, :scope > .toc, :scope > .pillars, :scope > .mistake, :scope > .sec, :scope > .callout, :scope > blockquote'),function(el){if(!el.classList.contains('cs-check')){el.classList.add('fa-rv');watch(el);}});
  each(body.querySelectorAll('h2'),function(h){watch(h);});
  each(body.querySelectorAll('.cs-check'),function(u){watch(u);});
  each(body.querySelectorAll('table'),function(t){watch(t);});
  each(d.querySelectorAll('.fa-photo,.fa-widget,.fa-stag'),function(el){watch(el);});

  /* Reading progress */
  if(!reduce){
    var bar=d.createElement('div');bar.className='fa-progress';bar.setAttribute('aria-hidden','true');d.body.appendChild(bar);
    var tick=false,upd=function(){var h=d.documentElement,m=h.scrollHeight-h.clientHeight;bar.style.transform='scaleX('+(m>0?Math.min(1,h.scrollTop/m):0)+')';tick=false;};
    w.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true});upd();
  }

  /* Contents rail from the article's own h2s */
  var slug=function(t){return t.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);};
  var heads=[];
  each(body.querySelectorAll('h2'),function(h){
    if(h.closest('.toc,.cs-cta,.fa-widget'))return;
    if(!h.id)h.id=slug(h.textContent);
    heads.push(h);
  });
  if(heads.length>=4){
    var rail=d.createElement('nav');rail.className='fa-rail';rail.setAttribute('aria-label','Sections');
    var ol=d.createElement('ol');
    heads.forEach(function(h){var li=d.createElement('li');var a=d.createElement('a');a.href='#'+h.id;a.textContent=h.textContent.replace(/^\d+\.\s*/,'');li.appendChild(a);ol.appendChild(li);});
    rail.appendChild(ol);d.body.appendChild(rail);
    var items=ol.children,cur=-1;
    var spy=function(){var y=w.innerHeight*0.3,idx=-1;heads.forEach(function(h,i){if(h.getBoundingClientRect().top<y)idx=i;});if(idx!==cur){if(items[cur])items[cur].classList.remove('on');if(items[idx])items[idx].classList.add('on');cur=idx;}};
    w.addEventListener('scroll',function(){requestAnimationFrame(spy);},{passive:true});spy();
  }

  /* Step tracker for numbered steps */
  var steps=[];
  each(body.querySelectorAll('h2, h3'),function(h){if(/^\d+\.\s/.test(h.textContent.trim()))steps.push(h);});
  if(steps.length>=4){
    var bar2=d.createElement('nav');bar2.className='fa-steps';bar2.setAttribute('aria-label','Steps');
    var sol=d.createElement('ol');
    steps.forEach(function(h){if(!h.id)h.id=slug(h.textContent);var n=h.textContent.trim().match(/^(\d+)\.\s*(.*)$/);var li=d.createElement('li');var a=d.createElement('a');a.href='#'+h.id;a.innerHTML='Step '+n[1]+'<span>: '+n[2].replace(/[<>&]/g,'')+'</span>';a.title=n[2];li.appendChild(a);sol.appendChild(li);});
    bar2.appendChild(sol);steps[0].parentNode.insertBefore(bar2,steps[0]);
    var sItems=sol.children;
    var spy2=function(){var y=w.innerHeight*0.35,idx=-1;steps.forEach(function(h,i){if(h.getBoundingClientRect().top<y)idx=i;});for(var i=0;i<sItems.length;i++){sItems[i].className=i<idx?'done':(i===idx?'on':'');}};
    w.addEventListener('scroll',function(){requestAnimationFrame(spy2);},{passive:true});spy2();
  }

  /* FAQ accordions (cs- template). Text stays in the page; only its height changes. */
  each(d.querySelectorAll('.cs-faq'),function(f){
    f.classList.add('fa-acc');
    each(f.querySelectorAll('.cs-faq-item'),function(it,i){
      var h=it.querySelector('h3');if(!h)return;
      h.setAttribute('tabindex','0');h.setAttribute('role','button');
      var set=function(open){it.classList.toggle('open',open);h.setAttribute('aria-expanded',open?'true':'false');};
      set(i===0);
      h.addEventListener('click',function(){set(!it.classList.contains('open'));});
      h.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();set(!it.classList.contains('open'));}});
    });
  });

  /* Ticking checklist */
  each(d.querySelectorAll('[data-fa-check]'),function(ul){
    ul.classList.add('fa-checkable');
    var lis=ul.querySelectorAll('li'),total=lis.length;
    var tally=d.createElement('div');tally.className='fa-tally';tally.setAttribute('aria-live','polite');
    tally.innerHTML='<span class="txt"></span><span class="bar"><i></i></span>';
    ul.parentNode.insertBefore(tally,ul);
    var txt=tally.querySelector('.txt'),fill=tally.querySelector('i');
    var upd=function(){var n=ul.querySelectorAll('li.ticked').length;txt.textContent=(ul.getAttribute('data-fa-check')||'Ticked')+' '+n+' of '+total;fill.style.width=(n/total*100)+'%';};
    each(lis,function(li){
      li.setAttribute('role','checkbox');li.setAttribute('aria-checked','false');li.setAttribute('tabindex','0');
      var t=function(){var on=!li.classList.contains('ticked');li.classList.toggle('ticked',on);li.setAttribute('aria-checked',on?'true':'false');upd();};
      li.addEventListener('click',t);
      li.addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();t();}});
    });
    upd();
  });

  /* Hierarchy ladder labels */
  each(d.querySelectorAll('[data-fa-ladder]'),function(ul){
    ul.classList.add('fa-ladder');
    var top=d.createElement('p');top.className='fa-ladder-top';top.textContent=ul.getAttribute('data-top')||'';
    var bot=d.createElement('p');bot.className='fa-ladder-bot';bot.textContent=ul.getAttribute('data-bot')||'';
    ul.parentNode.insertBefore(top,ul);ul.parentNode.insertBefore(bot,ul.nextSibling);
  });

  /* Cost bars grow when seen */
  each(d.querySelectorAll('.fa-bars'),function(b){
    var go=function(){each(b.querySelectorAll('.fill'),function(f){f.style.width=f.getAttribute('data-w')+'%';});};
    if(reduce||!('IntersectionObserver' in w)){go();return;}
    var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){go();o.disconnect();}},{threshold:0.4});o.observe(b);
  });

  /* Incoterms 2020 explorer. Data is the quick reference page's own two tables. */
  var STAGES=['Export packing','Loading at seller’s premises','Inland carriage at origin','Export clearance','Main carriage','Cargo insurance','Import clearance, duty and GST','Carriage to final destination'];
  var R={
    EXW:{n:'Ex Works',m:'Any mode',p:'At the seller’s premises, before loading',i:'No',c:'SBBBBNBB',k:1},
    FCA:{n:'Free Carrier',m:'Any mode',p:'At the named place, on handover to the carrier',i:'No',c:'SSSSBNBB',k:3},
    CPT:{n:'Carriage Paid To',m:'Any mode',p:'At origin, on handover to the first carrier',i:'No',c:'SSSSSNBS',k:3},
    CIP:{n:'Carriage and Insurance Paid To',m:'Any mode',p:'At origin, on handover to the first carrier',i:'Yes, Clauses (A) minimum',c:'SSSSSSBS',k:3},
    DAP:{n:'Delivered at Place',m:'Any mode',p:'At the named destination, before unloading',i:'No',c:'SSSSSNBS',k:8},
    DPU:{n:'Delivered at Place Unloaded',m:'Any mode',p:'At the named destination, after unloading',i:'No',c:'SSSSSNBS',k:8},
    DDP:{n:'Delivered Duty Paid',m:'Any mode',p:'At the named destination, before unloading',i:'No',c:'SSSSSNSS',k:8},
    FAS:{n:'Free Alongside Ship',m:'Sea only',p:'Alongside the vessel at the port of shipment',i:'No',c:'SSSSBNBB',k:3},
    FOB:{n:'Free on Board',m:'Sea only',p:'On board the vessel at the port of shipment',i:'No',c:'SSSSBNBB',k:4},
    CFR:{n:'Cost and Freight',m:'Sea only',p:'On board the vessel at the port of shipment',i:'No',c:'SSSSSNBB',k:4},
    CIF:{n:'Cost, Insurance and Freight',m:'Sea only',p:'On board the vessel at the port of shipment',i:'Yes, Clauses (C) minimum',c:'SSSSSSBB',k:4}
  };
  var ORDER=['EXW','FCA','FAS','FOB','CPT','CFR','CIP','CIF','DAP','DPU','DDP'];
  each(d.querySelectorAll('[data-fa-incoterms]'),function(box){
    var start=box.getAttribute('data-start')||'FCA',only=(box.getAttribute('data-rules')||'').split(',').filter(Boolean);
    var rules=only.length?only:ORDER;
    var chips=rules.map(function(r){return '<button type="button" class="fa-chip" data-r="'+r+'" aria-pressed="false">'+r+'</button>';}).join('');
    var stages=STAGES.map(function(s){return '<div class="fa-stage"><b>'+s+'</b><em></em></div>';}).join('');
    box.insertAdjacentHTML('beforeend','<div class="fa-chips" role="group" aria-label="Choose an Incoterms 2020 rule">'+chips+'</div>'+
      '<div class="fa-route">'+stages+'<div class="fa-risk" aria-hidden="true"><span>Risk passes</span></div></div>'+
      '<div class="fa-legend"><span><i style="background:#142743"></i>Seller pays</span><span><i style="background:#dff5ea;border:1px solid #9ddcbf"></i>Buyer pays</span><span><i style="background:#eef1f4"></i>Not required of either party</span><span><i style="background:#e8562a"></i>Where risk passes</span></div>'+
      '<dl class="fa-facts"><div><dt>Rule</dt><dd class="f-n"></dd></div><div><dt>Risk passes to the buyer</dt><dd class="f-p"></dd></div><div><dt>Seller must insure</dt><dd class="f-i"></dd></div></dl>'+
      '<p class="fa-src">Insurance and the final leg follow the cost allocation table in our <a href="/incoterms-2020-rules-quick-reference.html">quick reference to the 11 rules</a>. Under DAP and DDP the buyer unloads, and under DPU the seller unloads.</p>');
    var st=box.querySelectorAll('.fa-stage'),risk=box.querySelector('.fa-risk'),route=box.querySelector('.fa-route');
    var show=function(code){
      var r=R[code];
      each(box.querySelectorAll('.fa-chip'),function(c){c.setAttribute('aria-pressed',c.getAttribute('data-r')===code?'true':'false');});
      for(var i=0;i<8;i++){var t=r.c[i];st[i].className='fa-stage '+(t==='S'?'s':t==='B'?'b':'n');st[i].querySelector('em').textContent=t==='S'?'Seller':t==='B'?'Buyer':'Not required';}
      var g=route.getBoundingClientRect().width,col=(g-4*7)/8,x=r.k*(col+4)-(r.k>0&&r.k<8?2:0);
      if(r.k>=8)x=g-2;
      risk.style.left=x+'px';
      box.querySelector('.f-n').textContent=code+', '+r.n+' ('+r.m.toLowerCase()+')';
      box.querySelector('.f-p').textContent=r.p;
      box.querySelector('.f-i').textContent=r.i;
      box.setAttribute('data-cur',code);
    };
    each(box.querySelectorAll('.fa-chip'),function(c){c.addEventListener('click',function(){show(c.getAttribute('data-r'));});});
    w.addEventListener('resize',function(){show(box.getAttribute('data-cur')||start);});
    show(start);
  });
})();
