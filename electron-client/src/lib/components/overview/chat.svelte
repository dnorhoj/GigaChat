<script lang="ts">
    export let chat: any;
    if (chat.notifications === undefined) {
        chat.notifications = 0;
    } else if (chat.notifications > 99) {
        chat.notifications = "99+";
    }
</script>
<ul class="menu bg-base-100 rounded-box container mx-auto">
    <div class="indicator">
        <span class="indicator-item badge bg-primary">{chat.notifications}</span>
    </div>
    <div class="flex justify-between">
        <li class="grow">
            <a class="py-5 rounded-box" href={`/app/chats/${chat.id}`}>{chat.name}</a>
        </li>
        <a class="self-center btn btn-outline btn-error" href={`/app/chats/${chat.id}/close`}>close</a>
    </div>
</ul>
