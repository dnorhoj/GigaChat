<script lang="ts">
    import type { Message } from "$lib/types";

    export let message: Message,
        isOwn: boolean,
        first: boolean = false,
        last: boolean = false;

    const date = new Date(message.timestamp / 1000);
    let dateString = "";

    if (first) {
        if (date.toDateString() === new Date().toDateString()) {
            // HH:MM format
            dateString =
                date.getHours().toString().padStart(2, "0") +
                ":" +
                date.getMinutes().toString().padStart(2, "0");
        } else {
            dateString = date.toLocaleString();
        }
    }
</script>

<div
    class="chat pb-0"
    class:chat-start={!isOwn}
    class:chat-end={isOwn}
    class:pt-4={first}
    class:pt-0.5={!first}
>
    {#if first}
        <div class="chat-header">
            {message.author}
            <time
                class="text-xs opacity-50 select-none"
                title={date.toLocaleString()}
            >
                {dateString}
            </time>
        </div>
    {/if}
    <div
        class="chat-bubble"
        class:last
        class:first
        class:start={!isOwn}
        class:end={isOwn}
        class:chat-bubble-primary={isOwn}
    >
        {message.content}
    </div>
</div>

<style>
    .chat-bubble:not(.last)::before {
        display: none !important;
    }

    .start.chat-bubble:not(.first) {
        @apply rounded-tl-none;
    }

    .end.chat-bubble:not(.first) {
        @apply rounded-tr-none;
    }
</style>
