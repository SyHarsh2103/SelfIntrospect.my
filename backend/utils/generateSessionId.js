import { nanoid } from "nanoid";
export function generateSessionId() { return nanoid(16); }
