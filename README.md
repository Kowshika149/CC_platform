# CC Hub (Creative Connect Hub)

A two-sided marketplace prototype connecting Content Seekers with Content Creators.

## Run Locally

```bash
cd createconnect
npm install
npm run dev
```

**Preview URL:** http://localhost:5173

## Demo Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Customer | kowshika@demo.com | demo123 | Full customer journey |
| Creator (Approved) | arjun@demo.com | demo123 | Verified, appears in search |
| Creator (Pending) | pending@demo.com | demo123 | Pending verification dashboard |

## Key Updates

- Rebranded to **CC HUB** / **CC Hub**
- Simplified landing page with 3 actions
- Customer flow: Individual vs Business → Categories → Requirements
- Influencer Content category removed
- Creator verification onboarding with portfolio (min 3), identity verification, OTP/email sim
- Only approved creators appear in customer search
- Verified badge only for approved creators

## Test Flows

**Customer:** Login → Start New Project → Individual/Business → Category → Services → Find Creators

**Creator (new):** Sign up as creator → Complete application → Submit → Pending screen → Demo Approve

**Creator (approved):** arjun@demo.com → Dashboard → Accept projects → Workspace flow unchanged
