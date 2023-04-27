<script lang="ts">
    import { chatInfo } from "$lib/stores/chat-info";
    import { ws } from "$lib/stores/user";

    let message: string = "";

    const sendMessage = async () => {
        if (!$ws || !$chatInfo) return;

        // Encrypt message with AES key
        const content = await $chatInfo.key.encryptText(JSON.stringify({
            type: "message",
            data: message,
        }));

        $ws.send("event", {
            chat: $chatInfo.id,
            content,
        });

        message = "";
    }
</script>

<div class="form-control flex flex-row">
    <textarea
        class="textarea flex-grow resize-none rounded-none"
        placeholder="Message {$chatInfo?.user.name ?? ""}"
        bind:value={message}
        on:keydown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        }}
    />
    <button class="btn btn-primary rounded-none h-auto" on:click={sendMessage}>Send</button>
</div>
