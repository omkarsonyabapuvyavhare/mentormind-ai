import type { TaskType } from "@/types";

export interface AwsTopic {
  id: string;
  name: string;
  domain: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface TopicQuiz {
  topicId: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface MilestoneSeed {
  id: string;
  title: string;
  week: number;
  topicIds: string[];
}

export interface TaskSeed {
  id: string;
  milestoneId: string;
  topicId: string;
  type: TaskType;
  title: string;
  estimatedMinutes: number;
  priority: number;
}

export const awsSaaGoal = {
  title: "Pass AWS Solutions Architect Associate (SAA-C03) in 8 weeks",
  examCode: "SAA-C03",
  durationWeeks: 8,
} as const;

export const awsSaaTopics: AwsTopic[] = [
  { id: "cloud-foundations", name: "Cloud Foundations", domain: "General" },
  { id: "iam-security", name: "IAM and Security", domain: "Security" },
  { id: "ec2-compute", name: "EC2 and Compute", domain: "Compute" },
  { id: "vpc-networking", name: "VPC Networking", domain: "Networking" },
  { id: "s3-storage", name: "S3 and Storage", domain: "Storage" },
  { id: "databases", name: "Databases", domain: "Database" },
  { id: "high-availability", name: "High Availability", domain: "Architecture" },
  { id: "exam-prep", name: "Exam Preparation", domain: "Review" },
];

export const awsSaaMilestoneSeeds: MilestoneSeed[] = [
  {
    id: "ms-week-1",
    title: "Week 1 — Cloud Foundations",
    week: 1,
    topicIds: ["cloud-foundations"],
  },
  {
    id: "ms-week-2",
    title: "Week 2 — IAM and Security",
    week: 2,
    topicIds: ["iam-security"],
  },
  {
    id: "ms-week-3",
    title: "Week 3 — EC2 and Compute",
    week: 3,
    topicIds: ["ec2-compute"],
  },
  {
    id: "ms-week-4",
    title: "Week 4 — VPC Networking",
    week: 4,
    topicIds: ["vpc-networking"],
  },
  {
    id: "ms-week-5",
    title: "Week 5 — S3 and Storage",
    week: 5,
    topicIds: ["s3-storage"],
  },
  {
    id: "ms-week-6",
    title: "Week 6 — Databases",
    week: 6,
    topicIds: ["databases"],
  },
  {
    id: "ms-week-7",
    title: "Week 7 — High Availability",
    week: 7,
    topicIds: ["high-availability"],
  },
  {
    id: "ms-week-8",
    title: "Week 8 — Exam Preparation",
    week: 8,
    topicIds: ["exam-prep"],
  },
];

export const awsSaaTaskSeeds: TaskSeed[] = [
  {
    id: "task-cloud-lesson",
    milestoneId: "ms-week-1",
    topicId: "cloud-foundations",
    type: "lesson",
    title: "AWS Global Infrastructure Overview",
    estimatedMinutes: 45,
    priority: 1,
  },
  {
    id: "task-cloud-quiz",
    milestoneId: "ms-week-1",
    topicId: "cloud-foundations",
    type: "quiz",
    title: "Cloud Foundations Quiz",
    estimatedMinutes: 20,
    priority: 2,
  },
  {
    id: "task-iam-lesson",
    milestoneId: "ms-week-2",
    topicId: "iam-security",
    type: "lesson",
    title: "IAM Policies and Roles Deep Dive",
    estimatedMinutes: 50,
    priority: 1,
  },
  {
    id: "task-iam-quiz",
    milestoneId: "ms-week-2",
    topicId: "iam-security",
    type: "quiz",
    title: "IAM and Security Quiz",
    estimatedMinutes: 25,
    priority: 2,
  },
  {
    id: "task-ec2-lesson",
    milestoneId: "ms-week-3",
    topicId: "ec2-compute",
    type: "lesson",
    title: "EC2 Instance Types and Pricing",
    estimatedMinutes: 45,
    priority: 1,
  },
  {
    id: "task-ec2-lab",
    milestoneId: "ms-week-3",
    topicId: "ec2-compute",
    type: "lab",
    title: "Launch and Configure an EC2 Instance",
    estimatedMinutes: 60,
    priority: 2,
  },
  {
    id: "task-vpc-lesson",
    milestoneId: "ms-week-4",
    topicId: "vpc-networking",
    type: "lesson",
    title: "VPC Subnets, Route Tables, and Gateways",
    estimatedMinutes: 50,
    priority: 1,
  },
  {
    id: "task-vpc-quiz",
    milestoneId: "ms-week-4",
    topicId: "vpc-networking",
    type: "quiz",
    title: "VPC Networking Quiz",
    estimatedMinutes: 30,
    priority: 2,
  },
  {
    id: "task-vpc-lab",
    milestoneId: "ms-week-4",
    topicId: "vpc-networking",
    type: "lab",
    title: "VPC Networking Lab",
    estimatedMinutes: 60,
    priority: 1,
  },
  {
    id: "task-s3-lesson",
    milestoneId: "ms-week-5",
    topicId: "s3-storage",
    type: "lesson",
    title: "S3 Storage Classes and Lifecycle Policies",
    estimatedMinutes: 40,
    priority: 1,
  },
  {
    id: "task-s3-quiz",
    milestoneId: "ms-week-5",
    topicId: "s3-storage",
    type: "quiz",
    title: "S3 and Storage Quiz",
    estimatedMinutes: 25,
    priority: 2,
  },
  {
    id: "task-db-lesson",
    milestoneId: "ms-week-6",
    topicId: "databases",
    type: "lesson",
    title: "RDS vs DynamoDB Selection Guide",
    estimatedMinutes: 45,
    priority: 1,
  },
  {
    id: "task-ha-lesson",
    milestoneId: "ms-week-7",
    topicId: "high-availability",
    type: "lesson",
    title: "Multi-AZ and Auto Scaling Patterns",
    estimatedMinutes: 50,
    priority: 1,
  },
  {
    id: "task-exam-review",
    milestoneId: "ms-week-8",
    topicId: "exam-prep",
    type: "review",
    title: "Full-Length Practice Exam Review",
    estimatedMinutes: 90,
    priority: 1,
  },
  {
    id: "task-exam-quiz",
    milestoneId: "ms-week-8",
    topicId: "exam-prep",
    type: "quiz",
    title: "SAA-C03 Mock Exam",
    estimatedMinutes: 130,
    priority: 2,
  },
  {
    id: "task-cert-readiness-check",
    milestoneId: "ms-week-8",
    topicId: "exam-prep",
    type: "review",
    title: "Certification Readiness Check",
    estimatedMinutes: 20,
    priority: 3,
  },
];

const vpcQuizQuestions: QuizQuestion[] = [
  {
    id: "vpc-q1",
    prompt: "What is the primary purpose of an Internet Gateway in a VPC?",
    options: [
      "Connect two VPCs privately",
      "Allow internet access for public subnets",
      "Encrypt traffic between subnets",
      "Replace NAT Gateway in private subnets",
    ],
    correctIndex: 1,
  },
  {
    id: "vpc-q2",
    prompt: "Which component enables outbound internet access for instances in a private subnet?",
    options: ["Internet Gateway", "NAT Gateway", "VPC Peering", "Direct Connect"],
    correctIndex: 1,
  },
  {
    id: "vpc-q3",
    prompt: "How many VPCs can you create per AWS Region by default?",
    options: ["1", "5", "10", "Unlimited"],
    correctIndex: 1,
  },
  {
    id: "vpc-q4",
    prompt: "What does a Security Group act as?",
    options: [
      "A stateless firewall at subnet level",
      "A stateful virtual firewall at instance level",
      "A routing table for VPC traffic",
      "A DNS resolver for VPC endpoints",
    ],
    correctIndex: 1,
  },
  {
    id: "vpc-q5",
    prompt: "Which CIDR block is valid for a VPC?",
    options: ["10.0.0.0/8", "10.0.0.0/33", "256.256.0.0/16", "0.0.0.0/0 only"],
    correctIndex: 0,
  },
  {
    id: "vpc-q6",
    prompt: "What is the maximum number of Availability Zones you can use in a VPC?",
    options: [
      "All AZs in the Region",
      "3 only",
      "2 only",
      "1 per subnet",
    ],
    correctIndex: 0,
  },
  {
    id: "vpc-q7",
    prompt: "A Network ACL is associated with:",
    options: ["EC2 instances", "Subnets", "Route tables", "Security groups"],
    correctIndex: 1,
  },
  {
    id: "vpc-q8",
    prompt: "VPC Peering allows you to:",
    options: [
      "Route traffic between two VPCs using private IP addresses",
      "Share IAM roles across accounts automatically",
      "Merge two VPC CIDR blocks into one",
      "Replace Transit Gateway for all use cases",
    ],
    correctIndex: 0,
  },
  {
    id: "vpc-q9",
    prompt: "Which AWS service provides a private connection from on-premises to AWS?",
    options: ["NAT Gateway", "AWS Direct Connect", "Internet Gateway", "Elastic IP"],
    correctIndex: 1,
  },
  {
    id: "vpc-q10",
    prompt: "What happens when you delete the default VPC in a Region?",
    options: [
      "You can recreate it or create a custom VPC",
      "All EC2 instances in the Region are deleted",
      "Your AWS account is suspended",
      "IAM policies are reset",
    ],
    correctIndex: 0,
  },
  {
    id: "vpc-q11",
    prompt: "Which route table entry sends traffic to the Internet Gateway?",
    options: ["0.0.0.0/0 → local", "0.0.0.0/0 → igw-id", "10.0.0.0/16 → igw-id", "127.0.0.1/32 → igw-id"],
    correctIndex: 1,
  },
  {
    id: "vpc-q12",
    prompt: "Elastic IP addresses are used for:",
    options: [
      "Static public IPv4 addresses for instances",
      "Private DNS resolution",
      "Subnet CIDR allocation",
      "Cross-Region VPC replication",
    ],
    correctIndex: 0,
  },
];

export const awsSaaQuizzes: Record<string, TopicQuiz> = {
  "vpc-networking": {
    topicId: "vpc-networking",
    passingScore: 70,
    questions: vpcQuizQuestions,
  },
};
