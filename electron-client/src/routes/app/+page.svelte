<script lang="ts">
    import Chat from "$lib/components/overview/chat.svelte";

    const chats = [
        { id: "test", name: 'dnorhoj', notifications: 69 },
        { id: "ost", name: 'joebidengamerboy', notifications: 169 },
    ];
</script>

<svelte:head>
    <title>Chats | GigaChat</title>
</svelte:head>

<div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-3xl font-bold">Chats</h1>
    <p class="text-gray-500">Click on a chat to open it!</p>
</div>

{#each chats as chat}
    <Chat {chat} />
{/each}
