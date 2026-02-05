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

export type DescribeProps = {
  label: string;
  children?: Snippet;
  tests: Snippet;
} & ModifierProps;

export type BaseTestProps = {
  it: string;
  children?: Snippet;
  checks: Snippet;
} & XOR<ModifierProps, { fails: boolean }>;

type RenderResult = {
  unmount: () => void | Promise<void>;
};

export type TestProps = BaseTestProps & {
  render: (
    component: Component<any, any>,
    options: unknown,
  ) => RenderResult | Promise<RenderResult>;
};

export type CheckProps = {
  fn: (renderResult: any) => void | Promise<void>;
};

export declare const Describe: Component<DescribeProps>;
export declare const Test: Component<TestProps>;
export declare const Check: Component<CheckProps>;
