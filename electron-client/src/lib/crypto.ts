export const generateSecurityKey = async () => {
    const key = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );

    return key;
}

export const exportSecurityKey = async (
    securityKey: CryptoKey
) => {
    const exported = await window.crypto.subtle.exportKey("raw", securityKey);

    // @ts-ignore
    return window.btoa(exported);
}

export const genRSAKey = async (): Promise<CryptoKeyPair> => {
    return await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]), // 65537
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export const encryptRSAKey = async (
    rsaKey: CryptoKey,
    securityKey: string
): Promise<string> => {
    const securityKeyBuffer = await window.crypto.subtle.importKey(
        "raw",
        window.atob(securityKey),
        true,
        ["encrypt", "decrypt"]
    );

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: window.crypto.getRandomValues(new Uint8Array(12)),
        },
        securityKeyBuffer,
        rsaKey
    );

    return window.btoa(encrypted);
}