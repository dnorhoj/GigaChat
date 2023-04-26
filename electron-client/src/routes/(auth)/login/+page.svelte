<script lang="ts">
    import { goto } from "$app/navigation";
    import { api } from "$lib/api";
    import { b64, SecurityKey } from "$lib/crypto";
    import Swal from "sweetalert2";
    import * as yup from "yup";

    let email: string, password: string;

    const loginSchema = yup.object().shape({
        email: yup.string().email().required("Email is required"),
        password: yup.string().min(8).max(100).required(),
    });

    const submit = async () => {
        try {
            await loginSchema.validate({
                email,
                password,
            });
        } catch (error: any) {
            Swal.fire({
                title: "Error",
                text: error.message,
                icon: "error",
            });
            return;
        }

        api("/auth/login", {
            body: {
                email,
                password,
            },
        })
            .then((data) => {
                // Request security key
                Swal.fire({
                    title: "Restore messages",
                    text: "Enter your security key to restore your messages",
                    input: "text",
                }).then(async (keyPrompt) => {
                    let securityKey = keyPrompt.value;
                    try {
                        // This will fail if the key is wrong
                        const key = SecurityKey.import(securityKey);
                        const aesKey = await key.deriveKey();
                        b64(await aesKey.decrypt(
                            data.encryptedKey
                        ));
                    } catch (error: any) {
                        console.error(error);
                        Swal.fire({
                            title: "Error",
                            text: "Wrong security key",
                            icon: "error",
                        });
                        return;
                    }

                    // Save data
                    localStorage.setItem("sessionKey", data.token);
                    localStorage.setItem("securityKey", securityKey);

                    goto("/app");
                });
            })
            .catch((error) => {
                Swal.fire({
                    title: "Error",
                    text: error.message,
                    icon: "error",
                });
            });
    };
</script>

<div class="card bg-base-200">
    <form class="card-body" on:submit|preventDefault={submit}>
        <div class="card-title">
            <h1>Welcome! Please log in.</h1>
        </div>
        <div class="mt-3 form-control">
            <label for="email" class="label">Email</label>
            <input
                id="email"
                class="input input-bordered"
                bind:value={email}
                type="email"
                placeholder="Email"
            />
        </div>
        <div class="mt-3 form-control">
            <label for="password" class="label">Password</label>
            <input
                id="password"
                class="input input-bordered"
                bind:value={password}
                type="password"
                placeholder="Password"
            />
        </div>
        <div class="mt-6 flex justify-between">
            <button class="btn btn-primary" type="submit">Login</button>
            <a class="btn btn-outline" href="/register">Don't have a user?</a>
        </div>
    </form>
</div>
