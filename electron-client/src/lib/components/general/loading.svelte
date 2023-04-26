<script lang="ts">
    import Fa from "svelte-fa";
    import { faSpinner } from "@fortawesome/free-solid-svg-icons";
</script>

<div class="w-full h-full flex flex-col justify-center items-center gap-5">
    <Fa icon={faSpinner} spin size="2x" {...$$restProps} />
</div>
