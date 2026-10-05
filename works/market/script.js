/* Bazaar — общая логика: корзина localStorage, счётчик, фильтры, таймер, модалки */
const PRODUCTS = [
  {id:'p1', name:'Смартфон Redmi Note 13 8/256 ГБ', cat:'electronics', catRu:'Электроника', price:2500000, old:2990000, emoji:'📱', grad:'g1', rating:'★★★★★ 4.9', desc:'AMOLED 6.67", 108 Мп, 5000 мАч, доставка по Ташкенту за день.'},
  {id:'p2', name:'Наушники JBL Tune 510BT', cat:'electronics', catRu:'Электроника', price:450000, old:590000, emoji:'🎧', grad:'g2', rating:'★★★★☆ 4.7', desc:'Bluetooth 5.0, 40 часов музыки, складная конструкция.'},
  {id:'p3', name:'Ноутбук Lenovo IdeaPad Slim 15', cat:'electronics', catRu:'Электроника', price:8900000, old:9500000, emoji:'💻', grad:'g5', rating:'★★★★★ 4.8', desc:'Ryzen 5, 16 ГБ, SSD 512 ГБ, идеален для учёбы и работы.'},
  {id:'p4', name:'Телевизор LG 43" 4K Smart', cat:'electronics', catRu:'Электроника', price:5200000, old:5800000, emoji:'📺', grad:'g3', rating:'★★★★☆ 4.6', desc:'4K UHD, WebOS, голосовой пульт, рассрочка 0-0-12.'},
  {id:'p5', name:'Смарт-часы Watch Fit Pro', cat:'electronics', catRu:'Электроника', price:890000, old:1100000, emoji:'⌚', grad:'g4', rating:'★★★★☆ 4.5', desc:'Пульс, SpO2, сон, 14 дней без зарядки.'},
  {id:'p6', name:'Куртка зимняя мужская', cat:'clothes', catRu:'Одежда', price:750000, old:950000, emoji:'🧥', grad:'g6', rating:'★★★★★ 4.9', desc:'Утеплитель -25°C, ветрозащита, размеры M–XXL.'},
  {id:'p7', name:'Кроссовки Air Run', cat:'clothes', catRu:'Одежда', price:1200000, old:1450000, emoji:'👟', grad:'g1', rating:'★★★★★ 4.8', desc:'Лёгкие, дышащие, для бега и города. 40–45 размеры.'},
  {id:'p8', name:'Платье летнее «Самарканд»', cat:'clothes', catRu:'Одежда', price:320000, old:420000, emoji:'👗', grad:'g8', rating:'★★★★☆ 4.6', desc:'Хлопок 100%, свободный крой, S–L.'},
  {id:'p9', name:'Джинсы классические', cat:'clothes', catRu:'Одежда', price:480000, old:560000, emoji:'👖', grad:'g2', rating:'★★★★☆ 4.7', desc:'Деним, прямой крой, 28–36.'},
  {id:'p10', name:'Пылесос Samsung 2000W', cat:'home', catRu:'Дом', price:1800000, old:2100000, emoji:'🧹', grad:'g3', rating:'★★★★★ 4.8', desc:'Контейнер 2л, HEPA-фильтр, 5 насадок.'},
  {id:'p11', name:'Кофеварка DeLonghi', cat:'home', catRu:'Дом', price:2100000, old:2400000, emoji:'☕', grad:'g6', rating:'★★★★★ 4.9', desc:'Рожковая, капучинатор, 15 бар.'},
  {id:'p12', name:'Набор посуды 12 предметов', cat:'home', catRu:'Дом', price:890000, old:1090000, emoji:'🍳', grad:'g7', rating:'★★★★☆ 4.7', desc:'Антипригарное покрытие, для всех плит.'},
];
const fmt = n => n.toLocaleString('ru-RU') + ' сум';
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* --- Корзина --- */
function getCart(){ try{return JSON.parse(localStorage.getItem('bazaar_cart')||'[]')}catch(e){return[]} }
function saveCart(c){ localStorage.setItem('bazaar_cart', JSON.stringify(c)); updateCounter(); }
function cartQty(){ return getCart().reduce((s,i)=>s+i.qty,0) }
function updateCounter(){ $$('#cartCount').forEach(el=>el.textContent=cartQty()) }
function addToCart(id, qty=1){
  const c=getCart(); const f=c.find(i=>i.id===id);
  if(f) f.qty+=qty; else c.push({id,qty});
  saveCart(c); toast('Добавлено в корзину 🛒');
}
function toggleFav(id){
  let f=[]; try{f=JSON.parse(localStorage.getItem('bazaar_fav')||'[]')}catch(e){}
  if(f.includes(id)) f=f.filter(x=>x!==id); else {f.push(id); toast('В избранном ❤️')}
  localStorage.setItem('bazaar_fav',JSON.stringify(f)); paintFavs();
}
function paintFavs(){
  let f=[]; try{f=JSON.parse(localStorage.getItem('bazaar_fav')||'[]')}catch(e){}
  $$('[data-fav]').forEach(b=>b.classList.toggle('on', f.includes(b.dataset.fav)));
}
function toast(t){
  let el=$('#toast'); if(!el){el=document.createElement('div');el.id='toast';el.className='toast';document.body.appendChild(el)}
  el.textContent=t; el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),2200);
}

/* --- Шапка/бургер --- */
function initHeader(){
  updateCounter(); paintFavs();
  const b=$('#burger'), n=$('#nav');
  if(b&&n) b.addEventListener('click',()=>n.classList.toggle('open'));
  $$('[data-add]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();addToCart(btn.dataset.add,1)}));
  $$('[data-fav]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();toggleFav(btn.dataset.fav)}));
}

/* --- Таймер акции (до конца суток) --- */
function initTimer(){
  const el=$('#timer'); if(!el) return;
  function tick(){
    const now=new Date(); const end=new Date(); end.setHours(23,59,59,999);
    let d=Math.max(0,Math.floor((end-now)/1000));
    const h=String(Math.floor(d/3600)).padStart(2,'0'), m=String(Math.floor(d%3600/60)).padStart(2,'0'), s=String(d%60).padStart(2,'0');
    el.innerHTML=`<div><b>${h}</b><span>часов</span></div><div><b>${m}</b><span>минут</span></div><div><b>${s}</b><span>секунд</span></div>`;
  }
  tick(); setInterval(tick,1000);
}

/* --- Каталог: поиск + фильтр + сортировка --- */
function initCatalog(){
  const grid=$('#catalogGrid'); if(!grid) return;
  const q=$('#fSearch'), cat=$('#fCat'), price=$('#fPrice'), sort=$('#fSort'), priceOut=$('#priceOut');
  function apply(){
    let list=[...PRODUCTS];
    const query=(q.value||'').toLowerCase().trim();
    if(query) list=list.filter(p=>(p.name+' '+p.catRu).toLowerCase().includes(query));
    if(cat.value!=='all') list=list.filter(p=>p.cat===cat.value);
    const max=+price.value; priceOut.textContent='до '+fmt(max);
    list=list.filter(p=>p.price<=max);
    if(sort.value==='asc') list.sort((a,b)=>a.price-b.price);
    if(sort.value==='desc') list.sort((a,b)=>b.price-a.price);
    if(sort.value==='rate') list.sort((a,b)=>b.rating.localeCompare(a.rating));
    $('#countLine').textContent=`Найдено: ${list.length} из ${PRODUCTS.length}`;
    grid.innerHTML=list.map(cardHTML).join('') || '<p>Ничего не найдено 😕 Попробуйте изменить фильтры.</p>';
    grid.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addToCart(b.dataset.add,1)));
    grid.querySelectorAll('[data-fav]').forEach(b=>b.addEventListener('click',()=>toggleFav(b.dataset.fav)));
    paintFavs();
  }
  [q,cat,price,sort].forEach(el=>el.addEventListener('input',apply));
  apply();
}
function cardHTML(p){
  return `<article class="card">
    <div class="thumb ${p.grad}">${p.emoji}${p.old?'<span class="hit">ХИТ −'+Math.round((1-p.price/p.old)*100)+'%</span>':''}<button class="fav" data-fav="${p.id}" title="В избранное">♡</button></div>
    <div class="card__body">
      <div class="card__cat">${p.catRu}</div>
      <a class="card__title" href="product.html?id=${p.id}">${p.name}</a>
      <div class="rating">${p.rating}</div>
      <div class="price">${fmt(p.price)}${p.old?`<s>${fmt(p.old)}</s>`:''}</div>
      <div class="card__btns">
        <button class="btn btn-primary" style="flex:1" data-add="${p.id}">В корзину</button>
        <a class="btn btn-light" href="product.html?id=${p.id}">→</a>
      </div>
    </div></article>`;
}

/* --- Карточка товара --- */
function initProduct(){
  const wrap=$('#pdp'); if(!wrap) return;
  const id=new URLSearchParams(location.search).get('id')||'p1';
  const p=PRODUCTS.find(x=>x.id===id)||PRODUCTS[0];
  $('#pTitle').textContent=p.name; $('#pCat').textContent=p.catRu;
  $('#pPrice').innerHTML=`${fmt(p.price)}${p.old?` <s class="small">${fmt(p.old)}</s>`:''}`;
  $('#pRating').textContent=p.rating; $('#pDesc').textContent=p.desc;
  $('#pAdd').dataset.add=p.id; $('#pFav').dataset.fav=p.id;
  const grads=[p.grad,'g2','g5','g7'];
  const main=$('#galMain'); main.className='gallery__main '+p.grad; main.textContent=p.emoji;
  const th=$('#galThumbs'); th.innerHTML=grads.map((g,i)=>`<button class="${g}${i===0?' on':''}" data-g="${g}" data-e="${i===0?p.emoji:['📦','✨','🎁'][i-1]}">${i===0?p.emoji:['📦','✨','🎁'][i-1]}</button>`).join('');
  th.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    th.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on');
    main.className='gallery__main '+b.dataset.g; main.textContent=b.dataset.e;
  }));
  $('#pAdd').addEventListener('click',()=>{const q=+($('#pQty').textContent||1);addToCart(p.id,q)});
  $('#pFav').addEventListener('click',()=>toggleFav(p.id));
  $('#qMinus').addEventListener('click',()=>{let v=+$('#pQty').textContent;if(v>1)$('#pQty').textContent=v-1});
  $('#qPlus').addEventListener('click',()=>{let v=+$('#pQty').textContent;$('#pQty').textContent=v+1});
  paintFavs();
}

/* --- Корзина страница --- */
function initCart(){
  const list=$('#cartList'); if(!list) return;
  function render(){
    const cart=getCart(); updateCounter();
    if(!cart.length){list.innerHTML='<div class="form-card">Корзина пуста 🛒<br><br><a class="btn btn-accent" href="catalog.html">Перейти в каталог</a></div>'; renderSum(0,0);return;}
    list.innerHTML=cart.map(item=>{
      const p=PRODUCTS.find(x=>x.id===item.id); if(!p) return '';
      return `<div class="cart-item">
        <div class="thumb ${p.grad}">${p.emoji}</div>
        <div><div class="small">${p.catRu}</div><b><a href="product.html?id=${p.id}">${p.name}</a></b><div class="price">${fmt(p.price)}</div>
        <div class="qty"><button data-dec="${p.id}">−</button><b>${item.qty}</b><button data-inc="${p.id}">+</button>
        <button class="btn btn-light" style="padding:8px 12px;margin-left:8px" data-del="${p.id}">Удалить</button></div></div>
        <div class="price">${fmt(p.price*item.qty)}</div></div>`;
    }).join('');
    list.querySelectorAll('[data-inc]').forEach(b=>b.addEventListener('click',()=>{const c=getCart();c.find(i=>i.id===b.dataset.inc).qty++;saveCart(c);render()}));
    list.querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click',()=>{const c=getCart();const it=c.find(i=>i.id===b.dataset.dec);it.qty--;if(it.qty<1)c.splice(c.indexOf(it),1);saveCart(c);render()}));
    list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{saveCart(getCart().filter(i=>i.id!==b.dataset.del));render()}));
    calc();
  }
  function calc(){
    const cart=getCart();
    const sub=cart.reduce((s,i)=>{const p=PRODUCTS.find(x=>x.id===i.id);return s+(p?p.price*i.qty:0)},0);
    let disc=0; const code=($('#promo').value||'').trim().toUpperCase();
    if(code==='SKIDKA10') disc=Math.round(sub*0.10);
    renderSum(sub,disc);
  }
  function renderSum(sub,disc){
    $('#sumSub').textContent=fmt(sub);
    $('#sumDisc').textContent='− '+fmt(disc);
    $('#sumTotal').textContent=fmt(sub-disc);
    $('#promoMsg').textContent=($('#promo').value||'').trim().toUpperCase()==='SKIDKA10'?'✅ Промокод применён: −10%':($('#promo').value? '❌ Неверный промокод (попробуйте SKIDKA10)':'');
  }
  $('#promo').addEventListener('input',calc);
  $('#applyPromo').addEventListener('click',calc);
  $('#clearCart').addEventListener('click',()=>{saveCart([]);render()});
  render();
}

/* --- Оформление --- */
function initCheckout(){
  const f=$('#orderForm'); if(!f) return;
  updateCounter();
  const cart=getCart();
  const sub=cart.reduce((s,i)=>{const p=PRODUCTS.find(x=>x.id===i.id);return s+(p?p.price*i.qty:0)},0);
  $('#coTotal').textContent=fmt(sub)+' • товаров: '+cartQty();
  $$('input[name="pay"]').forEach(r=>r.addEventListener('change',()=>{
    $$('.pay label').forEach(l=>l.classList.remove('on'));
    r.closest('label').classList.add('on');
    $('#cardBox').style.display=r.value==='card'?'block':'none';
  }));
  f.addEventListener('submit',e=>{
    e.preventDefault(); let ok=true;
    const name=$('#cName'), phone=$('#cPhone'), addr=$('#cAddr');
    $('#eName').textContent=name.value.trim().length<2?'Введите имя (мин. 2 буквы)':''; if(name.value.trim().length<2)ok=false;
    const digits=phone.value.replace(/\D/g,'');
    $('#ePhone').textContent=(digits.length<9)?'Введите корректный телефон (+998 …)':''; if(digits.length<9)ok=false;
    $('#eAddr').textContent=addr.value.trim().length<5?'Введите адрес (улица, дом)':''; if(addr.value.trim().length<5)ok=false;
    if(!ok){toast('Проверьте форму ⚠️');return;}
    const orders=JSON.parse(localStorage.getItem('bazaar_orders')||'[]');
    orders.unshift({n:'BZ-'+Math.floor(1000+Math.random()*9000), date:new Date().toLocaleString('ru-RU'), sum:sub, name:name.value.trim(), pay:document.querySelector('input[name="pay"]:checked').value, count:cartQty()});
    localStorage.setItem('bazaar_orders',JSON.stringify(orders));
    $('#orderNum').textContent=orders[0].n;
    $('#modal').classList.add('show');
    saveCart([]);
  });
  $('#modalClose').addEventListener('click',()=>{ $('#modal').classList.remove('show'); location.href='cabinet.html'; });
}

/* --- Кабинет --- */
function initCabinet(){
  if(!$('#orders')) return;
  updateCounter();
  const orders=JSON.parse(localStorage.getItem('bazaar_orders')||'[]');
  $('#orders').innerHTML=orders.length?orders.map(o=>`<div class="order"><b>${o.n}</b> • ${o.date}<br><span class="small">${o.name} • оплата: ${o.pay} • товаров: ${o.count}</span><br><span class="price">${fmt(o.sum)}</span> <span class="badge">В пути 🚚</span></div>`).join(''):'<p class="small">Заказов пока нет. Оформите первый в <a href="catalog.html"><u>каталоге</u></a>.</p>';
  let favs=[]; try{favs=JSON.parse(localStorage.getItem('bazaar_fav')||'[]')}catch(e){}
  $('#favList').innerHTML=favs.length?favs.map(id=>{const p=PRODUCTS.find(x=>x.id===id);if(!p)return'';return `<div class="order"> ${p.emoji} <b><a href="product.html?id=${p.id}">${p.name}</a></b><br><span class="price">${fmt(p.price)}</span> <button class="btn btn-light" style="padding:6px 12px" data-add="${p.id}">В корзину</button></div>`}).join(''):'<p class="small">Избранное пусто 🤍 Жмите ♡ на товарах.</p>';
  $('#favList').querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addToCart(b.dataset.add,1)));
  const addrForm=$('#addrForm');
  function renderAddr(){const a=JSON.parse(localStorage.getItem('bazaar_addr')||'[]');$('#addrList').innerHTML=a.length?a.map(x=>`<div class="order">📍 ${x}</div>`).join(''):'<p class="small">Нет сохранённых адресов.</p>'}
  addrForm.addEventListener('submit',e=>{e.preventDefault();const v=$('#newAddr').value.trim();if(v.length<5){toast('Адрес слишком короткий');return;}const a=JSON.parse(localStorage.getItem('bazaar_addr')||'[]');a.push(v);localStorage.setItem('bazaar_addr',JSON.stringify(a));$('#newAddr').value='';renderAddr();toast('Адрес сохранён ✅')});
  renderAddr();
}

document.addEventListener('DOMContentLoaded',()=>{
  initHeader(); initTimer(); initCatalog(); initProduct(); initCart(); initCheckout(); initCabinet();
});
