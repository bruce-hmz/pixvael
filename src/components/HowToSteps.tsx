import { JsonLd } from '@/components/JsonLd';
import { buildHowToSchema, type HowTo } from '@/lib/structured-data';

// Single source of truth: the same data renders as the visible step list and
// the HowTo JSON-LD, so schema markup can never drift from on-page content.
export function HowToSteps({ howTo }: { howTo: HowTo }) {
  return (
    <section className="mt-16">
      <p className="terminal-label">how to</p>
      <h2 className="mt-3 text-3xl font-black text-[var(--paper)]">
        {howTo.name}
      </h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {howTo.steps.map((step, i) => (
          <li className="pixel-panel-raised p-5" key={step.name}>
            <p className="font-mono text-xs text-[var(--pixel-lime)]">
              step {String(i + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-2 font-black text-[var(--paper)]">{step.name}</h3>
            <p className="mt-2 leading-7 text-[var(--paper-muted)]">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
      <JsonLd data={buildHowToSchema(howTo)} />
    </section>
  );
}
