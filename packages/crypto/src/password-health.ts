import { getCryptoBackend } from "./config";
import { toBase64 } from "./encoding";
import { calculatePasswordStrength } from "./password-strength";

export const OLD_PASSWORD_DAYS = 180;

export interface PasswordHealthInput {
  id: string;
  title: string;
  username?: string | null;
  url?: string | null;
  password: string;
  updatedAt: Date | string;
}

export interface PasswordHealthFinding {
  id: string;
  title: string;
  username: string | null;
  url: string | null;
  updatedAt: Date;
  strength: ReturnType<typeof calculatePasswordStrength>;
  isWeak: boolean;
  isReused: boolean;
  reuseCount: number;
  isOld: boolean;
  ageDays: number;
}

export interface PasswordHealthReport {
  totalLogins: number;
  score: number;
  weakCount: number;
  reusedCount: number;
  oldCount: number;
  findings: PasswordHealthFinding[];
}

async function digestPassword(password: string): Promise<string> {
  const backend = getCryptoBackend();
  const bytes = new TextEncoder().encode(password);
  const hash = await backend.subtle.digest("SHA-256", bytes);
  return toBase64(new Uint8Array(hash));
}

export async function analyzePasswordHealth(
  items: PasswordHealthInput[],
  now = Date.now(),
): Promise<PasswordHealthReport> {
  const withPasswords = items.filter((item) => item.password.length > 0);
  if (withPasswords.length === 0) {
    return {
      totalLogins: 0,
      score: 100,
      weakCount: 0,
      reusedCount: 0,
      oldCount: 0,
      findings: [],
    };
  }

  const digests = await Promise.all(
    withPasswords.map((item) => digestPassword(item.password)),
  );
  const digestCounts = new Map<string, number>();
  for (const digest of digests) {
    digestCounts.set(digest, (digestCounts.get(digest) ?? 0) + 1);
  }

  let weakCount = 0;
  let reusedCount = 0;
  let oldCount = 0;
  const findings: PasswordHealthFinding[] = [];

  for (let i = 0; i < withPasswords.length; i += 1) {
    const item = withPasswords[i]!;
    const digest = digests[i]!;
    const strength = calculatePasswordStrength(item.password);
    const reuseCount = digestCounts.get(digest) ?? 1;
    const updatedAt = new Date(item.updatedAt);
    const ageDays = Math.max(
      0,
      Math.floor((now - updatedAt.getTime()) / (24 * 60 * 60 * 1000)),
    );

    const isWeak = strength.score < 50;
    const isReused = reuseCount > 1;
    const isOld = ageDays > OLD_PASSWORD_DAYS;

    if (isWeak) weakCount += 1;
    if (isReused) reusedCount += 1;
    if (isOld) oldCount += 1;

    if (isWeak || isReused || isOld) {
      findings.push({
        id: item.id,
        title: item.title,
        username: item.username ?? null,
        url: item.url ?? null,
        updatedAt,
        strength,
        isWeak,
        isReused,
        reuseCount,
        isOld,
        ageDays,
      });
    }
  }

  const penalty =
    ((weakCount * 1.0 + reusedCount * 0.8 + oldCount * 0.4) /
      withPasswords.length) *
    100;
  const score = Math.round(Math.max(0, Math.min(100, 100 - penalty)));

  return {
    totalLogins: withPasswords.length,
    score,
    weakCount,
    reusedCount,
    oldCount,
    findings,
  };
}
