// ===== DASHBOARD JAVASCRIPT =====
// Handles form data, localStorage, and dynamic form elements

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
        { name: 'JavaScript / TypeScript', level: 95 },
        { name: 'React / Next.js', level: 90 },
        { name: 'Node.js / Express', level: 88 },
        { name: 'Python / Django', level: 82 },
        { name: 'AWS / Cloud Services', level: 78 }
    ],
    softSkills: [
        { name: 'Leadership', level: 92 },
        { name: 'Communication', level: 88 },
        { name: 'Problem Solving', level: 95 },
        { name: 'Team Collaboration', level: 90 },
        { name: 'Project Management', level: 85 }
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
});

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

function setupImageUpload() {
    const fileInput = document.getElementById('profileImage');

    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file (JPG, PNG, or GIF)');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onload = function (event) {
                currentProfileImage = event.target.result;
                updateImagePreview(currentProfileImage);
            };
            reader.onerror = function () {
                alert('Error reading image file. Please try again.');
            };
            reader.readAsDataURL(file);
        }
    });
}

function updateImagePreview(imageSrc) {
    const previewImg = document.getElementById('previewImg');
    if (previewImg && imageSrc) {
        previewImg.src = imageSrc;
    }
}

function removeProfileImage() {
    currentProfileImage = '';
    document.getElementById('profileImage').value = '';
    updateImagePreview('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop');
}

// Load data from localStorage or use defaults
function loadData() {
    const savedData = localStorage.getItem('cvData');
    if (savedData) {
        cvData = JSON.parse(savedData);
    } else {
        cvData = JSON.parse(JSON.stringify(defaultData));
    }
    populateForm();
}

// Save data to localStorage
function saveAllData(silent = false) {
    collectFormData();
    localStorage.setItem('cvData', JSON.stringify(cvData));
    calculateStrength();
    updatePreview();
    if (!silent) {
        showSuccessMessage();
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
    div.innerHTML = `
        <div class="item-header">
            <span class="item-number">Experience #${index + 1}</span>
            <button type="button" class="btn-remove" onclick="removeExperience(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" class="exp-company" value="${exp.company || ''}" placeholder="TechCorp Solutions">
            </div>
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="exp-role" value="${exp.role || ''}" placeholder="Senior Software Engineer">
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="text" class="exp-start" value="${exp.startDate || ''}" placeholder="2021">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="text" class="exp-end" value="${exp.endDate || ''}" placeholder="Present">
            </div>
            <div class="form-group full-width">
                <label>Key Achievements</label>
                <div class="achievements-container">
                    ${(exp.achievements || []).map((ach, i) => `
                        <div class="achievement-row">
                            <input type="text" class="exp-achievement" value="${ach}" placeholder="Describe your achievement (quantified)">
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

        return {
            company: item.querySelector('.exp-company').value,
            role: item.querySelector('.exp-role').value,
            startDate: item.querySelector('.exp-start').value,
            endDate: item.querySelector('.exp-end').value,
            achievements: achievements
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

function createEducationItem(edu = {}, index) {
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML = `
        <div class="item-header">
            <span class="item-number">Education #${index + 1}</span>
            <button type="button" class="btn-remove" onclick="removeEducation(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group full-width">
                <label>Degree/Certificate</label>
                <input type="text" class="edu-degree" value="${edu.degree || ''}" placeholder="Master of Science in Computer Science">
            </div>
            <div class="form-group full-width">
                <label>Institution</label>
                <input type="text" class="edu-institution" value="${edu.institution || ''}" placeholder="Stanford University">
            </div>
            <div class="form-group">
                <label>Graduation Date</label>
                <input type="text" class="edu-date" value="${edu.graduationDate || ''}" placeholder="2016">
            </div>
            <div class="form-group">
                <label>GPA (Optional)</label>
                <input type="text" class="edu-gpa" value="${edu.gpa || ''}" placeholder="3.9">
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
        gpa: ''
    });
    renderEducationList();
}

function removeEducation(index) {
    cvData.education.splice(index, 1);
    renderEducationList();
}

function collectEducationData() {
    const items = document.querySelectorAll('#educationList .dynamic-item');
    return Array.from(items).map(item => ({
        degree: item.querySelector('.edu-degree').value,
        institution: item.querySelector('.edu-institution').value,
        graduationDate: item.querySelector('.edu-date').value,
        gpa: item.querySelector('.edu-gpa').value
    }));
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
    const div = document.createElement('div');
    div.className = 'skill-input-row';
    div.innerHTML = `
        <div class="form-group" style="margin: 0;">
            <input type="text" class="skill-name-${type}" value="${skill.name || ''}" placeholder="Skill Name">
        </div>
        <div class="form-group" style="margin: 0;">
            <input type="range" class="skill-level-${type}" value="${skill.level || 50}" min="0" max="100" 
                oninput="this.nextElementSibling.textContent = this.value + '%'">
        </div>
        <div class="range-value">${skill.level || 50}%</div>
        <button type="button" class="btn-remove" onclick="removeSkill(this, '${type}')">
            <i class="fas fa-trash"></i>
        </button>
    `;
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
    const nameInputs = document.querySelectorAll(`.skill-name-${type}`);
    const levelInputs = document.querySelectorAll(`.skill-level-${type}`);

    const skills = [];
    nameInputs.forEach((input, index) => {
        if (input.value.trim()) {
            skills.push({
                name: input.value.trim(),
                level: parseInt(levelInputs[index].value)
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
    div.innerHTML = `
        <div class="item-header">
            <span class="item-number">Project #${index + 1}</span>
            <button type="button" class="btn-remove" onclick="removeProject(${index})">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group full-width">
                <label>Project Name</label>
                <input type="text" class="proj-name" value="${proj.name || ''}" placeholder="E-Commerce Platform">
            </div>
            <div class="form-group full-width">
                <label>Description</label>
                <textarea class="proj-desc" rows="3" placeholder="Brief description of the project">${proj.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Demo URL</label>
                <input type="url" class="proj-demo" value="${proj.demoUrl || ''}" placeholder="https://demo.com">
            </div>
            <div class="form-group">
                <label>Source Code URL</label>
                <input type="url" class="proj-code" value="${proj.codeUrl || ''}" placeholder="https://github.com">
            </div>
            <div class="form-group full-width">
                <label>Technologies Used (press Enter to add)</label>
                <div class="tech-tags-container" onclick="document.querySelector('.tech-input').focus()">
                    ${(proj.technologies || []).map(tech => `
                        <span class="tech-tag">
                            ${tech}
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

        return {
            name: item.querySelector('.proj-name').value,
            description: item.querySelector('.proj-desc').value,
            demoUrl: item.querySelector('.proj-demo').value,
            codeUrl: item.querySelector('.proj-code').value,
            technologies: technologies
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
                <input type="text" class="cert-name" value="${cert.name || ''}" placeholder="AWS Solutions Architect">
            </div>
            <div class="form-group">
                <label>Issuing Organization</label>
                <input type="text" class="cert-org" value="${cert.organization || ''}" placeholder="Amazon Web Services">
            </div>
            <div class="form-group">
                <label>Year</label>
                <input type="text" class="cert-year" value="${cert.year || ''}" placeholder="2023">
            </div>
        </div>
    `;
    return div;
}

function addCertification() {
    cvData.certifications.push({
        name: '',
        organization: '',
        year: ''
    });
    renderCertificationsList();
}

function removeCertification(index) {
    cvData.certifications.splice(index, 1);
    renderCertificationsList();
}

function collectCertificationsData() {
    const items = document.querySelectorAll('#certificationsList .dynamic-item');
    return Array.from(items).map(item => ({
        name: item.querySelector('.cert-name').value,
        organization: item.querySelector('.cert-org').value,
        year: item.querySelector('.cert-year').value
    }));
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
                <input type="text" class="award-name" value="${award.name || ''}" placeholder="Employee of the Year">
            </div>
            <div class="form-group">
                <label>Organization</label>
                <input type="text" class="award-org" value="${award.organization || ''}" placeholder="Company Name">
            </div>
            <div class="form-group">
                <label>Year</label>
                <input type="text" class="award-year" value="${award.year || ''}" placeholder="2023">
            </div>
        </div>
    `;
    return div;
}

function addAward() {
    cvData.awards.push({
        name: '',
        organization: '',
        year: ''
    });
    renderAwardsList();
}

function removeAward(index) {
    cvData.awards.splice(index, 1);
    renderAwardsList();
}

function collectAwardsData() {
    const items = document.querySelectorAll('#awardsList .dynamic-item');
    return Array.from(items).map(item => ({
        name: item.querySelector('.award-name').value,
        organization: item.querySelector('.award-org').value,
        year: item.querySelector('.award-year').value
    }));
}

// ===== DATA PERSISTENCE =====
function exportData() {
    const dataStr = JSON.stringify(cvData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'cv-builder-backup.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const contents = e.target.result;
            cvData = JSON.parse(contents);
            saveAllData(); // Save to local storage
            populateForm(); // Refresh UI
            alert('Data imported successfully!');
        } catch (err) {
            alert('Error importing data: ' + err.message);
        }
    };
    reader.readAsText(file);
    input.value = ''; // Reset input
}

// ===== LIVE PREVIEW =====
function togglePreview() {
    const container = document.querySelector('.dashboard-container');
    container.classList.toggle('split-view');

    // Refresh preview when opening
    if (container.classList.contains('split-view')) {
        updatePreview();
    }
}

function updatePreview() {
    const frame = document.getElementById('previewFrame');
    if (frame) {
        frame.src = frame.src; // Reloads the iframe
    }
}

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