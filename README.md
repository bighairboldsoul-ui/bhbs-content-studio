# BHBS Content Studio

AI-powered content production for Big Hair, Bold Soul.

## What It Does

- **Create**: Pick a brand mode and describe your idea. Get a complete TikTok script, caption, graphic text, hook, and CTA.
- **Check Fit**: Validate any idea against 7 BHBS brand rules before posting.
- **Idea Bank**: Save all your generated content, track what you've posted, never lose an idea.

## Deploy to Vercel (FREE)

This is a Next.js app that deploys free to Vercel. Takes 10 minutes.

### Step 1: Create a GitHub Account (If You Don't Have One)
1. Go to **github.com**
2. Click "Sign Up"
3. Fill in your info (use your Google account if easier)
4. Verify your email

### Step 2: Upload Your Code to GitHub
1. Go to **github.com** and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it: `bhbs-content-studio`
4. Click **Create repository**
5. GitHub will show you commands. You'll upload the code:
   - Download this entire folder to your computer
   - Open Terminal/Command Prompt
   - Navigate to the folder: `cd bhbs-content-studio`
   - Run these commands:
     ```
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/bhbs-content-studio.git
     git push -u origin main
     ```
   (Replace YOUR_USERNAME with your actual GitHub username)

### Step 3: Deploy to Vercel
1. Go to **vercel.com**
2. Click **Sign Up** → use your GitHub account
3. Click **New Project**
4. Find and click your `bhbs-content-studio` repository
5. Click **Import**
6. Vercel auto-detects it's a Next.js project — just click **Deploy**
7. Wait 2-3 minutes
8. You get a live URL like `bhbs-content-studio.vercel.app`

That's it. Your app is live forever. Bookmark the URL.

## Local Development

If you want to run it on your computer first:

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## How to Use

**Create Content:**
1. Click "Create"
2. Pick your mode (Observer, Translator, Designer, Reprogrammer, Dreamer)
3. Describe your idea in 1-2 sentences
4. Claude generates a complete script, caption, graphic text, and call to action
5. Click "Save to Idea Bank"

**Check if an Idea Fits BHBS:**
1. Click "Check Fit"
2. Paste your idea or draft
3. Get a verdict (Fits / Adjust / Not Yet) with a score and specific suggestion

**Track Your Content:**
1. Click "Bank"
2. See all your saved ideas
3. Mark them "Posted" as you publish
4. Delete old ones

## Notes

- All your ideas are saved locally in your browser (they don't go anywhere)
- Each time you generate content, it uses Claude's API (small cost: ~$0.01 per generation)
- You can use it offline after the first load

---

Built for Big Hair, Bold Soul. Styles and systems. Clarity over chaos.
