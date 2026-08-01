import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["react hooks","jsx","python class","sql join syntax"];

const aws_saa_iam_and_accountsTopic = topic({
  id: "aws-saa-iam-and-accounts",
  title: "IAM and Account Security",
  aliases: ["iam","aws iam","least privilege"],
  description: "Secure AWS access with users, roles, policies, and least privilege.",
  learningOrder: 1,
  
  relatedTopicIds: ["aws-saa-vpc-networking"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-saa-iam-users-and-groups",
      title: "IAM Users and Groups",
      description: "IAM Users and Groups applied in this topic.",
    }),
    concept({
      id: "aws-saa-iam-roles",
      title: "IAM Roles",
      description: "IAM Roles applied in this topic.",
    }),
    concept({
      id: "aws-saa-identity-policies",
      title: "Identity Policies",
      description: "Identity Policies applied in this topic.",
    }),
    concept({
      id: "aws-saa-resource-policies",
      title: "Resource Policies",
      description: "Resource Policies applied in this topic.",
    }),
    concept({
      id: "aws-saa-mfa",
      title: "MFA",
      description: "MFA applied in this topic.",
    }),
    concept({
      id: "aws-saa-organizations-intro",
      title: "Organizations Intro",
      description: "Organizations Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply IAM Users and Groups correctly","Explain IAM Roles in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-saa-iam-and-accounts-artifact",
      type: "case-study",
      title: "Read-only S3 policy sketch",
      
      content: "Goal: grant a reporting role read access to one bucket only.\nAllow: s3:ListBucket on arn:aws:s3:::reports\nAllow: s3:GetObject on arn:aws:s3:::reports/*\nDeny by omission: any other bucket or mutating actions\nOutcome: least-privilege read path for reports data",
      expectedOutput: "Principal can list/get objects in reports bucket only",
      explanation: "Least-privilege S3 read policy shape.",
      conceptIds: ["aws-saa-iam-users-and-groups","aws-saa-iam-roles","aws-saa-identity-policies","aws-saa-resource-policies"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-saa-iam-and-accounts-mistake-1",
      "Misapplying IAM Users and Groups",
      "Skipping hands-on checks in IAM and Account Security",
      "Practice IAM Users and Groups with a tiny example first.",
      ["aws-saa-iam-users-and-groups"],
    ),
    mistake(
      "aws-saa-iam-and-accounts-mistake-2",
      "Pulling unrelated-domain demos into IAM and Account Security",
      "Defaulting to out-of-domain snippets",
      "Stay inside IAM and Account Security concepts.",
      ["aws-saa-iam-roles"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-saa-iam-and-accounts-exercise",
      title: "IAM and Account Security mini exercise",
      instructions: ["Build a small example covering IAM Users and Groups.","Extend it with IAM Roles.","Verify behavior related to Identity Policies."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for IAM and Account Security.",
      conceptIds: ["aws-saa-iam-users-and-groups","aws-saa-iam-roles","aws-saa-identity-policies"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-saa-iam-and-accounts", ["aws-saa-iam-users-and-groups","aws-saa-iam-roles","aws-saa-identity-policies","aws-saa-resource-policies","aws-saa-mfa"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_saa_vpc_networkingTopic = topic({
  id: "aws-saa-vpc-networking",
  title: "VPC Networking",
  aliases: ["vpc","aws vpc","subnets","vpc networking","VPC Networking"],
  description: "Design VPCs with subnets, route tables, gateways, and security controls.",
  learningOrder: 2,
  prerequisiteIds: ["aws-saa-iam-and-accounts"],
  relatedTopicIds: ["aws-saa-ec2-compute"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-saa-vpc-cidr",
      title: "VPC CIDR",
      description: "VPC CIDR applied in this topic.",
    }),
    concept({
      id: "aws-saa-public-private-subnets",
      title: "Public/Private Subnets",
      description: "Public/Private Subnets applied in this topic.",
    }),
    concept({
      id: "aws-saa-route-tables",
      title: "Route Tables",
      description: "Route Tables applied in this topic.",
    }),
    concept({
      id: "aws-saa-internet-gateway",
      title: "Internet Gateway",
      description: "Internet Gateway applied in this topic.",
    }),
    concept({
      id: "aws-saa-nat-gateway",
      title: "NAT Gateway",
      description: "NAT Gateway applied in this topic.",
    }),
    concept({
      id: "aws-saa-security-groups-vs-nacls",
      title: "Security Groups vs NACLs",
      description: "Security Groups vs NACLs applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply VPC CIDR correctly","Explain Public/Private Subnets in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-saa-vpc-networking-artifact",
      type: "workflow",
      title: "Two-tier VPC sketch",
      
      content: "Step 1: Create VPC 10.0.0.0/16\nStep 2: Add public subnet 10.0.1.0/24 with IGW for the load balancer\nStep 3: Add private subnet 10.0.2.0/24 with NAT for app tiers\nStep 4: Restrict security groups so only the load balancer can reach app port 443\nOutcome: public ingress stays isolated from private compute",
      expectedOutput: "Public ingress isolated from private compute",
      explanation: "Classic public/private subnet pattern.",
      conceptIds: ["aws-saa-vpc-cidr","aws-saa-public-private-subnets","aws-saa-route-tables","aws-saa-internet-gateway"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-saa-vpc-networking-mistake-1",
      "Misapplying VPC CIDR",
      "Skipping hands-on checks in VPC Networking",
      "Practice VPC CIDR with a tiny example first.",
      ["aws-saa-vpc-cidr"],
    ),
    mistake(
      "aws-saa-vpc-networking-mistake-2",
      "Pulling unrelated-domain demos into VPC Networking",
      "Defaulting to out-of-domain snippets",
      "Stay inside VPC Networking concepts.",
      ["aws-saa-public-private-subnets"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-saa-vpc-networking-exercise",
      title: "VPC Networking mini exercise",
      instructions: ["Build a small example covering VPC CIDR.","Extend it with Public/Private Subnets.","Verify behavior related to Route Tables."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for VPC Networking.",
      conceptIds: ["aws-saa-vpc-cidr","aws-saa-public-private-subnets","aws-saa-route-tables"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-saa-vpc-networking", ["aws-saa-vpc-cidr","aws-saa-public-private-subnets","aws-saa-route-tables","aws-saa-internet-gateway","aws-saa-nat-gateway"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_saa_ec2_computeTopic = topic({
  id: "aws-saa-ec2-compute",
  title: "EC2 Compute",
  aliases: ["ec2","auto scaling"],
  description: "Choose instance families, AMIs, storage, and scaling patterns for EC2.",
  learningOrder: 3,
  prerequisiteIds: ["aws-saa-vpc-networking"],
  relatedTopicIds: ["aws-saa-s3-storage"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-saa-instance-types",
      title: "Instance Types",
      description: "Instance Types applied in this topic.",
    }),
    concept({
      id: "aws-saa-amis",
      title: "AMIs",
      description: "AMIs applied in this topic.",
    }),
    concept({
      id: "aws-saa-ebs-volumes",
      title: "EBS Volumes",
      description: "EBS Volumes applied in this topic.",
    }),
    concept({
      id: "aws-saa-user-data",
      title: "User Data",
      description: "User Data applied in this topic.",
    }),
    concept({
      id: "aws-saa-auto-scaling-groups",
      title: "Auto Scaling Groups",
      description: "Auto Scaling Groups applied in this topic.",
    }),
    concept({
      id: "aws-saa-launch-templates",
      title: "Launch Templates",
      description: "Launch Templates applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Instance Types correctly","Explain AMIs in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-saa-ec2-compute-artifact",
      type: "workflow",
      title: "EC2 Compute worked example",
      
      content: "Step 1: Identify the Instance Types requirement\nStep 2: Apply AMIs in a small scenario\nStep 3: Verify EBS Volumes with an expected check\nOutcome: a validated EC2 Compute mini-runbook",
      
      explanation: "Demonstrates Instance Types, AMIs, EBS Volumes.",
      conceptIds: ["aws-saa-instance-types","aws-saa-amis","aws-saa-ebs-volumes","aws-saa-user-data"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-saa-ec2-compute-mistake-1",
      "Misapplying Instance Types",
      "Skipping hands-on checks in EC2 Compute",
      "Practice Instance Types with a tiny example first.",
      ["aws-saa-instance-types"],
    ),
    mistake(
      "aws-saa-ec2-compute-mistake-2",
      "Pulling unrelated-domain demos into EC2 Compute",
      "Defaulting to out-of-domain snippets",
      "Stay inside EC2 Compute concepts.",
      ["aws-saa-amis"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-saa-ec2-compute-exercise",
      title: "EC2 Compute mini exercise",
      instructions: ["Build a small example covering Instance Types.","Extend it with AMIs.","Verify behavior related to EBS Volumes."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for EC2 Compute.",
      conceptIds: ["aws-saa-instance-types","aws-saa-amis","aws-saa-ebs-volumes"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-saa-ec2-compute", ["aws-saa-instance-types","aws-saa-amis","aws-saa-ebs-volumes","aws-saa-user-data","aws-saa-auto-scaling-groups"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_saa_s3_storageTopic = topic({
  id: "aws-saa-s3-storage",
  title: "S3 Storage",
  aliases: ["s3","object storage"],
  description: "Store objects with appropriate classes, encryption, and access patterns.",
  learningOrder: 4,
  prerequisiteIds: ["aws-saa-ec2-compute"],
  relatedTopicIds: ["aws-saa-databases"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-saa-buckets-and-objects",
      title: "Buckets and Objects",
      description: "Buckets and Objects applied in this topic.",
    }),
    concept({
      id: "aws-saa-storage-classes",
      title: "Storage Classes",
      description: "Storage Classes applied in this topic.",
    }),
    concept({
      id: "aws-saa-versioning",
      title: "Versioning",
      description: "Versioning applied in this topic.",
    }),
    concept({
      id: "aws-saa-encryption",
      title: "Encryption",
      description: "Encryption applied in this topic.",
    }),
    concept({
      id: "aws-saa-presigned-urls",
      title: "Presigned URLs",
      description: "Presigned URLs applied in this topic.",
    }),
    concept({
      id: "aws-saa-lifecycle-rules",
      title: "Lifecycle Rules",
      description: "Lifecycle Rules applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Buckets and Objects correctly","Explain Storage Classes in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-saa-s3-storage-artifact",
      type: "workflow",
      title: "S3 Storage worked example",
      
      content: "Step 1: Identify the Buckets and Objects requirement\nStep 2: Apply Storage Classes in a small scenario\nStep 3: Verify Versioning with an expected check\nOutcome: a validated S3 Storage mini-runbook",
      
      explanation: "Demonstrates Buckets and Objects, Storage Classes, Versioning.",
      conceptIds: ["aws-saa-buckets-and-objects","aws-saa-storage-classes","aws-saa-versioning","aws-saa-encryption"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-saa-s3-storage-mistake-1",
      "Misapplying Buckets and Objects",
      "Skipping hands-on checks in S3 Storage",
      "Practice Buckets and Objects with a tiny example first.",
      ["aws-saa-buckets-and-objects"],
    ),
    mistake(
      "aws-saa-s3-storage-mistake-2",
      "Pulling unrelated-domain demos into S3 Storage",
      "Defaulting to out-of-domain snippets",
      "Stay inside S3 Storage concepts.",
      ["aws-saa-storage-classes"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-saa-s3-storage-exercise",
      title: "S3 Storage mini exercise",
      instructions: ["Build a small example covering Buckets and Objects.","Extend it with Storage Classes.","Verify behavior related to Versioning."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for S3 Storage.",
      conceptIds: ["aws-saa-buckets-and-objects","aws-saa-storage-classes","aws-saa-versioning"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-saa-s3-storage", ["aws-saa-buckets-and-objects","aws-saa-storage-classes","aws-saa-versioning","aws-saa-encryption","aws-saa-presigned-urls"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_saa_databasesTopic = topic({
  id: "aws-saa-databases",
  title: "Managed Databases",
  aliases: ["rds","dynamodb","aurora"],
  description: "Select RDS/Aurora/DynamoDB patterns for relational and key-value workloads.",
  learningOrder: 5,
  prerequisiteIds: ["aws-saa-s3-storage"],
  relatedTopicIds: ["aws-saa-high-availability"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-saa-rds",
      title: "RDS",
      description: "RDS applied in this topic.",
    }),
    concept({
      id: "aws-saa-aurora",
      title: "Aurora",
      description: "Aurora applied in this topic.",
    }),
    concept({
      id: "aws-saa-multi-az",
      title: "Multi-AZ",
      description: "Multi-AZ applied in this topic.",
    }),
    concept({
      id: "aws-saa-read-replicas",
      title: "Read Replicas",
      description: "Read Replicas applied in this topic.",
    }),
    concept({
      id: "aws-saa-dynamodb",
      title: "DynamoDB",
      description: "DynamoDB applied in this topic.",
    }),
    concept({
      id: "aws-saa-elasticache-intro",
      title: "ElastiCache Intro",
      description: "ElastiCache Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply RDS correctly","Explain Aurora in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-saa-databases-artifact",
      type: "workflow",
      title: "Managed Databases worked example",
      
      content: "Step 1: Identify the RDS requirement\nStep 2: Apply Aurora in a small scenario\nStep 3: Verify Multi-AZ with an expected check\nOutcome: a validated Managed Databases mini-runbook",
      
      explanation: "Demonstrates RDS, Aurora, Multi-AZ.",
      conceptIds: ["aws-saa-rds","aws-saa-aurora","aws-saa-multi-az","aws-saa-read-replicas"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-saa-databases-mistake-1",
      "Misapplying RDS",
      "Skipping hands-on checks in Managed Databases",
      "Practice RDS with a tiny example first.",
      ["aws-saa-rds"],
    ),
    mistake(
      "aws-saa-databases-mistake-2",
      "Pulling unrelated-domain demos into Managed Databases",
      "Defaulting to out-of-domain snippets",
      "Stay inside Managed Databases concepts.",
      ["aws-saa-aurora"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-saa-databases-exercise",
      title: "Managed Databases mini exercise",
      instructions: ["Build a small example covering RDS.","Extend it with Aurora.","Verify behavior related to Multi-AZ."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Managed Databases.",
      conceptIds: ["aws-saa-rds","aws-saa-aurora","aws-saa-multi-az"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-saa-databases", ["aws-saa-rds","aws-saa-aurora","aws-saa-multi-az","aws-saa-read-replicas","aws-saa-dynamodb"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_saa_high_availabilityTopic = topic({
  id: "aws-saa-high-availability",
  title: "High Availability and Elastic Load Balancing",
  aliases: ["alb","high availability","multi-az"],
  description: "Distribute traffic and survive AZ failures with ELB and multi-AZ design.",
  learningOrder: 6,
  prerequisiteIds: ["aws-saa-databases"],
  relatedTopicIds: ["aws-saa-security-services"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-saa-availability-zones",
      title: "Availability Zones",
      description: "Availability Zones applied in this topic.",
    }),
    concept({
      id: "aws-saa-application-load-balancer",
      title: "Application Load Balancer",
      description: "Application Load Balancer applied in this topic.",
    }),
    concept({
      id: "aws-saa-target-groups",
      title: "Target Groups",
      description: "Target Groups applied in this topic.",
    }),
    concept({
      id: "aws-saa-health-checks",
      title: "Health Checks",
      description: "Health Checks applied in this topic.",
    }),
    concept({
      id: "aws-saa-multi-az-patterns",
      title: "Multi-AZ Patterns",
      description: "Multi-AZ Patterns applied in this topic.",
    }),
    concept({
      id: "aws-saa-decoupling-with-sqs-intro",
      title: "Decoupling with SQS Intro",
      description: "Decoupling with SQS Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Availability Zones correctly","Explain Application Load Balancer in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-saa-high-availability-artifact",
      type: "workflow",
      title: "High Availability and Elastic Load Balancing worked example",
      
      content: "Step 1: Identify the Availability Zones requirement\nStep 2: Apply Application Load Balancer in a small scenario\nStep 3: Verify Target Groups with an expected check\nOutcome: a validated High Availability and Elastic Load Balancing mini-runbook",
      
      explanation: "Demonstrates Availability Zones, Application Load Balancer, Target Groups.",
      conceptIds: ["aws-saa-availability-zones","aws-saa-application-load-balancer","aws-saa-target-groups","aws-saa-health-checks"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-saa-high-availability-mistake-1",
      "Misapplying Availability Zones",
      "Skipping hands-on checks in High Availability and Elastic Load Balancing",
      "Practice Availability Zones with a tiny example first.",
      ["aws-saa-availability-zones"],
    ),
    mistake(
      "aws-saa-high-availability-mistake-2",
      "Pulling unrelated-domain demos into High Availability and Elastic Load Balancing",
      "Defaulting to out-of-domain snippets",
      "Stay inside High Availability and Elastic Load Balancing concepts.",
      ["aws-saa-application-load-balancer"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-saa-high-availability-exercise",
      title: "High Availability and Elastic Load Balancing mini exercise",
      instructions: ["Build a small example covering Availability Zones.","Extend it with Application Load Balancer.","Verify behavior related to Target Groups."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for High Availability and Elastic Load Balancing.",
      conceptIds: ["aws-saa-availability-zones","aws-saa-application-load-balancer","aws-saa-target-groups"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-saa-high-availability", ["aws-saa-availability-zones","aws-saa-application-load-balancer","aws-saa-target-groups","aws-saa-health-checks","aws-saa-multi-az-patterns"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_saa_security_servicesTopic = topic({
  id: "aws-saa-security-services",
  title: "Security Services",
  aliases: ["kms","cloudtrail","waf"],
  description: "Protect data and apps with KMS, Secrets Manager, WAF, and CloudTrail.",
  learningOrder: 7,
  prerequisiteIds: ["aws-saa-high-availability"],
  relatedTopicIds: ["aws-saa-cost-and-architecture"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-saa-kms",
      title: "KMS",
      description: "KMS applied in this topic.",
    }),
    concept({
      id: "aws-saa-secrets-manager",
      title: "Secrets Manager",
      description: "Secrets Manager applied in this topic.",
    }),
    concept({
      id: "aws-saa-aws-waf",
      title: "AWS WAF",
      description: "AWS WAF applied in this topic.",
    }),
    concept({
      id: "aws-saa-cloudtrail",
      title: "CloudTrail",
      description: "CloudTrail applied in this topic.",
    }),
    concept({
      id: "aws-saa-guardduty-intro",
      title: "GuardDuty Intro",
      description: "GuardDuty Intro applied in this topic.",
    }),
    concept({
      id: "aws-saa-encryption-in-transit-rest",
      title: "Encryption in Transit/Rest",
      description: "Encryption in Transit/Rest applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply KMS correctly","Explain Secrets Manager in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-saa-security-services-artifact",
      type: "workflow",
      title: "Security Services worked example",
      
      content: "Step 1: Identify the KMS requirement\nStep 2: Apply Secrets Manager in a small scenario\nStep 3: Verify AWS WAF with an expected check\nOutcome: a validated Security Services mini-runbook",
      
      explanation: "Demonstrates KMS, Secrets Manager, AWS WAF.",
      conceptIds: ["aws-saa-kms","aws-saa-secrets-manager","aws-saa-aws-waf","aws-saa-cloudtrail"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-saa-security-services-mistake-1",
      "Misapplying KMS",
      "Skipping hands-on checks in Security Services",
      "Practice KMS with a tiny example first.",
      ["aws-saa-kms"],
    ),
    mistake(
      "aws-saa-security-services-mistake-2",
      "Pulling unrelated-domain demos into Security Services",
      "Defaulting to out-of-domain snippets",
      "Stay inside Security Services concepts.",
      ["aws-saa-secrets-manager"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-saa-security-services-exercise",
      title: "Security Services mini exercise",
      instructions: ["Build a small example covering KMS.","Extend it with Secrets Manager.","Verify behavior related to AWS WAF."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Security Services.",
      conceptIds: ["aws-saa-kms","aws-saa-secrets-manager","aws-saa-aws-waf"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-saa-security-services", ["aws-saa-kms","aws-saa-secrets-manager","aws-saa-aws-waf","aws-saa-cloudtrail","aws-saa-guardduty-intro"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_saa_cost_and_architectureTopic = topic({
  id: "aws-saa-cost-and-architecture",
  title: "Cost Optimization and Well-Architected Tradeoffs",
  aliases: ["well-architected","cost optimization"],
  description: "Balance reliability, performance, and cost using Well-Architected themes.",
  learningOrder: 8,
  prerequisiteIds: ["aws-saa-security-services"],
  
  difficulty: "advanced",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-saa-pricing-models",
      title: "Pricing Models",
      description: "Pricing Models applied in this topic.",
    }),
    concept({
      id: "aws-saa-reserved-savings-plans",
      title: "Reserved/Savings Plans",
      description: "Reserved/Savings Plans applied in this topic.",
    }),
    concept({
      id: "aws-saa-right-sizing",
      title: "Right Sizing",
      description: "Right Sizing applied in this topic.",
    }),
    concept({
      id: "aws-saa-well-architected-pillars",
      title: "Well-Architected Pillars",
      description: "Well-Architected Pillars applied in this topic.",
    }),
    concept({
      id: "aws-saa-managed-vs-self-managed",
      title: "Managed vs Self-Managed",
      description: "Managed vs Self-Managed applied in this topic.",
    }),
    concept({
      id: "aws-saa-architecture-decision-records",
      title: "Architecture Decision Records",
      description: "Architecture Decision Records applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Pricing Models correctly","Explain Reserved/Savings Plans in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-saa-cost-and-architecture-artifact",
      type: "workflow",
      title: "Cost Optimization and Well-Architected Tradeoffs worked example",
      
      content: "Step 1: Identify the Pricing Models requirement\nStep 2: Apply Reserved/Savings Plans in a small scenario\nStep 3: Verify Right Sizing with an expected check\nOutcome: a validated Cost Optimization and Well-Architected Tradeoffs mini-runbook",
      
      explanation: "Demonstrates Pricing Models, Reserved/Savings Plans, Right Sizing.",
      conceptIds: ["aws-saa-pricing-models","aws-saa-reserved-savings-plans","aws-saa-right-sizing","aws-saa-well-architected-pillars"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-saa-cost-and-architecture-mistake-1",
      "Misapplying Pricing Models",
      "Skipping hands-on checks in Cost Optimization and Well-Architected Tradeoffs",
      "Practice Pricing Models with a tiny example first.",
      ["aws-saa-pricing-models"],
    ),
    mistake(
      "aws-saa-cost-and-architecture-mistake-2",
      "Pulling unrelated-domain demos into Cost Optimization and Well-Architected Tradeoffs",
      "Defaulting to out-of-domain snippets",
      "Stay inside Cost Optimization and Well-Architected Tradeoffs concepts.",
      ["aws-saa-reserved-savings-plans"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-saa-cost-and-architecture-exercise",
      title: "Cost Optimization and Well-Architected Tradeoffs mini exercise",
      instructions: ["Build a small example covering Pricing Models.","Extend it with Reserved/Savings Plans.","Verify behavior related to Right Sizing."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Cost Optimization and Well-Architected Tradeoffs.",
      conceptIds: ["aws-saa-pricing-models","aws-saa-reserved-savings-plans","aws-saa-right-sizing"],
      difficulty: "advanced",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-saa-cost-and-architecture", ["aws-saa-pricing-models","aws-saa-reserved-savings-plans","aws-saa-right-sizing","aws-saa-well-architected-pillars","aws-saa-managed-vs-self-managed"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

export const awsSaaKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-aws-saa",
  title: "AWS Solutions Architect",
  aliases: ["aws","aws saa","saa-c03","aws solutions architect","aws solutions architect associate","learn aws saa","amazon web services saa"],
  category: "Cloud",
  description: "AWS SAA curriculum covering IAM, VPC, EC2, S3, databases, high availability, security, and cost/architecture tradeoffs for the Solutions Architect Associate exam path.",
  topics: [aws_saa_iam_and_accountsTopic, aws_saa_vpc_networkingTopic, aws_saa_ec2_computeTopic, aws_saa_s3_storageTopic, aws_saa_databasesTopic, aws_saa_high_availabilityTopic, aws_saa_security_servicesTopic, aws_saa_cost_and_architectureTopic],
});
