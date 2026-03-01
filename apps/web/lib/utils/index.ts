export const calculatePasswordStrength = (password: string) => {
  if (!password) {
    return {
      score: 0,
      level: "weak",
      feedback: ["Password is required"],
      color: "#ef4444",
      percentage: 0,
    };
  }

  let score = 0;
  const feedback = [];
  const len = password.length;

  if (len < 8) {
    feedback.push("Use at least 8 characters");
  } else if (len < 10) {
    score += 15;
  } else if (len < 14) {
    score += 22;
  } else {
    score += 30;
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

  let varietyCount = 0;
  if (hasLower) {
    score += 10;
    varietyCount++;
  }
  if (hasUpper) {
    score += 10;
    varietyCount++;
  }
  if (hasNumber) {
    score += 10;
    varietyCount++;
  }
  if (hasSpecial) {
    score += 10;
    varietyCount++;
  }

  if (varietyCount < 3) {
    feedback.push("Use a mix of uppercase, lowercase, numbers, and symbols");
  }

  const uniqueChars = new Set(password).size;
  const uniqueRatio = uniqueChars / len;
  if (uniqueRatio > 0.7) {
    score += 15;
  } else if (uniqueRatio > 0.5) {
    score += 10;
  } else if (uniqueRatio > 0.3) {
    score += 5;
  } else {
    feedback.push("Avoid repeating characters");
  }

  let patternPenalty = 0;
  if (/(.)\1{2,}/.test(password)) {
    patternPenalty += 5;
    feedback.push("Avoid repeated characters (aaa, 111)");
  }
  if (/(?:abc|bcd|cde|def|123|234|345|456|567|678|789)/i.test(password)) {
    patternPenalty += 5;
    feedback.push("Avoid sequential patterns (abc, 123)");
  }
  if (/(?:qwerty|asdfgh|zxcvbn)/i.test(password)) {
    patternPenalty += 5;
    feedback.push("Avoid keyboard patterns (qwerty)");
  }

  score += Math.max(0, 15 - patternPenalty);
  score = Math.min(100, Math.max(0, score));

  let level, color;
  if (score < 30) {
    level = "weak";
    color = "#ef4444";
  } else if (score < 50) {
    level = "fair";
    color = "#f97316";
  } else if (score < 70) {
    level = "good";
    color = "#eab308";
  } else if (score < 85) {
    level = "strong";
    color = "#22c55e";
  } else {
    level = "excellent";
    color = "#10b981";
  }

  if (feedback.length === 0) {
    feedback.push("Excellent password strength!");
  }

  return { score, level, feedback, color, percentage: score };
};

export const deriveMasterKey = async (
  masterPassword: string,
  email: string,
) => {
  const salt = new TextEncoder().encode(email);

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  const masterKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 600000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  return masterKey;
};

export const derivePasswordHash = async (
  masterKey: CryptoKey,
  masterPassword: string,
) => {
  const masterKeyBytes = await crypto.subtle.exportKey("raw", masterKey);

  const hashKey = await crypto.subtle.importKey(
    "raw",
    masterKeyBytes,
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(masterPassword),
      iterations: 1,
      hash: "SHA-256",
    },
    hashKey,
    256,
  );

  return btoa(String.fromCharCode(...new Uint8Array(hash)));
};

export const deriveKeys = async (masterPassword: string, email: string) => {
  const masterKey = await deriveMasterKey(masterPassword, email);

  const passwordHash = await derivePasswordHash(masterKey, masterPassword);

  return { masterKey, passwordHash };
};

export const generateVaultKey = async () => {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
};

export const encryptVaultKey = async (
  vaultKey: CryptoKey,
  masterKey: CryptoKey,
) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const vaultKeyRaw = await crypto.subtle.exportKey("raw", vaultKey);

  const encryptedVaultKey = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    masterKey,
    vaultKeyRaw,
  );

  return {
    encryptedKey: btoa(
      String.fromCharCode(...new Uint8Array(encryptedVaultKey)),
    ),
    iv: btoa(String.fromCharCode(...iv)),
  };
};

export const decryptVaultKey = async (
  encryptedData: {
    encryptedKey: string;
    iv: string;
  },
  masterKey: CryptoKey,
) => {
  const encryptedKey = Uint8Array.from(atob(encryptedData.encryptedKey), (c) =>
    c.charCodeAt(0),
  );
  const iv = Uint8Array.from(atob(encryptedData.iv), (c) => c.charCodeAt(0));

  const vaultKeyRaw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    masterKey,
    encryptedKey,
  );

  return await crypto.subtle.importKey("raw", vaultKeyRaw, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
};

export const encryptString = async (text: string, key: CryptoKey) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText,
  );

  const ivBase64 = btoa(String.fromCharCode(...iv));
  const encryptedBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encrypted)),
  );

  return `${ivBase64}:${encryptedBase64}`;
};

export const decryptString = async (encryptedText: string, key: CryptoKey) => {
  if (!encryptedText) return "";
  const [ivBase64, encryptedBase64] = encryptedText.split(":");
  if (!ivBase64 || !encryptedBase64) return encryptedText; // Probably not encrypted

  try {
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(encryptedBase64), (c) =>
      c.charCodeAt(0),
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted,
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Failed to decrypt string:", error);
    return encryptedText;
  }
};
