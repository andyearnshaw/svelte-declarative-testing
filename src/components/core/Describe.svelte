<script>
  /** @import { DescribeProps } from './' */
  import { describe } from 'vitest';
  import { getAddDescribeChild, setAddDescribeChild, setSuiteRenderSnippet } from './context';
  import tryFn from '../../utils/tryFn.js';

  /**@type {DescribeProps}*/
  const { label, todo, only, skip, skipIf, runIf, children, tests } = $props();

  /**@type {(() => void | Promise<void>)[]} */
  const childFns = [];

  const addDescribeToParent = tryFn(getAddDescribeChild);

  setAddDescribeChild((fn) => {
    childFns.push(fn);
  });

  // svelte-ignore state_referenced_locally
  setSuiteRenderSnippet(children);

  const setupDescribe = () => {
    const describeFn = () => {
      if (skip) return describe.skip;
      if (skipIf) return describe.skipIf(skipIf());
      if (todo) return describe.todo;
      if (only) return describe.only;
      if (runIf) return describe.runIf(runIf());
      return describe;
    };

    describeFn()(label, async () => {
      for (const child of childFns) {
        await child();
      }
    });
  };

  addDescribeToParent?.(setupDescribe);

  $effect(() => {
    if (!addDescribeToParent) setupDescribe();
  });
</script>

{@render tests()}
