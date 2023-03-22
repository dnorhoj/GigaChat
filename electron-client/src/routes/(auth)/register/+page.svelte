<script lang="ts">
    import { api } from "$lib/api";

    let name: string,
        username: string,
        email: string,
        password: string,
        cPassword: string;

    const submit = async () => {
        const a = 1;

        api("/register", {
            method: "POST",
            body: JSON.stringify({
                name,
                username,
                email,
                password,
            }),
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
                />
                <label for="name" class="label">
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
