<script>
  import { Test, Describe, Check } from '../../src/components/testing-library';
</script>

<Describe label="Basic test">
  {#snippet tests()}
    <Test it="finds the rendered component">
      <button>Click me</button>

      {#snippet checks()}
        <Check
          fn={({ getByRole }) => {
            expect(getByRole('button', { name: 'Click me' })).not.toBe(null);
          }}
        />
      {/snippet}
    </Test>

    <Describe label="Nested describe">
      {#snippet tests()}
        <Test it="also passes">
          <button>Click me</button>

          {#snippet checks()}
            <Check
              fn={({ getByRole }) => {
                expect(getByRole('button', { name: 'Click me' })).not.toBe(null);
              }}
            />
          {/snippet}
        </Test>
      {/snippet}
    </Describe>
  {/snippet}
</Describe>
