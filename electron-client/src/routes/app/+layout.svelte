<script lang="ts">
    import { WebSocketConnection } from "$lib/ws";
    import { user, ws } from "$lib/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    onMount(async () => {
        if (!$user) {
            let here = window.location.pathname;

            goto(`/?redirect=${encodeURIComponent(here)}`);
            return
        }

        // Set up websocket connection
        $ws = new WebSocketConnection();
    });
</script>

{#if $user}
    <slot />
{/if}
