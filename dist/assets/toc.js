// Table of Contents - Active state tracking
(function() {
  const tocLinks = document.querySelectorAll('.toc__link');
  if (!tocLinks.length) return;

  const headings = Array.from(document.querySelectorAll('.article-body h2, .article-body h3'))
    .filter(h => h.id);

  if (!headings.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tocLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            tocLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-80px 0px -80% 0px',
    threshold: 0
  });

  headings.forEach(heading => observer.observe(heading));

  // Smooth scroll
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
})();
