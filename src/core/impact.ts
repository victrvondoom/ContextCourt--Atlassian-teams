/**
 * Impact analysis over dependency edges.
 *
 * Only verified edges may produce "affected" conclusions; inferred edges are
 * carried separately and labeled inferred throughout. Propagation depth is
 * bounded. Hypothetical recalculation (Decision Simulator) is returned under
 * an explicit `hypothetical: true` flag — it is never a prediction.
 */
export type EdgeKind = 'blocks' | 'dependsOn' | 'supersedes' | 'implements';

export interface DependencyEdge {
  fromKey: string;
  toKey: string;
  kind: EdgeKind;
  /** true only when the relationship is verified (e.g. Teamwork Graph or Jira link). */
  verified: boolean;
  provenance: string;
}

export interface ImpactResult {
  rootKey: string;
  affected: Array<{
    key: string;
    depth: number;
    via: string[];
    verifiedPath: boolean;
  }>;
  inferredOnly: Array<{ key: string; via: string[] }>;
  hypothetical: false;
}

export interface HypotheticalImpactResult {
  rootKey: string;
  /** How the hypothetical change alters the verified dependency set. */
  addedEdges: DependencyEdge[];
  removedEdges: DependencyEdge[];
  affectedNow: string[];
  hypothetical: true;
}

const MAX_DEPTH = 4;

/** Traverse verified edges first; inferred edges are collected but never merged. */
export function analyzeImpact(rootKey: string, edges: DependencyEdge[]): ImpactResult {
  const verified = edges.filter((e) => e.verified);
  const affected: ImpactResult['affected'] = [];
  const inferredOnly: ImpactResult['inferredOnly'] = [];
  const seen = new Set<string>([rootKey]);

  // BFS over verified edges.
  let frontier = [{ key: rootKey, via: [] as string[] }];
  let depth = 0;
  while (frontier.length > 0 && depth < MAX_DEPTH) {
    depth += 1;
    const next: typeof frontier = [];
    for (const item of frontier) {
      for (const edge of verified) {
        if (edge.fromKey !== item.key || seen.has(edge.toKey)) continue;
        seen.add(edge.toKey);
        const via = [...item.via, edge.fromKey];
        affected.push({ key: edge.toKey, depth, via, verifiedPath: true });
        next.push({ key: edge.toKey, via });
      }
    }
    frontier = next;
  }

  // Inferred edges: reported separately with explicit labeling.
  for (const edge of edges.filter((e) => !e.verified)) {
    if (edge.fromKey === rootKey && !seen.has(edge.toKey)) {
      seen.add(edge.toKey);
      inferredOnly.push({ key: edge.toKey, via: [edge.fromKey] });
    }
  }

  return { rootKey, affected, inferredOnly, hypothetical: false };
}

/**
 * Recalculate affected verified dependencies under a hypothetical change.
 * Explicitly hypothetical: a what-if simulation, not a prediction of events.
 */
export function simulateHypotheticalChange(
  rootKey: string,
  edges: DependencyEdge[],
  change: { add?: DependencyEdge[]; remove?: Array<{ fromKey: string; toKey: string }> },
): HypotheticalImpactResult {
  const removeKeys = new Set((change.remove ?? []).map((r) => `${r.fromKey}->${r.toKey}`));
  const hypotheticalEdges = edges.filter(
    (e) => !removeKeys.has(`${e.fromKey}->${e.toKey}`),
  );
  hypotheticalEdges.push(...(change.add ?? []));

  const impact = analyzeImpact(rootKey, hypotheticalEdges);
  return {
    rootKey,
    addedEdges: change.add ?? [],
    removedEdges: edges.filter((e) => removeKeys.has(`${e.fromKey}->${e.toKey}`)),
    affectedNow: impact.affected.map((a) => a.key),
    hypothetical: true,
  };
}
