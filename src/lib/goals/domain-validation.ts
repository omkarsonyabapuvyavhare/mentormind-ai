import { containsAwsSpecificTopic } from "@/lib/ai/roadmap-schema";
import {
  AWS_CERTIFICATION_SLUG,
  AZURE_CERTIFICATION_SLUG,
  type GoalCategory,
} from "@/lib/goals/goal-identity";

const AZURE_PATTERN =
  /\b(azure|microsoft azure|az-900|blob storage|virtual network|resource group)\b/i;

const PROGRAMMING_PATTERN =
  /\b(python oop|object-oriented programming|react hooks|jsx|django|flask|pandas dataframe)\b/i;

const WEB_PATTERN = /\b(react component|vue component|angular module|frontend framework)\b/i;

const DEVOPS_PATTERN = /\b(kubernetes pod|helm chart|docker container|terraform module)\b/i;

const DATA_PATTERN = /\b(sql join|database normalization|etl pipeline|power bi dashboard)\b/i;

const ML_PATTERN = /\b(neural network|gradient descent|prompt engineering technique|fine-tuning)\b/i;

function containsAzureSpecificTopic(text: string): boolean {
  return AZURE_PATTERN.test(text);
}

export function validateContentForGoalCategory(
  content: string,
  goalCategory: GoalCategory,
  goalSlug: string,
): string | null {
  const haystack = content.toLowerCase();

  if (goalSlug === AWS_CERTIFICATION_SLUG) {
    return null;
  }

  if (goalSlug === AZURE_CERTIFICATION_SLUG) {
    if (containsAwsSpecificTopic(haystack)) {
      return "Azure goals must not include AWS-specific content.";
    }
    return null;
  }

  if (containsAwsSpecificTopic(haystack) && goalCategory !== "Cloud") {
    return "Non-cloud goals must not include AWS-specific content.";
  }

  if (containsAzureSpecificTopic(haystack) && goalCategory !== "Cloud") {
    return "Non-cloud goals must not include Azure-specific content.";
  }

  if (goalCategory === "Programming" && (containsAwsSpecificTopic(haystack) || containsAzureSpecificTopic(haystack))) {
    return "Programming goals must not include cloud certification content.";
  }

  if (goalCategory === "Web Development") {
    if (containsAwsSpecificTopic(haystack) || containsAzureSpecificTopic(haystack)) {
      return "Web development goals must not include cloud platform content.";
    }
    if (PROGRAMMING_PATTERN.test(haystack) && !WEB_PATTERN.test(haystack) && /\bpython oop\b/i.test(haystack)) {
      return "Web development goals must not include unrelated programming topics.";
    }
  }

  if (goalCategory === "Cloud" && goalSlug !== AWS_CERTIFICATION_SLUG && goalSlug !== AZURE_CERTIFICATION_SLUG) {
    if (PROGRAMMING_PATTERN.test(haystack) && !/\b(lambda|cloud sdk|infrastructure as code)\b/i.test(haystack)) {
      return "Cloud goals must not include unrelated programming curriculum topics.";
    }
  }

  if (goalCategory === "DevOps" && WEB_PATTERN.test(haystack) && !DEVOPS_PATTERN.test(haystack)) {
    return "DevOps goals must not include unrelated web framework topics.";
  }

  if (goalCategory === "Data" && (containsAwsSpecificTopic(haystack) || WEB_PATTERN.test(haystack))) {
    if (!DATA_PATTERN.test(haystack)) {
      return "Data goals must stay focused on data concepts.";
    }
  }

  if (goalCategory === "AI / Machine Learning" && containsAzureSpecificTopic(haystack) && !ML_PATTERN.test(haystack)) {
    return "Machine learning goals must not include unrelated Azure content.";
  }

  return null;
}
