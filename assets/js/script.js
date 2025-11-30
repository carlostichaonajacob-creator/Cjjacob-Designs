// ============================================
// OPTIMIZED JS FOR iOS PERFORMANCE - FIXED
// ============================================

// ============================================
// DEVICE DETECTION
// ============================================
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// PERFORMANCE CONFIG
// ============================================
const performanceConfig = {
  enableLenis: !isIOS,
  enableBackdropFilter: !isIOS,
  enableMouseGradient: !isMobile,
  enable3DTransforms: !isIOS,
  enableHeavyAnimations: !isIOS && !prefersReducedMotion,
  textAnimationDelay: isIOS ? 0.01 : 0.03,
  scrollTriggerMarkers: false
};

// ============================================
// OPTIMIZED TEXT REVEAL
// ============================================
function splitTextToChars(element) {
  const text = element.getAttribute('data-text');
  const baseDelay = parseFloat(element.getAttribute('data-delay')) || 0;
  
  if (!element.dataset.originalText) {
    element.dataset.originalText = element.textContent;
  }
  
  if (prefersReducedMotion || (isIOS && text.length > 100)) {
    element.textContent = text;
    element.style.opacity = '1';
    return;
  }
  
  element.innerHTML = '';
  const words = text.split(' ');
  let charIndex = 0;
  
  words.forEach((word, wordIndex) => {
    const wordWrapper = document.createElement('span');
    wordWrapper.classList.add('word-wrapper');
    
    word.split('').forEach((char) => {
      const span = document.createElement('span');
      span.classList.add('char');
      span.textContent = char;
      
      const delayMultiplier = performanceConfig.textAnimationDelay;
      const charDelay = baseDelay + (charIndex * delayMultiplier);
      span.style.animationDelay = `${charDelay}s`;
      
      wordWrapper.appendChild(span);
      charIndex++;
    });
    
    element.appendChild(wordWrapper);
    
    if (wordIndex < words.length - 1) {
      const space = document.createElement('span');
      space.classList.add('word-space');
      space.innerHTML = '&nbsp;';
      element.appendChild(space);
    }
  });
}

// ============================================
// OPTIMIZED LINE-BY-LINE REVEAL
// ============================================
function splitIntoLines(element) {
  if (!element || element.dataset.splitProcessed) return;
  
  const text = element.textContent.trim();
  if (!text) return;
  
  if (isIOS) {
    element.style.opacity = '1';
    return;
  }
  
  const words = text.split(/\s+/);
  element.innerHTML = '';
  element.dataset.originalText = text;
  
  const temp = document.createElement('div');
  const styles = window.getComputedStyle(element);
  temp.style.cssText = `
    position: absolute;
    visibility: hidden;
    width: ${element.offsetWidth}px;
    font-size: ${styles.fontSize};
    font-family: ${styles.fontFamily};
    font-weight: ${styles.fontWeight};
    line-height: ${styles.lineHeight};
  `;
  document.body.appendChild(temp);
  
  let lines = [];
  let currentLine = [];
  let lastTop = null;
  
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.textContent = word + ' ';
    span.style.display = 'inline';
    temp.appendChild(span);
    
    const rect = span.getBoundingClientRect();
    const currentTop = rect.top;
    
    if (lastTop !== null && currentTop > lastTop) {
      lines.push(currentLine.join(' '));
      currentLine = [word];
    } else {
      currentLine.push(word);
    }
    
    lastTop = currentTop;
    
    if (i === words.length - 1) {
      lines.push(currentLine.join(' '));
    }
  });
  
  document.body.removeChild(temp);
  
  lines.forEach(lineText => {
    const lineWrapper = document.createElement('div');
    lineWrapper.className = 'line';
    
    const lineInner = document.createElement('div');
    lineInner.className = 'line-inner';
    lineInner.textContent = lineText;
    
    lineWrapper.appendChild(lineInner);
    element.appendChild(lineWrapper);
  });
  
  element.dataset.splitProcessed = 'true';
  return element.querySelectorAll('.line');
}

// ============================================
// OPTIMIZED LINE ANIMATION
// ============================================
function setupLineAnimation(lines, trigger, startDelay = 0) {
  if (!lines || lines.length === 0) return;
  
  lines.forEach((line) => {
    const lineInner = line.querySelector('.line-inner');
    if (!lineInner) return;
    
    gsap.to(lineInner, {
      y: 0,
      duration: isIOS ? 0.8 : 1.2,
      delay: startDelay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: trigger,
        start: "top 85%",
        end: "top 65%",
        toggleActions: "play none none none",
        fastScrollEnd: isIOS,
        preventOverlaps: isIOS
      }
    });
  });
}

// ============================================
// DEBOUNCED RESIZE
// ============================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// MAIN INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  gsap.registerPlugin(ScrollTrigger);
  
  ScrollTrigger.config({
    limitCallbacks: true,
    syncInterval: isIOS ? 150 : 50
  });

  // ============================================
  // LENIS SMOOTH SCROLL
  // ============================================
  let lenis = null;
  
  if (performanceConfig.enableLenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
      infinite: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    ScrollTrigger.normalizeScroll(true);
  }

  // ============================================
  // ANCHOR LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, { offset: 0, duration: 1.5 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ============================================
  // HAMBURGER MENU
  // ============================================
  const hamburger = document.querySelector('.hamburger');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav a');
  let menuOpen = false;

  if (hamburger && mobileOverlay) {
    hamburger.addEventListener('click', () => {
      menuOpen = !menuOpen;
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', menuOpen);
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = menuOpen ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuOpen = false;
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', false);
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================
  // NAVBAR SCROLL STATE
  // ============================================
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    ScrollTrigger.create({
      start: 'top -40',
      onEnter: () => navbar.classList.add('scrolled'),
      onLeaveBack: () => navbar.classList.remove('scrolled'),
      fastScrollEnd: isIOS
    });
  }

  // ============================================
  // PAGE LOAD ANIMATIONS
  // ============================================
  const loadTimeline = gsap.timeline({ delay: 0.2 });

  loadTimeline
    .to('.logo', {
      opacity: 1,
      duration: isIOS ? 0.5 : 0.8,
      ease: 'power2.out'
    })
    .to('.nav-links a', {
      opacity: 0.7,
      duration: isIOS ? 0.4 : 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      onComplete: () => {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.add('loaded'));
      }
    }, '+=0.0')
    .to('.hero-title', {
      opacity: 1,
      y: 0,
      duration: isIOS ? 0.4 : 0.6,
      ease: 'power2.out'
    }, '+=0.0')
    .to('.subtext', {
      opacity: 1,
      y: 0,
      duration: isIOS ? 0.3 : 0.5,
      ease: 'power2.out'
    }, '-=0.24')
    .to('.hero-ctas', {
      opacity: 1,
      y: 0,
      duration: isIOS ? 0.5 : 0.8,
      ease: 'power2.out'
    }, '+=0.3');

  // ============================================
  // TEXT ANIMATIONS
  // ============================================
  const heroTitle = document.querySelector('.hero-title.text-reveal');
  if (heroTitle && performanceConfig.enableHeavyAnimations) {
    splitTextToChars(heroTitle);
  } else if (heroTitle) {
    heroTitle.style.opacity = '1';
  }

  const subtext = document.querySelector('.subtext[data-split-text="true"]');
  if (subtext && performanceConfig.enableHeavyAnimations) {
    document.fonts.ready.then(() => {
      splitIntoLines(subtext);
      const subtextLines = subtext.querySelectorAll('.line');
      setupLineAnimation(subtextLines, '.hero', 2.8);
    });
  } else if (subtext) {
    subtext.style.opacity = '1';
  }

  const aboutTexts = document.querySelectorAll('.about__text[data-split-text="true"]');
  if (aboutTexts.length > 0 && performanceConfig.enableHeavyAnimations) {
    document.fonts.ready.then(() => {
      aboutTexts.forEach((text, index) => {
        splitIntoLines(text);
        const lines = text.querySelectorAll('.line');
        setupLineAnimation(lines, '.about', 1.0 + (index * 0.6));
      });
    });
  } else {
    aboutTexts.forEach(text => text.style.opacity = '1');
  }

  // ============================================
  // DARK MODE TRIGGERS
  // ============================================
  ScrollTrigger.create({
    trigger: '#about',
    start: 'top 150px',
    onEnter: () => document.body.classList.add('dark-mode'),
    onLeaveBack: () => document.body.classList.remove('dark-mode'),
    fastScrollEnd: isIOS
  });

  ScrollTrigger.create({
    trigger: '#process',
    start: 'top 150px',
    onEnter: () => document.body.classList.remove('dark-mode'),
    onLeaveBack: () => document.body.classList.add('dark-mode'),
    fastScrollEnd: isIOS
  });

  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top 200px',
    onEnter: () => document.body.classList.add('dark-mode'),
    onLeaveBack: () => document.body.classList.remove('dark-mode'),
    fastScrollEnd: isIOS
  });

  // ============================================
  // SECTION ANIMATIONS
  // ============================================
  gsap.to('.about__title', {
    scrollTrigger: {
      trigger: '.about',
      start: 'top 70%',
      fastScrollEnd: isIOS
    },
    opacity: 1,
    y: 0,
    duration: isIOS ? 0.5 : 0.8,
    ease: 'power3.out'
  });

  gsap.to('.about__content', {
    scrollTrigger: {
      trigger: '.about',
      start: 'top 65%',
      fastScrollEnd: isIOS
    },
    opacity: 1,
    y: 0,
    duration: isIOS ? 0.5 : 0.8,
    delay: 0.1,
    ease: 'power3.out'
  });

  gsap.to('.work-header', {
    scrollTrigger: {
      trigger: '.work-section',
      start: 'top 70%',
      fastScrollEnd: isIOS
    },
    opacity: 1,
    duration: isIOS ? 0.6 : 1.0,
    ease: 'power2.out'
  });

  gsap.utils.toArray('.work-card').forEach((item, i) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 75%',
        fastScrollEnd: isIOS
      },
      opacity: 1,
      y: 0,
      duration: isIOS ? 0.5 : 0.8,
      delay: 0.3 + (i * 0.1),
      ease: 'power2.out'
    });
  });

  // ============================================
  // MOUSE GRADIENT (DESKTOP ONLY)
  // ============================================
  if (performanceConfig.enableMouseGradient) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    const updateMousePosition = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const animateGradient = () => {
      document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
      requestAnimationFrame(animateGradient);
    };
    
    document.addEventListener('mousemove', updateMousePosition, { passive: true });
    animateGradient();
    
    setTimeout(() => document.body.classList.add('mouse-active'), 1000);
  }

  // ============================================
  // FORM FUNCTIONALITY
  // ============================================
  const form = document.getElementById('contactForm');
  if (form) {
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      const label = input.previousElementSibling;
      
      if (label && input.value) {
        label.classList.add('floating');
      }
      
      input.addEventListener('focus', () => {
        if (label) label.classList.add('floating');
      });
      
      input.addEventListener('blur', () => {
        if (label && !input.value) {
          label.classList.remove('floating');
        }
      });
    });

    form.addEventListener('submit', (e) => {
      const btn = form.querySelector('.submit-btn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }
    });
  }

  // ============================================
  // iOS OPTIMIZATIONS
  // ============================================
  if (isIOS) {
    document.body.classList.add('is-ios');
  }

  // ============================================
  // RESIZE HANDLER
  // ============================================
  const handleResize = debounce(() => {
    ScrollTrigger.refresh();
  }, isIOS ? 500 : 250);

  window.addEventListener('resize', handleResize, { passive: true });

}); // END DOMContentLoaded
