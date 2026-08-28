import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { ZapParser } from "../../lib/scanners/zap/parser";
import { NmapParser } from "../../lib/scanners/nmap/parser";
import { NiktoParser } from "../../lib/scanners/nikto/parser";
import { TrivyParser } from "../../lib/scanners/trivy/parser";

describe("Scanner Parsers Suite", () => {
  it("parses OWASP ZAP report fixture", () => {
    const fixturePath = path.join(__dirname, "../fixtures/zap.json");
    const content = fs.readFileSync(fixturePath, "utf-8");
    const parser = new ZapParser();

    expect(parser.canParse(content)).toBe(true);
    const result = parser.parse(content);
    expect(result.scannerType).toBe("OWASP_ZAP");
    expect(result.vulnerabilities.length).toBeGreaterThan(0);
    expect(result.vulnerabilities[0].severity).toBe("HIGH");
  });

  it("parses Nmap XML report fixture", () => {
    const fixturePath = path.join(__dirname, "../fixtures/nmap.xml");
    const content = fs.readFileSync(fixturePath, "utf-8");
    const parser = new NmapParser();

    expect(parser.canParse(content)).toBe(true);
    const result = parser.parse(content);
    expect(result.scannerType).toBe("NMAP");
    expect(result.target).toBe("10.0.4.15");
    expect(result.vulnerabilities.length).toBeGreaterThan(0);
  });

  it("parses Nikto JSON report fixture", () => {
    const fixturePath = path.join(__dirname, "../fixtures/nikto.json");
    const content = fs.readFileSync(fixturePath, "utf-8");
    const parser = new NiktoParser();

    expect(parser.canParse(content)).toBe(true);
    const result = parser.parse(content);
    expect(result.scannerType).toBe("NIKTO");
    expect(result.vulnerabilities.length).toBe(1);
  });

  it("parses Trivy JSON report fixture", () => {
    const fixturePath = path.join(__dirname, "../fixtures/trivy.json");
    const content = fs.readFileSync(fixturePath, "utf-8");
    const parser = new TrivyParser();

    expect(parser.canParse(content)).toBe(true);
    const result = parser.parse(content);
    expect(result.scannerType).toBe("TRIVY");
    expect(result.vulnerabilities.length).toBe(1);
    expect(result.vulnerabilities[0].cveId).toBe("CVE-2023-29491");
    expect(result.vulnerabilities[0].severity).toBe("CRITICAL");
  });
});
