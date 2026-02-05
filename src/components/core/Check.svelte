<script>
  /**@import { CheckProps } from './' */
  import { getAddCheck } from './context';

  /**@type {CheckProps} */
  const { fn } = $props();

  $effect(() => {
    getAddCheck()?.(fn);
  });
</script>
