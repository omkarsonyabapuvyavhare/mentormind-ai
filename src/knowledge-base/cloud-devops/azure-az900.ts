import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["react hooks","jsx","python class","kubernetes pod"];

const az900_cloud_conceptsTopic = topic({
  id: "az900-cloud-concepts",
  title: "Cloud Concepts",
  aliases: ["cloud concepts","iaas paas saas","Cloud Concepts"],
  description: "Explain cloud models, shared responsibility, and consumption benefits.",
  learningOrder: 1,
  
  relatedTopicIds: ["az900-core-services"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az900-iaas-paas-saas",
      title: "IaaS/PaaS/SaaS",
      description: "IaaS/PaaS/SaaS applied in this topic.",
    }),
    concept({
      id: "az900-public-private-hybrid",
      title: "Public/Private/Hybrid",
      description: "Public/Private/Hybrid applied in this topic.",
    }),
    concept({
      id: "az900-shared-responsibility",
      title: "Shared Responsibility",
      description: "Shared Responsibility applied in this topic.",
    }),
    concept({
      id: "az900-high-availability",
      title: "High Availability",
      description: "High Availability applied in this topic.",
    }),
    concept({
      id: "az900-scalability",
      title: "Scalability",
      description: "Scalability applied in this topic.",
    }),
    concept({
      id: "az900-capex-vs-opex",
      title: "CapEx vs OpEx",
      description: "CapEx vs OpEx applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply IaaS/PaaS/SaaS correctly","Explain Public/Private/Hybrid in context"],
  practicalArtifacts: [
    artifact({
      id: "az900-cloud-concepts-artifact",
      type: "workflow",
      title: "Cloud Concepts worked example",
      
      content: "Step 1: Identify the IaaS/PaaS/SaaS requirement\nStep 2: Apply Public/Private/Hybrid in a small scenario\nStep 3: Verify Shared Responsibility with an expected check\nOutcome: a validated Cloud Concepts mini-runbook",
      
      explanation: "Demonstrates IaaS/PaaS/SaaS, Public/Private/Hybrid, Shared Responsibility.",
      conceptIds: ["az900-iaas-paas-saas","az900-public-private-hybrid","az900-shared-responsibility","az900-high-availability"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az900-cloud-concepts-mistake-1",
      "Misapplying IaaS/PaaS/SaaS",
      "Skipping hands-on checks in Cloud Concepts",
      "Practice IaaS/PaaS/SaaS with a tiny example first.",
      ["az900-iaas-paas-saas"],
    ),
    mistake(
      "az900-cloud-concepts-mistake-2",
      "Pulling unrelated-domain demos into Cloud Concepts",
      "Defaulting to out-of-domain snippets",
      "Stay inside Cloud Concepts concepts.",
      ["az900-public-private-hybrid"],
    ),
  ],
  exercises: [
    exercise({
      id: "az900-cloud-concepts-exercise",
      title: "Cloud Concepts mini exercise",
      instructions: ["Build a small example covering IaaS/PaaS/SaaS.","Extend it with Public/Private/Hybrid.","Verify behavior related to Shared Responsibility."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Cloud Concepts.",
      conceptIds: ["az900-iaas-paas-saas","az900-public-private-hybrid","az900-shared-responsibility"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("az900-cloud-concepts", ["az900-iaas-paas-saas","az900-public-private-hybrid","az900-shared-responsibility","az900-high-availability","az900-scalability"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const az900_core_servicesTopic = topic({
  id: "az900-core-services",
  title: "Core Azure Services",
  aliases: ["azure services","blob storage"],
  description: "Identify compute, networking, storage, and database building blocks.",
  learningOrder: 2,
  prerequisiteIds: ["az900-cloud-concepts"],
  relatedTopicIds: ["az900-identity-and-security"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az900-azure-vms",
      title: "Azure VMs",
      description: "Azure VMs applied in this topic.",
    }),
    concept({
      id: "az900-app-service",
      title: "App Service",
      description: "App Service applied in this topic.",
    }),
    concept({
      id: "az900-virtual-network",
      title: "Virtual Network",
      description: "Virtual Network applied in this topic.",
    }),
    concept({
      id: "az900-blob-storage",
      title: "Blob Storage",
      description: "Blob Storage applied in this topic.",
    }),
    concept({
      id: "az900-azure-sql",
      title: "Azure SQL",
      description: "Azure SQL applied in this topic.",
    }),
    concept({
      id: "az900-regions-and-azs",
      title: "Regions and AZs",
      description: "Regions and AZs applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Azure VMs correctly","Explain App Service in context"],
  practicalArtifacts: [
    artifact({
      id: "az900-core-services-artifact",
      type: "configuration",
      title: "Resource group + storage sketch",
      
      content: "Resource Group: rg-learn\nStorage Account: stlearn001 (hot tier)\nContainer: datasets\nVM: optional jump box in same region",
      expectedOutput: "Grouped resources in one region/RG",
      explanation: "AZ-900 style core resource grouping.",
      conceptIds: ["az900-azure-vms","az900-app-service","az900-virtual-network","az900-blob-storage"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az900-core-services-mistake-1",
      "Misapplying Azure VMs",
      "Skipping hands-on checks in Core Azure Services",
      "Practice Azure VMs with a tiny example first.",
      ["az900-azure-vms"],
    ),
    mistake(
      "az900-core-services-mistake-2",
      "Pulling unrelated-domain demos into Core Azure Services",
      "Defaulting to out-of-domain snippets",
      "Stay inside Core Azure Services concepts.",
      ["az900-app-service"],
    ),
  ],
  exercises: [
    exercise({
      id: "az900-core-services-exercise",
      title: "Core Azure Services mini exercise",
      instructions: ["Build a small example covering Azure VMs.","Extend it with App Service.","Verify behavior related to Virtual Network."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Core Azure Services.",
      conceptIds: ["az900-azure-vms","az900-app-service","az900-virtual-network"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("az900-core-services", ["az900-azure-vms","az900-app-service","az900-virtual-network","az900-blob-storage","az900-azure-sql"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const az900_identity_and_securityTopic = topic({
  id: "az900-identity-and-security",
  title: "Identity and Security",
  aliases: ["entra id","azure security"],
  description: "Use Entra ID, MFA, and defense-in-depth security controls.",
  learningOrder: 3,
  prerequisiteIds: ["az900-core-services"],
  relatedTopicIds: ["az900-governance"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az900-microsoft-entra-id",
      title: "Microsoft Entra ID",
      description: "Microsoft Entra ID applied in this topic.",
    }),
    concept({
      id: "az900-mfa",
      title: "MFA",
      description: "MFA applied in this topic.",
    }),
    concept({
      id: "az900-conditional-access-intro",
      title: "Conditional Access Intro",
      description: "Conditional Access Intro applied in this topic.",
    }),
    concept({
      id: "az900-defense-in-depth",
      title: "Defense in Depth",
      description: "Defense in Depth applied in this topic.",
    }),
    concept({
      id: "az900-encryption",
      title: "Encryption",
      description: "Encryption applied in this topic.",
    }),
    concept({
      id: "az900-network-security-groups",
      title: "Network Security Groups",
      description: "Network Security Groups applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Microsoft Entra ID correctly","Explain MFA in context"],
  practicalArtifacts: [
    artifact({
      id: "az900-identity-and-security-artifact",
      type: "workflow",
      title: "Identity and Security worked example",
      
      content: "Step 1: Identify the Microsoft Entra ID requirement\nStep 2: Apply MFA in a small scenario\nStep 3: Verify Conditional Access Intro with an expected check\nOutcome: a validated Identity and Security mini-runbook",
      
      explanation: "Demonstrates Microsoft Entra ID, MFA, Conditional Access Intro.",
      conceptIds: ["az900-microsoft-entra-id","az900-mfa","az900-conditional-access-intro","az900-defense-in-depth"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az900-identity-and-security-mistake-1",
      "Misapplying Microsoft Entra ID",
      "Skipping hands-on checks in Identity and Security",
      "Practice Microsoft Entra ID with a tiny example first.",
      ["az900-microsoft-entra-id"],
    ),
    mistake(
      "az900-identity-and-security-mistake-2",
      "Pulling unrelated-domain demos into Identity and Security",
      "Defaulting to out-of-domain snippets",
      "Stay inside Identity and Security concepts.",
      ["az900-mfa"],
    ),
  ],
  exercises: [
    exercise({
      id: "az900-identity-and-security-exercise",
      title: "Identity and Security mini exercise",
      instructions: ["Build a small example covering Microsoft Entra ID.","Extend it with MFA.","Verify behavior related to Conditional Access Intro."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Identity and Security.",
      conceptIds: ["az900-microsoft-entra-id","az900-mfa","az900-conditional-access-intro"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("az900-identity-and-security", ["az900-microsoft-entra-id","az900-mfa","az900-conditional-access-intro","az900-defense-in-depth","az900-encryption"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const az900_governanceTopic = topic({
  id: "az900-governance",
  title: "Governance and Compliance",
  aliases: ["azure policy","governance"],
  description: "Apply management groups, policies, and resource locks.",
  learningOrder: 4,
  prerequisiteIds: ["az900-identity-and-security"],
  relatedTopicIds: ["az900-pricing-and-sla"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az900-management-groups",
      title: "Management Groups",
      description: "Management Groups applied in this topic.",
    }),
    concept({
      id: "az900-subscriptions",
      title: "Subscriptions",
      description: "Subscriptions applied in this topic.",
    }),
    concept({
      id: "az900-azure-policy",
      title: "Azure Policy",
      description: "Azure Policy applied in this topic.",
    }),
    concept({
      id: "az900-resource-locks",
      title: "Resource Locks",
      description: "Resource Locks applied in this topic.",
    }),
    concept({
      id: "az900-tags",
      title: "Tags",
      description: "Tags applied in this topic.",
    }),
    concept({
      id: "az900-blueprints-intro",
      title: "Blueprints Intro",
      description: "Blueprints Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Management Groups correctly","Explain Subscriptions in context"],
  practicalArtifacts: [
    artifact({
      id: "az900-governance-artifact",
      type: "workflow",
      title: "Governance and Compliance worked example",
      
      content: "Step 1: Identify the Management Groups requirement\nStep 2: Apply Subscriptions in a small scenario\nStep 3: Verify Azure Policy with an expected check\nOutcome: a validated Governance and Compliance mini-runbook",
      
      explanation: "Demonstrates Management Groups, Subscriptions, Azure Policy.",
      conceptIds: ["az900-management-groups","az900-subscriptions","az900-azure-policy","az900-resource-locks"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az900-governance-mistake-1",
      "Misapplying Management Groups",
      "Skipping hands-on checks in Governance and Compliance",
      "Practice Management Groups with a tiny example first.",
      ["az900-management-groups"],
    ),
    mistake(
      "az900-governance-mistake-2",
      "Pulling unrelated-domain demos into Governance and Compliance",
      "Defaulting to out-of-domain snippets",
      "Stay inside Governance and Compliance concepts.",
      ["az900-subscriptions"],
    ),
  ],
  exercises: [
    exercise({
      id: "az900-governance-exercise",
      title: "Governance and Compliance mini exercise",
      instructions: ["Build a small example covering Management Groups.","Extend it with Subscriptions.","Verify behavior related to Azure Policy."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Governance and Compliance.",
      conceptIds: ["az900-management-groups","az900-subscriptions","az900-azure-policy"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("az900-governance", ["az900-management-groups","az900-subscriptions","az900-azure-policy","az900-resource-locks","az900-tags"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const az900_pricing_and_slaTopic = topic({
  id: "az900-pricing-and-sla",
  title: "Pricing and SLAs",
  aliases: ["azure pricing","sla"],
  description: "Estimate cost factors and interpret service-level agreements.",
  learningOrder: 5,
  prerequisiteIds: ["az900-governance"],
  relatedTopicIds: ["az900-management-tools"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az900-pricing-factors",
      title: "Pricing Factors",
      description: "Pricing Factors applied in this topic.",
    }),
    concept({
      id: "az900-pricing-calculator",
      title: "Pricing Calculator",
      description: "Pricing Calculator applied in this topic.",
    }),
    concept({
      id: "az900-tco-calculator",
      title: "TCO Calculator",
      description: "TCO Calculator applied in this topic.",
    }),
    concept({
      id: "az900-sla",
      title: "SLA",
      description: "SLA applied in this topic.",
    }),
    concept({
      id: "az900-service-lifecycle",
      title: "Service Lifecycle",
      description: "Service Lifecycle applied in this topic.",
    }),
    concept({
      id: "az900-budgets-alerts-intro",
      title: "Budgets/Alerts Intro",
      description: "Budgets/Alerts Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Pricing Factors correctly","Explain Pricing Calculator in context"],
  practicalArtifacts: [
    artifact({
      id: "az900-pricing-and-sla-artifact",
      type: "workflow",
      title: "Pricing and SLAs worked example",
      
      content: "Step 1: Identify the Pricing Factors requirement\nStep 2: Apply Pricing Calculator in a small scenario\nStep 3: Verify TCO Calculator with an expected check\nOutcome: a validated Pricing and SLAs mini-runbook",
      
      explanation: "Demonstrates Pricing Factors, Pricing Calculator, TCO Calculator.",
      conceptIds: ["az900-pricing-factors","az900-pricing-calculator","az900-tco-calculator","az900-sla"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az900-pricing-and-sla-mistake-1",
      "Misapplying Pricing Factors",
      "Skipping hands-on checks in Pricing and SLAs",
      "Practice Pricing Factors with a tiny example first.",
      ["az900-pricing-factors"],
    ),
    mistake(
      "az900-pricing-and-sla-mistake-2",
      "Pulling unrelated-domain demos into Pricing and SLAs",
      "Defaulting to out-of-domain snippets",
      "Stay inside Pricing and SLAs concepts.",
      ["az900-pricing-calculator"],
    ),
  ],
  exercises: [
    exercise({
      id: "az900-pricing-and-sla-exercise",
      title: "Pricing and SLAs mini exercise",
      instructions: ["Build a small example covering Pricing Factors.","Extend it with Pricing Calculator.","Verify behavior related to TCO Calculator."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Pricing and SLAs.",
      conceptIds: ["az900-pricing-factors","az900-pricing-calculator","az900-tco-calculator"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("az900-pricing-and-sla", ["az900-pricing-factors","az900-pricing-calculator","az900-tco-calculator","az900-sla","az900-service-lifecycle"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const az900_management_toolsTopic = topic({
  id: "az900-management-tools",
  title: "Management Tools",
  aliases: ["azure cli","arm templates"],
  description: "Operate Azure with Portal, CLI, PowerShell, and Resource Manager.",
  learningOrder: 6,
  prerequisiteIds: ["az900-pricing-and-sla"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az900-azure-portal",
      title: "Azure Portal",
      description: "Azure Portal applied in this topic.",
    }),
    concept({
      id: "az900-azure-cli",
      title: "Azure CLI",
      description: "Azure CLI applied in this topic.",
    }),
    concept({
      id: "az900-azure-powershell",
      title: "Azure PowerShell",
      description: "Azure PowerShell applied in this topic.",
    }),
    concept({
      id: "az900-arm-templates-intro",
      title: "ARM Templates Intro",
      description: "ARM Templates Intro applied in this topic.",
    }),
    concept({
      id: "az900-cloud-shell",
      title: "Cloud Shell",
      description: "Cloud Shell applied in this topic.",
    }),
    concept({
      id: "az900-azure-monitor-intro",
      title: "Azure Monitor Intro",
      description: "Azure Monitor Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Azure Portal correctly","Explain Azure CLI in context"],
  practicalArtifacts: [
    artifact({
      id: "az900-management-tools-artifact",
      type: "workflow",
      title: "Management Tools worked example",
      
      content: "Step 1: Identify the Azure Portal requirement\nStep 2: Apply Azure CLI in a small scenario\nStep 3: Verify Azure PowerShell with an expected check\nOutcome: a validated Management Tools mini-runbook",
      
      explanation: "Demonstrates Azure Portal, Azure CLI, Azure PowerShell.",
      conceptIds: ["az900-azure-portal","az900-azure-cli","az900-azure-powershell","az900-arm-templates-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az900-management-tools-mistake-1",
      "Misapplying Azure Portal",
      "Skipping hands-on checks in Management Tools",
      "Practice Azure Portal with a tiny example first.",
      ["az900-azure-portal"],
    ),
    mistake(
      "az900-management-tools-mistake-2",
      "Pulling unrelated-domain demos into Management Tools",
      "Defaulting to out-of-domain snippets",
      "Stay inside Management Tools concepts.",
      ["az900-azure-cli"],
    ),
  ],
  exercises: [
    exercise({
      id: "az900-management-tools-exercise",
      title: "Management Tools mini exercise",
      instructions: ["Build a small example covering Azure Portal.","Extend it with Azure CLI.","Verify behavior related to Azure PowerShell."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Management Tools.",
      conceptIds: ["az900-azure-portal","az900-azure-cli","az900-azure-powershell"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("az900-management-tools", ["az900-azure-portal","az900-azure-cli","az900-azure-powershell","az900-arm-templates-intro","az900-cloud-shell"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

export const azureAz900KnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-azure-az900",
  title: "Azure AZ-900",
  aliases: ["azure","az-900","az900","azure fundamentals","learn az-900","microsoft azure fundamentals"],
  category: "Cloud",
  description: "Azure AZ-900 curriculum covering cloud concepts, core Azure services, security/identity, governance, pricing, and management tools.",
  topics: [az900_cloud_conceptsTopic, az900_core_servicesTopic, az900_identity_and_securityTopic, az900_governanceTopic, az900_pricing_and_slaTopic, az900_management_toolsTopic],
});
