<script lang="ts">
    export let recipient: string;
</script>

<div class="form-control flex flex-row">
    <textarea
        class="textarea flex-grow resize-none rounded-none"
        placeholder="Message {recipient}"
    />
    <button class="btn btn-primary rounded-none h-auto">Send</button>
</div>
