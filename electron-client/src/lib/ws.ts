import { PUBLIC_WS_URL } from "$env/static/public";
import { user } from "$lib/stores";
import { get } from "svelte/store";
import { toast } from "./swal-mixins";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class WebSocketConnection {
    private ws: WebSocket;
    private keepAliveInterval: number;
    private listeners: Record<string, Set<(data?: any) => any>> = {};

    constructor() {
        // @ts-ignore
        this.ws = null;
        // @ts-ignore
        this.keepAliveInterval = null;

        this.connect();
    }

    private setup() {
        this.keepAliveInterval = window.setInterval(() => {
            this.ws.send("ping");
        }, 30000);

        this.ws.onopen = () => {
            this.send("me");
        }

        this.ws.onclose = () => {
            window.clearInterval(this.keepAliveInterval);
            return this.connect();
        }

        this.ws.onerror = (err) => {
            console.warn("WS error", err);
        }

        this.ws.onmessage = (event) => {
            let msg;
            try {
                msg = JSON.parse(event.data);
            } catch (err) {
                console.error("WS message error", err);
                return;
            }

            const { type, data } = msg;

            if (this.listeners[type]) {
                this.listeners[type].forEach((listener) => {
                    listener(data);
                });
            }
        }
    }

    private async connect(): Promise<any> {
        let tries = 0;
        let connected = false;

        let userValue = get(user);

        while (!userValue) {
            console.error("WS connection failed: no user");
            await new Promise<void>((resolve) => user.subscribe(value => {
                userValue = value;
                resolve();
            }));
        }

        while (!connected) {
            try {
                this.ws = new WebSocket(PUBLIC_WS_URL + '/?token=' + userValue.sessionKey);
            } catch (err) {
                console.error("WS connection failed", err);
                tries++;
                await sleep(5000);
            }

            // Connect to the server (with a timeout)
            await new Promise<void>((resolve, reject) => {
                this.ws.onopen = () => {
                    connected = true;
                    resolve();
                }

                setTimeout(() => {
                    reject();
                }, 5000);
            })

            if (!connected) {
                console.warn("Failed to connect!");
                tries++;
            }

            await sleep(5000);
        }

        // Connected!
        if (tries > 3) {
            toast.fire({
                icon: "success",
                title: "Connection restored!"
            });
        }

        this.setup();
    }

    public send(event: string, data?: any) {
        this.ws.send(
            JSON.stringify({
                type: event,
                data,
            })
        );
    };

    public on(event: string, callback: (data: any) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = new Set();
        }

        this.listeners[event].add(callback);
    }

    public off(event: string, callback: (data: any) => void) {
        if (!this.listeners[event]) {
            return false;
        }

        return this.listeners[event].delete(callback);
    }
}
