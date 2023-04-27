import { PUBLIC_WS_URL } from "$env/static/public";
import { user } from "$lib/stores/user";
import { get } from "svelte/store";
import { toast } from "./swal-mixins";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class WebSocketConnection {
    private ws: WebSocket | null;
    private keepAliveInterval: number | null;
    private listeners: Record<string, Set<(data?: any) => any>> = {};

    constructor() {
        this.ws = null;
        this.keepAliveInterval = null;

        this.connect();
    }

    private setup() {
        if (!this.ws) {
            return this.connect();
        }

        this.keepAliveInterval = window.setInterval(() => {
            this.send("keep-alive");
        }, 30000);

        this.ws.onopen = () => {
            this.send("me");
        }

        this.ws.onclose = () => {
            if (this.keepAliveInterval)
                window.clearInterval(this.keepAliveInterval);
            console.log("WS connection closed");
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

            if (!type) {
                console.error("WS message error: no type");
                return;
            }

            if (this.listeners[type]) {
                this.listeners[type].forEach(listener => {
                    listener(data);
                });
            }
        }
    }

    private async connect(): Promise<any> {
        console.log("Connecting to WS server...");
        let tries = 0;

        let userValue = get(user);

        while (!userValue) {
            console.error("WS connection failed: no user");
            await new Promise<void>((resolve) => user.subscribe(value => {
                userValue = value;
                resolve();
            }));
        }

        let connected = false;
        while (!connected) {
            try {
                this.ws = new WebSocket(PUBLIC_WS_URL + '/?token=' + userValue.sessionKey);
            } catch (err) {
                console.error("WS connection failed", err);

                if (tries > 1)
                    await sleep(5000);

                tries++;
                continue;
            }

            // Connect to the server (with a timeout)
            await new Promise<void>((resolve, reject) => {
                if (!this.ws)
                    return reject();

                const timeout = window.setTimeout(() => {
                    console.warn("WS connection timeout");
                    resolve();
                }, 5000);

                this.ws.onopen = () => {
                    window.clearTimeout(timeout);
                    connected = true;
                    resolve();
                }
            })

            if (!connected) {
                this.ws.close();
                console.warn("Failed to connect!");
                tries++;
                await sleep(5000);
            }
        }

        // Connected!
        if (tries > 3) {
            toast.fire({
                icon: "success",
                title: "Connection restored!"
            });
        }

        console.log("WS connection established")
        this.setup();
    }

    public send(event: string, data?: any) {
        if (!this.ws) {
            return false;
        }

        this.ws.send(
            JSON.stringify({
                type: event,
                data,
            })
        );

        return true;
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

    public close() {
        if (this.keepAliveInterval)
            window.clearInterval(this.keepAliveInterval);

        this.ws?.close();
    }
}
