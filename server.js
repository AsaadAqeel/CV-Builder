const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

let browser = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

function compileTemplate(data) {
  let html = fs.readFileSync(path.join(__dirname, 'cv-template.html'), 'utf8');
  
  const replacements = {
    '{{name}}': data.name || '',
    '{{email}}': data.email || '',
    '{{phone}}': data.phone || '',
    '{{summary}}': data.summary || '',
    '{{initials}}': data.name ? data.name.split(' ').map(n => n[0]).join('').substring(0, 2) : ''
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(key, 'g'), value);
  }

  if (data.skills && data.skills.length > 0) {
    const skillsHtml = data.skills.map(skill => `
      <div class="skill-item">
        <div class="skill-name">${skill}</div>
        <div class="skill-bar">
          <div class="skill-level" style="width: 100%"></div>
        </div>
      </div>
    `).join('');
    html = html.replace(/{{#skills}}[\s\S]*?{{\/skills}}/, skillsHtml);
  } else {
    html = html.replace(/{{#skills}}[\s\S]*?{{\/skills}}/, '');
  }

  if (data.experience && data.experience.length > 0) {
    const expHtml = data.experience.map(exp => `
      <div class="experience-item">
        <div class="job-title">${exp.jobTitle || ''}</div>
        <div class="company">${exp.company || ''}</div>
        <div class="job-description">${exp.description || ''}</div>
      </div>
    `).join('');
    html = html.replace(/{{#experience}}[\s\S]*?{{\/experience}}/, expHtml);
  } else {
    html = html.replace(/{{#experience}}[\s\S]*?{{\/experience}}/, '');
  }

  if (data.education && data.education.length > 0) {
    const eduHtml = data.education.map(edu => `
      <div class="education-item">
        <div class="degree">${edu.degree || ''}</div>
        <div class="institution">${edu.institution || ''}</div>
        <div class="year">${edu.year || ''}</div>
      </div>
    `).join('');
    html = html.replace(/{{#education}}[\s\S]*?{{\/education}}/, eduHtml);
  } else {
    html = html.replace(/{{#education}}[\s\S]*?{{\/education}}/, '');
  }

  if (data.languages && data.languages.length > 0) {
    const langHtml = data.languages.map(lang => `<div>${lang}</div>`).join('');
    html = html.replace(/{{#languages}}[\s\S]*?{{\/languages}}/, langHtml);
  } else {
    html = html.replace(/{{#languages}}[\s\S]*?{{\/languages}}/, '');
  }

  if (data.summary) {
    html = html.replace(/{{#summary}}[\s\S]*?{{\/summary}}/, `
      <div class="section">
        <div class="section-title">ملخص</div>
        <div class="summary-text">${data.summary}</div>
      </div>
    `);
  } else {
    html = html.replace(/{{#summary}}[\s\S]*?{{\/summary}}/, '');
  }

  return html;
}

app.post('/generate-cv', async (req, res) => {
  try {
    const cvData = req.body;
    
    if (!cvData.name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const html = compileTemplate(cvData);
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      }
    });

    await page.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="cv.pdf"');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating CV:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Use POST /generate-cv to generate CV PDF`);
});

process.on('exit', async () => {
  if (browser) await browser.close();
});