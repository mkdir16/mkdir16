// Бургер-меню
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Анимация появления при скролле
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Фильтр работ (только основная сетка, флагманы всегда видны)
const filters = document.querySelectorAll('.filter');
const works = document.querySelectorAll('#worksGrid .work');
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    works.forEach(w => {
      const show = f === 'all' || w.dataset.cat === f;
      w.classList.toggle('hide', !show);
      if (show) { w.classList.remove('visible'); requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('visible'))); }
    });
  });
});

// Тень шапки при скролле
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 8px 30px rgba(0,0,0,.4)' : 'none';
});
