import { routes } from "@/constants/routes";
import { awsSaaQuizzes } from "@/data/aws-saa-seed";

const vpcQuiz = awsSaaQuizzes["vpc-networking"];

export const assessmentCatalog = [
  {
    topicId: "vpc-networking",
    title: "VPC Networking",
    description:
      "Validate your understanding of VPC subnets, route tables, gateways, security groups, and network ACLs before advancing to storage and architecture topics.",
    questionCount: vpcQuiz.questions.length,
    passingScore: vpcQuiz.passingScore,
    estimatedMinutes: 30,
    href: routes.assessmentVpc,
    available: true,
  },
] as const;

export function getAssessmentTopic(topicId: string) {
  return assessmentCatalog.find((topic) => topic.topicId === topicId);
}
