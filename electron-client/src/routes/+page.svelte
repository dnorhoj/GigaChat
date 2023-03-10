<script lang="ts">
    import { sendNotification } from "$lib/ipc-events";

    const notify = () => {
        sendNotification("Test", "Message");
    };
</script>

<svelte:head>
    <title>Chats | GigaChat</title>
</svelte:head>

<button on:click={notify}>Test notification</button>
