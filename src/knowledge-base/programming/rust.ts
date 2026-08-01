import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","react hooks","sql join","python class"];

const rust_syntax_and_ownershipTopic = topic({
  id: "rust-syntax-and-ownership",
  title: "Syntax and Ownership",
  aliases: ["rust ownership","rust syntax"],
  description: "Bind values with let and reason about ownership moves.",
  learningOrder: 1,
  
  relatedTopicIds: ["rust-borrowing-and-references"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "rust-let-bindings",
      title: "let Bindings",
      description: "let Bindings applied in this topic.",
    }),
    concept({
      id: "rust-ownership",
      title: "Ownership",
      description: "Ownership applied in this topic.",
    }),
    concept({
      id: "rust-move-semantics",
      title: "Move Semantics",
      description: "Move Semantics applied in this topic.",
    }),
    concept({
      id: "rust-clone",
      title: "Clone",
      description: "Clone applied in this topic.",
    }),
    concept({
      id: "rust-stack-vs-heap",
      title: "Stack vs Heap",
      description: "Stack vs Heap applied in this topic.",
    }),
    concept({
      id: "rust-drop",
      title: "Drop",
      description: "Drop applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply let Bindings correctly","Explain Ownership in context"],
  practicalArtifacts: [
    artifact({
      id: "rust-syntax-and-ownership-artifact",
      type: "code",
      title: "Ownership move",
      language: "rust",
      content: "fn main() {\n  let s = String::from(\"hi\");\n  let t = s;\n  println!(\"{t}\");\n}",
      expectedOutput: "hi",
      explanation: "String ownership moves from s to t.",
      conceptIds: ["rust-let-bindings","rust-ownership","rust-move-semantics","rust-clone"],
    }),
  ],
  commonMistakes: [
    mistake(
      "rust-syntax-and-ownership-mistake-1",
      "Misapplying let Bindings",
      "Skipping hands-on checks in Syntax and Ownership",
      "Practice let Bindings with a tiny example first.",
      ["rust-let-bindings"],
    ),
    mistake(
      "rust-syntax-and-ownership-mistake-2",
      "Pulling unrelated-domain demos into Syntax and Ownership",
      "Defaulting to out-of-domain snippets",
      "Stay inside Syntax and Ownership concepts.",
      ["rust-ownership"],
    ),
  ],
  exercises: [
    exercise({
      id: "rust-syntax-and-ownership-exercise",
      title: "Syntax and Ownership mini exercise",
      instructions: ["Build a small example covering let Bindings.","Extend it with Ownership.","Verify behavior related to Move Semantics."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Syntax and Ownership.",
      conceptIds: ["rust-let-bindings","rust-ownership","rust-move-semantics"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("rust-syntax-and-ownership", ["rust-let-bindings","rust-ownership","rust-move-semantics","rust-clone","rust-stack-vs-heap"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const rust_borrowing_and_referencesTopic = topic({
  id: "rust-borrowing-and-references",
  title: "Borrowing and References",
  aliases: ["borrowing","references"],
  description: "Share data with shared and mutable references under borrow rules.",
  learningOrder: 2,
  prerequisiteIds: ["rust-syntax-and-ownership"],
  relatedTopicIds: ["rust-structs-and-enums"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "rust-shared-references",
      title: "Shared References",
      description: "Shared References applied in this topic.",
    }),
    concept({
      id: "rust-mutable-references",
      title: "Mutable References",
      description: "Mutable References applied in this topic.",
    }),
    concept({
      id: "rust-borrow-checker",
      title: "Borrow Checker",
      description: "Borrow Checker applied in this topic.",
    }),
    concept({
      id: "rust-slices",
      title: "Slices",
      description: "Slices applied in this topic.",
    }),
    concept({
      id: "rust-lifetime-intro",
      title: "Lifetime Intro",
      description: "Lifetime Intro applied in this topic.",
    }),
    concept({
      id: "rust-dangling-prevention",
      title: "Dangling Prevention",
      description: "Dangling Prevention applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Shared References correctly","Explain Mutable References in context"],
  practicalArtifacts: [
    artifact({
      id: "rust-borrowing-and-references-artifact",
      type: "code",
      title: "Borrowing and References worked example",
      
      content: "// Practical example for Borrowing and References\n// Covers: Shared References, Mutable References, Borrow Checker",
      
      explanation: "Demonstrates Shared References, Mutable References, Borrow Checker.",
      conceptIds: ["rust-shared-references","rust-mutable-references","rust-borrow-checker","rust-slices"],
    }),
  ],
  commonMistakes: [
    mistake(
      "rust-borrowing-and-references-mistake-1",
      "Misapplying Shared References",
      "Skipping hands-on checks in Borrowing and References",
      "Practice Shared References with a tiny example first.",
      ["rust-shared-references"],
    ),
    mistake(
      "rust-borrowing-and-references-mistake-2",
      "Pulling unrelated-domain demos into Borrowing and References",
      "Defaulting to out-of-domain snippets",
      "Stay inside Borrowing and References concepts.",
      ["rust-mutable-references"],
    ),
  ],
  exercises: [
    exercise({
      id: "rust-borrowing-and-references-exercise",
      title: "Borrowing and References mini exercise",
      instructions: ["Build a small example covering Shared References.","Extend it with Mutable References.","Verify behavior related to Borrow Checker."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Borrowing and References.",
      conceptIds: ["rust-shared-references","rust-mutable-references","rust-borrow-checker"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("rust-borrowing-and-references", ["rust-shared-references","rust-mutable-references","rust-borrow-checker","rust-slices","rust-lifetime-intro"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const rust_structs_and_enumsTopic = topic({
  id: "rust-structs-and-enums",
  title: "Structs and Enums",
  aliases: ["rust enums","option match"],
  description: "Model data with structs, enums, and pattern matching.",
  learningOrder: 3,
  prerequisiteIds: ["rust-borrowing-and-references"],
  relatedTopicIds: ["rust-error-handling"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "rust-structs",
      title: "Structs",
      description: "Structs applied in this topic.",
    }),
    concept({
      id: "rust-impl-blocks",
      title: "impl Blocks",
      description: "impl Blocks applied in this topic.",
    }),
    concept({
      id: "rust-enums",
      title: "Enums",
      description: "Enums applied in this topic.",
    }),
    concept({
      id: "rust-option",
      title: "Option",
      description: "Option applied in this topic.",
    }),
    concept({
      id: "rust-match",
      title: "match",
      description: "match applied in this topic.",
    }),
    concept({
      id: "rust-if-let",
      title: "if let",
      description: "if let applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Structs correctly","Explain impl Blocks in context"],
  practicalArtifacts: [
    artifact({
      id: "rust-structs-and-enums-artifact",
      type: "code",
      title: "Structs and Enums worked example",
      
      content: "// Practical example for Structs and Enums\n// Covers: Structs, impl Blocks, Enums",
      
      explanation: "Demonstrates Structs, impl Blocks, Enums.",
      conceptIds: ["rust-structs","rust-impl-blocks","rust-enums","rust-option"],
    }),
  ],
  commonMistakes: [
    mistake(
      "rust-structs-and-enums-mistake-1",
      "Misapplying Structs",
      "Skipping hands-on checks in Structs and Enums",
      "Practice Structs with a tiny example first.",
      ["rust-structs"],
    ),
    mistake(
      "rust-structs-and-enums-mistake-2",
      "Pulling unrelated-domain demos into Structs and Enums",
      "Defaulting to out-of-domain snippets",
      "Stay inside Structs and Enums concepts.",
      ["rust-impl-blocks"],
    ),
  ],
  exercises: [
    exercise({
      id: "rust-structs-and-enums-exercise",
      title: "Structs and Enums mini exercise",
      instructions: ["Build a small example covering Structs.","Extend it with impl Blocks.","Verify behavior related to Enums."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Structs and Enums.",
      conceptIds: ["rust-structs","rust-impl-blocks","rust-enums"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("rust-structs-and-enums", ["rust-structs","rust-impl-blocks","rust-enums","rust-option","rust-match"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const rust_error_handlingTopic = topic({
  id: "rust-error-handling",
  title: "Error Handling with Result",
  aliases: ["rust result","rust errors"],
  description: "Propagate recoverable errors with Result and the ? operator.",
  learningOrder: 4,
  prerequisiteIds: ["rust-structs-and-enums"],
  relatedTopicIds: ["rust-collections-and-iterators"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "rust-result",
      title: "Result",
      description: "Result applied in this topic.",
    }),
    concept({
      id: "rust-operator",
      title: "? Operator",
      description: "? Operator applied in this topic.",
    }),
    concept({
      id: "rust-map-err",
      title: "map_err",
      description: "map_err applied in this topic.",
    }),
    concept({
      id: "rust-anyhow-intro",
      title: "anyhow Intro",
      description: "anyhow Intro applied in this topic.",
    }),
    concept({
      id: "rust-panic-vs-result",
      title: "panic vs Result",
      description: "panic vs Result applied in this topic.",
    }),
    concept({
      id: "rust-custom-error-types",
      title: "Custom Error Types",
      description: "Custom Error Types applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Result correctly","Explain ? Operator in context"],
  practicalArtifacts: [
    artifact({
      id: "rust-error-handling-artifact",
      type: "code",
      title: "Error Handling with Result worked example",
      
      content: "// Practical example for Error Handling with Result\n// Covers: Result, ? Operator, map_err",
      
      explanation: "Demonstrates Result, ? Operator, map_err.",
      conceptIds: ["rust-result","rust-operator","rust-map-err","rust-anyhow-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "rust-error-handling-mistake-1",
      "Misapplying Result",
      "Skipping hands-on checks in Error Handling with Result",
      "Practice Result with a tiny example first.",
      ["rust-result"],
    ),
    mistake(
      "rust-error-handling-mistake-2",
      "Pulling unrelated-domain demos into Error Handling with Result",
      "Defaulting to out-of-domain snippets",
      "Stay inside Error Handling with Result concepts.",
      ["rust-operator"],
    ),
  ],
  exercises: [
    exercise({
      id: "rust-error-handling-exercise",
      title: "Error Handling with Result mini exercise",
      instructions: ["Build a small example covering Result.","Extend it with ? Operator.","Verify behavior related to map_err."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Error Handling with Result.",
      conceptIds: ["rust-result","rust-operator","rust-map-err"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("rust-error-handling", ["rust-result","rust-operator","rust-map-err","rust-anyhow-intro","rust-panic-vs-result"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const rust_collections_and_iteratorsTopic = topic({
  id: "rust-collections-and-iterators",
  title: "Collections and Iterators",
  aliases: ["rust iterators","vec hashmap"],
  description: "Use Vec/HashMap and transform data with iterators.",
  learningOrder: 5,
  prerequisiteIds: ["rust-error-handling"],
  relatedTopicIds: ["rust-cargo-and-modules"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "rust-vec",
      title: "Vec",
      description: "Vec applied in this topic.",
    }),
    concept({
      id: "rust-hashmap",
      title: "HashMap",
      description: "HashMap applied in this topic.",
    }),
    concept({
      id: "rust-iterators",
      title: "Iterators",
      description: "Iterators applied in this topic.",
    }),
    concept({
      id: "rust-map-filter",
      title: "map/filter",
      description: "map/filter applied in this topic.",
    }),
    concept({
      id: "rust-collect",
      title: "collect",
      description: "collect applied in this topic.",
    }),
    concept({
      id: "rust-ownership-in-iteration",
      title: "Ownership in Iteration",
      description: "Ownership in Iteration applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Vec correctly","Explain HashMap in context"],
  practicalArtifacts: [
    artifact({
      id: "rust-collections-and-iterators-artifact",
      type: "code",
      title: "Collections and Iterators worked example",
      
      content: "// Practical example for Collections and Iterators\n// Covers: Vec, HashMap, Iterators",
      
      explanation: "Demonstrates Vec, HashMap, Iterators.",
      conceptIds: ["rust-vec","rust-hashmap","rust-iterators","rust-map-filter"],
    }),
  ],
  commonMistakes: [
    mistake(
      "rust-collections-and-iterators-mistake-1",
      "Misapplying Vec",
      "Skipping hands-on checks in Collections and Iterators",
      "Practice Vec with a tiny example first.",
      ["rust-vec"],
    ),
    mistake(
      "rust-collections-and-iterators-mistake-2",
      "Pulling unrelated-domain demos into Collections and Iterators",
      "Defaulting to out-of-domain snippets",
      "Stay inside Collections and Iterators concepts.",
      ["rust-hashmap"],
    ),
  ],
  exercises: [
    exercise({
      id: "rust-collections-and-iterators-exercise",
      title: "Collections and Iterators mini exercise",
      instructions: ["Build a small example covering Vec.","Extend it with HashMap.","Verify behavior related to Iterators."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Collections and Iterators.",
      conceptIds: ["rust-vec","rust-hashmap","rust-iterators"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("rust-collections-and-iterators", ["rust-vec","rust-hashmap","rust-iterators","rust-map-filter","rust-collect"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const rust_cargo_and_modulesTopic = topic({
  id: "rust-cargo-and-modules",
  title: "Cargo and Modules",
  aliases: ["cargo","rust modules"],
  description: "Build crates with Cargo and organize modules/visibility.",
  learningOrder: 6,
  prerequisiteIds: ["rust-collections-and-iterators"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "rust-cargo-toml",
      title: "Cargo.toml",
      description: "Cargo.toml applied in this topic.",
    }),
    concept({
      id: "rust-cargo-build-test",
      title: "cargo build/test",
      description: "cargo build/test applied in this topic.",
    }),
    concept({
      id: "rust-modules",
      title: "Modules",
      description: "Modules applied in this topic.",
    }),
    concept({
      id: "rust-use-paths",
      title: "use Paths",
      description: "use Paths applied in this topic.",
    }),
    concept({
      id: "rust-pub-visibility",
      title: "pub Visibility",
      description: "pub Visibility applied in this topic.",
    }),
    concept({
      id: "rust-crates",
      title: "Crates",
      description: "Crates applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Cargo.toml correctly","Explain cargo build/test in context"],
  practicalArtifacts: [
    artifact({
      id: "rust-cargo-and-modules-artifact",
      type: "code",
      title: "Cargo and Modules worked example",
      
      content: "// Practical example for Cargo and Modules\n// Covers: Cargo.toml, cargo build/test, Modules",
      
      explanation: "Demonstrates Cargo.toml, cargo build/test, Modules.",
      conceptIds: ["rust-cargo-toml","rust-cargo-build-test","rust-modules","rust-use-paths"],
    }),
  ],
  commonMistakes: [
    mistake(
      "rust-cargo-and-modules-mistake-1",
      "Misapplying Cargo.toml",
      "Skipping hands-on checks in Cargo and Modules",
      "Practice Cargo.toml with a tiny example first.",
      ["rust-cargo-toml"],
    ),
    mistake(
      "rust-cargo-and-modules-mistake-2",
      "Pulling unrelated-domain demos into Cargo and Modules",
      "Defaulting to out-of-domain snippets",
      "Stay inside Cargo and Modules concepts.",
      ["rust-cargo-build-test"],
    ),
  ],
  exercises: [
    exercise({
      id: "rust-cargo-and-modules-exercise",
      title: "Cargo and Modules mini exercise",
      instructions: ["Build a small example covering Cargo.toml.","Extend it with cargo build/test.","Verify behavior related to Modules."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Cargo and Modules.",
      conceptIds: ["rust-cargo-toml","rust-cargo-build-test","rust-modules"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("rust-cargo-and-modules", ["rust-cargo-toml","rust-cargo-build-test","rust-modules","rust-use-paths","rust-pub-visibility"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

export const rustKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-rust",
  title: "Rust",
  aliases: ["rust","learn rust","rust programming","rustlang"],
  category: "Programming",
  description: "Rust starter curriculum covering ownership, borrowing, structs/enums, error handling, collections, and cargo tooling.",
  topics: [rust_syntax_and_ownershipTopic, rust_borrowing_and_referencesTopic, rust_structs_and_enumsTopic, rust_error_handlingTopic, rust_collections_and_iteratorsTopic, rust_cargo_and_modulesTopic],
});
