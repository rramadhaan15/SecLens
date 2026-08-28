import { describe, it, expect } from "vitest";
import { SecurityScoreService } from "../../lib/scoring/security-score";

describe("SecurityScoreService", () => {
  it("calculates 100 base score when no vulnerabilities exist", () => {
    const open = { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 };
    const result = SecurityScoreService.calculateScore(open);
    expect(result.score).toBe(100);
    expect(result.tier).toBe("Excellent");
  });

  it("applies correct severity deductions", () => {
    // 1 Critical (-25), 1 High (-10) -> Score = 65 ("Fair")
    const open = { critical: 1, high: 1, medium: 0, low: 0, info: 0, total: 2 };
    const result = SecurityScoreService.calculateScore(open);
    expect(result.score).toBe(65);
    expect(result.tier).toBe("Fair");
  });

  it("clamps score to 0 under severe vulnerability load", () => {
    // 5 Criticals (-125) -> Score = 0 ("Critical Risk")
    const open = { critical: 5, high: 10, medium: 10, low: 10, info: 10, total: 35 };
    const result = SecurityScoreService.calculateScore(open);
    expect(result.score).toBe(0);
    expect(result.tier).toBe("Critical Risk");
  });
});
