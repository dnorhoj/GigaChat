import { get } from "svelte/store";
import { user } from "$lib/stores";
import { PUBLIC_API_URL } from "$env/static/public";

export class APIError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

type APIParams = {
    method?: "GET" | "POST";
    body?: any;
    headers?: Record<string, string>,
}

export const api = async (
    url: string,
    params: APIParams = {
        method: "GET"
    }
): Promise<any> => {
    let { method, body, headers } = params;

    // Set headers if not set and default headers
    if (!headers) headers = {};
    headers["Accept"] = "application/json";

    // Set method to POST if body is set
    if (!method && body) method = "POST";

    // Set url
    url = url.startsWith("/") ? url : "/" + url;
    url = PUBLIC_API_URL + url;

    // Add session token to headers if logged in
    const userValue = get(user);

    if (userValue) {
        headers["X-Token"] = userValue.sessionKey;
    }

    const res = await fetch(url, {
        method,
        headers: {
            ...(body ? { "Content-Type": "application/json" } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();

    if (!json) {
        console.error("No JSON response for API call", url);
        throw new APIError("Something went wrong!", res.status);
    }

    if (!json.status) {
        console.error("API error", json.message);
        throw new APIError(json.message, res.status);
    }

    return json.data ?? {};
}
