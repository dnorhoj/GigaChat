<script lang="ts">
    import { chatInfo } from "$lib/stores/chat-info";
</script>

<div class="flex justify-between items-center">
    <div class="ml-2">
        <span class="text-xl font-semibold">{$chatInfo?.user.name}</span>
    </div>
    <button class="btn btn-primary rounded-none h-auto">Settings</button>
</div>
