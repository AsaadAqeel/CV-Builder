# CV Website - Customization Guide
https://asaadaqeel.github.io/CV-Builder/
A modern, responsive CV/Resume website with animated skill bars and a beautiful color scheme.

## 🎨 Color Scheme
- **Violet Purple**: Primary accent color
- **Veronica**: Secondary purple
- **Blue**: Complementary accent
- **Red**: Highlights and call-to-action
- **Black & White**: Base colors for contrast

## 📁 File Structure
```
CV/
├── index.html          # Main CV website
├── dashboard.html      # Editor for managing CV content
├── style.css           # Styling and animations
├── dashboard.css       # Dashboard-specific styles
├── script.js           # CV interactivity and animations
├── dashboard.js        # Dashboard functionality
├── GITHUB_GUIDE.md     # 📖 Guide to host on GitHub Pages (READ THIS!)
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## 🌐 Host Your CV Online (FREE!)

Want to share your CV with a professional URL? Host it on **GitHub Pages** for free!

### Quick Steps:
1. Create a GitHub repository named `yourusername.github.io`
2. Upload all your CV files to the repository
3. Enable GitHub Pages in Settings
4. Your CV will be live at `https://yourusername.github.io`

📖 **Detailed Guide**: See [GITHUB_GUIDE.md](GITHUB_GUIDE.md) for step-by-step instructions with screenshots!

## 🚀 How to Use

### Method 1: Using the Dashboard Editor (Recommended) ✨

1. Open `dashboard.html` in your web browser
2. Fill in all your information using the form
3. Click "Save Changes" to store your data
4. Click "View CV" to see your updated CV

**The dashboard allows you to easily edit:**
- ✅ Personal Information (Name, Age, Job Title, Location, **Profile Photo Upload**)
- ✅ Contact Details (Phone, Email, LinkedIn, GitHub, Website, Twitter)
- ✅ Professional Summary
- ✅ Work Experience (Add/Remove multiple jobs)
- ✅ Education (Add/Remove multiple degrees)
- ✅ Skills with animated progress bars (Technical & Soft skills)
- ✅ Projects with technology tags
- ✅ Certifications
- ✅ Awards & Achievements

All data is saved to your browser's localStorage, so it persists between sessions!

### Method 2: Manual Editing (Advanced)

### 2. Customize Your Information

#### Personal Information (Header Section)
Edit `index.html` around line 42-48:
```html
<div class="hero-text">
    <h1>YOUR NAME HERE</h1>
    <p class="tagline">YOUR JOB TITLE</p>
    <p class="location"><i class="fas fa-map-marker-alt"></i> YOUR LOCATION</p>
</div>
```

#### Contact Information
Edit `index.html` around line 60-78:
```html
<a href="tel:+1234567890" class="contact-item">
    <span>YOUR PHONE NUMBER</span>
</a>
<a href="mailto:your.email@example.com" class="contact-item">
    <span>YOUR EMAIL</span>
</a>
<a href="https://linkedin.com/in/yourprofile" target="_blank" class="contact-item">
    <span>YOUR LINKEDIN URL</span>
</a>
<a href="https://github.com/yourusername" target="_blank" class="contact-item">
    <span>YOUR GITHUB URL</span>
</a>
```

#### Professional Summary
Edit `index.html` around line 85-89:
```html
<p class="summary-text">
    YOUR PROFESSIONAL SUMMARY HERE...
</p>
```

#### Work Experience
Edit the experience cards in `index.html` starting around line 97. Add or remove cards as needed:
```html
<div class="experience-card">
    <div class="experience-header">
        <div class="company-info">
            <h3>COMPANY NAME</h3>
            <span class="role">YOUR JOB TITLE</span>
        </div>
        <span class="date">START DATE - END DATE</span>
    </div>
    <ul class="achievements">
        <li>Your achievement here (quantified)</li>
        <li>Another achievement</li>
    </ul>
</div>
```

#### Skills
Edit `index.html` around line 140-185. Modify skill names and percentages:
```html
<div class="skill-item">
    <div class="skill-info">
        <span>SKILL NAME</span>
        <span>PERCENTAGE%</span>
    </div>
    <div class="skill-bar">
        <div class="skill-progress" data-progress="85"></div>
    </div>
</div>
```
**Note**: Make sure the `data-progress` attribute matches the percentage number.

#### Education
Edit `index.html` around line 200-220:
```html
<div class="education-card">
    <div class="edu-content">
        <h3>YOUR DEGREE</h3>
        <p class="institution">UNIVERSITY NAME</p>
        <p class="grad-date">GRADUATION DATE</p>
        <p class="gpa">GPA: X.X/4.0</p>
    </div>
</div>
```

#### Certifications
Edit `index.html` around line 230-250:
```html
<div class="cert-card">
    <h3>CERTIFICATION NAME</h3>
    <p>ISSUING ORGANIZATION</p>
    <span class="cert-date">YEAR</span>
</div>
```

#### Projects
Edit `index.html` around line 265-295:
```html
<div class="project-card">
    <div class="project-content">
        <h3>PROJECT NAME</h3>
        <p>Project description</p>
        <div class="project-tech">
            <span>TECH 1</span>
            <span>TECH 2</span>
        </div>
        <div class="project-links">
            <a href="DEMO_URL" class="btn-small">View Demo</a>
            <a href="GITHUB_URL" class="btn-small btn-outline">Source Code</a>
        </div>
    </div>
</div>
```

#### Awards & Achievements
Edit `index.html` around line 315-335:
```html
<div class="award-card">
    <div class="award-content">
        <h3>AWARD NAME</h3>
        <p>ISSUING ORGANIZATION</p>
        <span class="award-year">YEAR</span>
    </div>
</div>
```

### 3. Change Profile Picture

To use your own photo:
1. Replace the image URL in line 51:
```html
<img src="YOUR_IMAGE_URL_HERE" alt="Profile">
```
Or use a local image:
```html
<img src="images/profile.jpg" alt="Profile">
```

### 4. Add/Remove Sections

To remove a section, simply delete the entire `<section>` element from `index.html`.

To add a new section, copy an existing section and modify the content.

## 🎨 Customizing Colors

To change the color scheme, edit `style.css` and modify the CSS variables at the top:

```css
:root {
    --violet: #7c3aed;        /* Main purple */
    --violet-light: #8b5cf6;  /* Light purple */
    --violet-dark: #5b21b6;   /* Dark purple */
    --veronic: #a855f7;       /* Veronica purple */
    --blue: #3b82f6;          /* Blue accent */
    --blue-light: #60a5fa;    /* Light blue */
    --red: #ef4444;           /* Red accent */
    --red-light: #f87171;     /* Light red */
    --black: #0f0f0f;         /* Background */
    --white: #ffffff;         /* Text */
}
```

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

No additional changes needed!

## 🖨️ Print Your CV

Click the "Download CV" button or press `Ctrl+P` (Windows) / `Cmd+P` (Mac) to print or save as PDF.

## ✨ Features Included

- ✅ **Profile photo upload** - Upload images directly from your PC
- ✅ Animated skill bars with percentage indicators
- ✅ Smooth scrolling navigation
- ✅ Scroll reveal animations
- ✅ Hover effects on all interactive elements
- ✅ Mobile-responsive hamburger menu
- ✅ Print-friendly styles
- ✅ Gradient backgrounds and modern typography
- ✅ Font Awesome icons
- ✅ Parallax background effects
- ✅ Typing effect on tagline

## 🔗 Useful Links

- [Font Awesome Icons](https://fontawesome.com/icons) - Find more icons
- [Google Fonts](https://fonts.google.com) - Change the font
- [Unsplash](https://unsplash.com) - Free stock photos

## 💡 Tips

1. **Keep it concise**: Don't overload with too much text
2. **Use metrics**: Quantify achievements (e.g., "increased revenue by 40%")
3. **Update regularly**: Keep your CV current
4. **Test links**: Make sure all contact links work properly
5. **Optimize images**: Use compressed images for faster loading

## 🐛 Troubleshooting

**Images not loading?**
- Check that the image URL is correct
- For local images, ensure the path is correct

**Styles not applying?**
- Make sure `style.css` is in the same folder as `index.html`
- Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)

**Animations not working?**
- Ensure `script.js` is properly linked
- Check browser console for errors (F12)

## 📧 Questions?

If you have any questions or need help customizing, feel free to reach out!

---

## 🎛️ Dashboard Features

The Dashboard Editor makes customizing your CV super easy:

### Navigation
- **Sidebar Menu**: Navigate between different sections
- **Save Button**: Save all changes with one click
- **Preview Button**: View your CV in real-time

### Profile Photo Upload
- **Easy Upload**: Click "Choose Image" to upload from your PC
- **Live Preview**: See your photo in a circular preview
- **Remove Option**: Reset to default image anytime
- **Supported Formats**: JPG, PNG, GIF (max 5MB)
- **Stored Locally**: Image is saved as base64 in your browser

### Adding/Removing Items
- **Dynamic Lists**: Add unlimited work experiences, education, skills, projects, certifications, and awards
- **Remove Button**: Delete any item you don't need
- **Technology Tags**: Add multiple technologies to projects (press Enter to add)

### Skill Progress Bars
- **Range Sliders**: Adjust skill proficiency from 0-100%
- **Live Preview**: See the percentage update as you drag
- **Two Categories**: Separate technical and soft skills

### Data Persistence
- **Auto-save to localStorage**: Your data is saved in your browser
- **No server needed**: Everything works offline
- **Clear data**: To reset, clear browser localStorage for this site

## 🔒 Privacy Note

All your data is stored **locally in your browser** using localStorage. It never leaves your computer or is sent to any server. To share your CV, simply open `index.html` and use the browser's print-to-PDF feature.

## 🔄 Quick Start Guide

1. **Open `dashboard.html`**
2. **Fill in your personal info** in the "Personal Info" tab
3. **Add your work experience** in the "Work Experience" tab (click "Add Experience" for multiple jobs)
4. **Add your skills** with percentages in the "Skills" tab
5. **Save your changes** with the green "Save All Changes" button
6. **View your CV** by clicking "View CV" or opening `index.html`
7. **Print to PDF** when ready to share

---

**Happy job hunting! 🚀**
