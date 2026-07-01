document.addEventListener('DOMContentLoaded', () => {
  const link = document.querySelector('[data-link]');
  if (link) {
    link.setAttribute('aria-label', 'Visit the photo gallery');
  }
});
