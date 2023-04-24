// file: app.d.ts
import 'http';

declare module 'http' {
    interface IncomingMessage {
        user: "test",
    }
}