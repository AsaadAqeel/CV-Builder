// ===== DASHBOARD JAVASCRIPT =====
// Handles form data, localStorage, and dynamic form elements

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

/**
 * Validates and sanitizes URLs to prevent javascript: and data: protocol attacks
 * @param {string} url - The URL to validate
 * @returns {string} - The sanitized URL or empty string if invalid
 */
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
const objectUrlRegistry = new Map();
function createObjectURL(file) {
    const url = URL.createObjectURL(file);
    return url;
}
function revokeObjectURL(url) {
    if (url && url.startsWith('blob:')) {
        try { URL.revokeObjectURL(url); } catch(e) {}
    }
}
function isImageFile(fileOrName) {
    const type = (fileOrName && fileOrName.type) || '';
    if (type.startsWith('image/')) return true;
    const name = (typeof fileOrName === 'string' ? fileOrName : fileOrName.name || '').toLowerCase();
    return /\.(png|jpe?g|gif|webp|svg)$/.test(name);
}
function isPdfFile(fileOrName) {
    const type = (fileOrName && fileOrName.type) || '';
    if (type === 'application/pdf') return true;
    const name = (typeof fileOrName === 'string' ? fileOrName : fileOrName.name || '').toLowerCase();
    return /\.pdf$/.test(name);
}
function openDashPreview(url, fileName, type) {
    const modal = document.getElementById('dash-file-preview-modal');
    const body = document.getElementById('dash-file-modal-body');
    const title = document.getElementById('dash-file-modal-title');
    const openBtn = document.getElementById('dash-file-modal-open');
    const dlBtn = document.getElementById('dash-file-modal-download');
    if (!modal || !body) { if (url) window.open(url, '_blank'); return; }
    const safeUrl = sanitizeURL(url);
    const safeName = fileName || 'preview';
    title.textContent = safeName; openBtn.href = safeUrl; dlBtn.href = safeUrl; dlBtn.download = safeName;
    if (type === 'image' || isImageFile(safeName) || isImageFile({name:safeName,type:type})) body.innerHTML = '<img src="' + safeUrl + '" alt="' + sanitizeHTML(safeName) + '" style="max-width:100%;max-height:80vh;object-fit:contain;display:block;margin:0 auto;border-radius:8px;">';
    else if (type === 'pdf' || isPdfFile(safeName)) body.innerHTML = '<iframe src="' + safeUrl + '" title="' + sanitizeHTML(safeName) + '" style="width:100%;height:80vh;border:none;border-radius:8px;background:#fff;"></iframe>';
    else body.innerHTML = '<div style="padding:40px;text-align:center;color:#d1d5db;"><p>' + sanitizeHTML(safeName) + '</p><a href="' + safeUrl + '" target="_blank" class="btn btn-primary" style="margin-top:16px;display:inline-block;">Open File</a></div>';
    modal.style.display = 'flex'; document.body.style.overflow = 'hidden';
}
function closeDashPreview() {
    const modal = document.getElementById('dash-file-preview-modal');
    const body = document.getElementById('dash-file-modal-body');
    if (!modal) return; modal.style.display = 'none'; if (body) body.innerHTML = ''; document.body.style.overflow = '';
}
function renderDashboardFilePreview(input, url, file) {
    let preview = input.parentElement.querySelector('.file-inline-preview');
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'file-inline-preview';
        input.insertAdjacentElement('afterend', preview);
        preview.insertAdjacentElement('afterend', preview.nextSibling);
        input.parentElement.appendChild(preview);
    }
    const safeUrl = sanitizeURL(url);
    const safeName = sanitizeHTML(file.name);
    const escUrl = safeUrl.replace(/'/g, '%27');
    const escName = file.name.replace(/'/g, "\\'");
    if (isImageFile(file)) {
        preview.innerHTML = '<img src="' + safeUrl + '" alt="' + safeName + '" style="cursor:zoom-in" onclick="openDashPreview(\'' + escUrl + '\',\'' + escName + '\',\'image\')" title="Click to preview"> <div class="pdf-mini-card"><i class="fas fa-image"></i><span>' + safeName + '</span> <a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Open</a></div>';
    } else if (isPdfFile(file)) {
        preview.innerHTML = '<div class="pdf-mini-card" style="cursor:pointer" onclick="openDashPreview(\'' + escUrl + '\',\'' + escName + '\',\'pdf\')"><i class="fas fa-file-pdf"></i><span>' + safeName + '</span> <a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Open</a> <a href="' + safeUrl + '" download="' + safeName + '" onclick="event.stopPropagation()">Download</a></div><iframe src="' + safeUrl + '" title="' + safeName + '" style="pointer-events:none;cursor:pointer" onclick="openDashPreview(\'' + escUrl + '\',\'' + escName + '\',\'pdf\')"></iframe>';
        preview.style.cursor = 'pointer'; preview.onclick = function(){ openDashPreview(safeUrl, file.name, 'pdf'); };
    } else {
        preview.innerHTML = '<div class="pdf-mini-card" style="cursor:pointer" onclick="openDashPreview(\'' + escUrl + '\',\'' + escName + '\',\'file\')"><i class="fas fa-file"></i><span>' + safeName + '</span> <a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Open</a></div>';
    }
    const status = input.nextElementSibling;
    if (status && status.classList.contains('file-status')) {
        status.textContent = 'File selected: ' + file.name;
    }
}

// ===== INPUT VALIDATION =====
const validationRules = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    phone: {
        pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
        message: 'Please enter a valid phone number'
    },
    url: {
        pattern: /^https?:\/\/.+/i,
        message: 'URL must start with http:// or https://'
    },
    required: {
        pattern: /.+/, 
        message: 'This field is required'
    }
};

/**
 * Validates a field value against a rule
 * @param {string} value - The value to validate
 * @param {string} ruleName - The name of the validation rule
 * @returns {object} - { isValid: boolean, message: string }
 */
function validateField(value, ruleName) {
    const rule = validationRules[ruleName];
    if (!rule) return { isValid: true, message: '' };
    
    const isValid = rule.pattern.test(value);
    return {
        isValid: isValid,
        message: isValid ? '' : rule.message
    };
}

/**
 * Shows validation error for an input field
 * @param {HTMLElement} input - The input element
 * @param {string} message - Error message to display
 */
function showFieldError(input, message) {
    // Remove existing error
    removeFieldError(input);
    
    // Add error styling
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    
    // Create and append error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '4px';
    errorDiv.id = `${input.id}-error`;
    
    input.parentNode.appendChild(errorDiv);
    input.setAttribute('aria-describedby', errorDiv.id);
}

/**
 * Removes validation error from an input field
 * @param {HTMLElement} input - The input element
 */
function removeFieldError(input) {
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

/**
 * Validates all form inputs
 * @returns {boolean} - True if all fields are valid
 */
function validateAllFields() {
    let isValid = true;
    
    // Required fields
    const requiredFields = ['fullName', 'jobTitle', 'email', 'professionalSummary'];
    requiredFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input && !input.value.trim()) {
            showFieldError(input, validationRules.required.message);
            isValid = false;
        }
    });
    
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput && emailInput.value.trim()) {
        const result = validateField(emailInput.value, 'email');
        if (!result.isValid) {
            showFieldError(emailInput, result.message);
            isValid = false;
        }
    }
    
    // Phone validation (if provided)
    const phoneInput = document.getElementById('phone');
    if (phoneInput && phoneInput.value.trim()) {
        const result = validateField(phoneInput.value, 'phone');
        if (!result.isValid) {
            showFieldError(phoneInput, result.message);
            isValid = false;
        }
    }
    
    // URL validations
    const urlFields = ['linkedin', 'github', 'website', 'twitter'];
    urlFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input && input.value.trim()) {
            const result = validateField(input.value, 'url');
            if (!result.isValid) {
                showFieldError(input, result.message);
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Data structure for storing CV information
let cvData = {
    personal: {
        fullName: '',
        jobTitle: '',
        age: '',
        location: '',
        profileImage: ''
    },
    contact: {
        phone: '',
        email: '',
        linkedin: '',
        github: '',
        website: '',
        twitter: ''
    },
    summary: '',
    experience: [],
    education: [],
    technicalSkills: [],
    softSkills: [],
    projects: [],
    certifications: [],
    awards: []
};

// Default data for first-time users
const defaultData = {
    personal: {
        fullName: 'John Doe',
        jobTitle: 'Senior Software Engineer',
        age: '30',
        location: 'San Francisco, CA',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    },
    contact: {
        phone: '+1 (234) 567-890',
        email: 'john.doe@email.com',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        website: '',
        twitter: ''
    },
    summary: 'Experienced Software Engineer with 8+ years of expertise in full-stack development, specializing in building scalable web applications and microservices. Proven track record of leading cross-functional teams and delivering high-impact solutions that increased revenue by 40%. Passionate about clean code, modern architectures, and mentoring junior developers to achieve technical excellence.',
    experience: [
        {
            company: 'TechCorp Solutions',
            role: 'Senior Software Engineer',
            startDate: '2021',
            endDate: 'Present',
            achievements: [
                'Led a team of 5 engineers to rebuild the core platform using React and Node.js, resulting in 60% faster load times',
                'Architected and deployed microservices infrastructure handling 1M+ daily requests with 99.9% uptime',
                'Implemented CI/CD pipelines that reduced deployment time by 70% and eliminated production errors'
            ]
        },
        {
            company: 'InnovateSoft Inc',
            role: 'Full Stack Developer',
            startDate: '2018',
            endDate: '2021',
            achievements: [
                'Developed customer-facing dashboard that increased user engagement by 45% and reduced churn by 25%',
                'Optimized database queries reducing API response time from 3s to 200ms'
            ]
        }
    ],
    education: [
        {
            degree: 'Master of Science in Computer Science',
            institution: 'Stanford University',
            graduationDate: '2016',
            gpa: '3.9'
        },
        {
            degree: 'Bachelor of Science in Software Engineering',
            institution: 'University of California, Berkeley',
            graduationDate: '2014',
            gpa: '3.8'
        }
    ],
    technicalSkills: [
        { name: 'JavaScript / TypeScript', level: 4 },
        { name: 'React / Next.js', level: 4 },
        { name: 'Node.js / Express', level: 4 },
        { name: 'Python / Django', level: 3 },
        { name: 'AWS / Cloud Services', level: 3 }
    ],
    softSkills: [
        { name: 'Leadership', level: 4 },
        { name: 'Communication', level: 4 },
        { name: 'Problem Solving', level: 4 },
        { name: 'Team Collaboration', level: 4 },
        { name: 'Project Management', level: 3 }
    ],
    projects: [
        {
            name: 'E-Commerce Platform',
            description: 'Built a full-stack e-commerce solution handling 10K+ daily transactions with real-time inventory management.',
            technologies: ['React', 'Node.js', 'MongoDB'],
            demoUrl: '#',
            codeUrl: '#'
        },
        {
            name: 'AI Analytics Dashboard',
            description: 'Developed a real-time analytics dashboard with ML predictions for business intelligence.',
            technologies: ['Python', 'TensorFlow', 'D3.js'],
            demoUrl: '#',
            codeUrl: '#'
        }
    ],
    certifications: [
        {
            name: 'AWS Solutions Architect',
            organization: 'Amazon Web Services',
            year: '2023'
        },
        {
            name: 'Google Cloud Professional',
            organization: 'Google Cloud Platform',
            year: '2022'
        }
    ],
    awards: [
        {
            name: 'Employee of the Year',
            organization: 'TechCorp Solutions',
            year: '2023'
        },
        {
            name: 'Hackathon Winner',
            organization: 'TechCrunch Disrupt',
            year: '2022'
        }
    ],
    design: {
        theme: 'default',
        font: "'Poppins', sans-serif"
    }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    loadData();
    setupNavigation();
    setupTabs();
    setupDesign();
    setupCharacterCount();
    setupImageUpload();
    setupValidationListeners();
    setupAutoSave();
    setupStrengthTips();
    setupDragReorder();
});

// ===== REAL-TIME VALIDATION =====
function setupValidationListeners() {
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                const result = validateField(this.value, 'email');
                if (!result.isValid) {
                    showFieldError(this, result.message);
                } else {
                    removeFieldError(this);
                }
            } else {
                removeFieldError(this);
            }
        });
        
        emailInput.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                const result = validateField(this.value, 'email');
                if (result.isValid) {
                    removeFieldError(this);
                }
            }
        });
    }
    
    // Phone validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                const result = validateField(this.value, 'phone');
                if (!result.isValid) {
                    showFieldError(this, result.message);
                } else {
                    removeFieldError(this);
                }
            } else {
                removeFieldError(this);
            }
        });
    }
    
    // URL validations
    const urlFields = ['linkedin', 'github', 'website', 'twitter'];
    urlFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('blur', function() {
                if (this.value.trim()) {
                    const result = validateField(this.value, 'url');
                    if (!result.isValid) {
                        showFieldError(this, result.message);
                    } else {
                        removeFieldError(this);
                    }
                } else {
                    removeFieldError(this);
                }
            });
        }
    });
    
    // Required field validations
    const requiredFields = ['fullName', 'jobTitle', 'professionalSummary'];
    requiredFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    showFieldError(this, validationRules.required.message);
                } else {
                    removeFieldError(this);
                }
            });
        }
    });
}

// ===== DESIGN SETTINGS =====
function setupDesign() {
    // Theme Selection
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Update UI
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Update Data
            if (!cvData.design) cvData.design = {};
            cvData.design.theme = option.getAttribute('data-theme');

            // Auto-save and update preview
            saveAllData(true);
        });
    });

    // Font Selection
    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
        fontSelect.addEventListener('change', (e) => {
            if (!cvData.design) cvData.design = {};
            cvData.design.font = e.target.value;

            // Auto-save and update preview
            saveAllData(true);
        });
    }
}

// ===== IMAGE UPLOAD HANDLING =====
let currentProfileImage = '';
let currentProfileImageObjectUrl = null;

function setupImageUpload() {
    const fileInput = document.getElementById('profileImage');
    if (!fileInput) return;

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (JPG, PNG, or GIF)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }
        if (currentProfileImageObjectUrl) revokeObjectURL(currentProfileImageObjectUrl);
        const objectUrl = createObjectURL(file);
        currentProfileImageObjectUrl = objectUrl;
        currentProfileImage = objectUrl;
        updateImagePreview(objectUrl);
        const reader = new FileReader();
        reader.onload = function(e) {
            cvData.personal.profileImage = e.target.result;
            cvData.personal.profileImageName = file.name;
            cvData.personal.profileImageType = file.type;
            currentProfileImage = e.target.result;
            localStorage.setItem('cvData', JSON.stringify(cvData));
            updatePreview();
        };
        reader.onerror = function() {
            cvData.personal.profileImage = objectUrl;
            cvData.personal.profileImageName = file.name;
            cvData.personal.profileImageType = file.type;
            localStorage.setItem('cvData', JSON.stringify(cvData));
            updatePreview();
        };
        reader.readAsDataURL(file);
    });
}

function updateImagePreview(imageSrc) {
    const previewImg = document.getElementById('previewImg');
    if (previewImg && imageSrc) {
        previewImg.src = imageSrc;
        previewImg.style.display = 'block';
        previewImg.style.cursor = 'zoom-in';
        previewImg.title = 'Click to preview';
        previewImg.onclick = function() { openDashPreview(imageSrc, 'Profile photo', 'image'); };
        previewImg.onerror = function() {
            this.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
        };
    }
}

function removeProfileImage() {
    if (currentProfileImageObjectUrl) revokeObjectURL(currentProfileImageObjectUrl);
    currentProfileImageObjectUrl = null;
    currentProfileImage = '';
    cvData.personal.profileImage = '';
    cvData.personal.profileImageName = '';
    cvData.personal.profileImageType = '';
    const fileInput = document.getElementById('profileImage');
    if (fileInput) fileInput.value = '';
    updateImagePreview('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop');
    localStorage.setItem('cvData', JSON.stringify(cvData));
    updatePreview();
}

// Load data from localStorage or use defaults
function loadData() {
    const savedData = localStorage.getItem('cvData');
    if (savedData) {
        try {
            cvData = JSON.parse(savedData);
        } catch (e) {
            console.warn('Failed to parse saved CV data, using defaults:', e);
            cvData = JSON.parse(JSON.stringify(defaultData));
        }
    } else {
        cvData = JSON.parse(JSON.stringify(defaultData));
    }
    populateForm();
}

// Save data to localStorage
function saveAllData(silent = false) {
    // Validate all fields before saving
    if (!validateAllFields()) {
        // Show error message
        const message = document.getElementById('successMessage');
        const originalHTML = message.innerHTML;
        message.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>Please fix the validation errors before saving.</span>';
        message.style.background = '#ef4444';
        message.classList.add('show');
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                message.innerHTML = originalHTML;
                message.style.background = '';
            }, 300);
        }, 3000);
        return;
    }
    
    collectFormData();
    localStorage.setItem('cvData', JSON.stringify(cvData));
    calculateStrength();
    updatePreview();
    
    if (!silent) {
        showSuccessMessage();
        
        // Open index.html in new tab to show updated CV
        setTimeout(() => {
            window.open('index.html', '_blank');
        }, 500);
    }
}

// Show success message
function showSuccessMessage() {
    const message = document.getElementById('successMessage');
    message.classList.add('show');
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

// Populate form with current data
function populateForm() {
    // Personal Info
    document.getElementById('fullName').value = cvData.personal.fullName;
    document.getElementById('jobTitle').value = cvData.personal.jobTitle;
    document.getElementById('age').value = cvData.personal.age;
    document.getElementById('location').value = cvData.personal.location;

    // Profile Image - handle both base64 and URL
    if (cvData.personal.profileImage) {
        currentProfileImage = cvData.personal.profileImage;
        updateImagePreview(currentProfileImage);
    } else {
        currentProfileImage = '';
        updateImagePreview('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop');
    }

    // Contact Info
    document.getElementById('phone').value = cvData.contact.phone;
    document.getElementById('email').value = cvData.contact.email;
    document.getElementById('linkedin').value = cvData.contact.linkedin;
    document.getElementById('github').value = cvData.contact.github;
    document.getElementById('website').value = cvData.contact.website;
    document.getElementById('twitter').value = cvData.contact.twitter;

    // Summary
    document.getElementById('professionalSummary').value = cvData.summary;
    updateCharacterCount();

    // Dynamic lists
    renderExperienceList();
    renderEducationList();
    renderSkillsList();
    renderProjectsList();
    renderCertificationsList();
    renderAwardsList();

    // Calculate Strength
    calculateStrength();
}

// Collect data from form
function collectFormData() {
    // Personal Info
    cvData.personal.fullName = document.getElementById('fullName').value;
    cvData.personal.jobTitle = document.getElementById('jobTitle').value;
    cvData.personal.age = document.getElementById('age').value;
    cvData.personal.location = document.getElementById('location').value;
    cvData.personal.profileImage = currentProfileImage;

    // Contact Info
    cvData.contact.phone = document.getElementById('phone').value;
    cvData.contact.email = document.getElementById('email').value;
    cvData.contact.linkedin = document.getElementById('linkedin').value;
    cvData.contact.github = document.getElementById('github').value;
    cvData.contact.website = document.getElementById('website').value;
    cvData.contact.twitter = document.getElementById('twitter').value;

    // Summary
    cvData.summary = document.getElementById('professionalSummary').value;

    // Experience
    cvData.experience = collectExperienceData();

    // Education
    cvData.education = collectEducationData();

    // Skills
    cvData.technicalSkills = collectSkillsData('technical');
    cvData.softSkills = collectSkillsData('soft');

    // Projects
    cvData.projects = collectProjectsData();

    // Certifications
    cvData.certifications = collectCertificationsData();

    // Awards
    cvData.awards = collectAwardsData();

    // Design
    if (cvData.design) {
        // Theme is already updated by event listener, but ensuring it persists
        // Font
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) {
            cvData.design.font = fontSelect.value;
        }
    }
}

// ===== AUTO-SAVE =====
var autoSaveTimer = null;
function setupAutoSave() {
    var mainContent = document.querySelector('.dashboard-main');
    if (!mainContent) return;
    mainContent.addEventListener('input', function() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
            if (validateAllFields()) {
                collectFormData();
                localStorage.setItem('cvData', JSON.stringify(cvData));
                calculateStrength();
                updatePreview();
                showAutoSaveIndicator();
            }
        }, 800);
    });
}

function showAutoSaveIndicator() {
    var indicator = document.getElementById('autoSaveIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'autoSaveIndicator';
        indicator.style.cssText = 'position:fixed;top:90px;right:40px;background:rgba(16,185,129,0.9);color:white;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:500;z-index:1001;opacity:0;transition:opacity 0.3s ease;display:flex;align-items:center;gap:8px;pointer-events:none;';
        indicator.innerHTML = '<i class="fas fa-check"></i> Saved';
        document.body.appendChild(indicator);
    }
    indicator.style.opacity = '1';
    setTimeout(function() { indicator.style.opacity = '0'; }, 1500);
}

// ===== STRENGTH METER TIPS =====
function setupStrengthTips() {
    var container = document.querySelector('.strength-meter-container');
    if (!container) return;
    container.style.cursor = 'pointer';
    container.setAttribute('role', 'button');
    container.setAttribute('tabindex', '0');
    container.setAttribute('aria-label', 'CV Strength: click for tips');
    container.addEventListener('click', showStrengthTips);
    container.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showStrengthTips(); }
    });
}

function showStrengthTips() {
    var tips = [];
    if (!cvData.personal.fullName) tips.push('Add your full name');
    if (!cvData.personal.jobTitle) tips.push('Add your job title');
    if (!cvData.contact.email) tips.push('Add your email address');
    if (!cvData.contact.phone && !cvData.contact.linkedin) tips.push('Add at least one contact method (phone or LinkedIn)');
    if (!cvData.summary || cvData.summary.length < 50) tips.push('Write a professional summary (2-3 sentences)');
    if (cvData.experience.length === 0) tips.push('Add at least 1 work experience');
    if (cvData.experience.length < 2) tips.push('Add at least 2 work experiences for a stronger CV');
    if (cvData.education.length === 0) tips.push('Add your education');
    if (cvData.technicalSkills.length === 0 && cvData.softSkills.length === 0) tips.push('Add some skills');
    if (cvData.projects.length === 0) tips.push('Add a project to showcase your work');
    
    if (tips.length === 0) tips.push('Your CV looks great! Consider adding certifications or awards.');
    
    var existing = document.getElementById('strengthTipsPopup');
    if (existing) existing.remove();
    
    var popup = document.createElement('div');
    popup.id = 'strengthTipsPopup';
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1f2937;border:1px solid rgba(124,58,237,0.3);border-radius:16px;padding:24px;max-width:360px;z-index:10000;box-shadow:0 20px 40px rgba(0,0,0,0.5);';
    popup.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h3 style="color:white;font-size:18px;margin:0;">CV Improvement Tips</h3><button onclick="this.closest(\'#strengthTipsPopup\').remove()" style="background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:4px 8px;" aria-label="Close tips">&times;</button></div><ul style="list-style:none;padding:0;margin:0;">' +
        tips.map(function(t) { return '<li style="color:#d1d5db;padding:8px 0;border-bottom:1px solid #374151;font-size:14px;"><i class="fas fa-lightbulb" style="color:#f59e0b;margin-right:8px;"></i>' + t + '</li>'; }).join('') +
        '</ul>';
    
    var backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;';
    backdrop.addEventListener('click', function() { backdrop.remove(); popup.remove(); });
    document.body.appendChild(backdrop);
    document.body.appendChild(popup);
}

// ===== DRAG TO REORDER =====
function setupDragReorder() {
    ['experienceList', 'educationList', 'projectsList'].forEach(function(listId) {
        var container = document.getElementById(listId);
        if (!container) return;
        container.addEventListener('dragstart', function(e) {
            var item = e.target.closest('.dynamic-item');
            if (!item) return;
            item.classList.add('dragging');
            item.setAttribute('draggable', 'true');
            e.dataTransfer.effectAllowed = 'move';
        });
        container.addEventListener('dragend', function(e) {
            var item = e.target.closest('.dynamic-item');
            if (item) item.classList.remove('dragging');
        });
        container.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            var dragging = container.querySelector('.dragging');
            var target = e.target.closest('.dynamic-item');
            if (target && target !== dragging) {
                var rect = target.getBoundingClientRect();
                var midY = rect.top + rect.height / 2;
                if (e.clientY < midY) {
                    container.insertBefore(dragging, target);
                } else {
                    container.insertBefore(dragging, target.nextSibling);
                }
            }
        });
    });
}

// ===== NAVIGATION =====
function setupNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    const sections = document.querySelectorAll('.form-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');

            // Update active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// ===== TABS =====
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.skills-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show target content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab + 'Skills') {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ===== CHARACTER COUNT =====
function setupCharacterCount() {
    const textarea = document.getElementById('professionalSummary');
    textarea.addEventListener('input', updateCharacterCount);
}

function updateCharacterCount() {
    const textarea = document.getElementById('professionalSummary');
    const count = document.getElementById('summaryCount');
    count.textContent = textarea.value.length;
}

// ===== EXPERIENCE MANAGEMENT =====
function renderExperienceList() {
    const container = document.getElementById('experienceList');
    container.innerHTML = '';

    cvData.experience.forEach((exp, index) => {
        const item = createExperienceItem(exp, index);
        container.appendChild(item);
    });
}

function createExperienceItem(exp = {}, index) {
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const logoUrl = exp.logo || exp.companyLogo || exp.file || '';
    const logoName = exp.logoName || exp.fileName || '';
    const logoType = exp.logoType || exp.fileType || '';
    div.innerHTML = `
        <div class="item-header">
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="item-number">Experience #${index + 1}</span>
                <button type="button" class="btn-move" onclick="moveItem('experienceList', ${index}, -1)" title="Move up" aria-label="Move experience up"><i class="fas fa-chevron-up"></i></button>
                <button type="button" class="btn-move" onclick="moveItem('experienceList', ${index}, 1)" title="Move down" aria-label="Move experience down"><i class="fas fa-chevron-down"></i></button>
            </div>
            <button type="button" class="btn-remove" onclick="removeExperience(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        <div draggable="true" class="drag-handle" title="Drag to reorder" aria-label="Drag to reorder"><i class="fas fa-grip-vertical"></i> Drag to reorder</div>
        <div class="form-grid">
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" class="exp-company" value="${sanitizeHTML(exp.company || '')}" placeholder="TechCorp Solutions">
            </div>
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="exp-role" value="${sanitizeHTML(exp.role || '')}" placeholder="Senior Software Engineer">
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="text" class="exp-start" value="${sanitizeHTML(exp.startDate || '')}" placeholder="2021">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="text" class="exp-end" value="${sanitizeHTML(exp.endDate || '')}" placeholder="Present">
            </div>
            <div class="form-group full-width">
                <label>Company Logo (PNG/JPG)</label>
                <input type="file" class="exp-logo" accept="image/*" onchange="handleExperienceLogoUpload(event)" ${logoUrl ? 'data-file="' + logoUrl + '" data-file-name="' + sanitizeHTML(logoName) + '" data-file-type="' + sanitizeHTML(logoType) + '"' : ''}>
                <span class="file-status" style="font-size: 0.85rem; color: #9ca3af; display: block; margin-top: 5px;">
                    ${logoUrl ? 'File: ' + sanitizeHTML(logoName || 'logo') : 'No file selected'}
                </span>
            </div>
            <div class="form-group full-width">
                <label>Key Achievements</label>
                <div class="achievements-container">
                    ${(exp.achievements || []).map((ach, i) => `
                        <div class="achievement-row">
                            <input type="text" class="exp-achievement" value="${sanitizeHTML(ach)}" placeholder="Describe your achievement (quantified)">
                            <button type="button" class="btn-remove" onclick="this.parentElement.remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn-add-achievement" onclick="addAchievementInput(this)">
                    <i class="fas fa-plus"></i> Add Achievement
                </button>
            </div>
        </div>
    `;
    return div;
}

function addExperience() {
    cvData.experience.push({
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        achievements: ['']
    });
    renderExperienceList();
}

function removeExperience(index) {
    cvData.experience.splice(index, 1);
    renderExperienceList();
}

function moveItem(listId, index, direction) {
    var container = document.getElementById(listId);
    var items = container.querySelectorAll('.dynamic-item');
    var newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    
    collectFormData();
    
    var arr;
    if (listId === 'experienceList') arr = cvData.experience;
    else if (listId === 'educationList') arr = cvData.education;
    else if (listId === 'projectsList') arr = cvData.projects;
    else return;
    
    var temp = arr[index];
    arr[index] = arr[newIndex];
    arr[newIndex] = temp;
    
    if (listId === 'experienceList') renderExperienceList();
    else if (listId === 'educationList') renderEducationList();
    else if (listId === 'projectsList') renderProjectsList();
}

function addAchievementInput(button) {
    const container = button.previousElementSibling;
    const div = document.createElement('div');
    div.className = 'achievement-row';
    div.innerHTML = `
        <input type="text" class="exp-achievement" placeholder="Describe your achievement (quantified)">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(div);
}

function collectExperienceData() {
    const items = document.querySelectorAll('#experienceList .dynamic-item');
    return Array.from(items).map(item => {
        const achievements = [];
        item.querySelectorAll('.exp-achievement').forEach(input => {
            if (input.value.trim()) {
                achievements.push(input.value.trim());
            }
        });
        const logoInput = item.querySelector('.exp-logo');
        return {
            company: item.querySelector('.exp-company').value,
            role: item.querySelector('.exp-role').value,
            startDate: item.querySelector('.exp-start').value,
            endDate: item.querySelector('.exp-end').value,
            achievements: achievements,
            logo: logoInput ? logoInput.getAttribute('data-file') : null,
            logoName: logoInput ? logoInput.getAttribute('data-file-name') : null,
            logoType: logoInput ? logoInput.getAttribute('data-file-type') : null,
            file: logoInput ? logoInput.getAttribute('data-file') : null,
            fileName: logoInput ? logoInput.getAttribute('data-file-name') : null,
            fileType: logoInput ? logoInput.getAttribute('data-file-type') : null
        };
    });
}

// ===== EDUCATION MANAGEMENT =====
function renderEducationList() {
    const container = document.getElementById('educationList');
    container.innerHTML = '';

    cvData.education.forEach((edu, index) => {
        const item = createEducationItem(edu, index);
        container.appendChild(item);
    });
}

function handleEduFileUpload(eventOrInput) {
    const input = eventOrInput.target ? eventOrInput.target : eventOrInput;
    const file = (eventOrInput.target ? eventOrInput.target.files[0] : eventOrInput.files[0]);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Max 5MB.');
        input.value = '';
        return;
    }
    const prevUrl = input.getAttribute('data-file');
    if (prevUrl) revokeObjectURL(prevUrl);
    const objectUrl = URL.createObjectURL(file);
    input.setAttribute('data-file', objectUrl);
    input.setAttribute('data-file-name', file.name);
    input.setAttribute('data-file-type', file.type);
    renderDashboardFilePreview(input, objectUrl, file);
    collectFormData();
    localStorage.setItem('cvData', JSON.stringify(cvData));
    updatePreview();
}

function createEducationItem(edu = {}, index) {
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML = `
        <div class="item-header">
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="item-number">Education #${index + 1}</span>
                <button type="button" class="btn-move" onclick="moveItem('educationList', ${index}, -1)" title="Move up" aria-label="Move education up"><i class="fas fa-chevron-up"></i></button>
                <button type="button" class="btn-move" onclick="moveItem('educationList', ${index}, 1)" title="Move down" aria-label="Move education down"><i class="fas fa-chevron-down"></i></button>
            </div>
            <button type="button" class="btn-remove" onclick="removeEducation(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        <div draggable="true" class="drag-handle" title="Drag to reorder" aria-label="Drag to reorder"><i class="fas fa-grip-vertical"></i> Drag to reorder</div>
        <div class="form-grid">
            <div class="form-group full-width">
                <label>Degree/Certificate</label>
                <input type="text" class="edu-degree" value="${sanitizeHTML(edu.degree || '')}" placeholder="Master of Science in Computer Science">
            </div>
            <div class="form-group full-width">
                <label>Institution</label>
                <input type="text" class="edu-institution" value="${sanitizeHTML(edu.institution || '')}" placeholder="Stanford University">
            </div>
            <div class="form-group">
                <label>Graduation Date</label>
                <input type="text" class="edu-date" value="${sanitizeHTML(edu.graduationDate || '')}" placeholder="2016">
            </div>
            <div class="form-group">
                <label>GPA (Optional)</label>
                <input type="text" class="edu-gpa" value="${sanitizeHTML(edu.gpa || '')}" placeholder="3.9">
            </div>
            <div class="form-group full-width">
                <label>Degree File (Image/PDF)</label>
                <input type="file" accept="image/*,.pdf" onchange="handleEduFileUpload(event)" ${edu.file ? 'data-file="' + edu.file + '" data-file-name="' + sanitizeHTML(edu.fileName || '') + '" data-file-type="' + sanitizeHTML(edu.fileType || '') + '"' : ''}>
                <span class="file-status" style="font-size: 0.85rem; color: #9ca3af; display: block; margin-top: 5px;">
                    ${edu.file ? 'File: ' + sanitizeHTML(edu.fileName || 'uploaded') : 'No file selected'}
                </span>
            </div>
        </div>
    `;
    return div;
}

function addEducation() {
    cvData.education.push({
        degree: '',
        institution: '',
        graduationDate: '',
        gpa: '',
        file: null
    });
    renderEducationList();
}

function removeEducation(index) {
    cvData.education.splice(index, 1);
    renderEducationList();
}

function collectEducationData() {
    const items = document.querySelectorAll('#educationList .dynamic-item');
    return Array.from(items).map(item => {
        const inp = item.querySelector('input[type="file"]');
        return {
        degree: item.querySelector('.edu-degree').value,
        institution: item.querySelector('.edu-institution').value,
        graduationDate: item.querySelector('.edu-date').value,
        gpa: item.querySelector('.edu-gpa').value,
        file: inp ? inp.getAttribute('data-file') : null,
        fileName: inp ? inp.getAttribute('data-file-name') : null,
        fileType: inp ? inp.getAttribute('data-file-type') : null
    }});
}

// ===== SKILLS MANAGEMENT =====
function renderSkillsList() {
    // Technical Skills
    const techContainer = document.getElementById('technicalSkillsList');
    techContainer.innerHTML = '';
    cvData.technicalSkills.forEach((skill, index) => {
        techContainer.appendChild(createSkillItem(skill, index, 'technical'));
    });

    // Soft Skills
    const softContainer = document.getElementById('softSkillsList');
    softContainer.innerHTML = '';
    cvData.softSkills.forEach((skill, index) => {
        softContainer.appendChild(createSkillItem(skill, index, 'soft'));
    });
}

function createSkillItem(skill = {}, index, type) {
    var levelLabels = { 1: 'Familiar', 2: 'Proficient', 3: 'Advanced', 4: 'Expert' };
    var currentLevel = skill.level || 2;
    if (typeof currentLevel === 'number' && currentLevel > 4) {
        if (currentLevel <= 25) currentLevel = 1;
        else if (currentLevel <= 60) currentLevel = 2;
        else if (currentLevel <= 85) currentLevel = 3;
        else currentLevel = 4;
    }
    var div = document.createElement('div');
    div.className = 'skill-input-row';
    div.innerHTML = '<div class="form-group" style="margin: 0;">' +
        '<label>Skill Name</label>' +
        '<input type="text" class="skill-name-' + type + '" value="' + sanitizeHTML(skill.name || '') + '" placeholder="Skill Name">' +
        '</div>' +
        '<div class="form-group" style="margin: 0;">' +
        '<label>Level</label>' +
        '<select class="skill-level-' + type + '">' +
        '<option value="1"' + (currentLevel == 1 ? ' selected' : '') + '>Familiar</option>' +
        '<option value="2"' + (currentLevel == 2 ? ' selected' : '') + '>Proficient</option>' +
        '<option value="3"' + (currentLevel == 3 ? ' selected' : '') + '>Advanced</option>' +
        '<option value="4"' + (currentLevel == 4 ? ' selected' : '') + '>Expert</option>' +
        '</select></div>' +
        '<button type="button" class="btn-remove" onclick="removeSkill(this, \'' + type + '\')">' +
        '<i class="fas fa-trash"></i></button>';
    return div;
}

function addSkill(type) {
    const container = document.getElementById(type + 'SkillsList');
    const index = container.children.length;
    container.appendChild(createSkillItem({}, index, type));
}

function removeSkill(button, type) {
    button.parentElement.remove();
}

function collectSkillsData(type) {
    var nameInputs = document.querySelectorAll('.skill-name-' + type);
    var levelInputs = document.querySelectorAll('.skill-level-' + type);
    var skills = [];
    nameInputs.forEach(function(input, index) {
        if (input.value.trim()) {
            skills.push({
                name: input.value.trim(),
                level: parseInt(levelInputs[index].value) || 2
            });
        }
    });
    return skills;
}

// ===== PROJECTS MANAGEMENT =====
function renderProjectsList() {
    const container = document.getElementById('projectsList');
    container.innerHTML = '';

    cvData.projects.forEach((proj, index) => {
        const item = createProjectItem(proj, index);
        container.appendChild(item);
    });
}

function createProjectItem(proj = {}, index) {
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const projFile = proj.file || proj.image || '';
    const projFileName = proj.fileName || proj.imageName || '';
    const projFileType = proj.fileType || proj.imageType || '';
    div.innerHTML = `
        <div class="item-header">
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="item-number">Project #${index + 1}</span>
                <button type="button" class="btn-move" onclick="moveItem('projectsList', ${index}, -1)" title="Move up" aria-label="Move project up"><i class="fas fa-chevron-up"></i></button>
                <button type="button" class="btn-move" onclick="moveItem('projectsList', ${index}, 1)" title="Move down" aria-label="Move project down"><i class="fas fa-chevron-down"></i></button>
            </div>
            <button type="button" class="btn-remove" onclick="removeProject(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        <div draggable="true" class="drag-handle" title="Drag to reorder" aria-label="Drag to reorder"><i class="fas fa-grip-vertical"></i> Drag to reorder</div>
        <div class="form-grid">
            <div class="form-group full-width">
                <label>Project Name</label>
                <input type="text" class="proj-name" value="${sanitizeHTML(proj.name || '')}" placeholder="E-Commerce Platform">
            </div>
            <div class="form-group full-width">
                <label>Description</label>
                <textarea class="proj-desc" rows="3" placeholder="Brief description of the project">${sanitizeHTML(proj.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label>Demo URL</label>
                <input type="url" class="proj-demo" value="${sanitizeHTML(proj.demoUrl || '')}" placeholder="https://demo.com">
            </div>
            <div class="form-group">
                <label>Source Code URL</label>
                <input type="url" class="proj-code" value="${sanitizeHTML(proj.codeUrl || '')}" placeholder="https://github.com">
            </div>
            <div class="form-group full-width">
                <label>Project Image / Logo (PNG/JPG/PDF)</label>
                <input type="file" class="proj-file" accept="image/*,.pdf" onchange="handleProjectImageUpload(event)" ${projFile ? 'data-file="' + projFile + '" data-file-name="' + sanitizeHTML(projFileName) + '" data-file-type="' + sanitizeHTML(projFileType) + '"' : ''}>
                <span class="file-status" style="font-size: 0.85rem; color: #9ca3af; display: block; margin-top: 5px;">${projFile ? 'File: ' + sanitizeHTML(projFileName || 'uploaded') : 'No file selected'}</span>
            </div>
            <div class="form-group full-width">
                <label>Technologies Used (press Enter to add)</label>
                <div class="tech-tags-container" onclick="document.querySelector('.tech-input').focus()">
                    ${(proj.technologies || []).map(tech => `
                        <span class="tech-tag">
                            ${sanitizeHTML(tech)}
                            <i class="fas fa-times remove-tag" onclick="this.parentElement.remove()"></i>
                        </span>
                    `).join('')}
                    <input type="text" class="tech-input" placeholder="Type and press Enter..." 
                        onkeydown="handleTechInput(event, this)">
                </div>
            </div>
        </div>
    `;
    return div;
}

function addProject() {
    cvData.projects.push({
        name: '',
        description: '',
        technologies: [],
        demoUrl: '',
        codeUrl: ''
    });
    renderProjectsList();
}

function removeProject(index) {
    cvData.projects.splice(index, 1);
    renderProjectsList();
}

function handleTechInput(event, input) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const value = input.value.trim();
        if (value) {
            const tag = document.createElement('span');
            tag.className = 'tech-tag';
            tag.innerHTML = `
                ${value}
                <i class="fas fa-times remove-tag" onclick="this.parentElement.remove()"></i>
            `;
            input.parentElement.insertBefore(tag, input);
            input.value = '';
        }
    }
}

function collectProjectsData() {
    const items = document.querySelectorAll('#projectsList .dynamic-item');
    return Array.from(items).map(item => {
        const technologies = [];
        item.querySelectorAll('.tech-tag').forEach(tag => {
            technologies.push(tag.textContent.trim());
        });
        const inp = item.querySelector('.proj-file');
        return {
            name: item.querySelector('.proj-name').value,
            description: item.querySelector('.proj-desc').value,
            demoUrl: item.querySelector('.proj-demo').value,
            codeUrl: item.querySelector('.proj-code').value,
            technologies: technologies,
            file: inp ? inp.getAttribute('data-file') : null,
            fileName: inp ? inp.getAttribute('data-file-name') : null,
            fileType: inp ? inp.getAttribute('data-file-type') : null,
            image: inp ? inp.getAttribute('data-file') : null,
            imageName: inp ? inp.getAttribute('data-file-name') : null,
            imageType: inp ? inp.getAttribute('data-file-type') : null
        };
    });
}

// ===== CERTIFICATIONS MANAGEMENT =====
function renderCertificationsList() {
    const container = document.getElementById('certificationsList');
    container.innerHTML = '';

    cvData.certifications.forEach((cert, index) => {
        const item = createCertificationItem(cert, index);
        container.appendChild(item);
    });
}

function handleCertFileUpload(eventOrInput) {
    const input = eventOrInput.target ? eventOrInput.target : eventOrInput;
    const file = (eventOrInput.target ? eventOrInput.target.files[0] : eventOrInput.files[0]);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Max 5MB.');
        input.value = '';
        return;
    }
    const prevUrl = input.getAttribute('data-file');
    if (prevUrl) revokeObjectURL(prevUrl);
    const objectUrl = URL.createObjectURL(file);
    input.setAttribute('data-file', objectUrl);
    input.setAttribute('data-file-name', file.name);
    input.setAttribute('data-file-type', file.type);
    renderDashboardFilePreview(input, objectUrl, file);
    collectFormData();
    localStorage.setItem('cvData', JSON.stringify(cvData));
    updatePreview();
}

function createCertificationItem(cert = {}, index) {
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML = `
        <div class="item-header">
            <span class="item-number">Certification #${index + 1}</span>
            <button type="button" class="btn-remove" onclick="removeCertification(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group full-width">
                <label>Certification Name</label>
                <input type="text" class="cert-name" value="${sanitizeHTML(cert.name || '')}" placeholder="AWS Solutions Architect">
            </div>
            <div class="form-group">
                <label>Issuing Organization</label>
                <input type="text" class="cert-org" value="${sanitizeHTML(cert.organization || '')}" placeholder="Amazon Web Services">
            </div>
            <div class="form-group">
                <label>Year</label>
                <input type="text" class="cert-year" value="${sanitizeHTML(cert.year || '')}" placeholder="2023">
            </div>
            <div class="form-group full-width">
                <label>Certificate File (Image/PDF)</label>
                <input type="file" accept="image/*,.pdf" onchange="handleCertFileUpload(event)" ${cert.file ? 'data-file="' + cert.file + '" data-file-name="' + sanitizeHTML(cert.fileName || '') + '" data-file-type="' + sanitizeHTML(cert.fileType || '') + '"' : ''}>
                <span class="file-status" style="font-size: 0.85rem; color: #9ca3af; display: block; margin-top: 5px;">
                    ${cert.file ? 'File: ' + sanitizeHTML(cert.fileName || 'uploaded') : 'No file selected'}
                </span>
            </div>
        </div>
    `;
    return div;
}

function addCertification() {
    cvData.certifications.push({
        name: '',
        organization: '',
        year: '',
        file: null
    });
    renderCertificationsList();
}

function removeCertification(index) {
    cvData.certifications.splice(index, 1);
    renderCertificationsList();
}

function collectCertificationsData() {
    const items = document.querySelectorAll('#certificationsList .dynamic-item');
    return Array.from(items).map(item => {
        const inp = item.querySelector('input[type="file"]');
        return {
        name: item.querySelector('.cert-name').value,
        organization: item.querySelector('.cert-org').value,
        year: item.querySelector('.cert-year').value,
        file: inp ? inp.getAttribute('data-file') : null,
        fileName: inp ? inp.getAttribute('data-file-name') : null,
        fileType: inp ? inp.getAttribute('data-file-type') : null
    }});
}

// ===== AWARDS MANAGEMENT =====
function renderAwardsList() {
    const container = document.getElementById('awardsList');
    container.innerHTML = '';

    cvData.awards.forEach((award, index) => {
        const item = createAwardItem(award, index);
        container.appendChild(item);
    });
}

function handleAwardFileUpload(eventOrInput) {
    const input = eventOrInput.target ? eventOrInput.target : eventOrInput;
    const file = (eventOrInput.target ? eventOrInput.target.files[0] : eventOrInput.files[0]);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Max 5MB.');
        input.value = '';
        return;
    }
    const prevUrl = input.getAttribute('data-file');
    if (prevUrl) revokeObjectURL(prevUrl);
    const objectUrl = URL.createObjectURL(file);
    input.setAttribute('data-file', objectUrl);
    input.setAttribute('data-file-name', file.name);
    input.setAttribute('data-file-type', file.type);
    renderDashboardFilePreview(input, objectUrl, file);
    collectFormData();
    localStorage.setItem('cvData', JSON.stringify(cvData));
    updatePreview();
}
function handleExperienceLogoUpload(eventOrInput) {
    const input = eventOrInput.target ? eventOrInput.target : eventOrInput;
    const file = (eventOrInput.target ? eventOrInput.target.files[0] : eventOrInput.files[0]);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File size too large. Max 5MB.'); input.value=''; return; }
    const prevUrl = input.getAttribute('data-file');
    if (prevUrl) revokeObjectURL(prevUrl);
    const objectUrl = URL.createObjectURL(file);
    input.setAttribute('data-file', objectUrl);
    input.setAttribute('data-file-name', file.name);
    input.setAttribute('data-file-type', file.type);
    renderDashboardFilePreview(input, objectUrl, file);
    collectFormData(); localStorage.setItem('cvData', JSON.stringify(cvData)); updatePreview();
}
function handleProjectImageUpload(eventOrInput) {
    const input = eventOrInput.target ? eventOrInput.target : eventOrInput;
    const file = (eventOrInput.target ? eventOrInput.target.files[0] : eventOrInput.files[0]);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File size too large. Max 5MB.'); input.value=''; return; }
    const prevUrl = input.getAttribute('data-file');
    if (prevUrl) revokeObjectURL(prevUrl);
    const objectUrl = URL.createObjectURL(file);
    input.setAttribute('data-file', objectUrl);
    input.setAttribute('data-file-name', file.name);
    input.setAttribute('data-file-type', file.type);
    renderDashboardFilePreview(input, objectUrl, file);
    collectFormData(); localStorage.setItem('cvData', JSON.stringify(cvData)); updatePreview();
}

function createAwardItem(award = {}, index) {
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML = `
        <div class="item-header">
            <span class="item-number">Award #${index + 1}</span>
            <button type="button" class="btn-remove" onclick="removeAward(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group full-width">
                <label>Award Name</label>
                <input type="text" class="award-name" value="${sanitizeHTML(award.name || '')}" placeholder="Employee of the Year">
            </div>
            <div class="form-group">
                <label>Organization</label>
                <input type="text" class="award-org" value="${sanitizeHTML(award.organization || '')}" placeholder="Company Name">
            </div>
            <div class="form-group">
                <label>Year</label>
                <input type="text" class="award-year" value="${sanitizeHTML(award.year || '')}" placeholder="2023">
            </div>
            <div class="form-group full-width">
                <label>Award File (Image/PDF)</label>
                <input type="file" accept="image/*,.pdf" onchange="handleAwardFileUpload(event)" ${award.file ? 'data-file="' + award.file + '" data-file-name="' + sanitizeHTML(award.fileName || '') + '" data-file-type="' + sanitizeHTML(award.fileType || '') + '"' : ''}>
                <span class="file-status" style="font-size: 0.85rem; color: #9ca3af; display: block; margin-top: 5px;">
                    ${award.file ? 'File: ' + sanitizeHTML(award.fileName || 'uploaded') : 'No file selected'}
                </span>
            </div>
        </div>
    `;
    return div;
}

function addAward() {
    cvData.awards.push({
        name: '',
        organization: '',
        year: '',
        file: null
    });
    renderAwardsList();
}

function removeAward(index) {
    cvData.awards.splice(index, 1);
    renderAwardsList();
}

function collectAwardsData() {
    const items = document.querySelectorAll('#awardsList .dynamic-item');
    return Array.from(items).map(item => {
        const inp = item.querySelector('input[type="file"]');
        return {
        name: item.querySelector('.award-name').value,
        organization: item.querySelector('.award-org').value,
        year: item.querySelector('.award-year').value,
        file: inp ? inp.getAttribute('data-file') : null,
        fileName: inp ? inp.getAttribute('data-file-name') : null,
        fileType: inp ? inp.getAttribute('data-file-type') : null
    }});
}

// ===== DATA PERSISTENCE =====

// ===== LIVE PREVIEW =====
function togglePreview() {
    const container = document.querySelector('.dashboard-container');
    container.classList.toggle('split-view');
    const isSplit = container.classList.contains('split-view');
    document.querySelectorAll('.nav-actions a[href="index.html"], .nav-actions button[onclick="exportStaticWebsite()"], .dashboard-footer a[href="index.html"]').forEach(function(el){
        el.style.display = isSplit ? 'none' : '';
    });
    if (isSplit) {
        updatePreview();
    }
}

function updatePreview() {
    const frame = document.getElementById('previewFrame');
    if (frame) {
        frame.src = frame.src; // Reloads the iframe
    }
}
function applyLightDark(mode) {
    var m = mode === 'light' ? 'light' : 'dark';
    document.body.setAttribute('data-mode', m);
    var icon = document.querySelector('#dashThemeToggle i, #themeToggle i');
    if (icon) icon.className = m === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    try { localStorage.setItem('themeMode', m); cvData.design = cvData.design || {}; cvData.design.mode = m; localStorage.setItem('cvData', JSON.stringify(cvData)); var f = document.getElementById('previewFrame'); if (f && f.contentWindow) { try { f.contentWindow.document.body.setAttribute('data-mode', m); } catch(e){} } } catch(e){}
}
function toggleLightDark() {
    var cur = document.body.getAttribute('data-mode') || localStorage.getItem('themeMode') || 'dark';
    applyLightDark(cur === 'dark' ? 'light' : 'dark');
}
(function initDashLightDark(){
    var saved = (cvData && cvData.design && cvData.design.mode) || localStorage.getItem('themeMode') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyLightDark(saved);
})();

// ===== CV STRENGTH METER =====
function calculateStrength() {
    let score = 0;
    let total = 0;

    // Weights
    const weights = {
        personal: 15,
        contact: 15,
        summary: 10,
        experience: 20,
        education: 15,
        skills: 15,
        projects: 10
    };

    // Personal (15)
    total += weights.personal;
    if (cvData.personal.fullName) score += 5;
    if (cvData.personal.jobTitle) score += 5;
    if (cvData.personal.profileImage) score += 5;

    // Contact (15)
    total += weights.contact;
    if (cvData.contact.email) score += 5;
    if (cvData.contact.phone) score += 5;
    if (cvData.contact.linkedin || cvData.contact.github) score += 5;

    // Summary (10)
    total += weights.summary;
    if (cvData.summary && cvData.summary.length > 50) score += 10;

    // Experience (20)
    total += weights.experience;
    if (cvData.experience.length > 0) score += 20;

    // Education (15)
    total += weights.education;
    if (cvData.education.length > 0) score += 15;

    // Skills (15)
    total += weights.skills;
    if (cvData.technicalSkills.length > 0 || cvData.softSkills.length > 0) score += 15;

    // Projects (10)
    total += weights.projects;
    if (cvData.projects.length > 0) score += 10;

    // Update UI
    const percentage = Math.round((score / total) * 100);
    const bar = document.getElementById('strengthBar');
    const text = document.getElementById('strengthText');

    if (bar) {
        bar.style.width = percentage + '%';

        // Color coding
        if (percentage < 40) {
            bar.style.background = '#ef4444'; // Red
        } else if (percentage < 70) {
            bar.style.background = '#f59e0b'; // Orange
        } else {
            bar.style.background = '#10b981'; // Green
        }
    }

    if (text) text.textContent = percentage + '%';
}

// ===== EXPORT STATIC WEBSITE =====
// ============================================
// EXPORT STATIC WEBSITE FUNCTION
// ============================================

async function exportStaticWebsite() {
    var allBtns = document.querySelectorAll('button[onclick="exportStaticWebsite()"]');
    var btn = null;
    allBtns.forEach(function(b) { if (b.offsetParent !== null) btn = b; });
    var originalText = btn ? btn.innerHTML : '';

    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        btn.disabled = true;
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
    }
}

// Helper: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}