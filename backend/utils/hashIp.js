import crypto from "crypto";
export function hashIp(ipAddress = "") { return crypto.createHash("sha256").update(ipAddress).digest("hex"); }
