import { ENCHIN_IDS } from '../data';

export const emptyScores = () => Object.fromEntries(ENCHIN_IDS.map((id) => [id, 0]));

// Only accept numeric deltas for known ENCHIN (protects against bad saves / typos).
export function cleanScores(input) {
  const out = emptyScores();
  if (!input || typeof input !== 'object') return out;
  for (const id of ENCHIN_IDS) {
    const v = Number(input[id]);
    out[id] = Number.isFinite(v) ? v : 0;
  }
  return out;
}

export function totalScores(results) {
  const total = emptyScores();
  for (const key of ['mg1', 'mg2', 'mg3']) {
    const s = results?.[key]?.scores;
    if (!s) continue;
    for (const id of ENCHIN_IDS) total[id] += Number(s[id]) || 0;
  }
  return total;
}

// Ranked list, highest first. Ties broken by: MG1 driver seat, then MG2 winner,
// then MG3 car pick, then roster order — so there is always exactly one driver.
export function rankEnchins(results) {
  const totals = totalScores(results);
  const priority = [results?.mg1?.driverId, results?.mg2?.winnerId, results?.mg3?.answers?.car].filter(Boolean);
  const tieRank = (id) => {
    const p = priority.indexOf(id);
    return p === -1 ? 99 : p;
  };
  return [...ENCHIN_IDS]
    .map((id, order) => ({ id, points: totals[id], order }))
    .sort((a, b) => b.points - a.points || tieRank(a.id) - tieRank(b.id) || a.order - b.order);
}

export function leaderInfo(results) {
  const ranked = rankEnchins(results);
  const top = ranked[0];
  if (!top || top.points === 0) return { leaderId: null, tiedIds: [], ranked };
  const tiedIds = ranked.filter((r) => r.points === top.points).map((r) => r.id);
  return { leaderId: top.id, tiedIds, ranked };
}
