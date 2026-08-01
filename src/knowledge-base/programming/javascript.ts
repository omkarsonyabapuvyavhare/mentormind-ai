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
  "python",
  "django",
  "flask",
  "system.out",
  "public static void main",
];

const valuesTopic = topic({
  id: "js-values-and-types",
  title: "JavaScript Values and Types",
  aliases: ["js types", "primitives", "typeof", "javascript basics"],
  description: "Work with primitives, typeof, coercion, and const/let bindings.",
  learningOrder: 1,
  relatedTopicIds: ["js-functions-and-scope"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "js-primitives",
      title: "Primitive Values",
      description: "string, number, boolean, null, undefined, symbol, and bigint.",
      examples: [{ title: "Literals", content: 'const ok = true;\nconst n = 42;', language: "javascript" }],
    }),
    concept({
      id: "js-typeof",
      title: "typeof Operator",
      description: "Inspect a value's runtime type tag with typeof.",
      examples: [{ title: "Check type", content: 'typeof "hi" // "string"', language: "javascript" }],
      commonMistakes: ['typeof null === "object" is a historical quirk.'],
    }),
    concept({
      id: "js-coercion",
      title: "Type Coercion",
      description: "Implicit and explicit conversions between types.",
      commonMistakes: ["Relying on == loose equality for mixed types."],
    }),
    concept({
      id: "js-const-let",
      title: "const and let",
      description: "Block-scoped bindings; prefer const unless reassignment is required.",
    }),
    concept({
      id: "js-template-literals",
      title: "Template Literals",
      description: "Backtick strings with ${expression} interpolation.",
      examples: [{ title: "Interpolate", content: "const msg = `hi ${name}`;", language: "javascript" }],
    }),
    concept({
      id: "js-strict-equality",
      title: "Strict Equality",
      description: "=== compares value and type without coercion.",
    }),
  ],
  learningObjectives: [
    "Choose const/let appropriately for bindings",
    "Predict typeof and strict-equality results",
  ],
  practicalArtifacts: [
    artifact({
      id: "js-values-profile",
      type: "code",
      title: "Learner profile literals",
      language: "javascript",
      content:
        'const name = "Ada";\nconst hours = 12.5;\nconst active = true;\nconsole.log(`${name} ${hours}h active=${active}`);\nconsole.log(typeof hours);',
      expectedOutput: "Ada 12.5h active=true\nnumber",
      explanation: "Shows primitives, template literals, and typeof.",
      conceptIds: ["js-primitives", "js-template-literals", "js-typeof"],
    }),
  ],
  commonMistakes: [
    mistake(
      "js-values-var",
      "Still using var for new code",
      "Old tutorials default to var",
      "Use const/let for block scope.",
      ["js-const-let"],
    ),
    mistake(
      "js-values-double-equals",
      "Using == for mixed-type comparisons",
      "Coercion surprises",
      "Prefer === unless coercion is intentional.",
      ["js-coercion", "js-strict-equality"],
    ),
  ],
  exercises: [
    exercise({
      id: "js-values-exercise",
      title: "Type report helper",
      instructions: [
        "Create values for name, score, and passed.",
        "Log a template string and typeof for each value.",
      ],
      hints: ["Use const where possible", "Avoid =="],
      expectedOutcome: "Printed profile line plus three typeof results.",
      conceptIds: ["js-primitives", "js-typeof", "js-template-literals"],
    }),
  ],
  assessmentSkills: defaultTopicSkills("js-values", [
    "js-primitives",
    "js-typeof",
    "js-coercion",
    "js-const-let",
    "js-strict-equality",
  ]),
});

const functionsTopic = topic({
  id: "js-functions-and-scope",
  title: "Functions and Scope",
  aliases: ["js functions", "closures", "arrow functions"],
  description: "Declare functions, pass parameters, return values, and reason about scope.",
  learningOrder: 2,
  prerequisiteIds: ["js-values-and-types"],
  relatedTopicIds: ["js-arrays-and-objects"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "js-function-declaration", title: "Function Declarations", description: "Named functions created with the function keyword." }),
    concept({ id: "js-arrow-functions", title: "Arrow Functions", description: "Concise function expressions with lexical this." }),
    concept({ id: "js-parameters-defaults", title: "Parameters and Defaults", description: "Named inputs with optional default values." }),
    concept({ id: "js-return-values", title: "Return Values", description: "Send a result back to the caller with return." }),
    concept({ id: "js-scope", title: "Lexical Scope", description: "Inner scopes can read outer bindings; outer cannot read inner locals." }),
    concept({ id: "js-closures", title: "Closures", description: "Functions that remember the environment where they were created." }),
  ],
  learningObjectives: [
    "Write declaration and arrow functions with returns",
    "Explain scope and a simple closure",
  ],
  practicalArtifacts: [
    artifact({
      id: "js-functions-clamp",
      type: "code",
      title: "Clamp helper with closure counter",
      language: "javascript",
      content:
        "function clamp(n, min = 0, max = 100) {\n  return Math.min(max, Math.max(min, n));\n}\nconst makeCounter = () => {\n  let n = 0;\n  return () => ++n;\n};\nconst next = makeCounter();\nconsole.log(clamp(120), next(), next());",
      expectedOutput: "100 1 2",
      explanation: "Defaults, return values, and a closure-backed counter.",
      conceptIds: ["js-parameters-defaults", "js-return-values", "js-closures"],
    }),
  ],
  commonMistakes: [
    mistake(
      "js-fn-missing-return",
      "Forgetting return in a non-void function",
      "Relying on side effects only",
      "Return the computed value explicitly.",
      ["js-return-values"],
    ),
    mistake(
      "js-fn-var-leak",
      "Assuming block bindings leak like var",
      "Confusing function vs block scope",
      "Trace lexical scope with const/let.",
      ["js-scope"],
    ),
  ],
  exercises: [
    exercise({
      id: "js-functions-exercise",
      title: "Discount and tally",
      instructions: [
        "Write applyDiscount(price, rate = 0.1) that returns the discounted price.",
        "Write makeTally() that returns a function incrementing a private count.",
      ],
      hints: ["Use an arrow for the inner function", "Keep count in closure"],
      expectedOutcome: "Discounted number plus a working tally function.",
      conceptIds: ["js-arrow-functions", "js-parameters-defaults", "js-closures"],
    }),
  ],
  assessmentSkills: defaultTopicSkills("js-functions", [
    "js-function-declaration",
    "js-arrow-functions",
    "js-return-values",
    "js-scope",
    "js-closures",
  ]),
});

const collectionsTopic = topic({
  id: "js-arrays-and-objects",
  title: "Arrays and Objects",
  aliases: ["js arrays", "objects", "map filter"],
  description: "Store and transform data with arrays, objects, and common array methods.",
  learningOrder: 3,
  prerequisiteIds: ["js-functions-and-scope"],
  relatedTopicIds: ["js-dom-basics"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "js-arrays", title: "Arrays", description: "Ordered lists indexed from zero." }),
    concept({ id: "js-objects", title: "Objects", description: "Key-value records for structured data." }),
    concept({ id: "js-destructuring", title: "Destructuring", description: "Unpack values from arrays/objects into bindings." }),
    concept({ id: "js-map-filter", title: "map and filter", description: "Transform and select array elements without mutation." }),
    concept({ id: "js-reduce", title: "reduce", description: "Accumulate array values into a single result." }),
    concept({ id: "js-spread", title: "Spread Syntax", description: "Expand iterables/objects into places expecting multiple elements/props." }),
  ],
  learningObjectives: [
    "Model data with arrays and objects",
    "Use map/filter/reduce for transformations",
  ],
  practicalArtifacts: [
    artifact({
      id: "js-collections-roster",
      type: "code",
      title: "Roster transform",
      language: "javascript",
      content:
        'const people = [{ name: "Ada", score: 90 }, { name: "Lin", score: 70 }];\nconst names = people.map((p) => p.name);\nconst passing = people.filter((p) => p.score >= 80);\nconst total = people.reduce((sum, p) => sum + p.score, 0);\nconsole.log(names.join(","), passing.length, total);',
      expectedOutput: "Ada,Lin 1 160",
      explanation: "map/filter/reduce over object records.",
      conceptIds: ["js-arrays", "js-objects", "js-map-filter", "js-reduce"],
    }),
  ],
  commonMistakes: [
    mistake(
      "js-arr-mutate-map",
      "Mutating arrays inside map",
      "Treating map like forEach",
      "Return new values; avoid side effects in map.",
      ["js-map-filter"],
    ),
    mistake(
      "js-obj-dot-optional",
      "Reading missing nested properties without checks",
      "Assuming shapes always exist",
      "Guard access or use optional chaining carefully.",
      ["js-objects"],
    ),
  ],
  exercises: [
    exercise({
      id: "js-collections-exercise",
      title: "Tag frequency",
      instructions: [
        "Given an array of tag strings, return an object of tag -> count.",
        "Also return the tags sorted by frequency descending.",
      ],
      hints: ["reduce to build the counts object", "Sort Object.entries"],
      expectedOutcome: "Count map plus sorted tag list.",
      conceptIds: ["js-objects", "js-reduce", "js-arrays"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("js-collections", [
    "js-arrays",
    "js-objects",
    "js-map-filter",
    "js-reduce",
    "js-destructuring",
  ]),
});

const domTopic = topic({
  id: "js-dom-basics",
  title: "DOM Selection and Events",
  aliases: ["dom", "addEventListener", "querySelector"],
  description: "Select elements, update text/content, and respond to user events.",
  learningOrder: 4,
  prerequisiteIds: ["js-arrays-and-objects"],
  relatedTopicIds: ["js-async-fundamentals"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "js-query-selector", title: "querySelector", description: "Select the first matching element with a CSS selector." }),
    concept({ id: "js-text-content", title: "textContent", description: "Read or write an element's text safely." }),
    concept({ id: "js-classlist", title: "classList", description: "Add/remove/toggle CSS classes on elements." }),
    concept({ id: "js-event-listener", title: "addEventListener", description: "Register handlers for DOM events." }),
    concept({ id: "js-event-object", title: "Event Object", description: "Payload describing the event, including target." }),
    concept({ id: "js-prevent-default", title: "preventDefault", description: "Stop the browser's default action for an event." }),
  ],
  learningObjectives: [
    "Select and update DOM nodes",
    "Wire click/submit handlers with preventDefault when needed",
  ],
  practicalArtifacts: [
    artifact({
      id: "js-dom-counter",
      type: "code",
      title: "Click counter widget",
      language: "javascript",
      content:
        'const label = document.querySelector("#count");\nconst button = document.querySelector("#inc");\nlet n = 0;\nbutton.addEventListener("click", () => {\n  n += 1;\n  label.textContent = String(n);\n});',
      expectedOutput: "Label increments on each click",
      explanation: "querySelector + addEventListener updating textContent.",
      conceptIds: ["js-query-selector", "js-text-content", "js-event-listener"],
    }),
  ],
  commonMistakes: [
    mistake(
      "js-dom-null",
      "Calling methods on a null querySelector result",
      "Script runs before the element exists",
      "Guard null or place the script after the markup.",
      ["js-query-selector"],
    ),
    mistake(
      "js-dom-inline",
      "Relying only on inline onclick attributes",
      "Harder to test and compose",
      "Prefer addEventListener in script.",
      ["js-event-listener"],
    ),
  ],
  exercises: [
    exercise({
      id: "js-dom-exercise",
      title: "Toggle panel",
      instructions: [
        "Select a button and a panel element.",
        "On click, toggle a class that shows/hides the panel.",
      ],
      hints: ["classList.toggle", "Check for null elements"],
      expectedOutcome: "Panel visibility toggles on each click.",
      conceptIds: ["js-query-selector", "js-classlist", "js-event-listener"],
    }),
  ],
  assessmentSkills: defaultTopicSkills("js-dom", [
    "js-query-selector",
    "js-text-content",
    "js-classlist",
    "js-event-listener",
    "js-prevent-default",
  ]),
});

const asyncTopic = topic({
  id: "js-async-fundamentals",
  title: "Asynchronous JavaScript",
  aliases: ["promises", "async await", "fetch"],
  description: "Sequence asynchronous work with Promises, async/await, and fetch.",
  learningOrder: 5,
  prerequisiteIds: ["js-functions-and-scope"],
  relatedTopicIds: ["js-modules-and-tooling"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "js-callbacks-limit", title: "Callback Limits", description: "Nested callbacks become hard to read and error-handle." }),
    concept({ id: "js-promises", title: "Promises", description: "Objects representing eventual completion or failure." }),
    concept({ id: "js-then-catch", title: "then and catch", description: "Attach success and failure handlers to promises." }),
    concept({ id: "js-async-await", title: "async/await", description: "Syntactic sugar that pauses an async function until a promise settles." }),
    concept({ id: "js-fetch", title: "fetch API", description: "Browser API returning a promise for HTTP responses." }),
    concept({ id: "js-error-async", title: "Async Errors", description: "Reject paths and try/catch around await." }),
  ],
  learningObjectives: [
    "Chain promises and rewrite them with async/await",
    "Fetch JSON and handle rejection paths",
  ],
  practicalArtifacts: [
    artifact({
      id: "js-async-fetch-user",
      type: "code",
      title: "Fetch JSON with async/await",
      language: "javascript",
      content:
        'async function loadUser(url) {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return res.json();\n}\nloadUser("/api/user").then((u) => console.log(u.name)).catch((err) => console.error(err.message));',
      expectedOutput: "User name printed, or an HTTP error message",
      explanation: "await fetch, status check, JSON parse, catch path.",
      conceptIds: ["js-async-await", "js-fetch", "js-error-async"],
    }),
  ],
  commonMistakes: [
    mistake(
      "js-async-forgot-await",
      "Forgetting await on a promise",
      "Treating promises like sync values",
      "Await or attach then before using the result.",
      ["js-async-await", "js-promises"],
    ),
    mistake(
      "js-async-swallow",
      "Swallowing fetch failures silently",
      "Missing catch/try",
      "Surface HTTP and network errors to the caller.",
      ["js-error-async", "js-fetch"],
    ),
  ],
  exercises: [
    exercise({
      id: "js-async-exercise",
      title: "Parallel title fetch",
      instructions: [
        "Write an async function that fetches two URLs with Promise.all.",
        "Return both JSON bodies or throw if either response is not ok.",
      ],
      hints: ["Map URLs to fetch promises", "Check res.ok for each"],
      expectedOutcome: "Array of two parsed JSON values or a thrown error.",
      conceptIds: ["js-promises", "js-fetch", "js-async-await"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "js-async",
    ["js-promises", "js-then-catch", "js-async-await", "js-fetch", "js-error-async"],
    ["concept-understanding", "code-interpretation", "debugging", "expected-output", "practical-scenario"],
  ),
});

const modulesTopic = topic({
  id: "js-modules-and-tooling",
  title: "Modules and Tooling Basics",
  aliases: ["es modules", "import export", "npm scripts"],
  description: "Split code with ES modules and run scripts via package.json.",
  learningOrder: 6,
  prerequisiteIds: ["js-arrays-and-objects"],
  relatedTopicIds: ["js-async-fundamentals"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "js-export", title: "export", description: "Expose bindings from a module." }),
    concept({ id: "js-import", title: "import", description: "Bring exported bindings into another module." }),
    concept({ id: "js-default-export", title: "Default Export", description: "A module's primary export imported without braces." }),
    concept({ id: "js-package-json", title: "package.json", description: "Manifest for dependencies and npm scripts." }),
    concept({ id: "js-npm-scripts", title: "npm Scripts", description: "Named commands under package.json scripts." }),
    concept({ id: "js-module-type", title: "type module", description: 'Set "type": "module" so .js files use ESM.' }),
  ],
  learningObjectives: [
    "Split helpers into ESM import/export files",
    "Add and run an npm script",
  ],
  practicalArtifacts: [
    artifact({
      id: "js-modules-math",
      type: "code",
      title: "math.js + main.js ESM pair",
      language: "javascript",
      content:
        '// math.js\nexport const add = (a, b) => a + b;\nexport default function double(n) { return n * 2; }\n\n// main.js\nimport double, { add } from "./math.js";\nconsole.log(add(2, 3), double(4));',
      expectedOutput: "5 8",
      explanation: "Named + default export consumed by import.",
      conceptIds: ["js-export", "js-import", "js-default-export"],
    }),
  ],
  commonMistakes: [
    mistake(
      "js-mod-cjs-mix",
      "Mixing require with ESM import without a plan",
      "Copying CommonJS snippets into ESM projects",
      "Stay on ESM (import/export) or convert deliberately.",
      ["js-import", "js-module-type"],
    ),
    mistake(
      "js-mod-extension",
      "Omitting .js extensions in browser ESM paths",
      "Node/bundler differences",
      "Use explicit paths the runtime expects.",
      ["js-import"],
    ),
  ],
  exercises: [
    exercise({
      id: "js-modules-exercise",
      title: "format util module",
      instructions: [
        "Create format.js exporting formatScore(name, score).",
        "Import it from main.js and log one formatted line.",
        "Add an npm script named start that runs main.js.",
      ],
      hints: ['Use "type": "module"', "Named export is enough"],
      expectedOutcome: "Running npm start prints the formatted score line.",
      conceptIds: ["js-export", "js-import", "js-npm-scripts"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("js-modules", [
    "js-export",
    "js-import",
    "js-default-export",
    "js-package-json",
    "js-npm-scripts",
  ]),
});

export const javascriptKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-javascript",
  title: "JavaScript",
  aliases: ["javascript", "js", "learn javascript", "javascript programming"],
  category: "Programming",
  description:
    "Starter JavaScript curriculum covering values/types, functions, collections, DOM events, async I/O, and ESM tooling.",
  topics: [valuesTopic, functionsTopic, collectionsTopic, domTopic, asyncTopic, modulesTopic],
});
