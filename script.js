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

function sanitizeURL(url) {
    if (typeof url !== 'string') return '';
    if (url.startsWith('data:image/') || url.startsWith('data:application/pdf')) return url;
    if (url.startsWith('blob:')) return url;
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'blob:', 'data:'];
    try {
        const parsed = new URL(url, window.location.origin);
        if (allowedProtocols.includes(parsed.protocol)) {
            return parsed.href;
        }
    } catch (e) {
        if (url.match(/^(mailto:|tel:|blob:|data:)/i)) {
            return url;
        }
    }
    return '';
}
function isImageFile(url, fileName) {
    if (!url) return false;
    if (url.startsWith('data:image/')) return true;
    const name = (fileName || url || '').toLowerCase();
    return /\.(png|jpe?g|gif|webp|svg)$/.test(name);
}
function isPdfFile(url, fileName, fileType) {
    if (fileType === 'application/pdf') return true;
    if (url && url.startsWith('data:application/pdf')) return true;
    const name = (fileName || url || '').toLowerCase();
    return /\.pdf$/.test(name) || name.includes('application/pdf');
}
function renderFilePreview(url, fileName, fileType) {
    if (!url) return '';
    const safeUrl = sanitizeURL(url);
    const safeName = sanitizeHTML(fileName || 'document.pdf');
    const escUrl = safeUrl.replace(/'/g, '%27').replace(/"/g, '&quot;');
    const escName = (fileName || 'document.pdf').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    if (isImageFile(url, fileName)) {
        return '<img src="' + safeUrl + '" alt="' + safeName + '" class="file-preview-img" loading="lazy" style="cursor:zoom-in" onclick="openFilePreview(\'' + escUrl + '\',\'' + escName + '\',\'image\')" title="Click to preview">';
    }
    if (isPdfFile(url, fileName, fileType)) {
        return '<div class="file-preview-card" style="cursor:pointer" onclick="openFilePreview(\'' + escUrl + '\',\'' + escName + '\',\'pdf\')" title="Click to preview"><i class="fas fa-file-pdf"></i><div class="pdf-meta"><span class="pdf-name">' + safeName + '</span></div><div class="pdf-actions" onclick="event.stopPropagation()"><a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> Open</a><a href="' + safeUrl + '" download="' + safeName + '"><i class="fas fa-download"></i> Download</a></div></div><div class="pdf-viewer-wrap" style="cursor:pointer" onclick="openFilePreview(\'' + escUrl + '\',\'' + escName + '\',\'pdf\')"><iframe src="' + safeUrl + '" title="' + safeName + '" loading="lazy" style="pointer-events:none"></iframe></div>';
    }
    return '<div class="file-preview-card" style="cursor:pointer" onclick="openFilePreview(\'' + escUrl + '\',\'' + escName + '\',\'file\')"><i class="fas fa-file"></i><div class="pdf-meta"><span class="pdf-name">' + safeName + '</span></div><div class="pdf-actions" onclick="event.stopPropagation()"><a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer">Open</a></div></div>';
}
function openFilePreview(url, fileName, type) {
    const modal = document.getElementById('file-preview-modal');
    const body = document.getElementById('file-modal-body');
    const title = document.getElementById('file-modal-title');
    const openBtn = document.getElementById('file-modal-open');
    const dlBtn = document.getElementById('file-modal-download');
    if (!modal || !body) { if (url) window.open(url, '_blank'); return; }
    const safeUrl = sanitizeURL(url);
    const safeName = fileName || 'preview';
    title.textContent = safeName;
    openBtn.href = safeUrl;
    dlBtn.href = safeUrl;
    dlBtn.download = safeName;
    if (type === 'image' || isImageFile(safeUrl, safeName)) {
        body.innerHTML = '<img src="' + safeUrl + '" alt="' + sanitizeHTML(safeName) + '" style="max-width:100%;max-height:80vh;object-fit:contain;display:block;margin:0 auto;border-radius:8px;">';
    } else if (type === 'pdf' || isPdfFile(safeUrl, safeName)) {
        body.innerHTML = '<iframe src="' + safeUrl + '" title="' + sanitizeHTML(safeName) + '" style="width:100%;height:80vh;border:none;border-radius:8px;background:#fff;"></iframe><object data="' + safeUrl + '" type="application/pdf" style="display:none"></object>';
    } else {
        body.innerHTML = '<div style="padding:40px;text-align:center;color:#d1d5db;"><i class="fas fa-file" style="font-size:48px;margin-bottom:16px;display:block;"></i><p>' + sanitizeHTML(safeName) + '</p><a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="margin-top:16px;display:inline-block;">Open File</a></div>';
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeFilePreview() {
    const modal = document.getElementById('file-preview-modal');
    const body = document.getElementById('file-modal-body');
    if (!modal) return;
    modal.style.display = 'none';
    if (body) body.innerHTML = '';
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', function () {
    loadCVData();

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var fileModal = document.getElementById('file-preview-modal');
            if (fileModal && fileModal.style.display !== 'none' && fileModal.style.display !== '') { closeFilePreview(); return; }
            var overlay = document.getElementById('welcomeOverlay');
            if (overlay && !overlay.classList.contains('hidden')) {
                dismissWelcome();
            }
        }
    });

    var overlay = document.getElementById('welcomeOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                dismissWelcome();
            }
        });
    }
});

function loadCVData() {
    let savedData = null;
    if (typeof window !== 'undefined' && window.EXPORTED_CV_DATA) {
        savedData = JSON.stringify(window.EXPORTED_CV_DATA);
    } else {
        savedData = localStorage.getItem('cvData');
    }
    if (savedData) {
        let cvData;
        try {
            cvData = JSON.parse(savedData);
        } catch (e) {
            console.warn('Failed to parse CV data, using defaults:', e);
            return;
        }

        // Migrate old numeric skill levels to 1-4 scale
        function migrateSkillLevels(skills) {
            if (!Array.isArray(skills)) return skills || [];
            return skills.map(function(s) {
                var level = s.level;
                if (typeof level === 'number' && level > 4) {
                    if (level <= 25) level = 1;
                    else if (level <= 60) level = 2;
                    else if (level <= 85) level = 3;
                    else level = 4;
                    return Object.assign({}, s, { level: level });
                }
                return s;
            });
        }
        if (cvData.technicalSkills) cvData.technicalSkills = migrateSkillLevels(cvData.technicalSkills);
        if (cvData.softSkills) cvData.softSkills = migrateSkillLevels(cvData.softSkills);

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
            const profileImg = document.getElementById('profilePreviewImg') || document.querySelector('.profile-image img');
            const profileContainer = document.getElementById('profileImageContainer') || document.querySelector('.profile-image');
            const heroImage = document.querySelector('.hero-image');

            if (nameEl) nameEl.textContent = cvData.personal.fullName || 'Your Name';
            if (titleEl) titleEl.textContent = cvData.personal.jobTitle || 'Job Title';
            if (locationEl) {
                locationEl.innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + sanitizeHTML(cvData.personal.location || 'Location');
            }
            if (heroImage) {
                heroImage.querySelectorAll('.initials-avatar').forEach(el => el.remove());
            }
            if (profileImg && profileContainer && cvData.personal.profileImage && cvData.personal.profileImage.trim() !== '') {
                const src = sanitizeURL(cvData.personal.profileImage) || cvData.personal.profileImage;
                profileImg.src = src;
                profileImg.alt = (cvData.personal.fullName || 'Profile') + ' photo';
                profileImg.style.display = 'block';
                profileContainer.style.display = 'block';
                if (heroImage) heroImage.style.display = 'flex';
                profileImg.style.cursor = 'zoom-in';
                profileImg.title = 'Click to preview';
                profileImg.onclick = function() { openFilePreview(src, cvData.personal.fullName + ' photo', 'image'); };
                profileImg.onerror = function() {
                    this.style.display = 'none';
                    if (heroImage && cvData.personal.fullName) {
                        const initials = cvData.personal.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                        const avatar = document.createElement('div');
                        avatar.className = 'initials-avatar';
                        avatar.textContent = initials;
                        avatar.setAttribute('aria-label', cvData.personal.fullName + ' initials');
                        heroImage.appendChild(avatar);
                    }
                };
            } else if (profileContainer) {
                if (profileImg && !cvData.personal.profileImage) {
                    profileImg.style.display = 'none';
                    profileContainer.style.display = 'none';
                }
                if (heroImage && cvData.personal.fullName) {
                    const initials = cvData.personal.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    const avatar = document.createElement('div');
                    avatar.className = 'initials-avatar';
                    avatar.textContent = initials;
                    avatar.setAttribute('aria-label', cvData.personal.fullName + ' initials');
                    heroImage.appendChild(avatar);
                    heroImage.style.display = 'flex';
                }
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

    // Welcome overlay & sample badge logic
    var hasSavedData = localStorage.getItem('cvData');
    var welcomeOverlay = document.getElementById('welcomeOverlay');
    var sampleBadge = document.getElementById('sampleBadge');
    var dismissed = sessionStorage.getItem('welcomeDismissed');
    
    if (!hasSavedData && !window.EXPORTED_CV_DATA && !dismissed) {
        // First visit (this session) with no saved data - show welcome overlay
        if (welcomeOverlay) {
            welcomeOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        if (sampleBadge) sampleBadge.style.display = 'flex';
    } else {
        // Has saved data, or already dismissed, or exported page - hide overlay and badge
        if (welcomeOverlay) {
            welcomeOverlay.classList.add('hidden');
            welcomeOverlay.style.display = 'none';
        }
        if (sampleBadge) sampleBadge.style.display = 'none';
    }
}

function renderExperience(experiences) {
    const container = document.querySelector('.timeline');
    if (!container) return;

    container.innerHTML = experiences.map(exp => {
        const logoUrl = exp.logo || exp.companyLogo || exp.file || '';
        const logoName = exp.logoName || exp.fileName || '';
        const hasLogo = logoUrl && isImageFile(logoUrl, logoName);
        const escLogoUrl = logoUrl ? sanitizeURL(logoUrl).replace(/'/g, '%27') : '';
        const escLogoName = (logoName || exp.company || 'logo').replace(/'/g, "\\'");
        return `
        <div class="experience-card">
            <div class="experience-header">
                <div class="company-info" style="display:flex;gap:12px;align-items:center;">
                    ${hasLogo ? '<img src="' + sanitizeURL(logoUrl) + '" alt="' + sanitizeHTML(exp.company) + ' logo" class="company-logo-preview" style="cursor:zoom-in" onclick="openFilePreview(\'' + escLogoUrl + '\',\'' + escLogoName + '\',\'image\')" title="Click to preview">' : ''}
                    <div>
                        <h3>${sanitizeHTML(exp.company)}</h3>
                        <span class="role">${sanitizeHTML(exp.role)}</span>
                    </div>
                </div>
                <span class="date">${sanitizeHTML(exp.startDate)} - ${sanitizeHTML(exp.endDate)}</span>
            </div>
            <ul class="achievements">
                ${(exp.achievements || []).map(ach => '<li>' + sanitizeHTML(ach) + '</li>').join('')}
            </ul>
        </div>
    `}).join('');
}

function renderEducation(education) {
    const container = document.querySelector('.education-cards');
    if (!container) return;

    container.innerHTML = education.map(edu => {
        const fileUrl = edu.file || edu.fileUrl || '';
        const fileName = edu.fileName || 'degree.pdf';
        const fileType = edu.fileType || '';
        return `
        <div class="education-card">
            <div class="edu-icon">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="edu-content">
                <h3>${sanitizeHTML(edu.degree)}</h3>
                <p class="institution">${sanitizeHTML(edu.institution)}</p>
                <p class="grad-date">Graduated: ${sanitizeHTML(edu.graduationDate)}</p>
                ${edu.gpa ? `<p class="gpa">GPA: ${sanitizeHTML(edu.gpa)}/4.0</p>` : ''}
                ${fileUrl ? renderFilePreview(fileUrl, fileName, fileType) : ''}
            </div>
        </div>
    `}).join('');
}

function renderSkills(technicalSkills, softSkills) {
    const container = document.querySelector('.skills-grid');
    if (!container) return;

    var levelLabels = { 1: 'Familiar', 2: 'Proficient', 3: 'Advanced', 4: 'Expert' };

    function migrateLevel(level) {
        if (typeof level === 'number' && level >= 0 && level <= 100) {
            if (level <= 25) return 1;
            if (level <= 60) return 2;
            if (level <= 85) return 3;
            return 4;
        }
        if (typeof level === 'number' && level >= 1 && level <= 4) return level;
        if (typeof level === 'string') {
            var s = level.toLowerCase();
            if (s === 'familiar' || s === 'beginner') return 1;
            if (s === 'proficient' || s === 'intermediate') return 2;
            if (s === 'advanced') return 3;
            if (s === 'expert') return 4;
        }
        return 2;
    }

    function renderSkillTags(skills, categoryName) {
        if (!skills || skills.length === 0) return '';
        return '<div class="skill-category"><h3>' + categoryName + '</h3><div class="skill-tags">' +
            skills.map(function(skill) {
                var level = migrateLevel(skill.level);
                var label = levelLabels[level] || '';
                var labelHtml = label ? '<span class="skill-chip-sep"> · </span><span class="skill-chip-level">' + label + '</span>' : '';
                return '<span class="skill-chip" data-level="' + level + '" aria-label="' + sanitizeHTML(skill.name) + ', ' + label + '">' +
                    '<span class="skill-chip-name">' + sanitizeHTML(skill.name) + '</span>' +
                    labelHtml + '</span>';
            }).join('') +
            '</div></div>';
    }

    container.innerHTML =
        renderSkillTags(technicalSkills, 'Technical Skills') +
        renderSkillTags(softSkills, 'Soft Skills');
}

function renderProjects(projects) {
    const container = document.querySelector('.projects-grid');
    if (!container) return;

    container.innerHTML = projects.map(proj => {
        const fileUrl = proj.file || proj.image || '';
        const fileName = proj.fileName || '';
        const fileType = proj.fileType || '';
        const hasImage = fileUrl && isImageFile(fileUrl, fileName);
        const escUrl = fileUrl ? sanitizeURL(fileUrl).replace(/'/g, '%27') : '';
        const escName = (fileName || proj.name || 'image').replace(/'/g, "\\'");
        return `
        <div class="project-card">
            <div class="project-image" ${hasImage ? 'onclick="openFilePreview(\'' + escUrl + '\',\'' + escName + '\',\'image\')" style="cursor:zoom-in"' : ''} title="${hasImage ? 'Click to preview' : ''}">
                ${hasImage ? '<img src="' + sanitizeURL(fileUrl) + '" alt="' + sanitizeHTML(proj.name) + '" style="width:100%;height:100%;object-fit:cover;">' : '<div class="project-placeholder">' + sanitizeHTML(proj.name) + '</div>'}
            </div>
            <div class="project-content">
                <h3>${sanitizeHTML(proj.name)}</h3>
                <p>${sanitizeHTML(proj.description)}</p>
                <div class="project-tech">
                    ${(proj.technologies || []).map(tech => '<span>' + sanitizeHTML(tech) + '</span>').join('')}
                </div>
                ${fileUrl && !hasImage ? renderFilePreview(fileUrl, fileName, fileType) : ''}
                <div class="project-links">
                    ${proj.demoUrl ? `<a href="${sanitizeURL(proj.demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn-small">View Demo</a>` : ''}
                    ${proj.codeUrl ? `<a href="${sanitizeURL(proj.codeUrl)}" target="_blank" rel="noopener noreferrer" class="btn-small btn-outline">Source Code</a>` : ''}
                </div>
            </div>
        </div>
    `}).join('');
}

function renderCertifications(certifications) {
    const container = document.querySelector('.cert-grid');
    if (!container) return;

    container.innerHTML = certifications.map(cert => {
        const fileUrl = cert.file || cert.fileUrl || '';
        const fileName = cert.fileName || (cert.name ? cert.name + '.pdf' : 'certificate.pdf');
        const fileType = cert.fileType || '';
        return `
        <div class="cert-card">
            <i class="fas fa-certificate"></i>
            <h3>${sanitizeHTML(cert.name)}</h3>
            <p>${sanitizeHTML(cert.organization)}</p>
            <span class="cert-date">${sanitizeHTML(cert.year)}</span>
            ${fileUrl ? renderFilePreview(fileUrl, fileName, fileType) : ''}
        </div>
    `}).join('');
}

function renderAwards(awards) {
    const container = document.querySelector('.awards-grid');
    if (!container) return;

    container.innerHTML = awards.map(award => {
        const fileUrl = award.file || award.fileUrl || '';
        const fileName = award.fileName || (award.name ? award.name + '.pdf' : 'award.pdf');
        const fileType = award.fileType || '';
        return `
        <div class="award-card">
            <div class="award-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="award-content">
                <h3>${sanitizeHTML(award.name)}</h3>
                <p>${sanitizeHTML(award.organization)}</p>
                <span class="award-year">${sanitizeHTML(award.year)}</span>
                ${fileUrl ? renderFilePreview(fileUrl, fileName, fileType) : ''}
            </div>
        </div>
    `}).join('');
}

function dismissWelcome() {
    var overlay = document.getElementById('welcomeOverlay');
    if (!overlay) return;

    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    sessionStorage.setItem('welcomeDismissed', '1');

    setTimeout(function() {
        overlay.style.display = 'none';
    }, 220);

    var badge = document.getElementById('sampleBadge');
    if (badge) badge.style.display = 'flex';
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
        const href = this.getAttribute('href');
        if (href === '#' || href === '#contact' || href === '#about' || href === '#experience' || href === '#skills' || href === '#projects') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ===== NAVBAR BACKGROUND ON SCROLL =====
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.background = 'rgba(15, 15, 15, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.3)';
        } else {
            navbar.style.background = 'rgba(15, 15, 15, 0.95)';
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// ===== MOBILE MENU TOGGLE =====
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
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
}

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

// Observe all cards and sections (skip if user prefers reduced motion)
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.experience-card, .education-card, .cert-card, .project-card, .award-card, .skill-tag').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// ===== PARALLAX EFFECT FOR HERO SHAPES =====
const shapes = document.querySelectorAll('.shape');

if (shapes.length > 0) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.2;
            shape.style.transform = 'translateY(' + (rate * speed) + 'px)';
        });
    });
}

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
    if (tagline) {
        const originalText = tagline.textContent;
        typeWriter(tagline, originalText, 80);
    }
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

if (sections.length > 0) {
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
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

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

if (document.querySelector('.navbar')) {
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
}

// ===== MOUSE MOVEMENT EFFECT (subtle parallax) =====
if (document.querySelector('.hero-content')) {
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = 'translate(' + (mouseX * 20) + 'px, ' + (mouseY * 20) + 'px)';
        }
    });
}

// ===== PDF EXPORT & PREVIEW =====
const modal = document.getElementById('print-preview-modal');
const closeBtn = document.querySelector('.close-modal');
const cancelBtn = document.querySelector('.close-modal-btn');
const saveBtn = document.getElementById('save-pdf-btn');

// ===== PRINT PREVIEW CONTENT GENERATION =====

/**
 * Extracts all CV data from the DOM and localStorage
 * @returns {Object} Structured CV data object
 */
function extractCVData() {
    const data = {
        personal: {},
        contact: {},
        summary: '',
        experience: [],
        education: [],
        skills: { technical: [], soft: [] },
        projects: [],
        certifications: [],
        awards: []
    };

    // Try to get data from localStorage first (most up-to-date)
    const savedData = localStorage.getItem('cvData');
    if (savedData) {
        try {
            const cvData = JSON.parse(savedData);
            
            // Personal info
            if (cvData.personal) {
                data.personal = {
                    name: cvData.personal.fullName || 'Your Name',
                    title: cvData.personal.jobTitle || 'Job Title',
                    location: cvData.personal.location || ''
                };
            }
            
            // Contact info
            if (cvData.contact) {
                data.contact = {
                    phone: cvData.contact.phone || '',
                    email: cvData.contact.email || '',
                    linkedin: cvData.contact.linkedin || '',
                    github: cvData.contact.github || ''
                };
            }
            
            // Summary
            if (cvData.summary) {
                data.summary = cvData.summary;
            }
            
            // Experience
            if (cvData.experience && Array.isArray(cvData.experience)) {
                data.experience = cvData.experience.map(exp => ({
                    company: exp.company || '',
                    role: exp.role || '',
                    startDate: exp.startDate || '',
                    endDate: exp.endDate || '',
                    achievements: Array.isArray(exp.achievements) ? exp.achievements : []
                }));
            }
            
            // Education
            if (cvData.education && Array.isArray(cvData.education)) {
                data.education = cvData.education.map(edu => ({
                    degree: edu.degree || '',
                    institution: edu.institution || '',
                    graduationDate: edu.graduationDate || '',
                    gpa: edu.gpa || ''
                }));
            }
            
            // Skills
            if (cvData.technicalSkills && Array.isArray(cvData.technicalSkills)) {
                data.skills.technical = cvData.technicalSkills;
            }
            if (cvData.softSkills && Array.isArray(cvData.softSkills)) {
                data.skills.soft = cvData.softSkills;
            }
            
            // Projects
            if (cvData.projects && Array.isArray(cvData.projects)) {
                data.projects = cvData.projects.map(proj => ({
                    name: proj.name || '',
                    description: proj.description || '',
                    technologies: Array.isArray(proj.technologies) ? proj.technologies : []
                }));
            }
            
            // Certifications
            if (cvData.certifications && Array.isArray(cvData.certifications)) {
                data.certifications = cvData.certifications.map(cert => ({
                    name: cert.name || '',
                    organization: cert.organization || '',
                    year: cert.year || ''
                }));
            }
            
            // Awards
            if (cvData.awards && Array.isArray(cvData.awards)) {
                data.awards = cvData.awards.map(award => ({
                    name: award.name || '',
                    organization: award.organization || '',
                    year: award.year || ''
                }));
            }
            
            return data;
        } catch (e) {
            console.error('Error parsing CV data from localStorage:', e);
        }
    }
    
    // Fallback: Extract from DOM
    return extractCVDataFromDOM();
}

/**
 * Extracts CV data from the DOM when localStorage is not available
 * @returns {Object} Structured CV data object
 */
function extractCVDataFromDOM() {
    const data = {
        personal: {},
        contact: {},
        summary: '',
        experience: [],
        education: [],
        skills: { technical: [], soft: [] },
        projects: [],
        certifications: [],
        awards: []
    };
    
    // Personal info from hero section
    const nameEl = document.querySelector('.hero-text h1');
    const titleEl = document.querySelector('.tagline');
    const locationEl = document.querySelector('.location');
    
    data.personal = {
        name: nameEl ? nameEl.textContent.trim() : 'Your Name',
        title: titleEl ? titleEl.textContent.trim() : 'Job Title',
        location: locationEl ? locationEl.textContent.replace('📍', '').trim() : ''
    };
    
    // Contact info
    document.querySelectorAll('.contact-item').forEach(item => {
        const icon = item.querySelector('i');
        const span = item.querySelector('span');
        const text = span ? span.textContent.trim() : '';
        
        if (icon.classList.contains('fa-phone')) data.contact.phone = text;
        else if (icon.classList.contains('fa-envelope')) data.contact.email = text;
        else if (icon.classList.contains('fa-linkedin')) data.contact.linkedin = text;
        else if (icon.classList.contains('fa-github')) data.contact.github = text;
    });
    
    // Summary
    const summaryEl = document.querySelector('.summary-text');
    data.summary = summaryEl ? summaryEl.textContent.trim() : '';
    
    // Experience
    document.querySelectorAll('.experience-card').forEach(card => {
        const company = card.querySelector('.company-info h3');
        const role = card.querySelector('.role');
        const date = card.querySelector('.date');
        const achievements = [];
        
        card.querySelectorAll('.achievements li').forEach(li => {
            achievements.push(li.textContent.trim());
        });
        
        data.experience.push({
            company: company ? company.textContent.trim() : '',
            role: role ? role.textContent.trim() : '',
            startDate: date ? date.textContent.split('-')[0].trim() : '',
            endDate: date ? date.textContent.split('-')[1]?.trim() || 'Present' : '',
            achievements: achievements
        });
    });
    
    // Education
    document.querySelectorAll('.education-card').forEach(card => {
        const degree = card.querySelector('.edu-content h3');
        const institution = card.querySelector('.institution');
        const gradDate = card.querySelector('.grad-date');
        const gpa = card.querySelector('.gpa');
        
        data.education.push({
            degree: degree ? degree.textContent.trim() : '',
            institution: institution ? institution.textContent.trim() : '',
            graduationDate: gradDate ? gradDate.textContent.replace('Graduated:', '').trim() : '',
            gpa: gpa ? gpa.textContent.replace('GPA:', '').trim() : ''
        });
    });
    
    // Skills
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach(cat => {
        const catTitle = cat.querySelector('h3');
        const isTechnical = catTitle && catTitle.textContent.includes('Technical');
        
        cat.querySelectorAll('.skill-item').forEach(item => {
            const name = item.querySelector('.skill-info span:first-child');
            const level = item.querySelector('.skill-info span:last-child');
            
            const skill = {
                name: name ? name.textContent.trim() : '',
                level: level ? level.textContent.trim() : ''
            };
            
            if (isTechnical) {
                data.skills.technical.push(skill);
            } else {
                data.skills.soft.push(skill);
            }
        });
    });
    
    // Projects
    document.querySelectorAll('.project-card').forEach(card => {
        const name = card.querySelector('.project-content h3');
        const description = card.querySelector('.project-content p');
        const techs = [];
        
        card.querySelectorAll('.project-tech span').forEach(span => {
            techs.push(span.textContent.trim());
        });
        
        data.projects.push({
            name: name ? name.textContent.trim() : '',
            description: description ? description.textContent.trim() : '',
            technologies: techs
        });
    });
    
    // Certifications
    document.querySelectorAll('.cert-card').forEach(card => {
        const name = card.querySelector('h3');
        const org = card.querySelector('p');
        const year = card.querySelector('.cert-date');
        
        data.certifications.push({
            name: name ? name.textContent.trim() : '',
            organization: org ? org.textContent.trim() : '',
            year: year ? year.textContent.trim() : ''
        });
    });
    
    // Awards
    document.querySelectorAll('.award-card').forEach(card => {
        const name = card.querySelector('.award-content h3');
        const org = card.querySelector('.award-content p');
        const year = card.querySelector('.award-year');
        
        data.awards.push({
            name: name ? name.textContent.trim() : '',
            organization: org ? org.textContent.trim() : '',
            year: year ? year.textContent.trim() : ''
        });
    });
    
    return data;
}

/**
 * Creates clean, print-friendly HTML from CV data
 * @param {Object} data - The CV data object
 * @returns {string} Clean HTML string for printing
 */
function createPrintHTML(data) {
    const formatContact = (value, prefix = '') => {
        if (!value) return '';
        return value.replace(prefix, '').trim();
    };
    
    // Generate contact line
    const contactItems = [];
    if (data.contact.email) contactItems.push(`<span class="print-contact-item">${sanitizeHTML(data.contact.email)}</span>`);
    if (data.contact.phone) contactItems.push(`<span class="print-contact-item">${sanitizeHTML(data.contact.phone)}</span>`);
    if (data.contact.linkedin) contactItems.push(`<span class="print-contact-item">${sanitizeHTML(formatContact(data.contact.linkedin, 'linkedin.com/'))}</span>`);
    if (data.contact.github) contactItems.push(`<span class="print-contact-item">${sanitizeHTML(formatContact(data.contact.github, 'github.com/'))}</span>`);
    
    // Generate experience HTML
    const experienceHTML = data.experience.length > 0 
        ? data.experience.map(exp => `
            <div class="print-experience-item">
                <div class="print-experience-header">
                    <div>
                        <h3 class="print-job-title">${sanitizeHTML(exp.role)}</h3>
                        <span class="print-company">${sanitizeHTML(exp.company)}</span>
                    </div>
                    <span class="print-date">${sanitizeHTML(exp.startDate)} - ${sanitizeHTML(exp.endDate)}</span>
                </div>
                ${exp.achievements.length > 0 ? `
                    <ul class="print-achievements">
                        ${exp.achievements.map(ach => `<li>${sanitizeHTML(ach)}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('')
        : '';
    
    // Generate education HTML
    const educationHTML = data.education.length > 0
        ? data.education.map(edu => `
            <div class="print-education-item">
                <div class="print-education-header">
                    <div>
                        <h3 class="print-degree">${sanitizeHTML(edu.degree)}</h3>
                        <span class="print-institution">${sanitizeHTML(edu.institution)}</span>
                    </div>
                    <span class="print-date">${sanitizeHTML(edu.graduationDate)}</span>
                </div>
                ${edu.gpa ? `<span class="print-gpa">GPA: ${sanitizeHTML(edu.gpa)}</span>` : ''}
            </div>
        `).join('')
        : '';
    
    // Generate skills HTML
    const skillsHTML = (skills) => {
        if (!skills || skills.length === 0) return '';
        return skills.map(skill => {
            if (typeof skill === 'string') return sanitizeHTML(skill);
            return `${sanitizeHTML(skill.name)}${skill.level ? ` (${sanitizeHTML(skill.level)})` : ''}`;
        }).join(' • ');
    };
    
    // Generate projects HTML
    const projectsHTML = data.projects.length > 0
        ? data.projects.map(proj => `
            <div class="print-project-item">
                <h3 class="print-project-name">${sanitizeHTML(proj.name)}</h3>
                <p class="print-project-desc">${sanitizeHTML(proj.description)}</p>
                ${proj.technologies.length > 0 ? `
                    <span class="print-project-tech">${proj.technologies.map(t => sanitizeHTML(t)).join(', ')}</span>
                ` : ''}
            </div>
        `).join('')
        : '';
    
    // Generate certifications HTML
    const certificationsHTML = data.certifications.length > 0
        ? data.certifications.map(cert => `
            <div class="print-cert-item">
                <span class="print-cert-name">${sanitizeHTML(cert.name)}</span>
                <span class="print-cert-org">${sanitizeHTML(cert.organization)}</span>
                <span class="print-cert-year">${sanitizeHTML(cert.year)}</span>
            </div>
        `).join('')
        : '';
    
    // Generate awards HTML
    const awardsHTML = data.awards.length > 0
        ? data.awards.map(award => `
            <div class="print-award-item">
                <span class="print-award-name">${sanitizeHTML(award.name)}</span>
                <span class="print-award-org">${sanitizeHTML(award.organization)}</span>
                <span class="print-award-year">${sanitizeHTML(award.year)}</span>
            </div>
        `).join('')
        : '';
    
    // Build full HTML
    return `
        <div class="print-resume">
            <!-- Header -->
            <header class="print-header">
                <h1>${sanitizeHTML(data.personal.name)}</h1>
                <p class="print-title">${sanitizeHTML(data.personal.title)}</p>
                ${contactItems.length > 0 ? `
                    <div class="print-contact">
                        ${contactItems.join(' <span class="print-separator">|</span> ')}
                    </div>
                ` : ''}
            </header>
            
            <!-- Summary -->
            ${data.summary ? `
                <section class="print-section">
                    <h2 class="print-section-title">Professional Summary</h2>
                    <p class="print-summary">${sanitizeHTML(data.summary)}</p>
                </section>
            ` : ''}
            
            <!-- Experience -->
            ${experienceHTML ? `
                <section class="print-section">
                    <h2 class="print-section-title">Work Experience</h2>
                    ${experienceHTML}
                </section>
            ` : ''}
            
            <!-- Education -->
            ${educationHTML ? `
                <section class="print-section">
                    <h2 class="print-section-title">Education</h2>
                    ${educationHTML}
                </section>
            ` : ''}
            
            <!-- Skills -->
            ${(data.skills.technical.length > 0 || data.skills.soft.length > 0) ? `
                <section class="print-section">
                    <h2 class="print-section-title">Skills</h2>
                    ${data.skills.technical.length > 0 ? `
                        <div class="print-skill-category">
                            <span class="print-skill-label">Technical:</span>
                            <span class="print-skill-list">${skillsHTML(data.skills.technical)}</span>
                        </div>
                    ` : ''}
                    ${data.skills.soft.length > 0 ? `
                        <div class="print-skill-category">
                            <span class="print-skill-label">Soft Skills:</span>
                            <span class="print-skill-list">${skillsHTML(data.skills.soft)}</span>
                        </div>
                    ` : ''}
                </section>
            ` : ''}
            
            <!-- Projects -->
            ${projectsHTML ? `
                <section class="print-section">
                    <h2 class="print-section-title">Projects</h2>
                    ${projectsHTML}
                </section>
            ` : ''}
            
            <!-- Certifications -->
            ${certificationsHTML ? `
                <section class="print-section">
                    <h2 class="print-section-title">Certifications</h2>
                    <div class="print-cert-list">
                        ${certificationsHTML}
                    </div>
                </section>
            ` : ''}
            
            <!-- Awards -->
            ${awardsHTML ? `
                <section class="print-section">
                    <h2 class="print-section-title">Awards & Achievements</h2>
                    <div class="print-award-list">
                        ${awardsHTML}
                    </div>
                </section>
            ` : ''}
        </div>
    `;
}

/**
 * Generates print-friendly content from current CV
 * @returns {string} HTML string ready for print preview
 */
function generatePrintFriendlyContent() {
    // 1. Extract all data from current CV
    const cvData = extractCVData();
    
    // 2. Generate clean HTML structure for print
    const printHTML = createPrintHTML(cvData);
    
    // 3. Return the HTML
    return printHTML;
}

// ============================================
// PDF GENERATION - FIXED VERSION
// ============================================

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Extract CV data from DOM as fallback
 * @returns {Object} CV data object
 */
function extractDataFromDOM() {
    return {
        personal: {
            fullName: document.querySelector('.hero-text h1')?.textContent?.trim() || '',
            jobTitle: document.querySelector('.tagline')?.textContent?.trim() || '',
            location: document.querySelector('.location')?.textContent?.replace(/^[^\w]*/, '')?.trim() || ''
        },
        contact: {
            email: document.querySelector('.contact-item[href^="mailto:"] span')?.textContent?.trim() || '',
            phone: document.querySelector('.contact-item[href^="tel:"] span')?.textContent?.trim() || '',
            linkedin: document.querySelector('.contact-item[href*="linkedin"] span')?.textContent?.trim() || '',
            github: document.querySelector('.contact-item[href*="github"] span')?.textContent?.trim() || ''
        },
        summary: document.querySelector('.summary-text')?.textContent?.trim() || ''
    };
}

/**
 * Generate print-friendly HTML from CV data
 * @returns {string} HTML string for print preview
 */
function generatePrintFriendlyHTML() {
    // Get data from localStorage
    const savedData = localStorage.getItem('cvData');
    let cvData = {};
    
    if (savedData) {
        try {
            cvData = JSON.parse(savedData);
        } catch (e) {
            console.error('Error parsing CV data:', e);
            cvData = extractDataFromDOM();
        }
    } else {
        // Fallback: Extract from current DOM
        cvData = extractDataFromDOM();
    }
    
    // Build clean HTML
    return `
        <div class="print-resume">
            <!-- HEADER -->
            <header class="print-header">
                <h1 class="print-name">${escapeHtml(cvData.personal?.fullName || 'Your Name')}</h1>
                <p class="print-title">${escapeHtml(cvData.personal?.jobTitle || 'Job Title')}</p>
                <div class="print-contact-line">
                    ${cvData.contact?.email ? `<span>${escapeHtml(cvData.contact.email)}</span>` : ''}
                    ${cvData.contact?.email && cvData.contact?.phone ? `<span class="separator">|</span>` : ''}
                    ${cvData.contact?.phone ? `<span>${escapeHtml(cvData.contact.phone)}</span>` : ''}
                    ${cvData.contact?.phone && cvData.contact?.linkedin ? `<span class="separator">|</span>` : ''}
                    ${cvData.contact?.linkedin ? `<span>${escapeHtml(cvData.contact.linkedin.replace('https://', ''))}</span>` : ''}
                </div>
            </header>
            
            <!-- SUMMARY -->
            ${cvData.summary ? `
            <section class="print-section">
                <h2 class="print-section-title">Professional Summary</h2>
                <p class="print-summary">${escapeHtml(cvData.summary)}</p>
            </section>
            ` : ''}
            
            <!-- EXPERIENCE -->
            ${cvData.experience && cvData.experience.length > 0 ? `
            <section class="print-section">
                <h2 class="print-section-title">Work Experience</h2>
                ${cvData.experience.map(exp => `
                    <div class="print-item">
                        <div class="print-item-header">
                            <div class="print-item-title">
                                <strong class="print-company">${escapeHtml(exp.company)}</strong>
                                <span class="print-role">${escapeHtml(exp.role)}</span>
                            </div>
                            <span class="print-date">${escapeHtml(exp.startDate)} - ${escapeHtml(exp.endDate)}</span>
                        </div>
                        ${(exp.achievements && exp.achievements.length > 0) ? `
                            <ul class="print-achievements">
                                ${exp.achievements.map(ach => `<li>${escapeHtml(ach)}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            <!-- EDUCATION -->
            ${cvData.education && cvData.education.length > 0 ? `
            <section class="print-section">
                <h2 class="print-section-title">Education</h2>
                ${cvData.education.map(edu => `
                    <div class="print-item">
                        <div class="print-item-header">
                            <div class="print-item-title">
                                <strong>${escapeHtml(edu.degree)}</strong>
                                <span class="print-institution">${escapeHtml(edu.institution)}</span>
                            </div>
                            <span class="print-date">${escapeHtml(edu.graduationDate)}</span>
                        </div>
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            <!-- SKILLS -->
            ${(cvData.technicalSkills?.length > 0 || cvData.softSkills?.length > 0) ? `
            <section class="print-section">
                <h2 class="print-section-title">Skills</h2>
                ${cvData.technicalSkills?.length > 0 ? `
                    <p class="print-skills-row">
                        <strong>Technical:</strong> 
                        ${cvData.technicalSkills.map(s => `${escapeHtml(s.name)} (${s.level}%)`).join(', ')}
                    </p>
                ` : ''}
                ${cvData.softSkills?.length > 0 ? `
                    <p class="print-skills-row">
                        <strong>Soft Skills:</strong> 
                        ${cvData.softSkills.map(s => `${escapeHtml(s.name)} (${s.level}%)`).join(', ')}
                    </p>
                ` : ''}
            </section>
            ` : ''}
            
            <!-- PROJECTS -->
            ${cvData.projects && cvData.projects.length > 0 ? `
            <section class="print-section">
                <h2 class="print-section-title">Projects</h2>
                ${cvData.projects.map(proj => `
                    <div class="print-item">
                        <strong>${escapeHtml(proj.name)}</strong>
                        <p class="print-project-desc">${escapeHtml(proj.description)}</p>
                        ${proj.technologies?.length > 0 ? `
                            <p class="print-tech"><em>Technologies:</em> ${proj.technologies.map(t => escapeHtml(t)).join(', ')}</p>
                        ` : ''}
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            <!-- CERTIFICATIONS -->
            ${cvData.certifications && cvData.certifications.length > 0 ? `
            <section class="print-section">
                <h2 class="print-section-title">Certifications</h2>
                ${cvData.certifications.map(cert => `
                    <div class="print-item-compact">
                        <strong>${escapeHtml(cert.name)}</strong> - ${escapeHtml(cert.organization)} (${escapeHtml(cert.year)})
                    </div>
                `).join('')}
            </section>
            ` : ''}
            
            <!-- AWARDS -->
            ${cvData.awards && cvData.awards.length > 0 ? `
            <section class="print-section">
                <h2 class="print-section-title">Awards</h2>
                ${cvData.awards.map(award => `
                    <div class="print-item-compact">
                        <strong>${escapeHtml(award.name)}</strong> - ${escapeHtml(award.organization)} (${escapeHtml(award.year)})
                    </div>
                `).join('')}
            </section>
            ` : ''}
        </div>
    `;
}

/**
 * Saves the print preview content as PDF
 */
function saveAsPDF() {
    // Get the preview content element
    const element = document.getElementById('print-preview-content');
    
    if (!element) {
        console.error('Error: Cannot find preview content element');
        alert('Error: Cannot find content to export');
        return;
    }
    
    // Check if content exists
    if (!element.innerHTML || element.innerHTML.trim() === '') {
        console.error('Error: No content to export');
        alert('Error: No content to export. Please try again.');
        return;
    }
    
    console.log('PDF Generation - Element found:', element);
    console.log('Content length:', element.innerHTML.length);
    
    // Get user's name for filename
    const savedData = localStorage.getItem('cvData');
    let filename = 'My_Resume.pdf';
    
    if (savedData) {
        try {
            const cvData = JSON.parse(savedData);
            if (cvData.personal?.fullName) {
                filename = cvData.personal.fullName.replace(/\s+/g, '_') + '_Resume.pdf';
            }
        } catch (e) {
            console.error('Error parsing filename:', e);
        }
    }
    
    // PDF options
    const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { 
            type: 'jpeg', 
            quality: 0.95 
        },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            scrollY: 0,
            scrollX: 0,
            windowWidth: 800
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        },
        pagebreak: { 
            mode: ['css', 'legacy'],
            avoid: ['.print-item', '.print-section']
        }
    };
    
    // Show loading state
    const saveBtn = document.getElementById('save-pdf-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    saveBtn.disabled = true;
    
    console.log('Starting PDF generation...');
    
    // Generate PDF
    html2pdf().set(opt).from(element).save().then(() => {
        console.log('PDF generated and saved successfully');
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }).catch(err => {
        console.error('PDF generation error:', err);
        alert('Error generating PDF: ' + err.message);
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    });
}

// ============================================
// MODAL CLOSE FUNCTIONALITY - FIXED VERSION
// ============================================

/**
 * Close the print preview modal
 */
function closePrintModal() {
    const modal = document.getElementById('print-preview-modal');
    
    if (modal) {
        // Hide modal
        modal.classList.remove('show');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Clear preview content (optional - saves memory)
        const previewContent = document.getElementById('print-preview-content');
        if (previewContent) {
            previewContent.innerHTML = '';
        }
        
        console.log('Modal closed');
    }
}

/**
 * Initialize modal event handlers
 */
function initModalHandlers() {
    const modal = document.getElementById('print-preview-modal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.close-modal-btn');
    const saveBtn = document.getElementById('save-pdf-btn');
    
    console.log('Initializing modal handlers...');
    console.log('Modal:', modal);
    console.log('Close button:', closeBtn);
    console.log('Cancel button:', cancelBtn);
    console.log('Save button:', saveBtn);
    
    // Close on X button click
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked');
            closePrintModal();
        });
    }
    
    // Close on Cancel button click
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Cancel button clicked');
            closePrintModal();
        });
    }
    
    // Save PDF and close
    if (saveBtn) {
        // Remove any existing listeners to prevent duplicates
        saveBtn.replaceWith(saveBtn.cloneNode(true));
        const newSaveBtn = document.getElementById('save-pdf-btn');
        
        newSaveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Save PDF button clicked');
            saveAsPDF();
        });
    }
    
    // Close on clicking outside modal (backdrop)
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('Backdrop clicked');
                closePrintModal();
            }
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('print-preview-modal');
            if (modal && modal.classList.contains('show')) {
                console.log('Escape key pressed');
                closePrintModal();
            }
        }
    });
    
    console.log('Modal handlers initialized');
}

/**
 * Open print preview modal with print-friendly content
 * @param {Event} event - Click event
 */
function openPrintPreview(event) {
    if (event) event.preventDefault();
    
    console.log('Opening print preview...');
    
    const modal = document.getElementById('print-preview-modal');
    const previewContainer = document.getElementById('print-preview-content');
    
    if (!modal || !previewContainer) {
        console.error('Modal elements not found');
        return;
    }
    
    // 1. Generate print-friendly content
    const printContent = generatePrintFriendlyHTML();
    
    // 2. Insert into preview container
    previewContainer.innerHTML = printContent;
    
    console.log('Preview content inserted, length:', printContent.length);
    
    // 3. Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    console.log('Modal shown');
}

// Initialize modal handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing modal handlers');
    initModalHandlers();
    
    // Check if photo was removed
    if (localStorage.getItem('cvPhotoRemoved') === 'true') {
        removePhoto();
    }
});

function removePhoto() {
    const heroImage = document.getElementById('heroImageContainer');
    if (heroImage) {
        heroImage.style.display = 'none';
    }
    localStorage.setItem('cvPhotoRemoved', 'true');
}

/**
 * Download CV as PDF - Enhanced with loading state and auto-scaling
 */
function downloadCVAsPDF() {
    console.log('Download CV as PDF...');
    
    // Show loading state
    const btn = document.querySelector('.btn-download-pdf');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        btn.disabled = true;
    }
    
    // Get data from localStorage or extract from DOM
    const savedData = localStorage.getItem('cvData');
    let cvData = {};
    
    if (savedData) {
        try {
            cvData = JSON.parse(savedData);
        } catch (e) {
            console.error('Error parsing CV data:', e);
            cvData = extractDataFromDOM();
        }
    } else {
        cvData = extractDataFromDOM();
    }
    
    // Get user's name for filename
    let filename = 'My_CV.pdf';
    if (cvData.personal?.fullName) {
        filename = cvData.personal.fullName.replace(/\s+/g, '_') + '_CV.pdf';
    }
    
    // Create hidden container for PDF generation
    const container = document.createElement('div');
    container.id = 'pdf-generation-container';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '190mm';
    container.style.padding = '15mm';
    container.style.background = '#fff';
    container.style.fontFamily = "'Times New Roman', Georgia, serif";
    container.style.fontSize = '11pt';
    container.style.lineHeight = '1.4';
    container.style.color = '#000';
    container.style.boxSizing = 'border-box';
    
    // Generate clean A4 HTML
    container.innerHTML = generateCleanA4HTML(cvData);
    document.body.appendChild(container);
    
    // Calculate content height and adjust scale if needed
    const contentHeight = container.offsetHeight;
    const maxHeight = 277; // A4 height in mm minus margins
    let scale = 1;
    
    if (contentHeight > maxHeight * 1.33) {
        scale = 0.85;
    } else if (contentHeight > maxHeight * 1.2) {
        scale = 0.9;
    } else if (contentHeight > maxHeight * 1.1) {
        scale = 0.95;
    }
    
    // PDF options optimized for A4
    const opt = {
        margin: [0, 0, 0, 0],
        filename: filename,
        image: { 
            type: 'jpeg', 
            quality: 0.98 
        },
        html2canvas: { 
            scale: 3 * scale,
            useCORS: true,
            logging: false,
            scrollY: 0,
            scrollX: 0,
            windowWidth: 794,
            onclone: (clonedDoc) => {
                const clonedContainer = clonedDoc.getElementById('pdf-generation-container');
                if (clonedContainer) {
                    clonedContainer.style.transform = `scale(${scale})`;
                    clonedContainer.style.transformOrigin = 'top left';
                }
            }
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        },
        pagebreak: { 
            mode: ['css', 'legacy'],
            avoid: ['.print-item', '.print-section', '.print-experience', 'h2', 'h3']
        }
    };
    
    console.log('Generating PDF with filename:', filename, 'Scale:', scale);
    
    // Reset button after PDF generation
    const resetButton = () => {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-file-pdf"></i> Download CV';
            btn.disabled = false;
        }
    };
    
    html2pdf().set(opt).from(container).save().then(() => {
        console.log('PDF saved successfully');
        document.body.removeChild(container);
        resetButton();
    }).catch(err => {
        console.error('PDF generation error:', err);
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
        resetButton();
    });
}

/**
 * Generate clean A4 HTML for PDF
 */
function generateCleanA4HTML(cvData) {
    const d = cvData;
    
    return `
    <div class="print-resume-a4">
        <!-- HEADER -->
        <header style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
            <h1 style="font-size: 22pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0; color: #000;">${escapeHtml(d.personal?.fullName || 'Your Name')}</h1>
            <p style="font-size: 12pt; color: #333; margin: 0 0 6px 0;">${escapeHtml(d.personal?.jobTitle || 'Job Title')}</p>
            <div style="font-size: 9pt; color: #333;">
                ${d.contact?.email ? `<span>${escapeHtml(d.contact.email)}</span>` : ''}
                ${d.contact?.email && d.contact?.phone ? `<span style="margin: 0 6px;">|</span>` : ''}
                ${d.contact?.phone ? `<span>${escapeHtml(d.contact.phone)}</span>` : ''}
                ${d.contact?.phone && d.contact?.linkedin ? `<span style="margin: 0 6px;">|</span>` : ''}
                ${d.contact?.linkedin ? `<span>${escapeHtml(d.contact.linkedin.replace('https://', ''))}</span>` : ''}
            </div>
        </header>
        
        <!-- SUMMARY -->
        ${d.summary ? `
        <section style="margin-bottom: 10px;">
            <h2 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 6px;">Professional Summary</h2>
            <p style="font-size: 10pt; color: #333; margin: 0; text-align: justify;">${escapeHtml(d.summary)}</p>
        </section>
        ` : ''}
        
        <!-- EXPERIENCE -->
        ${d.experience && d.experience.length > 0 ? `
        <section style="margin-bottom: 10px;">
            <h2 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 6px;">Work Experience</h2>
            ${d.experience.map(exp => `
            <div class="print-experience" style="margin-bottom: 8px; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <div>
                        <strong style="font-size: 10pt;">${escapeHtml(exp.company)}</strong>
                        <span style="font-size: 10pt; color: #333;"> - ${escapeHtml(exp.role)}</span>
                    </div>
                    <span style="font-size: 10pt; color: #333;">${escapeHtml(exp.startDate)} - ${escapeHtml(exp.endDate)}</span>
                </div>
                ${exp.achievements && exp.achievements.length > 0 ? `
                <ul style="margin: 2px 0 0 12px; padding-left: 0;">
                    ${exp.achievements.map(ach => `<li style="font-size: 9.5pt; color: #333; margin-bottom: 2px;">${escapeHtml(ach)}</li>`).join('')}
                </ul>
                ` : ''}
            </div>
            `).join('')}
        </section>
        ` : ''}
        
        <!-- EDUCATION -->
        ${d.education && d.education.length > 0 ? `
        <section style="margin-bottom: 10px;">
            <h2 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 6px;">Education</h2>
            ${d.education.map(edu => `
            <div style="margin-bottom: 6px; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <strong style="font-size: 10pt;">${escapeHtml(edu.degree)}</strong>
                        <span style="font-size: 10pt; color: #333;"> - ${escapeHtml(edu.institution)}</span>
                    </div>
                    <span style="font-size: 10pt; color: #333;">${escapeHtml(edu.graduationDate)}</span>
                </div>
            </div>
            `).join('')}
        </section>
        ` : ''}
        
        <!-- SKILLS -->
        ${(d.technicalSkills?.length > 0 || d.softSkills?.length > 0) ? `
        <section style="margin-bottom: 10px;">
            <h2 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 6px;">Skills</h2>
            <p style="font-size: 10pt; color: #333; margin: 0;">
                ${[...(d.technicalSkills || []).map(s => s.name), ...(d.softSkills || []).map(s => s.name)].join(', ')}
            </p>
        </section>
        ` : ''}
        
        <!-- PROJECTS -->
        ${d.projects && d.projects.length > 0 ? `
        <section style="margin-bottom: 10px;">
            <h2 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 6px;">Projects</h2>
            ${d.projects.map(proj => `
            <div style="margin-bottom: 6px; page-break-inside: avoid;">
                <strong style="font-size: 10pt;">${escapeHtml(proj.name)}</strong>
                <p style="font-size: 9.5pt; color: #333; margin: 2px 0;">${escapeHtml(proj.description)}</p>
            </div>
            `).join('')}
        </section>
        ` : ''}
        
        <!-- CERTIFICATIONS -->
        ${d.certifications && d.certifications.length > 0 ? `
        <section style="margin-bottom: 10px;">
            <h2 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 6px;">Certifications</h2>
            ${d.certifications.map(cert => `
            <p style="font-size: 10pt; color: #333; margin: 0 0 2px 0;">
                <strong>${escapeHtml(cert.name)}</strong> - ${escapeHtml(cert.organization)} (${escapeHtml(cert.year)})
            </p>
            `).join('')}
        </section>
        ` : ''}
        
        <!-- AWARDS -->
        ${d.awards && d.awards.length > 0 ? `
        <section style="margin-bottom: 10px;">
            <h2 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 6px;">Awards</h2>
            ${d.awards.map(award => `
            <p style="font-size: 10pt; color: #333; margin: 0 0 2px 0;">
                <strong>${escapeHtml(award.name)}</strong> - ${escapeHtml(award.organization)} (${escapeHtml(award.year)})
            </p>
            `).join('')}
        </section>
        ` : ''}
    </div>
    `;
}

/**
 * Export static website - downloads a self-contained index.html with inlined CSS/JS
 */
async function exportStaticWebsite() {
    var btn = document.querySelector('.btn-download-pdf');
    var heroBtn = null;
    document.querySelectorAll('button[onclick="exportStaticWebsite()"]').forEach(function(b) {
        if (b !== btn) heroBtn = b;
    });

    var originalText = btn ? btn.innerHTML : '';
    var heroOriginalText = heroBtn ? heroBtn.innerHTML : '';

    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        btn.disabled = true;
    }
    if (heroBtn) {
        heroBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        heroBtn.disabled = true;
    }

    try {
        var savedData = localStorage.getItem('cvData');
        if (!savedData) {
            alert('Please save your CV first before exporting.');
            return;
        }
        var cvDataObj = JSON.parse(savedData);

        var responses = await Promise.all([
            fetch('index.html'),
            fetch('style.css'),
            fetch('script.js')
        ]);

        if (!responses[0].ok) throw new Error('Failed to fetch index.html');

        var htmlText = await responses[0].text();
        var cssText = await responses[1].text();
        var jsText = await responses[2].text();

        var parser = new DOMParser();
        var doc = parser.parseFromString(htmlText, 'text/html');

        doc.querySelectorAll('a[href="dashboard.html"]').forEach(function(el) { el.remove(); });
        doc.querySelectorAll('button[onclick="exportStaticWebsite()"]').forEach(function(el) { el.remove(); });
        doc.querySelectorAll('#welcomeOverlay').forEach(function(el) { el.remove(); });
        doc.querySelectorAll('#sampleBadge').forEach(function(el) { el.remove(); });
        doc.querySelectorAll('#print-preview-modal').forEach(function(el) { el.remove(); });

        var html = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;

        html = html.replace(
            /<link rel="stylesheet" href="style\.css">\s*/g,
            '<style>\n' + cssText + '\n</style>\n'
        );

        jsText = jsText.replace(/<\/script>/gi, '<\\/script>');

        html = html.replace(
            /<script src="script\.js"><\/script>/,
            '<script>\n' + jsText + '\n</scr' + 'ipt>'
        );

        var lastBody = html.lastIndexOf('</' + 'body>');
        if (lastBody !== -1) {
            var dataScript = '<script>window.EXPORTED_CV_DATA = ' + JSON.stringify(cvDataObj) + ';</' + 'script>\n';
            html = html.substring(0, lastBody) + dataScript + html.substring(lastBody);
        }

        var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export website. Please try again.');
    } finally {
        if (btn) {
            btn.innerHTML = originalText || '<i class="fas fa-file-export"></i> Export Website';
            btn.disabled = false;
        }
        if (heroBtn) {
            heroBtn.innerHTML = heroOriginalText || '<i class="fas fa-file-export"></i> Export Website';
            heroBtn.disabled = false;
        }
    }
}


