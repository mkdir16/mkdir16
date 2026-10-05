/* SotuvPro CRM — общий JS: сайдбар, счётчики, фильтры, модалки, localStorage */
(function(){
  "use strict";
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  /* --- Мобильный сайдбар / бургер --- */
  const sidebar = $("#sidebar");
  const burger = $("#burger");
  const overlay = $("#overlay");
  function closeSide(){ sidebar && sidebar.classList.remove("open"); overlay && overlay.classList.remove("show"); }
  function openSide(){ sidebar && sidebar.classList.add("open"); overlay && overlay.classList.add("show"); }
  if(burger){ burger.addEventListener("click", ()=> sidebar.classList.contains("open") ? closeSide() : openSide()); }
  if(overlay){ overlay.addEventListener("click", closeSide); }
  document.addEventListener("keydown", e=>{ if(e.key==="Escape"){ closeSide(); closeAllModals(); } });

  /* --- Модалки --- */
  function openModal(id){ const m=document.getElementById(id); if(m) m.classList.add("open"); }
  function closeModal(m){ if(typeof m==="string") m=document.getElementById(m); if(m) m.classList.remove("open"); }
  function closeAllModals(){ $$(".modal.open").forEach(m=>m.classList.remove("open")); }
  window.CRM = { openModal, closeModal };
  $$("[data-open]").forEach(b=> b.addEventListener("click", ()=> openModal(b.getAttribute("data-open"))));
  $$(".modal").forEach(m=>{
    m.addEventListener("click", e=>{ if(e.target===m || e.target.hasAttribute("data-close")) closeModal(m); });
  });

  /* --- Анимированные счётчики KPI --- */
  function fmt(n){ return n.toLocaleString("ru-RU") + ""; }
  function animateCount(el){
    const target = Number(el.getAttribute("data-count")||"0");
    const suffix = el.getAttribute("data-suffix")||"";
    const dur = 1200, t0 = performance.now();
    function tick(t){
      const p = Math.min(1,(t-t0)/dur);
      const eased = 1-Math.pow(1-p,3);
      el.textContent = fmt(Math.round(target*eased)) + suffix;
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters = $$("[data-count]");
  if(counters.length && "IntersectionObserver" in window){
    const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ animateCount(e.target); io.unobserve(e.target);} }),{threshold:.4});
    counters.forEach(c=>io.observe(c));
  } else counters.forEach(animateCount);

  /* --- Дашборд: задачи-чеклист + localStorage --- */
  const todoList = $("#todoList");
  const todoForm = $("#todoForm");
  const todoInput = $("#todoInput");
  const LSK_TODO = "sotuvpro_tasks_v1";
  const defaultTasks = [
    {t:"Позвонить «TexnoMart» — подтвердить оплату 12 500 000 сум", d:"Сегодня до 12:00 • +998 93 507-64-73", done:false},
    {t:"Отправить КП клинике «ShifoMed» на 8 900 000 сум", d:"E-mail + Telegram", done:false},
    {t:"Встреча с «Chust Textile» в 15:00 (Ташкент, Чиланзар)", d:"Взять прайс и договор", done:true},
    {t:"Обновить воронку: 3 заявки → «Переговоры»", d:"Проверить статусы в leads.html", done:false}
  ];
  function loadTasks(){
    try{ const raw=localStorage.getItem(LSK_TODO); if(!raw) return defaultTasks.slice();
      const arr=JSON.parse(raw); return Array.isArray(arr)?arr:defaultTasks.slice();
    }catch{ return defaultTasks.slice(); }
  }
  function saveTasks(a){ try{localStorage.setItem(LSK_TODO, JSON.stringify(a));}catch{} }
  function renderTasks(){
    if(!todoList) return;
    const tasks = loadTasks();
    todoList.innerHTML="";
    tasks.forEach((task,i)=>{
      const lab=document.createElement("label");
      lab.className = task.done ? "done" : "";
      const cb=document.createElement("input");
      cb.type="checkbox"; cb.checked=!!task.done;
      cb.addEventListener("change", ()=>{ tasks[i].done=cb.checked; saveTasks(tasks); renderTasks(); });
      const wrap=document.createElement("span");
      const title=document.createElement("span"); title.textContent=task.t;
      const sub=document.createElement("small"); sub.textContent=task.d||"";
      wrap.append(title,sub);
      const del=document.createElement("button");
      del.className="btn ghost"; del.style.padding="4px 9px"; del.textContent="✕"; del.title="Удалить";
      del.addEventListener("click", e=>{ e.preventDefault(); tasks.splice(i,1); saveTasks(tasks); renderTasks(); });
      lab.append(cb,wrap);
      const row=document.createElement("div");
      row.style.display="flex"; row.style.gap="8px"; row.style.alignItems="stretch";
      lab.style.flex="1";
      row.append(lab,del);
      todoList.append(row);
    });
    const info=$("#todoCount");
    if(info){ const left=tasks.filter(t=>!t.done).length; info.textContent=`Осталось: ${left} из ${tasks.length}`; }
  }
  if(todoList){ renderTasks(); }
  if(todoForm){ todoForm.addEventListener("submit", e=>{
    e.preventDefault();
    const v=(todoInput.value||"").trim(); if(!v) return;
    const tasks=loadTasks(); tasks.unshift({t:v,d:"Добавлено вручную",done:false});
    saveTasks(tasks); todoInput.value=""; renderTasks();
  });}

  /* --- leads.html: фильтр по статусу + поиск + добавление --- */
  const leadsBody = $("#leadsBody");
  const chips = $$(".chip[data-filter]");
  const searchInput = $("#leadSearch");
  let curFilter = "all";
  function applyLeadFilter(){
    if(!leadsBody) return;
    const q=(searchInput && searchInput.value || "").toLowerCase().trim();
    $$("tr", leadsBody).forEach(tr=>{
      const st=tr.getAttribute("data-status")||"";
      const txt=tr.textContent.toLowerCase();
      const okF = curFilter==="all" || st===curFilter;
      const okQ = !q || txt.includes(q);
      tr.style.display = (okF && okQ) ? "" : "none";
    });
    const visible=$$("tr",leadsBody).filter(tr=>tr.style.display!=="none").length;
    const cnt=$("#leadsCount"); if(cnt) cnt.textContent=`Показано: ${visible}`;
  }
  chips.forEach(c=>c.addEventListener("click", ()=>{
    chips.forEach(x=>x.classList.remove("active")); c.classList.add("active");
    curFilter=c.getAttribute("data-filter"); applyLeadFilter();
  }));
  if(searchInput) searchInput.addEventListener("input", applyLeadFilter);
  if(leadsBody) applyLeadFilter();

  // добавление заявки из модалки + сохранение в localStorage
  const LSK_LEADS="sotuvpro_leads_v1";
  function customLeads(){ try{return JSON.parse(localStorage.getItem(LSK_LEADS)||"[]");}catch{return [];} }
  function persistLead(o){ try{const a=customLeads(); a.push(o); localStorage.setItem(LSK_LEADS, JSON.stringify(a));}catch{} }
  function statusClass(s){
    return s==="new"?"st-new":s==="work"?"st-work":s==="win"?"st-win":"st-lose";
  }
  function statusLabel(s){
    return s==="new"?"🆕 Новая":s==="work"?"🤝 Переговоры":s==="win"?"✅ Выиграна":"❌ Проиграна";
  }
  function addLeadRow(o){
    if(!leadsBody) return;
    const tr=document.createElement("tr");
    tr.setAttribute("data-status", o.status);
    tr.innerHTML=`<td><b></b><br><small style="color:var(--muted)"></small></td>
      <td></td><td></td><td></td><td><span class="status"></span></td><td></td>`;
    const tds=tr.querySelectorAll("td");
    tds[0].querySelector("b").textContent=o.name;
    tds[0].querySelector("small").textContent=o.src;
    tds[1].textContent=o.phone;
    tds[2].textContent=Number(o.sum).toLocaleString("ru-RU")+" сум";
    tds[3].textContent=o.date;
    const st=tds[4].querySelector("span"); st.className="status "+statusClass(o.status); st.textContent=statusLabel(o.status);
    tds[5].textContent=o.manager;
    leadsBody.prepend(tr);
    applyLeadFilter();
  }
  // восстановить кастомные заявки
  if(leadsBody){ customLeads().forEach(addLeadRow); }
  const leadForm=$("#leadForm");
  if(leadForm){ leadForm.addEventListener("submit", e=>{
    e.preventDefault();
    const fd=new FormData(leadForm);
    const o={
      name:(fd.get("name")||"").toString().trim()||"Без названия",
      phone:(fd.get("phone")||"").toString().trim()||"+998 93 507-64-73",
      sum:Number(fd.get("sum")||0)||0,
      status:(fd.get("status")||"new").toString(),
      src:(fd.get("src")||"").toString()||"Сайт",
      manager:"Э. Журавлёв",
      date:new Date().toLocaleDateString("ru-RU")
    };
    persistLead(o); addLeadRow(o); closeModal("modalLead"); leadForm.reset();
  });}
  const resetLeads=$("#resetLeads");
  if(resetLeads){ resetLeads.addEventListener("click", ()=>{ try{localStorage.removeItem(LSK_LEADS);}catch{} location.reload(); }); }

  /* --- calendar.html: календарь на текущий месяц + события --- */
  const calGrid=$("#calGrid"), calTitle=$("#calTitle");
  const evList=$("#eventList"), evForm=$("#eventForm");
  const LSK_EV="sotuvpro_events_v1";
  const MONTHS=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
  const DOW=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  function loadEvents(){
    const base=[
      {d:3,t:"☎️ Звонок: TexnoMart (12 500 000 сум)",time:"10:00",type:""},
      {d:7,t:"🤝 Встреча: Chust Textile, Чиланзар",time:"15:00",type:"orange"},
      {d:12,t:"📄 Договор: ShifoMed — 8 900 000 сум",time:"11:30",type:"green"},
      {d:18,t:"📊 Отчёт отдела продаж за месяц",time:"17:00",type:""},
      {d:24,t:"🎓 Обучение: скрипты продаж",time:"14:00",type:"green"}
    ];
    try{
      const raw=localStorage.getItem(LSK_EV);
      const custom=raw?JSON.parse(raw):[];
      return base.concat(Array.isArray(custom)?custom:[]);
    }catch{ return base; }
  }
  function saveCustomEvent(o){
    try{ const raw=localStorage.getItem(LSK_EV); const a=raw?JSON.parse(raw):[]; a.push(o);
      localStorage.setItem(LSK_EV, JSON.stringify(a)); }catch{}
  }
  function renderCalendar(){
    if(!calGrid) return;
    const now=new Date();
    const y=now.getFullYear(), m=now.getMonth();
    if(calTitle) calTitle.textContent=`${MONTHS[m]} ${y} • Ташкент`;
    const events=loadEvents();
    calGrid.innerHTML="";
    DOW.forEach(d=>{ const el=document.createElement("div"); el.className="cal-dow"; el.textContent=d; calGrid.append(el); });
    let first=new Date(y,m,1);
    let offset=(first.getDay()+6)%7; // Пн=0
    const days=new Date(y,m+1,0).getDate();
    const prevDays=new Date(y,m,0).getDate();
    for(let i=offset-1;i>=0;i--){
      const c=document.createElement("div"); c.className="cal-day dim"; c.innerHTML=`<b>${prevDays-i}</b>`; calGrid.append(c);
    }
    for(let d=1;d<=days;d++){
      const c=document.createElement("div"); c.className="cal-day";
      if(d===now.getDate()) c.classList.add("today");
      c.innerHTML=`<b>${d}</b>`;
      events.filter(e=>Number(e.d)===d).slice(0,2).forEach(e=>{
        const s=document.createElement("div"); s.className="ev "+(e.type||""); s.textContent=e.time+" "+e.t;
        c.append(s);
      });
      if(events.filter(e=>Number(e.d)===d).length>2){
        const more=document.createElement("div"); more.className="ev"; more.textContent=`+ ещё ${events.filter(e=>Number(e.d)===d).length-2}`;
        c.append(more);
      }
      calGrid.append(c);
    }
    // события списком
    if(evList){
      evList.innerHTML="";
      events.slice().sort((a,b)=>a.d-b.d).forEach((e,idx)=>{
        const row=document.createElement("div"); row.className="event-item";
        row.innerHTML=`<div><b></b><br><small></small></div>`;
        row.querySelector("b").textContent=`${e.d} числа • ${e.time} — ${e.t}`;
        row.querySelector("small").textContent="Ташкент • SotuvPro";
        evList.append(row);
      });
      const cc=$("#eventCount"); if(cc) cc.textContent=`Всего событий: ${events.length}`;
    }
  }
  if(calGrid) renderCalendar();
  if(evForm){ evForm.addEventListener("submit", e=>{
    e.preventDefault();
    const fd=new FormData(evForm);
    const o={ d:Number(fd.get("day")||1), t:(fd.get("title")||"Новое событие").toString(), time:(fd.get("time")||"10:00").toString(), type:"green" };
    if(o.d<1)o.d=1; if(o.d>31)o.d=31;
    saveCustomEvent(o); renderCalendar(); closeModal("modalEvent"); evForm.reset();
  });}
  const resetEv=$("#resetEvents");
  if(resetEv) resetEv.addEventListener("click", ()=>{ try{localStorage.removeItem(LSK_EV);}catch{} renderCalendar(); });

  /* --- settings.html: тоглы уведомлений + тариф --- */
  const LSK_SET="sotuvpro_settings_v1";
  function loadSet(){ try{return JSON.parse(localStorage.getItem(LSK_SET)||"{}");}catch{return {};} }
  function saveSet(o){ try{localStorage.setItem(LSK_SET, JSON.stringify(o));}catch{} }
  const toggles=$$("[data-set]");
  if(toggles.length){
    const cur=loadSet();
    toggles.forEach(t=>{
      const k=t.getAttribute("data-set");
      if(k in cur) t.checked=!!cur[k];
      t.addEventListener("change", ()=>{ const s=loadSet(); s[k]=t.checked; saveSet(s);
        const hint=$("#setHint"); if(hint) hint.textContent="✅ Настройки сохранены (localStorage) • "+new Date().toLocaleTimeString("ru-RU"); });
    });
  }
  $$("[data-plan]").forEach(b=>b.addEventListener("click", ()=>{
    $$("[data-plan]").forEach(x=>x.textContent="Выбрать");
    b.textContent="✅ Текущий";
    const hint=$("#setHint"); if(hint) hint.textContent=`💳 Тариф «${b.getAttribute("data-plan")}» выбран • демо-режим`;
  }));

  // год в футере
  $$("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());
})();
