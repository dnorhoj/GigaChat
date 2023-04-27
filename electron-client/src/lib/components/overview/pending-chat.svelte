<script lang="ts">
    import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
    import { api } from "$lib/api";
    import { toast } from "$lib/swal-mixins";
    import { AESKey, RSAKey, b64 } from "$lib/crypto";
    import { user } from "$lib/stores/user";
    import { goto } from "$app/navigation";

    export let chatRequest: any;

    const approve = async () => {
        let data;
        try {
            data = await api("/chat/request/approve/start", {
                method: "POST",
                body: {
                    requestId: chatRequest.id,
                },
            });
        } catch (e) {
            console.error(e);
            toast.fire({
                icon: "error",
                title: "Failed to approve chat request",
            });
            return;
        }

        // Import user's RSA public key
        let publicKey;
        try {
            publicKey = await RSAKey.importPublicKey(data.publicKey);
        } catch (e) {
            console.error(e);
            toast.fire({
                icon: "error",
                title: `Failed to import public key of ${chatRequest.sender.username}`,
            });
            return;
        }

        // Generate AES key
        const aesKey = await AESKey.generate();
        const exportedKey = await aesKey.export();
        
        // Encrypt AES key with user's RSA public key
        const encryptedSenderKey = b64(await publicKey.encrypt(exportedKey));

        // Encrypt AES key with sender's RSA public key
        const encryptedRecipientKey = b64(await $user!.rsaKey.encrypt(exportedKey));

        try {
            await api("/chat/request/approve/finish", {
                method: "POST",
                body: {
                    requestId: chatRequest.id,
                    encryptedRecipientKey,
                    encryptedSenderKey,
                },
            });

            goto(`/app/chat/${chatRequest.sender.username}`);
        } catch (e: any) {
            console.error(e);
            toast.fire({
                icon: "error",
                title: `Failed to approve chat request; ${e?.message}`
            });
            return;
        }
    };

    const deny = async () => {
        console.log("Deny");
    };
</script>

<ul class="bg-base-100 rounded-box">
    <div class="flex justify-between items-center rounded-lg bg-base-200">
        <div class="p-5">
            {chatRequest.sender.name}
            <span class="dark:text-secondary-content">
                (@{chatRequest.sender.username})
            </span>
        </div>
        <div class="pe-2">
            <button class="btn btn-success" on:click={approve}
                ><Fa icon={faCheck} /></button
            >
            <button class="btn btn-error" on:click={deny}
                ><Fa icon={faXmark} /></button
            >
        </div>
    </div>
</ul>
