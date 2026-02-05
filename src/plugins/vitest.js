/** @import type { Plugin } from 'vitest/config' */
import { parse } from 'svelte/compiler';
import { walk } from 'zimmerframe';
import MagicString from 'magic-string';
import { SourceMapGenerator, SourceMapConsumer } from 'source-map';

/**
 * This plugin has two parts:
 *
 * 1. A pre-transform that looks for <Test> and <Describe> components in
 *    .test.svelte files and generates corresponding test/describe blocks, while
 *    tracking source locations for accurate source maps. The generated code
 *    here has no purpose and does not run, it just allows Vitest to find the
 *    tests when it goes looking, and is an import part of VSCode Vitest compatibility.
 *
 * 2. A post-transform that mounts the Svelte component to the DOM when it is
 *    imported so that the tests run.
 */

const mountCode =
  'import { mount } from "svelte"; mount((await import(import.meta.url)).default, { target: document.body });';

const testFileRegex = /\.(?:test|spec)\.svelte$/;
const getNameFromAttr = (node, attr) =>
  node.attributes.find((a) => a.name === attr)?.value?.[0]?.data ?? '(unnamed test)';

const pre = /**@returns {Plugin}*/ () => ({
  name: 'transform-svelte-declarative-test',
  filter: {
    id: testFileRegex,
  },
  enforce: 'pre',
  async transform(code, id) {
    if (!testFileRegex.test(id)) {
      return;
    }

    const mappings = [];

    let appendedCode = [''];
    let currentLine = code.split('\n').length;

    const addLine = (lineCode, location) => {
      if (location) {
        mappings.push({
          generatedLine: currentLine,
          generatedColumn: 0,
          sourceLine: location.line - 1,
          sourceColumn: location.column,
        });
      }
      appendedCode.push(lineCode);
      currentLine++;
    };

    // We wrap generated test code in a Svelte if block that checks the global
    // object for something we know doesn't exist. This ensures the generated
    // code is never executed, but still allows Vitest to find the
    // test/describe blocks when it parses the file.
    //
    // Note: we could just write `{#if false}` but if the Svelte parser is
    // updated to optimize away dead code, it might remove our generated blocks entirely,
    addLine('{#if globalThis[Symbol()]}{function () {');

    const s = new MagicString(code);
    const ast = parse(code, { modern: true });

    // We walk the AST looking for our custom <Test> and <Describe>
    // components, and generate corresponding test/describe blocks. We also
    // track the original location of each node so we can create accurate
    // source map mappings later.
    walk(
      ast.fragment,
      {},
      {
        Component(node, { visit }) {
          if (node.name === 'Test') {
            const name = getNameFromAttr(node, 'it');
            addLine(`test("${name}", () => {})`, node.name_loc.start);
          } else if (node.name === 'Describe') {
            const name = getNameFromAttr(node, 'label');
            addLine(`describe("${name}", () => {`, node.name_loc.start);

            // Look through children for nested tests/describes
            visit(node.fragment);

            addLine(`})`, null);
          }
        },
      },
    );

    addLine(`}}{/if}`, null);

    s.append(appendedCode.join('\n'));

    const originalMap = s.generateMap({ source: id, includeContent: true, hires: true });
    const consumer = await new SourceMapConsumer(originalMap);
    const generator = SourceMapGenerator.fromSourceMap(consumer);

    for (const mapping of mappings) {
      generator.addMapping({
        generated: { line: mapping.generatedLine + 1, column: mapping.generatedColumn },
        source: id,
        original: { line: mapping.sourceLine + 1, column: mapping.sourceColumn },
      });
    }

    return { code: s.toString(), map: generator.toString() };
  },
});

const post = /**@returns {Plugin}*/ () => ({
  name: 'transform-svelte-declarative-test',
  filter: {
    id: testFileRegex,
  },
  enforce: 'post',
  transform(code, id) {
    if (!testFileRegex.test(id)) {
      return;
    }

    const s = new MagicString(code);

    // We mount by reimporting the default export of the Svelte file (the
    // component). This is the magic that runs the tests.
    s.append(mountCode);

    return { code: s.toString() };
  },
});

export default function getPlugins() {
  return [pre(), post()];
}
