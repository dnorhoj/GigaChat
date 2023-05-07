<script lang="ts">
    import { chatInfo } from "$lib/stores/chat-info";
    import { faArrowLeft, faGear } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
</script>

<div class="flex justify-between items-center">
    <div>
        <a class="btn btn-ghost rounded-none h-auto md:hidden bg-base-200 border-r-base-content border-opacity-20 w-14" href="/app">
            <Fa icon={faArrowLeft} />
        </a>
        <span class="ml-1 text-xl font-semibold">{$chatInfo?.user.name}</span>
    </div>
    <button class="btn btn-primary rounded-none h-auto w-14">
        <Fa icon={faGear} />
    </button>
</div>
