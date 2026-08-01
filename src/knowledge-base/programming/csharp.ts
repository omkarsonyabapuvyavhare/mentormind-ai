import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","react hooks","sql join","kubernetes pod"];

const csharp_syntax_and_typesTopic = topic({
  id: "csharp-syntax-and-types",
  title: "C# Syntax and Types",
  aliases: ["c# syntax","csharp types"],
  description: "Write C# programs with value/reference types, vars, and console I/O.",
  learningOrder: 1,
  
  relatedTopicIds: ["csharp-control-flow-and-methods"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "csharp-value-types",
      title: "Value Types",
      description: "Value Types applied in this topic.",
    }),
    concept({
      id: "csharp-reference-types",
      title: "Reference Types",
      description: "Reference Types applied in this topic.",
    }),
    concept({
      id: "csharp-var-inference",
      title: "var Inference",
      description: "var Inference applied in this topic.",
    }),
    concept({
      id: "csharp-string-interpolation",
      title: "string Interpolation",
      description: "string Interpolation applied in this topic.",
    }),
    concept({
      id: "csharp-console-i-o",
      title: "Console I/O",
      description: "Console I/O applied in this topic.",
    }),
    concept({
      id: "csharp-nullable-value-types",
      title: "Nullable Value Types",
      description: "Nullable Value Types applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Value Types correctly","Explain Reference Types in context"],
  practicalArtifacts: [
    artifact({
      id: "csharp-syntax-and-types-artifact",
      type: "code",
      title: "Hello score",
      language: "csharp",
      content: "using System;\nclass Program {\n  static void Main() {\n    int score = 95;\n    string name = \"Ada\";\n    Console.WriteLine($\"{name}: {score}\");\n  }\n}",
      expectedOutput: "Ada: 95",
      explanation: "Types plus string interpolation.",
      conceptIds: ["csharp-value-types","csharp-reference-types","csharp-var-inference","csharp-string-interpolation"],
    }),
  ],
  commonMistakes: [
    mistake(
      "csharp-syntax-and-types-mistake-1",
      "Misapplying Value Types",
      "Skipping hands-on checks in C# Syntax and Types",
      "Practice Value Types with a tiny example first.",
      ["csharp-value-types"],
    ),
    mistake(
      "csharp-syntax-and-types-mistake-2",
      "Pulling unrelated-domain demos into C# Syntax and Types",
      "Defaulting to out-of-domain snippets",
      "Stay inside C# Syntax and Types concepts.",
      ["csharp-reference-types"],
    ),
  ],
  exercises: [
    exercise({
      id: "csharp-syntax-and-types-exercise",
      title: "C# Syntax and Types mini exercise",
      instructions: ["Build a small example covering Value Types.","Extend it with Reference Types.","Verify behavior related to var Inference."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for C# Syntax and Types.",
      conceptIds: ["csharp-value-types","csharp-reference-types","csharp-var-inference"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("csharp-syntax-and-types", ["csharp-value-types","csharp-reference-types","csharp-var-inference","csharp-string-interpolation","csharp-console-i-o"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const csharp_control_flow_and_methodsTopic = topic({
  id: "csharp-control-flow-and-methods",
  title: "Control Flow and Methods",
  aliases: ["c# methods","csharp loops"],
  description: "Branch, loop, and encapsulate logic in methods with parameters.",
  learningOrder: 2,
  prerequisiteIds: ["csharp-syntax-and-types"],
  relatedTopicIds: ["csharp-classes-and-oop"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "csharp-if-else",
      title: "if/else",
      description: "if/else applied in this topic.",
    }),
    concept({
      id: "csharp-switch-expressions",
      title: "switch Expressions",
      description: "switch Expressions applied in this topic.",
    }),
    concept({
      id: "csharp-for-loops",
      title: "for Loops",
      description: "for Loops applied in this topic.",
    }),
    concept({
      id: "csharp-foreach",
      title: "foreach",
      description: "foreach applied in this topic.",
    }),
    concept({
      id: "csharp-methods",
      title: "Methods",
      description: "Methods applied in this topic.",
    }),
    concept({
      id: "csharp-parameters-and-returns",
      title: "Parameters and Returns",
      description: "Parameters and Returns applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply if/else correctly","Explain switch Expressions in context"],
  practicalArtifacts: [
    artifact({
      id: "csharp-control-flow-and-methods-artifact",
      type: "code",
      title: "Control Flow and Methods worked example",
      
      content: "// Practical example for Control Flow and Methods\n// Covers: if/else, switch Expressions, for Loops",
      
      explanation: "Demonstrates if/else, switch Expressions, for Loops.",
      conceptIds: ["csharp-if-else","csharp-switch-expressions","csharp-for-loops","csharp-foreach"],
    }),
  ],
  commonMistakes: [
    mistake(
      "csharp-control-flow-and-methods-mistake-1",
      "Misapplying if/else",
      "Skipping hands-on checks in Control Flow and Methods",
      "Practice if/else with a tiny example first.",
      ["csharp-if-else"],
    ),
    mistake(
      "csharp-control-flow-and-methods-mistake-2",
      "Pulling unrelated-domain demos into Control Flow and Methods",
      "Defaulting to out-of-domain snippets",
      "Stay inside Control Flow and Methods concepts.",
      ["csharp-switch-expressions"],
    ),
  ],
  exercises: [
    exercise({
      id: "csharp-control-flow-and-methods-exercise",
      title: "Control Flow and Methods mini exercise",
      instructions: ["Build a small example covering if/else.","Extend it with switch Expressions.","Verify behavior related to for Loops."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Control Flow and Methods.",
      conceptIds: ["csharp-if-else","csharp-switch-expressions","csharp-for-loops"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("csharp-control-flow-and-methods", ["csharp-if-else","csharp-switch-expressions","csharp-for-loops","csharp-foreach","csharp-methods"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const csharp_classes_and_oopTopic = topic({
  id: "csharp-classes-and-oop",
  title: "Classes and OOP",
  aliases: ["c# oop","csharp classes"],
  description: "Model domain objects with classes, properties, constructors, and inheritance.",
  learningOrder: 3,
  prerequisiteIds: ["csharp-control-flow-and-methods"],
  relatedTopicIds: ["csharp-collections-and-linq"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "csharp-classes",
      title: "Classes",
      description: "Classes applied in this topic.",
    }),
    concept({
      id: "csharp-properties",
      title: "Properties",
      description: "Properties applied in this topic.",
    }),
    concept({
      id: "csharp-constructors",
      title: "Constructors",
      description: "Constructors applied in this topic.",
    }),
    concept({
      id: "csharp-inheritance",
      title: "Inheritance",
      description: "Inheritance applied in this topic.",
    }),
    concept({
      id: "csharp-virtual-override",
      title: "virtual/override",
      description: "virtual/override applied in this topic.",
    }),
    concept({
      id: "csharp-access-modifiers",
      title: "Access Modifiers",
      description: "Access Modifiers applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Classes correctly","Explain Properties in context"],
  practicalArtifacts: [
    artifact({
      id: "csharp-classes-and-oop-artifact",
      type: "code",
      title: "Classes and OOP worked example",
      
      content: "// Practical example for Classes and OOP\n// Covers: Classes, Properties, Constructors",
      
      explanation: "Demonstrates Classes, Properties, Constructors.",
      conceptIds: ["csharp-classes","csharp-properties","csharp-constructors","csharp-inheritance"],
    }),
  ],
  commonMistakes: [
    mistake(
      "csharp-classes-and-oop-mistake-1",
      "Misapplying Classes",
      "Skipping hands-on checks in Classes and OOP",
      "Practice Classes with a tiny example first.",
      ["csharp-classes"],
    ),
    mistake(
      "csharp-classes-and-oop-mistake-2",
      "Pulling unrelated-domain demos into Classes and OOP",
      "Defaulting to out-of-domain snippets",
      "Stay inside Classes and OOP concepts.",
      ["csharp-properties"],
    ),
  ],
  exercises: [
    exercise({
      id: "csharp-classes-and-oop-exercise",
      title: "Classes and OOP mini exercise",
      instructions: ["Build a small example covering Classes.","Extend it with Properties.","Verify behavior related to Constructors."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Classes and OOP.",
      conceptIds: ["csharp-classes","csharp-properties","csharp-constructors"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("csharp-classes-and-oop", ["csharp-classes","csharp-properties","csharp-constructors","csharp-inheritance","csharp-virtual-override"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const csharp_collections_and_linqTopic = topic({
  id: "csharp-collections-and-linq",
  title: "Collections and LINQ",
  aliases: ["linq","csharp collections"],
  description: "Use List/Dictionary and query with LINQ Where/Select.",
  learningOrder: 4,
  prerequisiteIds: ["csharp-classes-and-oop"],
  relatedTopicIds: ["csharp-async-await"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "csharp-list-t",
      title: "List<T>",
      description: "List<T> applied in this topic.",
    }),
    concept({
      id: "csharp-dictionary",
      title: "Dictionary",
      description: "Dictionary applied in this topic.",
    }),
    concept({
      id: "csharp-ienumerable",
      title: "IEnumerable",
      description: "IEnumerable applied in this topic.",
    }),
    concept({
      id: "csharp-linq-where",
      title: "LINQ Where",
      description: "LINQ Where applied in this topic.",
    }),
    concept({
      id: "csharp-linq-select",
      title: "LINQ Select",
      description: "LINQ Select applied in this topic.",
    }),
    concept({
      id: "csharp-deferred-execution",
      title: "Deferred Execution",
      description: "Deferred Execution applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply List<T> correctly","Explain Dictionary in context"],
  practicalArtifacts: [
    artifact({
      id: "csharp-collections-and-linq-artifact",
      type: "code",
      title: "LINQ filter",
      language: "csharp",
      content: "using System;\nusing System.Linq;\nvar nums = new[] { 1, 2, 3, 4 };\nvar evens = nums.Where(n => n % 2 == 0).Select(n => n * 10);\nConsole.WriteLine(string.Join(\",\", evens));",
      expectedOutput: "20,40",
      explanation: "Where + Select over an array.",
      conceptIds: ["csharp-list-t","csharp-dictionary","csharp-ienumerable","csharp-linq-where"],
    }),
  ],
  commonMistakes: [
    mistake(
      "csharp-collections-and-linq-mistake-1",
      "Misapplying List<T>",
      "Skipping hands-on checks in Collections and LINQ",
      "Practice List<T> with a tiny example first.",
      ["csharp-list-t"],
    ),
    mistake(
      "csharp-collections-and-linq-mistake-2",
      "Pulling unrelated-domain demos into Collections and LINQ",
      "Defaulting to out-of-domain snippets",
      "Stay inside Collections and LINQ concepts.",
      ["csharp-dictionary"],
    ),
  ],
  exercises: [
    exercise({
      id: "csharp-collections-and-linq-exercise",
      title: "Collections and LINQ mini exercise",
      instructions: ["Build a small example covering List<T>.","Extend it with Dictionary.","Verify behavior related to IEnumerable."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Collections and LINQ.",
      conceptIds: ["csharp-list-t","csharp-dictionary","csharp-ienumerable"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("csharp-collections-and-linq", ["csharp-list-t","csharp-dictionary","csharp-ienumerable","csharp-linq-where","csharp-linq-select"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const csharp_async_awaitTopic = topic({
  id: "csharp-async-await",
  title: "Async and Await",
  aliases: ["async await","csharp async"],
  description: "Write non-blocking methods with async/await and Task.",
  learningOrder: 5,
  prerequisiteIds: ["csharp-collections-and-linq"],
  relatedTopicIds: ["csharp-exceptions-and-nullability"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "csharp-task",
      title: "Task",
      description: "Task applied in this topic.",
    }),
    concept({
      id: "csharp-async-methods",
      title: "async Methods",
      description: "async Methods applied in this topic.",
    }),
    concept({
      id: "csharp-await",
      title: "await",
      description: "await applied in this topic.",
    }),
    concept({
      id: "csharp-task-whenall",
      title: "Task.WhenAll",
      description: "Task.WhenAll applied in this topic.",
    }),
    concept({
      id: "csharp-cancellationtoken-intro",
      title: "CancellationToken Intro",
      description: "CancellationToken Intro applied in this topic.",
    }),
    concept({
      id: "csharp-configureawait-basics",
      title: "ConfigureAwait Basics",
      description: "ConfigureAwait Basics applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Task correctly","Explain async Methods in context"],
  practicalArtifacts: [
    artifact({
      id: "csharp-async-await-artifact",
      type: "code",
      title: "Async and Await worked example",
      
      content: "// Practical example for Async and Await\n// Covers: Task, async Methods, await",
      
      explanation: "Demonstrates Task, async Methods, await.",
      conceptIds: ["csharp-task","csharp-async-methods","csharp-await","csharp-task-whenall"],
    }),
  ],
  commonMistakes: [
    mistake(
      "csharp-async-await-mistake-1",
      "Misapplying Task",
      "Skipping hands-on checks in Async and Await",
      "Practice Task with a tiny example first.",
      ["csharp-task"],
    ),
    mistake(
      "csharp-async-await-mistake-2",
      "Pulling unrelated-domain demos into Async and Await",
      "Defaulting to out-of-domain snippets",
      "Stay inside Async and Await concepts.",
      ["csharp-async-methods"],
    ),
  ],
  exercises: [
    exercise({
      id: "csharp-async-await-exercise",
      title: "Async and Await mini exercise",
      instructions: ["Build a small example covering Task.","Extend it with async Methods.","Verify behavior related to await."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Async and Await.",
      conceptIds: ["csharp-task","csharp-async-methods","csharp-await"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("csharp-async-await", ["csharp-task","csharp-async-methods","csharp-await","csharp-task-whenall","csharp-cancellationtoken-intro"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const csharp_exceptions_and_nullabilityTopic = topic({
  id: "csharp-exceptions-and-nullability",
  title: "Exceptions and Nullability",
  aliases: ["csharp exceptions","nullable reference types"],
  description: "Handle errors with try/catch and use nullable reference annotations.",
  learningOrder: 6,
  prerequisiteIds: ["csharp-async-await"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "csharp-try-catch-finally",
      title: "try/catch/finally",
      description: "try/catch/finally applied in this topic.",
    }),
    concept({
      id: "csharp-throw",
      title: "throw",
      description: "throw applied in this topic.",
    }),
    concept({
      id: "csharp-custom-exceptions",
      title: "Custom Exceptions",
      description: "Custom Exceptions applied in this topic.",
    }),
    concept({
      id: "csharp-nullable-reference-types",
      title: "Nullable Reference Types",
      description: "Nullable Reference Types applied in this topic.",
    }),
    concept({
      id: "csharp-null-conditional",
      title: "null-conditional",
      description: "null-conditional applied in this topic.",
    }),
    concept({
      id: "csharp-null-coalescing",
      title: "null-coalescing",
      description: "null-coalescing applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply try/catch/finally correctly","Explain throw in context"],
  practicalArtifacts: [
    artifact({
      id: "csharp-exceptions-and-nullability-artifact",
      type: "code",
      title: "Exceptions and Nullability worked example",
      
      content: "// Practical example for Exceptions and Nullability\n// Covers: try/catch/finally, throw, Custom Exceptions",
      
      explanation: "Demonstrates try/catch/finally, throw, Custom Exceptions.",
      conceptIds: ["csharp-try-catch-finally","csharp-throw","csharp-custom-exceptions","csharp-nullable-reference-types"],
    }),
  ],
  commonMistakes: [
    mistake(
      "csharp-exceptions-and-nullability-mistake-1",
      "Misapplying try/catch/finally",
      "Skipping hands-on checks in Exceptions and Nullability",
      "Practice try/catch/finally with a tiny example first.",
      ["csharp-try-catch-finally"],
    ),
    mistake(
      "csharp-exceptions-and-nullability-mistake-2",
      "Pulling unrelated-domain demos into Exceptions and Nullability",
      "Defaulting to out-of-domain snippets",
      "Stay inside Exceptions and Nullability concepts.",
      ["csharp-throw"],
    ),
  ],
  exercises: [
    exercise({
      id: "csharp-exceptions-and-nullability-exercise",
      title: "Exceptions and Nullability mini exercise",
      instructions: ["Build a small example covering try/catch/finally.","Extend it with throw.","Verify behavior related to Custom Exceptions."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Exceptions and Nullability.",
      conceptIds: ["csharp-try-catch-finally","csharp-throw","csharp-custom-exceptions"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("csharp-exceptions-and-nullability", ["csharp-try-catch-finally","csharp-throw","csharp-custom-exceptions","csharp-nullable-reference-types","csharp-null-conditional"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

export const csharpKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-csharp",
  title: "C#",
  aliases: ["c#","csharp","learn c#","c sharp","dotnet",".net csharp"],
  category: "Programming",
  description: "C# starter curriculum covering syntax, control flow, OOP, collections/LINQ, async, and exceptions.",
  topics: [csharp_syntax_and_typesTopic, csharp_control_flow_and_methodsTopic, csharp_classes_and_oopTopic, csharp_collections_and_linqTopic, csharp_async_awaitTopic, csharp_exceptions_and_nullabilityTopic],
});
