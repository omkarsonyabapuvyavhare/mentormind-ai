import type { KnowledgeGraph } from "@/knowledge-base/schema";
import { angularKnowledgeGraph } from "@/knowledge-base/web-development/angular";
import { cssKnowledgeGraph } from "@/knowledge-base/web-development/css";
import { htmlKnowledgeGraph } from "@/knowledge-base/web-development/html";
import { nextjsKnowledgeGraph } from "@/knowledge-base/web-development/nextjs";
import { reactKnowledgeGraph } from "@/knowledge-base/web-development/react";
import { vueKnowledgeGraph } from "@/knowledge-base/web-development/vue";

/** Web Development category aggregator — React is the Phase-1 primary graph. */
export const webDevelopmentKnowledgeGraphs: KnowledgeGraph[] = [
  reactKnowledgeGraph,
  htmlKnowledgeGraph,
  cssKnowledgeGraph,
  angularKnowledgeGraph,
  vueKnowledgeGraph,
  nextjsKnowledgeGraph,
];

export {
  angularKnowledgeGraph,
  cssKnowledgeGraph,
  htmlKnowledgeGraph,
  nextjsKnowledgeGraph,
  reactKnowledgeGraph,
  vueKnowledgeGraph,
};
