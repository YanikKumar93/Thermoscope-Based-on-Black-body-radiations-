const labels = {
  home: 'OVERVIEW',
  simulation: 'SIMULATION',
  compare: 'COMPARE SPECTRA',
  calculator: 'CALCULATOR'
};

export function initNavigation() {
  function go(page) {
    document.querySelectorAll('.page').forEach((section) => {
      section.classList.toggle('active', section.id === `page-${page}`);
    });
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.page === page);
    });
    const crumb = document.getElementById('crumb-current');
    if (crumb) crumb.textContent = labels[page] || page.toUpperCase();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('thermoscope:pagechange', { detail: { page } }));
    });
  }

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => go(button.dataset.page));
  });
  document.querySelectorAll('[data-go]').forEach((button) => {
    button.addEventListener('click', () => go(button.dataset.go));
  });
}
