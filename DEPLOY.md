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

**Important:** The app stores chatters, schedules, and time-off in JSON files under `data/`. On Vercel’s serverless environment this **does not persist** between requests. The deployed app is fine for trying the UI, but for real use you should either:

- Run the app **locally** (`npm run dev`) and use it from your machine, or  
- Add a database (e.g. [Vercel Postgres](https://vercel.com/storage/postgres) or [Vercel KV](https://vercel.com/storage/kv)) and switch the app to use it instead of file storage.

After each deploy, Vercel gives you a URL like `https://onyx-chatter-scheduler-xxx.vercel.app`.
