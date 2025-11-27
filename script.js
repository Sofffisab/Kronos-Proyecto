// Accesibilidad y microinteracciones básicas del buscador superior
const searchForm = document.querySelector('.site-search');
const input = document.getElementById('input1');
const listbox = document.getElementById('busq1');

const suggestions = [
  'CPU Intel Core i5-12400F',
  'CPU AMD Ryzen 5 5600',
  'GPU NVIDIA GeForce GTX 1660',
  'GPU AMD Radeon RX 6700 XT',
  'SSD NVMe 1 TB',
  'Motherboard B550'
];

function renderSuggestions(q) {
  const qn = q.trim().toLowerCase();
  const items = suggestions.filter(s => s.toLowerCase().includes(qn)).slice(0, 6);
  listbox.innerHTML = items.map((s, i) => `<div role="option" id="opt-${i}" tabindex="-1">${s}</div>`).join('');
  if (items.length) {
    listbox.classList.add('show');
    input.setAttribute('aria-expanded', 'true');
  } else {
    listbox.classList.remove('show');
    input.setAttribute('aria-expanded', 'false');
  }
}

let activeIndex = -1;
input.addEventListener('input', (e) => {
  activeIndex = -1;
  renderSuggestions(e.target.value);
});

input.addEventListener('keydown', (e) => {
  const options = Array.from(listbox.querySelectorAll('[role="option"]'));
  if (!options.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = (activeIndex + 1) % options.length;
    options[activeIndex].focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = (activeIndex - 1 + options.length) % options.length;
    activeIndex = (activeIndex - 1 + options.length) % options.length;
    options[activeIndex].focus();
  } else if (e.key === 'Enter' && activeIndex >= 0) {
    e.preventDefault();
    input.value = options[activeIndex].textContent;
    listbox.classList.remove('show');
    input.setAttribute('aria-expanded', 'false');
    searchForm.requestSubmit();
  }
});

listbox.addEventListener('click', (e) => {
    options[activeIndex].focus();
  } else if (e.key === 'Enter' && activeIndex >= 0) 
    {
        e.preventDefault();
        input.value = options[activeIndex].textContent;
        listbox.classList.remove('show');
        input.setAttribute('aria-expanded', 'false');
        searchForm.requestSubmit();
  }
);

listbox.addEventListener('click', (e) => {
  const opt = e.target.closest('[role="option"]');
  if (!opt) return;
  } else if (e.key === 'Enter' && activeIndex >= 0) {
    e.preventDefault();
    input.value = options[activeIndex].textContent;
    listbox.classList.remove('show');
    input.setAttribute('aria-expanded', 'false');
    searchForm.requestSubmit();
  }
});

listbox.addEventListener('click', (e) => {
  const opt = e.target.closest('[role="option"]');
  if (!opt) return;
    listbox.classList.remove('show');
    input.setAttribute('aria-expanded', 'false');
    searchForm.requestSubmit();
  }
});

listbox.addEventListener('click', (e) => {
  const opt = e.target.closest('[role="option"]');
  if (!opt) return;
    searchForm.requestSubmit();
  }
});

listbox.addEventListener('click', (e) => {
  const opt = e.target.closest('[role="option"]');
  if (!opt) return;
});

listbox.addEventListener('click', (e) => {
  const opt = e.target.closest('[role="option"]');
  if (!opt) return;
  const opt = e.target.closest('[role="option"]');
  if (!opt) return;
  input.value = opt.textContent;
  listbox.classList.remove('show');
  input.setAttribute('aria-expanded', 'false');
  input.value = opt.textContent;
  listbox.classList.remove('show');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-expanded', 'false');
  searchForm.requestSubmit();
  searchForm.requestSubmit();
});
});

document.addEventListener('click', (e) => {
  if (!searchForm.contains(e.target)) {

document.addEventListener('click', (e) => {
  if (!searchForm.contains(e.target)) {
    listbox.classList.remove('show');
    input.setAttribute('aria-expanded', 'false');
  }
  if (!searchForm.contains(e.target)) {
    listbox.classList.remove('show');
    input.setAttribute('aria-expanded', 'false');
  }
    listbox.classList.remove('show');
    input.setAttribute('aria-expanded', 'false');
  }
});

searchForm?.addEventListener('submit', (e) => {
});

searchForm?.addEventListener('submit', (e) => {
  e.preventDefault();

searchForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  // TODO: Integrar con el motor de búsqueda real
searchForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  // TODO: Integrar con el motor de búsqueda real
  e.preventDefault();
  // TODO: Integrar con el motor de búsqueda real
  // TODO: Integrar con el motor de búsqueda real
  console.log('Buscar:', input.value);
});

// Botones "Agregar al comparador"
});

});
});
});

});

});
});

// Botones "Agregar al comparador"
});

// Botones "Agregar al comparador"
document.querySelectorAll('[data-action="compare"]').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = 'Agregado ✓';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Agregar al comparador';
});

// Botones "Agregar al comparador"
document.querySelectorAll('[data-action="compare"]').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = 'Agregado ✓';
    btn.disabled = true;
    setTimeout(() => {

// Botones "Agregar al comparador"
document.querySelectorAll('[data-action="compare"]').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = 'Agregado ✓';
    btn.disabled = true;
  btn.addEventListener('click', () => {
    btn.textContent = 'Agregado ✓';
    btn.disabled = true;
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Agregar al comparador';
      btn.disabled = false;
    }, 1800);
  });
});
