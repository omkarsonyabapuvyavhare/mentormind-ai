import { csharpKnowledgeGraph } from "@/knowledge-base/programming/csharp";
import { goKnowledgeGraph } from "@/knowledge-base/programming/go";
import { javaKnowledgeGraph } from "@/knowledge-base/programming/java";
import { javascriptKnowledgeGraph } from "@/knowledge-base/programming/javascript";
import { pythonKnowledgeGraph } from "@/knowledge-base/programming/python";
import { rustKnowledgeGraph } from "@/knowledge-base/programming/rust";
import { typescriptKnowledgeGraph } from "@/knowledge-base/programming/typescript";
import type { KnowledgeGraph } from "@/knowledge-base/schema";

/** Programming category aggregator — Python is the Phase-1 primary graph. */
export const programmingKnowledgeGraphs: KnowledgeGraph[] = [
  pythonKnowledgeGraph,
  javascriptKnowledgeGraph,
  javaKnowledgeGraph,
  csharpKnowledgeGraph,
  goKnowledgeGraph,
  rustKnowledgeGraph,
  typescriptKnowledgeGraph,
];

export {
  csharpKnowledgeGraph,
  goKnowledgeGraph,
  javaKnowledgeGraph,
  javascriptKnowledgeGraph,
  pythonKnowledgeGraph,
  rustKnowledgeGraph,
  typescriptKnowledgeGraph,
};
