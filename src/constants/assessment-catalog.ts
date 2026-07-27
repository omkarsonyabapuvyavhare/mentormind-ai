import { routes } from "@/constants/routes";

/** Client-safe assessment catalog metadata — no seed quiz payloads. */
export const assessmentCatalog = [
  {
    topicId: "vpc-networking",
    title: "VPC Networking",
    description:
      "Validate your understanding of VPC subnets, route tables, gateways, security groups, and network ACLs before advancing to storage and architecture topics.",
    questionCount: 12,
    passingScore: 70,
    estimatedMinutes: 30,
    href: routes.assessmentVpc,
    available: true,
  },
] as const;

export function getAssessmentTopic(topicId: string) {
  return assessmentCatalog.find((topic) => topic.topicId === topicId);
}

export type AssessmentCatalogEntry = (typeof assessmentCatalog)[number];
