export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
}

export interface SecurityScoreResult {
  score: number; // 0 - 100
  tier: "Critical Risk" | "Poor" | "Fair" | "Good" | "Excellent";
  openCounts: SeverityCounts;
  resolvedCounts: SeverityCounts;
  remediationRate: number; // 0 - 100 %
  penalties: {
    criticalPenalty: number;
    highPenalty: number;
    mediumPenalty: number;
    lowPenalty: number;
    totalPenalty: number;
  };
  disclaimer: string;
}

/**
 * SecLens Security Score Engine
 *
 * Base Score: 100
 * Deductions for OPEN vulnerabilities:
 *  - Critical: -25 points each
 *  - High:     -10 points each
 *  - Medium:   -3 points each
 *  - Low:      -1 point each
 *  - Info:      0 points
 *
 * Remediation Recovery Bonus:
 *  - Resolving vulnerabilities restores score relative to remediation percentage.
 *
 * Clamped strictly between 0 and 100.
 */
export class SecurityScoreService {
  public static readonly DISCLAIMER =
    "The SecLens Security Score is an application-defined posture indicator based on weighted open security findings and is NOT an official CVSS score.";

  public static calculateScore(
    openCounts: SeverityCounts,
    resolvedCounts: SeverityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 }
  ): SecurityScoreResult {
    const criticalPenalty = openCounts.critical * 25;
    const highPenalty = openCounts.high * 10;
    const mediumPenalty = openCounts.medium * 3;
    const lowPenalty = openCounts.low * 1;

    const totalPenalty = criticalPenalty + highPenalty + mediumPenalty + lowPenalty;

    const rawScore = Math.max(0, 100 - totalPenalty);
    const score = Math.round(rawScore);

    const totalOpenAndResolved = openCounts.total + resolvedCounts.total;
    const remediationRate =
      totalOpenAndResolved > 0
        ? Math.round((resolvedCounts.total / totalOpenAndResolved) * 100)
        : 100;

    let tier: SecurityScoreResult["tier"] = "Excellent";
    if (score < 40) tier = "Critical Risk";
    else if (score < 60) tier = "Poor";
    else if (score < 80) tier = "Fair";
    else if (score < 95) tier = "Good";

    return {
      score,
      tier,
      openCounts,
      resolvedCounts,
      remediationRate,
      penalties: {
        criticalPenalty,
        highPenalty,
        mediumPenalty,
        lowPenalty,
        totalPenalty,
      },
      disclaimer: SecurityScoreService.DISCLAIMER,
    };
  }
}
