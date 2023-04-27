<script lang="ts">
    import { page } from "$app/stores";
    import { api } from "$lib/api";
    import { user } from "$lib/stores/user";
    import { toast } from "$lib/swal-mixins";
    import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
    import { onMount } from "svelte";
    import Fa from "svelte-fa";
    import Loading from "../general/loading.svelte";

    let chats: any = [],
        loading = true;

    const handleNotification = () => {};

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

        // Make active chat have active: true
        data.chats.forEach((chat: any) => {
            if (chat.chatUsers[0].user.username === $page.params.chat) {
                chat.active = true;
            }
        });

        chats = data.chats;
        //chatRequests = data.chatRequests;

        loading = false;
    };

    onMount(() => {
        getChats();
    });
</script>

<div class="w-[20vw] border-r border-base-content border-opacity-20">
    <div
        class="bg-base-200 border-b border-b-base-content border-opacity-20 flex items-center"
    >
        <a class="btn btn-ghost rounded-none h-auto w-full" href="/app">
            <Fa icon={faArrowLeft} />
        </a>
    </div>
    {#if loading}
        <Loading />
    {/if}
    <ul class="menu p-4 w-full bg-base-100 text-base-content">
        {#each chats as chat}
            <li class="w-full">
                <a
                    href="/app/chat/{chat.chatUsers[0].user.username}"
                    class="w-full"
                    class:bg-base-content={chat.active}
                    class:bg-opacity-20={chat.active}
                >
                    <span class="text-lg">{chat.chatUsers[0].user.name}</span>
                </a>
            </li>
        {/each}
    </ul>
</div>
