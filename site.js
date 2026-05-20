// shared nav + footer + scroll animations for IH-FoA site
(function() {

  // ─── NAV SCROLL SHRINK ───
  const nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ─── SCROLL REVEAL ───
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

  // ─── COUNTER ANIMATION ───
  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // ─── TESTIMONIAL CAROUSEL ───
  const track    = document.querySelector('.testi-track');
  const dotsWrap = document.querySelector('.testi-dots');
  if (track && dotsWrap) {
    let current = 0;
    let autoTimer;
    const cards = track.querySelectorAll('.testi-card');

    function perView()    { return window.innerWidth <= 900 ? 1 : 3; }
    function totalPages() { return Math.ceil(cards.length / perView()); }

    let cachedCardW = 0;

    function measureCardW() {
      const pv  = perView();
      const gap = pv === 1 ? 0 : 24;
      cachedCardW = cards[0].offsetWidth + gap;
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < totalPages(); i++) {
        const d = document.createElement('div');
        d.className = 'testi-dot' + (i === current ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, totalPages() - 1));
      const pv = perView();
      track.style.transform = `translateX(-${current * cachedCardW * pv}px)`;
      dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) =>
        d.classList.toggle('active', i === current)
      );
    }

    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo((current + 1) % totalPages()), 5000);
    }

    requestAnimationFrame(() => {
      measureCardW();
      buildDots();
      goTo(0);
      startAuto();
    });

    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', startAuto);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        current = 0;
        measureCardW();
        buildDots();
        goTo(0);
      }, 150);
    }, { passive: true });
  }

  // ─── ACTIVE NAV LINK ───
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // ─── HOW WE WORK VIDEO LOADER ───
  const howWorkVideo = document.getElementById('how-work-video');
  const howWorkButton = document.getElementById('how-work-load');
  if (howWorkVideo && howWorkButton) {
    howWorkVideo.preload = 'auto';
    howWorkButton.addEventListener('click', () => {
      howWorkVideo.setAttribute('controls', '');
      howWorkVideo.play().catch(() => {});
      howWorkButton.classList.add('hidden');
    });
    howWorkVideo.addEventListener('play', () => howWorkButton.classList.add('hidden'));
  }

  // ─── FAQ ACCORDION ───
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        const ans = o.nextElementSibling;
        if (ans && ans.classList.contains('faq-a')) {
          ans.style.maxHeight = '0';
          ans.style.paddingBottom = '0';
        }
      });
      if (!isOpen) {
        item.classList.add('open');
        const ans = item.nextElementSibling;
        if (ans && ans.classList.contains('faq-a')) {
          ans.style.maxHeight = ans.scrollHeight + 'px';
          ans.style.paddingBottom = '20px';
        }
      }
    });
  });

  // ─── MOBILE MENU TOGGLE ───
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (mobileToggle && mobileMenu) {
    let savedScroll = 0;

    function lockScroll() {
      savedScroll = window.scrollY;
      document.body.style.cssText += `;position:fixed;top:-${savedScroll}px;width:100%;overflow:hidden;`;
    }

    function unlockScroll() {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScroll);
    }

    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open');
      mobileToggle.classList.toggle('open');
      isOpen ? unlockScroll() : lockScroll();
    });

    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('open');
        unlockScroll();
      });
    });

    // Close menu on outside click
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('open');
        unlockScroll();
      }
    });
  }

  // ─── LOAD BLOG POSTS ───
  function loadBlogPosts() {
    const grid = document.querySelector('.blog-grid');
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = '';

    // Check if BLOG_POSTS is available (from blog-data.js)
    if (typeof BLOG_POSTS !== 'undefined' && BLOG_POSTS.length > 0) {
      // Load from data
      const posts = BLOG_POSTS.slice(0, 3);

      posts.forEach((post, index) => {
        const card = document.createElement('a');
        card.href = post.slug;
        card.className = 'blog-card';
        card.setAttribute('data-reveal', '');
        card.setAttribute('data-delay', (index + 1).toString());
        card.style.textDecoration = 'none';
        card.style.display = 'block';
        card.style.color = 'inherit';

        // ── Safe DOM construction — no innerHTML with data fields ──
        const thumb = document.createElement('div');
        thumb.className = 'blog-thumb';
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = post.image;
        img.alt = post.title;
        img.style.cssText = 'width:100%; height:200px; object-fit:cover;';
        thumb.appendChild(img);

        const body = document.createElement('div');
        body.style.padding = '24px';

        const tag = document.createElement('div');
        tag.className = 'blog-tag';
        tag.textContent = post.category.toUpperCase();

        const heading = document.createElement('h3');
        heading.style.cssText = 'margin:12px 0 16px; font-size:16px;';
        heading.textContent = post.title;

        const meta = document.createElement('div');
        meta.className = 'blog-meta';

        const dateSpan = document.createElement('span');
        dateSpan.textContent = new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const readSpan = document.createElement('span');
        readSpan.textContent = post.readTime || '';

        meta.appendChild(dateSpan);
        meta.appendChild(readSpan);
        body.appendChild(tag);
        body.appendChild(heading);
        body.appendChild(meta);
        card.appendChild(thumb);
        card.appendChild(body);

        grid.appendChild(card);
        observer.observe(card);
      });
    } else {
      // Fallback for local development (file:// protocol)
      const fallbackPosts = [
        {
          title: "OSHA's Crystalline Silica Standard: A Complete Field Guide for Manufacturing Compliance",
          category: "Silica Safety",
          date: "Apr 15, 2026",
          readTime: "12 min read",
          image: "images/blog-silica-dust.webp",
          slug: "blog/crystalline-silica.html"
        }
      ];

      fallbackPosts.forEach((post, index) => {
        const card = document.createElement('a');
        card.href = post.slug;
        card.className = 'blog-card';
        card.setAttribute('data-reveal', '');
        card.setAttribute('data-delay', (index + 1).toString());
        card.style.textDecoration = 'none';
        card.style.display = 'block';
        card.style.color = 'inherit';

        // ── Safe DOM construction — no innerHTML with data fields ──
        const thumb = document.createElement('div');
        thumb.className = 'blog-thumb';
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = post.image;
        img.alt = post.title;
        img.style.cssText = 'width:100%; height:200px; object-fit:cover;';
        thumb.appendChild(img);

        const body = document.createElement('div');
        body.style.padding = '24px';

        const tag = document.createElement('div');
        tag.className = 'blog-tag';
        tag.textContent = post.category.toUpperCase();

        const heading = document.createElement('h3');
        heading.style.cssText = 'margin:12px 0 16px; font-size:16px;';
        heading.textContent = post.title;

        const meta = document.createElement('div');
        meta.className = 'blog-meta';

        const dateSpan = document.createElement('span');
        dateSpan.textContent = post.date;

        const readSpan = document.createElement('span');
        readSpan.textContent = post.readTime || '';

        meta.appendChild(dateSpan);
        meta.appendChild(readSpan);
        body.appendChild(tag);
        body.appendChild(heading);
        body.appendChild(meta);
        card.appendChild(thumb);
        card.appendChild(body);

        grid.appendChild(card);
        observer.observe(card);
      });
    }
  }

  // Load blog posts on page load
  loadBlogPosts();

  // ─── BACK TO TOP ───
  const btt = document.getElementById('back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
