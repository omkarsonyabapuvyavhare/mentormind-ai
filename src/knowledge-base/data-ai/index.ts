import { dataEngineeringKnowledgeGraph } from "@/knowledge-base/data-ai/data-engineering";
import { dataScienceKnowledgeGraph } from "@/knowledge-base/data-ai/data-science";
import { deepLearningKnowledgeGraph } from "@/knowledge-base/data-ai/deep-learning";
import { machineLearningKnowledgeGraph } from "@/knowledge-base/data-ai/machine-learning";
import { numpyKnowledgeGraph } from "@/knowledge-base/data-ai/numpy";
import { pandasKnowledgeGraph } from "@/knowledge-base/data-ai/pandas";
import { powerBiKnowledgeGraph } from "@/knowledge-base/data-ai/power-bi";
import { sqlKnowledgeGraph } from "@/knowledge-base/data-ai/sql";
import { statisticsKnowledgeGraph } from "@/knowledge-base/data-ai/statistics";
import type { KnowledgeGraph } from "@/knowledge-base/schema";

/** Data and AI category aggregator — SQL + Data Engineering are Phase-1 primaries. */
export const dataAiKnowledgeGraphs: KnowledgeGraph[] = [
  sqlKnowledgeGraph,
  dataEngineeringKnowledgeGraph,
  dataScienceKnowledgeGraph,
  pandasKnowledgeGraph,
  numpyKnowledgeGraph,
  machineLearningKnowledgeGraph,
  deepLearningKnowledgeGraph,
  statisticsKnowledgeGraph,
  powerBiKnowledgeGraph,
];

export {
  dataEngineeringKnowledgeGraph,
  dataScienceKnowledgeGraph,
  deepLearningKnowledgeGraph,
  machineLearningKnowledgeGraph,
  numpyKnowledgeGraph,
  pandasKnowledgeGraph,
  powerBiKnowledgeGraph,
  sqlKnowledgeGraph,
  statisticsKnowledgeGraph,
};
