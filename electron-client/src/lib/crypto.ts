export const generateSecurityKey = async (): Promise<string> => {
    const key = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );

    // btoa is deprecated but not for client-side usage
    const exported = await window.crypto.subtle.exportKey("raw", key);

    // @ts-ignore
    return window.btoa(exported);
}
