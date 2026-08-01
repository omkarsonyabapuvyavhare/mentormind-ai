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

const az204_app_serviceTopic = topic({
  id: "az204-app-service",
  title: "App Service Web Apps",
  aliases: ["app service","deployment slots"],
  description: "Deploy and configure web apps on Azure App Service.",
  learningOrder: 1,
  
  relatedTopicIds: ["az204-functions"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az204-app-service-plans",
      title: "App Service Plans",
      description: "App Service Plans applied in this topic.",
    }),
    concept({
      id: "az204-deployment-slots",
      title: "Deployment Slots",
      description: "Deployment Slots applied in this topic.",
    }),
    concept({
      id: "az204-app-settings",
      title: "App Settings",
      description: "App Settings applied in this topic.",
    }),
    concept({
      id: "az204-scaling",
      title: "Scaling",
      description: "Scaling applied in this topic.",
    }),
    concept({
      id: "az204-custom-domains-tls-intro",
      title: "Custom Domains/TLS Intro",
      description: "Custom Domains/TLS Intro applied in this topic.",
    }),
    concept({
      id: "az204-diagnostic-logs",
      title: "Diagnostic Logs",
      description: "Diagnostic Logs applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply App Service Plans correctly","Explain Deployment Slots in context"],
  practicalArtifacts: [
    artifact({
      id: "az204-app-service-artifact",
      type: "workflow",
      title: "App Service Web Apps worked example",
      
      content: "Step 1: Identify the App Service Plans requirement\nStep 2: Apply Deployment Slots in a small scenario\nStep 3: Verify App Settings with an expected check\nOutcome: a validated App Service Web Apps mini-runbook",
      
      explanation: "Demonstrates App Service Plans, Deployment Slots, App Settings.",
      conceptIds: ["az204-app-service-plans","az204-deployment-slots","az204-app-settings","az204-scaling"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az204-app-service-mistake-1",
      "Misapplying App Service Plans",
      "Skipping hands-on checks in App Service Web Apps",
      "Practice App Service Plans with a tiny example first.",
      ["az204-app-service-plans"],
    ),
    mistake(
      "az204-app-service-mistake-2",
      "Pulling unrelated-domain demos into App Service Web Apps",
      "Defaulting to out-of-domain snippets",
      "Stay inside App Service Web Apps concepts.",
      ["az204-deployment-slots"],
    ),
  ],
  exercises: [
    exercise({
      id: "az204-app-service-exercise",
      title: "App Service Web Apps mini exercise",
      instructions: ["Build a small example covering App Service Plans.","Extend it with Deployment Slots.","Verify behavior related to App Settings."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for App Service Web Apps.",
      conceptIds: ["az204-app-service-plans","az204-deployment-slots","az204-app-settings"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("az204-app-service", ["az204-app-service-plans","az204-deployment-slots","az204-app-settings","az204-scaling","az204-custom-domains-tls-intro"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const az204_functionsTopic = topic({
  id: "az204-functions",
  title: "Azure Functions",
  aliases: ["azure functions","bindings"],
  description: "Implement trigger/binding-based serverless functions.",
  learningOrder: 2,
  prerequisiteIds: ["az204-app-service"],
  relatedTopicIds: ["az204-storage-and-sdk"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az204-triggers",
      title: "Triggers",
      description: "Triggers applied in this topic.",
    }),
    concept({
      id: "az204-bindings",
      title: "Bindings",
      description: "Bindings applied in this topic.",
    }),
    concept({
      id: "az204-durable-functions-intro",
      title: "Durable Functions Intro",
      description: "Durable Functions Intro applied in this topic.",
    }),
    concept({
      id: "az204-hosting-plans",
      title: "Hosting Plans",
      description: "Hosting Plans applied in this topic.",
    }),
    concept({
      id: "az204-local-dev",
      title: "Local Dev",
      description: "Local Dev applied in this topic.",
    }),
    concept({
      id: "az204-idempotent-handlers",
      title: "Idempotent Handlers",
      description: "Idempotent Handlers applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Triggers correctly","Explain Bindings in context"],
  practicalArtifacts: [
    artifact({
      id: "az204-functions-artifact",
      type: "workflow",
      title: "Azure Functions worked example",
      
      content: "Step 1: Identify the Triggers requirement\nStep 2: Apply Bindings in a small scenario\nStep 3: Verify Durable Functions Intro with an expected check\nOutcome: a validated Azure Functions mini-runbook",
      
      explanation: "Demonstrates Triggers, Bindings, Durable Functions Intro.",
      conceptIds: ["az204-triggers","az204-bindings","az204-durable-functions-intro","az204-hosting-plans"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az204-functions-mistake-1",
      "Misapplying Triggers",
      "Skipping hands-on checks in Azure Functions",
      "Practice Triggers with a tiny example first.",
      ["az204-triggers"],
    ),
    mistake(
      "az204-functions-mistake-2",
      "Pulling unrelated-domain demos into Azure Functions",
      "Defaulting to out-of-domain snippets",
      "Stay inside Azure Functions concepts.",
      ["az204-bindings"],
    ),
  ],
  exercises: [
    exercise({
      id: "az204-functions-exercise",
      title: "Azure Functions mini exercise",
      instructions: ["Build a small example covering Triggers.","Extend it with Bindings.","Verify behavior related to Durable Functions Intro."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Azure Functions.",
      conceptIds: ["az204-triggers","az204-bindings","az204-durable-functions-intro"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("az204-functions", ["az204-triggers","az204-bindings","az204-durable-functions-intro","az204-hosting-plans","az204-local-dev"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const az204_storage_and_sdkTopic = topic({
  id: "az204-storage-and-sdk",
  title: "Storage and SDK Access",
  aliases: ["azure storage sdk","sas"],
  description: "Use Blob/Queue/Table storage from application code.",
  learningOrder: 3,
  prerequisiteIds: ["az204-functions"],
  relatedTopicIds: ["az204-secure-configuration"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az204-blob-storage-sdk",
      title: "Blob Storage SDK",
      description: "Blob Storage SDK applied in this topic.",
    }),
    concept({
      id: "az204-containers-blobs",
      title: "Containers/Blobs",
      description: "Containers/Blobs applied in this topic.",
    }),
    concept({
      id: "az204-sas-tokens",
      title: "SAS Tokens",
      description: "SAS Tokens applied in this topic.",
    }),
    concept({
      id: "az204-queues",
      title: "Queues",
      description: "Queues applied in this topic.",
    }),
    concept({
      id: "az204-table-storage-intro",
      title: "Table Storage Intro",
      description: "Table Storage Intro applied in this topic.",
    }),
    concept({
      id: "az204-retry-policies",
      title: "Retry Policies",
      description: "Retry Policies applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Blob Storage SDK correctly","Explain Containers/Blobs in context"],
  practicalArtifacts: [
    artifact({
      id: "az204-storage-and-sdk-artifact",
      type: "workflow",
      title: "Storage and SDK Access worked example",
      
      content: "Step 1: Identify the Blob Storage SDK requirement\nStep 2: Apply Containers/Blobs in a small scenario\nStep 3: Verify SAS Tokens with an expected check\nOutcome: a validated Storage and SDK Access mini-runbook",
      
      explanation: "Demonstrates Blob Storage SDK, Containers/Blobs, SAS Tokens.",
      conceptIds: ["az204-blob-storage-sdk","az204-containers-blobs","az204-sas-tokens","az204-queues"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az204-storage-and-sdk-mistake-1",
      "Misapplying Blob Storage SDK",
      "Skipping hands-on checks in Storage and SDK Access",
      "Practice Blob Storage SDK with a tiny example first.",
      ["az204-blob-storage-sdk"],
    ),
    mistake(
      "az204-storage-and-sdk-mistake-2",
      "Pulling unrelated-domain demos into Storage and SDK Access",
      "Defaulting to out-of-domain snippets",
      "Stay inside Storage and SDK Access concepts.",
      ["az204-containers-blobs"],
    ),
  ],
  exercises: [
    exercise({
      id: "az204-storage-and-sdk-exercise",
      title: "Storage and SDK Access mini exercise",
      instructions: ["Build a small example covering Blob Storage SDK.","Extend it with Containers/Blobs.","Verify behavior related to SAS Tokens."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Storage and SDK Access.",
      conceptIds: ["az204-blob-storage-sdk","az204-containers-blobs","az204-sas-tokens"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("az204-storage-and-sdk", ["az204-blob-storage-sdk","az204-containers-blobs","az204-sas-tokens","az204-queues","az204-table-storage-intro"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const az204_secure_configurationTopic = topic({
  id: "az204-secure-configuration",
  title: "Secure App Configuration",
  aliases: ["key vault","managed identity"],
  description: "Store secrets in Key Vault and wire managed identities.",
  learningOrder: 4,
  prerequisiteIds: ["az204-storage-and-sdk"],
  relatedTopicIds: ["az204-messaging"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az204-key-vault-secrets",
      title: "Key Vault Secrets",
      description: "Key Vault Secrets applied in this topic.",
    }),
    concept({
      id: "az204-managed-identity",
      title: "Managed Identity",
      description: "Managed Identity applied in this topic.",
    }),
    concept({
      id: "az204-app-configuration-intro",
      title: "App Configuration Intro",
      description: "App Configuration Intro applied in this topic.",
    }),
    concept({
      id: "az204-rbac-for-apps",
      title: "RBAC for Apps",
      description: "RBAC for Apps applied in this topic.",
    }),
    concept({
      id: "az204-connection-string-hygiene",
      title: "Connection String Hygiene",
      description: "Connection String Hygiene applied in this topic.",
    }),
    concept({
      id: "az204-rotation-basics",
      title: "Rotation Basics",
      description: "Rotation Basics applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Key Vault Secrets correctly","Explain Managed Identity in context"],
  practicalArtifacts: [
    artifact({
      id: "az204-secure-configuration-artifact",
      type: "workflow",
      title: "Secure App Configuration worked example",
      
      content: "Step 1: Identify the Key Vault Secrets requirement\nStep 2: Apply Managed Identity in a small scenario\nStep 3: Verify App Configuration Intro with an expected check\nOutcome: a validated Secure App Configuration mini-runbook",
      
      explanation: "Demonstrates Key Vault Secrets, Managed Identity, App Configuration Intro.",
      conceptIds: ["az204-key-vault-secrets","az204-managed-identity","az204-app-configuration-intro","az204-rbac-for-apps"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az204-secure-configuration-mistake-1",
      "Misapplying Key Vault Secrets",
      "Skipping hands-on checks in Secure App Configuration",
      "Practice Key Vault Secrets with a tiny example first.",
      ["az204-key-vault-secrets"],
    ),
    mistake(
      "az204-secure-configuration-mistake-2",
      "Pulling unrelated-domain demos into Secure App Configuration",
      "Defaulting to out-of-domain snippets",
      "Stay inside Secure App Configuration concepts.",
      ["az204-managed-identity"],
    ),
  ],
  exercises: [
    exercise({
      id: "az204-secure-configuration-exercise",
      title: "Secure App Configuration mini exercise",
      instructions: ["Build a small example covering Key Vault Secrets.","Extend it with Managed Identity.","Verify behavior related to App Configuration Intro."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Secure App Configuration.",
      conceptIds: ["az204-key-vault-secrets","az204-managed-identity","az204-app-configuration-intro"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("az204-secure-configuration", ["az204-key-vault-secrets","az204-managed-identity","az204-app-configuration-intro","az204-rbac-for-apps","az204-connection-string-hygiene"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const az204_messagingTopic = topic({
  id: "az204-messaging",
  title: "Messaging with Service Bus and Event Grid",
  aliases: ["service bus","event grid"],
  description: "Decouple services with queues/topics and event routing.",
  learningOrder: 5,
  prerequisiteIds: ["az204-secure-configuration"],
  relatedTopicIds: ["az204-monitoring"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az204-service-bus-queues",
      title: "Service Bus Queues",
      description: "Service Bus Queues applied in this topic.",
    }),
    concept({
      id: "az204-topics-subscriptions",
      title: "Topics/Subscriptions",
      description: "Topics/Subscriptions applied in this topic.",
    }),
    concept({
      id: "az204-event-grid",
      title: "Event Grid",
      description: "Event Grid applied in this topic.",
    }),
    concept({
      id: "az204-poison-messages",
      title: "Poison Messages",
      description: "Poison Messages applied in this topic.",
    }),
    concept({
      id: "az204-at-least-once-delivery",
      title: "At-least-once Delivery",
      description: "At-least-once Delivery applied in this topic.",
    }),
    concept({
      id: "az204-ordering-caveats",
      title: "Ordering Caveats",
      description: "Ordering Caveats applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Service Bus Queues correctly","Explain Topics/Subscriptions in context"],
  practicalArtifacts: [
    artifact({
      id: "az204-messaging-artifact",
      type: "workflow",
      title: "Messaging with Service Bus and Event Grid worked example",
      
      content: "Step 1: Identify the Service Bus Queues requirement\nStep 2: Apply Topics/Subscriptions in a small scenario\nStep 3: Verify Event Grid with an expected check\nOutcome: a validated Messaging with Service Bus and Event Grid mini-runbook",
      
      explanation: "Demonstrates Service Bus Queues, Topics/Subscriptions, Event Grid.",
      conceptIds: ["az204-service-bus-queues","az204-topics-subscriptions","az204-event-grid","az204-poison-messages"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az204-messaging-mistake-1",
      "Misapplying Service Bus Queues",
      "Skipping hands-on checks in Messaging with Service Bus and Event Grid",
      "Practice Service Bus Queues with a tiny example first.",
      ["az204-service-bus-queues"],
    ),
    mistake(
      "az204-messaging-mistake-2",
      "Pulling unrelated-domain demos into Messaging with Service Bus and Event Grid",
      "Defaulting to out-of-domain snippets",
      "Stay inside Messaging with Service Bus and Event Grid concepts.",
      ["az204-topics-subscriptions"],
    ),
  ],
  exercises: [
    exercise({
      id: "az204-messaging-exercise",
      title: "Messaging with Service Bus and Event Grid mini exercise",
      instructions: ["Build a small example covering Service Bus Queues.","Extend it with Topics/Subscriptions.","Verify behavior related to Event Grid."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Messaging with Service Bus and Event Grid.",
      conceptIds: ["az204-service-bus-queues","az204-topics-subscriptions","az204-event-grid"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("az204-messaging", ["az204-service-bus-queues","az204-topics-subscriptions","az204-event-grid","az204-poison-messages","az204-at-least-once-delivery"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const az204_monitoringTopic = topic({
  id: "az204-monitoring",
  title: "Monitoring and Troubleshooting",
  aliases: ["application insights","monitoring"],
  description: "Instrument apps with Application Insights and Log Analytics basics.",
  learningOrder: 6,
  prerequisiteIds: ["az204-messaging"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "az204-application-insights",
      title: "Application Insights",
      description: "Application Insights applied in this topic.",
    }),
    concept({
      id: "az204-correlation-ids",
      title: "Correlation IDs",
      description: "Correlation IDs applied in this topic.",
    }),
    concept({
      id: "az204-dependency-tracking",
      title: "Dependency Tracking",
      description: "Dependency Tracking applied in this topic.",
    }),
    concept({
      id: "az204-availability-tests-intro",
      title: "Availability Tests Intro",
      description: "Availability Tests Intro applied in this topic.",
    }),
    concept({
      id: "az204-log-analytics-queries-intro",
      title: "Log Analytics Queries Intro",
      description: "Log Analytics Queries Intro applied in this topic.",
    }),
    concept({
      id: "az204-alert-rules",
      title: "Alert Rules",
      description: "Alert Rules applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Application Insights correctly","Explain Correlation IDs in context"],
  practicalArtifacts: [
    artifact({
      id: "az204-monitoring-artifact",
      type: "workflow",
      title: "Monitoring and Troubleshooting worked example",
      
      content: "Step 1: Identify the Application Insights requirement\nStep 2: Apply Correlation IDs in a small scenario\nStep 3: Verify Dependency Tracking with an expected check\nOutcome: a validated Monitoring and Troubleshooting mini-runbook",
      
      explanation: "Demonstrates Application Insights, Correlation IDs, Dependency Tracking.",
      conceptIds: ["az204-application-insights","az204-correlation-ids","az204-dependency-tracking","az204-availability-tests-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "az204-monitoring-mistake-1",
      "Misapplying Application Insights",
      "Skipping hands-on checks in Monitoring and Troubleshooting",
      "Practice Application Insights with a tiny example first.",
      ["az204-application-insights"],
    ),
    mistake(
      "az204-monitoring-mistake-2",
      "Pulling unrelated-domain demos into Monitoring and Troubleshooting",
      "Defaulting to out-of-domain snippets",
      "Stay inside Monitoring and Troubleshooting concepts.",
      ["az204-correlation-ids"],
    ),
  ],
  exercises: [
    exercise({
      id: "az204-monitoring-exercise",
      title: "Monitoring and Troubleshooting mini exercise",
      instructions: ["Build a small example covering Application Insights.","Extend it with Correlation IDs.","Verify behavior related to Dependency Tracking."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Monitoring and Troubleshooting.",
      conceptIds: ["az204-application-insights","az204-correlation-ids","az204-dependency-tracking"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("az204-monitoring", ["az204-application-insights","az204-correlation-ids","az204-dependency-tracking","az204-availability-tests-intro","az204-log-analytics-queries-intro"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

export const azureAz204KnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-azure-az204",
  title: "Azure AZ-204",
  aliases: ["az-204","az204","azure developer","azure developer associate","learn az-204"],
  category: "Cloud",
  description: "Azure AZ-204 starter covering App Service, Functions, storage/SDK access, Key Vault, messaging, and monitoring for developers.",
  topics: [az204_app_serviceTopic, az204_functionsTopic, az204_storage_and_sdkTopic, az204_secure_configurationTopic, az204_messagingTopic, az204_monitoringTopic],
});
