// Phase 3 scoring: explainable, rules-based similarity + opportunity.

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeScore(value, min, max) {
  if (value === null || value === undefined) return null;
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

class ScoringService {
  scoreTarget({ target, icpProfile }) {
    const reasons = [];

    // Similarity score: weighted matches
    // We keep weights simple for MVP and tune later.
    const weights = {
      industry: 0.35,
      geo: 0.20,
      size: 0.25,
      revenue: 0.20,
    };

    let similarity = 0;
    let similarityDenom = 0;

    // Industry match: if target industry appears in top industries, use its weight
    similarityDenom += weights.industry;
    if (target.industry) {
      const match = icpProfile.industries.find((i) => i.value === target.industry);
      if (match) {
        // scale: high frequency industries score higher
        const industryScore = clamp(match.weight * 1.5, 0, 1);
        similarity += weights.industry * industryScore;
        reasons.push(`Industry match: ${target.industry}`);
      }
    }

    // Geo match (state)
    similarityDenom += weights.geo;
    if (target.state) {
      const match = icpProfile.states.find((s) => s.value === target.state);
      if (match) {
        const geoScore = clamp(match.weight * 1.5, 0, 1);
        similarity += weights.geo * geoScore;
        reasons.push(`Geo match: ${target.state}`);
      }
    }

    // Size match (employee_count): use ICP p25/p75 range
    similarityDenom += weights.size;
    if (typeof target.employee_count === 'number' && icpProfile.employeeCount.p25 !== null && icpProfile.employeeCount.p75 !== null) {
      const { p25, p75 } = icpProfile.employeeCount;
      const inRange = target.employee_count >= p25 && target.employee_count <= p75;
      const sizeScore = inRange ? 1 : 0;
      similarity += weights.size * sizeScore;
      if (inRange) reasons.push(`Size match: ${target.employee_count} employees`);
    }

    // Revenue match (annual_revenue): ICP p25/p75
    similarityDenom += weights.revenue;
    if (typeof target.annual_revenue === 'number' && icpProfile.annualRevenue.p25 !== null && icpProfile.annualRevenue.p75 !== null) {
      const { p25, p75 } = icpProfile.annualRevenue;
      const inRange = target.annual_revenue >= p25 && target.annual_revenue <= p75;
      const revScore = inRange ? 1 : 0;
      similarity += weights.revenue * revScore;
      if (inRange) reasons.push(`Revenue match: $${Math.round(target.annual_revenue).toLocaleString()}`);
    }

    similarity = similarityDenom > 0 ? similarity / similarityDenom : 0;

    // Opportunity score (placeholder MVP): if we have any meaningful data, score modestly.
    // In later phases this becomes hiring/funding/news, etc.
    let opportunity = 0.3;
    if (target.employee_count && target.employee_count > 500) opportunity += 0.1;
    if (target.annual_revenue && target.annual_revenue > 50_000_000) opportunity += 0.1;
    opportunity = clamp(opportunity, 0, 1);

    const similarityScore = +(similarity * 100).toFixed(2);
    const opportunityScore = +(opportunity * 100).toFixed(2);

    const overall = clamp(similarity * 0.7 + opportunity * 0.3, 0, 1);
    const overallScore = +(overall * 100).toFixed(2);

    let tier = 'C';
    if (overallScore >= 85) tier = 'A';
    else if (overallScore >= 70) tier = 'B';

    return {
      similarityScore,
      opportunityScore,
      overallScore,
      tier,
      reasonCodes: reasons.slice(0, 8),
    };
  }
}

module.exports = new ScoringService();
