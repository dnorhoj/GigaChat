<script lang="ts">
    import { page } from "$app/stores";
    import { api } from "$lib/api";
    import { AESKey, ub64 } from "$lib/crypto";
    import { chatInfo } from "$lib/stores/chat-info";
    import { user, ws } from "$lib/stores/user";
    import { toast } from "$lib/swal-mixins";
    import { EventType, type Event } from "$lib/types";
    import { afterUpdate, onDestroy, onMount } from "svelte";

    import MessageGroup from "$lib/components/chat/message-group.svelte";
    import Loading from "$lib/components/general/loading.svelte";

    export let chatWindowEl: HTMLDivElement;

    let loading = true,
        initialLoad = true,
        scroll = true;

    let messageGroups: Event[][] = [];

    const fetchMessages = async () => {
        let chatData;
        try {
            chatData = await api("/chat/get-events", {
                body: {
                    username: $page.params.chat,
                    initial: true,
                },
            });

            return chatData;
        } catch (e) {
            toast.fire({
                title: "An error occured while fetching messages",
                icon: "error",
            });
            console.error(e);
        }
    };

    const loadChat = async () => {
        loading = true;

        const chatData = await fetchMessages();
        if (!chatData) return;

        const encryptedKey = chatData.initial.encryptedKey;

        // Decrypt AES key
        let key: AESKey;
        try {
            const decryptedKey = await $user!.rsaKey.decrypt(
                ub64(encryptedKey)
            );

            key = await AESKey.import(decryptedKey);
        } catch (e) {
            toast.fire({
                title: "An error occured while loading the chat",
                icon: "error",
            });
            console.error(e);
            return;
        }

        $chatInfo = {
            id: chatData.initial.id,
            key: key,
            user: chatData.initial.user,
        };

        for (const event of chatData.events) {
            await handleEvent(event, true);
        }

        loading = false;
        initialLoad = false;
        scroll = true;
    };

    /* Handle incoming events (reverse means that the event is from the past) */
    const handleEvent = async (data: any, reverse: boolean = false) => {
        if (data.chat !== $chatInfo?.id) return;

        let content: any;
        try {
            const decrypted = await $chatInfo!.key.decryptText(data.content);

            content = JSON.parse(decrypted);
        } catch (e) {
            console.error(e);
            content = {
                type: EventType.ERROR,
            };
        }

        const message = {
            ...data,
            content,
        };

        // Add to previous group if possible
        if (
            messageGroups.length > 0 &&
            messageGroups[messageGroups.length - 1][0].from === message.from
        ) {
            messageGroups[messageGroups.length - 1].push(message);
        } else {
            messageGroups.push([message]);
        }

        messageGroups = messageGroups;

        if (!reverse) {
            // Scroll to bottom
            scroll = true;
        }
    };

    const scrollToBottom = async () => {
        if (!chatWindowEl) return;

        chatWindowEl.scroll({
            top: chatWindowEl.scrollHeight
        });
    };

    afterUpdate(() => {
        if (scroll) {
            scrollToBottom();
        }
    });

    onMount(async () => {
        loadChat();
        $ws?.on("event", handleEvent);
    });

    onDestroy(async () => {
        $ws?.off("event", handleEvent);
    });
</script>

{#if loading || initialLoad}
    <Loading />
{/if}

{#if !initialLoad}
    {#each messageGroups as messageGroup (messageGroup[0].id + messageGroup.length)}
        <MessageGroup messages={messageGroup} />
    {/each}
{/if}
