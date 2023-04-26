<script lang="ts">
    import type { Message } from "$lib/types";
    import MessageGroup from "$lib/components/chat/message-group.svelte";
    import MessageField from "$lib/components/chat/message-field.svelte";
    import ChatInfo from "$lib/components/chat/chat-info.svelte";
    import ChatList from "$lib/components/chat/chat-list.svelte";

    const messageGroups: { messages: Message[]; isOwn: boolean }[] = [
        {
            messages: [
                {
                    id: "",
                    author: "dnorhoj",
                    content: "Hej Otto!",
                    timestamp: new Date().getTime() * 1000,
                },
                {
                    id: "",
                    author: "dnorhoj",
                    content: "Hvordan går det?",
                    timestamp: new Date().getTime() * 1000,
                },
            ],
            isOwn: true,
        },
        {
            messages: [
                {
                    id: "",
                    author: "Super02",
                    content: "Hej!",
                    timestamp: new Date().getTime() * 1000,
                },
                {
                    id: "",
                    author: "Super02",
                    content: "Det går fint!",
                    timestamp: new Date().getTime() * 1000,
                },
            ],
            isOwn: false,
        },
    ];

    const getMessages = async () => {
        const response = await fetch("/api/chat/get-events");
        const data = await response.json();
        console.log(data);
    };

    // Repeat the message groups to test the chat bubble
    // messageGroups.push(...messageGroups);
    // messageGroups.push(...messageGroups);
    // messageGroups.push(...messageGroups);
    // messageGroups.push(...messageGroups);
    // messageGroups.push(...messageGroups);
</script>

<div class="flex h-screen">
    <!-- Chats -->
    <ChatList />

    <!-- Current chat -->
    <div class="h-full flex-grow flex flex-col justify-between">
        <div class="border-b border-base-content border-opacity-20">
            <ChatInfo recipient="" />
        </div>
        <div>
            <div class="max-h-full overflow-y-hidden">
                {#each messageGroups as messageGroup}
                    <MessageGroup
                        messages={messageGroup.messages}
                        isOwn={messageGroup.isOwn}
                    />
                {/each}
            </div>
            <div class="mt-5 border-t border-base-content border-opacity-20">
                <MessageField recipient="Super02" />
            </div>
        </div>
    </div>
</div>
