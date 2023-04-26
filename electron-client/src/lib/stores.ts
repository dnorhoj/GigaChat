import type { RSAKey } from "./crypto";
import type { WebSocketConnection } from "./ws";
import { writable, type Writable } from "svelte/store";

type UserSession = {
    id: string;
    username: string;
    name: string;
    email: string;
    sessionKey: string;
    rsaKey: RSAKey;
}

export const user: Writable<UserSession | null> = writable(null);

export const ws: Writable<WebSocketConnection | null> = writable(null);