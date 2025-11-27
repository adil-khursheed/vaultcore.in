import crypto from "node:crypto";

/**
 * Hashes a password using PBKDF2.
 * @param password - The password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPasswordForAuth(password: string):Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(32);
        const iterations = 600000;
        const keyLength = 32;
        const digest = "sha256";
        
        crypto.pbkdf2(password, salt, iterations, keyLength, digest, (err, hash) => {
            if (err) {
                reject(err);
            } else {
                const serverSalt = crypto.randomBytes(32);
                
                crypto.pbkdf2(hash, serverSalt, iterations, keyLength, digest, (err2, finalHash) => {
                    if (err2) {
                        reject(err2);
                    } else {
                        const result = `${salt.toString("hex")}$${serverSalt.toString("hex")}$${finalHash.toString("hex")}`;
                        resolve(result);
                    }
                })
            }
        })
    })
};

/**
 * Verifies a password against a stored hash.
 * @param password - The password to verify.
 * @param storedHash - The stored hash to compare against.
 * @returns A promise that resolves to a boolean indicating whether the password matches the stored hash.
 */
export async function verifyPasswordForAuth(password: string, storedHash: string): Promise<boolean>{
    try {
        const parts = storedHash.split("$");
        if (parts.length !== 3) return false;

        const [saltHex, serverSaltHex, hashHex] = parts;

        if(!saltHex || !serverSaltHex || !hashHex) return false;

        const salt = Buffer.from(saltHex, "hex");
        const serverSalt = Buffer.from(serverSaltHex, "hex");
        const expectedHash = Buffer.from(hashHex, "hex");

        const firstHash = await new Promise<Buffer>((resolve, reject) => {
            crypto.pbkdf2(password, salt, 600000, 32, "sha256", (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            })
        })

        const secondHash = await new Promise<Buffer>((resolve, reject) => {
            crypto.pbkdf2(firstHash, serverSalt, 600000, 32, "sha256", (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            })
        })

        return crypto.timingSafeEqual(secondHash, expectedHash);
    } catch (error) {
        console.error("Password verification failed",error);
        return false;
    }
}

async function deriveMasterKey(password: string,iterations=600000) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16);
        const keyLength = 32;
        const digest = "sha256";
        
        crypto.pbkdf2(password, salt, iterations, keyLength, digest, (err, derivedKey) => {
            if (err) {
                reject(err);
            } else {
                resolve(derivedKey);
            }
        })
    })
};

async function stretchMasterKey(masterKey: Buffer, info = "stretched-master-key", salt = null) {
    return new Promise((resolve, reject) => {
        try {
            const outputLength = 64; // 512 bits
            const digest = "sha256";

            const infoBuffer = typeof info === "string" ? Buffer.from(info,"utf8") : info;
            const saltBuffer = salt ? Buffer.from(salt, "utf8") : Buffer.alloc(32);
            
            const prk = crypto.createHmac(digest, saltBuffer).update(masterKey).digest();

            const stretchedKey = hkdfExpand(prk, infoBuffer, outputLength, digest);

            resolve(stretchedKey);
        } catch (err) {
            reject(err);
        }
    })
};

function hkdfExpand(prk: Buffer, info: Buffer, length: number, digest: string) {
    const hashLength = crypto.createHash(digest).digest().length;
    const n = Math.ceil(length / hashLength);
    
    if (n > 255) {
        throw new Error("Output length too long for HKDF");
    }

    let t = Buffer.alloc(0);
    let okm = Buffer.alloc(0);

    for (let i = 1; i <= n; i++){
        const hmac = crypto.createHmac(digest, prk);
        hmac.update(t);
        hmac.update(info);
        hmac.update(Buffer.from([i]));
        t = Buffer.from(hmac.digest());
        okm = Buffer.concat([okm, t]);
    }

    return Buffer.from(okm.subarray(0, length));
};

function generateSymmetricKey() {
    return {
      generatedSymmetricKey: crypto.randomBytes(64), // 512 bits
      iv: crypto.randomBytes(16) // 128 bits
    };
  }