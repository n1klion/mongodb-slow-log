<script lang="ts">
  import CloudUpload from "$lib/components/icons/CloudUpload.svelte";
  import FolderDrop from "$lib/components/icons/FolderDrop.svelte";

  import { processLogFile } from "$lib/services/logParser";
  import type { ParsedLogLine } from "$lib/types";

  let { setLogs }: { setLogs: (newLogs: ParsedLogLine[]) => void } = $props();

  let inputBind: HTMLInputElement;
  let uploadAreaBind: HTMLDivElement;

  async function handleFile(files: FileList) {
    const file = files[0];
    if (!file) return;

    const fileContent = await file.text();

    setLogs(processLogFile(fileContent));
  }

  function handleOnDragOver(e: DragEvent) {
    e.preventDefault();
    uploadAreaBind.classList.remove("border-gray-300", "bg-gray-50");
    uploadAreaBind.classList.add("border-blue-500", "bg-blue-50");
  }

  function handleOnDragLeave(e: DragEvent) {
    e.preventDefault();
    uploadAreaBind.classList.remove("border-blue-500", "bg-blue-50");
    uploadAreaBind.classList.add("border-gray-300", "bg-gray-50");
  }

  function handleOnDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer == null) return;

    uploadAreaBind.classList.remove("border-blue-500", "bg-blue-50");
    uploadAreaBind.classList.add("border-gray-300", "bg-gray-50");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files);
    }
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      handleFile(files);
    }
  }
</script>

<div class="flex items-center justify-center">
  <div class="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 w-full max-w-md">
    <div class="p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <CloudUpload />
        Open Log File
      </h2>

      <div
        bind:this={uploadAreaBind}
        role="button"
        tabindex="0"
        aria-label="File drop area. Click to select a file or drag and drop a file here."
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 transition-all duration-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-0.5"
        ondragover={handleOnDragOver}
        ondragleave={handleOnDragLeave}
        ondrop={handleOnDrop}
      >
        <h6 class="text-base font-medium mb-2">Drop your log file here</h6>
        <p class="text-gray-500 text-sm mb-2">or</p>
        <input bind:this={inputBind} type="file" accept=".log,.txt" class="hidden" onchange={handleFileChange} />
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 inline-flex items-center gap-2"
          onclick={() => inputBind.click()}
        >
          <FolderDrop />
          Choose Log File
        </button>
      </div>
    </div>
  </div>
</div>
