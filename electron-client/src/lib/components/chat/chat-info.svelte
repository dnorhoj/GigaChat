<script lang="ts">
    export let recipient: string;
</script>

<div class="flex justify-between items-center">
    <div class="ml-2">
        <span class="text-xl font-semibold">{recipient}</span>
    </div>
    <button class="btn btn-primary rounded-none h-auto">Settings</button>
</div>
