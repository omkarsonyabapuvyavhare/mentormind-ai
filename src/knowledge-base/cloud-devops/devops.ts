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

const devops_cicd_pipelinesTopic = topic({
  id: "devops-cicd-pipelines",
  title: "CI/CD Pipelines",
  aliases: ["ci/cd","pipelines"],
  description: "Automate build, test, and deploy stages with pipeline as code.",
  learningOrder: 1,
  
  relatedTopicIds: ["devops-infrastructure-as-code"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "devops-continuous-integration",
      title: "Continuous Integration",
      description: "Continuous Integration applied in this topic.",
    }),
    concept({
      id: "devops-continuous-delivery",
      title: "Continuous Delivery",
      description: "Continuous Delivery applied in this topic.",
    }),
    concept({
      id: "devops-pipeline-as-code",
      title: "Pipeline as Code",
      description: "Pipeline as Code applied in this topic.",
    }),
    concept({
      id: "devops-build-artifacts",
      title: "Build Artifacts",
      description: "Build Artifacts applied in this topic.",
    }),
    concept({
      id: "devops-test-gates",
      title: "Test Gates",
      description: "Test Gates applied in this topic.",
    }),
    concept({
      id: "devops-deploy-stages",
      title: "Deploy Stages",
      description: "Deploy Stages applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Continuous Integration correctly","Explain Continuous Delivery in context"],
  practicalArtifacts: [
    artifact({
      id: "devops-cicd-pipelines-artifact",
      type: "workflow",
      title: "Four-stage pipeline",
      
      content: "lint -> unit test -> build image -> deploy to staging",
      expectedOutput: "Each commit produces a tested artifact before deploy",
      explanation: "Minimal healthy CI/CD path.",
      conceptIds: ["devops-continuous-integration","devops-continuous-delivery","devops-pipeline-as-code","devops-build-artifacts"],
    }),
  ],
  commonMistakes: [
    mistake(
      "devops-cicd-pipelines-mistake-1",
      "Misapplying Continuous Integration",
      "Skipping hands-on checks in CI/CD Pipelines",
      "Practice Continuous Integration with a tiny example first.",
      ["devops-continuous-integration"],
    ),
    mistake(
      "devops-cicd-pipelines-mistake-2",
      "Pulling unrelated-domain demos into CI/CD Pipelines",
      "Defaulting to out-of-domain snippets",
      "Stay inside CI/CD Pipelines concepts.",
      ["devops-continuous-delivery"],
    ),
  ],
  exercises: [
    exercise({
      id: "devops-cicd-pipelines-exercise",
      title: "CI/CD Pipelines mini exercise",
      instructions: ["Build a small example covering Continuous Integration.","Extend it with Continuous Delivery.","Verify behavior related to Pipeline as Code."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for CI/CD Pipelines.",
      conceptIds: ["devops-continuous-integration","devops-continuous-delivery","devops-pipeline-as-code"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("devops-cicd-pipelines", ["devops-continuous-integration","devops-continuous-delivery","devops-pipeline-as-code","devops-build-artifacts","devops-test-gates"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const devops_infrastructure_as_codeTopic = topic({
  id: "devops-infrastructure-as-code",
  title: "Infrastructure as Code Mindset",
  aliases: ["iac","infrastructure as code"],
  description: "Manage environments declaratively with reviewable config.",
  learningOrder: 2,
  prerequisiteIds: ["devops-cicd-pipelines"],
  relatedTopicIds: ["devops-environments"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "devops-declarative-config",
      title: "Declarative Config",
      description: "Declarative Config applied in this topic.",
    }),
    concept({
      id: "devops-idempotency",
      title: "Idempotency",
      description: "Idempotency applied in this topic.",
    }),
    concept({
      id: "devops-drift-detection",
      title: "Drift Detection",
      description: "Drift Detection applied in this topic.",
    }),
    concept({
      id: "devops-code-review-for-infra",
      title: "Code Review for Infra",
      description: "Code Review for Infra applied in this topic.",
    }),
    concept({
      id: "devops-secrets-separation",
      title: "Secrets Separation",
      description: "Secrets Separation applied in this topic.",
    }),
    concept({
      id: "devops-environment-parity",
      title: "Environment Parity",
      description: "Environment Parity applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Declarative Config correctly","Explain Idempotency in context"],
  practicalArtifacts: [
    artifact({
      id: "devops-infrastructure-as-code-artifact",
      type: "workflow",
      title: "Infrastructure as Code Mindset worked example",
      
      content: "Step 1: Identify the Declarative Config requirement\nStep 2: Apply Idempotency in a small scenario\nStep 3: Verify Drift Detection with an expected check\nOutcome: a validated Infrastructure as Code Mindset mini-runbook",
      
      explanation: "Demonstrates Declarative Config, Idempotency, Drift Detection.",
      conceptIds: ["devops-declarative-config","devops-idempotency","devops-drift-detection","devops-code-review-for-infra"],
    }),
  ],
  commonMistakes: [
    mistake(
      "devops-infrastructure-as-code-mistake-1",
      "Misapplying Declarative Config",
      "Skipping hands-on checks in Infrastructure as Code Mindset",
      "Practice Declarative Config with a tiny example first.",
      ["devops-declarative-config"],
    ),
    mistake(
      "devops-infrastructure-as-code-mistake-2",
      "Pulling unrelated-domain demos into Infrastructure as Code Mindset",
      "Defaulting to out-of-domain snippets",
      "Stay inside Infrastructure as Code Mindset concepts.",
      ["devops-idempotency"],
    ),
  ],
  exercises: [
    exercise({
      id: "devops-infrastructure-as-code-exercise",
      title: "Infrastructure as Code Mindset mini exercise",
      instructions: ["Build a small example covering Declarative Config.","Extend it with Idempotency.","Verify behavior related to Drift Detection."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Infrastructure as Code Mindset.",
      conceptIds: ["devops-declarative-config","devops-idempotency","devops-drift-detection"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("devops-infrastructure-as-code", ["devops-declarative-config","devops-idempotency","devops-drift-detection","devops-code-review-for-infra","devops-secrets-separation"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const devops_environmentsTopic = topic({
  id: "devops-environments",
  title: "Environments and Promotion",
  aliases: ["deployment environments","promotion"],
  description: "Promote changes through dev/stage/prod with clear controls.",
  learningOrder: 3,
  prerequisiteIds: ["devops-infrastructure-as-code"],
  relatedTopicIds: ["devops-observability"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "devops-environment-topology",
      title: "Environment Topology",
      description: "Environment Topology applied in this topic.",
    }),
    concept({
      id: "devops-promotion-paths",
      title: "Promotion Paths",
      description: "Promotion Paths applied in this topic.",
    }),
    concept({
      id: "devops-config-per-environment",
      title: "Config per Environment",
      description: "Config per Environment applied in this topic.",
    }),
    concept({
      id: "devops-feature-flags-intro",
      title: "Feature Flags Intro",
      description: "Feature Flags Intro applied in this topic.",
    }),
    concept({
      id: "devops-manual-approvals",
      title: "Manual Approvals",
      description: "Manual Approvals applied in this topic.",
    }),
    concept({
      id: "devops-blast-radius",
      title: "Blast Radius",
      description: "Blast Radius applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Environment Topology correctly","Explain Promotion Paths in context"],
  practicalArtifacts: [
    artifact({
      id: "devops-environments-artifact",
      type: "workflow",
      title: "Environments and Promotion worked example",
      
      content: "Step 1: Identify the Environment Topology requirement\nStep 2: Apply Promotion Paths in a small scenario\nStep 3: Verify Config per Environment with an expected check\nOutcome: a validated Environments and Promotion mini-runbook",
      
      explanation: "Demonstrates Environment Topology, Promotion Paths, Config per Environment.",
      conceptIds: ["devops-environment-topology","devops-promotion-paths","devops-config-per-environment","devops-feature-flags-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "devops-environments-mistake-1",
      "Misapplying Environment Topology",
      "Skipping hands-on checks in Environments and Promotion",
      "Practice Environment Topology with a tiny example first.",
      ["devops-environment-topology"],
    ),
    mistake(
      "devops-environments-mistake-2",
      "Pulling unrelated-domain demos into Environments and Promotion",
      "Defaulting to out-of-domain snippets",
      "Stay inside Environments and Promotion concepts.",
      ["devops-promotion-paths"],
    ),
  ],
  exercises: [
    exercise({
      id: "devops-environments-exercise",
      title: "Environments and Promotion mini exercise",
      instructions: ["Build a small example covering Environment Topology.","Extend it with Promotion Paths.","Verify behavior related to Config per Environment."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Environments and Promotion.",
      conceptIds: ["devops-environment-topology","devops-promotion-paths","devops-config-per-environment"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("devops-environments", ["devops-environment-topology","devops-promotion-paths","devops-config-per-environment","devops-feature-flags-intro","devops-manual-approvals"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const devops_observabilityTopic = topic({
  id: "devops-observability",
  title: "Observability",
  aliases: ["observability","slo"],
  description: "Use metrics, logs, and traces to detect and diagnose failures.",
  learningOrder: 4,
  prerequisiteIds: ["devops-environments"],
  relatedTopicIds: ["devops-collaboration-practices"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "devops-metrics",
      title: "Metrics",
      description: "Metrics applied in this topic.",
    }),
    concept({
      id: "devops-logs",
      title: "Logs",
      description: "Logs applied in this topic.",
    }),
    concept({
      id: "devops-traces",
      title: "Traces",
      description: "Traces applied in this topic.",
    }),
    concept({
      id: "devops-slis-slos-intro",
      title: "SLIs/SLOs Intro",
      description: "SLIs/SLOs Intro applied in this topic.",
    }),
    concept({
      id: "devops-alert-hygiene",
      title: "Alert Hygiene",
      description: "Alert Hygiene applied in this topic.",
    }),
    concept({
      id: "devops-on-call-runbooks",
      title: "On-call Runbooks",
      description: "On-call Runbooks applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Metrics correctly","Explain Logs in context"],
  practicalArtifacts: [
    artifact({
      id: "devops-observability-artifact",
      type: "workflow",
      title: "Observability worked example",
      
      content: "Step 1: Identify the Metrics requirement\nStep 2: Apply Logs in a small scenario\nStep 3: Verify Traces with an expected check\nOutcome: a validated Observability mini-runbook",
      
      explanation: "Demonstrates Metrics, Logs, Traces.",
      conceptIds: ["devops-metrics","devops-logs","devops-traces","devops-slis-slos-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "devops-observability-mistake-1",
      "Misapplying Metrics",
      "Skipping hands-on checks in Observability",
      "Practice Metrics with a tiny example first.",
      ["devops-metrics"],
    ),
    mistake(
      "devops-observability-mistake-2",
      "Pulling unrelated-domain demos into Observability",
      "Defaulting to out-of-domain snippets",
      "Stay inside Observability concepts.",
      ["devops-logs"],
    ),
  ],
  exercises: [
    exercise({
      id: "devops-observability-exercise",
      title: "Observability mini exercise",
      instructions: ["Build a small example covering Metrics.","Extend it with Logs.","Verify behavior related to Traces."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Observability.",
      conceptIds: ["devops-metrics","devops-logs","devops-traces"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("devops-observability", ["devops-metrics","devops-logs","devops-traces","devops-slis-slos-intro","devops-alert-hygiene"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const devops_collaboration_practicesTopic = topic({
  id: "devops-collaboration-practices",
  title: "Collaboration Practices",
  aliases: ["devops culture","postmortems"],
  description: "Apply trunk-based development, blameless culture, and docs-as-code.",
  learningOrder: 5,
  prerequisiteIds: ["devops-observability"],
  relatedTopicIds: ["devops-release-strategies"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "devops-trunk-based-dev",
      title: "Trunk-Based Dev",
      description: "Trunk-Based Dev applied in this topic.",
    }),
    concept({
      id: "devops-code-review-norms",
      title: "Code Review Norms",
      description: "Code Review Norms applied in this topic.",
    }),
    concept({
      id: "devops-blameless-postmortems",
      title: "Blameless Postmortems",
      description: "Blameless Postmortems applied in this topic.",
    }),
    concept({
      id: "devops-docs-as-code",
      title: "Docs as Code",
      description: "Docs as Code applied in this topic.",
    }),
    concept({
      id: "devops-cross-functional-ownership",
      title: "Cross-functional Ownership",
      description: "Cross-functional Ownership applied in this topic.",
    }),
    concept({
      id: "devops-toil-reduction",
      title: "Toil Reduction",
      description: "Toil Reduction applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Trunk-Based Dev correctly","Explain Code Review Norms in context"],
  practicalArtifacts: [
    artifact({
      id: "devops-collaboration-practices-artifact",
      type: "workflow",
      title: "Collaboration Practices worked example",
      
      content: "Step 1: Identify the Trunk-Based Dev requirement\nStep 2: Apply Code Review Norms in a small scenario\nStep 3: Verify Blameless Postmortems with an expected check\nOutcome: a validated Collaboration Practices mini-runbook",
      
      explanation: "Demonstrates Trunk-Based Dev, Code Review Norms, Blameless Postmortems.",
      conceptIds: ["devops-trunk-based-dev","devops-code-review-norms","devops-blameless-postmortems","devops-docs-as-code"],
    }),
  ],
  commonMistakes: [
    mistake(
      "devops-collaboration-practices-mistake-1",
      "Misapplying Trunk-Based Dev",
      "Skipping hands-on checks in Collaboration Practices",
      "Practice Trunk-Based Dev with a tiny example first.",
      ["devops-trunk-based-dev"],
    ),
    mistake(
      "devops-collaboration-practices-mistake-2",
      "Pulling unrelated-domain demos into Collaboration Practices",
      "Defaulting to out-of-domain snippets",
      "Stay inside Collaboration Practices concepts.",
      ["devops-code-review-norms"],
    ),
  ],
  exercises: [
    exercise({
      id: "devops-collaboration-practices-exercise",
      title: "Collaboration Practices mini exercise",
      instructions: ["Build a small example covering Trunk-Based Dev.","Extend it with Code Review Norms.","Verify behavior related to Blameless Postmortems."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Collaboration Practices.",
      conceptIds: ["devops-trunk-based-dev","devops-code-review-norms","devops-blameless-postmortems"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("devops-collaboration-practices", ["devops-trunk-based-dev","devops-code-review-norms","devops-blameless-postmortems","devops-docs-as-code","devops-cross-functional-ownership"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const devops_release_strategiesTopic = topic({
  id: "devops-release-strategies",
  title: "Release Strategies",
  aliases: ["canary","blue green"],
  description: "Ship safely with blue/green, canaries, and rollback plans.",
  learningOrder: 6,
  prerequisiteIds: ["devops-collaboration-practices"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "devops-blue-green",
      title: "Blue/Green",
      description: "Blue/Green applied in this topic.",
    }),
    concept({
      id: "devops-canary-releases",
      title: "Canary Releases",
      description: "Canary Releases applied in this topic.",
    }),
    concept({
      id: "devops-rolling-updates",
      title: "Rolling Updates",
      description: "Rolling Updates applied in this topic.",
    }),
    concept({
      id: "devops-rollback-criteria",
      title: "Rollback Criteria",
      description: "Rollback Criteria applied in this topic.",
    }),
    concept({
      id: "devops-database-migration-caution",
      title: "Database Migration Caution",
      description: "Database Migration Caution applied in this topic.",
    }),
    concept({
      id: "devops-change-failure-rate",
      title: "Change Failure Rate",
      description: "Change Failure Rate applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Blue/Green correctly","Explain Canary Releases in context"],
  practicalArtifacts: [
    artifact({
      id: "devops-release-strategies-artifact",
      type: "workflow",
      title: "Release Strategies worked example",
      
      content: "Step 1: Identify the Blue/Green requirement\nStep 2: Apply Canary Releases in a small scenario\nStep 3: Verify Rolling Updates with an expected check\nOutcome: a validated Release Strategies mini-runbook",
      
      explanation: "Demonstrates Blue/Green, Canary Releases, Rolling Updates.",
      conceptIds: ["devops-blue-green","devops-canary-releases","devops-rolling-updates","devops-rollback-criteria"],
    }),
  ],
  commonMistakes: [
    mistake(
      "devops-release-strategies-mistake-1",
      "Misapplying Blue/Green",
      "Skipping hands-on checks in Release Strategies",
      "Practice Blue/Green with a tiny example first.",
      ["devops-blue-green"],
    ),
    mistake(
      "devops-release-strategies-mistake-2",
      "Pulling unrelated-domain demos into Release Strategies",
      "Defaulting to out-of-domain snippets",
      "Stay inside Release Strategies concepts.",
      ["devops-canary-releases"],
    ),
  ],
  exercises: [
    exercise({
      id: "devops-release-strategies-exercise",
      title: "Release Strategies mini exercise",
      instructions: ["Build a small example covering Blue/Green.","Extend it with Canary Releases.","Verify behavior related to Rolling Updates."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Release Strategies.",
      conceptIds: ["devops-blue-green","devops-canary-releases","devops-rolling-updates"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("devops-release-strategies", ["devops-blue-green","devops-canary-releases","devops-rolling-updates","devops-rollback-criteria","devops-database-migration-caution"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

export const devopsKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-devops",
  title: "DevOps",
  aliases: ["devops","learn devops","devops engineering","ci cd devops"],
  category: "DevOps",
  description: "DevOps starter covering CI/CD, infrastructure as code mindset, environments, observability, collaboration, and release strategies.",
  topics: [devops_cicd_pipelinesTopic, devops_infrastructure_as_codeTopic, devops_environmentsTopic, devops_observabilityTopic, devops_collaboration_practicesTopic, devops_release_strategiesTopic],
});
