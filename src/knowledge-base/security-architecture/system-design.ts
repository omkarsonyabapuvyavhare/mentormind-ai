import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["react hooks","jsx","python class"];

const sd_requirements_and_constraintsTopic = topic({
  id: "sd-requirements-and-constraints",
  title: "Requirements and Constraints",
  aliases: ["nfr","system requirements"],
  description: "Clarify functional/non-functional requirements and hard constraints.",
  learningOrder: 1,
  
  relatedTopicIds: ["sd-capacity-and-back-of-envelope"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "sd-functional-requirements",
      title: "Functional Requirements",
      description: "Functional Requirements applied in this topic.",
    }),
    concept({
      id: "sd-non-functional-requirements",
      title: "Non-Functional Requirements",
      description: "Non-Functional Requirements applied in this topic.",
    }),
    concept({
      id: "sd-slas-slos",
      title: "SLAs/SLOs",
      description: "SLAs/SLOs applied in this topic.",
    }),
    concept({
      id: "sd-consistency-needs",
      title: "Consistency Needs",
      description: "Consistency Needs applied in this topic.",
    }),
    concept({
      id: "sd-latency-budgets",
      title: "Latency Budgets",
      description: "Latency Budgets applied in this topic.",
    }),
    concept({
      id: "sd-cost-constraints",
      title: "Cost Constraints",
      description: "Cost Constraints applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Functional Requirements correctly","Explain Non-Functional Requirements in context"],
  practicalArtifacts: [
    artifact({
      id: "sd-requirements-and-constraints-artifact",
      type: "workflow",
      title: "Requirements and Constraints worked example",
      
      content: "Step 1: Identify the Functional Requirements requirement\nStep 2: Apply Non-Functional Requirements in a small scenario\nStep 3: Verify SLAs/SLOs with an expected check\nOutcome: a validated Requirements and Constraints mini-runbook",
      
      explanation: "Demonstrates Functional Requirements, Non-Functional Requirements, SLAs/SLOs.",
      conceptIds: ["sd-functional-requirements","sd-non-functional-requirements","sd-slas-slos","sd-consistency-needs"],
    }),
  ],
  commonMistakes: [
    mistake(
      "sd-requirements-and-constraints-mistake-1",
      "Misapplying Functional Requirements",
      "Skipping hands-on checks in Requirements and Constraints",
      "Practice Functional Requirements with a tiny example first.",
      ["sd-functional-requirements"],
    ),
    mistake(
      "sd-requirements-and-constraints-mistake-2",
      "Pulling unrelated-domain demos into Requirements and Constraints",
      "Defaulting to out-of-domain snippets",
      "Stay inside Requirements and Constraints concepts.",
      ["sd-non-functional-requirements"],
    ),
  ],
  exercises: [
    exercise({
      id: "sd-requirements-and-constraints-exercise",
      title: "Requirements and Constraints mini exercise",
      instructions: ["Build a small example covering Functional Requirements.","Extend it with Non-Functional Requirements.","Verify behavior related to SLAs/SLOs."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Requirements and Constraints.",
      conceptIds: ["sd-functional-requirements","sd-non-functional-requirements","sd-slas-slos"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("sd-requirements-and-constraints", ["sd-functional-requirements","sd-non-functional-requirements","sd-slas-slos","sd-consistency-needs","sd-latency-budgets"],
    ["concept-understanding","architecture-reasoning","practical-scenario","configuration-analysis","debugging"]),
});

const sd_capacity_and_back_of_envelopeTopic = topic({
  id: "sd-capacity-and-back-of-envelope",
  title: "Capacity and Back-of-Envelope Estimates",
  aliases: ["back of envelope","capacity planning"],
  description: "Estimate QPS, storage, and bandwidth to size components.",
  learningOrder: 2,
  prerequisiteIds: ["sd-requirements-and-constraints"],
  relatedTopicIds: ["sd-data-modeling-and-storage"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "sd-qps-estimation",
      title: "QPS Estimation",
      description: "QPS Estimation applied in this topic.",
    }),
    concept({
      id: "sd-storage-estimation",
      title: "Storage Estimation",
      description: "Storage Estimation applied in this topic.",
    }),
    concept({
      id: "sd-bandwidth",
      title: "Bandwidth",
      description: "Bandwidth applied in this topic.",
    }),
    concept({
      id: "sd-peak-vs-average",
      title: "Peak vs Average",
      description: "Peak vs Average applied in this topic.",
    }),
    concept({
      id: "sd-growth-assumptions",
      title: "Growth Assumptions",
      description: "Growth Assumptions applied in this topic.",
    }),
    concept({
      id: "sd-unit-conversions",
      title: "Unit Conversions",
      description: "Unit Conversions applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply QPS Estimation correctly","Explain Storage Estimation in context"],
  practicalArtifacts: [
    artifact({
      id: "sd-capacity-and-back-of-envelope-artifact",
      type: "calculation",
      title: "Daily write volume",
      
      content: "10M users * 2 writes/day = 20M writes/day\n≈ 231 writes/sec average (ignore peaks)",
      expectedOutput: "~231 average writes/sec before peak factor",
      explanation: "Simple capacity sketch.",
      conceptIds: ["sd-qps-estimation","sd-storage-estimation","sd-bandwidth","sd-peak-vs-average"],
    }),
  ],
  commonMistakes: [
    mistake(
      "sd-capacity-and-back-of-envelope-mistake-1",
      "Misapplying QPS Estimation",
      "Skipping hands-on checks in Capacity and Back-of-Envelope Estimates",
      "Practice QPS Estimation with a tiny example first.",
      ["sd-qps-estimation"],
    ),
    mistake(
      "sd-capacity-and-back-of-envelope-mistake-2",
      "Pulling unrelated-domain demos into Capacity and Back-of-Envelope Estimates",
      "Defaulting to out-of-domain snippets",
      "Stay inside Capacity and Back-of-Envelope Estimates concepts.",
      ["sd-storage-estimation"],
    ),
  ],
  exercises: [
    exercise({
      id: "sd-capacity-and-back-of-envelope-exercise",
      title: "Capacity and Back-of-Envelope Estimates mini exercise",
      instructions: ["Build a small example covering QPS Estimation.","Extend it with Storage Estimation.","Verify behavior related to Bandwidth."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Capacity and Back-of-Envelope Estimates.",
      conceptIds: ["sd-qps-estimation","sd-storage-estimation","sd-bandwidth"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sd-capacity-and-back-of-envelope", ["sd-qps-estimation","sd-storage-estimation","sd-bandwidth","sd-peak-vs-average","sd-growth-assumptions"],
    ["concept-understanding","architecture-reasoning","practical-scenario","configuration-analysis","debugging"]),
});

const sd_data_modeling_and_storageTopic = topic({
  id: "sd-data-modeling-and-storage",
  title: "Data Modeling and Storage Choices",
  aliases: ["storage choices","sharding"],
  description: "Choose SQL/NoSQL/blob patterns based on access patterns.",
  learningOrder: 3,
  prerequisiteIds: ["sd-capacity-and-back-of-envelope"],
  relatedTopicIds: ["sd-caching"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "sd-access-patterns-first",
      title: "Access Patterns First",
      description: "Access Patterns First applied in this topic.",
    }),
    concept({
      id: "sd-relational-fits",
      title: "Relational Fits",
      description: "Relational Fits applied in this topic.",
    }),
    concept({
      id: "sd-document-key-value-fits",
      title: "Document/Key-Value Fits",
      description: "Document/Key-Value Fits applied in this topic.",
    }),
    concept({
      id: "sd-blob-object-storage",
      title: "Blob/Object Storage",
      description: "Blob/Object Storage applied in this topic.",
    }),
    concept({
      id: "sd-indexing-strategy",
      title: "Indexing Strategy",
      description: "Indexing Strategy applied in this topic.",
    }),
    concept({
      id: "sd-sharding-intro",
      title: "Sharding Intro",
      description: "Sharding Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Access Patterns First correctly","Explain Relational Fits in context"],
  practicalArtifacts: [
    artifact({
      id: "sd-data-modeling-and-storage-artifact",
      type: "workflow",
      title: "Data Modeling and Storage Choices worked example",
      
      content: "Step 1: Identify the Access Patterns First requirement\nStep 2: Apply Relational Fits in a small scenario\nStep 3: Verify Document/Key-Value Fits with an expected check\nOutcome: a validated Data Modeling and Storage Choices mini-runbook",
      
      explanation: "Demonstrates Access Patterns First, Relational Fits, Document/Key-Value Fits.",
      conceptIds: ["sd-access-patterns-first","sd-relational-fits","sd-document-key-value-fits","sd-blob-object-storage"],
    }),
  ],
  commonMistakes: [
    mistake(
      "sd-data-modeling-and-storage-mistake-1",
      "Misapplying Access Patterns First",
      "Skipping hands-on checks in Data Modeling and Storage Choices",
      "Practice Access Patterns First with a tiny example first.",
      ["sd-access-patterns-first"],
    ),
    mistake(
      "sd-data-modeling-and-storage-mistake-2",
      "Pulling unrelated-domain demos into Data Modeling and Storage Choices",
      "Defaulting to out-of-domain snippets",
      "Stay inside Data Modeling and Storage Choices concepts.",
      ["sd-relational-fits"],
    ),
  ],
  exercises: [
    exercise({
      id: "sd-data-modeling-and-storage-exercise",
      title: "Data Modeling and Storage Choices mini exercise",
      instructions: ["Build a small example covering Access Patterns First.","Extend it with Relational Fits.","Verify behavior related to Document/Key-Value Fits."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Data Modeling and Storage Choices.",
      conceptIds: ["sd-access-patterns-first","sd-relational-fits","sd-document-key-value-fits"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sd-data-modeling-and-storage", ["sd-access-patterns-first","sd-relational-fits","sd-document-key-value-fits","sd-blob-object-storage","sd-indexing-strategy"],
    ["concept-understanding","architecture-reasoning","practical-scenario","configuration-analysis","debugging"]),
});

const sd_cachingTopic = topic({
  id: "sd-caching",
  title: "Caching Strategies",
  aliases: ["caching","cache-aside"],
  description: "Reduce load with cache placement, TTLs, and invalidation tactics.",
  learningOrder: 4,
  prerequisiteIds: ["sd-data-modeling-and-storage"],
  relatedTopicIds: ["sd-messaging-and-async"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "sd-cache-placement",
      title: "Cache Placement",
      description: "Cache Placement applied in this topic.",
    }),
    concept({
      id: "sd-cache-aside",
      title: "Cache-Aside",
      description: "Cache-Aside applied in this topic.",
    }),
    concept({
      id: "sd-ttl",
      title: "TTL",
      description: "TTL applied in this topic.",
    }),
    concept({
      id: "sd-invalidation",
      title: "Invalidation",
      description: "Invalidation applied in this topic.",
    }),
    concept({
      id: "sd-stampede-control",
      title: "Stampede Control",
      description: "Stampede Control applied in this topic.",
    }),
    concept({
      id: "sd-hot-key-handling",
      title: "Hot Key Handling",
      description: "Hot Key Handling applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Cache Placement correctly","Explain Cache-Aside in context"],
  practicalArtifacts: [
    artifact({
      id: "sd-caching-artifact",
      type: "workflow",
      title: "Caching Strategies worked example",
      
      content: "Step 1: Identify the Cache Placement requirement\nStep 2: Apply Cache-Aside in a small scenario\nStep 3: Verify TTL with an expected check\nOutcome: a validated Caching Strategies mini-runbook",
      
      explanation: "Demonstrates Cache Placement, Cache-Aside, TTL.",
      conceptIds: ["sd-cache-placement","sd-cache-aside","sd-ttl","sd-invalidation"],
    }),
  ],
  commonMistakes: [
    mistake(
      "sd-caching-mistake-1",
      "Misapplying Cache Placement",
      "Skipping hands-on checks in Caching Strategies",
      "Practice Cache Placement with a tiny example first.",
      ["sd-cache-placement"],
    ),
    mistake(
      "sd-caching-mistake-2",
      "Pulling unrelated-domain demos into Caching Strategies",
      "Defaulting to out-of-domain snippets",
      "Stay inside Caching Strategies concepts.",
      ["sd-cache-aside"],
    ),
  ],
  exercises: [
    exercise({
      id: "sd-caching-exercise",
      title: "Caching Strategies mini exercise",
      instructions: ["Build a small example covering Cache Placement.","Extend it with Cache-Aside.","Verify behavior related to TTL."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Caching Strategies.",
      conceptIds: ["sd-cache-placement","sd-cache-aside","sd-ttl"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sd-caching", ["sd-cache-placement","sd-cache-aside","sd-ttl","sd-invalidation","sd-stampede-control"],
    ["concept-understanding","architecture-reasoning","practical-scenario","configuration-analysis","debugging"]),
});

const sd_messaging_and_asyncTopic = topic({
  id: "sd-messaging-and-async",
  title: "Messaging and Asynchronous Processing",
  aliases: ["message queues","pubsub"],
  description: "Decouple services with queues/streams and async workflows.",
  learningOrder: 5,
  prerequisiteIds: ["sd-caching"],
  relatedTopicIds: ["sd-reliability-and-scaling"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "sd-message-queues",
      title: "Message Queues",
      description: "Message Queues applied in this topic.",
    }),
    concept({
      id: "sd-pub-sub",
      title: "Pub/Sub",
      description: "Pub/Sub applied in this topic.",
    }),
    concept({
      id: "sd-at-least-once-delivery",
      title: "At-least-once Delivery",
      description: "At-least-once Delivery applied in this topic.",
    }),
    concept({
      id: "sd-idempotent-consumers",
      title: "Idempotent Consumers",
      description: "Idempotent Consumers applied in this topic.",
    }),
    concept({
      id: "sd-backpressure",
      title: "Backpressure",
      description: "Backpressure applied in this topic.",
    }),
    concept({
      id: "sd-dead-letter-queues",
      title: "Dead-letter Queues",
      description: "Dead-letter Queues applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Message Queues correctly","Explain Pub/Sub in context"],
  practicalArtifacts: [
    artifact({
      id: "sd-messaging-and-async-artifact",
      type: "workflow",
      title: "Messaging and Asynchronous Processing worked example",
      
      content: "Step 1: Identify the Message Queues requirement\nStep 2: Apply Pub/Sub in a small scenario\nStep 3: Verify At-least-once Delivery with an expected check\nOutcome: a validated Messaging and Asynchronous Processing mini-runbook",
      
      explanation: "Demonstrates Message Queues, Pub/Sub, At-least-once Delivery.",
      conceptIds: ["sd-message-queues","sd-pub-sub","sd-at-least-once-delivery","sd-idempotent-consumers"],
    }),
  ],
  commonMistakes: [
    mistake(
      "sd-messaging-and-async-mistake-1",
      "Misapplying Message Queues",
      "Skipping hands-on checks in Messaging and Asynchronous Processing",
      "Practice Message Queues with a tiny example first.",
      ["sd-message-queues"],
    ),
    mistake(
      "sd-messaging-and-async-mistake-2",
      "Pulling unrelated-domain demos into Messaging and Asynchronous Processing",
      "Defaulting to out-of-domain snippets",
      "Stay inside Messaging and Asynchronous Processing concepts.",
      ["sd-pub-sub"],
    ),
  ],
  exercises: [
    exercise({
      id: "sd-messaging-and-async-exercise",
      title: "Messaging and Asynchronous Processing mini exercise",
      instructions: ["Build a small example covering Message Queues.","Extend it with Pub/Sub.","Verify behavior related to At-least-once Delivery."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Messaging and Asynchronous Processing.",
      conceptIds: ["sd-message-queues","sd-pub-sub","sd-at-least-once-delivery"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sd-messaging-and-async", ["sd-message-queues","sd-pub-sub","sd-at-least-once-delivery","sd-idempotent-consumers","sd-backpressure"],
    ["concept-understanding","architecture-reasoning","practical-scenario","configuration-analysis","debugging"]),
});

const sd_reliability_and_scalingTopic = topic({
  id: "sd-reliability-and-scaling",
  title: "Reliability and Scaling",
  aliases: ["horizontal scaling","failover"],
  description: "Scale horizontally and design for failure with redundancy.",
  learningOrder: 6,
  prerequisiteIds: ["sd-messaging-and-async"],
  relatedTopicIds: ["sd-api-design"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "sd-horizontal-scaling",
      title: "Horizontal Scaling",
      description: "Horizontal Scaling applied in this topic.",
    }),
    concept({
      id: "sd-load-balancing",
      title: "Load Balancing",
      description: "Load Balancing applied in this topic.",
    }),
    concept({
      id: "sd-redundancy",
      title: "Redundancy",
      description: "Redundancy applied in this topic.",
    }),
    concept({
      id: "sd-failover",
      title: "Failover",
      description: "Failover applied in this topic.",
    }),
    concept({
      id: "sd-graceful-degradation",
      title: "Graceful Degradation",
      description: "Graceful Degradation applied in this topic.",
    }),
    concept({
      id: "sd-circuit-breakers-intro",
      title: "Circuit Breakers Intro",
      description: "Circuit Breakers Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Horizontal Scaling correctly","Explain Load Balancing in context"],
  practicalArtifacts: [
    artifact({
      id: "sd-reliability-and-scaling-artifact",
      type: "workflow",
      title: "Reliability and Scaling worked example",
      
      content: "Step 1: Identify the Horizontal Scaling requirement\nStep 2: Apply Load Balancing in a small scenario\nStep 3: Verify Redundancy with an expected check\nOutcome: a validated Reliability and Scaling mini-runbook",
      
      explanation: "Demonstrates Horizontal Scaling, Load Balancing, Redundancy.",
      conceptIds: ["sd-horizontal-scaling","sd-load-balancing","sd-redundancy","sd-failover"],
    }),
  ],
  commonMistakes: [
    mistake(
      "sd-reliability-and-scaling-mistake-1",
      "Misapplying Horizontal Scaling",
      "Skipping hands-on checks in Reliability and Scaling",
      "Practice Horizontal Scaling with a tiny example first.",
      ["sd-horizontal-scaling"],
    ),
    mistake(
      "sd-reliability-and-scaling-mistake-2",
      "Pulling unrelated-domain demos into Reliability and Scaling",
      "Defaulting to out-of-domain snippets",
      "Stay inside Reliability and Scaling concepts.",
      ["sd-load-balancing"],
    ),
  ],
  exercises: [
    exercise({
      id: "sd-reliability-and-scaling-exercise",
      title: "Reliability and Scaling mini exercise",
      instructions: ["Build a small example covering Horizontal Scaling.","Extend it with Load Balancing.","Verify behavior related to Redundancy."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Reliability and Scaling.",
      conceptIds: ["sd-horizontal-scaling","sd-load-balancing","sd-redundancy"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sd-reliability-and-scaling", ["sd-horizontal-scaling","sd-load-balancing","sd-redundancy","sd-failover","sd-graceful-degradation"],
    ["concept-understanding","architecture-reasoning","practical-scenario","configuration-analysis","debugging"]),
});

const sd_api_designTopic = topic({
  id: "sd-api-design",
  title: "API Design for Systems",
  aliases: ["api design","rate limiting"],
  description: "Design external/internal APIs with versioning and pagination.",
  learningOrder: 7,
  prerequisiteIds: ["sd-reliability-and-scaling"],
  relatedTopicIds: ["sd-consistency-tradeoffs"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "sd-resource-modeling",
      title: "Resource Modeling",
      description: "Resource Modeling applied in this topic.",
    }),
    concept({
      id: "sd-idempotent-methods",
      title: "Idempotent Methods",
      description: "Idempotent Methods applied in this topic.",
    }),
    concept({
      id: "sd-pagination",
      title: "Pagination",
      description: "Pagination applied in this topic.",
    }),
    concept({
      id: "sd-versioning",
      title: "Versioning",
      description: "Versioning applied in this topic.",
    }),
    concept({
      id: "sd-rate-limiting",
      title: "Rate Limiting",
      description: "Rate Limiting applied in this topic.",
    }),
    concept({
      id: "sd-error-contracts",
      title: "Error Contracts",
      description: "Error Contracts applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Resource Modeling correctly","Explain Idempotent Methods in context"],
  practicalArtifacts: [
    artifact({
      id: "sd-api-design-artifact",
      type: "workflow",
      title: "API Design for Systems worked example",
      
      content: "Step 1: Identify the Resource Modeling requirement\nStep 2: Apply Idempotent Methods in a small scenario\nStep 3: Verify Pagination with an expected check\nOutcome: a validated API Design for Systems mini-runbook",
      
      explanation: "Demonstrates Resource Modeling, Idempotent Methods, Pagination.",
      conceptIds: ["sd-resource-modeling","sd-idempotent-methods","sd-pagination","sd-versioning"],
    }),
  ],
  commonMistakes: [
    mistake(
      "sd-api-design-mistake-1",
      "Misapplying Resource Modeling",
      "Skipping hands-on checks in API Design for Systems",
      "Practice Resource Modeling with a tiny example first.",
      ["sd-resource-modeling"],
    ),
    mistake(
      "sd-api-design-mistake-2",
      "Pulling unrelated-domain demos into API Design for Systems",
      "Defaulting to out-of-domain snippets",
      "Stay inside API Design for Systems concepts.",
      ["sd-idempotent-methods"],
    ),
  ],
  exercises: [
    exercise({
      id: "sd-api-design-exercise",
      title: "API Design for Systems mini exercise",
      instructions: ["Build a small example covering Resource Modeling.","Extend it with Idempotent Methods.","Verify behavior related to Pagination."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for API Design for Systems.",
      conceptIds: ["sd-resource-modeling","sd-idempotent-methods","sd-pagination"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sd-api-design", ["sd-resource-modeling","sd-idempotent-methods","sd-pagination","sd-versioning","sd-rate-limiting"],
    ["concept-understanding","architecture-reasoning","practical-scenario","configuration-analysis","debugging"]),
});

const sd_consistency_tradeoffsTopic = topic({
  id: "sd-consistency-tradeoffs",
  title: "Consistency Tradeoffs",
  aliases: ["consistency","cap theorem"],
  description: "Reason about CAP/PACELC-style tradeoffs and consistency models.",
  learningOrder: 8,
  prerequisiteIds: ["sd-api-design"],
  
  difficulty: "advanced",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "sd-strong-consistency",
      title: "Strong Consistency",
      description: "Strong Consistency applied in this topic.",
    }),
    concept({
      id: "sd-eventual-consistency",
      title: "Eventual Consistency",
      description: "Eventual Consistency applied in this topic.",
    }),
    concept({
      id: "sd-cap-intuition",
      title: "CAP Intuition",
      description: "CAP Intuition applied in this topic.",
    }),
    concept({
      id: "sd-read-your-writes",
      title: "Read-Your-Writes",
      description: "Read-Your-Writes applied in this topic.",
    }),
    concept({
      id: "sd-transactions-boundaries",
      title: "Transactions Boundaries",
      description: "Transactions Boundaries applied in this topic.",
    }),
    concept({
      id: "sd-saga-intro",
      title: "Saga Intro",
      description: "Saga Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Strong Consistency correctly","Explain Eventual Consistency in context"],
  practicalArtifacts: [
    artifact({
      id: "sd-consistency-tradeoffs-artifact",
      type: "workflow",
      title: "Consistency Tradeoffs worked example",
      
      content: "Step 1: Identify the Strong Consistency requirement\nStep 2: Apply Eventual Consistency in a small scenario\nStep 3: Verify CAP Intuition with an expected check\nOutcome: a validated Consistency Tradeoffs mini-runbook",
      
      explanation: "Demonstrates Strong Consistency, Eventual Consistency, CAP Intuition.",
      conceptIds: ["sd-strong-consistency","sd-eventual-consistency","sd-cap-intuition","sd-read-your-writes"],
    }),
  ],
  commonMistakes: [
    mistake(
      "sd-consistency-tradeoffs-mistake-1",
      "Misapplying Strong Consistency",
      "Skipping hands-on checks in Consistency Tradeoffs",
      "Practice Strong Consistency with a tiny example first.",
      ["sd-strong-consistency"],
    ),
    mistake(
      "sd-consistency-tradeoffs-mistake-2",
      "Pulling unrelated-domain demos into Consistency Tradeoffs",
      "Defaulting to out-of-domain snippets",
      "Stay inside Consistency Tradeoffs concepts.",
      ["sd-eventual-consistency"],
    ),
  ],
  exercises: [
    exercise({
      id: "sd-consistency-tradeoffs-exercise",
      title: "Consistency Tradeoffs mini exercise",
      instructions: ["Build a small example covering Strong Consistency.","Extend it with Eventual Consistency.","Verify behavior related to CAP Intuition."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Consistency Tradeoffs.",
      conceptIds: ["sd-strong-consistency","sd-eventual-consistency","sd-cap-intuition"],
      difficulty: "advanced",
    }),
  ],
  assessmentSkills: defaultTopicSkills("sd-consistency-tradeoffs", ["sd-strong-consistency","sd-eventual-consistency","sd-cap-intuition","sd-read-your-writes","sd-transactions-boundaries"],
    ["concept-understanding","architecture-reasoning","practical-scenario","configuration-analysis","debugging"]),
});

export const systemDesignKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-system-design",
  title: "System Design",
  aliases: ["system design","learn system design","distributed systems design","software architecture design"],
  category: "General Technology",
  description: "System Design curriculum covering requirements, capacity, data modeling, caching, messaging, reliability, and API/design tradeoffs.",
  topics: [sd_requirements_and_constraintsTopic, sd_capacity_and_back_of_envelopeTopic, sd_data_modeling_and_storageTopic, sd_cachingTopic, sd_messaging_and_asyncTopic, sd_reliability_and_scalingTopic, sd_api_designTopic, sd_consistency_tradeoffsTopic],
});
