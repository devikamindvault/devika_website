import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { supabase, submitContactForm, testConnection } from './supabase.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

class AutomationWebsite {
    constructor() {
        this.debugMode = false; // Disable debug logging
        this.init();
        this.setupSmoothScroll();
        this.setupNavigation();
        this.setup3DElements();
        this.setupAnimations();
        this.setupPortfolioFilters();
        this.setupContactForm();
        this.setupServiceCards();
        this.testDatabaseConnection();
    }

    async testDatabaseConnection() {
        if (this.debugMode) {
            console.log('Testing database connection...');
            const isConnected = await testConnection();
            console.log('Database connected:', isConnected);
        }
    }

    init() {
        // Initialize when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMLoaded());
        } else {
            this.onDOMLoaded();
        }
    }

    onDOMLoaded() {
        // Add loading animation
        this.showLoadingAnimation();
        
        // Initialize all components
        setTimeout(() => {
            this.hideLoadingAnimation();
            this.startAnimations();
        }, 1500);
    }

    showLoadingAnimation() {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-3d"></div>
                <div class="loader-text">Loading Automation Solutions...</div>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoadingAnimation() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            gsap.to(loader, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => loader.remove()
            });
        }
    }

    setupSmoothScroll() {
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        const raf = (time) => {
            this.lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    setupNavigation() {
        const navbar = document.querySelector('.navbar');
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        hamburger?.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu?.classList.toggle('active');
        });

        // Navigation links - no smooth scroll for separate pages
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // If it's an anchor link on the same page, use smooth scroll
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(href);
                    
                    if (targetElement && this.lenis) {
                        this.lenis.scrollTo(targetElement, {
                            offset: -80,
                            duration: 1.5
                        });
                    }
                }
                
                // Close mobile menu
                hamburger?.classList.remove('active');
                navMenu?.classList.remove('active');
            });
        });
    }

    setup3DElements() {
        this.setupHero3D();
        this.setupService3DIcons();
        this.setupGuarantee3DIcons();
        this.setupContact3DIcons();
    }

    setupHero3D() {
        const container = document.getElementById('hero-3d-container');
        if (!container) return;

        try {
            // Scene setup
            this.heroScene = new THREE.Scene();
            this.heroCamera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
            this.heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            
            this.heroRenderer.setSize(container.offsetWidth, container.offsetHeight);
            this.heroRenderer.setClearColor(0x000000, 0);
            container.appendChild(this.heroRenderer.domElement);

            // Create 3D automation elements with enhanced colors
            this.createAutomationElements();
            
            // Camera position
            this.heroCamera.position.z = 5;

            // Animation loop
            this.animateHero3D();

            // Handle resize
            window.addEventListener('resize', () => this.onHeroResize());
        } catch (error) {
            console.error('3D setup failed:', error);
        }
    }

    createAutomationElements() {
        // Central core with enhanced teal colors
        const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x14b8a6, // Enhanced primary teal
            transparent: true,
            opacity: 0.9
        });
        this.heroCore = new THREE.Mesh(coreGeometry, coreMaterial);
        this.heroScene.add(this.heroCore);

        // Orbiting elements with enhanced teal-green colors
        this.orbitingElements = [];
        const colors = [
            0x14b8a6, // Primary teal
            0x0d9488, // Secondary teal
            0x2dd4bf, // Accent teal
            0x34d399, // Mint green
            0x6ee7b7, // Sage green
            0x0f766e, // Deep teal
            0x059669, // Forest green
            0x10b981  // Emerald
        ];

        for (let i = 0; i < 8; i++) {
            const elementGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const elementMaterial = new THREE.MeshBasicMaterial({ 
                color: colors[i],
                transparent: true,
                opacity: 0.85
            });
            
            const element = new THREE.Mesh(elementGeometry, elementMaterial);
            const angle = (i / 8) * Math.PI * 2;
            const radius = 2;
            
            element.position.x = Math.cos(angle) * radius;
            element.position.y = Math.sin(angle) * radius;
            element.position.z = (Math.random() - 0.5) * 2;
            
            this.orbitingElements.push(element);
            this.heroScene.add(element);
        }

        // Connection lines with enhanced teal color
        this.createConnectionLines();
    }

    createConnectionLines() {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x14b8a6, // Enhanced primary teal
            transparent: true,
            opacity: 0.5
        });

        this.orbitingElements.forEach((element, index) => {
            const points = [];
            points.push(new THREE.Vector3(0, 0, 0)); // Center
            points.push(element.position.clone());
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            this.heroScene.add(line);
        });
    }

    animateHero3D() {
        const animate = () => {
            requestAnimationFrame(animate);

            // Rotate core with enhanced color pulsing
            if (this.heroCore) {
                this.heroCore.rotation.x += 0.01;
                this.heroCore.rotation.y += 0.01;
                
                // Enhanced pulse effect
                const time = Date.now() * 0.001;
                const intensity = 0.85 + Math.sin(time * 2) * 0.15;
                this.heroCore.material.opacity = intensity;
            }

            // Animate orbiting elements with enhanced effects
            this.orbitingElements.forEach((element, index) => {
                const time = Date.now() * 0.001;
                const angle = (index / this.orbitingElements.length) * Math.PI * 2 + time * 0.5;
                const radius = 2 + Math.sin(time + index) * 0.3;
                
                element.position.x = Math.cos(angle) * radius;
                element.position.y = Math.sin(angle) * radius;
                element.rotation.x += 0.02;
                element.rotation.y += 0.02;
                
                // Enhanced opacity pulsing
                const pulseIntensity = 0.75 + Math.sin(time * 3 + index) * 0.2;
                element.material.opacity = pulseIntensity;
            });

            if (this.heroRenderer && this.heroScene && this.heroCamera) {
                this.heroRenderer.render(this.heroScene, this.heroCamera);
            }
        };
        animate();
    }

    onHeroResize() {
        const container = document.getElementById('hero-3d-container');
        if (!container || !this.heroCamera || !this.heroRenderer) return;

        this.heroCamera.aspect = container.offsetWidth / container.offsetHeight;
        this.heroCamera.updateProjectionMatrix();
        this.heroRenderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    setupService3DIcons() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach((card, index) => {
            const icon = card.querySelector('.icon-3d');
            if (!icon) return;

            // Add hover effects
            card.addEventListener('mouseenter', () => {
                gsap.to(icon, {
                    rotationY: 360,
                    duration: 1,
                    ease: "power2.out"
                });
            });

            // Stagger animation on scroll
            gsap.fromTo(card, {
                y: 100,
                opacity: 0,
                rotationX: -15
            }, {
                y: 0,
                opacity: 1,
                rotationX: 0,
                duration: 1,
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    setupGuarantee3DIcons() {
        const guaranteeCards = document.querySelectorAll('.guarantee-card');
        
        guaranteeCards.forEach((card, index) => {
            const icon = card.querySelector('.icon-3d');
            if (!icon) return;

            // Scroll animation
            gsap.fromTo(card, {
                scale: 0.8,
                opacity: 0
            }, {
                scale: 1,
                opacity: 1,
                duration: 0.8,
                delay: index * 0.15,
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    setupContact3DIcons() {
        const contactItems = document.querySelectorAll('.contact-item');
        
        contactItems.forEach((item, index) => {
            // Animation
            gsap.fromTo(item, {
                x: -50,
                opacity: 0
            }, {
                x: 0,
                opacity: 1,
                duration: 0.8,
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    setupAnimations() {
        // Hero text animations
        const heroTitle = document.querySelector('.hero-title');
        const heroDescription = document.querySelector('.hero-description');
        const heroButtons = document.querySelector('.hero-buttons');
        const heroStats = document.querySelector('.hero-stats');

        if (heroTitle) {
            gsap.fromTo(heroTitle.children, {
                y: 100,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out"
            });
        }

        // Section animations
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const title = section.querySelector('.section-title');
            
            if (title) {
                gsap.fromTo(title, {
                    y: 50,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    scrollTrigger: {
                        trigger: title,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                });
            }
        });

        // Portfolio items animation
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach((item, index) => {
            gsap.fromTo(item, {
                y: 80,
                opacity: 0,
                scale: 0.9
            }, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Testimonial cards animation
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach((card, index) => {
            gsap.fromTo(card, {
                rotationY: -15,
                opacity: 0,
                x: -50
            }, {
                rotationY: 0,
                opacity: 1,
                x: 0,
                duration: 1,
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    setupPortfolioFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter items
                portfolioItems.forEach(item => {
                    const categories = item.getAttribute('data-category')?.split(' ') || [];
                    
                    if (filter === 'all' || categories.includes(filter)) {
                        gsap.to(item, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.5,
                            display: 'block'
                        });
                    } else {
                        gsap.to(item, {
                            opacity: 0,
                            scale: 0.8,
                            duration: 0.3,
                            onComplete: () => {
                                item.style.display = 'none';
                            }
                        });
                    }
                });
            });
        });
    }

    setupContactForm() {
        const form = document.getElementById('contactForm');
        const serviceSelect = document.getElementById('service');
        const customServiceGroup = document.getElementById('customServiceGroup');
        
        if (!form) return;

        // Handle custom service option
        serviceSelect?.addEventListener('change', (e) => {
            if (e.target.value === 'others') {
                if (customServiceGroup) {
                    customServiceGroup.style.display = 'block';
                    const customServiceInput = document.getElementById('customService');
                    if (customServiceInput) customServiceInput.required = true;
                }
            } else {
                if (customServiceGroup) {
                    customServiceGroup.style.display = 'none';
                    const customServiceInput = document.getElementById('customService');
                    if (customServiceInput) customServiceInput.required = false;
                }
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (this.debugMode) {
                console.log('Contact form submitted');
            }
            
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                service: formData.get('service') === 'others' ? formData.get('customService') : formData.get('service'),
                message: formData.get('message'),
                submitted_at: new Date().toISOString(),
                user_id: null // No authentication, so always null
            };
            
            console.log('Contact form data:', data);
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                const { data: result, error } = await submitContactForm(data);
                
                if (error) {
                    console.error('Contact form submission error:', error);
                    throw error;
                }

                console.log('Contact form submitted successfully:', result);
                this.showNotification('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
                form.reset();
                if (customServiceGroup) {
                    customServiceGroup.style.display = 'none';
                    const customServiceInput = document.getElementById('customService');
                    if (customServiceInput) customServiceInput.required = false;
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                this.showNotification('Error sending message. Please try again or contact us directly.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Form field animations
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            gsap.fromTo(group, {
                y: 30,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: group,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    setupServiceCards() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -15,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        gsap.fromTo(notification, {
            y: -100,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 0.5
        });

        setTimeout(() => {
            gsap.to(notification, {
                y: -100,
                opacity: 0,
                duration: 0.5,
                onComplete: () => notification.remove()
            });
        }, 5000);
    }

    startAnimations() {
        // Start all scroll-triggered animations
        ScrollTrigger.refresh();
    }
}

// Initialize the website
new AutomationWebsite();