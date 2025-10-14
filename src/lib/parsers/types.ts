// Shared types for parsers
// These are re-exported from individual parsers for convenience

export type { FacturaParsed } from './xmlParser';
export type { VentaParsed, CSVParseResult } from './csvParser';
export type { ColumnMapping, DetectionResult } from './csvColumnDetector';
