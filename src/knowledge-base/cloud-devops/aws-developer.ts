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

const aws_dev_iam_for_appsTopic = topic({
  id: "aws-dev-iam-for-apps",
  title: "IAM for Applications",
  aliases: ["iam roles","assume role"],
  description: "Grant least-privilege roles to compute and temporary credentials.",
  learningOrder: 1,
  
  relatedTopicIds: ["aws-dev-lambda"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-dev-task-instance-roles",
      title: "Task/Instance Roles",
      description: "Task/Instance Roles applied in this topic.",
    }),
    concept({
      id: "aws-dev-sts-assumerole",
      title: "sts:AssumeRole",
      description: "sts:AssumeRole applied in this topic.",
    }),
    concept({
      id: "aws-dev-scoped-policies",
      title: "Scoped Policies",
      description: "Scoped Policies applied in this topic.",
    }),
    concept({
      id: "aws-dev-environment-credentials-anti-pattern",
      title: "Environment Credentials Anti-pattern",
      description: "Environment Credentials Anti-pattern applied in this topic.",
    }),
    concept({
      id: "aws-dev-permission-boundaries-intro",
      title: "Permission Boundaries Intro",
      description: "Permission Boundaries Intro applied in this topic.",
    }),
    concept({
      id: "aws-dev-identity-federation-intro",
      title: "Identity Federation Intro",
      description: "Identity Federation Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Task/Instance Roles correctly","Explain sts:AssumeRole in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-dev-iam-for-apps-artifact",
      type: "workflow",
      title: "IAM for Applications worked example",
      
      content: "Step 1: Identify the Task/Instance Roles requirement\nStep 2: Apply sts:AssumeRole in a small scenario\nStep 3: Verify Scoped Policies with an expected check\nOutcome: a validated IAM for Applications mini-runbook",
      
      explanation: "Demonstrates Task/Instance Roles, sts:AssumeRole, Scoped Policies.",
      conceptIds: ["aws-dev-task-instance-roles","aws-dev-sts-assumerole","aws-dev-scoped-policies","aws-dev-environment-credentials-anti-pattern"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-dev-iam-for-apps-mistake-1",
      "Misapplying Task/Instance Roles",
      "Skipping hands-on checks in IAM for Applications",
      "Practice Task/Instance Roles with a tiny example first.",
      ["aws-dev-task-instance-roles"],
    ),
    mistake(
      "aws-dev-iam-for-apps-mistake-2",
      "Pulling unrelated-domain demos into IAM for Applications",
      "Defaulting to out-of-domain snippets",
      "Stay inside IAM for Applications concepts.",
      ["aws-dev-sts-assumerole"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-dev-iam-for-apps-exercise",
      title: "IAM for Applications mini exercise",
      instructions: ["Build a small example covering Task/Instance Roles.","Extend it with sts:AssumeRole.","Verify behavior related to Scoped Policies."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for IAM for Applications.",
      conceptIds: ["aws-dev-task-instance-roles","aws-dev-sts-assumerole","aws-dev-scoped-policies"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-dev-iam-for-apps", ["aws-dev-task-instance-roles","aws-dev-sts-assumerole","aws-dev-scoped-policies","aws-dev-environment-credentials-anti-pattern","aws-dev-permission-boundaries-intro"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_dev_lambdaTopic = topic({
  id: "aws-dev-lambda",
  title: "AWS Lambda",
  aliases: ["lambda","serverless functions"],
  description: "Build event-driven functions with packaging, timeouts, and concurrency basics.",
  learningOrder: 2,
  prerequisiteIds: ["aws-dev-iam-for-apps"],
  relatedTopicIds: ["aws-dev-api-gateway"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-dev-handler-model",
      title: "Handler Model",
      description: "Handler Model applied in this topic.",
    }),
    concept({
      id: "aws-dev-runtime-package",
      title: "Runtime/Package",
      description: "Runtime/Package applied in this topic.",
    }),
    concept({
      id: "aws-dev-event-sources",
      title: "Event Sources",
      description: "Event Sources applied in this topic.",
    }),
    concept({
      id: "aws-dev-timeouts-memory",
      title: "Timeouts/Memory",
      description: "Timeouts/Memory applied in this topic.",
    }),
    concept({
      id: "aws-dev-environment-variables",
      title: "Environment Variables",
      description: "Environment Variables applied in this topic.",
    }),
    concept({
      id: "aws-dev-idempotency-basics",
      title: "Idempotency Basics",
      description: "Idempotency Basics applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Handler Model correctly","Explain Runtime/Package in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-dev-lambda-artifact",
      type: "workflow",
      title: "AWS Lambda worked example",
      
      content: "Step 1: Identify the Handler Model requirement\nStep 2: Apply Runtime/Package in a small scenario\nStep 3: Verify Event Sources with an expected check\nOutcome: a validated AWS Lambda mini-runbook",
      
      explanation: "Demonstrates Handler Model, Runtime/Package, Event Sources.",
      conceptIds: ["aws-dev-handler-model","aws-dev-runtime-package","aws-dev-event-sources","aws-dev-timeouts-memory"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-dev-lambda-mistake-1",
      "Misapplying Handler Model",
      "Skipping hands-on checks in AWS Lambda",
      "Practice Handler Model with a tiny example first.",
      ["aws-dev-handler-model"],
    ),
    mistake(
      "aws-dev-lambda-mistake-2",
      "Pulling unrelated-domain demos into AWS Lambda",
      "Defaulting to out-of-domain snippets",
      "Stay inside AWS Lambda concepts.",
      ["aws-dev-runtime-package"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-dev-lambda-exercise",
      title: "AWS Lambda mini exercise",
      instructions: ["Build a small example covering Handler Model.","Extend it with Runtime/Package.","Verify behavior related to Event Sources."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for AWS Lambda.",
      conceptIds: ["aws-dev-handler-model","aws-dev-runtime-package","aws-dev-event-sources"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-dev-lambda", ["aws-dev-handler-model","aws-dev-runtime-package","aws-dev-event-sources","aws-dev-timeouts-memory","aws-dev-environment-variables"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_dev_api_gatewayTopic = topic({
  id: "aws-dev-api-gateway",
  title: "API Gateway",
  aliases: ["api gateway","http api"],
  description: "Expose HTTP APIs with routing, auth, and integration to Lambda.",
  learningOrder: 3,
  prerequisiteIds: ["aws-dev-lambda"],
  relatedTopicIds: ["aws-dev-dynamodb-access"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-dev-http-api-vs-rest-api",
      title: "HTTP API vs REST API",
      description: "HTTP API vs REST API applied in this topic.",
    }),
    concept({
      id: "aws-dev-routes-integrations",
      title: "Routes/Integrations",
      description: "Routes/Integrations applied in this topic.",
    }),
    concept({
      id: "aws-dev-authorizers-intro",
      title: "Authorizers Intro",
      description: "Authorizers Intro applied in this topic.",
    }),
    concept({
      id: "aws-dev-stages",
      title: "Stages",
      description: "Stages applied in this topic.",
    }),
    concept({
      id: "aws-dev-throttling",
      title: "Throttling",
      description: "Throttling applied in this topic.",
    }),
    concept({
      id: "aws-dev-cors-basics",
      title: "CORS Basics",
      description: "CORS Basics applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply HTTP API vs REST API correctly","Explain Routes/Integrations in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-dev-api-gateway-artifact",
      type: "workflow",
      title: "API Gateway worked example",
      
      content: "Step 1: Identify the HTTP API vs REST API requirement\nStep 2: Apply Routes/Integrations in a small scenario\nStep 3: Verify Authorizers Intro with an expected check\nOutcome: a validated API Gateway mini-runbook",
      
      explanation: "Demonstrates HTTP API vs REST API, Routes/Integrations, Authorizers Intro.",
      conceptIds: ["aws-dev-http-api-vs-rest-api","aws-dev-routes-integrations","aws-dev-authorizers-intro","aws-dev-stages"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-dev-api-gateway-mistake-1",
      "Misapplying HTTP API vs REST API",
      "Skipping hands-on checks in API Gateway",
      "Practice HTTP API vs REST API with a tiny example first.",
      ["aws-dev-http-api-vs-rest-api"],
    ),
    mistake(
      "aws-dev-api-gateway-mistake-2",
      "Pulling unrelated-domain demos into API Gateway",
      "Defaulting to out-of-domain snippets",
      "Stay inside API Gateway concepts.",
      ["aws-dev-routes-integrations"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-dev-api-gateway-exercise",
      title: "API Gateway mini exercise",
      instructions: ["Build a small example covering HTTP API vs REST API.","Extend it with Routes/Integrations.","Verify behavior related to Authorizers Intro."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for API Gateway.",
      conceptIds: ["aws-dev-http-api-vs-rest-api","aws-dev-routes-integrations","aws-dev-authorizers-intro"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-dev-api-gateway", ["aws-dev-http-api-vs-rest-api","aws-dev-routes-integrations","aws-dev-authorizers-intro","aws-dev-stages","aws-dev-throttling"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_dev_dynamodb_accessTopic = topic({
  id: "aws-dev-dynamodb-access",
  title: "DynamoDB Data Access",
  aliases: ["dynamodb","gsi"],
  description: "Model keys and read/write with the AWS SDK access patterns.",
  learningOrder: 4,
  prerequisiteIds: ["aws-dev-api-gateway"],
  relatedTopicIds: ["aws-dev-deployment-tooling"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-dev-partition-sort-keys",
      title: "Partition/Sort Keys",
      description: "Partition/Sort Keys applied in this topic.",
    }),
    concept({
      id: "aws-dev-getitem-query",
      title: "GetItem/Query",
      description: "GetItem/Query applied in this topic.",
    }),
    concept({
      id: "aws-dev-putitem-updateitem",
      title: "PutItem/UpdateItem",
      description: "PutItem/UpdateItem applied in this topic.",
    }),
    concept({
      id: "aws-dev-gsis-intro",
      title: "GSIs Intro",
      description: "GSIs Intro applied in this topic.",
    }),
    concept({
      id: "aws-dev-conditional-writes",
      title: "Conditional Writes",
      description: "Conditional Writes applied in this topic.",
    }),
    concept({
      id: "aws-dev-pagination",
      title: "Pagination",
      description: "Pagination applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Partition/Sort Keys correctly","Explain GetItem/Query in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-dev-dynamodb-access-artifact",
      type: "workflow",
      title: "DynamoDB Data Access worked example",
      
      content: "Step 1: Identify the Partition/Sort Keys requirement\nStep 2: Apply GetItem/Query in a small scenario\nStep 3: Verify PutItem/UpdateItem with an expected check\nOutcome: a validated DynamoDB Data Access mini-runbook",
      
      explanation: "Demonstrates Partition/Sort Keys, GetItem/Query, PutItem/UpdateItem.",
      conceptIds: ["aws-dev-partition-sort-keys","aws-dev-getitem-query","aws-dev-putitem-updateitem","aws-dev-gsis-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-dev-dynamodb-access-mistake-1",
      "Misapplying Partition/Sort Keys",
      "Skipping hands-on checks in DynamoDB Data Access",
      "Practice Partition/Sort Keys with a tiny example first.",
      ["aws-dev-partition-sort-keys"],
    ),
    mistake(
      "aws-dev-dynamodb-access-mistake-2",
      "Pulling unrelated-domain demos into DynamoDB Data Access",
      "Defaulting to out-of-domain snippets",
      "Stay inside DynamoDB Data Access concepts.",
      ["aws-dev-getitem-query"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-dev-dynamodb-access-exercise",
      title: "DynamoDB Data Access mini exercise",
      instructions: ["Build a small example covering Partition/Sort Keys.","Extend it with GetItem/Query.","Verify behavior related to PutItem/UpdateItem."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for DynamoDB Data Access.",
      conceptIds: ["aws-dev-partition-sort-keys","aws-dev-getitem-query","aws-dev-putitem-updateitem"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-dev-dynamodb-access", ["aws-dev-partition-sort-keys","aws-dev-getitem-query","aws-dev-putitem-updateitem","aws-dev-gsis-intro","aws-dev-conditional-writes"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_dev_deployment_toolingTopic = topic({
  id: "aws-dev-deployment-tooling",
  title: "Deployment Tooling",
  aliases: ["aws sam","cdk"],
  description: "Ship app updates with SAM/CDK concepts and CI artifacts.",
  learningOrder: 5,
  prerequisiteIds: ["aws-dev-dynamodb-access"],
  relatedTopicIds: ["aws-dev-observability"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-dev-infrastructure-as-code-intro",
      title: "Infrastructure as Code Intro",
      description: "Infrastructure as Code Intro applied in this topic.",
    }),
    concept({
      id: "aws-dev-sam-template-basics",
      title: "SAM Template Basics",
      description: "SAM Template Basics applied in this topic.",
    }),
    concept({
      id: "aws-dev-cdk-app-intro",
      title: "CDK App Intro",
      description: "CDK App Intro applied in this topic.",
    }),
    concept({
      id: "aws-dev-ci-build-artifacts",
      title: "CI Build Artifacts",
      description: "CI Build Artifacts applied in this topic.",
    }),
    concept({
      id: "aws-dev-canary-linear-deploy-intro",
      title: "Canary/Linear Deploy Intro",
      description: "Canary/Linear Deploy Intro applied in this topic.",
    }),
    concept({
      id: "aws-dev-rollback-signals",
      title: "Rollback Signals",
      description: "Rollback Signals applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Infrastructure as Code Intro correctly","Explain SAM Template Basics in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-dev-deployment-tooling-artifact",
      type: "workflow",
      title: "Deployment Tooling worked example",
      
      content: "Step 1: Identify the Infrastructure as Code Intro requirement\nStep 2: Apply SAM Template Basics in a small scenario\nStep 3: Verify CDK App Intro with an expected check\nOutcome: a validated Deployment Tooling mini-runbook",
      
      explanation: "Demonstrates Infrastructure as Code Intro, SAM Template Basics, CDK App Intro.",
      conceptIds: ["aws-dev-infrastructure-as-code-intro","aws-dev-sam-template-basics","aws-dev-cdk-app-intro","aws-dev-ci-build-artifacts"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-dev-deployment-tooling-mistake-1",
      "Misapplying Infrastructure as Code Intro",
      "Skipping hands-on checks in Deployment Tooling",
      "Practice Infrastructure as Code Intro with a tiny example first.",
      ["aws-dev-infrastructure-as-code-intro"],
    ),
    mistake(
      "aws-dev-deployment-tooling-mistake-2",
      "Pulling unrelated-domain demos into Deployment Tooling",
      "Defaulting to out-of-domain snippets",
      "Stay inside Deployment Tooling concepts.",
      ["aws-dev-sam-template-basics"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-dev-deployment-tooling-exercise",
      title: "Deployment Tooling mini exercise",
      instructions: ["Build a small example covering Infrastructure as Code Intro.","Extend it with SAM Template Basics.","Verify behavior related to CDK App Intro."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Deployment Tooling.",
      conceptIds: ["aws-dev-infrastructure-as-code-intro","aws-dev-sam-template-basics","aws-dev-cdk-app-intro"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-dev-deployment-tooling", ["aws-dev-infrastructure-as-code-intro","aws-dev-sam-template-basics","aws-dev-cdk-app-intro","aws-dev-ci-build-artifacts","aws-dev-canary-linear-deploy-intro"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const aws_dev_observabilityTopic = topic({
  id: "aws-dev-observability",
  title: "Observability for Developers",
  aliases: ["cloudwatch","x-ray"],
  description: "Debug with CloudWatch logs/metrics/traces and X-Ray basics.",
  learningOrder: 6,
  prerequisiteIds: ["aws-dev-deployment-tooling"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "aws-dev-cloudwatch-logs",
      title: "CloudWatch Logs",
      description: "CloudWatch Logs applied in this topic.",
    }),
    concept({
      id: "aws-dev-metrics-alarms",
      title: "Metrics/Alarms",
      description: "Metrics/Alarms applied in this topic.",
    }),
    concept({
      id: "aws-dev-x-ray-tracing-intro",
      title: "X-Ray Tracing Intro",
      description: "X-Ray Tracing Intro applied in this topic.",
    }),
    concept({
      id: "aws-dev-structured-logging",
      title: "Structured Logging",
      description: "Structured Logging applied in this topic.",
    }),
    concept({
      id: "aws-dev-cold-start-signals",
      title: "Cold Start Signals",
      description: "Cold Start Signals applied in this topic.",
    }),
    concept({
      id: "aws-dev-error-budgets-intro",
      title: "Error Budgets Intro",
      description: "Error Budgets Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply CloudWatch Logs correctly","Explain Metrics/Alarms in context"],
  practicalArtifacts: [
    artifact({
      id: "aws-dev-observability-artifact",
      type: "workflow",
      title: "Observability for Developers worked example",
      
      content: "Step 1: Identify the CloudWatch Logs requirement\nStep 2: Apply Metrics/Alarms in a small scenario\nStep 3: Verify X-Ray Tracing Intro with an expected check\nOutcome: a validated Observability for Developers mini-runbook",
      
      explanation: "Demonstrates CloudWatch Logs, Metrics/Alarms, X-Ray Tracing Intro.",
      conceptIds: ["aws-dev-cloudwatch-logs","aws-dev-metrics-alarms","aws-dev-x-ray-tracing-intro","aws-dev-structured-logging"],
    }),
  ],
  commonMistakes: [
    mistake(
      "aws-dev-observability-mistake-1",
      "Misapplying CloudWatch Logs",
      "Skipping hands-on checks in Observability for Developers",
      "Practice CloudWatch Logs with a tiny example first.",
      ["aws-dev-cloudwatch-logs"],
    ),
    mistake(
      "aws-dev-observability-mistake-2",
      "Pulling unrelated-domain demos into Observability for Developers",
      "Defaulting to out-of-domain snippets",
      "Stay inside Observability for Developers concepts.",
      ["aws-dev-metrics-alarms"],
    ),
  ],
  exercises: [
    exercise({
      id: "aws-dev-observability-exercise",
      title: "Observability for Developers mini exercise",
      instructions: ["Build a small example covering CloudWatch Logs.","Extend it with Metrics/Alarms.","Verify behavior related to X-Ray Tracing Intro."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Observability for Developers.",
      conceptIds: ["aws-dev-cloudwatch-logs","aws-dev-metrics-alarms","aws-dev-x-ray-tracing-intro"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("aws-dev-observability", ["aws-dev-cloudwatch-logs","aws-dev-metrics-alarms","aws-dev-x-ray-tracing-intro","aws-dev-structured-logging","aws-dev-cold-start-signals"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

export const awsDeveloperKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-aws-developer",
  title: "AWS Developer",
  aliases: ["aws developer","dva-c02","aws developer associate","learn aws developer"],
  category: "Cloud",
  description: "AWS Developer starter covering IAM for apps, Lambda, API Gateway, DynamoDB data access, deployment tooling, and observability.",
  topics: [aws_dev_iam_for_appsTopic, aws_dev_lambdaTopic, aws_dev_api_gatewayTopic, aws_dev_dynamodb_accessTopic, aws_dev_deployment_toolingTopic, aws_dev_observabilityTopic],
});
