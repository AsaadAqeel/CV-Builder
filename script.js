// ===== LOAD CV DATA FROM LOCALSTORAGE =====

// ===== SECURITY: XSS SANITIZATION =====
/**
 * Sanitizes HTML content to prevent XSS attacks
 * Escapes dangerous characters that could be used for script injection
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string safe for HTML insertion
 */
function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function () {
    loadCVData();
});

function loadCVData() {
    let savedData = null;
    if (typeof window !== 'undefined' && window.EXPORTED_CV_DATA) {
        savedData = JSON.stringify(window.EXPORTED_CV_DATA);
    } else {
        savedData = localStorage.getItem('cvData');
    }
    if (savedData) {
        const cvData = JSON.parse(savedData);

        // Apply Design Settings
        if (cvData.design) {
            // Apply Theme
            if (cvData.design.theme && cvData.design.theme !== 'default') {
                document.body.setAttribute('data-theme', cvData.design.theme);
            } else {
                document.body.removeAttribute('data-theme');
            }

            // Apply Font
            if (cvData.design.font) {
                document.body.style.fontFamily = cvData.design.font;
            }
        }

        // Update Personal Info
        if (cvData.personal) {
            const nameEl = document.querySelector('.hero-text h1');
            const titleEl = document.querySelector('.tagline');
            const locationEl = document.querySelector('.location');
            const profileImg = document.querySelector('.profile-image img');

            if (nameEl) nameEl.textContent = cvData.personal.fullName || 'Your Name';
            if (titleEl) titleEl.textContent = cvData.personal.jobTitle || 'Job Title';
            if (locationEl) {
                locationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${cvData.personal.location || 'Location'}`;
            }
            if (profileImg && cvData.personal.profileImage) {
                profileImg.src = cvData.personal.profileImage;
            }
        }

        // Update Contact Info
        if (cvData.contact) {
            const contactItems = document.querySelectorAll('.contact-item');
            contactItems.forEach(item => {
                const icon = item.querySelector('i');
                const span = item.querySelector('span');

                if (icon.classList.contains('fa-phone') && cvData.contact.phone) {
                    item.href = `tel:${cvData.contact.phone}`;
                    if (span) span.textContent = cvData.contact.phone;
                }
                if (icon.classList.contains('fa-envelope') && cvData.contact.email) {
                    item.href = `mailto:${cvData.contact.email}`;
                    if (span) span.textContent = cvData.contact.email;
                }
                if (icon.classList.contains('fa-linkedin') && cvData.contact.linkedin) {
                    item.href = cvData.contact.linkedin;
                    if (span) span.textContent = cvData.contact.linkedin.replace('https://', '');
                }
                if (icon.classList.contains('fa-github') && cvData.contact.github) {
                    item.href = cvData.contact.github;
                    if (span) span.textContent = cvData.contact.github.replace('https://', '');
                }
            });
        }

        // Update Summary
        if (cvData.summary) {
            const summaryEl = document.querySelector('.summary-text');
            if (summaryEl) summaryEl.textContent = cvData.summary;
        }

        // Update Experience
        if (cvData.experience && cvData.experience.length > 0) {
            renderExperience(cvData.experience);
        }

        // Update Education
        if (cvData.education && cvData.education.length > 0) {
            renderEducation(cvData.education);
        }

        // Update Skills
        if (cvData.technicalSkills || cvData.softSkills) {
            renderSkills(cvData.technicalSkills || [], cvData.softSkills || []);
        }

        // Update Projects
        if (cvData.projects && cvData.projects.length > 0) {
            renderProjects(cvData.projects);
        }

        // Update Certifications
        if (cvData.certifications && cvData.certifications.length > 0) {
            renderCertifications(cvData.certifications);
        }

        // Update Awards
        if (cvData.awards && cvData.awards.length > 0) {
            renderAwards(cvData.awards);
        }
    }
}

function renderExperience(experiences) {
    const container = document.querySelector('.timeline');
    if (!container) return;

    container.innerHTML = experiences.map(exp => `
        <div class="experience-card">
            <div class="experience-header">
                <div class="company-info">
                    <h3>${sanitizeHTML(exp.company)}</h3>
                    <span class="role">${sanitizeHTML(exp.role)}</span>
                </div>
                <span class="date">${sanitizeHTML(exp.startDate)} - ${sanitizeHTML(exp.endDate)}</span>
            </div>
            <ul class="achievements">
                ${exp.achievements.map(ach => `<li>${sanitizeHTML(ach)}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

function renderEducation(education) {
    const container = document.querySelector('.education-cards');
    if (!container) return;

    container.innerHTML = education.map(edu => `
        <div class="education-card">
            <div class="edu-icon">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="edu-content">
                <h3>${sanitizeHTML(edu.degree)}</h3>
                <p class="institution">${sanitizeHTML(edu.institution)}</p>
                <p class="grad-date">Graduated: ${sanitizeHTML(edu.graduationDate)}</p>
                ${edu.gpa ? `<p class="gpa">GPA: ${sanitizeHTML(edu.gpa)}/4.0</p>` : ''}
                ${edu.file ? `
                <a href="${sanitizeURL(edu.file)}" target="_blank" rel="noopener noreferrer" class="view-file-btn">
                    <i class="fas fa-eye"></i> View Degree
                </a>` : ''}
            </div>
        </div>
    `).join('');
}

function renderSkills(technicalSkills, softSkills) {
    const container = document.querySelector('.skills-grid');
    if (!container) return;

    const technicalHTML = technicalSkills.length > 0 ? `
        <div class="skill-category">
            <h3>Technical Skills</h3>
            ${technicalSkills.map(skill => `
                <div class="skill-item">
                    <div class="skill-info">
                        <span>${sanitizeHTML(skill.name)}</span>
                        <span>${skill.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-progress" data-progress="${skill.level}"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '';

    const softHTML = softSkills.length > 0 ? `
        <div class="skill-category">
            <h3>Soft Skills</h3>
            ${softSkills.map(skill => `
                <div class="skill-item">
                    <div class="skill-info">
                        <span>${sanitizeHTML(skill.name)}</span>
                        <span>${skill.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-progress" data-progress="${skill.level}"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '';

    container.innerHTML = technicalHTML + softHTML;
}

function renderProjects(projects) {
    const container = document.querySelector('.projects-grid');
    if (!container) return;

    container.innerHTML = projects.map(proj => `
        <div class="project-card">
            <div class="project-image">
                <div class="project-placeholder">${sanitizeHTML(proj.name)}</div>
            </div>
            <div class="project-content">
                <h3>${sanitizeHTML(proj.name)}</h3>
                <p>${sanitizeHTML(proj.description)}</p>
                <div class="project-tech">
                    ${proj.technologies.map(tech => `<span>${sanitizeHTML(tech)}</span>`).join('')}
                </div>
                <div class="project-links">
                    ${proj.demoUrl ? `<a href="${sanitizeURL(proj.demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn-small">View Demo</a>` : ''}
                    ${proj.codeUrl ? `<a href="${sanitizeURL(proj.codeUrl)}" target="_blank" rel="noopener noreferrer" class="btn-small btn-outline">Source Code</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderCertifications(certifications) {
    const container = document.querySelector('.cert-grid');
    if (!container) return;

    container.innerHTML = certifications.map(cert => `
        <div class="cert-card">
            <i class="fas fa-certificate"></i>
            <h3>${sanitizeHTML(cert.name)}</h3>
            <p>${sanitizeHTML(cert.organization)}</p>
            <span class="cert-date">${sanitizeHTML(cert.year)}</span>
            ${cert.file ? `
            <a href="${sanitizeURL(cert.file)}" target="_blank" rel="noopener noreferrer" class="view-cert-btn">
                <i class="fas fa-eye"></i> View Certificate
            </a>` : ''}
        </div>
    `).join('');
}

function renderAwards(awards) {
    const container = document.querySelector('.awards-grid');
    if (!container) return;

    container.innerHTML = awards.map(award => `
        <div class="award-card">
            <div class="award-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="award-content">
                <h3>${sanitizeHTML(award.name)}</h3>
                <p>${sanitizeHTML(award.organization)}</p>
                <span class="award-year">${sanitizeHTML(award.year)}</span>
                ${award.file ? `
                <a href="${sanitizeURL(award.file)}" target="_blank" rel="noopener noreferrer" class="view-file-btn">
                    <i class="fas fa-eye"></i> View Award
                </a>` : ''}
            </div>
        </div>
    `).join('');
}

// ===== ANIMATED SKILL BARS =====
document.addEventListener('DOMContentLoaded', function () {
    const skillBars = document.querySelectorAll('.skill-progress');

    // Function to animate skill bars when they come into view
    function animateSkillBars() {
        skillBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            const rect = bar.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

            if (isVisible && !bar.classList.contains('animated')) {
                bar.classList.add('animated');
                setTimeout(() => {
                    bar.style.width = progress + '%';
                }, 200);
            }
        });
    }

    // Initial check
    animateSkillBars();

    // Check on scroll
    window.addEventListener('scroll', animateSkillBars);
});

// ===== NAVIGATION SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== NAVBAR BACKGROUND ON SCROLL =====
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add/remove scrolled class for background effect
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(15, 15, 15, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.3)';
    } else {
        navbar.style.background = 'rgba(15, 15, 15, 0.95)';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ===== MOBILE MENU TOGGLE =====
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    const isExpanded = hamburger.classList.contains('active');
    hamburger.setAttribute('aria-expanded', isExpanded);
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ===== SCROLL REVEAL ANIMATION =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.experience-card, .education-card, .cert-card, .project-card, .award-card, .skill-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// ===== PARALLAX EFFECT FOR HERO SHAPES =====
const shapes = document.querySelectorAll('.shape');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.5;

    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.2;
        shape.style.transform = `translateY(${rate * speed}px)`;
    });
});

// ===== TYPING EFFECT FOR TAGLINE =====
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Apply typing effect when page loads
window.addEventListener('load', () => {
    const tagline = document.querySelector('.tagline');
    const originalText = tagline.textContent;
    typeWriter(tagline, originalText, 80);
});

// ===== CONTACT FORM HANDLING (if needed) =====
// Uncomment and modify if you add a contact form
/*
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Show success message
    alert('Thank you for your message! I will get back to you soon.');
    this.reset();
});
*/

// ===== DYNAMIC YEAR UPDATER =====
const currentYear = new Date().getFullYear();
document.querySelectorAll('.footer p').forEach(el => {
    if (el.textContent.includes('2024')) {
        el.textContent = el.textContent.replace('2024', currentYear);
    }
});

// ===== ACTIVE NAVIGATION LINK HIGHLIGHTING =====
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== SMOOTH SCROLL TO TOP =====
// Add this button to your HTML if you want a scroll-to-top feature
// ===== SMOOTH SCROLL TO TOP =====
const scrollTopBtn = document.createElement('button');
scrollTopBtn.innerHTML = '↑';
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.setAttribute('aria-label', 'Scroll to top of page');
scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #7c3aed, #3b82f6);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 999;
    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
`;

document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollTopBtn.style.opacity = '1';
        scrollTopBtn.style.pointerEvents = 'auto';
    } else {
        scrollTopBtn.style.opacity = '0';
        scrollTopBtn.style.pointerEvents = 'none';
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== MOUSE MOVEMENT EFFECT (subtle parallax) =====
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translate(${mouseX * 20}px, ${mouseY * 20}px)`;
    }
});

// ===== PDF EXPORT & PREVIEW =====
const modal = document.getElementById('print-preview-modal');
const closeBtn = document.querySelector('.close-modal');
const cancelBtn = document.querySelector('.close-modal-btn');
const saveBtn = document.getElementById('save-pdf-btn');
const previewFrame = document.getElementById('pdf-preview-frame');

// Store the generated PDF object to save later
let generatedPdf = null;

/**
 * Opens the print preview with optimized PDF generation
 * Uses professional ATS-friendly settings
 */
function openPrintPreview() {
    // 1. Add printing class to body to transform layout
    document.body.classList.add('printing');

    // UI Feedback
    const btn = document.querySelector('.hero-buttons .btn-secondary'); // "Download CV" button
    const originalText = btn.textContent;
    btn.textContent = 'Preparing Preview...';
    btn.disabled = true;

    // 2. Wait for CSS to apply (small delay)
    setTimeout(() => {
        // 3. Generate PDF Blob with professional settings
        const opt = {
            margin: [15, 15, 15, 15], // 15mm margins on all sides (A4 standard)
            filename: 'resume.pdf',
            image: { 
                type: 'jpeg', 
                quality: 0.95 
            },
            html2canvas: {
                scale: 2,              // High resolution for crisp text
                useCORS: true,         // Allow cross-origin images
                logging: false,        // Disable logging for production
                scrollY: 0,            // Capture from top
                backgroundColor: '#FFFFFF', // Ensure white background
                windowWidth: 794,      // A4 width in pixels at 96 DPI
                windowHeight: 1123     // A4 height in pixels at 96 DPI
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true         // Compress PDF for smaller file size
            },
            pagebreak: { 
                mode: ['css', 'legacy'],
                before: ['.section-header'],  // Avoid breaking before headers
                avoid: ['.experience-card', '.education-card', '.project-card', '.cert-card', '.award-card']
            }
        };

        // Generate the PDF worker
        const worker = html2pdf().set(opt).from(document.body).toPdf();

        worker.get('pdf').then(function (pdfObject) {
            // 4. Capture Blob
            generatedPdf = pdfObject; // Store for saving later
            const blob = pdfObject.output('blob');
            const blobUrl = URL.createObjectURL(blob);

            // 5. Reset State
            document.body.classList.remove('printing');
            btn.textContent = originalText;
            btn.disabled = false;

            // 6. Show Preview
            previewFrame.src = blobUrl;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';

            // Setup Save Button
            saveBtn.onclick = function () {
                // Trigger download with professional filename
                const fullName = document.querySelector('.hero-text h1')?.textContent?.replace(/\s+/g, '_') || 'resume';
                pdfObject.save(`${fullName}_Resume.pdf`);
                closePrintModal();
            };

        }).catch(err => {
            console.error('PDF generation error:', err);
            document.body.classList.remove('printing');
            btn.textContent = originalText;
            btn.disabled = false;
            alert('Error generating preview. Please try again.');
        });

    }, 100);
}

function closePrintModal() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    // Clear iframe to free memory
    previewFrame.src = '';
}

// Event Listeners for Modal
if (closeBtn) closeBtn.addEventListener('click', closePrintModal);
if (cancelBtn) cancelBtn.addEventListener('click', closePrintModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closePrintModal();
});


