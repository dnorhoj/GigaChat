<script lang="ts">
    import ChatInfo from "$lib/components/chat/chat-info.svelte";
    import ChatList from "$lib/components/chat/chat-list.svelte";
    import ChatWindow from "$lib/components/chat/chat-window.svelte";
    import MessageField from "$lib/components/chat/message-field.svelte";

    let chatWindowEl;
</script>

<div class="flex h-screen w-screen">
    <!-- Chats -->
    <ChatList />

    <!-- Current chat -->
    <div class="h-full flex-grow flex flex-col w-screen">
        <div class="border-b border-base-content border-opacity-20 h-15">
            <ChatInfo />
        </div>
        <div class="flex flex-col justify-end flex-grow overflow-y-scroll">
            <div class="max-h-full overflow-y-scroll overflow-x-hidden pb-5" bind:this={chatWindowEl}>
                <ChatWindow {chatWindowEl} />
            </div>
        </div>
        <div class="border-t border-base-content border-opacity-20">
            <MessageField />
        </div>
    </div>
</div>
