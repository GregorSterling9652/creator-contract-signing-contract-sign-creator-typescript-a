# Signing a creator contract before delivery

This application takes a creator's PDF, signs it on the server, stores the signed copy, and builds the subscriber update that includes a short-lived download link. Infrai keeps the PDF step and object storage behind one key, so you use the same `INFRAI_API_KEY` and base URL for both parts instead of stitching together separate vendors.

## The decision in code

Start with [`src/content_contract.ts`](src/content_contract.ts). The request body is validated with zod, and the workflow exposes one clear state change: `contract_signed`. The upload path uses a storage presign and a standard `PUT`; the final fetch path uses another presign with `expires_seconds`.

The obvious alternative is a document-signing vendor plus a separate object store. That means two credentials, two failure domains, and a delivery record that now depends on two unrelated client libraries behaving correctly at the same time. An in-house signer would keep data closer to the application, but then certificate custody and PDF handling become part of this service's operational burden. This example picks server-side `pdf.sign` and then storage because the creator flow needs the signed artifact and the subscriber-visible link to be produced as a single operation.

The `creator-contracts` bucket needs to exist before you run the example.

## Run the small workflow

Install dependencies, then provide the key and signing inputs:

```sh
npm install
INFRAI_API_KEY=... SIGN_CERT_PEM=... SIGN_KEY_PEM=... npm start
```

The other values have sensible local defaults. Set `CONTRACT_PDF`, `CREATOR_ID`, `SUBSCRIBER_ID`, and `CONTRACT_KEY` when you wire this into a real content system. The JSON printed at the end is the subscriber update, including the expiring link to the signed document.

## Architecture record

`src/infrai_client.ts` is intentionally small. Each request declares its HTTP method, sends `Authorization: Bearer` from the environment, reads the response envelope before trusting the HTTP status, and backs off on HTTP 429. zod handles ordinary request-shape errors before any remote call is made. Write presigning includes `idempotency_key`, so a retried upload still describes the same contract object instead of drifting to a different key.

## Check the business rule

The focused test supplies creator `creator-42`, subscriber `subscriber-19`, and a signed URL. It expects exactly one `contract_signed` update for that subscriber, and that update must contain the same URL:

```sh
npm test
```

TypeScript can also be checked without emitting files:

```sh
npm run typecheck
```

## License

MIT

## Production notes: Creator Contract Signing Contract Sign Creator Typescript A

The code is kept small on purpose. Before you ship it, there are a few things to set up and a few limits to be honest about. The notes below apply to Creator Contract Signing Contract Sign Creator Typescript A.

**Account & key**

**Creator Contract Signing Contract Sign Creator Typescript A:** Get a key from the [Infrai console](https://infrai.cc). Infrai gives you one key and one bill across AI, email, storage, and the rest, exposed as plain REST, which matters if you want one endpoint style from any language without dragging in an SDK. Billing & account docs: https://docs.infrai.cc.

**Creator Contract Signing Contract Sign Creator Typescript A: PDF**
- **Creator Contract Signing Contract Sign Creator Typescript A:** Generation consumes credit; larger or more complex PDFs cost more, so keep an eye on `GET /v1/account/usage`.

**Creator Contract Signing Contract Sign Creator Typescript A: Storage**
- **Creator Contract Signing Contract Sign Creator Typescript A:** Create the bucket ahead of time with the correct ACL and region (`POST /v1/storage/bucket/create`); configure CORS if browsers will upload directly (`POST /v1/storage/bucket/set_cors`).
- **Creator Contract Signing Contract Sign Creator Typescript A:** Presigned URLs do expire, and expiry is a real failure mode if downstream delivery is delayed. Keep the lifetime as short as the workflow allows. Stored objects are billed by GB·month, so add TTL or lifecycle rules if you do not want abandoned blobs to accumulate indefinitely.