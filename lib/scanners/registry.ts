import { ParseResult, ScannerParser, ScannerType } from "./types";
import { ZapParser } from "./zap/parser";
import { NmapParser } from "./nmap/parser";
import { NiktoParser } from "./nikto/parser";
import { TrivyParser } from "./trivy/parser";

export class ScannerRegistry {
  private static parsers: ScannerParser[] = [
    new ZapParser(),
    new NmapParser(),
    new NiktoParser(),
    new TrivyParser(),
  ];

  public static detectAndParse(content: string, requestedScanner?: ScannerType): ParseResult {
    let parsedJson: Record<string, unknown> | undefined;
    try {
      parsedJson = JSON.parse(content);
    } catch {
      parsedJson = undefined;
    }

    const targetInput = parsedJson || content;

    // If explicit scanner type specified, pick it
    if (requestedScanner) {
      const parser = this.parsers.find((p) => p.scannerType === requestedScanner);
      if (parser) {
        return parser.parse(targetInput);
      }
    }

    // Auto-detect parser
    for (const parser of this.parsers) {
      if (parser.canParse(targetInput)) {
        return parser.parse(targetInput);
      }
    }

    // Fallback to Zap or generic parser if auto-detection failed
    return this.parsers[0].parse(targetInput);
  }
}
