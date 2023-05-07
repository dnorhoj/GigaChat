<script lang="ts">
    import { chatInfo } from "$lib/stores/chat-info";
    import { ws } from "$lib/stores/user";
    import { toast } from "$lib/swal-mixins";

    let message: string = "";

    const sendMessage = async () => {
        if (!$ws || !$chatInfo) return;
        if (!message.trim()) return;
        if (message.trim().length > 1000) {
            toast.fire({
                icon: "error",
                title: "Message too long",
            });
            return;
        }

        // Encrypt message with AES key
        const content = await $chatInfo.key.encryptText(JSON.stringify({
            type: "message",
            data: message.trim(),
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
