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

const tf_hcl_basicsTopic = topic({
  id: "tf-hcl-basics",
  title: "HCL Basics",
  aliases: ["hcl","terraform syntax"],
  description: "Author Terraform configuration with blocks, arguments, and expressions.",
  learningOrder: 1,
  
  relatedTopicIds: ["tf-providers-and-state"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "tf-blocks",
      title: "Blocks",
      description: "Blocks applied in this topic.",
    }),
    concept({
      id: "tf-arguments",
      title: "Arguments",
      description: "Arguments applied in this topic.",
    }),
    concept({
      id: "tf-expressions",
      title: "Expressions",
      description: "Expressions applied in this topic.",
    }),
    concept({
      id: "tf-types",
      title: "Types",
      description: "Types applied in this topic.",
    }),
    concept({
      id: "tf-locals",
      title: "Locals",
      description: "Locals applied in this topic.",
    }),
    concept({
      id: "tf-comments",
      title: "Comments",
      description: "Comments applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Blocks correctly","Explain Arguments in context"],
  practicalArtifacts: [
    artifact({
      id: "tf-hcl-basics-artifact",
      type: "configuration",
      title: "Minimal null resource",
      language: "hcl",
      content: "terraform {\n  required_version = \">= 1.5.0\"\n}\nresource \"null_resource\" \"example\" {\n  triggers = { always = timestamp() }\n}",
      expectedOutput: "terraform validate succeeds",
      explanation: "Tiny valid configuration for syntax practice.",
      conceptIds: ["tf-blocks","tf-arguments","tf-expressions","tf-types"],
    }),
  ],
  commonMistakes: [
    mistake(
      "tf-hcl-basics-mistake-1",
      "Misapplying Blocks",
      "Skipping hands-on checks in HCL Basics",
      "Practice Blocks with a tiny example first.",
      ["tf-blocks"],
    ),
    mistake(
      "tf-hcl-basics-mistake-2",
      "Pulling unrelated-domain demos into HCL Basics",
      "Defaulting to out-of-domain snippets",
      "Stay inside HCL Basics concepts.",
      ["tf-arguments"],
    ),
  ],
  exercises: [
    exercise({
      id: "tf-hcl-basics-exercise",
      title: "HCL Basics mini exercise",
      instructions: ["Build a small example covering Blocks.","Extend it with Arguments.","Verify behavior related to Expressions."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for HCL Basics.",
      conceptIds: ["tf-blocks","tf-arguments","tf-expressions"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("tf-hcl-basics", ["tf-blocks","tf-arguments","tf-expressions","tf-types","tf-locals"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const tf_providers_and_stateTopic = topic({
  id: "tf-providers-and-state",
  title: "Providers and State",
  aliases: ["terraform state","providers"],
  description: "Configure providers and reason about local/remote state.",
  learningOrder: 2,
  prerequisiteIds: ["tf-hcl-basics"],
  relatedTopicIds: ["tf-resources-and-dependencies"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "tf-provider-blocks",
      title: "Provider Blocks",
      description: "Provider Blocks applied in this topic.",
    }),
    concept({
      id: "tf-required-providers",
      title: "Required Providers",
      description: "Required Providers applied in this topic.",
    }),
    concept({
      id: "tf-state-file",
      title: "State File",
      description: "State File applied in this topic.",
    }),
    concept({
      id: "tf-remote-backend-intro",
      title: "Remote Backend Intro",
      description: "Remote Backend Intro applied in this topic.",
    }),
    concept({
      id: "tf-state-locking",
      title: "State Locking",
      description: "State Locking applied in this topic.",
    }),
    concept({
      id: "tf-terraform-init",
      title: "terraform init",
      description: "terraform init applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Provider Blocks correctly","Explain Required Providers in context"],
  practicalArtifacts: [
    artifact({
      id: "tf-providers-and-state-artifact",
      type: "workflow",
      title: "Providers and State worked example",
      
      content: "Step 1: Identify the Provider Blocks requirement\nStep 2: Apply Required Providers in a small scenario\nStep 3: Verify State File with an expected check\nOutcome: a validated Providers and State mini-runbook",
      
      explanation: "Demonstrates Provider Blocks, Required Providers, State File.",
      conceptIds: ["tf-provider-blocks","tf-required-providers","tf-state-file","tf-remote-backend-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "tf-providers-and-state-mistake-1",
      "Misapplying Provider Blocks",
      "Skipping hands-on checks in Providers and State",
      "Practice Provider Blocks with a tiny example first.",
      ["tf-provider-blocks"],
    ),
    mistake(
      "tf-providers-and-state-mistake-2",
      "Pulling unrelated-domain demos into Providers and State",
      "Defaulting to out-of-domain snippets",
      "Stay inside Providers and State concepts.",
      ["tf-required-providers"],
    ),
  ],
  exercises: [
    exercise({
      id: "tf-providers-and-state-exercise",
      title: "Providers and State mini exercise",
      instructions: ["Build a small example covering Provider Blocks.","Extend it with Required Providers.","Verify behavior related to State File."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Providers and State.",
      conceptIds: ["tf-provider-blocks","tf-required-providers","tf-state-file"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("tf-providers-and-state", ["tf-provider-blocks","tf-required-providers","tf-state-file","tf-remote-backend-intro","tf-state-locking"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const tf_resources_and_dependenciesTopic = topic({
  id: "tf-resources-and-dependencies",
  title: "Resources and Dependencies",
  aliases: ["terraform resources","depends_on"],
  description: "Declare resources and understand implicit/explicit dependencies.",
  learningOrder: 3,
  prerequisiteIds: ["tf-providers-and-state"],
  relatedTopicIds: ["tf-variables-and-outputs"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "tf-resource-addresses",
      title: "Resource Addresses",
      description: "Resource Addresses applied in this topic.",
    }),
    concept({
      id: "tf-implicit-dependencies",
      title: "Implicit Dependencies",
      description: "Implicit Dependencies applied in this topic.",
    }),
    concept({
      id: "tf-depends-on",
      title: "depends_on",
      description: "depends_on applied in this topic.",
    }),
    concept({
      id: "tf-count-for-each-intro",
      title: "Count/for_each Intro",
      description: "Count/for_each Intro applied in this topic.",
    }),
    concept({
      id: "tf-lifecycle-meta-args",
      title: "Lifecycle Meta-Args",
      description: "Lifecycle Meta-Args applied in this topic.",
    }),
    concept({
      id: "tf-data-sources",
      title: "Data Sources",
      description: "Data Sources applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Resource Addresses correctly","Explain Implicit Dependencies in context"],
  practicalArtifacts: [
    artifact({
      id: "tf-resources-and-dependencies-artifact",
      type: "workflow",
      title: "Resources and Dependencies worked example",
      
      content: "Step 1: Identify the Resource Addresses requirement\nStep 2: Apply Implicit Dependencies in a small scenario\nStep 3: Verify depends_on with an expected check\nOutcome: a validated Resources and Dependencies mini-runbook",
      
      explanation: "Demonstrates Resource Addresses, Implicit Dependencies, depends_on.",
      conceptIds: ["tf-resource-addresses","tf-implicit-dependencies","tf-depends-on","tf-count-for-each-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "tf-resources-and-dependencies-mistake-1",
      "Misapplying Resource Addresses",
      "Skipping hands-on checks in Resources and Dependencies",
      "Practice Resource Addresses with a tiny example first.",
      ["tf-resource-addresses"],
    ),
    mistake(
      "tf-resources-and-dependencies-mistake-2",
      "Pulling unrelated-domain demos into Resources and Dependencies",
      "Defaulting to out-of-domain snippets",
      "Stay inside Resources and Dependencies concepts.",
      ["tf-implicit-dependencies"],
    ),
  ],
  exercises: [
    exercise({
      id: "tf-resources-and-dependencies-exercise",
      title: "Resources and Dependencies mini exercise",
      instructions: ["Build a small example covering Resource Addresses.","Extend it with Implicit Dependencies.","Verify behavior related to depends_on."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Resources and Dependencies.",
      conceptIds: ["tf-resource-addresses","tf-implicit-dependencies","tf-depends-on"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("tf-resources-and-dependencies", ["tf-resource-addresses","tf-implicit-dependencies","tf-depends-on","tf-count-for-each-intro","tf-lifecycle-meta-args"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const tf_variables_and_outputsTopic = topic({
  id: "tf-variables-and-outputs",
  title: "Variables and Outputs",
  aliases: ["tfvars","terraform outputs"],
  description: "Parameterize modules with variables, locals, and outputs.",
  learningOrder: 4,
  prerequisiteIds: ["tf-resources-and-dependencies"],
  relatedTopicIds: ["tf-modules"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "tf-input-variables",
      title: "input Variables",
      description: "input Variables applied in this topic.",
    }),
    concept({
      id: "tf-variable-validation",
      title: "variable Validation",
      description: "variable Validation applied in this topic.",
    }),
    concept({
      id: "tf-tfvars",
      title: "tfvars",
      description: "tfvars applied in this topic.",
    }),
    concept({
      id: "tf-outputs",
      title: "Outputs",
      description: "Outputs applied in this topic.",
    }),
    concept({
      id: "tf-sensitive-values",
      title: "Sensitive Values",
      description: "Sensitive Values applied in this topic.",
    }),
    concept({
      id: "tf-type-constraints",
      title: "Type Constraints",
      description: "Type Constraints applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply input Variables correctly","Explain variable Validation in context"],
  practicalArtifacts: [
    artifact({
      id: "tf-variables-and-outputs-artifact",
      type: "workflow",
      title: "Variables and Outputs worked example",
      
      content: "Step 1: Identify the input Variables requirement\nStep 2: Apply variable Validation in a small scenario\nStep 3: Verify tfvars with an expected check\nOutcome: a validated Variables and Outputs mini-runbook",
      
      explanation: "Demonstrates input Variables, variable Validation, tfvars.",
      conceptIds: ["tf-input-variables","tf-variable-validation","tf-tfvars","tf-outputs"],
    }),
  ],
  commonMistakes: [
    mistake(
      "tf-variables-and-outputs-mistake-1",
      "Misapplying input Variables",
      "Skipping hands-on checks in Variables and Outputs",
      "Practice input Variables with a tiny example first.",
      ["tf-input-variables"],
    ),
    mistake(
      "tf-variables-and-outputs-mistake-2",
      "Pulling unrelated-domain demos into Variables and Outputs",
      "Defaulting to out-of-domain snippets",
      "Stay inside Variables and Outputs concepts.",
      ["tf-variable-validation"],
    ),
  ],
  exercises: [
    exercise({
      id: "tf-variables-and-outputs-exercise",
      title: "Variables and Outputs mini exercise",
      instructions: ["Build a small example covering input Variables.","Extend it with variable Validation.","Verify behavior related to tfvars."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Variables and Outputs.",
      conceptIds: ["tf-input-variables","tf-variable-validation","tf-tfvars"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("tf-variables-and-outputs", ["tf-input-variables","tf-variable-validation","tf-tfvars","tf-outputs","tf-sensitive-values"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const tf_modulesTopic = topic({
  id: "tf-modules",
  title: "Modules",
  aliases: ["terraform modules","module source"],
  description: "Compose reusable modules with inputs/outputs and version constraints.",
  learningOrder: 5,
  prerequisiteIds: ["tf-variables-and-outputs"],
  relatedTopicIds: ["tf-plan-apply-workflow"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "tf-module-blocks",
      title: "Module Blocks",
      description: "Module Blocks applied in this topic.",
    }),
    concept({
      id: "tf-module-sources",
      title: "Module Sources",
      description: "Module Sources applied in this topic.",
    }),
    concept({
      id: "tf-module-inputs-outputs",
      title: "Module Inputs/Outputs",
      description: "Module Inputs/Outputs applied in this topic.",
    }),
    concept({
      id: "tf-module-versioning",
      title: "Module Versioning",
      description: "Module Versioning applied in this topic.",
    }),
    concept({
      id: "tf-root-module",
      title: "Root Module",
      description: "Root Module applied in this topic.",
    }),
    concept({
      id: "tf-composition-patterns",
      title: "Composition Patterns",
      description: "Composition Patterns applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Module Blocks correctly","Explain Module Sources in context"],
  practicalArtifacts: [
    artifact({
      id: "tf-modules-artifact",
      type: "workflow",
      title: "Modules worked example",
      
      content: "Step 1: Identify the Module Blocks requirement\nStep 2: Apply Module Sources in a small scenario\nStep 3: Verify Module Inputs/Outputs with an expected check\nOutcome: a validated Modules mini-runbook",
      
      explanation: "Demonstrates Module Blocks, Module Sources, Module Inputs/Outputs.",
      conceptIds: ["tf-module-blocks","tf-module-sources","tf-module-inputs-outputs","tf-module-versioning"],
    }),
  ],
  commonMistakes: [
    mistake(
      "tf-modules-mistake-1",
      "Misapplying Module Blocks",
      "Skipping hands-on checks in Modules",
      "Practice Module Blocks with a tiny example first.",
      ["tf-module-blocks"],
    ),
    mistake(
      "tf-modules-mistake-2",
      "Pulling unrelated-domain demos into Modules",
      "Defaulting to out-of-domain snippets",
      "Stay inside Modules concepts.",
      ["tf-module-sources"],
    ),
  ],
  exercises: [
    exercise({
      id: "tf-modules-exercise",
      title: "Modules mini exercise",
      instructions: ["Build a small example covering Module Blocks.","Extend it with Module Sources.","Verify behavior related to Module Inputs/Outputs."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Modules.",
      conceptIds: ["tf-module-blocks","tf-module-sources","tf-module-inputs-outputs"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("tf-modules", ["tf-module-blocks","tf-module-sources","tf-module-inputs-outputs","tf-module-versioning","tf-root-module"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

const tf_plan_apply_workflowTopic = topic({
  id: "tf-plan-apply-workflow",
  title: "Plan and Apply Workflow",
  aliases: ["terraform plan","terraform apply"],
  description: "Review plans safely and apply changes with collaboration hygiene.",
  learningOrder: 6,
  prerequisiteIds: ["tf-modules"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "tf-terraform-plan",
      title: "terraform plan",
      description: "terraform plan applied in this topic.",
    }),
    concept({
      id: "tf-terraform-apply",
      title: "terraform apply",
      description: "terraform apply applied in this topic.",
    }),
    concept({
      id: "tf-plan-files",
      title: "Plan Files",
      description: "Plan Files applied in this topic.",
    }),
    concept({
      id: "tf-destroy-caution",
      title: "Destroy Caution",
      description: "Destroy Caution applied in this topic.",
    }),
    concept({
      id: "tf-workspaces-intro",
      title: "Workspaces Intro",
      description: "Workspaces Intro applied in this topic.",
    }),
    concept({
      id: "tf-policy-checks-intro",
      title: "Policy Checks Intro",
      description: "Policy Checks Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply terraform plan correctly","Explain terraform apply in context"],
  practicalArtifacts: [
    artifact({
      id: "tf-plan-apply-workflow-artifact",
      type: "workflow",
      title: "Plan and Apply Workflow worked example",
      
      content: "Step 1: Identify the terraform plan requirement\nStep 2: Apply terraform apply in a small scenario\nStep 3: Verify Plan Files with an expected check\nOutcome: a validated Plan and Apply Workflow mini-runbook",
      
      explanation: "Demonstrates terraform plan, terraform apply, Plan Files.",
      conceptIds: ["tf-terraform-plan","tf-terraform-apply","tf-plan-files","tf-destroy-caution"],
    }),
  ],
  commonMistakes: [
    mistake(
      "tf-plan-apply-workflow-mistake-1",
      "Misapplying terraform plan",
      "Skipping hands-on checks in Plan and Apply Workflow",
      "Practice terraform plan with a tiny example first.",
      ["tf-terraform-plan"],
    ),
    mistake(
      "tf-plan-apply-workflow-mistake-2",
      "Pulling unrelated-domain demos into Plan and Apply Workflow",
      "Defaulting to out-of-domain snippets",
      "Stay inside Plan and Apply Workflow concepts.",
      ["tf-terraform-apply"],
    ),
  ],
  exercises: [
    exercise({
      id: "tf-plan-apply-workflow-exercise",
      title: "Plan and Apply Workflow mini exercise",
      instructions: ["Build a small example covering terraform plan.","Extend it with terraform apply.","Verify behavior related to Plan Files."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Plan and Apply Workflow.",
      conceptIds: ["tf-terraform-plan","tf-terraform-apply","tf-plan-files"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("tf-plan-apply-workflow", ["tf-terraform-plan","tf-terraform-apply","tf-plan-files","tf-destroy-caution","tf-workspaces-intro"],
    ["concept-understanding","configuration-analysis","architecture-reasoning","practical-scenario","debugging"]),
});

export const terraformKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-terraform",
  title: "Terraform",
  aliases: ["terraform","learn terraform","hashicorp terraform","tf"],
  category: "DevOps",
  description: "Terraform starter covering HCL, providers/state, resources, variables/outputs, modules, and plan/apply workflows.",
  topics: [tf_hcl_basicsTopic, tf_providers_and_stateTopic, tf_resources_and_dependenciesTopic, tf_variables_and_outputsTopic, tf_modulesTopic, tf_plan_apply_workflowTopic],
});
