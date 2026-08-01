import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","kubernetes pod","sql join","angular module","react hooks"];

const vue_sfc_basicsTopic = topic({
  id: "vue-sfc-basics",
  title: "Single File Components",
  aliases: ["vue sfc","single file components"],
  description: "Author Vue SFCs with template, script, and style blocks.",
  learningOrder: 1,
  
  relatedTopicIds: ["vue-reactivity"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "vue-sfc-structure",
      title: "SFC Structure",
      description: "SFC Structure applied in this topic.",
    }),
    concept({
      id: "vue-template",
      title: "template",
      description: "template applied in this topic.",
    }),
    concept({
      id: "vue-script-setup",
      title: "script setup",
      description: "script setup applied in this topic.",
    }),
    concept({
      id: "vue-scoped-style",
      title: "scoped style",
      description: "scoped style applied in this topic.",
    }),
    concept({
      id: "vue-root-elements",
      title: "Root Elements",
      description: "Root Elements applied in this topic.",
    }),
    concept({
      id: "vue-component-naming",
      title: "Component Naming",
      description: "Component Naming applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply SFC Structure correctly","Explain template in context"],
  practicalArtifacts: [
    artifact({
      id: "vue-sfc-basics-artifact",
      type: "code",
      title: "Hello SFC",
      language: "vue",
      content: "<script setup>\nconst msg = \"Hello Vue\";\n</script>\n<template>\n  <h1>{{ msg }}</h1>\n</template>",
      expectedOutput: "Renders Hello Vue",
      explanation: "Minimal script setup SFC.",
      conceptIds: ["vue-sfc-structure","vue-template","vue-script-setup","vue-scoped-style"],
    }),
  ],
  commonMistakes: [
    mistake(
      "vue-sfc-basics-mistake-1",
      "Misapplying SFC Structure",
      "Skipping hands-on checks in Single File Components",
      "Practice SFC Structure with a tiny example first.",
      ["vue-sfc-structure"],
    ),
    mistake(
      "vue-sfc-basics-mistake-2",
      "Pulling unrelated-domain demos into Single File Components",
      "Defaulting to out-of-domain snippets",
      "Stay inside Single File Components concepts.",
      ["vue-template"],
    ),
  ],
  exercises: [
    exercise({
      id: "vue-sfc-basics-exercise",
      title: "Single File Components mini exercise",
      instructions: ["Build a small example covering SFC Structure.","Extend it with template.","Verify behavior related to script setup."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Single File Components.",
      conceptIds: ["vue-sfc-structure","vue-template","vue-script-setup"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("vue-sfc-basics", ["vue-sfc-structure","vue-template","vue-script-setup","vue-scoped-style","vue-root-elements"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const vue_reactivityTopic = topic({
  id: "vue-reactivity",
  title: "Reactivity Fundamentals",
  aliases: ["vue reactivity","ref reactive"],
  description: "Track state with ref/reactive and derive values with computed.",
  learningOrder: 2,
  prerequisiteIds: ["vue-sfc-basics"],
  relatedTopicIds: ["vue-composition-api"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "vue-ref",
      title: "ref",
      description: "ref applied in this topic.",
    }),
    concept({
      id: "vue-reactive",
      title: "reactive",
      description: "reactive applied in this topic.",
    }),
    concept({
      id: "vue-computed",
      title: "computed",
      description: "computed applied in this topic.",
    }),
    concept({
      id: "vue-watch",
      title: "watch",
      description: "watch applied in this topic.",
    }),
    concept({
      id: "vue-template-refs",
      title: "Template Refs",
      description: "Template Refs applied in this topic.",
    }),
    concept({
      id: "vue-reactivity-caveats",
      title: "Reactivity Caveats",
      description: "Reactivity Caveats applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply ref correctly","Explain reactive in context"],
  practicalArtifacts: [
    artifact({
      id: "vue-reactivity-artifact",
      type: "code",
      title: "Reactivity Fundamentals worked example",
      
      content: "// Practical example for Reactivity Fundamentals\n// Covers: ref, reactive, computed",
      
      explanation: "Demonstrates ref, reactive, computed.",
      conceptIds: ["vue-ref","vue-reactive","vue-computed","vue-watch"],
    }),
  ],
  commonMistakes: [
    mistake(
      "vue-reactivity-mistake-1",
      "Misapplying ref",
      "Skipping hands-on checks in Reactivity Fundamentals",
      "Practice ref with a tiny example first.",
      ["vue-ref"],
    ),
    mistake(
      "vue-reactivity-mistake-2",
      "Pulling unrelated-domain demos into Reactivity Fundamentals",
      "Defaulting to out-of-domain snippets",
      "Stay inside Reactivity Fundamentals concepts.",
      ["vue-reactive"],
    ),
  ],
  exercises: [
    exercise({
      id: "vue-reactivity-exercise",
      title: "Reactivity Fundamentals mini exercise",
      instructions: ["Build a small example covering ref.","Extend it with reactive.","Verify behavior related to computed."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Reactivity Fundamentals.",
      conceptIds: ["vue-ref","vue-reactive","vue-computed"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("vue-reactivity", ["vue-ref","vue-reactive","vue-computed","vue-watch","vue-template-refs"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const vue_composition_apiTopic = topic({
  id: "vue-composition-api",
  title: "Composition API Patterns",
  aliases: ["composition api","composables"],
  description: "Organize logic with composables and lifecycle hooks.",
  learningOrder: 3,
  prerequisiteIds: ["vue-reactivity"],
  relatedTopicIds: ["vue-components-and-props"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "vue-setup-syntax",
      title: "setup Syntax",
      description: "setup Syntax applied in this topic.",
    }),
    concept({
      id: "vue-composables",
      title: "Composables",
      description: "Composables applied in this topic.",
    }),
    concept({
      id: "vue-onmounted",
      title: "onMounted",
      description: "onMounted applied in this topic.",
    }),
    concept({
      id: "vue-props",
      title: "Props",
      description: "Props applied in this topic.",
    }),
    concept({
      id: "vue-emits",
      title: "Emits",
      description: "Emits applied in this topic.",
    }),
    concept({
      id: "vue-provide-inject-intro",
      title: "Provide/Inject Intro",
      description: "Provide/Inject Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply setup Syntax correctly","Explain Composables in context"],
  practicalArtifacts: [
    artifact({
      id: "vue-composition-api-artifact",
      type: "code",
      title: "Composition API Patterns worked example",
      
      content: "// Practical example for Composition API Patterns\n// Covers: setup Syntax, Composables, onMounted",
      
      explanation: "Demonstrates setup Syntax, Composables, onMounted.",
      conceptIds: ["vue-setup-syntax","vue-composables","vue-onmounted","vue-props"],
    }),
  ],
  commonMistakes: [
    mistake(
      "vue-composition-api-mistake-1",
      "Misapplying setup Syntax",
      "Skipping hands-on checks in Composition API Patterns",
      "Practice setup Syntax with a tiny example first.",
      ["vue-setup-syntax"],
    ),
    mistake(
      "vue-composition-api-mistake-2",
      "Pulling unrelated-domain demos into Composition API Patterns",
      "Defaulting to out-of-domain snippets",
      "Stay inside Composition API Patterns concepts.",
      ["vue-composables"],
    ),
  ],
  exercises: [
    exercise({
      id: "vue-composition-api-exercise",
      title: "Composition API Patterns mini exercise",
      instructions: ["Build a small example covering setup Syntax.","Extend it with Composables.","Verify behavior related to onMounted."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Composition API Patterns.",
      conceptIds: ["vue-setup-syntax","vue-composables","vue-onmounted"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("vue-composition-api", ["vue-setup-syntax","vue-composables","vue-onmounted","vue-props","vue-emits"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const vue_components_and_propsTopic = topic({
  id: "vue-components-and-props",
  title: "Components Props and Events",
  aliases: ["vue props","vue emits"],
  description: "Split UI into child components communicating via props and emits.",
  learningOrder: 4,
  prerequisiteIds: ["vue-composition-api"],
  relatedTopicIds: ["vue-routing"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "vue-child-components",
      title: "Child Components",
      description: "Child Components applied in this topic.",
    }),
    concept({
      id: "vue-props",
      title: "props",
      description: "props applied in this topic.",
    }),
    concept({
      id: "vue-defineprops",
      title: "defineProps",
      description: "defineProps applied in this topic.",
    }),
    concept({
      id: "vue-emits",
      title: "emits",
      description: "emits applied in this topic.",
    }),
    concept({
      id: "vue-v-model-on-components",
      title: "v-model on Components",
      description: "v-model on Components applied in this topic.",
    }),
    concept({
      id: "vue-slots-intro",
      title: "Slots Intro",
      description: "Slots Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Child Components correctly","Explain props in context"],
  practicalArtifacts: [
    artifact({
      id: "vue-components-and-props-artifact",
      type: "code",
      title: "Components Props and Events worked example",
      
      content: "// Practical example for Components Props and Events\n// Covers: Child Components, props, defineProps",
      
      explanation: "Demonstrates Child Components, props, defineProps.",
      conceptIds: ["vue-child-components","vue-props","vue-defineprops","vue-emits"],
    }),
  ],
  commonMistakes: [
    mistake(
      "vue-components-and-props-mistake-1",
      "Misapplying Child Components",
      "Skipping hands-on checks in Components Props and Events",
      "Practice Child Components with a tiny example first.",
      ["vue-child-components"],
    ),
    mistake(
      "vue-components-and-props-mistake-2",
      "Pulling unrelated-domain demos into Components Props and Events",
      "Defaulting to out-of-domain snippets",
      "Stay inside Components Props and Events concepts.",
      ["vue-props"],
    ),
  ],
  exercises: [
    exercise({
      id: "vue-components-and-props-exercise",
      title: "Components Props and Events mini exercise",
      instructions: ["Build a small example covering Child Components.","Extend it with props.","Verify behavior related to defineProps."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Components Props and Events.",
      conceptIds: ["vue-child-components","vue-props","vue-defineprops"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("vue-components-and-props", ["vue-child-components","vue-props","vue-defineprops","vue-emits","vue-v-model-on-components"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const vue_routingTopic = topic({
  id: "vue-routing",
  title: "Vue Router",
  aliases: ["vue router","routing"],
  description: "Navigate views with Vue Router routes and params.",
  learningOrder: 5,
  prerequisiteIds: ["vue-components-and-props"],
  relatedTopicIds: ["vue-state-basics"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "vue-createrouter",
      title: "createRouter",
      description: "createRouter applied in this topic.",
    }),
    concept({
      id: "vue-route-records",
      title: "Route Records",
      description: "Route Records applied in this topic.",
    }),
    concept({
      id: "vue-router-link",
      title: "router-link",
      description: "router-link applied in this topic.",
    }),
    concept({
      id: "vue-router-view",
      title: "router-view",
      description: "router-view applied in this topic.",
    }),
    concept({
      id: "vue-route-params",
      title: "Route Params",
      description: "Route Params applied in this topic.",
    }),
    concept({
      id: "vue-navigation-guards-intro",
      title: "Navigation Guards Intro",
      description: "Navigation Guards Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply createRouter correctly","Explain Route Records in context"],
  practicalArtifacts: [
    artifact({
      id: "vue-routing-artifact",
      type: "code",
      title: "Vue Router worked example",
      
      content: "// Practical example for Vue Router\n// Covers: createRouter, Route Records, router-link",
      
      explanation: "Demonstrates createRouter, Route Records, router-link.",
      conceptIds: ["vue-createrouter","vue-route-records","vue-router-link","vue-router-view"],
    }),
  ],
  commonMistakes: [
    mistake(
      "vue-routing-mistake-1",
      "Misapplying createRouter",
      "Skipping hands-on checks in Vue Router",
      "Practice createRouter with a tiny example first.",
      ["vue-createrouter"],
    ),
    mistake(
      "vue-routing-mistake-2",
      "Pulling unrelated-domain demos into Vue Router",
      "Defaulting to out-of-domain snippets",
      "Stay inside Vue Router concepts.",
      ["vue-route-records"],
    ),
  ],
  exercises: [
    exercise({
      id: "vue-routing-exercise",
      title: "Vue Router mini exercise",
      instructions: ["Build a small example covering createRouter.","Extend it with Route Records.","Verify behavior related to router-link."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Vue Router.",
      conceptIds: ["vue-createrouter","vue-route-records","vue-router-link"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("vue-routing", ["vue-createrouter","vue-route-records","vue-router-link","vue-router-view","vue-route-params"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const vue_state_basicsTopic = topic({
  id: "vue-state-basics",
  title: "Shared State Basics",
  aliases: ["pinia","vue state"],
  description: "Share state with provide/inject and a minimal Pinia store.",
  learningOrder: 6,
  prerequisiteIds: ["vue-routing"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "vue-local-vs-shared-state",
      title: "Local vs Shared State",
      description: "Local vs Shared State applied in this topic.",
    }),
    concept({
      id: "vue-provide-inject",
      title: "provide/inject",
      description: "provide/inject applied in this topic.",
    }),
    concept({
      id: "vue-pinia-store",
      title: "Pinia Store",
      description: "Pinia Store applied in this topic.",
    }),
    concept({
      id: "vue-state",
      title: "state",
      description: "state applied in this topic.",
    }),
    concept({
      id: "vue-actions",
      title: "actions",
      description: "actions applied in this topic.",
    }),
    concept({
      id: "vue-getters",
      title: "getters",
      description: "getters applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Local vs Shared State correctly","Explain provide/inject in context"],
  practicalArtifacts: [
    artifact({
      id: "vue-state-basics-artifact",
      type: "code",
      title: "Shared State Basics worked example",
      
      content: "// Practical example for Shared State Basics\n// Covers: Local vs Shared State, provide/inject, Pinia Store",
      
      explanation: "Demonstrates Local vs Shared State, provide/inject, Pinia Store.",
      conceptIds: ["vue-local-vs-shared-state","vue-provide-inject","vue-pinia-store","vue-state"],
    }),
  ],
  commonMistakes: [
    mistake(
      "vue-state-basics-mistake-1",
      "Misapplying Local vs Shared State",
      "Skipping hands-on checks in Shared State Basics",
      "Practice Local vs Shared State with a tiny example first.",
      ["vue-local-vs-shared-state"],
    ),
    mistake(
      "vue-state-basics-mistake-2",
      "Pulling unrelated-domain demos into Shared State Basics",
      "Defaulting to out-of-domain snippets",
      "Stay inside Shared State Basics concepts.",
      ["vue-provide-inject"],
    ),
  ],
  exercises: [
    exercise({
      id: "vue-state-basics-exercise",
      title: "Shared State Basics mini exercise",
      instructions: ["Build a small example covering Local vs Shared State.","Extend it with provide/inject.","Verify behavior related to Pinia Store."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Shared State Basics.",
      conceptIds: ["vue-local-vs-shared-state","vue-provide-inject","vue-pinia-store"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("vue-state-basics", ["vue-local-vs-shared-state","vue-provide-inject","vue-pinia-store","vue-state","vue-actions"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

export const vueKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-vue",
  title: "Vue",
  aliases: ["vue","vue.js","learn vue","vuejs","vue 3"],
  category: "Web Development",
  description: "Vue starter curriculum covering SFCs, reactivity, Composition API, components, routing, and state basics.",
  topics: [vue_sfc_basicsTopic, vue_reactivityTopic, vue_composition_apiTopic, vue_components_and_propsTopic, vue_routingTopic, vue_state_basicsTopic],
});
