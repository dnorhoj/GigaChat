<script lang="ts">
    import { api } from "$lib/api";

    let email: string, password: string;

    const submit = async () => {
        const data = await api("/login", {
            body: {
                email,
                password
            }
        })

        console.log(data);
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
