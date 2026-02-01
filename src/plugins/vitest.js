/** @import type { Plugin } from 'vitest/config' */
import { parse } from 'svelte/compiler';
import { walk } from 'zimmerframe';
import MagicString from 'magic-string';

const pre = () =>
  /**@type {Plugin}*/ ({
    name: 'transform-svelte-declarative-test',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.(?:test|spec)\.svelte$/.test(id)) {
        return;
      }

      const s = new MagicString(code);
      const ast = parse(code);
      walk(
        ast.html,
        {},
        {
          InlineComponent(node, { visit }) {
            if (node.name === 'Test') {
              for (const attr of node.attributes) {
                if (attr.name === 'it') {
                  const name =
                    attr.value?.[0]?.data?.replace(/"/g, '\\"') ?? '(dynamically named test)';

                  s.appendLeft(
                    attr.start,
                    `data-test-code={function () { test("${name}", () => {}) }} `,
                  );
                }
              }

              return;
            } else if (node.name === 'Describe') {
              for (const attr of node.attributes) {
                if (attr.name === 'label') {
                  const name =
                    attr.value?.[0]?.data?.replace(/"/g, '\\"') ?? '(dynamically named test suite)';

                  s.appendLeft(
                    attr.start,
                    `data-describe-code={function () { describe("${name}", () => {}) }} `,
                  );
                }
              }

              for (const child of node.children) {
                if (child.type === 'SnippetBlock') {
                  visit(child);
                }
              }
            }
          },
          SnippetBlock(node, { visit }) {
            for (const child of node.children) {
              if (child.type === 'InlineComponent') {
                visit(child);
              }
            }
          },
        },
      );

      console.log(s.toString());
      return { code: s.toString(), map: s.generateMap({ hires: true }) };
    },
  });

const post = () =>
  /**@type {Plugin}*/ ({
    name: 'transform-svelte-declarative-test',
    enforce: 'post',
    transform(code, id) {
      if (!/\.(?:test|spec)\.svelte$/.test(id)) {
        return;
      }

      const s = new MagicString(code);
      const componentName = id.split('/').pop()?.split('.').slice(0, -1).join('_');
      s.append(`
          import { mount } from 'svelte';
          mount(${componentName}, { target: document.body });
        `);

      return { code: s.toString(), map: s.generateMap({ hires: true }) };
    },
  });

export default function getPlugins() {
  return [pre(), post()];
}
