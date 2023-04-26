<script lang="ts">
    import { goto } from "$app/navigation";
    import { api } from "$lib/api";
    import { SecurityKey, RSAKey } from "$lib/crypto";
    import Swal from "sweetalert2";
    import * as yup from "yup";

    let name: string,
        username: string,
        email: string,
        password: string,
        cPassword: string;

    const registerSchema = yup.object().shape({
        username: yup.string().min(3).max(20).matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores").required(),
        password: yup.string().min(8).max(100).required(),
        name: yup.string().min(1).max(32).required(),
        email: yup.string().email().required(),
    });

    const submit = async () => {
        try {
            if (password !== cPassword) {
                throw new Error("Passwords do not match");
            }

            await registerSchema.validate({
                name,
                username,
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

        // Send register start request
        try {
            await api("/auth/register/start", {
                body: {
                    username,
                    email,
                },
            });
        } catch (error: any) {
            Swal.fire({
                title: "Error",
                text: error.message,
                icon: "error",
            });
            return;
        }

        const securityKey = new SecurityKey();
        const aesKey = await securityKey.deriveKey();
        const exported = securityKey.export();

        const securityConfirm = await Swal.fire({
            title: "Your security key",
            text: "",
            html: `
                <div class="text-base">
                    <p>
                        Your security key is used to encrypt your messages.
                    </p>
                    <p>
                        If you lose it, you will not be able to decrypt your messages.
                    </p>
                    <p>
                        Please save it somewhere safe.
                    </p>
                </div>
                <div class="mt-4">
                    <div class="text-sm text-primary">
                        Your security key
                    </div>
                    <code class="text-sm block">
                        ${exported}
                    </code>
                    <button onclick="navigator.clipboard.writeText('${exported}')" class="btn btn-primary btn-sm mt-1">
                        Copy to clipboard
                    </button>
                </div>
            `,
            icon: "info",
            confirmButtonText: "I have saved it!",
            showCancelButton: true,
            cancelButtonColor: "#d33",
        });

        if (!securityConfirm.isConfirmed) {
            return;
        }

        const confirm = await Swal.fire({
            title: "Check security key",
            text: "Please enter your security key to confirm you have saved it.",
            icon: "info",
            confirmButtonText: "Confirm",
            showCancelButton: true,
            cancelButtonColor: "#d33",
            input: "text",
            preConfirm: (key) => {
                if (key !== exported) {
                    Swal.showValidationMessage("Security key does not match");
                }
            },
        });

        if (!confirm.isConfirmed) {
            return;
        }

        // RSA keypair
        const rsaKey = await RSAKey.generate();

        // Extract public key
        const publicKey = await rsaKey.exportPub();
        
        // Extract and encrypt private key with the AES key
        const privateKey = await rsaKey.exportPriv();
        const encryptedPrivateKey = await aesKey.encrypt(privateKey);

        await Swal.fire({
            title: "Registering...",
            text: "Please wait...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
                api("/auth/register", {
                    body: {
                        name,
                        username,
                        email,
                        password,
                        publicKey,
                        encryptedKey: encryptedPrivateKey,
                    },
                })
                    .then((data) => {
                        localStorage.setItem("securityKey", exported)
                        localStorage.setItem("sessionKey", data.token);
                        Swal.close();
                        goto("/app");
                    })
                    .catch((error) => {
                        console.error(error);
                        Swal.fire({
                            title: "Error",
                            text: error.message,
                            icon: "error",
                        });
                    });
            },
        });
    };
</script>

<div class="card bg-base-200">
    <form class="card-body" on:submit|preventDefault={submit}>
        <div class="card-title">
            <div>
                <h1>Welcome to GigaChat!</h1>
                <h2 class="text-sm text-primary">
                    Please register an account.
                </h2>
            </div>
        </div>
        <div class="form-control">
            <label for="name" class="label">Name</label>
            <input
                id="name"
                class="input input-bordered"
                bind:value={name}
                type="text"
                placeholder="Name"
                min="1"
                max="32"
            />
            <label for="name" class="label">This is your display name</label>
        </div>
        <div class="lg:flex lg:space-x-4">
            <div class="form-control flex-grow">
                <label for="username" class="label">Username</label>
                <input
                    id="username"
                    class="input input-bordered"
                    bind:value={username}
                    type="text"
                    placeholder="Username"
                    min="3"
                    max="20"
                />
                <label for="username" class="label">
                    This is how other people find you
                </label>
            </div>
            <div class="form-control flex-grow">
                <label for="email" class="label">Email</label>
                <input
                    id="email"
                    class="input input-bordered"
                    bind:value={email}
                    type="email"
                    placeholder="Email"
                />
                <label for="name" class="label">Your email</label>
            </div>
        </div>
        <div class="lg:flex lg:space-x-4">
            <div class="form-control flex-grow">
                <label for="password" class="label">Password</label>
                <input
                    id="password"
                    class="input input-bordered"
                    bind:value={password}
                    type="password"
                    placeholder="Password"
                    min="8"
                    max="100"
                />
                <label for="name" class="label">Your password</label>
            </div>
            <div class="form-control flex-grow">
                <label for="c_password" class="label">Confirm password</label>
                <input
                    id="c_password"
                    class="input input-bordered"
                    bind:value={cPassword}
                    type="password"
                    placeholder="Password"
                    min="8"
                    max="100"
                />
                <label for="name" class="label">Confirm your password</label>
            </div>
        </div>
        <div class="mt-6 flex justify-between">
            <button class="btn btn-primary" type="submit">Register</button>
            <a class="btn btn-outline" href="/login">Already have a user?</a>
        </div>
    </form>
</div>
