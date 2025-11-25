
    // ============================================
// GSAP SETUP new upadated code
// ============================================



// ============================================
// TEXT REVEAL ANIMATION - WORD-AWARE VERSION
// ============================================
function splitTextToChars(element) {
  const text = element.getAttribute('data-text');
  const baseDelay = parseFloat(element.getAttribute('data-delay')) || 0;
  
  // Store original text as backup
  if (!element.dataset.originalText) {
    element.dataset.originalText = element.textContent;
  }
  
  element.innerHTML = '';
  
  // Split into WORDS first to preserve word boundaries
  const words = text.split(' ');
  let charIndex = 0;
  
  words.forEach((word, wordIndex) => {
    // Create word wrapper - THIS prevents mid-word line breaks
    const wordWrapper = document.createElement('span');
    wordWrapper.classList.add('word-wrapper');
    
    // Split each word into characters
    word.split('').forEach((char) => {
      const span = document.createElement('span');
      span.classList.add('char');
      span.textContent = char;
      
      // Dynamic character delay based on parent element
      const isAboutSection = element.closest('.about') !== null;
      const delayMultiplier = isAboutSection ? 0.05 : 0.03;
      const charDelay = baseDelay + (charIndex * delayMultiplier);
      span.style.animationDelay = `${charDelay}s`;
      
      wordWrapper.appendChild(span);
      charIndex++;
    });
    
    element.appendChild(wordWrapper);
    
    // Add space between words (except after last word)
    if (wordIndex < words.length - 1) {
      const space = document.createElement('span');
      space.classList.add('word-space');
      space.innerHTML = '&nbsp;';
      element.appendChild(space);
    }
  });
}

// ============================================
// LINE-BY-LINE REVEAL - REFERENCE IMPLEMENTATION
// ============================================
/**
 * Splits text into animated lines using reference method
 * @param {HTMLElement} element - The element to split
 */
function splitIntoLines(element) {
  if (!element || element.dataset.splitProcessed) return;
  
  const text = element.textContent.trim();
  if (!text) return;
  
  const words = text.split(/\s+/);
  element.innerHTML = '';
  
  // Store original text for resize handling
  element.dataset.originalText = text;
  
  // Create temporary element to measure line breaks
  const temp = document.createElement('div');
  temp.style.cssText = `
    position: absolute;
    visibility: hidden;
    width: ${element.offsetWidth}px;
    font-size: ${window.getComputedStyle(element).fontSize};
    font-family: ${window.getComputedStyle(element).fontFamily};
    font-weight: ${window.getComputedStyle(element).fontWeight};
    line-height: ${window.getComputedStyle(element).lineHeight};
    letter-spacing: ${window.getComputedStyle(element).letterSpacing};
    text-align: ${window.getComputedStyle(element).textAlign};
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
  
  // Build the HTML structure with line masking
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
// ANIMATE LINES - REFERENCE IMPLEMENTATION
// ============================================
/**
 * Animates lines with reference method (per-line ScrollTrigger)
 * @param {NodeList} lines - The line elements to animate
 * @param {String|Element} trigger - The trigger element
 * @param {Number} startDelay - Initial delay (optional, for sequencing)
 */
function setupLineAnimation(lines, trigger, startDelay = 0) {
  if (!lines || lines.length === 0) return;
  
  lines.forEach((line, index) => {
    const lineInner = line.querySelector('.line-inner');
    if (!lineInner) return;
    
    gsap.to(lineInner, {
      y: 0,
      duration: 1.2,
      delay: startDelay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: trigger,
        start: "top 85%",
        end: "top 65%",
        toggleActions: "play none none none"
      }
    });
  });
}


// ============================================
// SINGLE DOMContentLoaded - Everything inside ONE listener
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  gsap.registerPlugin(ScrollTrigger);

  // ============================================
  // LENIS SMOOTH SCROLL - "GREASED WHEEL" EFFECT
  // ============================================
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false
  });

  // Animation loop - keeps Lenis running
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // CRITICAL: Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        lenis.scrollTo(target, {
          offset: 0,
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      }
    });
  });

  // ============================================
  // MOBILE CHECK
  // ============================================
  const isMobile = () => window.innerWidth < 768;
  let cachedIsMobile = isMobile();

  window.addEventListener('resize', () => {
    cachedIsMobile = isMobile();
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
      onLeaveBack: () => navbar.classList.remove('scrolled')
    });
  }

  // ... ALL YOUR OTHER CODE CONTINUES HERE ...
  // (Everything from your original file goes inside this single DOMContentLoaded)

}); // <-- Single closing bracket for DOMContentLoaded


document.addEventListener('DOMContentLoaded', function() {
  gsap.registerPlugin(ScrollTrigger);

  const isMobile = () => window.innerWidth < 768;
  let cachedIsMobile = isMobile();

  // Update cached value on resize
  window.addEventListener('resize', () => {
    cachedIsMobile = isMobile();
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
      onLeaveBack: () => navbar.classList.remove('scrolled')
    });
  }

  // ============================================
  // PAGE LOAD ANIMATIONS
  // ============================================
// ============================================
  // PAGE LOAD ANIMATIONS - SEQUENTIAL REVEAL
  // ============================================
  const loadTimeline = gsap.timeline({ delay: 0.4 });

  loadTimeline
    // STEP 1: Logo appears elegantly (0.4s delay + 0.8s duration = completes at 1.2s)
    .to('.logo', {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out'
    })
    // STEP 2: Nav links fade in sequentially (starts at 1.2s, completes ~2.0s)
    .to('.nav-links a', {
      opacity: 0.7,
      duration: 0.6,
      stagger: 0.1, // Each link staggers by 0.1s
      ease: 'power2.out',
      onComplete: () => {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.add('loaded'));
      }
    }, '+=0.0') // Start immediately after logo
    // STEP 3: Hero title container fades in (starts at 2.0s)
    .to('.hero-title', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '+=0.0') // Start immediately after nav
    // STEP 4: Hero subtext container fades in (starts when title is 60% done = at 2.36s)
    // The line-by-line animation will be triggered separately below
    .to('.subtext', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.24') // Start at 60% of previous animation (0.6s * 0.4 = 0.24s remaining)
    // STEP 5: CTA buttons pop in confidently (after subtext container fades)
    .to('.hero-ctas', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '+=0.3'); // Add 0.3s gap for breathing room


// ============================================
  // TEXT REVEAL ANIMATIONS - HERO
  // ============================================
  const heroTitle = document.querySelector('.hero-title.text-reveal');
  if (heroTitle) {
    splitTextToChars(heroTitle);
    // Character animation happens via CSS, triggered after container fades in
  }

  // ============================================
  // TEXT SPLIT LINE ANIMATIONS - Initialize all elements
  // ============================================

  
// ============================================
  // HERO SUBTEXT - Line-by-line reveal after title
  // ============================================
const subtext = document.querySelector('.subtext[data-split-text="true"]');
  if (subtext) {
    document.fonts.ready.then(() => {
      splitIntoLines(subtext);
      const subtextLines = subtext.querySelectorAll('.line');
      
      // Wait for hero title character reveal to finish (~2.8s), then start
      setupLineAnimation(subtextLines, '.hero', 2.8);
    });
  }
  
// ============================================
  // ABOUT PARAGRAPHS - Line-by-line after title
  // ============================================
const aboutTexts = document.querySelectorAll('.about__text[data-split-text="true"]');
  if (aboutTexts.length > 0) {
    document.fonts.ready.then(() => {
      aboutTexts.forEach((text, index) => {
        splitIntoLines(text);
        const lines = text.querySelectorAll('.line');
        
        // Wait for about title to finish (~0.8s), then stagger paragraphs
        const paragraphDelay = 1.0 + (index * 0.6);
        setupLineAnimation(lines, '.about', paragraphDelay);
      });
    });
  }
  
// Dynamic character delay based on parent element
    // About section gets slower reveal (0.05s), others use default (0.03s)

  
// ============================================
  // PROCESS SUBTITLE - Line-by-line after title
  // ============================================
const processSubtitle = document.querySelector('.process__subtitle[data-split-text="true"]');
  if (processSubtitle) {
    document.fonts.ready.then(() => {
      splitIntoLines(processSubtitle);
      const lines = processSubtitle.querySelectorAll('.line');
      
      // Wait for process title to finish (~1.0s), then start
      setupLineAnimation(lines, '.process', 1.2);
    });
  }


// ============================================
  // WORK SUBTITLE - Line-by-line after title
  // ============================================
const workSubtitle = document.querySelector('.work-header__subtitle[data-split-text="true"]');
  if (workSubtitle) {
    document.fonts.ready.then(() => {
      splitIntoLines(workSubtitle);
      const lines = workSubtitle.querySelectorAll('.line');
      
      // Wait for work title to finish (~1.0s), then start
      setupLineAnimation(lines, '.work-section', 1.2);
    });
  }
  
// ============================================
  // CONTACT SUBTITLE - Line-by-line after title
  // ============================================
const contactSubtitle = document.querySelector('.contact-subtitle[data-split-text="true"]');
  if (contactSubtitle) {
    document.fonts.ready.then(() => {
      splitIntoLines(contactSubtitle);
      const lines = contactSubtitle.querySelectorAll('.line');
      
      // Wait for contact title to finish (~1.2s), then start
      setupLineAnimation(lines, '#contact', 1.4);
    });
  }

  // ============================================
  // DARK MODE TRIGGERS - CONSOLIDATED
  // ============================================
  const aboutSection = document.querySelector('#about');
  const processSection = document.querySelector('#process');
  const contactSection = document.querySelector('#contact');

  if (aboutSection) {
    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 150px',
      onEnter: () => document.body.classList.add('dark-mode'),
      onLeaveBack: () => document.body.classList.remove('dark-mode')
    });
  }

  if (processSection) {
    ScrollTrigger.create({
      trigger: '#process',
      start: 'top 150px',
      onEnter: () => document.body.classList.remove('dark-mode'),
      onLeaveBack: () => document.body.classList.add('dark-mode')
    });
  }

  if (contactSection) {
    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top 200px',
      onEnter: () => document.body.classList.add('dark-mode'),
      onLeaveBack: () => document.body.classList.remove('dark-mode')
    });
  }

  // ============================================
  // SECTION SCROLL ANIMATIONS
  // ============================================
  const aboutTitle = document.querySelector('.about__title');
  const aboutContent = document.querySelector('.about__content');
  
if (aboutTitle) {
    gsap.to('.about__title', {
      scrollTrigger: {
        trigger: '.about',
        start: 'top 70%',
        onEnter: () => {
          const aboutTitleReveal = document.querySelector('.about__title.text-reveal');
          if (aboutTitleReveal && !aboutTitleReveal.dataset.animated) {
            splitTextToChars(aboutTitleReveal);
            aboutTitleReveal.dataset.animated = 'true';
          }
        }
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  if (aboutContent) {
    gsap.to('.about__content', {
      scrollTrigger: {
        trigger: '.about',
        start: 'top 65%'
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
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
        onEnter: () => {
          const workTitleReveal = document.querySelector('.work-header__title.text-reveal');
          if (workTitleReveal && !workTitleReveal.dataset.animated) {
            splitTextToChars(workTitleReveal);
            workTitleReveal.dataset.animated = 'true';
          }
        }
      },
      opacity: 1,
      duration: 1.0, // INCREASED for impact
      ease: 'power2.out'
    });
  }

gsap.utils.toArray('.work-card').forEach((item, i) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 75%'
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: 0.3 + (i * 0.1), // ADD 0.3s initial delay before cards start
      ease: 'power2.out'
    });
  });

const processHeader = document.querySelector('.process__header');
  if (processHeader) {
    gsap.to('.process__header', {
      scrollTrigger: {
        trigger: '.process',
        start: 'top 60%',
        onEnter: () => {
          const processTitles = document.querySelectorAll('.process__title.text-reveal');
          processTitles.forEach(title => {
            if (!title.dataset.animated) {
              splitTextToChars(title);
              title.dataset.animated = 'true';
            }
          });
        }
      },
      opacity: 1,
      duration: 1.0, // INCREASED
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
    onUpdate: (self) => {
      const progress = self.progress;
      const total = steps.length - 1;
      const newStep = Math.min(Math.round(progress * total), total);
      updateProcessStep(newStep);
    }
  });
}
  // Add click handlers for process dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      updateProcessStep(i);
    });
  });

  // ============================================
  // MOBILE PROCESS CAROUSEL
  // ============================================
  const mobileSteps = [
    {
      number: "01",
      title: "Discovery & Research",
      description: "We explore your vision, target audience, and competitive landscape to build a solid foundation for your project."
    },
    {
      number: "02",
      title: "Strategy & Planning",
      description: "We develop strategy including user journey mapping and content structure to ensure optimal results."
    },
    {
      number: "03",
      title: "Design & Prototyping",
      description: "Your brand comes to life through mockups and interactive prototypes that capture your vision perfectly."
    },
    {
      number: "04",
      title: "Development & Build",
      description: "I hand-code your site with performance and accessibility as top priorities for long-term success."
    },
    {
      number: "05",
      title: "Launch & Optimization",
      description: "Your site launches optimized for search engines and user experience, ready to grow your business."
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
    if (window.innerWidth >= 1280) return; // Only on mobile
    
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
          <div class="mobile-card-decoration mobile-decoration-1"></div>
          <div class="mobile-card-decoration mobile-decoration-2"></div>
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
    
    // Touch events
    container.addEventListener('touchstart', handleMobileStart, { passive: true });
    container.addEventListener('touchmove', handleMobileMove, { passive: false });
    container.addEventListener('touchend', handleMobileEnd, { passive: true });
    
    // Mouse events
    container.addEventListener('mousedown', handleMobileStart);
    container.addEventListener('mousemove', handleMobileMove);
    container.addEventListener('mouseup', handleMobileEnd);
    container.addEventListener('mouseleave', handleMobileEnd);
    
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
    
    // Determine if it's a horizontal or vertical swipe
    if (diffX > diffY && diffX > 10) {
      // Horizontal swipe - handle card navigation
      e.preventDefault(); // Prevent page scroll
      
      const diff = mobileCurrentX - mobileStartX;
      const cards = document.querySelectorAll('.mobile-card');
      const dragProgress = Math.max(-1, Math.min(1, diff / 300));
      
      cards.forEach((card, index) => {
        if (index === mobileCurrentStep) {
          card.style.transform = `translateX(${dragProgress * 100}px) scale(${1 - Math.abs(dragProgress) * 0.1})`;
          card.style.opacity = 1 - Math.abs(dragProgress) * 0.3;
        }
      });
    } else if (diffY > diffX && diffY > 10) {
      // Vertical swipe - allow normal page scroll
      mobileIsDragging = false; // Stop card dragging
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
    
    // Only change cards if it was a horizontal swipe
    if (diffXAbs > diffY) {
      // Determine swipe direction
      if (diffX < -MIN_SWIPE && mobileCurrentStep < mobileSteps.length - 1) {
        goToMobileStep(mobileCurrentStep + 1);
      } else if (diffX > MIN_SWIPE && mobileCurrentStep > 0) {
        goToMobileStep(mobileCurrentStep - 1);
      } else {
        updateMobileView(); // Snap back
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
        card.classList.add('far-next');
      } else if (diff <= -2) {
        card.classList.add('far-prev');
      } else {
        card.classList.add('hidden');
      }
    });
    
    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === mobileCurrentStep);
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('mobilePrevBtn');
    const nextBtn = document.getElementById('mobileNextBtn');
    if (prevBtn) prevBtn.classList.toggle('disabled', mobileCurrentStep === 0);
    if (nextBtn) nextBtn.classList.toggle('disabled', mobileCurrentStep === mobileSteps.length - 1);
  }

  // Initialize mobile carousel
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
        onEnter: () => {
          const contactTitle = document.querySelector('#contact .text-reveal');
          if (contactTitle && !contactTitle.dataset.animated) {
            splitTextToChars(contactTitle);
            contactTitle.dataset.animated = 'true';
          }
        }
      },
      opacity: 1,
      duration: 1.2, // INCREASED for warmth
      ease: 'power2.out'
    });
  }


  if (contactFormWrapper) {
    gsap.to('.contact-form-wrapper', {
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 65%'
      },
      opacity: 1,
      duration: 1,
      delay: 0.15,
      ease: 'power3.out'
    });
  }

  if (footer) {
    gsap.to('footer', {
      scrollTrigger: {
        trigger: 'footer',
        start: 'top 85%'
      },
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  // ============================================
  // PARALLAX SCROLLING
  // ============================================
  if (window.innerWidth >= 768) {
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
  // MOUSE-FOLLOW GRADIENT
  // ============================================
  if (window.innerWidth >= 1024 && !('ontouchstart' in window)) {
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
  // CUSTOM CURSOR LOGIC FOR WORK CARDS
  // ============================================
  const cursor = document.getElementById('customCursor');
  const cards = document.querySelectorAll('[data-cursor="true"]');

  if (cursor && cards.length > 0 && window.innerWidth >= 1024) {
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
  // MAGNETIC CURSOR
  // ============================================
  class MagneticCursor {
    constructor() {
      this.magneticElements = document.querySelectorAll('.cta-btn, .btn-primary, .btn-secondary, .submit-btn');
      this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
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

  new MagneticCursor();

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
  // ============================================
// FORM FUNCTIONALITY - FIXED FOR FORMSPREE
// ============================================
const form = document.getElementById('contactForm');

if (form) {
  const inputs = form.querySelectorAll('input, textarea');

  // Floating label functionality
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

  // Form submit handler - REMOVED e.preventDefault()
  form.addEventListener('submit', (e) => {
    const btn = form.querySelector('.submit-btn');
    if (!btn) return;
    
    // Just show loading state, let Formspree handle the actual submission
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    // Note: The form will now submit to Formspree naturally
    // Formspree will redirect to their confirmation page or your custom page
  });
}
  // ============================================
  // SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });


 // Reinitialize split text on resize
      document.querySelectorAll('[data-split-text="true"]').forEach(el => {
        if (el.dataset.splitProcessed) {
          const originalText = el.dataset.originalText;
          el.innerHTML = originalText;
          el.dataset.splitProcessed = '';
          
          // Kill old ScrollTriggers for this element
          ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.vars.trigger === el.closest('section')) {
              trigger.kill();
            }
          });
          
          splitIntoLines(el);
        }
      });

  // ============================================
  // SCROLL TRIGGER REFRESH ON RESIZE
  // ============================================
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
      
      // Reinitialize mobile carousel on orientation change
      if (window.innerWidth < 1280) {
        const mobileContainer = document.getElementById('mobileCardsContainer');
        if (mobileContainer && mobileContainer.children.length === 0) {
          initMobileCarousel();
        }
      }
    }, 250);
  }, { passive: true });

});
