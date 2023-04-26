<script lang="ts">
    export let chat: any;
</script>

<ul class="bg-base-100 rounded-box container mx-auto">
    <div class="indicator">
        {#if chat.unread > 0}
            <span class="indicator-item badge bg-primary text-white">
                {chat.unread}
            </span>
        {/if}
    </div>
    <a
        href="/app/chat/{chat.chatUsers[0].user.username}"
        class="flex justify-between rounded-lg bg-base-200"
    >
        <div class="p-5">
            {chat.chatUsers[0].user.name}
            <span class="dark:text-secondary-content">
                (@{chat.chatUsers[0].user.username})
            </span>
        </div>
        <button
            class="self-center btn btn-outline btn-error mx-2"
        >
            Close
        </button>
    </a>
</ul>
