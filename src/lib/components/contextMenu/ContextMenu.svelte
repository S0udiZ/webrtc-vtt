<script lang="ts">
	import type { Token } from "$lib/types/Tokens";
    import { TokensContext } from "$lib/context/TokensContext";
	import { ContextMenuToken } from "$lib/context/ContextMenuToken";
	import { GridContext } from "$lib/context/GridContext";
    export let user: string;

    let squareSize: number;
	$: squareSize = 94 * $GridContext.scale;
</script>

{#if $ContextMenuToken.token}
    <div class="fixed card border border-secondary-500 z-[9999]" 
    style="
    {$ContextMenuToken.flipped ? `top: ${$ContextMenuToken.y}px; right: ${window.innerWidth - $ContextMenuToken.x}px;` : 
    `top: ${$ContextMenuToken.y}px;
    left: ${($ContextMenuToken.x)}px;`}">
        {user}
        {$ContextMenuToken.flipped}
    </div>
{/if}