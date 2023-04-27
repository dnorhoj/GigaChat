import * as yup from 'yup';

export enum WSEvent {
    KEEPALIVE = "keep-alive",
    EVENT = "event",
}

// All events are defined here
export const wsEventSchemas: Record<string, [WSEvent, yup.ObjectSchema<any>?]> = {
    "keep-alive": [WSEvent.KEEPALIVE],
    "event": [
        WSEvent.EVENT,
        yup.object({
            chat: yup.string().required(),
            content: yup.string().required(),
        })
    ]
};
