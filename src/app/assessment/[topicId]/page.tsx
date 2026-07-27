import { GeneratedAssessmentView } from "@/components/assessment/generated-assessment-view";

export default async function AssessmentTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  return <GeneratedAssessmentView topicId={topicId} />;
}
