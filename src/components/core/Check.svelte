<script lang="ts">
  /**@import { CheckProps } from './' */
  import { getAddCheck } from './context.js';

  /**@type {CheckProps} */
  const { fn } = $props();

  $effect(() => {
    getAddCheck()?.(fn);
  });
</script>
