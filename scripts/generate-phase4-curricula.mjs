/**
 * Phase 4 curriculum expander — writes Zod-valid knowledge graphs from outlines.
 * Run: node scripts/generate-phase4-curricula.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "src", "knowledge-base");

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function conceptId(prefix, title) {
  return `${prefix}-${slug(title)}`;
}

function normalizeConcepts(prefix, concepts) {
  return concepts.map((c) => {
    if (typeof c === "string") {
      return {
        id: conceptId(prefix, c),
        title: c,
        description: `${c} applied in this topic.`,
        examples: [],
        commonMistakes: [],
        prerequisiteConceptIds: [],
        relatedConceptIds: [],
      };
    }
    return {
      id: c.id || conceptId(prefix, c.title),
      title: c.title,
      description: c.description || `${c.title} applied in this topic.`,
      examples: c.examples || [],
      commonMistakes: c.commonMistakes || [],
      prerequisiteConceptIds: c.prerequisiteConceptIds || [],
      relatedConceptIds: c.relatedConceptIds || [],
      difficulty: c.difficulty,
    };
  });
}

function renderConcept(c) {
  const lines = [
    `id: "${c.id}"`,
    `title: ${JSON.stringify(c.title)}`,
    `description: ${JSON.stringify(c.description)}`,
  ];
  if (c.difficulty) lines.push(`difficulty: "${c.difficulty}"`);
  if (c.prerequisiteConceptIds?.length) {
    lines.push(`prerequisiteConceptIds: ${JSON.stringify(c.prerequisiteConceptIds)}`);
  }
  if (c.relatedConceptIds?.length) {
    lines.push(`relatedConceptIds: ${JSON.stringify(c.relatedConceptIds)}`);
  }
  if (c.examples?.length) {
    const ex = c.examples
      .map((e) => {
        const parts = [
          `title: ${JSON.stringify(e.title)}`,
          `content: ${JSON.stringify(e.content)}`,
        ];
        if (e.language) parts.push(`language: ${JSON.stringify(e.language)}`);
        if (e.explanation) parts.push(`explanation: ${JSON.stringify(e.explanation)}`);
        return `{ ${parts.join(", ")} }`;
      })
      .join(", ");
    lines.push(`examples: [${ex}]`);
  }
  if (c.commonMistakes?.length) {
    lines.push(`commonMistakes: ${JSON.stringify(c.commonMistakes)}`);
  }
  return `    concept({\n      ${lines.join(",\n      ")},\n    })`;
}

function renderTopic(prefix, t, skillTypes) {
  const concepts = normalizeConcepts(prefix, t.concepts);
  const conceptIds = concepts.map((c) => c.id);
  const skillIds = [...conceptIds.slice(0, 5)];
  while (skillIds.length < 5) skillIds.push(conceptIds[skillIds.length % conceptIds.length]);

  const art = t.artifact || {
    type: "code",
    title: `${t.title} worked example`,
    content: `// Practical example for ${t.title}\n// Covers: ${concepts
      .slice(0, 3)
      .map((c) => c.title)
      .join(", ")}`,
    explanation: `Demonstrates ${concepts
      .slice(0, 3)
      .map((c) => c.title)
      .join(", ")}.`,
  };

  const mistakes = t.mistakes || [
    [
      `Misapplying ${concepts[0].title}`,
      `Skipping hands-on checks in ${t.title}`,
      `Practice ${concepts[0].title} with a tiny example first.`,
      [conceptIds[0]],
    ],
    [
      `Pulling unrelated-domain demos into ${t.title}`,
      "Defaulting to out-of-domain snippets",
      `Stay inside ${t.title} concepts.`,
      [conceptIds[Math.min(1, conceptIds.length - 1)]],
    ],
  ];

  const ex = t.exercise || {
    title: `${t.title} mini exercise`,
    instructions: [
      `Build a small example covering ${concepts[0].title}.`,
      `Extend it with ${concepts[1].title}.`,
      `Verify behavior related to ${concepts[2].title}.`,
    ],
    hints: ["Keep scope tiny", "Stay in-domain"],
    expectedOutcome: `A working micro-example for ${t.title}.`,
  };

  const skillTypesArg = skillTypes ? `,\n    ${JSON.stringify(skillTypes)}` : "";

  return `const ${t.varName} = topic({
  id: "${t.id}",
  title: ${JSON.stringify(t.title)},
  aliases: ${JSON.stringify(t.aliases || [])},
  description: ${JSON.stringify(t.description)},
  learningOrder: ${t.order},
  ${t.prereqs?.length ? `prerequisiteIds: ${JSON.stringify(t.prereqs)},` : ""}
  ${t.related?.length ? `relatedTopicIds: ${JSON.stringify(t.related)},` : ""}
  ${t.difficulty ? `difficulty: "${t.difficulty}",` : ""}
  contaminationTerms: CONTAMINATION,
  concepts: [
${concepts.map(renderConcept).join(",\n")},
  ],
  learningObjectives: ${JSON.stringify(
    t.objectives || [
      `Apply ${concepts[0].title} correctly`,
      `Explain ${concepts[1].title} in context`,
    ],
  )},
  practicalArtifacts: [
    artifact({
      id: "${t.id}-artifact",
      type: "${art.type || "code"}",
      title: ${JSON.stringify(art.title)},
      ${art.language ? `language: ${JSON.stringify(art.language)},` : ""}
      content: ${JSON.stringify(art.content)},
      ${art.expectedOutput ? `expectedOutput: ${JSON.stringify(art.expectedOutput)},` : ""}
      explanation: ${JSON.stringify(art.explanation)},
      conceptIds: ${JSON.stringify(conceptIds.slice(0, Math.min(4, conceptIds.length)))},
    }),
  ],
  commonMistakes: [
${mistakes
  .map(
    (m, i) => `    mistake(
      "${t.id}-mistake-${i + 1}",
      ${JSON.stringify(m[0])},
      ${JSON.stringify(m[1])},
      ${JSON.stringify(m[2])},
      ${JSON.stringify(m[3])},
    )`,
  )
  .join(",\n")},
  ],
  exercises: [
    exercise({
      id: "${t.id}-exercise",
      title: ${JSON.stringify(ex.title)},
      instructions: ${JSON.stringify(ex.instructions)},
      hints: ${JSON.stringify(ex.hints)},
      expectedOutcome: ${JSON.stringify(ex.expectedOutcome)},
      conceptIds: ${JSON.stringify(conceptIds.slice(0, 3))},
      ${
        t.difficulty === "advanced" || t.difficulty === "intermediate"
          ? `difficulty: "${t.difficulty}",`
          : ""
      }
    }),
  ],
  assessmentSkills: defaultTopicSkills("${slug(t.id)}", ${JSON.stringify(skillIds)}${skillTypesArg}),
});`;
}

function renderGraph(g) {
  const topics = g.topics.map((t, i) => {
    const prev = i > 0 ? g.topics[i - 1].id : null;
    const next = i < g.topics.length - 1 ? g.topics[i + 1].id : null;
    return {
      ...t,
      order: i + 1,
      varName: t.varName || `${slug(t.id).replace(/-/g, "_")}Topic`,
      prereqs: t.prereqs ?? (prev ? [prev] : []),
      related: t.related ?? (next ? [next] : []),
    };
  });

  return `import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ${JSON.stringify(g.contamination)};

${topics.map((t) => renderTopic(g.prefix, t, g.skillTypes)).join("\n\n")}

export const ${g.exportName}: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "${g.id}",
  title: ${JSON.stringify(g.title)},
  aliases: ${JSON.stringify(g.aliases)},
  category: ${JSON.stringify(g.category)},
  description: ${JSON.stringify(g.description)},
  topics: [${topics.map((t) => t.varName).join(", ")}],
});
`;
}

const CLOUD_SKILLS = [
  "concept-understanding",
  "configuration-analysis",
  "architecture-reasoning",
  "practical-scenario",
  "debugging",
];
const DATA_SKILLS = [
  "concept-understanding",
  "query-interpretation",
  "code-interpretation",
  "practical-scenario",
  "debugging",
];
const CODE_SKILLS = [
  "concept-understanding",
  "code-interpretation",
  "debugging",
  "expected-output",
  "practical-scenario",
];

/** @type {Array<object>} */
const graphs = [];

function topic(id, title, description, concepts, extras = {}) {
  return { id, title, description, concepts, ...extras };
}

// ---------- Programming ----------
graphs.push({
  file: "programming/typescript.ts",
  exportName: "typescriptKnowledgeGraph",
  id: "kg-typescript",
  title: "TypeScript",
  aliases: [
    "typescript",
    "ts",
    "learn typescript",
    "typescript programming",
    "type script",
  ],
  category: "Programming",
  description:
    "TypeScript curriculum covering annotations, interfaces, unions, functions, generics, narrowing, utility types, and tooling.",
  prefix: "ts",
  contamination: ["aws", "vpc", "ec2", "kubernetes pod", "sql join", "react hooks"],
  skillTypes: CODE_SKILLS,
  topics: [
    topic(
      "ts-types-and-annotations",
      "Types and Annotations",
      "Annotate variables and functions with primitive and structural types.",
      [
        {
          id: "ts-type-annotation",
          title: "Type Annotations",
          description: "Explicit : Type syntax on bindings and parameters.",
        },
        {
          id: "ts-primitives",
          title: "Primitive Types",
          description: "string, number, boolean, null, undefined, bigint, symbol.",
        },
        { id: "ts-arrays", title: "Array Types", description: "T[] and Array<T> for lists." },
        {
          id: "ts-object-types",
          title: "Object Types",
          description: "Inline { prop: Type } shapes for records.",
        },
        {
          id: "ts-any-unknown",
          title: "any vs unknown",
          description: "any disables checking; unknown forces narrowing.",
        },
        {
          id: "ts-type-inference",
          title: "Type Inference",
          description: "Compiler infers types from initializers.",
        },
      ],
      {
        aliases: ["typescript types", "type annotations"],
        language: "typescript",
        artifact: {
          type: "code",
          language: "typescript",
          title: "Annotated profile helper",
          content:
            'type Profile = { name: string; score: number };\nfunction label(p: Profile): string {\n  return `${p.name}:${p.score}`;\n}\nconst ada: Profile = { name: "Ada", score: 98 };\nconsole.log(label(ada));',
          expectedOutput: "Ada:98",
          explanation: "Object type plus annotations.",
        },
      },
    ),
    topic(
      "ts-interfaces-and-type-aliases",
      "Interfaces and Type Aliases",
      "Model reusable shapes with interface and type aliases.",
      [
        "Interfaces",
        "Type Aliases",
        "Optional Properties",
        "Readonly Properties",
        "Interface Extends",
        "Index Signatures",
      ],
      {
        aliases: ["interfaces", "type aliases"],
        artifact: {
          type: "code",
          language: "typescript",
          title: "User and Admin shapes",
          content:
            'interface User { id: string; name: string; email?: string }\ninterface Admin extends User { readonly role: "admin" }\nconst a: Admin = { id: "1", name: "Root", role: "admin" };\nconsole.log(a.role);',
          expectedOutput: "admin",
          explanation: "Extends, optional, and readonly fields.",
        },
      },
    ),
    topic(
      "ts-unions-and-literals",
      "Unions and Literal Types",
      "Combine types with unions and constrain values with literals.",
      [
        "Union Types",
        "Literal Types",
        "Discriminated Unions",
        "Type Narrowing Basics",
        "Never Type",
        "Exhaustiveness Checks",
      ],
      {
        aliases: ["union types", "discriminated unions"],
        difficulty: "intermediate",
        artifact: {
          type: "code",
          language: "typescript",
          title: "Status discriminated union",
          content:
            'type Status = { kind: "ok"; value: number } | { kind: "err"; message: string };\nfunction show(s: Status): string {\n  if (s.kind === "ok") return String(s.value);\n  return s.message;\n}\nconsole.log(show({ kind: "ok", value: 7 }));',
          expectedOutput: "7",
          explanation: "Literal discriminant narrows the union.",
        },
      },
    ),
    topic(
      "ts-functions-and-call-signatures",
      "Functions and Call Signatures",
      "Type parameters, returns, void/never, and callable shapes.",
      [
        "Function Types",
        "Optional Parameters",
        "Rest Parameters",
        "void Returns",
        "never Returns",
        "Call Signatures",
      ],
      {
        aliases: ["function types", "call signatures"],
        artifact: {
          type: "code",
          language: "typescript",
          title: "Mapper function type",
          content:
            "type Mapper = (n: number) => number;\nconst double: Mapper = (n) => n * 2;\nfunction applyAll(xs: number[], fn: Mapper): number[] {\n  return xs.map(fn);\n}\nconsole.log(applyAll([1, 2], double).join(\",\"));",
          expectedOutput: "2,4",
          explanation: "Reusable function type alias.",
        },
      },
    ),
    topic(
      "ts-generics",
      "Generics",
      "Parameterize functions and types while preserving type information.",
      [
        "Generic Functions",
        "Generic Interfaces",
        "Constraints",
        "Default Type Parameters",
        "keyof",
        "Mapped Type Intro",
      ],
      {
        aliases: ["typescript generics", "constraints"],
        difficulty: "intermediate",
        artifact: {
          type: "code",
          language: "typescript",
          title: "identity and pluck",
          content:
            'function identity<T>(value: T): T { return value; }\nfunction pluck<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\nconsole.log(identity(3), pluck({ name: "Ada", score: 9 }, "name"));',
          expectedOutput: "3 Ada",
          explanation: "Generic identity plus keyof constraint.",
        },
      },
    ),
    topic(
      "ts-narrowing-and-guards",
      "Narrowing and Type Guards",
      "Refine unions with typeof, in, instanceof, and custom predicates.",
      [
        "typeof Guards",
        "in Operator",
        "instanceof",
        "Custom Type Predicates",
        "Assertion Functions",
        "Control Flow Analysis",
      ],
      {
        aliases: ["type guards", "narrowing"],
        difficulty: "intermediate",
        artifact: {
          type: "code",
          language: "typescript",
          title: "isString predicate",
          content:
            'function isString(v: unknown): v is string {\n  return typeof v === "string";\n}\nfunction len(v: unknown): number {\n  return isString(v) ? v.length : -1;\n}\nconsole.log(len("hi"), len(3));',
          expectedOutput: "2 -1",
          explanation: "Custom type predicate narrows unknown.",
        },
      },
    ),
    topic(
      "ts-utility-types",
      "Utility Types",
      "Use Partial, Pick, Omit, Record, and Readonly for common transformations.",
      ["Partial", "Required", "Pick", "Omit", "Record", "Readonly Utility"],
      {
        aliases: ["partial pick omit", "utility types"],
        difficulty: "intermediate",
        artifact: {
          type: "code",
          language: "typescript",
          title: "Patch with Partial and Pick",
          content:
            'type User = { id: string; name: string; email: string };\ntype UserPatch = Partial<Pick<User, "name" | "email">>;\nfunction apply(u: User, p: UserPatch): User {\n  return { ...u, ...p };\n}\nconsole.log(apply({ id: "1", name: "A", email: "a@x" }, { name: "B" }).name);',
          expectedOutput: "B",
          explanation: "Compose Partial and Pick for safe patches.",
        },
      },
    ),
    topic(
      "ts-modules-and-tooling",
      "Modules and Compiler Tooling",
      "Organize ESM modules and configure tsc with tsconfig essentials.",
      [
        "ES Modules",
        "import type",
        "tsconfig.json",
        "strict Mode",
        "Declaration Files",
        "Path Mapping Basics",
      ],
      {
        aliases: ["tsconfig", "tsc"],
        difficulty: "intermediate",
        artifact: {
          type: "configuration",
          language: "json",
          title: "Minimal strict tsconfig",
          content:
            '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "ESNext",\n    "strict": true,\n    "moduleResolution": "bundler",\n    "noEmit": true\n  },\n  "include": ["src"]\n}',
          expectedOutput: "tsc --noEmit succeeds on typed sources",
          explanation: "Strict ESM-oriented starter tsconfig.",
        },
      },
    ),
  ],
});

graphs.push({
  file: "programming/csharp.ts",
  exportName: "csharpKnowledgeGraph",
  id: "kg-csharp",
  title: "C#",
  aliases: ["c#", "csharp", "learn c#", "c sharp", "dotnet", ".net csharp"],
  category: "Programming",
  description:
    "C# starter curriculum covering syntax, control flow, OOP, collections/LINQ, async, and exceptions.",
  prefix: "csharp",
  contamination: ["aws", "vpc", "react hooks", "sql join", "kubernetes pod"],
  skillTypes: CODE_SKILLS,
  topics: [
    topic(
      "csharp-syntax-and-types",
      "C# Syntax and Types",
      "Write C# programs with value/reference types, vars, and console I/O.",
      [
        "Value Types",
        "Reference Types",
        "var Inference",
        "string Interpolation",
        "Console I/O",
        "Nullable Value Types",
      ],
      {
        aliases: ["c# syntax", "csharp types"],
        artifact: {
          type: "code",
          language: "csharp",
          title: "Hello score",
          content:
            'using System;\nclass Program {\n  static void Main() {\n    int score = 95;\n    string name = "Ada";\n    Console.WriteLine($"{name}: {score}");\n  }\n}',
          expectedOutput: "Ada: 95",
          explanation: "Types plus string interpolation.",
        },
      },
    ),
    topic(
      "csharp-control-flow-and-methods",
      "Control Flow and Methods",
      "Branch, loop, and encapsulate logic in methods with parameters.",
      [
        "if/else",
        "switch Expressions",
        "for Loops",
        "foreach",
        "Methods",
        "Parameters and Returns",
      ],
      { aliases: ["c# methods", "csharp loops"] },
    ),
    topic(
      "csharp-classes-and-oop",
      "Classes and OOP",
      "Model domain objects with classes, properties, constructors, and inheritance.",
      [
        "Classes",
        "Properties",
        "Constructors",
        "Inheritance",
        "virtual/override",
        "Access Modifiers",
      ],
      { aliases: ["c# oop", "csharp classes"], difficulty: "intermediate" },
    ),
    topic(
      "csharp-collections-and-linq",
      "Collections and LINQ",
      "Use List/Dictionary and query with LINQ Where/Select.",
      ["List<T>", "Dictionary", "IEnumerable", "LINQ Where", "LINQ Select", "Deferred Execution"],
      {
        aliases: ["linq", "csharp collections"],
        difficulty: "intermediate",
        artifact: {
          type: "code",
          language: "csharp",
          title: "LINQ filter",
          content:
            "using System;\nusing System.Linq;\nvar nums = new[] { 1, 2, 3, 4 };\nvar evens = nums.Where(n => n % 2 == 0).Select(n => n * 10);\nConsole.WriteLine(string.Join(\",\", evens));",
          expectedOutput: "20,40",
          explanation: "Where + Select over an array.",
        },
      },
    ),
    topic(
      "csharp-async-await",
      "Async and Await",
      "Write non-blocking methods with async/await and Task.",
      ["Task", "async Methods", "await", "Task.WhenAll", "CancellationToken Intro", "ConfigureAwait Basics"],
      { aliases: ["async await", "csharp async"], difficulty: "intermediate" },
    ),
    topic(
      "csharp-exceptions-and-nullability",
      "Exceptions and Nullability",
      "Handle errors with try/catch and use nullable reference annotations.",
      [
        "try/catch/finally",
        "throw",
        "Custom Exceptions",
        "Nullable Reference Types",
        "null-conditional",
        "null-coalescing",
      ],
      { aliases: ["csharp exceptions", "nullable reference types"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "programming/go.ts",
  exportName: "goKnowledgeGraph",
  id: "kg-go",
  title: "Go",
  aliases: ["golang", "learn go", "learn golang", "go programming", "go language"],
  category: "Programming",
  description:
    "Go starter curriculum covering syntax, functions, structs/interfaces, concurrency basics, packages, and errors.",
  prefix: "go",
  contamination: ["aws", "vpc", "react hooks", "sql join", "python class"],
  skillTypes: CODE_SKILLS,
  topics: [
    topic(
      "go-syntax-and-types",
      "Go Syntax and Types",
      "Declare variables, constants, and composite literals with Go's type system.",
      [
        "Short Variable Declaration",
        "Basic Types",
        "Slices",
        "Maps",
        "Structs Literals",
        "Zero Values",
      ],
      {
        aliases: ["go syntax", "golang types"],
        artifact: {
          type: "code",
          language: "go",
          title: "Slice and map literals",
          content:
            'package main\nimport "fmt"\nfunc main() {\n  scores := []int{90, 80}\n  m := map[string]int{"ada": 95}\n  fmt.Println(scores[0], m["ada"])\n}',
          expectedOutput: "90 95",
          explanation: "Slice and map composite literals.",
        },
      },
    ),
    topic(
      "go-functions-and-methods",
      "Functions and Methods",
      "Write functions with multiple returns and attach methods to types.",
      [
        "Functions",
        "Multiple Returns",
        "Named Results",
        "Methods",
        "Pointer Receivers",
        "Variadic Parameters",
      ],
      { aliases: ["go functions", "go methods"] },
    ),
    topic(
      "go-structs-and-interfaces",
      "Structs and Interfaces",
      "Compose data with structs and behavior with implicit interfaces.",
      [
        "Struct Fields",
        "Embedding",
        "Interfaces",
        "Implicit Satisfaction",
        "Empty Interface",
        "Type Assertions",
      ],
      { aliases: ["go interfaces", "go structs"], difficulty: "intermediate" },
    ),
    topic(
      "go-concurrency-basics",
      "Goroutines and Channels",
      "Launch goroutines and coordinate with channels.",
      [
        "goroutines",
        "Channels",
        "Buffered Channels",
        "select",
        "WaitGroup Intro",
        "Race Awareness",
      ],
      {
        aliases: ["goroutines", "channels"],
        difficulty: "intermediate",
        artifact: {
          type: "code",
          language: "go",
          title: "Channel handoff",
          content:
            'package main\nimport "fmt"\nfunc main() {\n  ch := make(chan string, 1)\n  ch <- "ready"\n  fmt.Println(<-ch)\n}',
          expectedOutput: "ready",
          explanation: "Buffered channel send/receive.",
        },
      },
    ),
    topic(
      "go-packages-and-modules",
      "Packages and Modules",
      "Organize code with packages and go.mod module paths.",
      ["Packages", "Exports", "go.mod", "go get", "Internal Packages", "init Functions"],
      { aliases: ["go modules", "go.mod"], difficulty: "intermediate" },
    ),
    topic(
      "go-errors-and-testing",
      "Errors and Testing",
      "Propagate errors explicitly and write table-driven tests.",
      [
        "error Interface",
        "fmt.Errorf",
        "errors.Is/As",
        "defer",
        "testing Package",
        "Table-Driven Tests",
      ],
      { aliases: ["go errors", "go testing"], difficulty: "intermediate" },
    ),
  ],
});

// Avoid bare "go" alias — resolve uses short-token rules; keep golang-focused aliases only.
// (aliases already set without lone "go" as primary false-positive risk in titles like "goal")

graphs.push({
  file: "programming/rust.ts",
  exportName: "rustKnowledgeGraph",
  id: "kg-rust",
  title: "Rust",
  aliases: ["rust", "learn rust", "rust programming", "rustlang"],
  category: "Programming",
  description:
    "Rust starter curriculum covering ownership, borrowing, structs/enums, error handling, collections, and cargo tooling.",
  prefix: "rust",
  contamination: ["aws", "vpc", "react hooks", "sql join", "python class"],
  skillTypes: CODE_SKILLS,
  topics: [
    topic(
      "rust-syntax-and-ownership",
      "Syntax and Ownership",
      "Bind values with let and reason about ownership moves.",
      [
        "let Bindings",
        "Ownership",
        "Move Semantics",
        "Clone",
        "Stack vs Heap",
        "Drop",
      ],
      {
        aliases: ["rust ownership", "rust syntax"],
        artifact: {
          type: "code",
          language: "rust",
          title: "Ownership move",
          content:
            'fn main() {\n  let s = String::from("hi");\n  let t = s;\n  println!("{t}");\n}',
          expectedOutput: "hi",
          explanation: "String ownership moves from s to t.",
        },
      },
    ),
    topic(
      "rust-borrowing-and-references",
      "Borrowing and References",
      "Share data with shared and mutable references under borrow rules.",
      [
        "Shared References",
        "Mutable References",
        "Borrow Checker",
        "Slices",
        "Lifetime Intro",
        "Dangling Prevention",
      ],
      { aliases: ["borrowing", "references"], difficulty: "intermediate" },
    ),
    topic(
      "rust-structs-and-enums",
      "Structs and Enums",
      "Model data with structs, enums, and pattern matching.",
      ["Structs", "impl Blocks", "Enums", "Option", "match", "if let"],
      { aliases: ["rust enums", "option match"] },
    ),
    topic(
      "rust-error-handling",
      "Error Handling with Result",
      "Propagate recoverable errors with Result and the ? operator.",
      ["Result", "? Operator", "map_err", "anyhow Intro", "panic vs Result", "Custom Error Types"],
      { aliases: ["rust result", "rust errors"], difficulty: "intermediate" },
    ),
    topic(
      "rust-collections-and-iterators",
      "Collections and Iterators",
      "Use Vec/HashMap and transform data with iterators.",
      ["Vec", "HashMap", "Iterators", "map/filter", "collect", "Ownership in Iteration"],
      { aliases: ["rust iterators", "vec hashmap"], difficulty: "intermediate" },
    ),
    topic(
      "rust-cargo-and-modules",
      "Cargo and Modules",
      "Build crates with Cargo and organize modules/visibility.",
      ["Cargo.toml", "cargo build/test", "Modules", "use Paths", "pub Visibility", "Crates"],
      { aliases: ["cargo", "rust modules"], difficulty: "intermediate" },
    ),
  ],
});

// ---------- Web ----------
graphs.push({
  file: "web-development/html.ts",
  exportName: "htmlKnowledgeGraph",
  id: "kg-html",
  title: "HTML",
  aliases: ["html", "learn html", "html5", "hypertext markup"],
  category: "Web Development",
  description:
    "HTML starter curriculum covering document structure, text/media, links/navigation, forms, semantics, and accessibility basics.",
  prefix: "html",
  contamination: ["aws", "vpc", "kubernetes pod", "sql join", "python class"],
  skillTypes: [
    "concept-understanding",
    "code-interpretation",
    "debugging",
    "practical-scenario",
    "configuration-analysis",
  ],
  topics: [
    topic(
      "html-document-structure",
      "Document Structure",
      "Build valid HTML documents with doctype, html/head/body, and metadata.",
      ["DOCTYPE", "html Element", "head Metadata", "title", "body", "Charset and Viewport"],
      {
        aliases: ["html structure", "html boilerplate"],
        artifact: {
          type: "code",
          language: "html",
          title: "Minimal page",
          content:
            "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\" />\n  <title>Lab</title>\n</head>\n<body>\n  <h1>Hello</h1>\n</body>\n</html>",
          expectedOutput: "Browser shows Hello heading",
          explanation: "Valid HTML5 skeleton.",
        },
      },
    ),
    topic(
      "html-text-and-media",
      "Text and Media Elements",
      "Mark up headings, paragraphs, lists, images, and figures.",
      ["Headings", "Paragraphs", "Lists", "img", "figure/figcaption", "alt Text"],
      { aliases: ["html images", "html lists"] },
    ),
    topic(
      "html-links-and-navigation",
      "Links and Navigation",
      "Connect pages with anchors, relative URLs, and nav landmarks.",
      ["a href", "Relative URLs", "Absolute URLs", "nav", "target and rel", "Fragment Links"],
      { aliases: ["html links", "anchors"] },
    ),
    topic(
      "html-forms",
      "Forms and Inputs",
      "Collect user input with forms, labels, and common control types.",
      ["form", "input Types", "label", "select/textarea", "button", "name/value"],
      {
        aliases: ["html forms", "form inputs"],
        artifact: {
          type: "code",
          language: "html",
          title: "Signup form controls",
          content:
            '<form action="/signup" method="post">\n  <label>Email <input type="email" name="email" required /></label>\n  <button type="submit">Join</button>\n</form>',
          expectedOutput: "Accessible labeled email field with submit",
          explanation: "label + input association and submit button.",
        },
      },
    ),
    topic(
      "html-semantic-structure",
      "Semantic Structure",
      "Choose semantic sectioning elements for meaningful page outlines.",
      ["header", "main", "section", "article", "aside", "footer"],
      { aliases: ["semantic html", "sectioning"], difficulty: "intermediate" },
    ),
    topic(
      "html-accessibility-basics",
      "Accessibility Basics",
      "Improve usability with landmarks, alt text, and keyboard-friendly markup.",
      [
        "Accessible Names",
        "alt Text Quality",
        "Landmark Roles",
        "Keyboard Focus Order",
        "aria-label Intro",
        "Heading Hierarchy",
      ],
      { aliases: ["html a11y", "accessibility"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "web-development/css.ts",
  exportName: "cssKnowledgeGraph",
  id: "kg-css",
  title: "CSS",
  aliases: ["css", "learn css", "cascading style sheets", "css3"],
  category: "Web Development",
  description:
    "CSS starter curriculum covering selectors, box model, flexbox, grid, responsive design, and cascade/specificity.",
  prefix: "css",
  contamination: ["aws", "vpc", "kubernetes pod", "sql join", "python class"],
  skillTypes: CODE_SKILLS,
  topics: [
    topic(
      "css-selectors-and-properties",
      "Selectors and Properties",
      "Target elements and apply core visual properties.",
      ["Element Selectors", "Class Selectors", "ID Selectors", "color/background", "font Properties", "Combinators"],
      {
        aliases: ["css selectors", "css properties"],
        artifact: {
          type: "code",
          language: "css",
          title: "Class styling",
          content: ".card { color: #123; background: #f5f5f5; font-size: 1rem; }",
          expectedOutput: "Elements with class card use the declared styles",
          explanation: "Class selector with common properties.",
        },
      },
    ),
    topic(
      "css-box-model",
      "Box Model",
      "Control spacing with content, padding, border, and margin.",
      ["Content Box", "padding", "border", "margin", "box-sizing", "display"],
      { aliases: ["box model", "padding margin"] },
    ),
    topic(
      "css-flexbox",
      "Flexbox Layout",
      "Align one-dimensional layouts with flex containers and items.",
      [
        "display flex",
        "flex-direction",
        "justify-content",
        "align-items",
        "flex-grow/shrink",
        "gap",
      ],
      {
        aliases: ["flexbox", "flex layout"],
        artifact: {
          type: "code",
          language: "css",
          title: "Centered row",
          content:
            ".row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }",
          expectedOutput: "Children spaced horizontally and vertically centered",
          explanation: "Common flex alignment pattern.",
        },
      },
    ),
    topic(
      "css-grid",
      "CSS Grid",
      "Build two-dimensional layouts with tracks and placement.",
      [
        "display grid",
        "grid-template-columns",
        "grid-template-rows",
        "grid-gap",
        "grid-column",
        "fr Unit",
      ],
      { aliases: ["css grid", "grid layout"], difficulty: "intermediate" },
    ),
    topic(
      "css-responsive-design",
      "Responsive Design",
      "Adapt layouts with media queries and fluid units.",
      [
        "Media Queries",
        "Mobile-First",
        "Relative Units",
        "Viewport Width",
        "Responsive Images",
        "Breakpoints",
      ],
      { aliases: ["responsive css", "media queries"], difficulty: "intermediate" },
    ),
    topic(
      "css-cascade-and-specificity",
      "Cascade and Specificity",
      "Predict which rules win using specificity, order, and inheritance.",
      [
        "Specificity",
        "Cascade Order",
        "Inheritance",
        "!important Costs",
        "CSS Variables",
        "Layer Intro",
      ],
      { aliases: ["specificity", "css cascade"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "web-development/angular.ts",
  exportName: "angularKnowledgeGraph",
  id: "kg-angular",
  title: "Angular",
  aliases: ["angular", "learn angular", "angular framework", "angularjs spa"],
  category: "Web Development",
  description:
    "Angular starter curriculum covering components, templates, services/DI, routing, forms, and HttpClient.",
  prefix: "angular",
  contamination: ["aws", "vpc", "kubernetes pod", "sql join", "python class", "vue composition"],
  skillTypes: CODE_SKILLS,
  topics: [
    topic(
      "angular-components",
      "Components and Modules",
      "Create components with selectors, templates, and styles.",
      [
        "@Component",
        "Selectors",
        "Templates",
        "Styles",
        "Standalone Components",
        "Component Inputs Intro",
      ],
      { aliases: ["angular components", "ng component"] },
    ),
    topic(
      "angular-templates-and-binding",
      "Templates and Data Binding",
      "Bind data with interpolation, property, event, and two-way binding.",
      [
        "Interpolation",
        "Property Binding",
        "Event Binding",
        "Two-Way Binding",
        "*ngIf/*ngFor",
        "Pipes Intro",
      ],
      { aliases: ["angular binding", "ngif ngfor"] },
    ),
    topic(
      "angular-services-and-di",
      "Services and Dependency Injection",
      "Share logic with injectable services and constructor DI.",
      [
        "@Injectable",
        "providedIn root",
        "Constructor Injection",
        "Service State",
        "Interface Contracts",
        "Tree-Shakeable Providers",
      ],
      { aliases: ["angular services", "dependency injection"], difficulty: "intermediate" },
    ),
    topic(
      "angular-routing",
      "Routing",
      "Navigate views with the Angular Router and route params.",
      [
        "RouterModule",
        "Routes Config",
        "routerLink",
        "router-outlet",
        "Route Params",
        "Lazy Loading Intro",
      ],
      { aliases: ["angular router", "routing"], difficulty: "intermediate" },
    ),
    topic(
      "angular-forms",
      "Reactive and Template Forms",
      "Capture input with template-driven and reactive forms.",
      [
        "Template-Driven Forms",
        "Reactive Forms",
        "FormControl",
        "FormGroup",
        "Validators",
        "Form Submission",
      ],
      { aliases: ["angular forms", "formcontrol"], difficulty: "intermediate" },
    ),
    topic(
      "angular-httpclient",
      "HttpClient and Async Data",
      "Call APIs with HttpClient and consume Observables in components.",
      [
        "HttpClient",
        "GET Requests",
        "POST Requests",
        "Observables",
        "async Pipe",
        "Error Handling",
      ],
      { aliases: ["angular http", "httpclient"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "web-development/vue.ts",
  exportName: "vueKnowledgeGraph",
  id: "kg-vue",
  title: "Vue",
  aliases: ["vue", "vue.js", "learn vue", "vuejs", "vue 3"],
  category: "Web Development",
  description:
    "Vue starter curriculum covering SFCs, reactivity, Composition API, components, routing, and state basics.",
  prefix: "vue",
  contamination: ["aws", "vpc", "kubernetes pod", "sql join", "angular module", "react hooks"],
  skillTypes: CODE_SKILLS,
  topics: [
    topic(
      "vue-sfc-basics",
      "Single File Components",
      "Author Vue SFCs with template, script, and style blocks.",
      [
        "SFC Structure",
        "template",
        "script setup",
        "scoped style",
        "Root Elements",
        "Component Naming",
      ],
      {
        aliases: ["vue sfc", "single file components"],
        artifact: {
          type: "code",
          language: "vue",
          title: "Hello SFC",
          content:
            "<script setup>\nconst msg = \"Hello Vue\";\n</script>\n<template>\n  <h1>{{ msg }}</h1>\n</template>",
          expectedOutput: "Renders Hello Vue",
          explanation: "Minimal script setup SFC.",
        },
      },
    ),
    topic(
      "vue-reactivity",
      "Reactivity Fundamentals",
      "Track state with ref/reactive and derive values with computed.",
      ["ref", "reactive", "computed", "watch", "Template Refs", "Reactivity Caveats"],
      { aliases: ["vue reactivity", "ref reactive"] },
    ),
    topic(
      "vue-composition-api",
      "Composition API Patterns",
      "Organize logic with composables and lifecycle hooks.",
      [
        "setup Syntax",
        "Composables",
        "onMounted",
        "Props",
        "Emits",
        "Provide/Inject Intro",
      ],
      { aliases: ["composition api", "composables"], difficulty: "intermediate" },
    ),
    topic(
      "vue-components-and-props",
      "Components Props and Events",
      "Split UI into child components communicating via props and emits.",
      [
        "Child Components",
        "props",
        "defineProps",
        "emits",
        "v-model on Components",
        "Slots Intro",
      ],
      { aliases: ["vue props", "vue emits"] },
    ),
    topic(
      "vue-routing",
      "Vue Router",
      "Navigate views with Vue Router routes and params.",
      [
        "createRouter",
        "Route Records",
        "router-link",
        "router-view",
        "Route Params",
        "Navigation Guards Intro",
      ],
      { aliases: ["vue router", "routing"], difficulty: "intermediate" },
    ),
    topic(
      "vue-state-basics",
      "Shared State Basics",
      "Share state with provide/inject and a minimal Pinia store.",
      [
        "Local vs Shared State",
        "provide/inject",
        "Pinia Store",
        "state",
        "actions",
        "getters",
      ],
      { aliases: ["pinia", "vue state"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "web-development/nextjs.ts",
  exportName: "nextjsKnowledgeGraph",
  id: "kg-nextjs",
  title: "Next.js",
  aliases: ["next.js", "nextjs", "learn next.js", "learn nextjs", "next js"],
  category: "Web Development",
  description:
    "Next.js starter curriculum covering App Router, server/client components, routing, data fetching, and API routes.",
  prefix: "nextjs",
  contamination: ["aws", "vpc", "kubernetes pod", "sql join", "angular module"],
  skillTypes: CODE_SKILLS,
  topics: [
    topic(
      "nextjs-app-router-basics",
      "App Router Basics",
      "Create routes with the app directory, layouts, and pages.",
      ["app Directory", "page.tsx", "layout.tsx", "Nested Routes", "Link Component", "Metadata"],
      { aliases: ["app router", "next.js routing"] },
    ),
    topic(
      "nextjs-server-and-client",
      "Server and Client Components",
      "Choose server vs client components and mark client boundaries.",
      [
        "Server Components",
        "Client Components",
        "use client",
        "Passing Props Across Boundary",
        "Hooks Restriction",
        "Bundle Impact",
      ],
      { aliases: ["server components", "use client"], difficulty: "intermediate" },
    ),
    topic(
      "nextjs-routing-and-navigation",
      "Routing and Navigation",
      "Use dynamic segments, search params, and programmatic navigation.",
      [
        "Dynamic Segments",
        "searchParams",
        "useRouter",
        "redirect",
        "notFound",
        "Parallel Routes Intro",
      ],
      { aliases: ["next.js navigation", "dynamic routes"], difficulty: "intermediate" },
    ),
    topic(
      "nextjs-data-fetching",
      "Data Fetching",
      "Fetch data in server components and cache/revalidate responses.",
      [
        "fetch in Server Components",
        "Caching Defaults",
        "revalidate",
        "Loading UI",
        "Error UI",
        "Streaming Intro",
      ],
      { aliases: ["next.js data fetching", "revalidate"], difficulty: "intermediate" },
    ),
    topic(
      "nextjs-route-handlers",
      "Route Handlers and Mutations",
      "Implement API route handlers and server actions for mutations.",
      [
        "route.ts Handlers",
        "GET/POST Handlers",
        "Request/Response",
        "Server Actions",
        "Form Actions",
        "Validation Basics",
      ],
      { aliases: ["api routes", "server actions"], difficulty: "intermediate" },
    ),
    topic(
      "nextjs-styling-and-assets",
      "Styling and Assets",
      "Style apps with CSS Modules/global CSS and optimize images.",
      [
        "Global CSS",
        "CSS Modules",
        "next/image",
        "Public Assets",
        "Font Optimization",
        "Environment Variables",
      ],
      { aliases: ["next/image", "css modules"] },
    ),
  ],
});

fs.writeFileSync(
  path.join(__dirname, "_phase4-graphs-part-a.json"),
  JSON.stringify(
    graphs.map((g) => ({ file: g.file, topics: g.topics.length, id: g.id })),
    null,
    2,
  ),
);

for (const g of graphs) {
  const out = path.join(ROOT, g.file);
  fs.writeFileSync(out, renderGraph(g), "utf8");
  console.log("wrote", g.file, g.topics.length, "topics");
}

console.log("part A done", graphs.length);
