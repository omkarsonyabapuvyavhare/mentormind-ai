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
  "react hooks",
  "sql join",
  "python class",
  "python",
  "javascript",
  "system.out",
  "public static void main",
];

const go_syntax_and_typesTopic = topic({
  id: "go-syntax-and-types",
  title: "Go Syntax and Types",
  aliases: ["go syntax","golang types"],
  description: "Declare variables, constants, and composite literals with Go's type system.",
  learningOrder: 1,
  
  relatedTopicIds: ["go-functions-and-methods"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "go-short-variable-declaration",
      title: "Short Variable Declaration",
      description: "Short Variable Declaration applied in this topic.",
    }),
    concept({
      id: "go-basic-types",
      title: "Basic Types",
      description: "Basic Types applied in this topic.",
    }),
    concept({
      id: "go-slices",
      title: "Slices",
      description: "Slices applied in this topic.",
    }),
    concept({
      id: "go-maps",
      title: "Maps",
      description: "Maps applied in this topic.",
    }),
    concept({
      id: "go-structs-literals",
      title: "Structs Literals",
      description: "Structs Literals applied in this topic.",
    }),
    concept({
      id: "go-zero-values",
      title: "Zero Values",
      description: "Zero Values applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Short Variable Declaration correctly","Explain Basic Types in context"],
  practicalArtifacts: [
    artifact({
      id: "go-syntax-and-types-artifact",
      type: "code",
      title: "Slice and map literals",
      language: "go",
      content: "package main\nimport \"fmt\"\nfunc main() {\n  scores := []int{90, 80}\n  m := map[string]int{\"ada\": 95}\n  fmt.Println(scores[0], m[\"ada\"])\n}",
      expectedOutput: "90 95",
      explanation: "Slice and map composite literals.",
      conceptIds: ["go-short-variable-declaration","go-basic-types","go-slices","go-maps"],
    }),
  ],
  commonMistakes: [
    mistake(
      "go-syntax-and-types-mistake-1",
      "Misapplying Short Variable Declaration",
      "Skipping hands-on checks in Go Syntax and Types",
      "Practice Short Variable Declaration with a tiny example first.",
      ["go-short-variable-declaration"],
    ),
    mistake(
      "go-syntax-and-types-mistake-2",
      "Pulling unrelated-domain demos into Go Syntax and Types",
      "Defaulting to out-of-domain snippets",
      "Stay inside Go Syntax and Types concepts.",
      ["go-basic-types"],
    ),
  ],
  exercises: [
    exercise({
      id: "go-syntax-and-types-exercise",
      title: "Go Syntax and Types mini exercise",
      instructions: ["Build a small example covering Short Variable Declaration.","Extend it with Basic Types.","Verify behavior related to Slices."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Go Syntax and Types.",
      conceptIds: ["go-short-variable-declaration","go-basic-types","go-slices"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("go-syntax-and-types", ["go-short-variable-declaration","go-basic-types","go-slices","go-maps","go-structs-literals"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const go_functions_and_methodsTopic = topic({
  id: "go-functions-and-methods",
  title: "Functions and Methods",
  aliases: ["go functions","go methods"],
  description: "Write functions with multiple returns and attach methods to types.",
  learningOrder: 2,
  prerequisiteIds: ["go-syntax-and-types"],
  relatedTopicIds: ["go-structs-and-interfaces"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "go-functions",
      title: "Functions",
      description: "Functions applied in this topic.",
    }),
    concept({
      id: "go-multiple-returns",
      title: "Multiple Returns",
      description: "Multiple Returns applied in this topic.",
    }),
    concept({
      id: "go-named-results",
      title: "Named Results",
      description: "Named Results applied in this topic.",
    }),
    concept({
      id: "go-methods",
      title: "Methods",
      description: "Methods applied in this topic.",
    }),
    concept({
      id: "go-pointer-receivers",
      title: "Pointer Receivers",
      description: "Pointer Receivers applied in this topic.",
    }),
    concept({
      id: "go-variadic-parameters",
      title: "Variadic Parameters",
      description: "Variadic Parameters applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Functions correctly","Explain Multiple Returns in context"],
  practicalArtifacts: [
    artifact({
      id: "go-functions-and-methods-artifact",
      type: "code",
      title: "Functions and Methods worked example",
      
      content: "// Practical example for Functions and Methods\n// Covers: Functions, Multiple Returns, Named Results",
      
      explanation: "Demonstrates Functions, Multiple Returns, Named Results.",
      conceptIds: ["go-functions","go-multiple-returns","go-named-results","go-methods"],
    }),
  ],
  commonMistakes: [
    mistake(
      "go-functions-and-methods-mistake-1",
      "Misapplying Functions",
      "Skipping hands-on checks in Functions and Methods",
      "Practice Functions with a tiny example first.",
      ["go-functions"],
    ),
    mistake(
      "go-functions-and-methods-mistake-2",
      "Pulling unrelated-domain demos into Functions and Methods",
      "Defaulting to out-of-domain snippets",
      "Stay inside Functions and Methods concepts.",
      ["go-multiple-returns"],
    ),
  ],
  exercises: [
    exercise({
      id: "go-functions-and-methods-exercise",
      title: "Functions and Methods mini exercise",
      instructions: ["Build a small example covering Functions.","Extend it with Multiple Returns.","Verify behavior related to Named Results."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Functions and Methods.",
      conceptIds: ["go-functions","go-multiple-returns","go-named-results"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("go-functions-and-methods", ["go-functions","go-multiple-returns","go-named-results","go-methods","go-pointer-receivers"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const go_structs_and_interfacesTopic = topic({
  id: "go-structs-and-interfaces",
  title: "Structs and Interfaces",
  aliases: ["go interfaces","go structs"],
  description: "Compose data with structs and behavior with implicit interfaces.",
  learningOrder: 3,
  prerequisiteIds: ["go-functions-and-methods"],
  relatedTopicIds: ["go-concurrency-basics"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "go-struct-fields",
      title: "Struct Fields",
      description: "Struct Fields applied in this topic.",
    }),
    concept({
      id: "go-embedding",
      title: "Embedding",
      description: "Embedding applied in this topic.",
    }),
    concept({
      id: "go-interfaces",
      title: "Interfaces",
      description: "Interfaces applied in this topic.",
    }),
    concept({
      id: "go-implicit-satisfaction",
      title: "Implicit Satisfaction",
      description: "Implicit Satisfaction applied in this topic.",
    }),
    concept({
      id: "go-empty-interface",
      title: "Empty Interface",
      description: "Empty Interface applied in this topic.",
    }),
    concept({
      id: "go-type-assertions",
      title: "Type Assertions",
      description: "Type Assertions applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Struct Fields correctly","Explain Embedding in context"],
  practicalArtifacts: [
    artifact({
      id: "go-structs-and-interfaces-artifact",
      type: "code",
      title: "Structs and Interfaces worked example",
      
      content: "// Practical example for Structs and Interfaces\n// Covers: Struct Fields, Embedding, Interfaces",
      
      explanation: "Demonstrates Struct Fields, Embedding, Interfaces.",
      conceptIds: ["go-struct-fields","go-embedding","go-interfaces","go-implicit-satisfaction"],
    }),
  ],
  commonMistakes: [
    mistake(
      "go-structs-and-interfaces-mistake-1",
      "Misapplying Struct Fields",
      "Skipping hands-on checks in Structs and Interfaces",
      "Practice Struct Fields with a tiny example first.",
      ["go-struct-fields"],
    ),
    mistake(
      "go-structs-and-interfaces-mistake-2",
      "Pulling unrelated-domain demos into Structs and Interfaces",
      "Defaulting to out-of-domain snippets",
      "Stay inside Structs and Interfaces concepts.",
      ["go-embedding"],
    ),
  ],
  exercises: [
    exercise({
      id: "go-structs-and-interfaces-exercise",
      title: "Structs and Interfaces mini exercise",
      instructions: ["Build a small example covering Struct Fields.","Extend it with Embedding.","Verify behavior related to Interfaces."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Structs and Interfaces.",
      conceptIds: ["go-struct-fields","go-embedding","go-interfaces"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("go-structs-and-interfaces", ["go-struct-fields","go-embedding","go-interfaces","go-implicit-satisfaction","go-empty-interface"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const go_concurrency_basicsTopic = topic({
  id: "go-concurrency-basics",
  title: "Goroutines and Channels",
  aliases: ["goroutines","channels"],
  description: "Launch goroutines and coordinate with channels.",
  learningOrder: 4,
  prerequisiteIds: ["go-structs-and-interfaces"],
  relatedTopicIds: ["go-packages-and-modules"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "go-goroutines",
      title: "goroutines",
      description: "goroutines applied in this topic.",
    }),
    concept({
      id: "go-channels",
      title: "Channels",
      description: "Channels applied in this topic.",
    }),
    concept({
      id: "go-buffered-channels",
      title: "Buffered Channels",
      description: "Buffered Channels applied in this topic.",
    }),
    concept({
      id: "go-select",
      title: "select",
      description: "select applied in this topic.",
    }),
    concept({
      id: "go-waitgroup-intro",
      title: "WaitGroup Intro",
      description: "WaitGroup Intro applied in this topic.",
    }),
    concept({
      id: "go-race-awareness",
      title: "Race Awareness",
      description: "Race Awareness applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply goroutines correctly","Explain Channels in context"],
  practicalArtifacts: [
    artifact({
      id: "go-concurrency-basics-artifact",
      type: "code",
      title: "Channel handoff",
      language: "go",
      content: "package main\nimport \"fmt\"\nfunc main() {\n  ch := make(chan string, 1)\n  ch <- \"ready\"\n  fmt.Println(<-ch)\n}",
      expectedOutput: "ready",
      explanation: "Buffered channel send/receive.",
      conceptIds: ["go-goroutines","go-channels","go-buffered-channels","go-select"],
    }),
  ],
  commonMistakes: [
    mistake(
      "go-concurrency-basics-mistake-1",
      "Misapplying goroutines",
      "Skipping hands-on checks in Goroutines and Channels",
      "Practice goroutines with a tiny example first.",
      ["go-goroutines"],
    ),
    mistake(
      "go-concurrency-basics-mistake-2",
      "Pulling unrelated-domain demos into Goroutines and Channels",
      "Defaulting to out-of-domain snippets",
      "Stay inside Goroutines and Channels concepts.",
      ["go-channels"],
    ),
  ],
  exercises: [
    exercise({
      id: "go-concurrency-basics-exercise",
      title: "Goroutines and Channels mini exercise",
      instructions: ["Build a small example covering goroutines.","Extend it with Channels.","Verify behavior related to Buffered Channels."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Goroutines and Channels.",
      conceptIds: ["go-goroutines","go-channels","go-buffered-channels"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("go-concurrency-basics", ["go-goroutines","go-channels","go-buffered-channels","go-select","go-waitgroup-intro"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const go_packages_and_modulesTopic = topic({
  id: "go-packages-and-modules",
  title: "Packages and Modules",
  aliases: ["go modules","go.mod"],
  description: "Organize code with packages and go.mod module paths.",
  learningOrder: 5,
  prerequisiteIds: ["go-concurrency-basics"],
  relatedTopicIds: ["go-errors-and-testing"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "go-packages",
      title: "Packages",
      description: "Packages applied in this topic.",
    }),
    concept({
      id: "go-exports",
      title: "Exports",
      description: "Exports applied in this topic.",
    }),
    concept({
      id: "go-go-mod",
      title: "go.mod",
      description: "go.mod applied in this topic.",
    }),
    concept({
      id: "go-go-get",
      title: "go get",
      description: "go get applied in this topic.",
    }),
    concept({
      id: "go-internal-packages",
      title: "Internal Packages",
      description: "Internal Packages applied in this topic.",
    }),
    concept({
      id: "go-init-functions",
      title: "init Functions",
      description: "init Functions applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Packages correctly","Explain Exports in context"],
  practicalArtifacts: [
    artifact({
      id: "go-packages-and-modules-artifact",
      type: "code",
      title: "Packages and Modules worked example",
      
      content: "// Practical example for Packages and Modules\n// Covers: Packages, Exports, go.mod",
      
      explanation: "Demonstrates Packages, Exports, go.mod.",
      conceptIds: ["go-packages","go-exports","go-go-mod","go-go-get"],
    }),
  ],
  commonMistakes: [
    mistake(
      "go-packages-and-modules-mistake-1",
      "Misapplying Packages",
      "Skipping hands-on checks in Packages and Modules",
      "Practice Packages with a tiny example first.",
      ["go-packages"],
    ),
    mistake(
      "go-packages-and-modules-mistake-2",
      "Pulling unrelated-domain demos into Packages and Modules",
      "Defaulting to out-of-domain snippets",
      "Stay inside Packages and Modules concepts.",
      ["go-exports"],
    ),
  ],
  exercises: [
    exercise({
      id: "go-packages-and-modules-exercise",
      title: "Packages and Modules mini exercise",
      instructions: ["Build a small example covering Packages.","Extend it with Exports.","Verify behavior related to go.mod."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Packages and Modules.",
      conceptIds: ["go-packages","go-exports","go-go-mod"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("go-packages-and-modules", ["go-packages","go-exports","go-go-mod","go-go-get","go-internal-packages"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const go_errors_and_testingTopic = topic({
  id: "go-errors-and-testing",
  title: "Errors and Testing",
  aliases: ["go errors","go testing"],
  description: "Propagate errors explicitly and write table-driven tests.",
  learningOrder: 6,
  prerequisiteIds: ["go-packages-and-modules"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "go-error-interface",
      title: "error Interface",
      description: "error Interface applied in this topic.",
    }),
    concept({
      id: "go-fmt-errorf",
      title: "fmt.Errorf",
      description: "fmt.Errorf applied in this topic.",
    }),
    concept({
      id: "go-errors-is-as",
      title: "errors.Is/As",
      description: "errors.Is/As applied in this topic.",
    }),
    concept({
      id: "go-defer",
      title: "defer",
      description: "defer applied in this topic.",
    }),
    concept({
      id: "go-testing-package",
      title: "testing Package",
      description: "testing Package applied in this topic.",
    }),
    concept({
      id: "go-table-driven-tests",
      title: "Table-Driven Tests",
      description: "Table-Driven Tests applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply error Interface correctly","Explain fmt.Errorf in context"],
  practicalArtifacts: [
    artifact({
      id: "go-errors-and-testing-artifact",
      type: "code",
      title: "Errors and Testing worked example",
      
      content: "// Practical example for Errors and Testing\n// Covers: error Interface, fmt.Errorf, errors.Is/As",
      
      explanation: "Demonstrates error Interface, fmt.Errorf, errors.Is/As.",
      conceptIds: ["go-error-interface","go-fmt-errorf","go-errors-is-as","go-defer"],
    }),
  ],
  commonMistakes: [
    mistake(
      "go-errors-and-testing-mistake-1",
      "Misapplying error Interface",
      "Skipping hands-on checks in Errors and Testing",
      "Practice error Interface with a tiny example first.",
      ["go-error-interface"],
    ),
    mistake(
      "go-errors-and-testing-mistake-2",
      "Pulling unrelated-domain demos into Errors and Testing",
      "Defaulting to out-of-domain snippets",
      "Stay inside Errors and Testing concepts.",
      ["go-fmt-errorf"],
    ),
  ],
  exercises: [
    exercise({
      id: "go-errors-and-testing-exercise",
      title: "Errors and Testing mini exercise",
      instructions: ["Build a small example covering error Interface.","Extend it with fmt.Errorf.","Verify behavior related to errors.Is/As."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Errors and Testing.",
      conceptIds: ["go-error-interface","go-fmt-errorf","go-errors-is-as"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("go-errors-and-testing", ["go-error-interface","go-fmt-errorf","go-errors-is-as","go-defer","go-testing-package"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

export const goKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-go",
  title: "Go",
  aliases: ["go", "golang", "learn go", "learn golang", "go programming", "go language"],
  category: "Programming",
  description: "Go starter curriculum covering syntax, functions, structs/interfaces, concurrency basics, packages, and errors.",
  topics: [go_syntax_and_typesTopic, go_functions_and_methodsTopic, go_structs_and_interfacesTopic, go_concurrency_basicsTopic, go_packages_and_modulesTopic, go_errors_and_testingTopic],
});
