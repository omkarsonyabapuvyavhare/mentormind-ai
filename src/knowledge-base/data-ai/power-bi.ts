import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","react hooks","kubernetes pod","python class"];

const pbi_power_queryTopic = topic({
  id: "pbi-power-query",
  title: "Power Query Transformation",
  aliases: ["power query","get data"],
  description: "Ingest and shape tables with Power Query steps.",
  learningOrder: 1,
  
  relatedTopicIds: ["pbi-data-model"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pbi-get-data",
      title: "Get Data",
      description: "Get Data applied in this topic.",
    }),
    concept({
      id: "pbi-applied-steps",
      title: "Applied Steps",
      description: "Applied Steps applied in this topic.",
    }),
    concept({
      id: "pbi-column-transforms",
      title: "Column Transforms",
      description: "Column Transforms applied in this topic.",
    }),
    concept({
      id: "pbi-merge-queries",
      title: "Merge Queries",
      description: "Merge Queries applied in this topic.",
    }),
    concept({
      id: "pbi-append-queries",
      title: "Append Queries",
      description: "Append Queries applied in this topic.",
    }),
    concept({
      id: "pbi-data-types",
      title: "Data Types",
      description: "Data Types applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Get Data correctly","Explain Applied Steps in context"],
  practicalArtifacts: [
    artifact({
      id: "pbi-power-query-artifact",
      type: "code",
      title: "Power Query Transformation worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Get Data, Applied Steps, Column Transforms.",
      conceptIds: ["pbi-get-data","pbi-applied-steps","pbi-column-transforms","pbi-merge-queries"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pbi-power-query-mistake-1",
      "Misapplying Get Data",
      "Skipping hands-on checks in Power Query Transformation",
      "Practice Get Data with a tiny example first.",
      ["pbi-get-data"],
    ),
    mistake(
      "pbi-power-query-mistake-2",
      "Pulling unrelated-domain demos into Power Query Transformation",
      "Defaulting to out-of-domain snippets",
      "Stay inside Power Query Transformation concepts.",
      ["pbi-applied-steps"],
    ),
  ],
  exercises: [
    exercise({
      id: "pbi-power-query-exercise",
      title: "Power Query Transformation mini exercise",
      instructions: ["Build a small example covering Get Data.","Extend it with Applied Steps.","Verify behavior related to Column Transforms."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Power Query Transformation.",
      conceptIds: ["pbi-get-data","pbi-applied-steps","pbi-column-transforms"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("pbi-power-query", ["pbi-get-data","pbi-applied-steps","pbi-column-transforms","pbi-merge-queries","pbi-append-queries"],
    ["concept-understanding","configuration-analysis","calculation","practical-scenario","debugging"]),
});

const pbi_data_modelTopic = topic({
  id: "pbi-data-model",
  title: "Data Model Basics",
  aliases: ["power bi model","star schema"],
  description: "Design star-schema style models with fact and dimension tables.",
  learningOrder: 2,
  prerequisiteIds: ["pbi-power-query"],
  relatedTopicIds: ["pbi-dax-basics"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pbi-fact-tables",
      title: "Fact Tables",
      description: "Fact Tables applied in this topic.",
    }),
    concept({
      id: "pbi-dimension-tables",
      title: "Dimension Tables",
      description: "Dimension Tables applied in this topic.",
    }),
    concept({
      id: "pbi-star-schema",
      title: "Star Schema",
      description: "Star Schema applied in this topic.",
    }),
    concept({
      id: "pbi-relationships",
      title: "Relationships",
      description: "Relationships applied in this topic.",
    }),
    concept({
      id: "pbi-cardinality",
      title: "Cardinality",
      description: "Cardinality applied in this topic.",
    }),
    concept({
      id: "pbi-filter-direction",
      title: "Filter Direction",
      description: "Filter Direction applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Fact Tables correctly","Explain Dimension Tables in context"],
  practicalArtifacts: [
    artifact({
      id: "pbi-data-model-artifact",
      type: "code",
      title: "Data Model Basics worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Fact Tables, Dimension Tables, Star Schema.",
      conceptIds: ["pbi-fact-tables","pbi-dimension-tables","pbi-star-schema","pbi-relationships"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pbi-data-model-mistake-1",
      "Misapplying Fact Tables",
      "Skipping hands-on checks in Data Model Basics",
      "Practice Fact Tables with a tiny example first.",
      ["pbi-fact-tables"],
    ),
    mistake(
      "pbi-data-model-mistake-2",
      "Pulling unrelated-domain demos into Data Model Basics",
      "Defaulting to out-of-domain snippets",
      "Stay inside Data Model Basics concepts.",
      ["pbi-dimension-tables"],
    ),
  ],
  exercises: [
    exercise({
      id: "pbi-data-model-exercise",
      title: "Data Model Basics mini exercise",
      instructions: ["Build a small example covering Fact Tables.","Extend it with Dimension Tables.","Verify behavior related to Star Schema."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Data Model Basics.",
      conceptIds: ["pbi-fact-tables","pbi-dimension-tables","pbi-star-schema"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("pbi-data-model", ["pbi-fact-tables","pbi-dimension-tables","pbi-star-schema","pbi-relationships","pbi-cardinality"],
    ["concept-understanding","configuration-analysis","calculation","practical-scenario","debugging"]),
});

const pbi_dax_basicsTopic = topic({
  id: "pbi-dax-basics",
  title: "DAX Basics",
  aliases: ["dax","calculate"],
  description: "Write measures with CALCULATE, FILTER, and iterator functions.",
  learningOrder: 3,
  prerequisiteIds: ["pbi-data-model"],
  relatedTopicIds: ["pbi-visuals-and-reports"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pbi-measures-vs-columns",
      title: "Measures vs Columns",
      description: "Measures vs Columns applied in this topic.",
    }),
    concept({
      id: "pbi-calculate",
      title: "CALCULATE",
      description: "CALCULATE applied in this topic.",
    }),
    concept({
      id: "pbi-filter",
      title: "FILTER",
      description: "FILTER applied in this topic.",
    }),
    concept({
      id: "pbi-sumx",
      title: "SUMX",
      description: "SUMX applied in this topic.",
    }),
    concept({
      id: "pbi-time-intelligence-intro",
      title: "Time Intelligence Intro",
      description: "Time Intelligence Intro applied in this topic.",
    }),
    concept({
      id: "pbi-context-transition",
      title: "Context Transition",
      description: "Context Transition applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Measures vs Columns correctly","Explain CALCULATE in context"],
  practicalArtifacts: [
    artifact({
      id: "pbi-dax-basics-artifact",
      type: "calculation",
      title: "Total Sales measure",
      language: "dax",
      content: "Total Sales = SUM ( Sales[Amount] )\nSales LY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )",
      expectedOutput: "Measures respond to report filters",
      explanation: "Base measure plus simple time intelligence.",
      conceptIds: ["pbi-measures-vs-columns","pbi-calculate","pbi-filter","pbi-sumx"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pbi-dax-basics-mistake-1",
      "Misapplying Measures vs Columns",
      "Skipping hands-on checks in DAX Basics",
      "Practice Measures vs Columns with a tiny example first.",
      ["pbi-measures-vs-columns"],
    ),
    mistake(
      "pbi-dax-basics-mistake-2",
      "Pulling unrelated-domain demos into DAX Basics",
      "Defaulting to out-of-domain snippets",
      "Stay inside DAX Basics concepts.",
      ["pbi-calculate"],
    ),
  ],
  exercises: [
    exercise({
      id: "pbi-dax-basics-exercise",
      title: "DAX Basics mini exercise",
      instructions: ["Build a small example covering Measures vs Columns.","Extend it with CALCULATE.","Verify behavior related to FILTER."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for DAX Basics.",
      conceptIds: ["pbi-measures-vs-columns","pbi-calculate","pbi-filter"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("pbi-dax-basics", ["pbi-measures-vs-columns","pbi-calculate","pbi-filter","pbi-sumx","pbi-time-intelligence-intro"],
    ["concept-understanding","configuration-analysis","calculation","practical-scenario","debugging"]),
});

const pbi_visuals_and_reportsTopic = topic({
  id: "pbi-visuals-and-reports",
  title: "Visuals and Report Design",
  aliases: ["power bi visuals","report design"],
  description: "Build readable reports with appropriate visuals and interactions.",
  learningOrder: 4,
  prerequisiteIds: ["pbi-dax-basics"],
  relatedTopicIds: ["pbi-relationships-and-filter-context"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pbi-visual-types",
      title: "Visual Types",
      description: "Visual Types applied in this topic.",
    }),
    concept({
      id: "pbi-filters-pane",
      title: "Filters Pane",
      description: "Filters Pane applied in this topic.",
    }),
    concept({
      id: "pbi-slicers",
      title: "Slicers",
      description: "Slicers applied in this topic.",
    }),
    concept({
      id: "pbi-drillthrough",
      title: "Drillthrough",
      description: "Drillthrough applied in this topic.",
    }),
    concept({
      id: "pbi-bookmarks-intro",
      title: "Bookmarks Intro",
      description: "Bookmarks Intro applied in this topic.",
    }),
    concept({
      id: "pbi-accessibility-contrast",
      title: "Accessibility Contrast",
      description: "Accessibility Contrast applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Visual Types correctly","Explain Filters Pane in context"],
  practicalArtifacts: [
    artifact({
      id: "pbi-visuals-and-reports-artifact",
      type: "code",
      title: "Visuals and Report Design worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Visual Types, Filters Pane, Slicers.",
      conceptIds: ["pbi-visual-types","pbi-filters-pane","pbi-slicers","pbi-drillthrough"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pbi-visuals-and-reports-mistake-1",
      "Misapplying Visual Types",
      "Skipping hands-on checks in Visuals and Report Design",
      "Practice Visual Types with a tiny example first.",
      ["pbi-visual-types"],
    ),
    mistake(
      "pbi-visuals-and-reports-mistake-2",
      "Pulling unrelated-domain demos into Visuals and Report Design",
      "Defaulting to out-of-domain snippets",
      "Stay inside Visuals and Report Design concepts.",
      ["pbi-filters-pane"],
    ),
  ],
  exercises: [
    exercise({
      id: "pbi-visuals-and-reports-exercise",
      title: "Visuals and Report Design mini exercise",
      instructions: ["Build a small example covering Visual Types.","Extend it with Filters Pane.","Verify behavior related to Slicers."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Visuals and Report Design.",
      conceptIds: ["pbi-visual-types","pbi-filters-pane","pbi-slicers"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("pbi-visuals-and-reports", ["pbi-visual-types","pbi-filters-pane","pbi-slicers","pbi-drillthrough","pbi-bookmarks-intro"],
    ["concept-understanding","configuration-analysis","calculation","practical-scenario","debugging"]),
});

const pbi_relationships_and_filter_contextTopic = topic({
  id: "pbi-relationships-and-filter-context",
  title: "Relationships and Filter Context",
  aliases: ["filter context","relationships"],
  description: "Predict how filters propagate across relationships.",
  learningOrder: 5,
  prerequisiteIds: ["pbi-visuals-and-reports"],
  relatedTopicIds: ["pbi-refresh-and-sharing"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pbi-filter-context",
      title: "Filter Context",
      description: "Filter Context applied in this topic.",
    }),
    concept({
      id: "pbi-row-context",
      title: "Row Context",
      description: "Row Context applied in this topic.",
    }),
    concept({
      id: "pbi-cross-filtering",
      title: "Cross-filtering",
      description: "Cross-filtering applied in this topic.",
    }),
    concept({
      id: "pbi-both-directions-caution",
      title: "Both Directions Caution",
      description: "Both Directions Caution applied in this topic.",
    }),
    concept({
      id: "pbi-inactive-relationships",
      title: "Inactive Relationships",
      description: "Inactive Relationships applied in this topic.",
    }),
    concept({
      id: "pbi-userelationship",
      title: "USERELATIONSHIP",
      description: "USERELATIONSHIP applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Filter Context correctly","Explain Row Context in context"],
  practicalArtifacts: [
    artifact({
      id: "pbi-relationships-and-filter-context-artifact",
      type: "code",
      title: "Relationships and Filter Context worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Filter Context, Row Context, Cross-filtering.",
      conceptIds: ["pbi-filter-context","pbi-row-context","pbi-cross-filtering","pbi-both-directions-caution"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pbi-relationships-and-filter-context-mistake-1",
      "Misapplying Filter Context",
      "Skipping hands-on checks in Relationships and Filter Context",
      "Practice Filter Context with a tiny example first.",
      ["pbi-filter-context"],
    ),
    mistake(
      "pbi-relationships-and-filter-context-mistake-2",
      "Pulling unrelated-domain demos into Relationships and Filter Context",
      "Defaulting to out-of-domain snippets",
      "Stay inside Relationships and Filter Context concepts.",
      ["pbi-row-context"],
    ),
  ],
  exercises: [
    exercise({
      id: "pbi-relationships-and-filter-context-exercise",
      title: "Relationships and Filter Context mini exercise",
      instructions: ["Build a small example covering Filter Context.","Extend it with Row Context.","Verify behavior related to Cross-filtering."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Relationships and Filter Context.",
      conceptIds: ["pbi-filter-context","pbi-row-context","pbi-cross-filtering"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("pbi-relationships-and-filter-context", ["pbi-filter-context","pbi-row-context","pbi-cross-filtering","pbi-both-directions-caution","pbi-inactive-relationships"],
    ["concept-understanding","configuration-analysis","calculation","practical-scenario","debugging"]),
});

const pbi_refresh_and_sharingTopic = topic({
  id: "pbi-refresh-and-sharing",
  title: "Refresh and Sharing",
  aliases: ["power bi refresh","rls"],
  description: "Schedule refresh and share workspaces/apps securely.",
  learningOrder: 6,
  prerequisiteIds: ["pbi-relationships-and-filter-context"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "pbi-import-vs-directquery",
      title: "Import vs DirectQuery",
      description: "Import vs DirectQuery applied in this topic.",
    }),
    concept({
      id: "pbi-gateway-intro",
      title: "Gateway Intro",
      description: "Gateway Intro applied in this topic.",
    }),
    concept({
      id: "pbi-scheduled-refresh",
      title: "Scheduled Refresh",
      description: "Scheduled Refresh applied in this topic.",
    }),
    concept({
      id: "pbi-workspaces",
      title: "Workspaces",
      description: "Workspaces applied in this topic.",
    }),
    concept({
      id: "pbi-apps",
      title: "Apps",
      description: "Apps applied in this topic.",
    }),
    concept({
      id: "pbi-row-level-security-intro",
      title: "Row-Level Security Intro",
      description: "Row-Level Security Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Import vs DirectQuery correctly","Explain Gateway Intro in context"],
  practicalArtifacts: [
    artifact({
      id: "pbi-refresh-and-sharing-artifact",
      type: "code",
      title: "Refresh and Sharing worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Import vs DirectQuery, Gateway Intro, Scheduled Refresh.",
      conceptIds: ["pbi-import-vs-directquery","pbi-gateway-intro","pbi-scheduled-refresh","pbi-workspaces"],
    }),
  ],
  commonMistakes: [
    mistake(
      "pbi-refresh-and-sharing-mistake-1",
      "Misapplying Import vs DirectQuery",
      "Skipping hands-on checks in Refresh and Sharing",
      "Practice Import vs DirectQuery with a tiny example first.",
      ["pbi-import-vs-directquery"],
    ),
    mistake(
      "pbi-refresh-and-sharing-mistake-2",
      "Pulling unrelated-domain demos into Refresh and Sharing",
      "Defaulting to out-of-domain snippets",
      "Stay inside Refresh and Sharing concepts.",
      ["pbi-gateway-intro"],
    ),
  ],
  exercises: [
    exercise({
      id: "pbi-refresh-and-sharing-exercise",
      title: "Refresh and Sharing mini exercise",
      instructions: ["Build a small example covering Import vs DirectQuery.","Extend it with Gateway Intro.","Verify behavior related to Scheduled Refresh."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Refresh and Sharing.",
      conceptIds: ["pbi-import-vs-directquery","pbi-gateway-intro","pbi-scheduled-refresh"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("pbi-refresh-and-sharing", ["pbi-import-vs-directquery","pbi-gateway-intro","pbi-scheduled-refresh","pbi-workspaces","pbi-apps"],
    ["concept-understanding","configuration-analysis","calculation","practical-scenario","debugging"]),
});

export const powerBiKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-power-bi",
  title: "Power BI",
  aliases: ["power bi","powerbi","learn power bi","microsoft power bi"],
  category: "Data",
  description: "Power BI starter covering Power Query, the model, DAX basics, visuals, relationships, and refresh/sharing.",
  topics: [pbi_power_queryTopic, pbi_data_modelTopic, pbi_dax_basicsTopic, pbi_visuals_and_reportsTopic, pbi_relationships_and_filter_contextTopic, pbi_refresh_and_sharingTopic],
});
