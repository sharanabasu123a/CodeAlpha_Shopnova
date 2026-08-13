# Deployment Plan
## Shop Nova — Shipping to Production

| | |
|---|---|
| **Version** | 1.0 |
| **Related Docs** | [prd.md](./prd.md) · [trd.md](./trd.md) · [techstack.md](./techstack.md) |

---

## 1. Hosting Map

| Layer | Platform | Env Vars to Set |
|---|---|---|
| Frontend | **Vercel** | `VITE_API_URL=https://<backend>.onrender.com` |
| Backend | **Render** | `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, (optional) `CLOUDINARY_*`, `SEED_ON_START=true` |
| Database | **MongoDB Atlas** (M0 free) | network access + DB user |
| Images | Cloudinary *(optional)* or `/uploads` | `CLOUDINARY_*` |

## 2. Database — MongoDB Atlas

1. Create a free **M0** cluster.
2. Add a database user with password auth.
3. Under *Network Access*, allow `0.0.0.0/0` (or Render's IPs).
4. Copy the connection string: `mongodb+srv://<user>:<pass>@<cluster>/shopnova`.
5. On first deploy set `SEED_ON_START=true` so the catalog + demo accounts are created (they are created automatically only on an empty database).

## 3. Backend — Render

1. New **Web Service** → connect the GitHub repo → root directory `backend`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set the env vars from the table above. `CLIENT_ORIGIN` = the Vercel URL (and `https://localhost:5173` in dev).
5. Deploy, then confirm `GET <backend-url>/api/health` returns `{ "ok": true }`.

## 4. Frontend — Vercel

1. New **Project** → import the repo → root directory `frontend`.
2. Build command: `npm run build`, output directory: `dist`.
3. Set `VITE_API_URL` to the deployed backend URL.
4. Deploy. The SPA rewrites should be automatic (Vercel serves `index.html` fallback).

## 5. Secrets Management

- Commit only `.env.example` (placeholder values).
- Real values live in the platform dashboards (Render / Vercel), never in the repo.
- `.gitignore` excludes `.env`, `node_modules/`, `dist/`.

## 6. Post-Deploy Smoke Test

- [ ] `GET /api/health` → ok
- [ ] Login as `admin@shopnova.com` / `Admin@123` on the live URL
- [ ] Browse → add to cart → checkout → order success
- [ ] Admin: create/edit/delete a product, update an order status

## 7. Known Notes

- **Render cold starts** can make the first request feel slow on free tier; a keep-alive ping helps before a live demo.
- The **in-memory MongoDB fallback** (no `MONGO_URI`) resets data on restart — fine for local demos, use Atlas for anything persistent.