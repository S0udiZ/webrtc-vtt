<script lang="ts">
	import Chat from '$lib/components/chat/Chat.svelte';
	import DevTools from '$lib/components/dev/DevTools.svelte';
	import Playmat from '$lib/components/playmat/Playmat.svelte';
	import Tokens from '$lib/components/tokens/Tokens.svelte';
	import { AppShell, Tab, TabGroup } from '@skeletonlabs/skeleton';

    import { getContext } from 'svelte';

	let tabSet: number = 0;
    let user: string = getContext('player');
</script>

<AppShell>
	<Playmat {user} />
	<svelte:fragment slot="sidebarRight">
		<div class="relative h-full">
            <TabGroup class="w-80 border-l border-primary-700 h-full">
                <Tab bind:group={tabSet} name="chat" value={0}>Chat</Tab>
                <Tab bind:group={tabSet} name="chat" value={1}>Tokens</Tab>
                <Tab bind:group={tabSet} name="dev" value={2}>Dev</Tab>
                <svelte:fragment slot="panel">
                    <section class="absolute inset-0 top-[43px]">
                        {#if tabSet === 0}
                            <Chat />
                        {:else if tabSet === 1}
                            <Tokens />
                        {:else if tabSet === 2}
                            <DevTools />
                        {/if}
                    </section>
                </svelte:fragment>
            </TabGroup>
        </div>
	</svelte:fragment>
</AppShell>
