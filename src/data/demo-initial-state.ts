/** Task and milestone IDs used to seed the PPT-aligned initial dashboard state. */
export const demoInitialCompletedTaskIds = [
  "task-cloud-lesson",
  "task-cloud-quiz",
  "task-iam-lesson",
  "task-iam-quiz",
  "task-ec2-lesson",
  "task-ec2-lab",
  "task-vpc-lesson",
  "task-vpc-quiz",
  "task-s3-lesson",
  "task-s3-quiz",
  "task-db-lesson",
] as const;

export const demoInitialCurrentMilestoneId = "ms-week-4";

export const demoInitialStrengths = [
  {
    topicId: "iam-security",
    topicName: "IAM and Security",
    score: 88,
  },
  {
    topicId: "ec2-compute",
    topicName: "EC2 and Compute",
    score: 84,
  },
] as const;
