import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","ec2","react hooks","kubernetes pod"];

const ds_analytics_workflowTopic = topic({
  id: "ds-analytics-workflow",
  title: "Analytics Workflow",
  aliases: ["data science workflow","analytics process"],
  description: "Frame questions, gather data, clean, analyze, and communicate results.",
  learningOrder: 1,
  
  relatedTopicIds: ["ds-exploratory-data-analysis"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ds-problem-framing",
      title: "Problem Framing",
      description: "Problem Framing applied in this topic.",
    }),
    concept({
      id: "ds-data-collection",
      title: "Data Collection",
      description: "Data Collection applied in this topic.",
    }),
    concept({
      id: "ds-data-cleaning",
      title: "Data Cleaning",
      description: "Data Cleaning applied in this topic.",
    }),
    concept({
      id: "ds-exploratory-analysis",
      title: "Exploratory Analysis",
      description: "Exploratory Analysis applied in this topic.",
    }),
    concept({
      id: "ds-modeling-loop",
      title: "Modeling Loop",
      description: "Modeling Loop applied in this topic.",
    }),
    concept({
      id: "ds-communication",
      title: "Communication",
      description: "Communication applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Problem Framing correctly","Explain Data Collection in context"],
  practicalArtifacts: [
    artifact({
      id: "ds-analytics-workflow-artifact",
      type: "workflow",
      title: "End-to-end mini workflow",
      
      content: "Step 1: Define metric\nStep 2: Load table\nStep 3: Profile nulls/outliers\nStep 4: Plot distributions\nStep 5: Fit baseline model\nStep 6: Report lift vs baseline",
      expectedOutput: "Documented workflow with a measurable success metric",
      explanation: "Keeps analysis tied to a decision metric.",
      conceptIds: ["ds-problem-framing","ds-data-collection","ds-data-cleaning","ds-exploratory-analysis"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ds-analytics-workflow-mistake-1",
      "Misapplying Problem Framing",
      "Skipping hands-on checks in Analytics Workflow",
      "Practice Problem Framing with a tiny example first.",
      ["ds-problem-framing"],
    ),
    mistake(
      "ds-analytics-workflow-mistake-2",
      "Pulling unrelated-domain demos into Analytics Workflow",
      "Defaulting to out-of-domain snippets",
      "Stay inside Analytics Workflow concepts.",
      ["ds-data-collection"],
    ),
  ],
  exercises: [
    exercise({
      id: "ds-analytics-workflow-exercise",
      title: "Analytics Workflow mini exercise",
      instructions: ["Build a small example covering Problem Framing.","Extend it with Data Collection.","Verify behavior related to Data Cleaning."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Analytics Workflow.",
      conceptIds: ["ds-problem-framing","ds-data-collection","ds-data-cleaning"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("ds-analytics-workflow", ["ds-problem-framing","ds-data-collection","ds-data-cleaning","ds-exploratory-analysis","ds-modeling-loop"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ds_exploratory_data_analysisTopic = topic({
  id: "ds-exploratory-data-analysis",
  title: "Exploratory Data Analysis",
  aliases: ["eda","exploratory analysis"],
  description: "Profile datasets with summaries, distributions, and correlation checks.",
  learningOrder: 2,
  prerequisiteIds: ["ds-analytics-workflow"],
  relatedTopicIds: ["ds-statistics-for-data-science"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ds-summary-statistics",
      title: "Summary Statistics",
      description: "Summary Statistics applied in this topic.",
    }),
    concept({
      id: "ds-missingness",
      title: "Missingness",
      description: "Missingness applied in this topic.",
    }),
    concept({
      id: "ds-outliers",
      title: "Outliers",
      description: "Outliers applied in this topic.",
    }),
    concept({
      id: "ds-distributions",
      title: "Distributions",
      description: "Distributions applied in this topic.",
    }),
    concept({
      id: "ds-correlation",
      title: "Correlation",
      description: "Correlation applied in this topic.",
    }),
    concept({
      id: "ds-group-by-insights",
      title: "Group-by Insights",
      description: "Group-by Insights applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Summary Statistics correctly","Explain Missingness in context"],
  practicalArtifacts: [
    artifact({
      id: "ds-exploratory-data-analysis-artifact",
      type: "code",
      title: "Exploratory Data Analysis worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Summary Statistics, Missingness, Outliers.",
      conceptIds: ["ds-summary-statistics","ds-missingness","ds-outliers","ds-distributions"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ds-exploratory-data-analysis-mistake-1",
      "Misapplying Summary Statistics",
      "Skipping hands-on checks in Exploratory Data Analysis",
      "Practice Summary Statistics with a tiny example first.",
      ["ds-summary-statistics"],
    ),
    mistake(
      "ds-exploratory-data-analysis-mistake-2",
      "Pulling unrelated-domain demos into Exploratory Data Analysis",
      "Defaulting to out-of-domain snippets",
      "Stay inside Exploratory Data Analysis concepts.",
      ["ds-missingness"],
    ),
  ],
  exercises: [
    exercise({
      id: "ds-exploratory-data-analysis-exercise",
      title: "Exploratory Data Analysis mini exercise",
      instructions: ["Build a small example covering Summary Statistics.","Extend it with Missingness.","Verify behavior related to Outliers."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Exploratory Data Analysis.",
      conceptIds: ["ds-summary-statistics","ds-missingness","ds-outliers"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("ds-exploratory-data-analysis", ["ds-summary-statistics","ds-missingness","ds-outliers","ds-distributions","ds-correlation"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ds_statistics_for_data_scienceTopic = topic({
  id: "ds-statistics-for-data-science",
  title: "Statistics for Data Science",
  aliases: ["ds statistics","hypothesis testing"],
  description: "Apply probability, sampling, and hypothesis testing to product questions.",
  learningOrder: 3,
  prerequisiteIds: ["ds-exploratory-data-analysis"],
  relatedTopicIds: ["ds-feature-engineering"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ds-sampling",
      title: "Sampling",
      description: "Sampling applied in this topic.",
    }),
    concept({
      id: "ds-bias-vs-variance",
      title: "Bias vs Variance",
      description: "Bias vs Variance applied in this topic.",
    }),
    concept({
      id: "ds-confidence-intervals",
      title: "Confidence Intervals",
      description: "Confidence Intervals applied in this topic.",
    }),
    concept({
      id: "ds-hypothesis-tests",
      title: "Hypothesis Tests",
      description: "Hypothesis Tests applied in this topic.",
    }),
    concept({
      id: "ds-p-values-caution",
      title: "p-values Caution",
      description: "p-values Caution applied in this topic.",
    }),
    concept({
      id: "ds-effect-size",
      title: "Effect Size",
      description: "Effect Size applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Sampling correctly","Explain Bias vs Variance in context"],
  practicalArtifacts: [
    artifact({
      id: "ds-statistics-for-data-science-artifact",
      type: "code",
      title: "Statistics for Data Science worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Sampling, Bias vs Variance, Confidence Intervals.",
      conceptIds: ["ds-sampling","ds-bias-vs-variance","ds-confidence-intervals","ds-hypothesis-tests"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ds-statistics-for-data-science-mistake-1",
      "Misapplying Sampling",
      "Skipping hands-on checks in Statistics for Data Science",
      "Practice Sampling with a tiny example first.",
      ["ds-sampling"],
    ),
    mistake(
      "ds-statistics-for-data-science-mistake-2",
      "Pulling unrelated-domain demos into Statistics for Data Science",
      "Defaulting to out-of-domain snippets",
      "Stay inside Statistics for Data Science concepts.",
      ["ds-bias-vs-variance"],
    ),
  ],
  exercises: [
    exercise({
      id: "ds-statistics-for-data-science-exercise",
      title: "Statistics for Data Science mini exercise",
      instructions: ["Build a small example covering Sampling.","Extend it with Bias vs Variance.","Verify behavior related to Confidence Intervals."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Statistics for Data Science.",
      conceptIds: ["ds-sampling","ds-bias-vs-variance","ds-confidence-intervals"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ds-statistics-for-data-science", ["ds-sampling","ds-bias-vs-variance","ds-confidence-intervals","ds-hypothesis-tests","ds-p-values-caution"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ds_feature_engineeringTopic = topic({
  id: "ds-feature-engineering",
  title: "Feature Engineering",
  aliases: ["feature engineering","encoding"],
  description: "Create, encode, and scale features that improve model signal.",
  learningOrder: 4,
  prerequisiteIds: ["ds-statistics-for-data-science"],
  relatedTopicIds: ["ds-supervised-modeling-intro"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ds-feature-creation",
      title: "Feature Creation",
      description: "Feature Creation applied in this topic.",
    }),
    concept({
      id: "ds-encoding-categoricals",
      title: "Encoding Categoricals",
      description: "Encoding Categoricals applied in this topic.",
    }),
    concept({
      id: "ds-scaling",
      title: "Scaling",
      description: "Scaling applied in this topic.",
    }),
    concept({
      id: "ds-datetime-features",
      title: "Datetime Features",
      description: "Datetime Features applied in this topic.",
    }),
    concept({
      id: "ds-leakage-avoidance",
      title: "Leakage Avoidance",
      description: "Leakage Avoidance applied in this topic.",
    }),
    concept({
      id: "ds-feature-selection-intro",
      title: "Feature Selection Intro",
      description: "Feature Selection Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Feature Creation correctly","Explain Encoding Categoricals in context"],
  practicalArtifacts: [
    artifact({
      id: "ds-feature-engineering-artifact",
      type: "code",
      title: "Feature Engineering worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Feature Creation, Encoding Categoricals, Scaling.",
      conceptIds: ["ds-feature-creation","ds-encoding-categoricals","ds-scaling","ds-datetime-features"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ds-feature-engineering-mistake-1",
      "Misapplying Feature Creation",
      "Skipping hands-on checks in Feature Engineering",
      "Practice Feature Creation with a tiny example first.",
      ["ds-feature-creation"],
    ),
    mistake(
      "ds-feature-engineering-mistake-2",
      "Pulling unrelated-domain demos into Feature Engineering",
      "Defaulting to out-of-domain snippets",
      "Stay inside Feature Engineering concepts.",
      ["ds-encoding-categoricals"],
    ),
  ],
  exercises: [
    exercise({
      id: "ds-feature-engineering-exercise",
      title: "Feature Engineering mini exercise",
      instructions: ["Build a small example covering Feature Creation.","Extend it with Encoding Categoricals.","Verify behavior related to Scaling."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Feature Engineering.",
      conceptIds: ["ds-feature-creation","ds-encoding-categoricals","ds-scaling"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ds-feature-engineering", ["ds-feature-creation","ds-encoding-categoricals","ds-scaling","ds-datetime-features","ds-leakage-avoidance"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ds_supervised_modeling_introTopic = topic({
  id: "ds-supervised-modeling-intro",
  title: "Supervised Modeling Intro",
  aliases: ["supervised learning","baseline models"],
  description: "Train baseline classifiers/regressors and compare simple algorithms.",
  learningOrder: 5,
  prerequisiteIds: ["ds-feature-engineering"],
  relatedTopicIds: ["ds-model-evaluation"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ds-train-test-split",
      title: "Train/Test Split",
      description: "Train/Test Split applied in this topic.",
    }),
    concept({
      id: "ds-linear-regression",
      title: "Linear Regression",
      description: "Linear Regression applied in this topic.",
    }),
    concept({
      id: "ds-logistic-regression",
      title: "Logistic Regression",
      description: "Logistic Regression applied in this topic.",
    }),
    concept({
      id: "ds-tree-models-intro",
      title: "Tree Models Intro",
      description: "Tree Models Intro applied in this topic.",
    }),
    concept({
      id: "ds-baseline-models",
      title: "Baseline Models",
      description: "Baseline Models applied in this topic.",
    }),
    concept({
      id: "ds-overfitting-signs",
      title: "Overfitting Signs",
      description: "Overfitting Signs applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Train/Test Split correctly","Explain Linear Regression in context"],
  practicalArtifacts: [
    artifact({
      id: "ds-supervised-modeling-intro-artifact",
      type: "code",
      title: "Supervised Modeling Intro worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Train/Test Split, Linear Regression, Logistic Regression.",
      conceptIds: ["ds-train-test-split","ds-linear-regression","ds-logistic-regression","ds-tree-models-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ds-supervised-modeling-intro-mistake-1",
      "Misapplying Train/Test Split",
      "Skipping hands-on checks in Supervised Modeling Intro",
      "Practice Train/Test Split with a tiny example first.",
      ["ds-train-test-split"],
    ),
    mistake(
      "ds-supervised-modeling-intro-mistake-2",
      "Pulling unrelated-domain demos into Supervised Modeling Intro",
      "Defaulting to out-of-domain snippets",
      "Stay inside Supervised Modeling Intro concepts.",
      ["ds-linear-regression"],
    ),
  ],
  exercises: [
    exercise({
      id: "ds-supervised-modeling-intro-exercise",
      title: "Supervised Modeling Intro mini exercise",
      instructions: ["Build a small example covering Train/Test Split.","Extend it with Linear Regression.","Verify behavior related to Logistic Regression."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Supervised Modeling Intro.",
      conceptIds: ["ds-train-test-split","ds-linear-regression","ds-logistic-regression"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ds-supervised-modeling-intro", ["ds-train-test-split","ds-linear-regression","ds-logistic-regression","ds-tree-models-intro","ds-baseline-models"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ds_model_evaluationTopic = topic({
  id: "ds-model-evaluation",
  title: "Model Evaluation",
  aliases: ["model metrics","cross validation"],
  description: "Choose metrics and validation strategies that match the business goal.",
  learningOrder: 6,
  prerequisiteIds: ["ds-supervised-modeling-intro"],
  relatedTopicIds: ["ds-visualization-for-insight"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ds-accuracy-limits",
      title: "Accuracy Limits",
      description: "Accuracy Limits applied in this topic.",
    }),
    concept({
      id: "ds-precision-recall",
      title: "Precision/Recall",
      description: "Precision/Recall applied in this topic.",
    }),
    concept({
      id: "ds-roc-auc",
      title: "ROC-AUC",
      description: "ROC-AUC applied in this topic.",
    }),
    concept({
      id: "ds-rmse-mae",
      title: "RMSE/MAE",
      description: "RMSE/MAE applied in this topic.",
    }),
    concept({
      id: "ds-cross-validation",
      title: "Cross-Validation",
      description: "Cross-Validation applied in this topic.",
    }),
    concept({
      id: "ds-confusion-matrix",
      title: "Confusion Matrix",
      description: "Confusion Matrix applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Accuracy Limits correctly","Explain Precision/Recall in context"],
  practicalArtifacts: [
    artifact({
      id: "ds-model-evaluation-artifact",
      type: "code",
      title: "Model Evaluation worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Accuracy Limits, Precision/Recall, ROC-AUC.",
      conceptIds: ["ds-accuracy-limits","ds-precision-recall","ds-roc-auc","ds-rmse-mae"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ds-model-evaluation-mistake-1",
      "Misapplying Accuracy Limits",
      "Skipping hands-on checks in Model Evaluation",
      "Practice Accuracy Limits with a tiny example first.",
      ["ds-accuracy-limits"],
    ),
    mistake(
      "ds-model-evaluation-mistake-2",
      "Pulling unrelated-domain demos into Model Evaluation",
      "Defaulting to out-of-domain snippets",
      "Stay inside Model Evaluation concepts.",
      ["ds-precision-recall"],
    ),
  ],
  exercises: [
    exercise({
      id: "ds-model-evaluation-exercise",
      title: "Model Evaluation mini exercise",
      instructions: ["Build a small example covering Accuracy Limits.","Extend it with Precision/Recall.","Verify behavior related to ROC-AUC."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Model Evaluation.",
      conceptIds: ["ds-accuracy-limits","ds-precision-recall","ds-roc-auc"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ds-model-evaluation", ["ds-accuracy-limits","ds-precision-recall","ds-roc-auc","ds-rmse-mae","ds-cross-validation"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ds_visualization_for_insightTopic = topic({
  id: "ds-visualization-for-insight",
  title: "Visualization for Insight",
  aliases: ["data visualization","charts"],
  description: "Communicate findings with charts that match the question.",
  learningOrder: 7,
  prerequisiteIds: ["ds-model-evaluation"],
  relatedTopicIds: ["ds-experimentation-hygiene"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ds-chart-selection",
      title: "Chart Selection",
      description: "Chart Selection applied in this topic.",
    }),
    concept({
      id: "ds-histograms",
      title: "Histograms",
      description: "Histograms applied in this topic.",
    }),
    concept({
      id: "ds-scatter-plots",
      title: "Scatter Plots",
      description: "Scatter Plots applied in this topic.",
    }),
    concept({
      id: "ds-bar-line-charts",
      title: "Bar/Line Charts",
      description: "Bar/Line Charts applied in this topic.",
    }),
    concept({
      id: "ds-avoid-chart-junk",
      title: "Avoid Chart Junk",
      description: "Avoid Chart Junk applied in this topic.",
    }),
    concept({
      id: "ds-audience-framing",
      title: "Audience Framing",
      description: "Audience Framing applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Chart Selection correctly","Explain Histograms in context"],
  practicalArtifacts: [
    artifact({
      id: "ds-visualization-for-insight-artifact",
      type: "code",
      title: "Visualization for Insight worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Chart Selection, Histograms, Scatter Plots.",
      conceptIds: ["ds-chart-selection","ds-histograms","ds-scatter-plots","ds-bar-line-charts"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ds-visualization-for-insight-mistake-1",
      "Misapplying Chart Selection",
      "Skipping hands-on checks in Visualization for Insight",
      "Practice Chart Selection with a tiny example first.",
      ["ds-chart-selection"],
    ),
    mistake(
      "ds-visualization-for-insight-mistake-2",
      "Pulling unrelated-domain demos into Visualization for Insight",
      "Defaulting to out-of-domain snippets",
      "Stay inside Visualization for Insight concepts.",
      ["ds-histograms"],
    ),
  ],
  exercises: [
    exercise({
      id: "ds-visualization-for-insight-exercise",
      title: "Visualization for Insight mini exercise",
      instructions: ["Build a small example covering Chart Selection.","Extend it with Histograms.","Verify behavior related to Scatter Plots."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Visualization for Insight.",
      conceptIds: ["ds-chart-selection","ds-histograms","ds-scatter-plots"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("ds-visualization-for-insight", ["ds-chart-selection","ds-histograms","ds-scatter-plots","ds-bar-line-charts","ds-avoid-chart-junk"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ds_experimentation_hygieneTopic = topic({
  id: "ds-experimentation-hygiene",
  title: "Experimentation Hygiene",
  aliases: ["experiment hygiene","data leakage"],
  description: "Keep analyses reproducible and avoid common leakage pitfalls.",
  learningOrder: 8,
  prerequisiteIds: ["ds-visualization-for-insight"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ds-reproducible-notebooks",
      title: "Reproducible Notebooks",
      description: "Reproducible Notebooks applied in this topic.",
    }),
    concept({
      id: "ds-seed-control",
      title: "Seed Control",
      description: "Seed Control applied in this topic.",
    }),
    concept({
      id: "ds-data-leakage",
      title: "Data Leakage",
      description: "Data Leakage applied in this topic.",
    }),
    concept({
      id: "ds-train-serve-skew",
      title: "Train-Serve Skew",
      description: "Train-Serve Skew applied in this topic.",
    }),
    concept({
      id: "ds-documentation",
      title: "Documentation",
      description: "Documentation applied in this topic.",
    }),
    concept({
      id: "ds-result-logging",
      title: "Result Logging",
      description: "Result Logging applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Reproducible Notebooks correctly","Explain Seed Control in context"],
  practicalArtifacts: [
    artifact({
      id: "ds-experimentation-hygiene-artifact",
      type: "code",
      title: "Experimentation Hygiene worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Reproducible Notebooks, Seed Control, Data Leakage.",
      conceptIds: ["ds-reproducible-notebooks","ds-seed-control","ds-data-leakage","ds-train-serve-skew"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ds-experimentation-hygiene-mistake-1",
      "Misapplying Reproducible Notebooks",
      "Skipping hands-on checks in Experimentation Hygiene",
      "Practice Reproducible Notebooks with a tiny example first.",
      ["ds-reproducible-notebooks"],
    ),
    mistake(
      "ds-experimentation-hygiene-mistake-2",
      "Pulling unrelated-domain demos into Experimentation Hygiene",
      "Defaulting to out-of-domain snippets",
      "Stay inside Experimentation Hygiene concepts.",
      ["ds-seed-control"],
    ),
  ],
  exercises: [
    exercise({
      id: "ds-experimentation-hygiene-exercise",
      title: "Experimentation Hygiene mini exercise",
      instructions: ["Build a small example covering Reproducible Notebooks.","Extend it with Seed Control.","Verify behavior related to Data Leakage."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Experimentation Hygiene.",
      conceptIds: ["ds-reproducible-notebooks","ds-seed-control","ds-data-leakage"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ds-experimentation-hygiene", ["ds-reproducible-notebooks","ds-seed-control","ds-data-leakage","ds-train-serve-skew","ds-documentation"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

export const dataScienceKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-data-science",
  title: "Data Science",
  aliases: ["data science","learn data science","data scientist","datascience","ds curriculum"],
  category: "Data",
  description: "Data Science curriculum covering the analytics workflow, EDA, statistics for DS, feature work, modeling intro, evaluation, visualization, and experiment hygiene.",
  topics: [ds_analytics_workflowTopic, ds_exploratory_data_analysisTopic, ds_statistics_for_data_scienceTopic, ds_feature_engineeringTopic, ds_supervised_modeling_introTopic, ds_model_evaluationTopic, ds_visualization_for_insightTopic, ds_experimentation_hygieneTopic],
});
