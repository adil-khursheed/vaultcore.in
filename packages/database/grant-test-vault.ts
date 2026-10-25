import pg from "pg";

const c = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const { rows } = await c.query(
  'select u.id as user_id, u.public_key, m.organization_id, m.id as member_key_id from "user" u join member_vault_key m on m.user_id = u.id limit 1',
);
const user = rows[0];
console.log("user", user.user_id, user.organization_id);

const vaultKey = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"],
);
const raw = await crypto.subtle.exportKey("raw", vaultKey);
const jwk = JSON.parse(Buffer.from(user.public_key, "base64").toString());
const publicKey = await crypto.subtle.importKey(
  "jwk",
  jwk,
  { name: "RSA-OAEP", hash: "SHA-256" },
  true,
  ["encrypt"],
);
const wrapped = await crypto.subtle.encrypt(
  { name: "RSA-OAEP" },
  publicKey,
  raw,
);
const wrappedBase64 = Buffer.from(new Uint8Array(wrapped)).toString("base64");
console.log("wrapped length", wrappedBase64.length);

await c.query(
  "update member_vault_key set encrypted_key = $1, status = 'active', granted_by = $2, updated_at = now() where id = $3",
  [wrappedBase64, user.user_id, user.member_key_id],
);

console.log(
  (await c.query("select id,status,length(encrypted_key) from member_vault_key"))
    .rows,
);
await c.end();
