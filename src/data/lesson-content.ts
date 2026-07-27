export interface LessonConcept {
  title: string;
  body: string;
}

export interface LessonContent {
  topicId: string;
  title: string;
  subtitle: string;
  concepts: LessonConcept[];
  diagramLabel: string;
  diagramCaption: string;
  takeaway: string;
  estimatedMinutes: number;
}

export const lessonContentByTopic: Record<string, LessonContent> = {
  "cloud-foundations": {
    topicId: "cloud-foundations",
    title: "AWS Global Infrastructure Overview",
    subtitle: "How AWS regions, availability zones, and edge locations fit together",
    concepts: [
      {
        title: "Regions and Availability Zones",
        body: "A Region is a geographic area with multiple isolated Availability Zones (AZs). Deploy across AZs for fault tolerance — if one AZ fails, others keep serving traffic.",
      },
      {
        title: "Shared Responsibility Model",
        body: "AWS secures the cloud (hardware, facilities, hypervisor). You secure what you put in the cloud — data, IAM policies, encryption, and network configuration.",
      },
      {
        title: "Well-Architected Foundations",
        body: "Every SAA decision starts with operational excellence, security, reliability, performance, cost, and sustainability. Your roadmap builds these habits topic by topic.",
      },
    ],
    diagramLabel: "AWS Global Infrastructure",
    diagramCaption: "Region → multiple AZs → services deployed with redundancy",
    takeaway:
      "Think in layers: pick the right Region for latency and compliance, then spread workloads across AZs before optimizing cost.",
    estimatedMinutes: 45,
  },
  "vpc-networking": {
    topicId: "vpc-networking",
    title: "VPC Subnets, Route Tables, and Gateways",
    subtitle: "Design isolated networks that connect securely to the internet and on-premises",
    concepts: [
      {
        title: "VPC and Subnets",
        body: "A VPC is your private network in AWS. Subnets split that network into segments — typically public subnets (internet-facing) and private subnets (app and data tiers).",
      },
      {
        title: "Route Tables and Gateways",
        body: "Route tables decide where traffic goes. An Internet Gateway lets public subnets reach the internet; a NAT Gateway lets private subnets initiate outbound connections without inbound exposure.",
      },
      {
        title: "Security Groups vs NACLs",
        body: "Security groups are stateful firewalls at the instance level. Network ACLs are stateless filters at the subnet edge. Use both — SGs for fine-grained control, NACLs for subnet-wide rules.",
      },
    ],
    diagramLabel: "VPC Architecture",
    diagramCaption: "Public subnet (IGW) · Private subnet (NAT) · Route tables per subnet",
    takeaway:
      "Public resources get an IGW path; private resources use NAT for outbound-only access. Always pair subnets with the right route table.",
    estimatedMinutes: 50,
  },
  "iam-security": {
    topicId: "iam-security",
    title: "IAM Policies and Roles Deep Dive",
    subtitle: "Grant least-privilege access using policies, roles, and trust relationships",
    concepts: [
      {
        title: "Policies and Permissions",
        body: "IAM policies are JSON documents that allow or deny actions on resources. Attach policies to users, groups, or roles — prefer roles for services and temporary access.",
      },
      {
        title: "Roles and Trust",
        body: "An IAM role is an identity with permissions that a trusted entity can assume. EC2 instances, Lambda functions, and cross-account access all use roles instead of long-lived keys.",
      },
      {
        title: "Least Privilege in Practice",
        body: "Start with AWS managed policies for learning, then tighten with inline policies. Use condition keys and permission boundaries for production workloads.",
      },
    ],
    diagramLabel: "IAM Trust Flow",
    diagramCaption: "Principal → AssumeRole → Temporary credentials → AWS API",
    takeaway: "Never embed access keys in code. Use roles with scoped policies and rotate credentials through STS.",
    estimatedMinutes: 50,
  },
};

/** Returns AWS seed lesson content when available; never falls back to unrelated topics. */
export function getLessonContent(topicId: string): LessonContent | null {
  return lessonContentByTopic[topicId] ?? null;
}

/** Demo and AWS SAA seed fallback — preserves legacy VPC default for unknown seed topics. */
export function getAwsSeedLessonContent(topicId: string): LessonContent {
  return lessonContentByTopic[topicId] ?? lessonContentByTopic["vpc-networking"];
}
