<script lang="ts">
  import "./../app.css";

  let { children } = $props();
</script>

<main class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-4">
  {@render children()}
</main>
