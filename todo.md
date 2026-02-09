# Debugging MongoDB connection (step-by-step)

This file lists concrete, ordered steps to resolve the `MONGODB_URI === undefined` and `querySrv ECONNREFUSED` errors.

- [ ] 1) Confirm `.env.local` contains the correct key
  - Ensure the project root `.env.local` has a line named `MONGODB_URI` (not only `MONGODB_URL`).
  - If you currently have `MONGODB_URL`, copy its value and add `MONGODB_URI=<same-value>`.

- [ ] 2) Restart the Next dev server
  - After editing `.env.local` restart with:

```bash
npm run dev
```

- [ ] 3) Verify env vars are visible to Node (local debug)
  - Run this quick Node command in the project root to confirm values available to Node:

```powershell
node -e "console.log('MONGODB_URI=', process.env.MONGODB_URI, 'MONGODB_URL=', process.env.MONGODB_URL)"
```

- [ ] 4) Test DNS SRV resolution for Atlas
  - On Windows run:

```powershell
nslookup -type=SRV _mongodb._tcp.cluster0.eugk0tc.mongodb.net
```

  - If this fails with `querySrv` or `REFUSED`, DNS/SRV resolution is blocked/interrupted.

- [ ] 5) Test direct DB connection
  - Try `mongosh` (if installed) using the exact connection string from `.env.local`:

```bash
mongosh "<your-connection-string>"
```

  - Or run a tiny Node check:

```node
// save as test-mongo.js
import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
mongoose.connect(uri).then(()=>console.log('connected')).catch(e=>console.error(e));
```

then:

```bash
node test-mongo.js
```

- [ ] 6) Check MongoDB Atlas network access
  - If using Atlas, ensure your current IP is allowed in the Network Access / IP allowlist in the Atlas dashboard.

- [ ] 7) Workaround if SRV/DNS is blocked
  - Use the non-SRV connection string (replace `mongodb+srv://` with a provided `mongodb://` hosts list from Atlas) or fix DNS (VPN/firewall/router/DNS provider).

- [ ] 8) (Optional) Make `lib/database/mongoose.ts` more robust
  - Accept `MONGODB_URL` as a fallback for `MONGODB_URI` and improve the error message.
  - Add a temporary server-only debug log to show the used env var (only for local dev).

- [ ] 9) Avoid attempting DB calls during static generation
  - The stack shows `getOrCreateUser` is called while rendering the page—ensure you don't run DB code during build/static path generation or RSC that runs at build time. Move DB calls into server actions or API routes executed at request time.

- [ ] 10) Final verification
  - Restart dev server and open the pages that previously hit DB (`/transformations/add/[type]`), confirm no `Please define the MONGODB_URI` or `querySrv ECONNREFUSED` errors.


Notes & quick tips
- Next.js reads `.env.local` on process start; always restart dev server after edits.
- Use `MONGODB_URI` (no `NEXT_PUBLIC_`) for server-only secrets.
- If you're behind a corporate VPN or have restrictive DNS/firewall, try temporarily switching networks (home/mobile hotspot) to isolate network/DNS issues.

If you want, I can now:
- update `lib/database/mongoose.ts` to accept a fallback (I won't change it unless you confirm), or
- run the DNS/Node tests here if you give permission to run commands.
