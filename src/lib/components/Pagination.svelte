<script lang="ts">
  import ArrowLeft from "$lib/components/icons/ArrowLeft.svelte";
  import ArrowRight from "$lib/components/icons/ArrowRight.svelte";

  type NextButton = {
    type: "next";
    destination: number;
    isCurrent: boolean;
  };

  type PrevButton = {
    type: "prev";
    destination: number;
    isCurrent: boolean;
  };

  type RestButton = {
    type: "rest";
    destination: null;
    isCurrent: boolean;
  };

  type CommonButton = {
    type: "common";
    destination: number;
    isCurrent: boolean;
  };

  interface PaginationProps {
    totalItems: number;
    perPage: number;
    currentPage: number;
    setPage: (page: number) => void;
  }

  type PaginationButton = NextButton | PrevButton | RestButton | CommonButton;
  let { totalItems, perPage, currentPage, setPage }: PaginationProps = $props();

  const buttons = $derived.by(() => {
    const buttonsArray: PaginationButton[] = [];
    const totalPages = Math.ceil(totalItems / perPage);
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage > 1) {
      buttonsArray.push({
        type: "prev",
        destination: currentPage - 1,
        isCurrent: false,
      });
    }

    if (startPage > 1) {
      buttonsArray.push({
        type: "common",
        destination: 1,
        isCurrent: false,
      });
      if (startPage > 2) {
        buttonsArray.push({
          type: "rest",
          destination: null,
          isCurrent: false,
        });
      }
    }

    for (let i = startPage; i <= endPage; i += 1) {
      buttonsArray.push({
        type: "common",
        destination: i,
        isCurrent: i === currentPage,
      });
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttonsArray.push({
          type: "rest",
          destination: null,
          isCurrent: false,
        });
      }
      buttonsArray.push({
        type: "common",
        destination: totalPages,
        isCurrent: false,
      });
    }

    if (currentPage < totalPages) {
      buttonsArray.push({
        type: "next",
        destination: currentPage + 1,
        isCurrent: false,
      });
    }

    return buttonsArray;
  });
</script>

<div class="flex justify-center mt-6 mb-4">
  <nav aria-label="Query pagination">
    <ul class="flex items-center gap-1">
      {#each buttons as btn, index (index)}
        {#if btn.type === "prev"}
          <li class="inline-flex">
            <button
              onclick={() => setPage(btn.destination)}
              class="cursor-pointer px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1"
            >
              <ArrowLeft />
              Previous
            </button>
          </li>
        {/if}
        {#if btn.type === "next"}
          <li class="inline-flex">
            <button
              onclick={() => setPage(btn.destination)}
              class="cursor-pointer px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1"
            >
              Next
              <ArrowRight />
            </button>
          </li>
        {/if}
        {#if btn.type === "common"}
          <li class="inline-flex">
            <button
              onclick={() => setPage(btn.destination)}
              class="cursor-pointer px-3 py-2 leading-tight border border-gray-300 transition-colors duration-200 {btn.isCurrent
                ? 'text-blue-600 bg-blue-50 border-blue-300'
                : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-70'}"
            >
              {btn.destination}
            </button>
          </li>
        {/if}
        {#if btn.type === "rest"}
          <li class="inline-flex">
            <button
              class="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 transition-colors duration-200 flex items-center gap-1"
            >
              ...
            </button>
          </li>
        {/if}
      {/each}
    </ul>
  </nav>
</div>
