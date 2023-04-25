<script lang="ts">
    import type { Message } from "$lib/types";
    import ChatBubble from "./chat-bubble.svelte";

    export let messages: Message[], isOwn: boolean;
</script>

{#each messages as message, i}
    <ChatBubble {isOwn} {message} first={i === 0} last={i === messages.length - 1} />
{/each}
