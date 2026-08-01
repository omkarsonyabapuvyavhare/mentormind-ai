import { awsDeveloperKnowledgeGraph } from "@/knowledge-base/cloud-devops/aws-developer";
import { awsSaaKnowledgeGraph } from "@/knowledge-base/cloud-devops/aws-saa";
import { azureAz204KnowledgeGraph } from "@/knowledge-base/cloud-devops/azure-az204";
import { azureAz900KnowledgeGraph } from "@/knowledge-base/cloud-devops/azure-az900";
import { devopsKnowledgeGraph } from "@/knowledge-base/cloud-devops/devops";
import { dockerKnowledgeGraph } from "@/knowledge-base/cloud-devops/docker";
import { gcpKnowledgeGraph } from "@/knowledge-base/cloud-devops/gcp";
import { kubernetesKnowledgeGraph } from "@/knowledge-base/cloud-devops/kubernetes";
import { terraformKnowledgeGraph } from "@/knowledge-base/cloud-devops/terraform";
import type { KnowledgeGraph } from "@/knowledge-base/schema";

/** Cloud and DevOps category aggregator — Kubernetes is the Phase-1 primary graph. */
export const cloudDevopsKnowledgeGraphs: KnowledgeGraph[] = [
  kubernetesKnowledgeGraph,
  awsSaaKnowledgeGraph,
  awsDeveloperKnowledgeGraph,
  azureAz900KnowledgeGraph,
  azureAz204KnowledgeGraph,
  gcpKnowledgeGraph,
  dockerKnowledgeGraph,
  terraformKnowledgeGraph,
  devopsKnowledgeGraph,
];

export {
  awsDeveloperKnowledgeGraph,
  awsSaaKnowledgeGraph,
  azureAz204KnowledgeGraph,
  azureAz900KnowledgeGraph,
  devopsKnowledgeGraph,
  dockerKnowledgeGraph,
  gcpKnowledgeGraph,
  kubernetesKnowledgeGraph,
  terraformKnowledgeGraph,
};
