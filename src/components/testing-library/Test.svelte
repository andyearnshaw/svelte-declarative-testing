<script>
  /**@import { BaseTestProps } from '../core' */

  import { Test as CoreTest } from '../core';
  import { render } from '@testing-library/svelte';

  /**@type {BaseTestProps}*/
  const props = $props();
</script>

<CoreTest {render} {...props} />
