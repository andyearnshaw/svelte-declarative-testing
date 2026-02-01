<script>
  /**@import { BaseTestProps } from '../core' */

  import { Test as CoreTest } from '../core';
  import { render } from 'vitest-browser-svelte';

  /**@type {BaseTestProps}*/
  const props = $props();
</script>

<CoreTest {render} {...props} />
