import { writable, type Writable } from "svelte/store"
import type { AESKey } from "$lib/crypto";

type ChatInfo = {
    id: string;
    key: AESKey;
    user: {
        id: string;
        username: string;
        name: string;
    };
};


export const chatInfo: Writable<ChatInfo | null> = writable(null);