<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';

	import { ChatMessages } from '$lib/context/ChatContext';

	let elemChat: HTMLElement;

	function scrollChatBottom(behavior?: ScrollBehavior | 'smooth'): void {
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
	}

	let message = '';

	function handleChatMessageSubmit() {
		if (message.length > 0) {
			ChatMessages.update((messages) => [
				...messages,
				{
					id: messages.length,
					host: false,
					avatar: '14',
					name: 'You',
					timestamp: new Date().toLocaleString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric',
						year: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						hourCycle: 'h24'
					}),
					message: message
				}
			]);
			message = '';
			setTimeout(() => {
				scrollChatBottom('smooth');
			}, 0);
		}
	}
</script>

<div bind:this={elemChat} class="flex flex-col gap-4 p-4 h-full overflow-y-auto">
	{#each $ChatMessages as ChatMessage}
		{#if ChatMessage.name === 'You'}
			<div class="grid grid-cols-[auto_1fr] gap-2 self-end">
				<div class="card p-4 variant-soft rounded-tl-none space-y-2">
					<header class="flex justify-between items-center">
						<p class="font-bold">{ChatMessage.name}</p>
						<small class="opacity-50">{ChatMessage.timestamp}</small>
					</header>
					<p>{ChatMessage.message}</p>
				</div>
				<Avatar src="https://i.pravatar.cc/?img={ChatMessage.avatar}" width="w-12" />
			</div>
		{:else}
			<div class="grid grid-cols-[1fr_auto] gap-2 self-start">
				<Avatar src="https://i.pravatar.cc/?img={ChatMessage.avatar}" width="w-12" />
				<div class="card p-4 rounded-tr-none space-y-2">
					<header class="flex justify-between items-center">
						<p class="font-bold">{ChatMessage.name}</p>
						<small class="opacity-50">{ChatMessage.timestamp}</small>
					</header>
					<p>{ChatMessage.message}</p>
				</div>
			</div>
		{/if}
	{/each}
	<div class="pt-4 opacity-0">
		<input disabled type="text" class="input p-2 pointer-events-none" />
	</div>
</div>
<form
	class="flex items-center gap-2 p-4 fixed bottom-0 right-0"
	on:submit|preventDefault={handleChatMessageSubmit}
>
	<input type="text" class="input p-2" bind:value={message} placeholder="Type a message..." />
	<button class="btn variant-filled-primary">Send</button>
</form>
