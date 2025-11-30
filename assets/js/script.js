// ============================================
// OPTIMIZED JS FOR iOS PERFORMANCE
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
  enableLenis: !isIOS, // Disable Lenis on iOS
  enableBackdropFilter: !isIOS, // Reduce backdrop-filter on iOS
  enableMouseGradient: !isMobile, // No mouse effects on mobile
  enable3DTransforms: !isIOS, // Use 2D on iOS
  enableHeavyAnimations: !isIOS && !prefersReducedMotion,
  textAnimationDelay: isIOS ? 0.01 : 0.03, // Faster on iOS
  scrollTriggerMarkers: false
};

// ============================================
// OPTIMIZED TEXT REVEAL - LIGHTER FOR iOS
// ============================================
function splitTextToChars(element) {
  const text = element.getAttribute('data-text');
  const baseDelay = parseFloat(element.getAttribute('data-delay')) || 0;
  
  if (!element.dataset.originalText) {
    element.dataset.originalText = element.textContent;
  }
  
  // Skip animation on reduced motion or iOS with many characters
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
      
      const isAboutSection = element.closest('.about') !== null;
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
  
  // Simplified version for iOS
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
    letter-spacing: ${styles.letterSpacing};
    text-align: ${styles.textAlign};
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
        // Reduce calculations on iOS
        fastScrollEnd: isIOS,
        preventOverlaps: isIOS
      }
    });
  });
}

// ============================================
// DEBOUNCED RESIZE HANDLER
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
  
  // Configure ScrollTrigger for better iOS performance
  ScrollTrigger.config({
    limitCallbacks: true,
    syncInterval: isIOS ? 150 : 50 // Less frequent updates on iOS
  });

  // ============================================
  // LENIS SMOOTH SCROLL - DISABLED ON iOS
  // ============================================
  let lenis = null;
  
  if (performanceConfig.enableLenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  } else {
    // iOS: Use native scroll with ScrollTrigger only
    ScrollTrigger.normalizeScroll(true);
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, {
            offset: 0,
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        } else {
          // Native smooth scroll for iOS
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ============================================
  // MOBILE CHECK
  // ============================================
  const checkMobile = () => window.innerWidth < 768;
  let cachedIsMobile = checkMobile();

  window.addEventListener('resize', () => {
    cachedIsMobile = checkMobile();
  }, { passive: true });

  // ============================================
  // HAMBURGER MENU TOGGLE
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
  // NAVBAR SCROLLED STATE
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
  // PAGE LOAD ANIMATIONS - OPTIMIZED
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
  // TEXT REVEAL ANIMATIONS - HERO
  // ============================================
  const heroTitle = document.querySelector('.hero-title.text-reveal');
  if (heroTitle && performanceConfig.enableHeavyAnimations) {
    splitTextToChars(heroTitle);
  } else if (heroTitle) {
    heroTitle.style.opacity = '1';
  }

  // ============================================
  // TEXT SPLIT LINE ANIMATIONS - CONDITIONAL
  // ============================================
  
  // Hero subtext
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
  
  // About paragraphs
  const aboutTexts = document.querySelectorAll('.about__text[data-split-text="true"]');
  if (aboutTexts.length > 0 && performanceConfig.enableHeavyAnimations) {
    document.fonts.ready.then(() => {
      aboutTexts.forEach((text, index) => {
        splitIntoLines(text);
        const lines = text.querySelectorAll('.line');
        const paragraphDelay = 1.0 + (index * 0.6);
        setupLineAnimation(lines, '.about', paragraphDelay);
      });
    });
  } else {
    aboutTexts.forEach(text => text.style.opacity = '1');
  }
  
  // Process subtitle
  const processSubtitle = document.querySelector('.process__subtitle[data-split-text="true"]');
  if (processSubtitle && performanceConfig.enableHeavyAnimations) {
    document.fonts.ready.then(() => {
      splitIntoLines(processSubtitle);
      const lines = processSubtitle.querySelectorAll('.line');
      setupLineAnimation(lines, '.process', 1.2);
    });
  } else if (processSubtitle) {
    processSubtitle.style.opacity = '1';
  }

  // Work subtitle
  const workSubtitle = document.querySelector('.work-header__subtitle[data-split-text="true"]');
  if (workSubtitle && performanceConfig.enableHeavyAnimations) {
    document.fonts.ready.then(() => {
      splitIntoLines(workSubtitle);
      const lines = workSubtitle.querySelectorAll('.line');
      setupLineAnimation(lines, '.work-section', 1.2);
    });
  } else if (workSubtitle) {
    workSubtitle.style.opacity = '1';
  }
  
  // Contact subtitle
  const contactSubtitle = document.querySelector('.contact-subtitle[data-split-text="true"]');
  if (contactSubtitle && performanceConfig.enableHeavyAnimations) {
    document.fonts.ready.then(() => {
      splitIntoLines(contactSubtitle);
      const lines = contactSubtitle.querySelectorAll('.line');
      setupLineAnimation(lines, '#contact', 1.4);
    });
  } else if (contactSubtitle) {
    contactSubtitle.style.opacity = '1';
  }

  // ============================================
  // DARK MODE TRIGGERS - OPTIMIZED
  // ============================================
  const aboutSection = document.querySelector('#about');
  const processSection = document.querySelector('#process');
  const contactSection = document.querySelector('#contact');

  if (aboutSection) {
    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 150px',
      onEnter: () => document.body.classList.add('dark-mode'),
      onLeaveBack: () => document.body.classList.remove('dark-mode'),
      fastScrollEnd: isIOS
    });
  }

  if (processSection) {
    ScrollTrigger.create({
      trigger: '#process',
      start: 'top 150px',
      onEnter: () => document.body.classList.remove('dark-mode'),
      onLeaveBack: () => document.body.classList.add('dark-mode'),
      fastScrollEnd: isIOS
    });
  }

  if (contactSection) {
    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top 200px',
      onEnter: () => document.body.classList.add('dark-mode'),
      onLeaveBack: () => document.body.classList.remove('dark-mode'),
      fastScrollEnd: isIOS
    });
  }

  // ============================================
  // SECTION SCROLL ANIMATIONS - OPTIMIZED
  // ============================================
  const aboutTitle = document.querySelector('.about__title');
  const aboutContent = document.querySelector('.about__content');
  
  if (aboutTitle) {
    gsap.to('.about__title', {
      scrollTrigger: {
        trigger: '.about',
        start: 'top 70%',
        fastScrollEnd: isIOS,
        onEnter: () => {
          const aboutTitleReveal = document.querySelector('.about__title.text-reveal');
          if (aboutTitleReveal && !aboutTitleReveal.dataset.animated && performanceConfig.enableHeavyAnimations) {
            splitTextToChars(aboutTitleReveal);
            aboutTitleReveal.dataset.animated = 'true';
          } else if (aboutTitleReveal) {
            aboutTitleReveal.style.opacity = '1';
            aboutTitleReveal.dataset.animated = 'true';
          }
        }
      },
      opacity: 1,
      y: 0,
      duration: isIOS ? 0.5 : 0.8,
      ease: 'power3.out'
    });
  }

  if (aboutContent) {
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
  }

  const workHeader = document.querySelector('.work-header');
  if (workHeader) {
    gsap.to('.work-header', {
      scrollTrigger: {
        trigger: '.work-section',
        start: 'top 70%',
        fastScrollEnd: isIOS,
        onEnter: () => {
          const workTitleReveal = document.querySelector('.work-header__title.text-reveal');
          if (workTitleReveal && !workTitleReveal.dataset.animated && performanceConfig.enableHeavyAnimations) {
            splitTextToChars(workTitleReveal);
            workTitleReveal.dataset.animated = 'true';
          } else if (workTitleReveal) {
            workTitleReveal.style.opacity = '1';
            workTitleReveal.dataset.animated = 'true';
          }
        }
      },
      opacity: 1,
      duration: isIOS ? 0.6 : 1.0,
      ease: 'power2.out'
    });
  }

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

  const processHeader = document.querySelector('.process__header');
  if (processHeader) {
    gsap.to('.process__header', {
      scrollTrigger: {
        trigger: '.process',
        start: 'top 60%',
        fastScrollEnd: isIOS,
        onEnter: () => {
          const processTitles = document.querySelectorAll('.process__title.text-reveal');
          processTitles.forEach(title => {
            if (!title.dataset.animated && performanceConfig.enableHeavyAnimations) {
              splitTextToChars(title);
              title.dataset.animated = 'true';
            } else if (!title.dataset.animated) {
              title.style.opacity = '1';
              title.dataset.animated = 'true';
            }
          });
        }
      },
      opacity: 1,
      duration: isIOS ? 0.6 : 1.0,
      ease: 'power2.out'
    });
  }

  // ============================================
  // PROCESS STEP ANIMATION (DESKTOP)
  // ============================================
  const steps = document.querySelectorAll('.process__step');
  const dots = document.querySelectorAll('.process__dot');
  let currentStep = 0;

  const updateProcessStep = (newStep) => {
    if (newStep === currentStep) return;
    currentStep = newStep;
    
    steps.forEach((step, i) => {
      step.classList.remove('active', 'prev', 'next');
      if (i === currentStep) {
        step.classList.add('active');
      } else if (i === currentStep - 1) {
        step.classList.add('prev');
      } else if (i === currentStep + 1) {
        step.classList.add('next');
      }
    });
    
    dots.forEach((dot, i) => {
      const isActive = i === currentStep;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive);
    });
  };

  if (window.innerWidth >= 1280 && steps.length > 0) {
    ScrollTrigger.create({
      trigger: '.process__sticky-wrapper',
      start: 'top top',
      end: 'bottom bottom',
      fastScrollEnd: isIOS,
      onUpdate: (self) => {
        const progress = self.progress;
        const total = steps.length - 1;
        const newStep = Math.min(Math.round(progress * total), total);
        updateProcessStep(newStep);
      }
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      updateProcessStep(i);
    });
  });

  // ============================================
  // MOBILE PROCESS CAROUSEL - OPTIMIZED FOR iOS
  // ============================================
  const mobileSteps = [
    {
      number: "01",
      title: "Discovery Call",
      description: "We'll talk about your business, what you need, and what success looks like. I'll tell you exactly what's possible, what it'll cost, and how long it'll take."
    },
    {
      number: "02",
      title: "Planning & Content",
      description: "I'll map out your site structure and help you figure out what goes on each page. If you need guidance with content or images, I'll walk you through it."
    },
    {
      number: "03",
      title: "Design",
      description: "I'll design your site to look professional, clean, and trustworthy. You'll see exactly what it looks like before anything is built, and we'll refine it until you're happy."
    },
    {
      number: "04",
      title: "Build & Test",
      description: "I'll build your site to work fast, look great on all devices, and show up properly in search results. Everything gets tested to ensure it works smoothly."
    },
    {
      number: "05",
      title: "Launch & Support",
      description: "Your site goes live, and I'll show you how to make basic updates (or handle them for you). Ongoing support is available whenever you need it."
    }
  ];

  let mobileCurrentStep = 0;
  let mobileStartX = 0;
  let mobileCurrentX = 0;
  let mobileStartY = 0;
  let mobileCurrentY = 0;
  let mobileIsDragging = false;
  const MIN_SWIPE = 80;

  function initMobileCarousel() {
    if (window.innerWidth >= 1280) return;
    
    renderMobileCards();
    renderMobileDots();
    setupMobileEvents();
    updateMobileView();
  }

  function renderMobileCards() {
    const container = document.getElementById('mobileCardsContainer');
    if (!container) return;
    
    mobileSteps.forEach((step, index) => {
      const card = document.createElement('div');
      card.className = `mobile-card mobile-card-${index + 1}`;
      card.innerHTML = `
        <div class="mobile-card-inner">
          <div class="mobile-gradient-accent"></div>
          ${performanceConfig.enable3DTransforms ? `
            <div class="mobile-card-decoration mobile-decoration-1"></div>
            <div class="mobile-card-decoration mobile-decoration-2"></div>
          ` : ''}
          <div class="mobile-card-content">
            <div class="mobile-step-badge">
              <span class="mobile-step-number">${step.number}</span>
              <span>Step ${step.number}</span>
            </div>
            <h3 class="mobile-card-title">${step.title}</h3>
            <p class="mobile-card-description">${step.description}</p>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function renderMobileDots() {
    const container = document.getElementById('mobileProgressDots');
    if (!container) return;
    
    mobileSteps.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'mobile-dot';
      dot.setAttribute('aria-label', `Go to step ${index + 1}`);
      dot.addEventListener('click', () => {
        goToMobileStep(index);
      });
      container.appendChild(dot);
    });
  }

  function setupMobileEvents() {
    const container = document.getElementById('mobileCardsContainer');
    if (!container) return;
    
    // Touch events with passive flags
    container.addEventListener('touchstart', handleMobileStart, { passive: true });
    container.addEventListener('touchmove', handleMobileMove, { passive: false });
    container.addEventListener('touchend', handleMobileEnd, { passive: true });
    
    // Mouse events for desktop testing
    if (!isMobile) {
      container.addEventListener('mousedown', handleMobileStart);
      container.addEventListener('mousemove', handleMobileMove);
      container.addEventListener('mouseup', handleMobileEnd);
      container.addEventListener('mouseleave', handleMobileEnd);
    }
    
    // Navigation buttons
    const prevBtn = document.getElementById('mobilePrevBtn');
    const nextBtn = document.getElementById('mobileNextBtn');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (mobileCurrentStep > 0) {
          goToMobileStep(mobileCurrentStep - 1);
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (mobileCurrentStep < mobileSteps.length - 1) {
          goToMobileStep(mobileCurrentStep + 1);
        }
      });
    }
  }

  function handleMobileStart(e) {
    mobileIsDragging = true;
    mobileStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    mobileStartY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    mobileCurrentX = mobileStartX;
    mobileCurrentY = mobileStartY;
  }

  function handleMobileMove(e) {
    if (!mobileIsDragging) return;
    
    mobileCurrentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    mobileCurrentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    const diffX = Math.abs(mobileCurrentX - mobileStartX);
    const diffY = Math.abs(mobileCurrentY - mobileStartY);
    
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
      
      const diff = mobileCurrentX - mobileStartX;
      const cards = document.querySelectorAll('.mobile-card');
      const dragProgress = Math.max(-1, Math.min(1, diff / 300));
      
      cards.forEach((card, index) => {
        if (index === mobileCurrentStep) {
          // Use 2D transforms on iOS for better performance
          if (isIOS) {
            card.style.transform = `translateX(${dragProgress * 100}px) scale(${1 - Math.abs(dragProgress) * 0.1})`;
          } else {
            card.style.transform = `translateX(${dragProgress * 100}px) scale(${1 - Math.abs(dragProgress) * 0.1})`;
          }
          card.style.opacity = 1 - Math.abs(dragProgress) * 0.3;
        }
      });
    } else if (diffY > diffX && diffY > 10) {
      mobileIsDragging = false;
      document.querySelectorAll('.mobile-card').forEach(card => {
        card.style.transform = '';
        card.style.opacity = '';
      });
    }
  }

  function handleMobileEnd(e) {
    if (!mobileIsDragging) return;
    
    const diffX = mobileCurrentX - mobileStartX;
    const diffY = Math.abs(mobileCurrentY - mobileStartY);
    const diffXAbs = Math.abs(diffX);
    
    // Reset transforms
    document.querySelectorAll('.mobile-card').forEach(card => {
      card.style.transform = '';
      card.style.opacity = '';
    });
    
    if (diffXAbs > diffY) {
      if (diffX < -MIN_SWIPE && mobileCurrentStep < mobileSteps.length - 1) {
        goToMobileStep(mobileCurrentStep + 1);
      } else if (diffX > MIN_SWIPE && mobileCurrentStep > 0) {
        goToMobileStep(mobileCurrentStep - 1);
      } else {
        updateMobileView();
      }
    }
    
    mobileIsDragging = false;
    mobileStartX = 0;
    mobileCurrentX = 0;
    mobileStartY = 0;
    mobileCurrentY = 0;
  }

  function goToMobileStep(index) {
    mobileCurrentStep = index;
    updateMobileView();
  }

  function updateMobileView() {
    const cards = document.querySelectorAll('.mobile-card');
    const dots = document.querySelectorAll('.mobile-dot');
    
    cards.forEach((card, index) => {
      card.className = `mobile-card mobile-card-${index + 1}`;
      
      const diff = index - mobileCurrentStep;
      
      if (diff === 0) {
        card.classList.add('active');
      } else if (diff === 1) {
        card.classList.add('next');
      } else if (diff === -1) {
        card.classList.add('prev');
      } else if (diff >= 2) {
        card.classList.add('far-next');  } else if (diff <= -2) {
    card.classList.add('far-prev');
  } else {
    card.classList.add('hidden');
  }
});

dots.forEach((dot, index) => {
  dot.classList.toggle('active', index === mobileCurrentStep);
});

const prevBtn = document.getElementById('mobilePrevBtn');
const nextBtn = document.getElementById('mobileNextBtn');
if (prevBtn) prevBtn.classList.toggle('disabled', mobileCurrentStep === 0);
if (nextBtn) nextBtn.classList.toggle('disabled', mobileCurrentStep === mobileSteps.length - 1);
}
initMobileCarousel();
// ============================================
// CONTACT & FOOTER ANIMATIONS
// ============================================
const contactContent = document.querySelector('.contact-content');
const contactFormWrapper = document.querySelector('.contact-form-wrapper');
const footer = document.querySelector('footer');
if (contactContent) {
gsap.to('.contact-content', {
scrollTrigger: {
trigger: '#contact',
start: 'top 70%',
fastScrollEnd: isIOS,
onEnter: () => {
const contactTitle = document.querySelector('#contact .text-reveal');
if (contactTitle && !contactTitle.dataset.animated && performanceConfig.enableHeavyAnimations) {
splitTextToChars(contactTitle);
contactTitle.dataset.animated = 'true';
} else if (contactTitle) {
contactTitle.style.opacity = '1';
contactTitle.dataset.animated = 'true';
}
}
},
opacity: 1,
duration: isIOS ? 0.8 : 1.2,
ease: 'power2.out'
});
}
if (contactFormWrapper) {
gsap.to('.contact-form-wrapper', {
scrollTrigger: {
trigger: '#contact',
start: 'top 65%',
fastScrollEnd: isIOS
},
opacity: 1,
duration: isIOS ? 0.6 : 1,
delay: 0.15,
ease: 'power3.out'
});
}
if (footer) {
gsap.to('footer', {
scrollTrigger: {
trigger: 'footer',
start: 'top 85%',
fastScrollEnd: isIOS
},
opacity: 1,
duration: isIOS ? 0.5 : 0.8,
ease: 'power3.out'
});
}
// ============================================
// PARALLAX SCROLLING - DISABLED ON iOS
// ============================================
if (window.innerWidth >= 768 && performanceConfig.enableHeavyAnimations) {
const heroTitle = document.querySelector('.hero-title');
const subtext = document.querySelector('.subtext');
if (heroTitle) {
  gsap.to('.hero-title', {
    yPercent: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true
    }
  });
}

if (subtext) {
  gsap.to('.subtext', {
    yPercent: -50,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true
    }
  });
}
}
// ============================================
// MOUSE-FOLLOW GRADIENT - DESKTOP ONLY
// ============================================
if (performanceConfig.enableMouseGradient) {
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentX = mouseX;
let currentY = mouseY;
const updateMousePosition = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
};

const animateGradient = () => {
  // Smooth interpolation
  currentX += (mouseX - currentX) * 0.1;
  currentY += (mouseY - currentY) * 0.1;
  
  document.documentElement.style.setProperty('--mouse-x', `${currentX}px`);
  document.documentElement.style.setProperty('--mouse-y', `${currentY}px`);
  requestAnimationFrame(animateGradient);
};

document.addEventListener('mousemove', updateMousePosition, { passive: true });
animateGradient();

setTimeout(() => {
  document.body.classList.add('mouse-active');
}, 1000);

const clickableElements = document.querySelectorAll('a, button, .browser-window, .process__dot, input, textarea, select');
clickableElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    document.body.classList.add('hovering-link');
  }, { passive: true });
  el.addEventListener('mouseleave', () => {
    document.body.classList.remove('hovering-link');
  }, { passive: true });
});
}
// ============================================
// CUSTOM CURSOR - DESKTOP ONLY
// ============================================
const cursor = document.getElementById('customCursor');
const cards = document.querySelectorAll('[data-cursor="true"]');
if (cursor && cards.length > 0 && window.innerWidth >= 1024 && !isMobile) {
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let isActive = false;
const smoothing = 0.2;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  if (isActive) {
    cursor.style.display = 'flex';
  }
}, { passive: true });

function animateCursor() {
  if (isActive) {
    cursorX += (mouseX - cursorX) * smoothing;
    cursorY += (mouseY - cursorY) * smoothing;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
  }
  
  requestAnimationFrame(animateCursor);
}

animateCursor();

cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    isActive = true;
    cursor.style.display = 'flex';
    cursor.classList.add('active');
    cursorX = mouseX;
    cursorY = mouseY;
  }, { passive: true });

  card.addEventListener('mouseleave', () => {
    isActive = false;
    cursor.classList.remove('active');
    setTimeout(() => {
      if (!isActive) {
        cursor.style.display = 'none';
      }
    }, 200);
  }, { passive: true });
});

cursor.style.display = 'none';
}
// ============================================
// MAGNETIC CURSOR - DESKTOP ONLY
// ============================================
class MagneticCursor {
constructor() {
this.magneticElements = document.querySelectorAll('.cta-btn, .btn-primary, .btn-secondary, .submit-btn');
this.isMobile = isMobile;
if (!this.isMobile && window.innerWidth >= 1024) this.init();
}
init() {
  this.magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => this.magnetize(e, el), { passive: true });
    el.addEventListener('mouseleave', () => this.reset(el), { passive: true });
  });
}

magnetize(e, el) {
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = e.clientX - centerX;
  const deltaY = e.clientY - centerY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  if (distance < 80) {
    const strength = Math.min(distance / 80, 1);
    const moveX = deltaX * 0.15 * strength;
    const moveY = deltaY * 0.15 * strength;
    
    el.style.setProperty('--mag-x', `${moveX}px`);
    el.style.setProperty('--mag-y', `${moveY}px`);
  }
}

reset(el) {
  el.style.setProperty('--mag-x', '0px');
  el.style.setProperty('--mag-y', '0px');
}
}
if (!isMobile) {
new MagneticCursor();
}
// ============================================
// RIPPLE EFFECT
// ============================================
function createRipple(event, element) {
const ripple = document.createElement('span');
const rect = element.getBoundingClientRect();
const size = Math.max(rect.width, rect.height);
const x = event.clientX - rect.left - size / 2;
const y = event.clientY - rect.top - size / 2;
ripple.className = 'ripple';
ripple.style.width = ripple.style.height = size + 'px';
ripple.style.left = x + 'px';
ripple.style.top = y + 'px';

element.appendChild(ripple);

setTimeout(() => ripple.remove(), 600);
}
document.querySelectorAll('.cta-btn, .btn-primary, .btn-secondary, .submit-btn').forEach(btn => {
btn.addEventListener('click', function(e) {
createRipple(e, this);
});
});
// ============================================
// TOUCH FEEDBACK
// ============================================
if ('ontouchstart' in window) {
const touchElements = document.querySelectorAll('.btn-primary, .btn-secondary, .cta-btn, .submit-btn, .nav-links a');
touchElements.forEach(el => {
  el.addEventListener('touchstart', function() {
    this.style.transform = 'scale(0.98)';
  }, { passive: true });
  
  el.addEventListener('touchend', function() {
    setTimeout(() => {
      this.style.transform = '';
    }, 100);
  }, { passive: true });
});
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
  if (!btn) return;
  
  btn.disabled = true;
  btn.textContent = 'Sending...';
});
}
// ============================================
// OPTIMIZED RESIZE HANDLER
// ============================================
const handleResize = debounce(() => {
// Only refresh ScrollTrigger, don't recalculate text splits on iOS
ScrollTrigger.refresh();
// Reinitialize mobile carousel on orientation change
if (window.innerWidth < 1280) {
  const mobileContainer = document.getElementById('mobileCardsContainer');
  if (mobileContainer && mobileContainer.children.length === 0) {
    initMobileCarousel();
  }
}
}, isIOS ? 500 : 250);
window.addEventListener('resize', handleResize, { passive: true });
// ============================================
// iOS SPECIFIC OPTIMIZATIONS
// ============================================
if (isIOS) {
// Add iOS class to body for CSS targeting
document.body.classList.add('is-ios');
// Prevent rubber band scrolling
document.body.addEventListener('touchmove', function(e) {
  if (e.target.closest('.mobile-menu-overlay')) {
    return;
  }
}, { passive: true });

// Force GPU acceleration on key elements
const gpuElements = document.querySelectorAll('.hero-title, .mobile-card, .work-card, .process__step');
gpuElements.forEach(el => {
  el.style.transform = 'translate3d(0, 0, 0)';
  el.style.willChange = 'auto'; // Let browser decide
});
}
// ============================================
// PERFORMANCE MONITORING (OPTIONAL)
// ============================================
if (window.location.search.includes('debug=true')) {
console.log('Performance Config:', performanceConfig);
console.log('Device Info:', {
isIOS,
isMobile,
prefersReducedMotion,
userAgent: navigator.userAgent
});
}
});
