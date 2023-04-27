<script lang="ts">
    import { user } from "$lib/stores/user";
    import type { Event } from "$lib/types";
    import ChatBubble from "./chat-bubble.svelte";

    export let messages: Event[];

    let isOwn: boolean;

    isOwn = messages[0].from === $user?.id;
</script>

{#each messages as message, i}
    <ChatBubble {message} {isOwn} first={i === 0} last={i === messages.length - 1} />
{/each}
