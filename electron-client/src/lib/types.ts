export enum EventType {
    ERROR = "error",
    TEXT = "text",
}

export type EventContent = {
    type: EventType;
    data?: any;
}

export type Event = {
    id: string;
    from: string;
    content: EventContent;
    timestamp: number;
};