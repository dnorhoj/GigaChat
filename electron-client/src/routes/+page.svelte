<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { APIError, api } from "$lib/api";
    import { user } from "$lib/stores/user";
    import Loading from "$lib/components/general/loading.svelte";
    import { SecurityKey, RSAKey } from "$lib/crypto";

    // Saves user to store and gets privateKey
    const handleUser = async (
        user: any,
        securityKey: string,
        sessionKey: string
    ) => {
        const securityKeyInstance = new SecurityKey(securityKey);

        const rsaKey = await RSAKey.importFullKey(
            user.publicKey,
            user.encryptedKey,
            securityKeyInstance
        );

        $user = {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            rsaKey,
            sessionKey,
        };
    };

    onMount(async () => {
        // Check if user is logged in.
        const sessionKey = window.localStorage.getItem("sessionKey");
        const securityKey = window.localStorage.getItem("securityKey");

        if (!sessionKey || !securityKey) {
            // Redirect to login page.
            return goto("/login");
        }

        while (true) {
            try {
                // Check if session is valid.
                const data = await api("/auth/verify", {
                    body: {
                        token: sessionKey,
                    },
                });
                await handleUser(data.user, securityKey, sessionKey);

                // Redirect back to where they were if redirect query param is set
                const redirectUrl = decodeURIComponent(
                    window.location.search
                ).match(/^\?redirect=(\/app(?:\/.*)?)$/);

                if (redirectUrl) {
                    goto(redirectUrl[1]);
                } else {
                    goto("/app");
                }

                return;
            } catch (err) {
                if (err instanceof APIError) {
                    console.error(err);
                    goto("/login");
                    return;
                }

                console.error(err);
            }

            // Wait a second before retrying.
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    });
</script>

<div class="w-screen h-screen">
    <Loading size="3x" />
</div>
