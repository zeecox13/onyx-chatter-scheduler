# Deploy to GitHub and Vercel

## 1. Push to GitHub

### Option A: Create repo on GitHub, then push

1. Go to [github.com/new](https://github.com/new).
2. Create a new repository (e.g. `onyx-chatter-scheduler`). Do **not** add a README or .gitignore (you already have them).
3. Run these in your project folder (replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub username and repo name):

```powershell
cd "c:\onyx chatter scheduler"
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### Option B: Use GitHub CLI

If you have [GitHub CLI](https://cli.github.com/) installed:

```powershell
cd "c:\onyx chatter scheduler"
gh repo create onyx-chatter-scheduler --private --source=. --remote=origin --push
```

Use `--public` instead of `--private` if you want a public repo.

---

## 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use “Continue with GitHub”).
2. Click **Add New…** → **Project**.
3. **Import** your GitHub repo (`onyx-chatter-scheduler` or whatever you named it).
4. Leave **Framework Preset** as Next.js and **Root Directory** as `.`. Click **Deploy**.
5. (Optional) Add environment variables for email:
   - **Project → Settings → Environment Variables**
   - Add `RESEND_API_KEY` (and `EMAIL_FROM` if you use a custom from address).

**Persistent data on Vercel:** The app supports **Redis** (Upstash or Vercel KV–compatible) so that chatters, schedules, and time-off persist. Without it, “Add chatter” and other saves do not persist on Vercel.

1. Create a free Redis database at [Upstash Console](https://console.upstash.com).
2. In your Vercel project → **Settings → Environment Variables**, add:
   - `KV_REST_API_URL` = your Upstash REST URL (e.g. `https://xx.upstash.io`)
   - `KV_REST_API_TOKEN` = your Upstash REST token  
   (Or use `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.)
3. Redeploy. After that, “Add chatter” and “Load default team” will persist.

After each deploy, Vercel gives you a URL like `https://onyx-chatter-scheduler-xxx.vercel.app`.
