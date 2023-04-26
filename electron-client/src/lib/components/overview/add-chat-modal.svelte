<script lang="ts">
    import { api } from "$lib/api";
    import Loading from "$lib/components/general/loading.svelte";
    import { toast } from "$lib/swal-mixins";

    export let id: string;

    let loading = false,
        inputEl: HTMLInputElement,
        closeEl: HTMLInputElement,
        input: string,
        error: string | undefined;

    const sendChatRequest = async () => {
        loading = true;
        error = undefined;
        try {
            await api("/chat/send-chat-request", {
                method: "POST",
                body: {
                    username: input,
                },
            });

            closeEl.checked = false;
            toast.fire({
                icon: "success",
                title: "Chat request sent",
            });
        } catch (e) {
            // @ts-ignore
            error = e.message ?? "Something went wrong";
        } finally {
            loading = false;
        }
    };
</script>

<input
    type="checkbox"
    {id}
    class="modal-toggle"
    on:click={() => setTimeout(() => inputEl.focus(), 100)}
    bind:this={closeEl}
/>
<label class="modal" for="add-chat">
    <label class="modal-box" for="">
        <label for={id} class="btn btn-sm btn-circle absolute right-2 top-2"
            >✕</label
        >

        <!-- Content -->
        <h2 class="text-2xl font-bold">Send chat request</h2>

        <form on:submit={sendChatRequest} class="mt-3">
            <label class="label" for="add-user-input">
                <span class="label-text">Username</span>
            </label>
            <input
                id="add-user-input"
                type="text"
                placeholder="Type here"
                class="input input-bordered input-sm w-full"
                class:input-error={error}
                bind:this={inputEl}
                bind:value={input}
            />
            {#if error}
                <label class="label" for="add-user-input">
                    <span class="label-text-alt text-error">
                        {error}
                    </span
                    >
                </label>
            {/if}

            <button
                class="btn btn-primary mt-3"
                type="submit"
                disabled={loading}
            >
                Send
            </button>
        </form>
    </label>
</label>
