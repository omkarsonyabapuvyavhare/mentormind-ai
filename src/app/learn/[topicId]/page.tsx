import { LessonView } from "@/components/tutor/lesson-view";

export default async function LessonPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  return <LessonView topicId={topicId} />;
}
