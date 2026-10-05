/**
 * Decorative banner art, one composition per pillar.
 *
 * One visual system on purpose: every piece is drawn on the same 300x120 grid,
 * with the same stroke weights, the same node sizes and the same two inks, so
 * the eighteen read as a set rather than eighteen separate pictures.
 * What changes between them is the *structure* — nesting, a cycle, convergence,
 * a graph, a branch — which is the thing each pillar actually teaches.
 *
 * Transparent background: the sheet's grid shows through, so each reads as a
 * figure plotted on the pad. Purely decorative, so aria-hidden.
 */

// Printed in the pad's print ink; the "bright" node is the graphite of a committed point.
const ACCENT = "var(--print)";
const BRIGHT = "var(--graphite)";

/** A plotted point: solid, no halo (nothing on the sheet glows). */
function Node({ cx, cy, r = 3, bright = false }: { cx: number; cy: number; r?: number; bright?: boolean }) {
  return <circle cx={cx} cy={cy} r={r} fill={bright ? BRIGHT : ACCENT} />;
}

/** Shared line defaults so weights never drift between compositions. */
const line = { stroke: ACCENT, strokeWidth: 1.1, fill: "none" } as const;
const faint = { stroke: ACCENT, strokeWidth: 0.9, fill: "none", opacity: 0.3 } as const;

/** 1 · Mental models — nested frames: prompt inside context inside harness inside loop. */
function MentalModels() {
  const rects = [
    { w: 220, h: 96, o: 0.28 },
    { w: 166, h: 72, o: 0.45 },
    { w: 112, h: 48, o: 0.7 },
    { w: 58, h: 24, o: 1 },
  ];
  return (
    <>
      {rects.map((r, i) => (
        <rect
          key={i}
          x={150 - r.w / 2}
          y={60 - r.h / 2}
          width={r.w}
          height={r.h}
          rx={0}
          {...line}
          opacity={r.o}
        />
      ))}
      <Node cx={150} cy={60} r={3.5} bright />
    </>
  );
}

/** 2 · Claude Code — work enters, goes round the loop until it's right, then ships. */
function ClaudeCode() {
  const R = 40;
  const pts = [0, 90, 180, 270].map((d) => {
    const a = ((d - 90) * Math.PI) / 180;
    return { x: 150 + R * Math.cos(a), y: 60 + R * Math.sin(a), d };
  });
  return (
    <>
      {/* in from the left, out to the right, so the loop reads as part of a flow */}
      <path d="M 42 60 L 106 60" {...faint} />
      <path d="M 194 60 L 258 60" {...faint} />
      <Node cx={42} cy={60} r={3} />
      <Node cx={258} cy={60} r={3.5} bright />
      <circle cx={150} cy={60} r={R} {...line} opacity={0.55} />
      {/* arrowheads sitting tangentially on the ring, all turning the same way */}
      {pts.map((p, i) => (
        <path
          key={i}
          d="M -5 -4 L 4 0 L -5 4"
          {...line}
          strokeWidth={1.4}
          transform={`translate(${p.x} ${p.y}) rotate(${p.d})`}
        />
      ))}
      {[45, 135, 225, 315].map((d, i) => {
        const a = ((d - 90) * Math.PI) / 180;
        return <Node key={i} cx={150 + R * Math.cos(a)} cy={60 + R * Math.sin(a)} r={2.6} />;
      })}
    </>
  );
}

/** 3 · Chat assistants — three models routed into one answer. */
function ChatAssistants() {
  const srcY = [26, 60, 94];
  return (
    <>
      {srcY.map((y, i) => (
        <g key={i}>
          <path d={`M 62 ${y} C 130 ${y}, 160 60, 236 60`} {...line} opacity={0.5} />
          <Node cx={62} cy={y} r={3} />
          <Node cx={44} cy={y} r={1.8} />
          <Node cx={30} cy={y} r={1.2} />
        </g>
      ))}
      <Node cx={236} cy={60} r={4.5} bright />
    </>
  );
}

/** 4 · Obsidian — a densely linked vault, plus the notes nothing points at yet. */
function Obsidian() {
  const n = [
    [150, 60], [120, 38], [182, 40], [112, 84], [186, 82], [150, 22],
    [150, 98], [92, 60], [210, 60], [136, 62], [166, 60], [128, 104],
  ] as const;
  const e = [
    [0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [3, 6], [4, 6],
    [1, 7], [3, 7], [2, 8], [4, 8], [9, 0], [10, 0], [9, 1], [10, 2], [6, 11], [3, 11],
  ] as const;
  return (
    <>
      {e.map(([a, b], i) => (
        <line key={i} x1={n[a][0]} y1={n[a][1]} x2={n[b][0]} y2={n[b][1]} {...faint} />
      ))}
      {n.map(([x, y], i) => (
        <Node key={i} cx={x} cy={y} r={i === 0 ? 4 : 2.6} bright={i === 0} />
      ))}
      {/* unresolved links — the gaps a lint pass finds */}
      <circle cx={252} cy={32} r={2.4} fill={ACCENT} opacity={0.35} />
      <circle cx={264} cy={88} r={2} fill={ACCENT} opacity={0.25} />
    </>
  );
}

/** 5 · Workflows & agents — one trigger branching into parallel work. */
function WorkflowsAgents() {
  const mid = [
    [150, 36],
    [150, 84],
  ] as const;
  const leaf = [
    [246, 20], [246, 50], [246, 70], [246, 100],
  ] as const;
  return (
    <>
      {mid.map(([x, y], i) => (
        <path key={i} d={`M 60 60 C 100 60, 110 ${y}, ${x} ${y}`} {...line} opacity={0.5} />
      ))}
      {leaf.map(([x, y], i) => {
        const from = mid[i < 2 ? 0 : 1];
        return (
          <path key={i} d={`M ${from[0]} ${from[1]} C 196 ${from[1]}, 206 ${y}, ${x} ${y}`} {...line} opacity={0.45} />
        );
      })}
      <Node cx={60} cy={60} r={4} bright />
      {mid.map(([x, y], i) => <Node key={i} cx={x} cy={y} r={3} />)}
      {leaf.map(([x, y], i) => <Node key={i} cx={x} cy={y} r={2.4} />)}
    </>
  );
}

/** 6 · Applied AI engineering — a layered system with an eval loop feeding back. */
function AppliedAi() {
  const ys = [26, 47, 73, 94];
  return (
    <>
      {ys.map((y, i) => (
        <rect key={i} x={62} y={y - 7} width={150} height={14} rx={0} {...line} opacity={0.32 + i * 0.14} />
      ))}
      <path d="M 212 94 C 252 94, 252 26, 212 26" {...line} strokeWidth={1.3} />
      <path d="M 218 32 L 212 26 L 218 20" {...line} strokeWidth={1.3} />
      {ys.map((y, i) => <Node key={i} cx={212} cy={y} r={2.2} />)}
      <Node cx={62} cy={60} r={3.5} bright />
    </>
  );
}

/** 7 · Shipping apps — modules assembling into one thing that ships. */
function ShippingApps() {
  const blocks = [
    [56, 28], [92, 28], [56, 64], [92, 64],
  ] as const;
  return (
    <>
      {blocks.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={30} height={30} rx={0} {...line} opacity={0.75} />
      ))}
      {/* the piece still flying in */}
      <rect x={168} y={46} width={30} height={30} rx={0} {...line} opacity={0.45} strokeDasharray="3 3" />
      <path d="M 134 61 L 162 61" {...line} opacity={0.5} />
      <path d="M 156 56 L 162 61 L 156 66" {...line} opacity={0.5} />
      <path d="M 202 61 L 246 61" {...faint} />
      <Node cx={252} cy={61} r={4} bright />
    </>
  );
}

/** Faint plotting grid shared by the Math & ML tracks. */
function PlotGrid() {
  return (
    <>
      {[24, 48, 72, 96].map((y) => (
        <line key={`h${y}`} x1={58} y1={y} x2={244} y2={y} {...faint} opacity={0.16} />
      ))}
      {[58, 105, 152, 199, 244].map((x) => (
        <line key={`v${x}`} x1={x} y1={18} x2={x} y2={102} {...faint} opacity={0.16} />
      ))}
    </>
  );
}

/** M1 · Linear algebra — two vectors from one origin and their sum. */
function LinearAlgebra() {
  return (
    <>
      <PlotGrid />
      <path d="M 105 96 L 199 72" {...line} strokeWidth={1.4} />
      <path d="M 105 96 L 152 34" {...line} strokeWidth={1.4} />
      <path d="M 152 34 L 246 10" {...faint} />
      <path d="M 199 72 L 246 10" {...faint} />
      <path d="M 105 96 L 246 10" {...line} opacity={0.55} />
      <Node cx={105} cy={96} r={2.6} />
      <Node cx={199} cy={72} r={2.6} />
      <Node cx={152} cy={34} r={2.6} />
      <Node cx={246} cy={10} r={3.2} bright />
    </>
  );
}

/** M2 · Probability & statistics — a bell curve and the band around its mean. */
function ProbabilityStatistics() {
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = 58 + (i * 186) / 40;
    const z = (x - 151) / 34;
    return [x, 100 - 78 * Math.exp(-(z * z) / 2)];
  });
  return (
    <>
      <PlotGrid />
      <line x1={117} y1={22} x2={117} y2={100} {...faint} />
      <line x1={185} y1={22} x2={185} y2={100} {...faint} />
      <path d={`M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")}`} {...line} strokeWidth={1.4} />
      <line x1={151} y1={22} x2={151} y2={100} {...line} opacity={0.55} />
      <Node cx={151} cy={22} r={3.2} bright />
    </>
  );
}

/** M3 · Calculus — a curve and the tangent that measures its slope at one point. */
function Calculus() {
  return (
    <>
      <PlotGrid />
      <path d="M 58 30 C 110 110, 190 110, 244 30" {...line} strokeWidth={1.4} />
      <path d="M 55 45 L 148 105" {...line} opacity={0.55} />
      <Node cx={101.4} cy={75} r={3.2} bright />
      <Node cx={150.2} cy={90} r={2.6} />
    </>
  );
}

/** M4 · Machine learning — scattered points and the line fitted through them. */
function MachineLearning() {
  const pts: [number, number][] = [
    [66, 92], [84, 80], [101, 86], [120, 70], [137, 72], [156, 58],
    [173, 62], [190, 46], [208, 50], [226, 34], [240, 30],
  ];
  return (
    <>
      <PlotGrid />
      <path d="M 58 94 L 244 26" {...line} strokeWidth={1.4} />
      {pts.map(([x, y], i) => (
        <Node key={i} cx={x} cy={y} r={2.4} bright={i === pts.length - 1} />
      ))}
    </>
  );
}

/** M5 · Neural networks — three layers, every node wired to the next layer. */
function NeuralNetworks() {
  const layers = [
    [30, 60, 90],
    [24, 48, 72, 96],
    [45, 75],
  ].map((ys, li) => ys.map((y) => [82 + li * 68, y] as [number, number]));
  const edges: [number, number, number, number][] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (const [x1, y1] of layers[l]) for (const [x2, y2] of layers[l + 1]) edges.push([x1, y1, x2, y2]);
  }
  return (
    <>
      {edges.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} {...faint} opacity={0.35} />
      ))}
      {layers.flat().map(([x, y], i, all) => (
        <Node key={i} cx={x} cy={y} r={3} bright={i === all.length - 1} />
      ))}
    </>
  );
}

/** M6 · Transformers — an attention grid: each token's weights over the tokens before it. */
function Transformers() {
  const n = 6;
  const size = 14;
  const x0 = 150 - (n * size) / 2;
  const y0 = 60 - (n * size) / 2;
  const cells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c <= r; c++) {
      const w = c === r ? 0.9 : 0.15 + 0.6 * Math.abs(Math.sin((r + 1) * (c + 2)));
      cells.push(<rect key={`${r}-${c}`} x={x0 + c * size + 1} y={y0 + r * size + 1} width={size - 2} height={size - 2} fill={ACCENT} opacity={w * 0.75} />);
    }
  }
  return (
    <>
      <rect x={x0} y={y0} width={n * size} height={n * size} {...faint} />
      {cells}
    </>
  );
}

/** M7 · Evaluation — an ROC curve above the chance diagonal, one threshold chosen. */
function Evaluation() {
  return (
    <>
      <PlotGrid />
      <path d="M 58 102 L 244 18" {...faint} />
      <path d="M 58 102 C 70 40, 120 26, 244 18" {...line} strokeWidth={1.4} />
      <Node cx={96} cy={44} r={3.2} bright />
    </>
  );
}

/** 9 · Marketing & content — made once, broadcast outward to many places.
 *  Arc sweep is kept to ±33° so the largest radius still clears the 120-unit frame. */
function MarketingContent() {
  const CX = 56;
  const CY = 60;
  const SWEEP = (33 * Math.PI) / 180;
  const arcs = [34, 56, 78, 96];
  return (
    <>
      {arcs.map((r, i) => {
        const dx = r * Math.cos(SWEEP);
        const dy = r * Math.sin(SWEEP);
        return (
          <path
            key={i}
            d={`M ${CX + dx} ${CY - dy} A ${r} ${r} 0 0 1 ${CX + dx} ${CY + dy}`}
            {...line}
            opacity={0.5 - i * 0.09}
          />
        );
      })}
      <Node cx={CX} cy={CY} r={4.5} bright />
      {/* where it lands */}
      {[
        [176, 26], [212, 44], [232, 74], [190, 98],
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1={CX + 96 * Math.cos(SWEEP)} y1={CY} x2={x} y2={y} {...faint} opacity={0.18} />
          <Node cx={x} cy={y} r={2.6} />
        </g>
      ))}
    </>
  );
}

/** 10 · Building products — scope narrowing to an MVP that ships. */
function BuildingProducts() {
  const rows = [
    { w: 160, y: 26 },
    { w: 124, y: 48 },
    { w: 88, y: 70 },
    { w: 52, y: 92 },
  ];
  return (
    <>
      {rows.map((r, i) => (
        <rect key={i} x={150 - r.w / 2} y={r.y - 7} width={r.w} height={14} rx={0} {...line} opacity={0.35 + i * 0.2} />
      ))}
      <path d="M 150 100 L 150 112" {...faint} />
      <Node cx={150} cy={92} r={3.2} bright />
    </>
  );
}

/** 11 · AI inside companies — capability spreading through an org. */
function AiInCompanies() {
  const mid = [104, 150, 196];
  const leaf = [80, 128, 172, 220];
  return (
    <>
      {mid.map((x, i) => (
        <path key={i} d={`M 150 30 L ${x} 62`} {...line} opacity={0.45} />
      ))}
      {leaf.map((x, i) => (
        <path key={i} d={`M ${mid[Math.min(i, 2)]} 62 L ${x} 96`} {...line} opacity={0.35} />
      ))}
      <Node cx={150} cy={30} r={4} bright />
      {mid.map((x, i) => <Node key={i} cx={x} cy={62} r={2.8} />)}
      {leaf.map((x, i) => <Node key={i} cx={x} cy={96} r={2.2} />)}
    </>
  );
}

/** 12 · Agency / freelance — client side and delivery side, bridged. */
function AgencyFreelance() {
  const left = [[62, 34], [46, 62], [70, 88], [92, 58]] as const;
  const right = [[238, 34], [254, 62], [230, 88], [208, 58]] as const;
  return (
    <>
      {left.map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={92} y2={58} {...faint} />
      ))}
      {right.map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={208} y2={58} {...faint} />
      ))}
      <path d="M 92 58 C 120 58, 130 60, 150 60 C 170 60, 180 58, 208 58" {...line} strokeWidth={1.4} />
      {left.map(([x, y], i) => <Node key={i} cx={x} cy={y} r={2.4} />)}
      {right.map(([x, y], i) => <Node key={i} cx={x} cy={y} r={2.4} />)}
      <Node cx={150} cy={60} r={4} bright />
    </>
  );
}

const ART: Record<string, () => React.JSX.Element> = {
  "mental-models": MentalModels,
  "claude-code": ClaudeCode,
  "chat-assistants": ChatAssistants,
  obsidian: Obsidian,
  "workflows-agents": WorkflowsAgents,
  "applied-ai-engineering": AppliedAi,
  "shipping-apps": ShippingApps,
  "marketing-content": MarketingContent,
  "building-products": BuildingProducts,
  "ai-in-companies": AiInCompanies,
  "agency-freelance": AgencyFreelance,
  "linear-algebra": LinearAlgebra,
  "probability-statistics": ProbabilityStatistics,
  calculus: Calculus,
  "machine-learning": MachineLearning,
  "neural-networks": NeuralNetworks,
  transformers: Transformers,
  evaluation: Evaluation,
};

export default function PillarArt({ slug, className = "" }: { slug: string; className?: string }) {
  const Art = ART[slug];
  if (!Art) return null;
  return (
    <svg
      viewBox="0 0 300 120"
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <Art />
    </svg>
  );
}
