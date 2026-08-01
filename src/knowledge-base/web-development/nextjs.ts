import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","kubernetes pod","sql join","angular module"];

const nextjs_app_router_basicsTopic = topic({
  id: "nextjs-app-router-basics",
  title: "App Router Basics",
  aliases: ["app router","next.js routing"],
  description: "Create routes with the app directory, layouts, and pages.",
  learningOrder: 1,
  
  relatedTopicIds: ["nextjs-server-and-client"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "nextjs-app-directory",
      title: "app Directory",
      description: "app Directory applied in this topic.",
    }),
    concept({
      id: "nextjs-page-tsx",
      title: "page.tsx",
      description: "page.tsx applied in this topic.",
    }),
    concept({
      id: "nextjs-layout-tsx",
      title: "layout.tsx",
      description: "layout.tsx applied in this topic.",
    }),
    concept({
      id: "nextjs-nested-routes",
      title: "Nested Routes",
      description: "Nested Routes applied in this topic.",
    }),
    concept({
      id: "nextjs-link-component",
      title: "Link Component",
      description: "Link Component applied in this topic.",
    }),
    concept({
      id: "nextjs-metadata",
      title: "Metadata",
      description: "Metadata applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply app Directory correctly","Explain page.tsx in context"],
  practicalArtifacts: [
    artifact({
      id: "nextjs-app-router-basics-artifact",
      type: "code",
      title: "App Router Basics worked example",
      
      content: "// Practical example for App Router Basics\n// Covers: app Directory, page.tsx, layout.tsx",
      
      explanation: "Demonstrates app Directory, page.tsx, layout.tsx.",
      conceptIds: ["nextjs-app-directory","nextjs-page-tsx","nextjs-layout-tsx","nextjs-nested-routes"],
    }),
  ],
  commonMistakes: [
    mistake(
      "nextjs-app-router-basics-mistake-1",
      "Misapplying app Directory",
      "Skipping hands-on checks in App Router Basics",
      "Practice app Directory with a tiny example first.",
      ["nextjs-app-directory"],
    ),
    mistake(
      "nextjs-app-router-basics-mistake-2",
      "Pulling unrelated-domain demos into App Router Basics",
      "Defaulting to out-of-domain snippets",
      "Stay inside App Router Basics concepts.",
      ["nextjs-page-tsx"],
    ),
  ],
  exercises: [
    exercise({
      id: "nextjs-app-router-basics-exercise",
      title: "App Router Basics mini exercise",
      instructions: ["Build a small example covering app Directory.","Extend it with page.tsx.","Verify behavior related to layout.tsx."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for App Router Basics.",
      conceptIds: ["nextjs-app-directory","nextjs-page-tsx","nextjs-layout-tsx"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("nextjs-app-router-basics", ["nextjs-app-directory","nextjs-page-tsx","nextjs-layout-tsx","nextjs-nested-routes","nextjs-link-component"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const nextjs_server_and_clientTopic = topic({
  id: "nextjs-server-and-client",
  title: "Server and Client Components",
  aliases: ["server components","use client"],
  description: "Choose server vs client components and mark client boundaries.",
  learningOrder: 2,
  prerequisiteIds: ["nextjs-app-router-basics"],
  relatedTopicIds: ["nextjs-routing-and-navigation"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "nextjs-server-components",
      title: "Server Components",
      description: "Server Components applied in this topic.",
    }),
    concept({
      id: "nextjs-client-components",
      title: "Client Components",
      description: "Client Components applied in this topic.",
    }),
    concept({
      id: "nextjs-use-client",
      title: "use client",
      description: "use client applied in this topic.",
    }),
    concept({
      id: "nextjs-passing-props-across-boundary",
      title: "Passing Props Across Boundary",
      description: "Passing Props Across Boundary applied in this topic.",
    }),
    concept({
      id: "nextjs-hooks-restriction",
      title: "Hooks Restriction",
      description: "Hooks Restriction applied in this topic.",
    }),
    concept({
      id: "nextjs-bundle-impact",
      title: "Bundle Impact",
      description: "Bundle Impact applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Server Components correctly","Explain Client Components in context"],
  practicalArtifacts: [
    artifact({
      id: "nextjs-server-and-client-artifact",
      type: "code",
      title: "Server and Client Components worked example",
      
      content: "// Practical example for Server and Client Components\n// Covers: Server Components, Client Components, use client",
      
      explanation: "Demonstrates Server Components, Client Components, use client.",
      conceptIds: ["nextjs-server-components","nextjs-client-components","nextjs-use-client","nextjs-passing-props-across-boundary"],
    }),
  ],
  commonMistakes: [
    mistake(
      "nextjs-server-and-client-mistake-1",
      "Misapplying Server Components",
      "Skipping hands-on checks in Server and Client Components",
      "Practice Server Components with a tiny example first.",
      ["nextjs-server-components"],
    ),
    mistake(
      "nextjs-server-and-client-mistake-2",
      "Pulling unrelated-domain demos into Server and Client Components",
      "Defaulting to out-of-domain snippets",
      "Stay inside Server and Client Components concepts.",
      ["nextjs-client-components"],
    ),
  ],
  exercises: [
    exercise({
      id: "nextjs-server-and-client-exercise",
      title: "Server and Client Components mini exercise",
      instructions: ["Build a small example covering Server Components.","Extend it with Client Components.","Verify behavior related to use client."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Server and Client Components.",
      conceptIds: ["nextjs-server-components","nextjs-client-components","nextjs-use-client"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("nextjs-server-and-client", ["nextjs-server-components","nextjs-client-components","nextjs-use-client","nextjs-passing-props-across-boundary","nextjs-hooks-restriction"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const nextjs_routing_and_navigationTopic = topic({
  id: "nextjs-routing-and-navigation",
  title: "Routing and Navigation",
  aliases: ["next.js navigation","dynamic routes"],
  description: "Use dynamic segments, search params, and programmatic navigation.",
  learningOrder: 3,
  prerequisiteIds: ["nextjs-server-and-client"],
  relatedTopicIds: ["nextjs-data-fetching"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "nextjs-dynamic-segments",
      title: "Dynamic Segments",
      description: "Dynamic Segments applied in this topic.",
    }),
    concept({
      id: "nextjs-searchparams",
      title: "searchParams",
      description: "searchParams applied in this topic.",
    }),
    concept({
      id: "nextjs-userouter",
      title: "useRouter",
      description: "useRouter applied in this topic.",
    }),
    concept({
      id: "nextjs-redirect",
      title: "redirect",
      description: "redirect applied in this topic.",
    }),
    concept({
      id: "nextjs-notfound",
      title: "notFound",
      description: "notFound applied in this topic.",
    }),
    concept({
      id: "nextjs-parallel-routes-intro",
      title: "Parallel Routes Intro",
      description: "Parallel Routes Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Dynamic Segments correctly","Explain searchParams in context"],
  practicalArtifacts: [
    artifact({
      id: "nextjs-routing-and-navigation-artifact",
      type: "code",
      title: "Routing and Navigation worked example",
      
      content: "// Practical example for Routing and Navigation\n// Covers: Dynamic Segments, searchParams, useRouter",
      
      explanation: "Demonstrates Dynamic Segments, searchParams, useRouter.",
      conceptIds: ["nextjs-dynamic-segments","nextjs-searchparams","nextjs-userouter","nextjs-redirect"],
    }),
  ],
  commonMistakes: [
    mistake(
      "nextjs-routing-and-navigation-mistake-1",
      "Misapplying Dynamic Segments",
      "Skipping hands-on checks in Routing and Navigation",
      "Practice Dynamic Segments with a tiny example first.",
      ["nextjs-dynamic-segments"],
    ),
    mistake(
      "nextjs-routing-and-navigation-mistake-2",
      "Pulling unrelated-domain demos into Routing and Navigation",
      "Defaulting to out-of-domain snippets",
      "Stay inside Routing and Navigation concepts.",
      ["nextjs-searchparams"],
    ),
  ],
  exercises: [
    exercise({
      id: "nextjs-routing-and-navigation-exercise",
      title: "Routing and Navigation mini exercise",
      instructions: ["Build a small example covering Dynamic Segments.","Extend it with searchParams.","Verify behavior related to useRouter."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Routing and Navigation.",
      conceptIds: ["nextjs-dynamic-segments","nextjs-searchparams","nextjs-userouter"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("nextjs-routing-and-navigation", ["nextjs-dynamic-segments","nextjs-searchparams","nextjs-userouter","nextjs-redirect","nextjs-notfound"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const nextjs_data_fetchingTopic = topic({
  id: "nextjs-data-fetching",
  title: "Data Fetching",
  aliases: ["next.js data fetching","revalidate"],
  description: "Fetch data in server components and cache/revalidate responses.",
  learningOrder: 4,
  prerequisiteIds: ["nextjs-routing-and-navigation"],
  relatedTopicIds: ["nextjs-route-handlers"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "nextjs-fetch-in-server-components",
      title: "fetch in Server Components",
      description: "fetch in Server Components applied in this topic.",
    }),
    concept({
      id: "nextjs-caching-defaults",
      title: "Caching Defaults",
      description: "Caching Defaults applied in this topic.",
    }),
    concept({
      id: "nextjs-revalidate",
      title: "revalidate",
      description: "revalidate applied in this topic.",
    }),
    concept({
      id: "nextjs-loading-ui",
      title: "Loading UI",
      description: "Loading UI applied in this topic.",
    }),
    concept({
      id: "nextjs-error-ui",
      title: "Error UI",
      description: "Error UI applied in this topic.",
    }),
    concept({
      id: "nextjs-streaming-intro",
      title: "Streaming Intro",
      description: "Streaming Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply fetch in Server Components correctly","Explain Caching Defaults in context"],
  practicalArtifacts: [
    artifact({
      id: "nextjs-data-fetching-artifact",
      type: "code",
      title: "Data Fetching worked example",
      
      content: "// Practical example for Data Fetching\n// Covers: fetch in Server Components, Caching Defaults, revalidate",
      
      explanation: "Demonstrates fetch in Server Components, Caching Defaults, revalidate.",
      conceptIds: ["nextjs-fetch-in-server-components","nextjs-caching-defaults","nextjs-revalidate","nextjs-loading-ui"],
    }),
  ],
  commonMistakes: [
    mistake(
      "nextjs-data-fetching-mistake-1",
      "Misapplying fetch in Server Components",
      "Skipping hands-on checks in Data Fetching",
      "Practice fetch in Server Components with a tiny example first.",
      ["nextjs-fetch-in-server-components"],
    ),
    mistake(
      "nextjs-data-fetching-mistake-2",
      "Pulling unrelated-domain demos into Data Fetching",
      "Defaulting to out-of-domain snippets",
      "Stay inside Data Fetching concepts.",
      ["nextjs-caching-defaults"],
    ),
  ],
  exercises: [
    exercise({
      id: "nextjs-data-fetching-exercise",
      title: "Data Fetching mini exercise",
      instructions: ["Build a small example covering fetch in Server Components.","Extend it with Caching Defaults.","Verify behavior related to revalidate."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Data Fetching.",
      conceptIds: ["nextjs-fetch-in-server-components","nextjs-caching-defaults","nextjs-revalidate"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("nextjs-data-fetching", ["nextjs-fetch-in-server-components","nextjs-caching-defaults","nextjs-revalidate","nextjs-loading-ui","nextjs-error-ui"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const nextjs_route_handlersTopic = topic({
  id: "nextjs-route-handlers",
  title: "Route Handlers and Mutations",
  aliases: ["api routes","server actions"],
  description: "Implement API route handlers and server actions for mutations.",
  learningOrder: 5,
  prerequisiteIds: ["nextjs-data-fetching"],
  relatedTopicIds: ["nextjs-styling-and-assets"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "nextjs-route-ts-handlers",
      title: "route.ts Handlers",
      description: "route.ts Handlers applied in this topic.",
    }),
    concept({
      id: "nextjs-get-post-handlers",
      title: "GET/POST Handlers",
      description: "GET/POST Handlers applied in this topic.",
    }),
    concept({
      id: "nextjs-request-response",
      title: "Request/Response",
      description: "Request/Response applied in this topic.",
    }),
    concept({
      id: "nextjs-server-actions",
      title: "Server Actions",
      description: "Server Actions applied in this topic.",
    }),
    concept({
      id: "nextjs-form-actions",
      title: "Form Actions",
      description: "Form Actions applied in this topic.",
    }),
    concept({
      id: "nextjs-validation-basics",
      title: "Validation Basics",
      description: "Validation Basics applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply route.ts Handlers correctly","Explain GET/POST Handlers in context"],
  practicalArtifacts: [
    artifact({
      id: "nextjs-route-handlers-artifact",
      type: "code",
      title: "Route Handlers and Mutations worked example",
      
      content: "// Practical example for Route Handlers and Mutations\n// Covers: route.ts Handlers, GET/POST Handlers, Request/Response",
      
      explanation: "Demonstrates route.ts Handlers, GET/POST Handlers, Request/Response.",
      conceptIds: ["nextjs-route-ts-handlers","nextjs-get-post-handlers","nextjs-request-response","nextjs-server-actions"],
    }),
  ],
  commonMistakes: [
    mistake(
      "nextjs-route-handlers-mistake-1",
      "Misapplying route.ts Handlers",
      "Skipping hands-on checks in Route Handlers and Mutations",
      "Practice route.ts Handlers with a tiny example first.",
      ["nextjs-route-ts-handlers"],
    ),
    mistake(
      "nextjs-route-handlers-mistake-2",
      "Pulling unrelated-domain demos into Route Handlers and Mutations",
      "Defaulting to out-of-domain snippets",
      "Stay inside Route Handlers and Mutations concepts.",
      ["nextjs-get-post-handlers"],
    ),
  ],
  exercises: [
    exercise({
      id: "nextjs-route-handlers-exercise",
      title: "Route Handlers and Mutations mini exercise",
      instructions: ["Build a small example covering route.ts Handlers.","Extend it with GET/POST Handlers.","Verify behavior related to Request/Response."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Route Handlers and Mutations.",
      conceptIds: ["nextjs-route-ts-handlers","nextjs-get-post-handlers","nextjs-request-response"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("nextjs-route-handlers", ["nextjs-route-ts-handlers","nextjs-get-post-handlers","nextjs-request-response","nextjs-server-actions","nextjs-form-actions"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const nextjs_styling_and_assetsTopic = topic({
  id: "nextjs-styling-and-assets",
  title: "Styling and Assets",
  aliases: ["next/image","css modules"],
  description: "Style apps with CSS Modules/global CSS and optimize images.",
  learningOrder: 6,
  prerequisiteIds: ["nextjs-route-handlers"],
  
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "nextjs-global-css",
      title: "Global CSS",
      description: "Global CSS applied in this topic.",
    }),
    concept({
      id: "nextjs-css-modules",
      title: "CSS Modules",
      description: "CSS Modules applied in this topic.",
    }),
    concept({
      id: "nextjs-next-image",
      title: "next/image",
      description: "next/image applied in this topic.",
    }),
    concept({
      id: "nextjs-public-assets",
      title: "Public Assets",
      description: "Public Assets applied in this topic.",
    }),
    concept({
      id: "nextjs-font-optimization",
      title: "Font Optimization",
      description: "Font Optimization applied in this topic.",
    }),
    concept({
      id: "nextjs-environment-variables",
      title: "Environment Variables",
      description: "Environment Variables applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Global CSS correctly","Explain CSS Modules in context"],
  practicalArtifacts: [
    artifact({
      id: "nextjs-styling-and-assets-artifact",
      type: "code",
      title: "Styling and Assets worked example",
      
      content: "// Practical example for Styling and Assets\n// Covers: Global CSS, CSS Modules, next/image",
      
      explanation: "Demonstrates Global CSS, CSS Modules, next/image.",
      conceptIds: ["nextjs-global-css","nextjs-css-modules","nextjs-next-image","nextjs-public-assets"],
    }),
  ],
  commonMistakes: [
    mistake(
      "nextjs-styling-and-assets-mistake-1",
      "Misapplying Global CSS",
      "Skipping hands-on checks in Styling and Assets",
      "Practice Global CSS with a tiny example first.",
      ["nextjs-global-css"],
    ),
    mistake(
      "nextjs-styling-and-assets-mistake-2",
      "Pulling unrelated-domain demos into Styling and Assets",
      "Defaulting to out-of-domain snippets",
      "Stay inside Styling and Assets concepts.",
      ["nextjs-css-modules"],
    ),
  ],
  exercises: [
    exercise({
      id: "nextjs-styling-and-assets-exercise",
      title: "Styling and Assets mini exercise",
      instructions: ["Build a small example covering Global CSS.","Extend it with CSS Modules.","Verify behavior related to next/image."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Styling and Assets.",
      conceptIds: ["nextjs-global-css","nextjs-css-modules","nextjs-next-image"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("nextjs-styling-and-assets", ["nextjs-global-css","nextjs-css-modules","nextjs-next-image","nextjs-public-assets","nextjs-font-optimization"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

export const nextjsKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-nextjs",
  title: "Next.js",
  aliases: ["next.js","nextjs","learn next.js","learn nextjs","next js"],
  category: "Web Development",
  description: "Next.js starter curriculum covering App Router, server/client components, routing, data fetching, and API routes.",
  topics: [nextjs_app_router_basicsTopic, nextjs_server_and_clientTopic, nextjs_routing_and_navigationTopic, nextjs_data_fetchingTopic, nextjs_route_handlersTopic, nextjs_styling_and_assetsTopic],
});
