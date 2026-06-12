# How to Host Your CV Website on GitHub Pages

This guide will walk you through publishing your CV website for free using **GitHub Pages**.

## 📋 Prerequisites
- A GitHub account (free at [github.com](https://github.com))
- Your CV website files ready
- Git installed on your computer (optional - you can also use GitHub's web interface)

## 🚀 Method 1: Using GitHub Desktop (Easiest)

### Step 1: Create a New Repository
1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name your repository: `yourusername.github.io` (replace "yourusername" with your actual GitHub username)
   - Example: If your username is "johndoe", name it `johndoe.github.io`
4. Make it **Public**
5. Check **Add a README file**
6. Click **Create repository**

### Step 2: Download GitHub Desktop
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in with your GitHub account

### Step 3: Clone Your Repository
1. In GitHub Desktop: **File** → **Clone repository**
2. Select your `yourusername.github.io` repository
3. Choose a local path (e.g., `C:\Users\YourName\Documents\GitHub`)
4. Click **Clone**

### Step 4: Add Your CV Files
1. Open the cloned folder on your computer
2. Copy ALL your CV website files into this folder:
   - index.html
   - dashboard.html
   - style.css
   - dashboard.css
   - script.js
   - dashboard.js
   - README.md
   - Any images you uploaded

### Step 5: Commit and Push
1. Open GitHub Desktop
2. You'll see all your files listed under "Changes"
3. Add a commit message: "Initial CV website upload"
4. Click **Commit to main**
5. Click **Push origin**

### Step 6: Enable GitHub Pages
1. Go to your repository on GitHub.com
2. Click **Settings** (tab at the top)
3. Scroll down to **Pages** section (left sidebar)
4. Under "Source", select **Deploy from a branch**
5. Select **main** branch and **/ (root)** folder
6. Click **Save**

### Step 7: Wait and Access
- Wait 2-5 minutes for GitHub to build your site
- Your CV will be live at: `https://yourusername.github.io`
- Example: `https://johndoe.github.io`

## 💻 Method 2: Using Git Command Line

### Step 1: Create Repository (same as above)

### Step 2: Initialize Git and Push
Open terminal/command prompt in your CV folder:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial CV website upload"

# Connect to GitHub (replace with your username)
git remote add origin https://github.com/yourusername/yourusername.github.io.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages (same as above)

## 🌐 Method 3: Direct Upload on GitHub Website

1. Create repository named `yourusername.github.io`
2. Click **Add file** → **Upload files**
3. Drag and drop all your CV files
4. Add commit message and click **Commit changes**
5. Go to Settings → Pages → Enable GitHub Pages

## 📝 Important Notes

### Repository Name MATTERS
- **For user site**: Must be `yourusername.github.io`
- **For project site**: Can be any name, but URL will be `yourusername.github.io/repository-name`

### What Gets Published
- Only files in the `main` branch are published
- `index.html` at the root is the homepage
- Changes take 2-5 minutes to appear after pushing

### Custom Domain (Optional)
1. Buy a domain (from Namecheap, GoDaddy, etc.)
2. Add a file named `CNAME` to your repository with your domain
3. Configure DNS settings with your domain provider
4. Enable custom domain in GitHub Pages settings

## 🔧 Troubleshooting

### Site not showing?
- Wait 5 minutes (GitHub Pages takes time to build)
- Check that repository is **Public**
- Ensure `index.html` exists at the root
- Check repository name is correct

### Images not loading?
- Make sure image files are in the repository
- Use relative paths: `images/photo.jpg` not `C:\Users\...`
- Check file names are exact (case-sensitive on web servers)

### Changes not updating?
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check that you pushed to the correct branch
- Verify in GitHub Pages settings that it's using the main branch

### Getting 404 error?
- Make sure `index.html` is at the root level
- Check repository is set to Public
- Verify GitHub Pages is enabled in Settings

## 🎨 Tips for Best Results

1. **Test locally first**: Open `index.html` in your browser before uploading
2. **Use relative paths**: `./style.css` instead of full file paths
3. **Optimize images**: Compress images to load faster
4. **Keep it simple**: Avoid server-side code (PHP, Node.js) - static HTML only
5. **Mobile test**: Check your site on mobile devices
6. **Update regularly**: Push updates anytime you change your CV

## 🚀 Next Steps

After hosting your CV:
1. **Share the link** on LinkedIn, Twitter, email signature
2. **Add to resume**: Include `yourusername.github.io` as your portfolio
3. **Update content** using your dashboard.html
4. **Monitor traffic** with Google Analytics (optional)

## 📞 Need Help?

- GitHub Pages documentation: [docs.github.com/pages](https://docs.github.com/en/pages)
- Common issues: [GitHub Community](https://github.community/)

---

**Good luck with your online CV! 🎉**