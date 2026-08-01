import { awsDeveloperKnowledgeGraph } from "@/knowledge-base/cloud-devops/aws-developer";
import { awsSaaKnowledgeGraph } from "@/knowledge-base/cloud-devops/aws-saa";
import { azureAz204KnowledgeGraph } from "@/knowledge-base/cloud-devops/azure-az204";
import { azureAz900KnowledgeGraph } from "@/knowledge-base/cloud-devops/azure-az900";
import { devopsKnowledgeGraph } from "@/knowledge-base/cloud-devops/devops";
import { dockerKnowledgeGraph } from "@/knowledge-base/cloud-devops/docker";
import { gcpKnowledgeGraph } from "@/knowledge-base/cloud-devops/gcp";
import { kubernetesKnowledgeGraph } from "@/knowledge-base/cloud-devops/kubernetes";
import { terraformKnowledgeGraph } from "@/knowledge-base/cloud-devops/terraform";
import { dataEngineeringKnowledgeGraph } from "@/knowledge-base/data-ai/data-engineering";
import { dataScienceKnowledgeGraph } from "@/knowledge-base/data-ai/data-science";
import { deepLearningKnowledgeGraph } from "@/knowledge-base/data-ai/deep-learning";
import { machineLearningKnowledgeGraph } from "@/knowledge-base/data-ai/machine-learning";
import { numpyKnowledgeGraph } from "@/knowledge-base/data-ai/numpy";
import { pandasKnowledgeGraph } from "@/knowledge-base/data-ai/pandas";
import { powerBiKnowledgeGraph } from "@/knowledge-base/data-ai/power-bi";
import { sqlKnowledgeGraph } from "@/knowledge-base/data-ai/sql";
import { statisticsKnowledgeGraph } from "@/knowledge-base/data-ai/statistics";
import { csharpKnowledgeGraph } from "@/knowledge-base/programming/csharp";
import { goKnowledgeGraph } from "@/knowledge-base/programming/go";
import { javaKnowledgeGraph } from "@/knowledge-base/programming/java";
import { javascriptKnowledgeGraph } from "@/knowledge-base/programming/javascript";
import { pythonKnowledgeGraph } from "@/knowledge-base/programming/python";
import { rustKnowledgeGraph } from "@/knowledge-base/programming/rust";
import { typescriptKnowledgeGraph } from "@/knowledge-base/programming/typescript";
import type { KnowledgeGraph } from "@/knowledge-base/schema";
import { cybersecurityKnowledgeGraph } from "@/knowledge-base/security-architecture/cybersecurity";
import { promptEngineeringKnowledgeGraph } from "@/knowledge-base/security-architecture/prompt-engineering";
import { systemDesignKnowledgeGraph } from "@/knowledge-base/security-architecture/system-design";
import { angularKnowledgeGraph } from "@/knowledge-base/web-development/angular";
import { cssKnowledgeGraph } from "@/knowledge-base/web-development/css";
import { htmlKnowledgeGraph } from "@/knowledge-base/web-development/html";
import { nextjsKnowledgeGraph } from "@/knowledge-base/web-development/nextjs";
import { reactKnowledgeGraph } from "@/knowledge-base/web-development/react";
import { vueKnowledgeGraph } from "@/knowledge-base/web-development/vue";

/** Primary Phase-1 graphs (full quality). */
export const PRIMARY_KNOWLEDGE_GRAPHS: KnowledgeGraph[] = [
  pythonKnowledgeGraph,
  sqlKnowledgeGraph,
  reactKnowledgeGraph,
  kubernetesKnowledgeGraph,
  dataEngineeringKnowledgeGraph,
];

/** All registered graphs including Phase-1 thin starters. */
export const KNOWLEDGE_GRAPH_REGISTRY: KnowledgeGraph[] = [
  ...PRIMARY_KNOWLEDGE_GRAPHS,
  javascriptKnowledgeGraph,
  javaKnowledgeGraph,
  csharpKnowledgeGraph,
  goKnowledgeGraph,
  rustKnowledgeGraph,
  typescriptKnowledgeGraph,
  htmlKnowledgeGraph,
  cssKnowledgeGraph,
  angularKnowledgeGraph,
  vueKnowledgeGraph,
  nextjsKnowledgeGraph,
  dataScienceKnowledgeGraph,
  pandasKnowledgeGraph,
  numpyKnowledgeGraph,
  machineLearningKnowledgeGraph,
  deepLearningKnowledgeGraph,
  statisticsKnowledgeGraph,
  powerBiKnowledgeGraph,
  awsSaaKnowledgeGraph,
  awsDeveloperKnowledgeGraph,
  azureAz900KnowledgeGraph,
  azureAz204KnowledgeGraph,
  gcpKnowledgeGraph,
  dockerKnowledgeGraph,
  terraformKnowledgeGraph,
  devopsKnowledgeGraph,
  cybersecurityKnowledgeGraph,
  systemDesignKnowledgeGraph,
  promptEngineeringKnowledgeGraph,
];

const graphsById = new Map(KNOWLEDGE_GRAPH_REGISTRY.map((graph) => [graph.id, graph]));

export function getKnowledgeGraphById(id: string): KnowledgeGraph | undefined {
  return graphsById.get(id);
}

export function listKnowledgeGraphs(): KnowledgeGraph[] {
  return KNOWLEDGE_GRAPH_REGISTRY;
}
