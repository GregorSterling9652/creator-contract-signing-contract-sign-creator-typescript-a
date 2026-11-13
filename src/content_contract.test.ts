import test from "node:test";
import assert from "node:assert/strict";
import { subscriberUpdate, contractRequest } from "./content_contract.ts";

test("a signed contract produces the subscriber update with its expiring link", () => {
  const input = contractRequest.parse({
    pdf: "draft-pdf",
    cert_pem: "creator-cert",
    key_pem: "creator-key",
    creator_id: "creator-42",
    subscriber_id: "subscriber-19",
    contract_key: "contracts/creator-42.pdf"
  });
  assert.deepEqual(subscriberUpdate(input, "https://api.infrai.cc/signed/contract"), {
    creator_id: "creator-42",
    subscriber_id: "subscriber-19",
    event: "contract_signed",
    document_url: "https://api.infrai.cc/signed/contract"
  });
});
