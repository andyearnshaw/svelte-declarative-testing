<script>
  /**@import { TestProps } from './index.js' */
  import { test } from 'vitest';
  import { getAddTest, setAddCheck, getSuiteRenderSnippet } from './context.js';
  import Wrapper from './Wrapper.svelte';

  /**@type {TestProps} */
  const { it, fails, todo, only, skip, skipIf, runIf, children, checks, render } = $props();

  /**@type {((result: unknown) => void | Promise<void>)[]} */
  const checkFns = [];

  const addTest = getAddTest();

  const suiteRenderSnippet = getSuiteRenderSnippet();

  setAddCheck((fn) => {
    checkFns.push(fn);
  });

  const setupTest = () => {
    const testFn = () => {
      if (skip) return test.skip;
      if (skipIf) return test.skipIf(skipIf());
      if (todo) return test.todo;
      if (only) return test.only;
      if (fails) return test.fails;
      if (runIf) return test.runIf(runIf());
      return test;
    };

    testFn()(it, async () => {
      const result = await render(Wrapper, { children: children ?? suiteRenderSnippet });

      try {
        if (!checkFns.length) {
          throw new Error(`No checks were registered for test: "${it}"`);
        }

        for (const check of checkFns) {
          await check(result);
        }
      } finally {
        result.unmount();
      }
    });
  };

  addTest?.(setupTest);

  $effect(() => {
    if (!addTest) setupTest();
  });
</script>

{@render checks()}
