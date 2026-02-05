<script>
  /**@import { Snippet } from 'svelte';*/

  /**@type {{ children: Snippet }}*/
  const { children } = $props();
</script>

{@render children()}
