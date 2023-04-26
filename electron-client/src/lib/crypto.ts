const hex = (data: Uint8Array) => {
    return Array.from(data)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

const unhex = (data: string) => {
    return new Uint8Array(
        data.match(/[0-9A-Fa-f]{1,2}/g)!.map((b) => parseInt(b, 16))
    );
};

export const b64 = (data: ArrayBuffer | Uint8Array) => {
    return window.btoa(String.fromCharCode(...new Uint8Array(data)));
};

export const ub64 = (data: string) => {
    return new Uint8Array(
        window.atob(data).split("").map((c) => c.charCodeAt(0))
    );
};

export class SecurityKey {
    key: Uint8Array;

    constructor(key?: string) {
        this.key = key ? unhex(key) : window.crypto.getRandomValues(new Uint8Array(32));
    }

    export() {
        return hex(this.key);
    }

    static import(key: string) {
        return new SecurityKey(key);
    }

    async deriveKey() {
        // Derive a 256-bit AES key from the security key
        const key = await window.crypto.subtle.importKey(
            "raw",
            this.key,
            "PBKDF2",
            false,
            ["deriveBits", "deriveKey"]
        );

        const aesKey = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: new Uint8Array(0),
                iterations: 100000,
                hash: "SHA-256",
            },
            key,
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );

        return new AESKey(aesKey);
    }
}

type CryptoKeyPair = {
    publicKey: CryptoKey | null,
    privateKey: CryptoKey | null
}

export class RSAKey {
    key: CryptoKeyPair;

    constructor(key: CryptoKeyPair) {
        this.key = key;
    }

    static async generate() {
        const key = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );

        return new RSAKey(key);
    }

    static async importFullKey(pubkey: string, encrypedPrivateKey: string, securityKey: SecurityKey) {
        // Import the public key
        const publicKey = await window.crypto.subtle.importKey(
            "spki",
            ub64(pubkey),
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            false,
            ["encrypt"]
        );

        // Import the private key
        const aesKey = await securityKey.deriveKey();
        const rawPrivateKey = await aesKey.decrypt(encrypedPrivateKey);
        const privateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            rawPrivateKey,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            false,
            ["decrypt"]
        );

        return new RSAKey({ publicKey, privateKey });
    }

    static async importPublicKey(publicKey: string) {
        const imported = await window.crypto.subtle.importKey(
            "spki",
            ub64(publicKey),
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            false,
            ["encrypt"]
        );

        return new RSAKey({
            publicKey: imported,
            privateKey: null
        });
    }

    async exportPub() {
        if (this.key.publicKey === null) {
            throw new Error("Public key is null");
        }

        const exported = await window.crypto.subtle.exportKey(
            "spki",
            this.key.publicKey
        );

        return b64(exported);
    }

    async exportPriv() {
        if (this.key.privateKey === null) {
            throw new Error("Private key is null");
        }

        const exported = await window.crypto.subtle.exportKey(
            "pkcs8",
            this.key.privateKey
        );

        return exported;
    }

    async encrypt(data: Uint8Array | ArrayBuffer) {
        if (this.key.publicKey === null) {
            throw new Error("Public key is null");
        }

        if (data instanceof ArrayBuffer) {
            data = new Uint8Array(data);
        }

        return window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            this.key.publicKey,
            data
        );
    }

    async decrypt(data: Uint8Array) {
        if (this.key.privateKey === null) {
            throw new Error("Private key is null");
        }

        return window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            },
            this.key.privateKey,
            data
        );
    }
}

export class AESKey {
    key: CryptoKey;

    constructor(key: CryptoKey) {
        this.key = key;
    }

    static async generate() {
        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );

        return new AESKey(key);
    }

    async export() {
        return await window.crypto.subtle.exportKey(
            "raw",
            this.key
        );
    }

    async encrypt(data: Uint8Array | ArrayBuffer) {
        // Check if data is ArrayBuffer
        if (data instanceof ArrayBuffer) {
            data = new Uint8Array(data);
        }

        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv,
            },
            this.key,
            data
        );

        return b64(new Uint8Array([...iv, ...new Uint8Array(encrypted)]));
    }

    async decrypt(data: string) {
        const msg = ub64(data);

        const iv = msg.slice(0, 12);
        const encrypted = msg.slice(12);

        return window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv,
            },
            this.key,
            encrypted
        );
    }
}