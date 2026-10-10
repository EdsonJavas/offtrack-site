import { Garment } from "@/components/Garment/Garment";
import { GEOMETRY, type GarmentKind } from "@/components/Garment/geometry";
import { MEASURE_LABELS, type MeasureKey } from "@/data/types";
import styles from "./MeasureSchema.module.css";

interface MeasureSchemaProps {
  kind: GarmentKind;
  size: string;
  measurements?: Partial<Record<MeasureKey, number>>;
  open: boolean;
}

const LETTERS = ["A", "B", "C", "D"];

/**
 * Painel de medidas: silhueta da peça com as linhas marcadas por letra
 * e a legenda com os valores do tamanho escolhido.
 */
export function MeasureSchema({
  kind,
  size,
  measurements,
  open,
}: MeasureSchemaProps) {
  const lines = GEOMETRY[kind].measures.filter(
    (m) => measurements?.[m.key] !== undefined,
  );

  return (
    <aside
      className={`${styles.panel} ${open ? styles.open : ""}`}
      aria-hidden={!open}
    >
      <header className={styles.head}>
        <p className={styles.title}>Medidas</p>
        <p className={styles.size}>
          Tam. <strong>{size}</strong>
        </p>
      </header>

      <div className={styles.figure}>
        <Garment
          kind={kind}
          color="#3a3a3a"
          view="front"
          className={styles.silhouette}
        />
        <svg viewBox="0 0 400 480" className={styles.lines} aria-hidden="true">
          {lines.map((m, i) => {
            const vertical = m.from[0] === m.to[0];
            const mx = (m.from[0] + m.to[0]) / 2;
            const my = (m.from[1] + m.to[1]) / 2;
            // Letra fora da linha: à direita das verticais, acima das horizontais.
            const lx = vertical ? m.from[0] + 18 : mx;
            const ly = vertical ? my : m.from[1] - 14;
            return (
              <g
                key={m.key}
                className={styles.line}
                style={{ "--d": `${i * 120}ms` } as React.CSSProperties}
              >
                <line x1={m.from[0]} y1={m.from[1]} x2={m.to[0]} y2={m.to[1]} />
                <line
                  x1={m.from[0] - (vertical ? 7 : 0)}
                  y1={m.from[1] - (vertical ? 0 : 7)}
                  x2={m.from[0] + (vertical ? 7 : 0)}
                  y2={m.from[1] + (vertical ? 0 : 7)}
                />
                <line
                  x1={m.to[0] - (vertical ? 7 : 0)}
                  y1={m.to[1] - (vertical ? 0 : 7)}
                  x2={m.to[0] + (vertical ? 7 : 0)}
                  y2={m.to[1] + (vertical ? 0 : 7)}
                />
                <circle cx={lx} cy={ly} r="11" />
                <text x={lx} y={ly + 4} textAnchor="middle">
                  {LETTERS[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <dl className={styles.legend}>
        {lines.map((m, i) => (
          <div key={m.key} className={styles.item}>
            <dt>
              <span className={styles.letter}>{LETTERS[i]}</span>
              {MEASURE_LABELS[m.key]}
            </dt>
            <dd key={size} className={styles.value}>
              {measurements?.[m.key]}
              <span>cm</span>
            </dd>
          </div>
        ))}
      </dl>

      <p className={styles.note}>
        Medidas aproximadas da peça esticada, em centímetros.
      </p>
    </aside>
  );
}
