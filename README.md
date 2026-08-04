This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Private panel configuration

Set `ADMIN_PASSWORD` in the server environment before using `/panel-privado-camisetas/login`. The value is read only on the server; the panel remains inaccessible when it is not configured. Do not commit real credentials.

## Persistent stock configuration

Set `BLOB_READ_WRITE_TOKEN` in the server environment. Stock is stored separately from the catalog in the single private Blob document `camisetas/stock/state-v1.json`; the token is only used server-side. Catalog state uses the same server-only/private access pattern at `camisetas/catalog/state-v1.json`. Existing public state documents remain readable and are migrated to private on their next successful write. If the token belongs to another Blob Store/project or lacks permission, the panel reports that configuration error instead of treating it as an absent document. The document format is versioned:

```json
{
  "schemaVersion": 1,
  "version": 3,
  "updatedAt": "2026-07-31T00:00:00.000Z",
  "products": {
    "boca-2": {
      "exhausted": false,
      "unavailableSizes": ["XL"]
    }
  }
}
```

The mock catalog remains the only product universe. Products without an override use their declared sizes; a mock product with `inStock: false` starts fully exhausted. `Agotar modelo` sets the global flag, and reactivating one size clears that flag while leaving every other size exhausted.

## Deployment and migrations

Production deployments must provide `DATABASE_URL` and use the `vercel-build` script (Vercel detects this script automatically) or configure the platform build command as `npm run vercel-build`. It runs `prisma migrate deploy` before the regular build, applying only pending migrations without resetting or deleting existing data. Keep `npm run build` for local/CI builds that do not have a database connection.

The login page is rendered at request time so changes to `ADMIN_PASSWORD` are evaluated by the running server, not during the build. Login attempts are limited in process memory to five attempts per client key every 15 minutes. This limiter is best-effort on serverless or multi-instance deployments because each instance has separate memory; use an external shared limiter for stronger distributed protection.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
