import { writable, type Writable } from "svelte/store";

type UserSession = {
    id: string;
    username: string;
    name: string;
    email: string;
    token: string;
    rsaKey: CryptoKey;
}

export const user: Writable<UserSession | null> = writable(null);
