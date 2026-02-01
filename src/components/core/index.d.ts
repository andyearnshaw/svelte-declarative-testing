import type { Snippet, Component } from 'svelte';
import { XOR } from 'ts-essentials';

export type ModifierProps = XOR<
  /* These are all mutually exclusive */
  { only: boolean },
  { todo: boolean },
  { skip: boolean },
  { skipIf: () => unknown },
  { runIf: () => unknown }
>;

export type DescribeProps =
  | {
      label: string;
      children?: Snippet;
      tests: Snippet;
    }
  | ModifierProps;

export type BaseTestProps =
  | {
      it: string;
      children?: Snippet;
      checks: Snippet;
    }
  | XOR<ModifierProps, { fails: boolean }>;

export type TestProps = BaseTestProps & {
  render: (result: unknown) => void | Promise<void>;
};

export type CheckProps = {
  fn: (result: unknown) => void | Promise<void>;
};

export declare const Describe: Component<DescribeProps>;
export declare const Test: Component<TestProps>;
export declare const Check: Component<CheckProps>;
