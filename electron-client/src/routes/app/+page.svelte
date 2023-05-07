<script lang="ts">
    import { api } from "$lib/api";
    import { toast } from "$lib/swal-mixins";
    import { onDestroy, onMount } from "svelte";
    import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
    import { user, ws } from "$lib/stores/user";

    import Loading from "$lib/components/general/loading.svelte";
    import ChatOverview from "$lib/components/overview/chat-overview.svelte";
    import AddChatModal from "$lib/components/overview/add-chat-modal.svelte";
    import PendingChat from "$lib/components/overview/pending-chat.svelte";

    let chats: any, chatRequests: any;

    const getChats = async () => {
        let data;
        try {
            data = await api("/chat/get-overview");
        } catch (e) {
            console.error(e);
            toast.fire({
                icon: "error",
                title: "Failed to get chats",
            });
            return;
        }

        chats = data.chats;
        chatRequests = data.chatRequests;
    };

    const handleReload = () => {
        getChats();
    };

    const handleEvent = (data: any) => {
        if (data.from === $user?.id) return;

        for (const chat of chats) {
            if (chat.chatUsers[0].user.id === data.from) {
                chat.unread++;
                chats = [chat, ...chats.filter((c: any) => c !== chat)];
                break;
            }
        }
    };

    onMount(() => {
        getChats();
        $ws!.on("overview-reload", handleReload);
        $ws!.on("event", handleEvent);
    });

    onDestroy(() => {
        $ws!.off("overview-reload", handleReload);
        $ws!.off("event", handleEvent);
    });
</script>

<svelte:head>
    <title>Chats | GigaChat</title>
</svelte:head>

<div class="container mx-auto mt-2 md:mt-10">
    <div
        class="flex flex-col md:flex-row justify-between items-center w-full gap-2 md:gap-0"
    >
        <h2 class="text-2xl font-bold">Welcome, {$user?.name}!</h2>
        <div class="flex items-center gap-2 w-full md:w-fit px-2 md:mx-0">
            <label class="btn btn-primary flex-grow" for="add-chat"
                >Start new chat</label
            >
            <button class="btn btn-error btn-outline">
                <Fa icon={faRightFromBracket} />
            </button>
        </div>
    </div>

    {#if !chats && !chatRequests}
        <div class="mt-5">
            <Loading />
        </div>
    {:else}
        <!-- Pending chats -->
        {#if chatRequests.length > 0}
            <div
                class="collapse collapse-plus border border-base-300 bg-base-100 rounded-box mt-5"
            >
                <input type="checkbox" class="peer" />
                <div class="font-bold collapse-title">
                    Pending chats ({chatRequests.length})
                </div>
                <div class="collapse-content">
                    {#each chatRequests as chatRequest}
                        <PendingChat {chatRequest} />
                    {/each}
                </div>
            </div>
        {/if}

        {#if chats.length === 0}
            <div class="mt-5 alert alert-info">
                You don't have any chats yet. Start a new chat by clicking the
                button above.
            </div>
        {/if}

        {#each chats as chat}
            <div class="mx-2">
                <ChatOverview {chat} />
            </div>
        {/each}
    {/if}
</div>

<AddChatModal id="add-chat" />
