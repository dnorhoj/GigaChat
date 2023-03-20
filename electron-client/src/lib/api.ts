import { get } from "svelte/store";
import { user } from "$lib/stores";

type APIParams = {
    method?: "GET" | "POST";
    body?: any;
    headers?: any;
}

export const api = async (
    url: string,
    params: APIParams = {
        method: "GET",
    }
) => {
    let { method, body, headers } = params;

    // Set headers if not set and default headers
    if (!headers) headers = {};
    headers["Accept"] = "application/json";

    // Set method to POST if body is set
    if (!method && body) method = "POST";

    // Set url if url is relative
    url = `${window.location.origin}/api${url}`;

    // Add session token to headers if logged in
    const userValue = get(user);

    if (userValue) {
        headers["X-Token"] = userValue.token;
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
        throw { message: "Something went wrong!", status: res.status };
    }

    if (!json.succeeded) {
        console.error("API error", json.error);
        throw { message: json.error, status: res.status };
    }

    return json.data;
}
