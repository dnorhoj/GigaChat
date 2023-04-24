import yup from 'yup';

// All events are defined here
export default {
    ping: null,
    me: null
} as Record<string, yup.ObjectSchema<any> | null>;
