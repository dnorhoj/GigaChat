<script lang="ts">
    export let chat: any;
</script>

<ul class="bg-base-100 rounded-box container mx-auto mb-2">
    <a
        href="/app/chat/{chat.chatUsers[0].user.username}"
        class="flex justify-between items-center rounded-lg bg-base-200"
    >
        <div class="p-5">
            {chat.chatUsers[0].user.name}
            <span class="dark:text-secondary-content">
                (@{chat.chatUsers[0].user.username})
            </span>
        </div>
        {#if chat.unread > 0}
            <span class="badge badge-primary mx-5">
                {#if chat.unread > 99}
                    99+
                {:else}
                    {chat.unread}
                {/if}
            </span>
        {/if}
    </a>
</ul>
