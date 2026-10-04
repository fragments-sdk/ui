/**
 * Co-located component metadata. CSS reads and attribute observations are checked
 * against source and rendered fixtures; editorial fields support catalog consumers.
 * See component-meta.schema.json for the serialized format.
 */
export interface ComponentMetadata {
  $schema: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  status?: "stable" | "beta" | "deprecated" | "experimental";
  sourcePath: string;
  exportName: string;
  propsSummary: string[];
  props: Record<
    string,
    {
      type: string;
      description: string;
      values?: string[];
      default?: unknown;
      required?: boolean;
      constraints?: string[];
    }
  >;
  usage: {
    when: string[];
    whenNot: string[];
    choose?: Record<string, string>;
    dont?: Array<{ reason: string; bad: string; good: string }>;
    guidelines?: string[];
    accessibility?: string[];
  };
  examples?: Array<{
    name: string;
    description: string;
    code: string;
    canonical?: boolean;
    args?: Record<string, unknown>;
  }>;
  /** State-space and preview hints preserved for catalog consumers. */
  matrix?: {
    axes?: Record<string, "auto" | readonly string[]>;
    forced?: string[];
    worstCase?: Record<string, unknown>;
  };
  preview?: {
    setupModule?: string;
    wrapperModule?: string;
    wrapperExport?: string;
    css?: string[];
    theme?: "light" | "dark";
    providers?: unknown[];
    dynamicRegions?: string[];
  };
  relations?: Array<{
    component: string;
    relationship:
      | "alternative"
      | "parent"
      | "child"
      | "sibling"
      | "composition"
      | "complementary"
      | "used-by";
    note: string;
  }>;
  dependencies?: Array<{ name: string; version: string; reason?: string }>;
  /** Catalog projection used by agent and documentation consumers. */
  contract?: {
    propsSummary?: string[];
    scenarioTags?: string[];
    a11yRules?: string[];
    bans?: Array<{ pattern: string; message: string }>;
    compoundChildren?: Record<
      string,
      { required?: boolean; accepts?: string[]; description?: string }
    >;
    canonicalUsage?: string[];
    performanceBudget?: number;
  };
  ai?: {
    compositionPattern?: "compound" | "simple" | "controlled" | "wrapper";
    subComponents?: string[];
    requiredChildren?: string[];
    commonPatterns?: string[];
  };
  /** Legacy catalog extraction information, not a claim about all metadata fields. */
  provenance: {
    source: "manual" | "extracted" | "merged" | "migrated";
    verified: boolean;
    frameworkSupport?: "native" | "manual-only";
    sourceHash?: string;
    extractedAt?: string;
  };
  /** Public custom properties read directly by this component's runtime modules. */
  cssVariables: string[];
  /** Observed DOM attributes; a named fixture supplies the rendering context. */
  attributes: Array<{
    name: string;
    value: string;
    fixture: string;
  }>;
}
