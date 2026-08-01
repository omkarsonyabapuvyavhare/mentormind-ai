import type { KnowledgeGraph } from "@/knowledge-base/schema";
import { cybersecurityKnowledgeGraph } from "@/knowledge-base/security-architecture/cybersecurity";
import { promptEngineeringKnowledgeGraph } from "@/knowledge-base/security-architecture/prompt-engineering";
import { systemDesignKnowledgeGraph } from "@/knowledge-base/security-architecture/system-design";

/** Security and Architecture category aggregator — Phase-1 minimal stubs. */
export const securityArchitectureKnowledgeGraphs: KnowledgeGraph[] = [
  cybersecurityKnowledgeGraph,
  systemDesignKnowledgeGraph,
  promptEngineeringKnowledgeGraph,
];

export {
  cybersecurityKnowledgeGraph,
  promptEngineeringKnowledgeGraph,
  systemDesignKnowledgeGraph,
};
