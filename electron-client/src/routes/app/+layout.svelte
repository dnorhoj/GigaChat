<script lang="ts">
    import { WebSocketConnection } from "$lib/ws";
    import { user, ws } from "$lib/stores/user";
    import { goto } from "$app/navigation";
    import { onDestroy, onMount } from "svelte";

    onMount(async () => {
        if (!$user) {
            let here = window.location.pathname;

            goto(`/?redirect=${encodeURIComponent(here)}`);
            return
        }

        // Set up websocket connection
        $ws = new WebSocketConnection();
    });

    onDestroy(() => {
        $ws?.close();
    });
</script>

{#if $user && $ws}
    <slot />
{/if}
