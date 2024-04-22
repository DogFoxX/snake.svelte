<script>
    import { State } from "$lib/store";
</script>

<div>
    <span id="lives" class="text-xl">
        {#each {length: $State.lives} as _}
            <i>♥</i>
        {/each}
    </span>
    <span id="score">{$State.score}</span>
</div>

<style>
    div {
        display: flex;
        align-items: center;
        width: 100%;
    }

    #lives {
        flex-grow: 1;
    }

    #lives i {
        padding: 0.1rem;
        color: crimson;
    }
</style>