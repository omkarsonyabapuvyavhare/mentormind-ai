import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["react hooks","jsx","python class","sql join"];

const gcp_projects_and_iamTopic = topic({
  id: "gcp-projects-and-iam",
  title: "Projects and IAM",
  aliases: ["gcp iam","service accounts"],
  description: "Organize resources with projects and least-privilege IAM roles.",
  learningOrder: 1,
  
  relatedTopicIds: ["gcp-compute-engine"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "gcp-projects",
      title: "Projects",
      description: "Projects applied in this topic.",
    }),
    concept({
      id: "gcp-folders-org-intro",
      title: "Folders/Org Intro",
      description: "Folders/Org Intro applied in this topic.",
    }),
    concept({
      id: "gcp-iam-roles",
      title: "IAM Roles",
      description: "IAM Roles applied in this topic.",
    }),
    concept({
      id: "gcp-service-accounts",
      title: "Service Accounts",
      description: "Service Accounts applied in this topic.",
    }),
    concept({
      id: "gcp-policy-bindings",
      title: "Policy Bindings",
      description: "Policy Bindings applied in this topic.",
    }),
    concept({
      id: "gcp-least-privilege",
      title: "Least Privilege",
      description: "Least Privilege applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Projects correctly","Explain Folders/Org Intro in context"],
  practicalArtifacts: [
    artifact({
      id: "gcp-projects-and-iam-artifact",
      type: "workflow",
      title: "Projects and IAM worked example",
      
      content: "Step 1: Identify the Projects requirement\nStep 2: Apply Folders/Org Intro in a small scenario\nStep 3: Verify IAM Roles with an expected check\nOutcome: a validated Projects and IAM mini-runbook",
      
      explanation: "Demonstrates Projects, Folders/Org Intro, IAM Roles.",
      conceptIds: ["gcp-projects","gcp-folders-org-intro","gcp-iam-roles","gcp-service-accounts"],
    }),
  ],
  commonMistakes: [
    mistake(
      "gcp-projects-and-iam-mistake-1",
      "Misapplying Projects",
      "Skipping hands-on checks in Projects and IAM",
      "Practice Projects with a tiny example first.",
      ["gcp-projects"],
    ),
    mistake(
      "gcp-projects-and-iam-mistake-2",
      "Pulling unrelated-domain demos into Projects and IAM",
      "Defaulting to out-of-domain snippets",
      "Stay inside Projects and IAM concepts.",
      ["gcp-folders-org-intro"],
    ),
  ],
  exercises: [
    exercise({
      id: "gcp-projects-and-iam-exercise",
      title: "Projects and IAM mini exercise",
      instructions: ["Build a small example covering Projects.","Extend it with Folders/Org Intro.","Verify behavior related to IAM Roles."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Projects and IAM.",
      conceptIds: ["gcp-projects","gcp-folders-org-intro","gcp-iam-roles"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("gcp-projects-and-iam", ["gcp-projects","gcp-folders-org-intro","gcp-iam-roles","gcp-service-accounts","gcp-policy-bindings"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const gcp_compute_engineTopic = topic({
  id: "gcp-compute-engine",
  title: "Compute Engine",
  aliases: ["compute engine","gcp vms"],
  description: "Launch VMs with machine types, disks, and instance groups.",
  learningOrder: 2,
  prerequisiteIds: ["gcp-projects-and-iam"],
  relatedTopicIds: ["gcp-gke-intro"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "gcp-vm-instances",
      title: "VM Instances",
      description: "VM Instances applied in this topic.",
    }),
    concept({
      id: "gcp-machine-types",
      title: "Machine Types",
      description: "Machine Types applied in this topic.",
    }),
    concept({
      id: "gcp-persistent-disks",
      title: "Persistent Disks",
      description: "Persistent Disks applied in this topic.",
    }),
    concept({
      id: "gcp-instance-templates",
      title: "Instance Templates",
      description: "Instance Templates applied in this topic.",
    }),
    concept({
      id: "gcp-managed-instance-groups",
      title: "Managed Instance Groups",
      description: "Managed Instance Groups applied in this topic.",
    }),
    concept({
      id: "gcp-startup-scripts",
      title: "Startup Scripts",
      description: "Startup Scripts applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply VM Instances correctly","Explain Machine Types in context"],
  practicalArtifacts: [
    artifact({
      id: "gcp-compute-engine-artifact",
      type: "workflow",
      title: "Compute Engine worked example",
      
      content: "Step 1: Identify the VM Instances requirement\nStep 2: Apply Machine Types in a small scenario\nStep 3: Verify Persistent Disks with an expected check\nOutcome: a validated Compute Engine mini-runbook",
      
      explanation: "Demonstrates VM Instances, Machine Types, Persistent Disks.",
      conceptIds: ["gcp-vm-instances","gcp-machine-types","gcp-persistent-disks","gcp-instance-templates"],
    }),
  ],
  commonMistakes: [
    mistake(
      "gcp-compute-engine-mistake-1",
      "Misapplying VM Instances",
      "Skipping hands-on checks in Compute Engine",
      "Practice VM Instances with a tiny example first.",
      ["gcp-vm-instances"],
    ),
    mistake(
      "gcp-compute-engine-mistake-2",
      "Pulling unrelated-domain demos into Compute Engine",
      "Defaulting to out-of-domain snippets",
      "Stay inside Compute Engine concepts.",
      ["gcp-machine-types"],
    ),
  ],
  exercises: [
    exercise({
      id: "gcp-compute-engine-exercise",
      title: "Compute Engine mini exercise",
      instructions: ["Build a small example covering VM Instances.","Extend it with Machine Types.","Verify behavior related to Persistent Disks."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Compute Engine.",
      conceptIds: ["gcp-vm-instances","gcp-machine-types","gcp-persistent-disks"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("gcp-compute-engine", ["gcp-vm-instances","gcp-machine-types","gcp-persistent-disks","gcp-instance-templates","gcp-managed-instance-groups"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const gcp_gke_introTopic = topic({
  id: "gcp-gke-intro",
  title: "GKE Intro",
  aliases: ["gke","google kubernetes"],
  description: "Understand GKE clusters, node pools, and workload deployment basics.",
  learningOrder: 3,
  prerequisiteIds: ["gcp-compute-engine"],
  relatedTopicIds: ["gcp-cloud-storage"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "gcp-clusters",
      title: "Clusters",
      description: "Clusters applied in this topic.",
    }),
    concept({
      id: "gcp-node-pools",
      title: "Node Pools",
      description: "Node Pools applied in this topic.",
    }),
    concept({
      id: "gcp-workloads",
      title: "Workloads",
      description: "Workloads applied in this topic.",
    }),
    concept({
      id: "gcp-services",
      title: "Services",
      description: "Services applied in this topic.",
    }),
    concept({
      id: "gcp-kubectl-context",
      title: "kubectl Context",
      description: "kubectl Context applied in this topic.",
    }),
    concept({
      id: "gcp-autopilot-vs-standard-intro",
      title: "Autopilot vs Standard Intro",
      description: "Autopilot vs Standard Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Clusters correctly","Explain Node Pools in context"],
  practicalArtifacts: [
    artifact({
      id: "gcp-gke-intro-artifact",
      type: "workflow",
      title: "GKE Intro worked example",
      
      content: "Step 1: Identify the Clusters requirement\nStep 2: Apply Node Pools in a small scenario\nStep 3: Verify Workloads with an expected check\nOutcome: a validated GKE Intro mini-runbook",
      
      explanation: "Demonstrates Clusters, Node Pools, Workloads.",
      conceptIds: ["gcp-clusters","gcp-node-pools","gcp-workloads","gcp-services"],
    }),
  ],
  commonMistakes: [
    mistake(
      "gcp-gke-intro-mistake-1",
      "Misapplying Clusters",
      "Skipping hands-on checks in GKE Intro",
      "Practice Clusters with a tiny example first.",
      ["gcp-clusters"],
    ),
    mistake(
      "gcp-gke-intro-mistake-2",
      "Pulling unrelated-domain demos into GKE Intro",
      "Defaulting to out-of-domain snippets",
      "Stay inside GKE Intro concepts.",
      ["gcp-node-pools"],
    ),
  ],
  exercises: [
    exercise({
      id: "gcp-gke-intro-exercise",
      title: "GKE Intro mini exercise",
      instructions: ["Build a small example covering Clusters.","Extend it with Node Pools.","Verify behavior related to Workloads."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for GKE Intro.",
      conceptIds: ["gcp-clusters","gcp-node-pools","gcp-workloads"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("gcp-gke-intro", ["gcp-clusters","gcp-node-pools","gcp-workloads","gcp-services","gcp-kubectl-context"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const gcp_cloud_storageTopic = topic({
  id: "gcp-cloud-storage",
  title: "Cloud Storage",
  aliases: ["gcs","cloud storage"],
  description: "Store objects with buckets, classes, and IAM/ACLs carefully.",
  learningOrder: 4,
  prerequisiteIds: ["gcp-gke-intro"],
  relatedTopicIds: ["gcp-networking"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "gcp-buckets",
      title: "Buckets",
      description: "Buckets applied in this topic.",
    }),
    concept({
      id: "gcp-storage-classes",
      title: "Storage Classes",
      description: "Storage Classes applied in this topic.",
    }),
    concept({
      id: "gcp-object-versioning",
      title: "Object Versioning",
      description: "Object Versioning applied in this topic.",
    }),
    concept({
      id: "gcp-iam-vs-acls",
      title: "IAM vs ACLs",
      description: "IAM vs ACLs applied in this topic.",
    }),
    concept({
      id: "gcp-signed-urls",
      title: "Signed URLs",
      description: "Signed URLs applied in this topic.",
    }),
    concept({
      id: "gcp-lifecycle-rules",
      title: "Lifecycle Rules",
      description: "Lifecycle Rules applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Buckets correctly","Explain Storage Classes in context"],
  practicalArtifacts: [
    artifact({
      id: "gcp-cloud-storage-artifact",
      type: "workflow",
      title: "Cloud Storage worked example",
      
      content: "Step 1: Identify the Buckets requirement\nStep 2: Apply Storage Classes in a small scenario\nStep 3: Verify Object Versioning with an expected check\nOutcome: a validated Cloud Storage mini-runbook",
      
      explanation: "Demonstrates Buckets, Storage Classes, Object Versioning.",
      conceptIds: ["gcp-buckets","gcp-storage-classes","gcp-object-versioning","gcp-iam-vs-acls"],
    }),
  ],
  commonMistakes: [
    mistake(
      "gcp-cloud-storage-mistake-1",
      "Misapplying Buckets",
      "Skipping hands-on checks in Cloud Storage",
      "Practice Buckets with a tiny example first.",
      ["gcp-buckets"],
    ),
    mistake(
      "gcp-cloud-storage-mistake-2",
      "Pulling unrelated-domain demos into Cloud Storage",
      "Defaulting to out-of-domain snippets",
      "Stay inside Cloud Storage concepts.",
      ["gcp-storage-classes"],
    ),
  ],
  exercises: [
    exercise({
      id: "gcp-cloud-storage-exercise",
      title: "Cloud Storage mini exercise",
      instructions: ["Build a small example covering Buckets.","Extend it with Storage Classes.","Verify behavior related to Object Versioning."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Cloud Storage.",
      conceptIds: ["gcp-buckets","gcp-storage-classes","gcp-object-versioning"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("gcp-cloud-storage", ["gcp-buckets","gcp-storage-classes","gcp-object-versioning","gcp-iam-vs-acls","gcp-signed-urls"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const gcp_networkingTopic = topic({
  id: "gcp-networking",
  title: "VPC Networking on GCP",
  aliases: ["gcp vpc","firewall rules"],
  description: "Connect resources with VPC, subnets, firewall rules, and Cloud NAT.",
  learningOrder: 5,
  prerequisiteIds: ["gcp-cloud-storage"],
  relatedTopicIds: ["gcp-operations"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "gcp-vpc-networks",
      title: "VPC Networks",
      description: "VPC Networks applied in this topic.",
    }),
    concept({
      id: "gcp-subnets",
      title: "Subnets",
      description: "Subnets applied in this topic.",
    }),
    concept({
      id: "gcp-firewall-rules",
      title: "Firewall Rules",
      description: "Firewall Rules applied in this topic.",
    }),
    concept({
      id: "gcp-cloud-nat",
      title: "Cloud NAT",
      description: "Cloud NAT applied in this topic.",
    }),
    concept({
      id: "gcp-cloud-load-balancing-intro",
      title: "Cloud Load Balancing Intro",
      description: "Cloud Load Balancing Intro applied in this topic.",
    }),
    concept({
      id: "gcp-private-google-access",
      title: "Private Google Access",
      description: "Private Google Access applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply VPC Networks correctly","Explain Subnets in context"],
  practicalArtifacts: [
    artifact({
      id: "gcp-networking-artifact",
      type: "workflow",
      title: "VPC Networking on GCP worked example",
      
      content: "Step 1: Identify the VPC Networks requirement\nStep 2: Apply Subnets in a small scenario\nStep 3: Verify Firewall Rules with an expected check\nOutcome: a validated VPC Networking on GCP mini-runbook",
      
      explanation: "Demonstrates VPC Networks, Subnets, Firewall Rules.",
      conceptIds: ["gcp-vpc-networks","gcp-subnets","gcp-firewall-rules","gcp-cloud-nat"],
    }),
  ],
  commonMistakes: [
    mistake(
      "gcp-networking-mistake-1",
      "Misapplying VPC Networks",
      "Skipping hands-on checks in VPC Networking on GCP",
      "Practice VPC Networks with a tiny example first.",
      ["gcp-vpc-networks"],
    ),
    mistake(
      "gcp-networking-mistake-2",
      "Pulling unrelated-domain demos into VPC Networking on GCP",
      "Defaulting to out-of-domain snippets",
      "Stay inside VPC Networking on GCP concepts.",
      ["gcp-subnets"],
    ),
  ],
  exercises: [
    exercise({
      id: "gcp-networking-exercise",
      title: "VPC Networking on GCP mini exercise",
      instructions: ["Build a small example covering VPC Networks.","Extend it with Subnets.","Verify behavior related to Firewall Rules."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for VPC Networking on GCP.",
      conceptIds: ["gcp-vpc-networks","gcp-subnets","gcp-firewall-rules"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("gcp-networking", ["gcp-vpc-networks","gcp-subnets","gcp-firewall-rules","gcp-cloud-nat","gcp-cloud-load-balancing-intro"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const gcp_operationsTopic = topic({
  id: "gcp-operations",
  title: "Operations and Observability",
  aliases: ["cloud monitoring","cloud logging"],
  description: "Monitor and troubleshoot with Cloud Monitoring/Logging.",
  learningOrder: 6,
  prerequisiteIds: ["gcp-networking"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "gcp-cloud-monitoring",
      title: "Cloud Monitoring",
      description: "Cloud Monitoring applied in this topic.",
    }),
    concept({
      id: "gcp-cloud-logging",
      title: "Cloud Logging",
      description: "Cloud Logging applied in this topic.",
    }),
    concept({
      id: "gcp-alerting-policies",
      title: "Alerting Policies",
      description: "Alerting Policies applied in this topic.",
    }),
    concept({
      id: "gcp-trace-intro",
      title: "Trace Intro",
      description: "Trace Intro applied in this topic.",
    }),
    concept({
      id: "gcp-error-reporting",
      title: "Error Reporting",
      description: "Error Reporting applied in this topic.",
    }),
    concept({
      id: "gcp-dashboards",
      title: "Dashboards",
      description: "Dashboards applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Cloud Monitoring correctly","Explain Cloud Logging in context"],
  practicalArtifacts: [
    artifact({
      id: "gcp-operations-artifact",
      type: "workflow",
      title: "Operations and Observability worked example",
      
      content: "Step 1: Identify the Cloud Monitoring requirement\nStep 2: Apply Cloud Logging in a small scenario\nStep 3: Verify Alerting Policies with an expected check\nOutcome: a validated Operations and Observability mini-runbook",
      
      explanation: "Demonstrates Cloud Monitoring, Cloud Logging, Alerting Policies.",
      conceptIds: ["gcp-cloud-monitoring","gcp-cloud-logging","gcp-alerting-policies","gcp-trace-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "gcp-operations-mistake-1",
      "Misapplying Cloud Monitoring",
      "Skipping hands-on checks in Operations and Observability",
      "Practice Cloud Monitoring with a tiny example first.",
      ["gcp-cloud-monitoring"],
    ),
    mistake(
      "gcp-operations-mistake-2",
      "Pulling unrelated-domain demos into Operations and Observability",
      "Defaulting to out-of-domain snippets",
      "Stay inside Operations and Observability concepts.",
      ["gcp-cloud-logging"],
    ),
  ],
  exercises: [
    exercise({
      id: "gcp-operations-exercise",
      title: "Operations and Observability mini exercise",
      instructions: ["Build a small example covering Cloud Monitoring.","Extend it with Cloud Logging.","Verify behavior related to Alerting Policies."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Operations and Observability.",
      conceptIds: ["gcp-cloud-monitoring","gcp-cloud-logging","gcp-alerting-policies"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("gcp-operations", ["gcp-cloud-monitoring","gcp-cloud-logging","gcp-alerting-policies","gcp-trace-intro","gcp-error-reporting"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

export const gcpKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-gcp",
  title: "Google Cloud Platform",
  aliases: ["gcp","google cloud","learn gcp","google cloud platform","gcp cloud"],
  category: "Cloud",
  description: "GCP starter covering projects/IAM, Compute Engine, GKE intro, Cloud Storage, networking, and operations tooling.",
  topics: [gcp_projects_and_iamTopic, gcp_compute_engineTopic, gcp_gke_introTopic, gcp_cloud_storageTopic, gcp_networkingTopic, gcp_operationsTopic],
});
