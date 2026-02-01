<script>
  /** @import { DescribeProps } from './' */
  import { describe } from 'vitest';
  import { setAddTest, setSuiteRenderSnippet } from './context.js';

  /**@type {DescribeProps}*/
  const { label, todo, only, skip, skipIf, runIf, children, tests } = $props();

  /**@type {((result: unknown) => void | Promise<void>)[]} */
  const testFns = [];

  setAddTest((fn) => {
    testFns.push(fn);
  });

  // svelte-ignore state_referenced_locally
  setSuiteRenderSnippet(children);

  $effect(() => {
    const describeFn = () => {
      if (skip) return describe.skip;
      if (skipIf) return describe.skipIf(skipIf());
      if (todo) return describe.todo;
      if (only) return describe.only;
      if (runIf) return describe.runIf(runIf());
      return describe;
    };

    describeFn()(label, async () => {
      for (const test of testFns) {
        await test();
      }
    });
  });
</script>

{@render tests()}
