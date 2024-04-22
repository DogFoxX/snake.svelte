<script>
    import "$lib/app.css";
    import GameInfo from "$lib/game-info.svelte";
</script>

<main>
    <div id="game">
        <GameInfo />
        <slot />
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #game {
        width: 400px;
    }
</style>