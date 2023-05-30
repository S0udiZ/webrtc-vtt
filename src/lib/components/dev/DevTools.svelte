<script lang="ts">
    import { DevContext } from "$lib/context/dev/DevContext";
</script>

<div>
    <h2 class="h2">Mouse</h2>
    <p>X: {$DevContext.mouse.x}</p>
    <p>Y: {$DevContext.mouse.y}</p>
    <p>Target: {$DevContext.mouse.target}</p>
    <p>Down: {$DevContext.mouse.down}</p>
    <p>Click: {$DevContext.mouse.click}</p>
</div>