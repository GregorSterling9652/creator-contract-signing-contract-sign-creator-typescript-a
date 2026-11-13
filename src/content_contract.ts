import { z } from "zod";
import { InfraiClient } from "./infrai_client.ts";

export const contractRequest = z.object({
  pdf: z.string().min(1),
  cert_pem: z.string().min(1),
  key_pem: z.string().min(1),
  creator_id: z.string().min(1),
  subscriber_id: z.string().min(1),
  contract_key: z.string().min(1)
});

export type ContractRequest = z.infer<typeof contractRequest>;

type Presign = { url: string };

export function subscriberUpdate(input: ContractRequest, signedUrl: string) {
  return {
    creator_id: input.creator_id,
    subscriber_id: input.subscriber_id,
    event: "contract_signed",
    document_url: signedUrl
  };
}

export async function signCreatorContract(input: ContractRequest, client: InfraiClient) {
  const request = contractRequest.parse(input);
  const signed = await client.request<{ pdf: string }>("/v1/pdf/sign", "POST", {
    pdf: request.pdf,
    cert_pem: request.cert_pem,
    key_pem: request.key_pem,
    reason: "Creator commerce contract"
  });
  const upload = await client.request<Presign>("/v1/storage/object/presign/creator-contracts/" + request.contract_key, "POST", {
    op: "put",
    content_type: "application/pdf",
    idempotency_key: request.contract_key
  });
  await fetch(upload.url, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: signed.pdf
  });
  const download = await client.request<Presign>("/v1/storage/object/presign/creator-contracts/" + request.contract_key, "POST", {
    op: "get",
    expires_seconds: 900,
    response_disposition: "attachment"
  });
  return { signed_pdf: signed.pdf, subscriber_update: subscriberUpdate(request, download.url) };
}

async function main() {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("Set INFRAI_API_KEY before running the example");
  const input = contractRequest.parse({
    pdf: process.env.CONTRACT_PDF ?? "base64-pdf",
    cert_pem: process.env.SIGN_CERT_PEM ?? "certificate",
    key_pem: process.env.SIGN_KEY_PEM ?? "private-key",
    creator_id: process.env.CREATOR_ID ?? "creator-42",
    subscriber_id: process.env.SUBSCRIBER_ID ?? "subscriber-19",
    contract_key: process.env.CONTRACT_KEY ?? "contracts/creator-42.pdf"
  });
  const client = new InfraiClient(key);
  const result = await signCreatorContract(input, client);
  console.log(JSON.stringify(result.subscriber_update, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) void main();
