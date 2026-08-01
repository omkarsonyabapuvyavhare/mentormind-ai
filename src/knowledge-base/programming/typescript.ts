import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = [
  "aws",
  "vpc",
  "ec2",
  "kubernetes pod",
  "sql join",
  "react hooks",
  "python",
  "django",
  "flask",
  "system.out",
  "public static void main",
];

const ts_types_and_annotationsTopic = topic({
  id: "ts-types-and-annotations",
  title: "Types and Annotations",
  aliases: ["typescript types","type annotations"],
  description: "Annotate variables and functions with primitive and structural types.",
  learningOrder: 1,
  
  relatedTopicIds: ["ts-interfaces-and-type-aliases"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ts-type-annotation",
      title: "Type Annotations",
      description: "Explicit : Type syntax on bindings and parameters.",
    }),
    concept({
      id: "ts-primitives",
      title: "Primitive Types",
      description: "string, number, boolean, null, undefined, bigint, symbol.",
    }),
    concept({
      id: "ts-arrays",
      title: "Array Types",
      description: "T[] and Array<T> for lists.",
    }),
    concept({
      id: "ts-object-types",
      title: "Object Types",
      description: "Inline { prop: Type } shapes for records.",
    }),
    concept({
      id: "ts-any-unknown",
      title: "any vs unknown",
      description: "any disables checking; unknown forces narrowing.",
    }),
    concept({
      id: "ts-type-inference",
      title: "Type Inference",
      description: "Compiler infers types from initializers.",
    }),
  ],
  learningObjectives: ["Apply Type Annotations correctly","Explain Primitive Types in context"],
  practicalArtifacts: [
    artifact({
      id: "ts-types-and-annotations-artifact",
      type: "code",
      title: "Annotated profile helper",
      language: "typescript",
      content: "type Profile = { name: string; score: number };\nfunction label(p: Profile): string {\n  return `${p.name}:${p.score}`;\n}\nconst ada: Profile = { name: \"Ada\", score: 98 };\nconsole.log(label(ada));",
      expectedOutput: "Ada:98",
      explanation: "Object type plus annotations.",
      conceptIds: ["ts-type-annotation","ts-primitives","ts-arrays","ts-object-types"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ts-types-and-annotations-mistake-1",
      "Misapplying Type Annotations",
      "Skipping hands-on checks in Types and Annotations",
      "Practice Type Annotations with a tiny example first.",
      ["ts-type-annotation"],
    ),
    mistake(
      "ts-types-and-annotations-mistake-2",
      "Pulling unrelated-domain demos into Types and Annotations",
      "Defaulting to out-of-domain snippets",
      "Stay inside Types and Annotations concepts.",
      ["ts-primitives"],
    ),
  ],
  exercises: [
    exercise({
      id: "ts-types-and-annotations-exercise",
      title: "Types and Annotations mini exercise",
      instructions: ["Build a small example covering Type Annotations.","Extend it with Primitive Types.","Verify behavior related to Array Types."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Types and Annotations.",
      conceptIds: ["ts-type-annotation","ts-primitives","ts-arrays"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("ts-types-and-annotations", ["ts-type-annotation","ts-primitives","ts-arrays","ts-object-types","ts-any-unknown"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const ts_interfaces_and_type_aliasesTopic = topic({
  id: "ts-interfaces-and-type-aliases",
  title: "Interfaces and Type Aliases",
  aliases: ["interfaces","type aliases"],
  description: "Model reusable shapes with interface and type aliases.",
  learningOrder: 2,
  prerequisiteIds: ["ts-types-and-annotations"],
  relatedTopicIds: ["ts-unions-and-literals"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ts-interfaces",
      title: "Interfaces",
      description: "Interfaces applied in this topic.",
    }),
    concept({
      id: "ts-type-aliases",
      title: "Type Aliases",
      description: "Type Aliases applied in this topic.",
    }),
    concept({
      id: "ts-optional-properties",
      title: "Optional Properties",
      description: "Optional Properties applied in this topic.",
    }),
    concept({
      id: "ts-readonly-properties",
      title: "Readonly Properties",
      description: "Readonly Properties applied in this topic.",
    }),
    concept({
      id: "ts-interface-extends",
      title: "Interface Extends",
      description: "Interface Extends applied in this topic.",
    }),
    concept({
      id: "ts-index-signatures",
      title: "Index Signatures",
      description: "Index Signatures applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Interfaces correctly","Explain Type Aliases in context"],
  practicalArtifacts: [
    artifact({
      id: "ts-interfaces-and-type-aliases-artifact",
      type: "code",
      title: "User and Admin shapes",
      language: "typescript",
      content: "interface User { id: string; name: string; email?: string }\ninterface Admin extends User { readonly role: \"admin\" }\nconst a: Admin = { id: \"1\", name: \"Root\", role: \"admin\" };\nconsole.log(a.role);",
      expectedOutput: "admin",
      explanation: "Extends, optional, and readonly fields.",
      conceptIds: ["ts-interfaces","ts-type-aliases","ts-optional-properties","ts-readonly-properties"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ts-interfaces-and-type-aliases-mistake-1",
      "Misapplying Interfaces",
      "Skipping hands-on checks in Interfaces and Type Aliases",
      "Practice Interfaces with a tiny example first.",
      ["ts-interfaces"],
    ),
    mistake(
      "ts-interfaces-and-type-aliases-mistake-2",
      "Pulling unrelated-domain demos into Interfaces and Type Aliases",
      "Defaulting to out-of-domain snippets",
      "Stay inside Interfaces and Type Aliases concepts.",
      ["ts-type-aliases"],
    ),
  ],
  exercises: [
    exercise({
      id: "ts-interfaces-and-type-aliases-exercise",
      title: "Interfaces and Type Aliases mini exercise",
      instructions: ["Build a small example covering Interfaces.","Extend it with Type Aliases.","Verify behavior related to Optional Properties."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Interfaces and Type Aliases.",
      conceptIds: ["ts-interfaces","ts-type-aliases","ts-optional-properties"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("ts-interfaces-and-type-aliases", ["ts-interfaces","ts-type-aliases","ts-optional-properties","ts-readonly-properties","ts-interface-extends"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const ts_unions_and_literalsTopic = topic({
  id: "ts-unions-and-literals",
  title: "Unions and Literal Types",
  aliases: ["union types","discriminated unions"],
  description: "Combine types with unions and constrain values with literals.",
  learningOrder: 3,
  prerequisiteIds: ["ts-interfaces-and-type-aliases"],
  relatedTopicIds: ["ts-functions-and-call-signatures"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ts-union-types",
      title: "Union Types",
      description: "Union Types applied in this topic.",
    }),
    concept({
      id: "ts-literal-types",
      title: "Literal Types",
      description: "Literal Types applied in this topic.",
    }),
    concept({
      id: "ts-discriminated-unions",
      title: "Discriminated Unions",
      description: "Discriminated Unions applied in this topic.",
    }),
    concept({
      id: "ts-type-narrowing-basics",
      title: "Type Narrowing Basics",
      description: "Type Narrowing Basics applied in this topic.",
    }),
    concept({
      id: "ts-never-type",
      title: "Never Type",
      description: "Never Type applied in this topic.",
    }),
    concept({
      id: "ts-exhaustiveness-checks",
      title: "Exhaustiveness Checks",
      description: "Exhaustiveness Checks applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Union Types correctly","Explain Literal Types in context"],
  practicalArtifacts: [
    artifact({
      id: "ts-unions-and-literals-artifact",
      type: "code",
      title: "Status discriminated union",
      language: "typescript",
      content: "type Status = { kind: \"ok\"; value: number } | { kind: \"err\"; message: string };\nfunction show(s: Status): string {\n  if (s.kind === \"ok\") return String(s.value);\n  return s.message;\n}\nconsole.log(show({ kind: \"ok\", value: 7 }));",
      expectedOutput: "7",
      explanation: "Literal discriminant narrows the union.",
      conceptIds: ["ts-union-types","ts-literal-types","ts-discriminated-unions","ts-type-narrowing-basics"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ts-unions-and-literals-mistake-1",
      "Misapplying Union Types",
      "Skipping hands-on checks in Unions and Literal Types",
      "Practice Union Types with a tiny example first.",
      ["ts-union-types"],
    ),
    mistake(
      "ts-unions-and-literals-mistake-2",
      "Pulling unrelated-domain demos into Unions and Literal Types",
      "Defaulting to out-of-domain snippets",
      "Stay inside Unions and Literal Types concepts.",
      ["ts-literal-types"],
    ),
  ],
  exercises: [
    exercise({
      id: "ts-unions-and-literals-exercise",
      title: "Unions and Literal Types mini exercise",
      instructions: ["Build a small example covering Union Types.","Extend it with Literal Types.","Verify behavior related to Discriminated Unions."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Unions and Literal Types.",
      conceptIds: ["ts-union-types","ts-literal-types","ts-discriminated-unions"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ts-unions-and-literals", ["ts-union-types","ts-literal-types","ts-discriminated-unions","ts-type-narrowing-basics","ts-never-type"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const ts_functions_and_call_signaturesTopic = topic({
  id: "ts-functions-and-call-signatures",
  title: "Functions and Call Signatures",
  aliases: ["function types","call signatures"],
  description: "Type parameters, returns, void/never, and callable shapes.",
  learningOrder: 4,
  prerequisiteIds: ["ts-unions-and-literals"],
  relatedTopicIds: ["ts-generics"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ts-function-types",
      title: "Function Types",
      description: "Function Types applied in this topic.",
    }),
    concept({
      id: "ts-optional-parameters",
      title: "Optional Parameters",
      description: "Optional Parameters applied in this topic.",
    }),
    concept({
      id: "ts-rest-parameters",
      title: "Rest Parameters",
      description: "Rest Parameters applied in this topic.",
    }),
    concept({
      id: "ts-void-returns",
      title: "void Returns",
      description: "void Returns applied in this topic.",
    }),
    concept({
      id: "ts-never-returns",
      title: "never Returns",
      description: "never Returns applied in this topic.",
    }),
    concept({
      id: "ts-call-signatures",
      title: "Call Signatures",
      description: "Call Signatures applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Function Types correctly","Explain Optional Parameters in context"],
  practicalArtifacts: [
    artifact({
      id: "ts-functions-and-call-signatures-artifact",
      type: "code",
      title: "Mapper function type",
      language: "typescript",
      content: "type Mapper = (n: number) => number;\nconst double: Mapper = (n) => n * 2;\nfunction applyAll(xs: number[], fn: Mapper): number[] {\n  return xs.map(fn);\n}\nconsole.log(applyAll([1, 2], double).join(\",\"));",
      expectedOutput: "2,4",
      explanation: "Reusable function type alias.",
      conceptIds: ["ts-function-types","ts-optional-parameters","ts-rest-parameters","ts-void-returns"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ts-functions-and-call-signatures-mistake-1",
      "Misapplying Function Types",
      "Skipping hands-on checks in Functions and Call Signatures",
      "Practice Function Types with a tiny example first.",
      ["ts-function-types"],
    ),
    mistake(
      "ts-functions-and-call-signatures-mistake-2",
      "Pulling unrelated-domain demos into Functions and Call Signatures",
      "Defaulting to out-of-domain snippets",
      "Stay inside Functions and Call Signatures concepts.",
      ["ts-optional-parameters"],
    ),
  ],
  exercises: [
    exercise({
      id: "ts-functions-and-call-signatures-exercise",
      title: "Functions and Call Signatures mini exercise",
      instructions: ["Build a small example covering Function Types.","Extend it with Optional Parameters.","Verify behavior related to Rest Parameters."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Functions and Call Signatures.",
      conceptIds: ["ts-function-types","ts-optional-parameters","ts-rest-parameters"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("ts-functions-and-call-signatures", ["ts-function-types","ts-optional-parameters","ts-rest-parameters","ts-void-returns","ts-never-returns"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const ts_genericsTopic = topic({
  id: "ts-generics",
  title: "Generics",
  aliases: ["typescript generics","constraints"],
  description: "Parameterize functions and types while preserving type information.",
  learningOrder: 5,
  prerequisiteIds: ["ts-functions-and-call-signatures"],
  relatedTopicIds: ["ts-narrowing-and-guards"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ts-generic-functions",
      title: "Generic Functions",
      description: "Generic Functions applied in this topic.",
    }),
    concept({
      id: "ts-generic-interfaces",
      title: "Generic Interfaces",
      description: "Generic Interfaces applied in this topic.",
    }),
    concept({
      id: "ts-constraints",
      title: "Constraints",
      description: "Constraints applied in this topic.",
    }),
    concept({
      id: "ts-default-type-parameters",
      title: "Default Type Parameters",
      description: "Default Type Parameters applied in this topic.",
    }),
    concept({
      id: "ts-keyof",
      title: "keyof",
      description: "keyof applied in this topic.",
    }),
    concept({
      id: "ts-mapped-type-intro",
      title: "Mapped Type Intro",
      description: "Mapped Type Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Generic Functions correctly","Explain Generic Interfaces in context"],
  practicalArtifacts: [
    artifact({
      id: "ts-generics-artifact",
      type: "code",
      title: "identity and pluck",
      language: "typescript",
      content: "function identity<T>(value: T): T { return value; }\nfunction pluck<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\nconsole.log(identity(3), pluck({ name: \"Ada\", score: 9 }, \"name\"));",
      expectedOutput: "3 Ada",
      explanation: "Generic identity plus keyof constraint.",
      conceptIds: ["ts-generic-functions","ts-generic-interfaces","ts-constraints","ts-default-type-parameters"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ts-generics-mistake-1",
      "Misapplying Generic Functions",
      "Skipping hands-on checks in Generics",
      "Practice Generic Functions with a tiny example first.",
      ["ts-generic-functions"],
    ),
    mistake(
      "ts-generics-mistake-2",
      "Pulling unrelated-domain demos into Generics",
      "Defaulting to out-of-domain snippets",
      "Stay inside Generics concepts.",
      ["ts-generic-interfaces"],
    ),
  ],
  exercises: [
    exercise({
      id: "ts-generics-exercise",
      title: "Generics mini exercise",
      instructions: ["Build a small example covering Generic Functions.","Extend it with Generic Interfaces.","Verify behavior related to Constraints."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Generics.",
      conceptIds: ["ts-generic-functions","ts-generic-interfaces","ts-constraints"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ts-generics", ["ts-generic-functions","ts-generic-interfaces","ts-constraints","ts-default-type-parameters","ts-keyof"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const ts_narrowing_and_guardsTopic = topic({
  id: "ts-narrowing-and-guards",
  title: "Narrowing and Type Guards",
  aliases: ["type guards","narrowing"],
  description: "Refine unions with typeof, in, instanceof, and custom predicates.",
  learningOrder: 6,
  prerequisiteIds: ["ts-generics"],
  relatedTopicIds: ["ts-utility-types"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ts-typeof-guards",
      title: "typeof Guards",
      description: "typeof Guards applied in this topic.",
    }),
    concept({
      id: "ts-in-operator",
      title: "in Operator",
      description: "in Operator applied in this topic.",
    }),
    concept({
      id: "ts-instanceof",
      title: "instanceof",
      description: "instanceof applied in this topic.",
    }),
    concept({
      id: "ts-custom-type-predicates",
      title: "Custom Type Predicates",
      description: "Custom Type Predicates applied in this topic.",
    }),
    concept({
      id: "ts-assertion-functions",
      title: "Assertion Functions",
      description: "Assertion Functions applied in this topic.",
    }),
    concept({
      id: "ts-control-flow-analysis",
      title: "Control Flow Analysis",
      description: "Control Flow Analysis applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply typeof Guards correctly","Explain in Operator in context"],
  practicalArtifacts: [
    artifact({
      id: "ts-narrowing-and-guards-artifact",
      type: "code",
      title: "isString predicate",
      language: "typescript",
      content: "function isString(v: unknown): v is string {\n  return typeof v === \"string\";\n}\nfunction len(v: unknown): number {\n  return isString(v) ? v.length : -1;\n}\nconsole.log(len(\"hi\"), len(3));",
      expectedOutput: "2 -1",
      explanation: "Custom type predicate narrows unknown.",
      conceptIds: ["ts-typeof-guards","ts-in-operator","ts-instanceof","ts-custom-type-predicates"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ts-narrowing-and-guards-mistake-1",
      "Misapplying typeof Guards",
      "Skipping hands-on checks in Narrowing and Type Guards",
      "Practice typeof Guards with a tiny example first.",
      ["ts-typeof-guards"],
    ),
    mistake(
      "ts-narrowing-and-guards-mistake-2",
      "Pulling unrelated-domain demos into Narrowing and Type Guards",
      "Defaulting to out-of-domain snippets",
      "Stay inside Narrowing and Type Guards concepts.",
      ["ts-in-operator"],
    ),
  ],
  exercises: [
    exercise({
      id: "ts-narrowing-and-guards-exercise",
      title: "Narrowing and Type Guards mini exercise",
      instructions: ["Build a small example covering typeof Guards.","Extend it with in Operator.","Verify behavior related to instanceof."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Narrowing and Type Guards.",
      conceptIds: ["ts-typeof-guards","ts-in-operator","ts-instanceof"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ts-narrowing-and-guards", ["ts-typeof-guards","ts-in-operator","ts-instanceof","ts-custom-type-predicates","ts-assertion-functions"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const ts_utility_typesTopic = topic({
  id: "ts-utility-types",
  title: "Utility Types",
  aliases: ["partial pick omit","utility types"],
  description: "Use Partial, Pick, Omit, Record, and Readonly for common transformations.",
  learningOrder: 7,
  prerequisiteIds: ["ts-narrowing-and-guards"],
  relatedTopicIds: ["ts-modules-and-tooling"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ts-partial",
      title: "Partial",
      description: "Partial applied in this topic.",
    }),
    concept({
      id: "ts-required",
      title: "Required",
      description: "Required applied in this topic.",
    }),
    concept({
      id: "ts-pick",
      title: "Pick",
      description: "Pick applied in this topic.",
    }),
    concept({
      id: "ts-omit",
      title: "Omit",
      description: "Omit applied in this topic.",
    }),
    concept({
      id: "ts-record",
      title: "Record",
      description: "Record applied in this topic.",
    }),
    concept({
      id: "ts-readonly-utility",
      title: "Readonly Utility",
      description: "Readonly Utility applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Partial correctly","Explain Required in context"],
  practicalArtifacts: [
    artifact({
      id: "ts-utility-types-artifact",
      type: "code",
      title: "Patch with Partial and Pick",
      language: "typescript",
      content: "type User = { id: string; name: string; email: string };\ntype UserPatch = Partial<Pick<User, \"name\" | \"email\">>;\nfunction apply(u: User, p: UserPatch): User {\n  return { ...u, ...p };\n}\nconsole.log(apply({ id: \"1\", name: \"A\", email: \"a@x\" }, { name: \"B\" }).name);",
      expectedOutput: "B",
      explanation: "Compose Partial and Pick for safe patches.",
      conceptIds: ["ts-partial","ts-required","ts-pick","ts-omit"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ts-utility-types-mistake-1",
      "Misapplying Partial",
      "Skipping hands-on checks in Utility Types",
      "Practice Partial with a tiny example first.",
      ["ts-partial"],
    ),
    mistake(
      "ts-utility-types-mistake-2",
      "Pulling unrelated-domain demos into Utility Types",
      "Defaulting to out-of-domain snippets",
      "Stay inside Utility Types concepts.",
      ["ts-required"],
    ),
  ],
  exercises: [
    exercise({
      id: "ts-utility-types-exercise",
      title: "Utility Types mini exercise",
      instructions: ["Build a small example covering Partial.","Extend it with Required.","Verify behavior related to Pick."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Utility Types.",
      conceptIds: ["ts-partial","ts-required","ts-pick"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ts-utility-types", ["ts-partial","ts-required","ts-pick","ts-omit","ts-record"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const ts_modules_and_toolingTopic = topic({
  id: "ts-modules-and-tooling",
  title: "Modules and Compiler Tooling",
  aliases: ["tsconfig","tsc"],
  description: "Organize ESM modules and configure tsc with tsconfig essentials.",
  learningOrder: 8,
  prerequisiteIds: ["ts-utility-types"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ts-es-modules",
      title: "ES Modules",
      description: "ES Modules applied in this topic.",
    }),
    concept({
      id: "ts-import-type",
      title: "import type",
      description: "import type applied in this topic.",
    }),
    concept({
      id: "ts-tsconfig-json",
      title: "tsconfig.json",
      description: "tsconfig.json applied in this topic.",
    }),
    concept({
      id: "ts-strict-mode",
      title: "strict Mode",
      description: "strict Mode applied in this topic.",
    }),
    concept({
      id: "ts-declaration-files",
      title: "Declaration Files",
      description: "Declaration Files applied in this topic.",
    }),
    concept({
      id: "ts-path-mapping-basics",
      title: "Path Mapping Basics",
      description: "Path Mapping Basics applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply ES Modules correctly","Explain import type in context"],
  practicalArtifacts: [
    artifact({
      id: "ts-modules-and-tooling-artifact",
      type: "configuration",
      title: "Minimal strict tsconfig",
      language: "json",
      content: "{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"module\": \"ESNext\",\n    \"strict\": true,\n    \"moduleResolution\": \"bundler\",\n    \"noEmit\": true\n  },\n  \"include\": [\"src\"]\n}",
      expectedOutput: "tsc --noEmit succeeds on typed sources",
      explanation: "Strict ESM-oriented starter tsconfig.",
      conceptIds: ["ts-es-modules","ts-import-type","ts-tsconfig-json","ts-strict-mode"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ts-modules-and-tooling-mistake-1",
      "Misapplying ES Modules",
      "Skipping hands-on checks in Modules and Compiler Tooling",
      "Practice ES Modules with a tiny example first.",
      ["ts-es-modules"],
    ),
    mistake(
      "ts-modules-and-tooling-mistake-2",
      "Pulling unrelated-domain demos into Modules and Compiler Tooling",
      "Defaulting to out-of-domain snippets",
      "Stay inside Modules and Compiler Tooling concepts.",
      ["ts-import-type"],
    ),
  ],
  exercises: [
    exercise({
      id: "ts-modules-and-tooling-exercise",
      title: "Modules and Compiler Tooling mini exercise",
      instructions: ["Build a small example covering ES Modules.","Extend it with import type.","Verify behavior related to tsconfig.json."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Modules and Compiler Tooling.",
      conceptIds: ["ts-es-modules","ts-import-type","ts-tsconfig-json"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ts-modules-and-tooling", ["ts-es-modules","ts-import-type","ts-tsconfig-json","ts-strict-mode","ts-declaration-files"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

export const typescriptKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-typescript",
  title: "TypeScript",
  aliases: ["typescript","ts","learn typescript","typescript programming","type script"],
  category: "Programming",
  description: "TypeScript curriculum covering annotations, interfaces, unions, functions, generics, narrowing, utility types, and tooling.",
  topics: [ts_types_and_annotationsTopic, ts_interfaces_and_type_aliasesTopic, ts_unions_and_literalsTopic, ts_functions_and_call_signaturesTopic, ts_genericsTopic, ts_narrowing_and_guardsTopic, ts_utility_typesTopic, ts_modules_and_toolingTopic],
});
