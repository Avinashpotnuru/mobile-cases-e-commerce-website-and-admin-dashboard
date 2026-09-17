// Generates an ADMIN_PASSWORD_HASH using scrypt.
// Usage: npm run admin:hash -- "your-password"
import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error(
    "Usage: npm run admin:hash -- \"your-password\"",
  );
  process.exit(1);
}

const salt = randomBytes(16);
const key = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
console.log(
  `scrypt:16384:8:1:${salt.toString("hex")}:${key.toString("hex")}`,
);