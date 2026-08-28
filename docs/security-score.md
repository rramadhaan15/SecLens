# Security Score Algorithm

> **Disclaimer**: The SecLens Security Score is an application-defined risk posture indicator based on weighted open security findings and is **NOT** an official CVSS score.

## Calculation Formula

$$\text{Score} = \max\left(0, 100 - \sum \text{Penalties}\right)$$

### Penalty Deductions per Open Finding
- **Critical**: -25 points
- **High**: -10 points
- **Medium**: -3 points
- **Low**: -1 point
- **Info**: 0 points

### Posture Tiers
- **95 - 100**: Excellent
- **80 - 94**: Good
- **60 - 79**: Fair
- **40 - 59**: Poor
- **0 - 39**: Critical Risk
