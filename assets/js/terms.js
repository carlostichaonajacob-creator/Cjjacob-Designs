    // GSAP Page Load Animation
    document.addEventListener('DOMContentLoaded', function() {
      gsap.registerPlugin(ScrollTrigger);

      // Return button animation
      gsap.to('.return-home', {
        opacity: 1,
        duration: 0.7,
        delay: 0.3,
        ease: 'power3.out'
      });

      // Legal content animation
      gsap.to('.legal-container', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.5,
        ease: 'power3.out'
      });

      // Footer animation
      gsap.to('footer', {
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: 'footer',
          start: 'top 85%',
          ease: 'power3.out'
        }
      });
    });