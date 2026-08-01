import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const t1 = topic({
  id: "react-jsx-and-rendering",
  title: "JSX and Rendering",
  aliases: ["jsx", "react rendering", "elements"],
  description: "Describe UI with JSX and understand how React renders elements.",
  difficulty: "beginner",
  learningOrder: 1,
  prerequisiteIds: [],
  relatedTopicIds: [],
  contaminationTerms: ["aws", "vpc", "kubernetes", "sql join"],
  concepts: [
    concept({ id: "react-jsx", title: "JSX", description: "Syntax extension that describes UI trees as JavaScript expressions." }),
    concept({ id: "react-elements", title: "Elements", description: "Plain objects describing what to render." }),
    concept({ id: "react-expressions", title: "Embedded Expressions", description: "Insert JavaScript values inside curly braces." }),
    concept({ id: "react-attributes", title: "JSX Attributes", description: "Pass props using camelCase attribute names." }),
    concept({ id: "react-fragments", title: "Fragments", description: "Group children without an extra DOM node." }),
    concept({ id: "react-render-tree", title: "Render Tree", description: "React reconciles element trees into host updates." })
  ],
  learningObjectives: ["Write valid JSX", "Embed expressions and attributes correctly"],
  practicalArtifacts: [
    artifact({
      id: "react-jsx-hello",
      type: "code",
      title: "JSX greeting",
      language: "tsx",
      content: "const name = \"Ada\";\nexport function Hello() {\n  return <h1>Hello, {name}</h1>;\n}",
      expectedOutput: "Heading text Hello, Ada",
      explanation: "Shows JSX with an embedded expression.",
      conceptIds: ["react-jsx", "react-expressions", "react-elements"],
    }),
  ],
  commonMistakes: [
    mistake("react-jsx-class", "Using class instead of className", "Copying HTML attribute names", "Use className in React DOM.", ["react-attributes"]),
    mistake("react-jsx-adjacent", "Returning adjacent JSX roots without a fragment", "Forgetting a single parent", "Wrap with <>...</> or a parent element.", ["react-fragments"])
  ],
  exercises: [
    exercise({
      id: "react-jsx-exercise",
      title: "Profile heading",
      instructions: [
        "Write a component that renders a heading and paragraph using one fragment.",
        "Interpolate a role string variable and verify the output.",
      ],
      hints: ["Use <> </>", "Curly braces for expressions"],
      expectedOutcome: "Component returns fragment with interpolated text.",
      conceptIds: ["react-jsx", "react-fragments", "react-expressions"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("react-jsx-and-rendering", [
    "react-jsx", "react-elements", "react-expressions", "react-attributes", "react-fragments"
  ], ["concept-understanding", "code-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


const t2 = topic({
  id: "react-components-and-props",
  title: "Components and Props",
  aliases: ["components", "props", "composition"],
  description: "Build reusable function components and pass data with props.",
  difficulty: "beginner",
  learningOrder: 2,
  prerequisiteIds: ["react-jsx-and-rendering"],
  relatedTopicIds: [],
  contaminationTerms: ["aws", "vpc", "python class"],
  concepts: [
    concept({ id: "react-function-components", title: "Function Components", description: "Components are functions that return UI." }),
    concept({ id: "react-props", title: "Props", description: "Read-only inputs passed from parent to child." }),
    concept({ id: "react-prop-types-shape", title: "Prop Shapes", description: "Define clear prop contracts with TypeScript types." }),
    concept({ id: "react-children", title: "Children Prop", description: "Compose nested UI through children." }),
    concept({ id: "react-composition", title: "Composition", description: "Prefer composing small components over inheritance." }),
    concept({ id: "react-default-props", title: "Default Props", description: "Provide fallback values for optional props." })
  ],
  learningObjectives: ["Create function components", "Pass and type props clearly"],
  practicalArtifacts: [
    artifact({
      id: "react-props-card",
      type: "code",
      title: "Card component",
      language: "tsx",
      content: "type CardProps = { title: string; children: React.ReactNode };\nexport function Card({ title, children }: CardProps) {\n  return <section><h2>{title}</h2>{children}</section>;\n}",
      expectedOutput: "Section with title and nested children",
      explanation: "Props and children composition.",
      conceptIds: ["react-function-components", "react-props", "react-children"],
    }),
  ],
  commonMistakes: [
    mistake("react-props-mutate", "Mutating props inside a child", "Treating props like local state", "Treat props as read-only; lift state up.", ["react-props"]),
    mistake("react-props-god-component", "One giant component with dozens of props", "Avoiding composition", "Split UI into focused components.", ["react-composition"])
  ],
  exercises: [
    exercise({
      id: "react-props-exercise",
      title: "Badge component",
      instructions: ["Create Badge({ label, tone = 'info' }).", "Render it from a parent with two tones."],
      hints: ["Default parameter for tone", "Keep Badge presentational"],
      expectedOutcome: "Reusable Badge used with different props.",
      conceptIds: ["react-function-components", "react-props", "react-default-props"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("react-components-and-props", [
    "react-function-components", "react-props", "react-prop-types-shape", "react-children", "react-composition"
  ], ["concept-understanding", "code-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


const t3 = topic({
  id: "react-state-and-events",
  title: "State and Events",
  aliases: ["useState", "events", "state"],
  description: "Manage local UI state and respond to DOM events.",
  difficulty: "beginner",
  learningOrder: 3,
  prerequisiteIds: ["react-components-and-props"],
  relatedTopicIds: [],
  contaminationTerms: ["aws", "vpc"],
  concepts: [
    concept({ id: "react-usestate", title: "useState", description: "Declare reactive local state in function components." }),
    concept({ id: "react-setstate", title: "Updating State", description: "Replace state with the next value or updater function." }),
    concept({ id: "react-events", title: "Event Handlers", description: "Respond to clicks, changes, and submits." }),
    concept({ id: "react-controlled-inputs", title: "Controlled Inputs", description: "Drive input values from state." }),
    concept({ id: "react-state-immutability", title: "State Immutability", description: "Create new objects/arrays instead of mutating." }),
    concept({ id: "react-derived-state", title: "Derived Values", description: "Compute values during render instead of syncing duplicate state." })
  ],
  learningObjectives: ["Use useState correctly", "Wire event handlers to state updates"],
  practicalArtifacts: [
    artifact({
      id: "react-state-counter",
      type: "code",
      title: "Counter with events",
      language: "tsx",
      content: "import { useState } from 'react';\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;\n}",
      expectedOutput: "Button label increments on each click",
      explanation: "useState with a functional updater and click handler.",
      conceptIds: ["react-usestate", "react-setstate", "react-events"],
    }),
  ],
  commonMistakes: [
    mistake("react-state-mutate-array", "Pushing into state arrays in place", "Mutating the existing reference", "Copy with spread or map before setState.", ["react-state-immutability"]),
    mistake("react-state-stale", "Reading stale state in async handlers", "Closing over old values", "Use functional updaters when next depends on previous.", ["react-setstate"])
  ],
  exercises: [
    exercise({
      id: "react-state-exercise",
      title: "Controlled name field",
      instructions: ["Create an input controlled by name state.", "Disable a Save button when name is blank."],
      hints: ["value + onChange", "Derive disabled from name.trim()"],
      expectedOutcome: "Input updates state; button reflects validity.",
      conceptIds: ["react-controlled-inputs", "react-usestate", "react-derived-state"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("react-state-and-events", [
    "react-usestate", "react-setstate", "react-events", "react-controlled-inputs", "react-state-immutability"
  ], ["concept-understanding", "code-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


const t4 = topic({
  id: "react-lists-and-keys",
  title: "Lists and Keys",
  aliases: ["keys", "rendering lists", "map"],
  description: "Render collections efficiently with stable keys.",
  difficulty: "beginner",
  learningOrder: 4,
  prerequisiteIds: ["react-state-and-events"],
  relatedTopicIds: [],
  contaminationTerms: ["aws", "vpc", "sql"],
  concepts: [
    concept({ id: "react-map-lists", title: "Mapping Lists", description: "Transform arrays into element lists." }),
    concept({ id: "react-keys", title: "Keys", description: "Stable identities help reconciliation." }),
    concept({ id: "react-key-stability", title: "Key Stability", description: "Avoid using array index when order changes." }),
    concept({ id: "react-conditional-list", title: "Conditional Lists", description: "Filter before mapping to control membership." }),
    concept({ id: "react-list-state", title: "List State Updates", description: "Add/remove/update items immutably." }),
    concept({ id: "react-empty-states", title: "Empty States", description: "Render helpful UI when a list is empty." })
  ],
  learningObjectives: ["Render lists with stable keys", "Update list state immutably"],
  practicalArtifacts: [
    artifact({
      id: "react-lists-todos",
      type: "code",
      title: "Todo list keys",
      language: "tsx",
      content: "export function TodoList({ items }: { items: { id: string; text: string }[] }) {\n  if (items.length === 0) return <p>No todos</p>;\n  return <ul>{items.map((item) => <li key={item.id}>{item.text}</li>)}</ul>;\n}",
      expectedOutput: "List items keyed by id, or empty message",
      explanation: "Stable keys and empty state.",
      conceptIds: ["react-map-lists", "react-keys", "react-empty-states"],
    }),
  ],
  commonMistakes: [
    mistake("react-keys-index", "Using index keys for reorderable lists", "Indexes look unique enough", "Prefer business ids when items can move.", ["react-key-stability"]),
    mistake("react-keys-missing", "Omitting keys in mapped children", "Ignoring the warning", "Provide a key on the top mapped element.", ["react-keys"])
  ],
  exercises: [
    exercise({
      id: "react-lists-exercise",
      title: "Filterable tags",
      instructions: ["Render tags from state.", "Add a button that removes a tag by id."],
      hints: ["filter to remove", "key={tag.id}"],
      expectedOutcome: "List re-renders without key warnings after removals.",
      conceptIds: ["react-list-state", "react-keys", "react-conditional-list"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("react-lists-and-keys", [
    "react-map-lists", "react-keys", "react-key-stability", "react-conditional-list", "react-list-state"
  ], ["concept-understanding", "code-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


const t5 = topic({
  id: "react-effects-and-data-fetching",
  title: "Effects and Data Fetching",
  aliases: ["useEffect", "fetching", "side effects"],
  description: "Synchronize with external systems using effects and cleanup.",
  difficulty: "intermediate",
  learningOrder: 5,
  prerequisiteIds: ["react-lists-and-keys"],
  relatedTopicIds: [],
  contaminationTerms: ["aws", "vpc", "kubernetes"],
  concepts: [
    concept({ id: "react-useeffect", title: "useEffect", description: "Run side effects after render." }),
    concept({ id: "react-effect-deps", title: "Dependency Arrays", description: "Re-run effects when listed values change." }),
    concept({ id: "react-cleanup", title: "Effect Cleanup", description: "Cancel subscriptions and in-flight work." }),
    concept({ id: "react-fetch-lifecycle", title: "Fetch Lifecycle", description: "Track loading, success, and error states." }),
    concept({ id: "react-race-conditions", title: "Race Conditions", description: "Ignore stale responses when inputs change." }),
    concept({ id: "react-effect-vs-event", title: "Effects vs Events", description: "Prefer event handlers for user-triggered actions." })
  ],
  learningObjectives: ["Fetch data with correct loading/error states", "Clean up effects to avoid races"],
  practicalArtifacts: [
    artifact({
      id: "react-effect-fetch",
      type: "code",
      title: "Fetch with cleanup",
      language: "tsx",
      content: "useEffect(() => {\n  let active = true;\n  fetch(`/api/items/${id}`).then(async (res) => {\n    const data = await res.json();\n    if (active) setItems(data);\n  });\n  return () => { active = false; };\n}, [id]);",
      expectedOutput: "State updates only for the latest id",
      explanation: "Dependency array plus cleanup flag prevents stale sets.",
      conceptIds: ["react-useeffect", "react-effect-deps", "react-cleanup", "react-race-conditions"],
    }),
  ],
  commonMistakes: [
    mistake("react-effect-empty-deps-fetch", "Fetching in an effect with wrong dependencies", "Wanting to run once always", "Include values the effect reads.", ["react-effect-deps"]),
    mistake("react-effect-no-cleanup", "Leaving fetch results to apply after unmount", "Ignoring warnings", "Cancel or gate setState in cleanup.", ["react-cleanup", "react-race-conditions"])
  ],
  exercises: [
    exercise({
      id: "react-effect-exercise",
      title: "User profile loader",
      instructions: ["Fetch a user by id from props.", "Show loading and error UI states."],
      hints: ["Track status in state", "Cleanup when id changes"],
      expectedOutcome: "Profile view handles loading/error/success without races.",
      conceptIds: ["react-fetch-lifecycle", "react-useeffect", "react-cleanup"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("react-effects-and-data-fetching", [
    "react-useeffect", "react-effect-deps", "react-cleanup", "react-fetch-lifecycle", "react-race-conditions"
  ], ["concept-understanding", "code-interpretation", "debugging", "practical-scenario", "expected-output"]),
});


const t6 = topic({
  id: "react-forms",
  title: "Forms",
  aliases: ["form handling", "validation ui"],
  description: "Build controlled forms with validation and submission handling.",
  difficulty: "intermediate",
  learningOrder: 6,
  prerequisiteIds: ["react-effects-and-data-fetching"],
  relatedTopicIds: [],
  contaminationTerms: ["aws", "vpc"],
  concepts: [
    concept({ id: "react-form-state", title: "Form State", description: "Model field values in component state or form libraries." }),
    concept({ id: "react-validation", title: "Validation", description: "Check constraints before submit." }),
    concept({ id: "react-submit-handling", title: "Submit Handling", description: "Prevent default and run async submit logic." }),
    concept({ id: "react-field-errors", title: "Field Errors", description: "Surface per-field messages near inputs." }),
    concept({ id: "react-disabled-submit", title: "Disabled Submit", description: "Block double submits while pending." }),
    concept({ id: "react-uncontrolled-escape", title: "Uncontrolled Escape Hatches", description: "Use refs sparingly for non-React inputs." })
  ],
  learningObjectives: ["Implement controlled forms", "Validate and submit safely"],
  practicalArtifacts: [
    artifact({
      id: "react-form-signup",
      type: "code",
      title: "Signup form submit",
      language: "tsx",
      content: "async function onSubmit(e: React.FormEvent) {\n  e.preventDefault();\n  if (!email.includes('@')) { setError('Invalid email'); return; }\n  setPending(true);\n  await createAccount({ email });\n  setPending(false);\n}",
      expectedOutput: "Invalid emails show an error; valid ones submit once",
      explanation: "Prevent default, validate, and guard pending submits.",
      conceptIds: ["react-submit-handling", "react-validation", "react-disabled-submit"],
    }),
  ],
  commonMistakes: [
    mistake("react-form-no-prevent", "Forgetting preventDefault on submit", "Full page reload", "Call preventDefault in the handler.", ["react-submit-handling"]),
    mistake("react-form-validate-only-css", "Relying only on browser CSS for validation", "Missing accessible errors", "Keep explicit messages in UI state.", ["react-field-errors", "react-validation"])
  ],
  exercises: [
    exercise({
      id: "react-form-exercise",
      title: "Login form",
      instructions: ["Controlled email/password fields.", "Disable submit while pending and show one field error."],
      hints: ["Track pending boolean", "Validate empty password"],
      expectedOutcome: "Form validates and submits without reload.",
      conceptIds: ["react-form-state", "react-field-errors", "react-disabled-submit"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("react-forms", [
    "react-form-state", "react-validation", "react-submit-handling", "react-field-errors", "react-disabled-submit"
  ], ["concept-understanding", "code-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


const t7 = topic({
  id: "react-routing",
  title: "Routing",
  aliases: ["react router", "navigation", "routes"],
  description: "Navigate between views with client-side routes and params.",
  difficulty: "intermediate",
  learningOrder: 7,
  prerequisiteIds: ["react-forms"],
  relatedTopicIds: [],
  contaminationTerms: ["aws", "vpc", "kubernetes"],
  concepts: [
    concept({ id: "react-router-routes", title: "Route Config", description: "Map paths to screen components." }),
    concept({ id: "react-link-nav", title: "Link Navigation", description: "Navigate without full reloads." }),
    concept({ id: "react-route-params", title: "Route Params", description: "Read dynamic segments from the URL." }),
    concept({ id: "react-nested-routes", title: "Nested Routes", description: "Compose layouts with outlet child routes." }),
    concept({ id: "react-search-params", title: "Search Params", description: "Encode filters and UI state in the query string." }),
    concept({ id: "react-protected-routes", title: "Protected Routes", description: "Redirect unauthenticated users." })
  ],
  learningObjectives: ["Configure routes and links", "Read params for detail views"],
  practicalArtifacts: [
    artifact({
      id: "react-routing-params",
      type: "code",
      title: "Detail route param",
      language: "tsx",
      content: "const { itemId } = useParams();\nreturn <ItemDetail id={itemId!} />;",
      expectedOutput: "Detail view receives id from the URL",
      explanation: "Dynamic segment becomes a param.",
      conceptIds: ["react-route-params", "react-router-routes"],
    }),
  ],
  commonMistakes: [
    mistake("react-routing-anchor", "Using plain <a href> for internal navigation", "Full document reloads", "Use the router Link/navigate APIs.", ["react-link-nav"]),
    mistake("react-routing-param-miss", "Hard-coding detail ids instead of params", "Broken deep links", "Read ids from the route.", ["react-route-params"])
  ],
  exercises: [
    exercise({
      id: "react-routing-exercise",
      title: "List and detail routes",
      instructions: ["Add /items and /items/:itemId routes.", "Link from list rows into detail."],
      hints: ["useParams in detail", "Link to={`/items/${id}`}"],
      expectedOutcome: "Clicking a row opens the matching detail route.",
      conceptIds: ["react-router-routes", "react-link-nav", "react-route-params"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("react-routing", [
    "react-router-routes", "react-link-nav", "react-route-params", "react-nested-routes", "react-search-params"
  ], ["concept-understanding", "code-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


const t8 = topic({
  id: "react-practical-ui-project",
  title: "Practical React UI Project",
  aliases: ["react project", "react capstone"],
  description: "Integrate components, state, effects, forms, and routing into a small app.",
  difficulty: "intermediate",
  learningOrder: 8,
  prerequisiteIds: ["react-routing"],
  relatedTopicIds: [],
  contaminationTerms: ["aws", "vpc", "ec2"],
  concepts: [
    concept({ id: "react-project-ia", title: "Information Architecture", description: "Define screens and navigation before coding." }),
    concept({ id: "react-project-state-boundary", title: "State Boundaries", description: "Keep state close to where it is used." }),
    concept({ id: "react-project-api-contract", title: "API Contracts", description: "Agree on request/response shapes early." }),
    concept({ id: "react-project-loading-ux", title: "Loading UX", description: "Show pending and empty states on every async view." }),
    concept({ id: "react-project-error-ux", title: "Error UX", description: "Recover from failed fetches and submits." }),
    concept({ id: "react-project-demo-script", title: "Demo Script", description: "Prove create/list/detail flows end to end." })
  ],
  learningObjectives: ["Ship a small multi-route React app", "Handle loading and error UX"],
  practicalArtifacts: [
    artifact({
      id: "react-project-workflow",
      type: "workflow",
      title: "Notes app workflow",
      
      content: "1) List notes\n2) Create note form\n3) Detail route\n4) Delete with confirmation\n5) Persist via API",
      expectedOutput: "Working list/create/detail/delete loop",
      explanation: "End-to-end UI workflow for the practical project.",
      conceptIds: ["react-project-ia", "react-project-api-contract", "react-project-demo-script"],
    }),
  ],
  commonMistakes: [
    mistake("react-project-global-everything", "Putting all server data in one global blob", "Premature centralization", "Colocate state; share only what multiple routes need.", ["react-project-state-boundary"]),
    mistake("react-project-no-error", "Happy-path only demos", "Ignoring failed network calls", "Add explicit error and retry UI.", ["react-project-error-ux"])
  ],
  exercises: [
    exercise({
      id: "react-project-exercise",
      title: "Notes mini-app",
      instructions: ["Implement list, create, and detail routes for notes.", "Include loading and error states on fetch."],
      hints: ["Reuse Card/List components", "Keep API helpers outside components"],
      expectedOutcome: "Demoable notes app covering the core React skills.",
      conceptIds: ["react-project-ia", "react-project-loading-ux", "react-project-error-ux", "react-project-demo-script"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("react-practical-ui-project", [
    "react-project-ia", "react-project-state-boundary", "react-project-api-contract", "react-project-loading-ux", "react-project-error-ux"
  ], ["concept-understanding", "code-interpretation", "debugging", "expected-output", "practical-scenario"]),
});


export const reactKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-react",
  title: "React",
  aliases: ["react", "learn react", "react.js", "reactjs", "react developer"],
  category: "Web Development",
  description:
    "Canonical React curriculum covering JSX, components, state, lists, effects, forms, routing, and a practical UI project.",
  topics: [t1, t2, t3, t4, t5, t6, t7, t8],
});

