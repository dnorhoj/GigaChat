import { PUBLIC_WS_URL } from "$env/static/public";
import { user } from "$lib/stores";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class WebSocketClient {
    private ws: WebSocket;
    private keepAliveInterval: number;

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
            this.connect();
        }

        this.ws.onerror = (err) => {
            console.warn("WS error", err);
        }

        this.ws.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (err) {
                console.log("WS message error", err);
            }

            if (data) {
            }
        }
    }

    private async connect() {
        let tries = 0;
        let connected = false;
        while (!connected) {
            this.ws = new WebSocket(PUBLIC_WS_URL);

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

        this.setup();
    }

    public send(event: string, data ?: string) {
    this.ws.send(
        JSON.stringify({
            type: event,
            data,
        })
    );
};

    public on(event: string, callback: (data: any) => void) {
}
}

export const ws = new WebSocketClient();