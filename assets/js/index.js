// KEEP THIS - for Features/Testimonials/Pricing navigation
// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// CTA button scroll
document.querySelector('.cta-button').addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('#cta').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

// Initialize floating animation on hero elements and demo functionality
document.addEventListener('DOMContentLoaded', function() {
    const heroButtons = document.querySelector('.hero-buttons');
    heroButtons.classList.add('floating');
    
    // BEFORE/AFTER TOGGLE FUNCTIONALITY
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const beforeText = document.querySelector('.demo-text.before');
    const afterText = document.querySelector('.demo-text.after');
    const demoContainer = document.querySelector('.demo-container');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Toggle text visibility
            const target = this.getAttribute('data-target');
            
            if(target === 'before') {
                beforeText.classList.add('active');
                afterText.classList.remove('active');
            } else {
                beforeText.classList.remove('active');
                afterText.classList.add('active');
            }
            
            // Create particle animation on toggle
            createParticles(demoContainer);
        });
    });
    
    // AUTO-CYCLE DEMO (5-second intervals)
    let currentDemo = 'before';
    setInterval(() => {
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        
        if(currentDemo === 'before') {
            currentDemo = 'after';
            document.querySelector('.toggle-btn[data-target="after"]').classList.add('active');
            beforeText.classList.remove('active');
            afterText.classList.add('active');
        } else {
            currentDemo = 'before';
            document.querySelector('.toggle-btn[data-target="before"]').classList.add('active');
            beforeText.classList.add('active');
            afterText.classList.remove('active');
        }
        
        createParticles(demoContainer);
    }, 5000);
    
    // PARTICLE ANIMATION FUNCTION
    function createParticles(container) {
        // Remove existing particles
        const existingParticles = container.querySelectorAll('.particle');
        existingParticles.forEach(p => p.remove());
        
        // Create new particles
        const rect = container.getBoundingClientRect();
        const particleCount = 15 + Math.floor(Math.random() * 10);
        
        for(let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size between 3-8px
            const size = 3 + Math.random() * 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Position at center of container
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Random offset from center
            const offsetX = (Math.random() - 0.5) * rect.width * 0.3;
            const offsetY = (Math.random() - 0.5) * rect.height * 0.3;
            
            particle.style.left = `${centerX + offsetX}px`;
            particle.style.top = `${centerY + offsetY}px`;
            
            // Random animation duration and delay
            const duration = 0.8 + Math.random() * 0.7;
            const delay = Math.random() * 0.3;
            
            particle.style.animation = `particleFloat ${duration}s ease-out ${delay}s forwards`;
            
            container.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, (duration + delay) * 1000);
        }
    }
    
    // Trigger initial particle animation
    setTimeout(() => {
        createParticles(demoContainer);
    }, 1000);
});