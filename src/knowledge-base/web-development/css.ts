import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","kubernetes pod","sql join","python class"];

const css_selectors_and_propertiesTopic = topic({
  id: "css-selectors-and-properties",
  title: "Selectors and Properties",
  aliases: ["css selectors","css properties"],
  description: "Target elements and apply core visual properties.",
  learningOrder: 1,
  
  relatedTopicIds: ["css-box-model"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "css-element-selectors",
      title: "Element Selectors",
      description: "Element Selectors applied in this topic.",
    }),
    concept({
      id: "css-class-selectors",
      title: "Class Selectors",
      description: "Class Selectors applied in this topic.",
    }),
    concept({
      id: "css-id-selectors",
      title: "ID Selectors",
      description: "ID Selectors applied in this topic.",
    }),
    concept({
      id: "css-color-background",
      title: "color/background",
      description: "color/background applied in this topic.",
    }),
    concept({
      id: "css-font-properties",
      title: "font Properties",
      description: "font Properties applied in this topic.",
    }),
    concept({
      id: "css-combinators",
      title: "Combinators",
      description: "Combinators applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Element Selectors correctly","Explain Class Selectors in context"],
  practicalArtifacts: [
    artifact({
      id: "css-selectors-and-properties-artifact",
      type: "code",
      title: "Class styling",
      language: "css",
      content: ".card { color: #123; background: #f5f5f5; font-size: 1rem; }",
      expectedOutput: "Elements with class card use the declared styles",
      explanation: "Class selector with common properties.",
      conceptIds: ["css-element-selectors","css-class-selectors","css-id-selectors","css-color-background"],
    }),
  ],
  commonMistakes: [
    mistake(
      "css-selectors-and-properties-mistake-1",
      "Misapplying Element Selectors",
      "Skipping hands-on checks in Selectors and Properties",
      "Practice Element Selectors with a tiny example first.",
      ["css-element-selectors"],
    ),
    mistake(
      "css-selectors-and-properties-mistake-2",
      "Pulling unrelated-domain demos into Selectors and Properties",
      "Defaulting to out-of-domain snippets",
      "Stay inside Selectors and Properties concepts.",
      ["css-class-selectors"],
    ),
  ],
  exercises: [
    exercise({
      id: "css-selectors-and-properties-exercise",
      title: "Selectors and Properties mini exercise",
      instructions: ["Build a small example covering Element Selectors.","Extend it with Class Selectors.","Verify behavior related to ID Selectors."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Selectors and Properties.",
      conceptIds: ["css-element-selectors","css-class-selectors","css-id-selectors"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("css-selectors-and-properties", ["css-element-selectors","css-class-selectors","css-id-selectors","css-color-background","css-font-properties"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const css_box_modelTopic = topic({
  id: "css-box-model",
  title: "Box Model",
  aliases: ["box model","padding margin"],
  description: "Control spacing with content, padding, border, and margin.",
  learningOrder: 2,
  prerequisiteIds: ["css-selectors-and-properties"],
  relatedTopicIds: ["css-flexbox"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "css-content-box",
      title: "Content Box",
      description: "Content Box applied in this topic.",
    }),
    concept({
      id: "css-padding",
      title: "padding",
      description: "padding applied in this topic.",
    }),
    concept({
      id: "css-border",
      title: "border",
      description: "border applied in this topic.",
    }),
    concept({
      id: "css-margin",
      title: "margin",
      description: "margin applied in this topic.",
    }),
    concept({
      id: "css-box-sizing",
      title: "box-sizing",
      description: "box-sizing applied in this topic.",
    }),
    concept({
      id: "css-display",
      title: "display",
      description: "display applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Content Box correctly","Explain padding in context"],
  practicalArtifacts: [
    artifact({
      id: "css-box-model-artifact",
      type: "code",
      title: "Box Model worked example",
      
      content: "// Practical example for Box Model\n// Covers: Content Box, padding, border",
      
      explanation: "Demonstrates Content Box, padding, border.",
      conceptIds: ["css-content-box","css-padding","css-border","css-margin"],
    }),
  ],
  commonMistakes: [
    mistake(
      "css-box-model-mistake-1",
      "Misapplying Content Box",
      "Skipping hands-on checks in Box Model",
      "Practice Content Box with a tiny example first.",
      ["css-content-box"],
    ),
    mistake(
      "css-box-model-mistake-2",
      "Pulling unrelated-domain demos into Box Model",
      "Defaulting to out-of-domain snippets",
      "Stay inside Box Model concepts.",
      ["css-padding"],
    ),
  ],
  exercises: [
    exercise({
      id: "css-box-model-exercise",
      title: "Box Model mini exercise",
      instructions: ["Build a small example covering Content Box.","Extend it with padding.","Verify behavior related to border."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Box Model.",
      conceptIds: ["css-content-box","css-padding","css-border"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("css-box-model", ["css-content-box","css-padding","css-border","css-margin","css-box-sizing"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const css_flexboxTopic = topic({
  id: "css-flexbox",
  title: "Flexbox Layout",
  aliases: ["flexbox","flex layout"],
  description: "Align one-dimensional layouts with flex containers and items.",
  learningOrder: 3,
  prerequisiteIds: ["css-box-model"],
  relatedTopicIds: ["css-grid"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "css-display-flex",
      title: "display flex",
      description: "display flex applied in this topic.",
    }),
    concept({
      id: "css-flex-direction",
      title: "flex-direction",
      description: "flex-direction applied in this topic.",
    }),
    concept({
      id: "css-justify-content",
      title: "justify-content",
      description: "justify-content applied in this topic.",
    }),
    concept({
      id: "css-align-items",
      title: "align-items",
      description: "align-items applied in this topic.",
    }),
    concept({
      id: "css-flex-grow-shrink",
      title: "flex-grow/shrink",
      description: "flex-grow/shrink applied in this topic.",
    }),
    concept({
      id: "css-gap",
      title: "gap",
      description: "gap applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply display flex correctly","Explain flex-direction in context"],
  practicalArtifacts: [
    artifact({
      id: "css-flexbox-artifact",
      type: "code",
      title: "Centered row",
      language: "css",
      content: ".row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }",
      expectedOutput: "Children spaced horizontally and vertically centered",
      explanation: "Common flex alignment pattern.",
      conceptIds: ["css-display-flex","css-flex-direction","css-justify-content","css-align-items"],
    }),
  ],
  commonMistakes: [
    mistake(
      "css-flexbox-mistake-1",
      "Misapplying display flex",
      "Skipping hands-on checks in Flexbox Layout",
      "Practice display flex with a tiny example first.",
      ["css-display-flex"],
    ),
    mistake(
      "css-flexbox-mistake-2",
      "Pulling unrelated-domain demos into Flexbox Layout",
      "Defaulting to out-of-domain snippets",
      "Stay inside Flexbox Layout concepts.",
      ["css-flex-direction"],
    ),
  ],
  exercises: [
    exercise({
      id: "css-flexbox-exercise",
      title: "Flexbox Layout mini exercise",
      instructions: ["Build a small example covering display flex.","Extend it with flex-direction.","Verify behavior related to justify-content."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Flexbox Layout.",
      conceptIds: ["css-display-flex","css-flex-direction","css-justify-content"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("css-flexbox", ["css-display-flex","css-flex-direction","css-justify-content","css-align-items","css-flex-grow-shrink"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const css_gridTopic = topic({
  id: "css-grid",
  title: "CSS Grid",
  aliases: ["css grid","grid layout"],
  description: "Build two-dimensional layouts with tracks and placement.",
  learningOrder: 4,
  prerequisiteIds: ["css-flexbox"],
  relatedTopicIds: ["css-responsive-design"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "css-display-grid",
      title: "display grid",
      description: "display grid applied in this topic.",
    }),
    concept({
      id: "css-grid-template-columns",
      title: "grid-template-columns",
      description: "grid-template-columns applied in this topic.",
    }),
    concept({
      id: "css-grid-template-rows",
      title: "grid-template-rows",
      description: "grid-template-rows applied in this topic.",
    }),
    concept({
      id: "css-grid-gap",
      title: "grid-gap",
      description: "grid-gap applied in this topic.",
    }),
    concept({
      id: "css-grid-column",
      title: "grid-column",
      description: "grid-column applied in this topic.",
    }),
    concept({
      id: "css-fr-unit",
      title: "fr Unit",
      description: "fr Unit applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply display grid correctly","Explain grid-template-columns in context"],
  practicalArtifacts: [
    artifact({
      id: "css-grid-artifact",
      type: "code",
      title: "CSS Grid worked example",
      
      content: "// Practical example for CSS Grid\n// Covers: display grid, grid-template-columns, grid-template-rows",
      
      explanation: "Demonstrates display grid, grid-template-columns, grid-template-rows.",
      conceptIds: ["css-display-grid","css-grid-template-columns","css-grid-template-rows","css-grid-gap"],
    }),
  ],
  commonMistakes: [
    mistake(
      "css-grid-mistake-1",
      "Misapplying display grid",
      "Skipping hands-on checks in CSS Grid",
      "Practice display grid with a tiny example first.",
      ["css-display-grid"],
    ),
    mistake(
      "css-grid-mistake-2",
      "Pulling unrelated-domain demos into CSS Grid",
      "Defaulting to out-of-domain snippets",
      "Stay inside CSS Grid concepts.",
      ["css-grid-template-columns"],
    ),
  ],
  exercises: [
    exercise({
      id: "css-grid-exercise",
      title: "CSS Grid mini exercise",
      instructions: ["Build a small example covering display grid.","Extend it with grid-template-columns.","Verify behavior related to grid-template-rows."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for CSS Grid.",
      conceptIds: ["css-display-grid","css-grid-template-columns","css-grid-template-rows"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("css-grid", ["css-display-grid","css-grid-template-columns","css-grid-template-rows","css-grid-gap","css-grid-column"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const css_responsive_designTopic = topic({
  id: "css-responsive-design",
  title: "Responsive Design",
  aliases: ["responsive css","media queries"],
  description: "Adapt layouts with media queries and fluid units.",
  learningOrder: 5,
  prerequisiteIds: ["css-grid"],
  relatedTopicIds: ["css-cascade-and-specificity"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "css-media-queries",
      title: "Media Queries",
      description: "Media Queries applied in this topic.",
    }),
    concept({
      id: "css-mobile-first",
      title: "Mobile-First",
      description: "Mobile-First applied in this topic.",
    }),
    concept({
      id: "css-relative-units",
      title: "Relative Units",
      description: "Relative Units applied in this topic.",
    }),
    concept({
      id: "css-viewport-width",
      title: "Viewport Width",
      description: "Viewport Width applied in this topic.",
    }),
    concept({
      id: "css-responsive-images",
      title: "Responsive Images",
      description: "Responsive Images applied in this topic.",
    }),
    concept({
      id: "css-breakpoints",
      title: "Breakpoints",
      description: "Breakpoints applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Media Queries correctly","Explain Mobile-First in context"],
  practicalArtifacts: [
    artifact({
      id: "css-responsive-design-artifact",
      type: "code",
      title: "Responsive Design worked example",
      
      content: "// Practical example for Responsive Design\n// Covers: Media Queries, Mobile-First, Relative Units",
      
      explanation: "Demonstrates Media Queries, Mobile-First, Relative Units.",
      conceptIds: ["css-media-queries","css-mobile-first","css-relative-units","css-viewport-width"],
    }),
  ],
  commonMistakes: [
    mistake(
      "css-responsive-design-mistake-1",
      "Misapplying Media Queries",
      "Skipping hands-on checks in Responsive Design",
      "Practice Media Queries with a tiny example first.",
      ["css-media-queries"],
    ),
    mistake(
      "css-responsive-design-mistake-2",
      "Pulling unrelated-domain demos into Responsive Design",
      "Defaulting to out-of-domain snippets",
      "Stay inside Responsive Design concepts.",
      ["css-mobile-first"],
    ),
  ],
  exercises: [
    exercise({
      id: "css-responsive-design-exercise",
      title: "Responsive Design mini exercise",
      instructions: ["Build a small example covering Media Queries.","Extend it with Mobile-First.","Verify behavior related to Relative Units."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Responsive Design.",
      conceptIds: ["css-media-queries","css-mobile-first","css-relative-units"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("css-responsive-design", ["css-media-queries","css-mobile-first","css-relative-units","css-viewport-width","css-responsive-images"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const css_cascade_and_specificityTopic = topic({
  id: "css-cascade-and-specificity",
  title: "Cascade and Specificity",
  aliases: ["specificity","css cascade"],
  description: "Predict which rules win using specificity, order, and inheritance.",
  learningOrder: 6,
  prerequisiteIds: ["css-responsive-design"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "css-specificity",
      title: "Specificity",
      description: "Specificity applied in this topic.",
    }),
    concept({
      id: "css-cascade-order",
      title: "Cascade Order",
      description: "Cascade Order applied in this topic.",
    }),
    concept({
      id: "css-inheritance",
      title: "Inheritance",
      description: "Inheritance applied in this topic.",
    }),
    concept({
      id: "css-important-costs",
      title: "!important Costs",
      description: "!important Costs applied in this topic.",
    }),
    concept({
      id: "css-css-variables",
      title: "CSS Variables",
      description: "CSS Variables applied in this topic.",
    }),
    concept({
      id: "css-layer-intro",
      title: "Layer Intro",
      description: "Layer Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Specificity correctly","Explain Cascade Order in context"],
  practicalArtifacts: [
    artifact({
      id: "css-cascade-and-specificity-artifact",
      type: "code",
      title: "Cascade and Specificity worked example",
      
      content: "// Practical example for Cascade and Specificity\n// Covers: Specificity, Cascade Order, Inheritance",
      
      explanation: "Demonstrates Specificity, Cascade Order, Inheritance.",
      conceptIds: ["css-specificity","css-cascade-order","css-inheritance","css-important-costs"],
    }),
  ],
  commonMistakes: [
    mistake(
      "css-cascade-and-specificity-mistake-1",
      "Misapplying Specificity",
      "Skipping hands-on checks in Cascade and Specificity",
      "Practice Specificity with a tiny example first.",
      ["css-specificity"],
    ),
    mistake(
      "css-cascade-and-specificity-mistake-2",
      "Pulling unrelated-domain demos into Cascade and Specificity",
      "Defaulting to out-of-domain snippets",
      "Stay inside Cascade and Specificity concepts.",
      ["css-cascade-order"],
    ),
  ],
  exercises: [
    exercise({
      id: "css-cascade-and-specificity-exercise",
      title: "Cascade and Specificity mini exercise",
      instructions: ["Build a small example covering Specificity.","Extend it with Cascade Order.","Verify behavior related to Inheritance."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Cascade and Specificity.",
      conceptIds: ["css-specificity","css-cascade-order","css-inheritance"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("css-cascade-and-specificity", ["css-specificity","css-cascade-order","css-inheritance","css-important-costs","css-css-variables"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

export const cssKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-css",
  title: "CSS",
  aliases: ["css","learn css","cascading style sheets","css3"],
  category: "Web Development",
  description: "CSS starter curriculum covering selectors, box model, flexbox, grid, responsive design, and cascade/specificity.",
  topics: [css_selectors_and_propertiesTopic, css_box_modelTopic, css_flexboxTopic, css_gridTopic, css_responsive_designTopic, css_cascade_and_specificityTopic],
});
