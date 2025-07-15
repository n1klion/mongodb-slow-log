<script lang="ts">
  import type { Snippet } from "svelte";

  interface ModalProps {
    showModal: boolean;
    header: Snippet;
    children: Snippet;
    onClose: () => void;
  }

  let { showModal = $bindable(), header, children, onClose }: ModalProps = $props();
  let dialog: HTMLDialogElement;
  let scrollY = 0;

  $effect(() => {
    if (showModal) {
      dialog.showModal();

      scrollY = window.scrollY;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    }
  });

  function handleOnClose() {
    showModal = false;
    onClose();
  }
</script>

<!-- h-[90vh] max-h-[90vh] w-[70vw] max-w-[70vw] -->
<dialog
  bind:this={dialog}
  onclose={handleOnClose}
  onclick={(e) => {
    if (e.target === dialog) dialog.close();
  }}
  class="rounded-sm border-0 p-0 m-auto h-full w-full backdrop:bg-black/30 open:animate-[zoom_0.3s_cubic-bezier(0.34,1.56,0.64,1)] open:backdrop:animate-[fade_0.2s_ease-out]"
>
  <div class="p-4">
    <div class="grid grid-cols-12 gap-2">
      <div class="col-span-11">
        {@render header()}
      </div>
      <div class="col-span-1 ">
        <button
          autofocus
          aria-label="Close"
          onclick={() => dialog?.close()}
          class="ml-auto cursor-pointer block px-1 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors text-sm leading-none"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <hr class="my-4 border-gray-200" />
    {@render children()}
  </div>
</dialog>

<style>
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
