/**
 * Phase 4 curricula part B — data/cloud/security stubs.
 * Shares renderer by importing logic inline (duplicated for standalone run).
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

function renderTopic(prefix, t, skillTypes, category) {
  const concepts = normalizeConcepts(prefix, t.concepts);
  const conceptIds = concepts.map((c) => c.id);
  const skillIds = [...conceptIds.slice(0, 5)];
  while (skillIds.length < 5) skillIds.push(conceptIds[skillIds.length % conceptIds.length]);

  const nonCodeCategories = new Set([
    "Cloud",
    "DevOps",
    "Cybersecurity",
    "General Technology",
  ]);
  const art =
    t.artifact ||
    (nonCodeCategories.has(category)
      ? {
          type: "workflow",
          title: `${t.title} worked example`,
          content: [
            `Step 1: Identify the ${concepts[0].title} requirement`,
            `Step 2: Apply ${concepts[1].title} in a small scenario`,
            `Step 3: Verify ${concepts[2].title} with an expected check`,
            `Outcome: a validated ${t.title} mini-runbook`,
          ].join("\n"),
          explanation: `Demonstrates ${concepts
            .slice(0, 3)
            .map((c) => c.title)
            .join(", ")}.`,
        }
      : {
          type: "code",
          title: `${t.title} worked example`,
          language: "python",
          content: `values = [${concepts
            .slice(0, 3)
            .map((c, i) => i + 1)
            .join(", ")}]\nprint(sum(values))`,
          expectedOutput: "6",
          explanation: `Demonstrates ${concepts
            .slice(0, 3)
            .map((c) => c.title)
            .join(", ")}.`,
        });

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

${topics.map((t) => renderTopic(g.prefix, t, g.skillTypes, g.category)).join("\n\n")}

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
const ARCH_SKILLS = [
  "concept-understanding",
  "architecture-reasoning",
  "practical-scenario",
  "configuration-analysis",
  "debugging",
];

function topic(id, title, description, concepts, extras = {}) {
  return { id, title, description, concepts, ...extras };
}

const graphs = [];

// ---------- Data / AI ----------
graphs.push({
  file: "data-ai/data-science.ts",
  exportName: "dataScienceKnowledgeGraph",
  id: "kg-data-science",
  title: "Data Science",
  aliases: [
    "data science",
    "learn data science",
    "data scientist",
    "datascience",
    "ds curriculum",
  ],
  category: "Data",
  description:
    "Data Science curriculum covering the analytics workflow, EDA, statistics for DS, feature work, modeling intro, evaluation, visualization, and experiment hygiene.",
  prefix: "ds",
  contamination: ["aws", "vpc", "ec2", "react hooks", "kubernetes pod"],
  skillTypes: DATA_SKILLS,
  topics: [
    topic(
      "ds-analytics-workflow",
      "Analytics Workflow",
      "Frame questions, gather data, clean, analyze, and communicate results.",
      [
        "Problem Framing",
        "Data Collection",
        "Data Cleaning",
        "Exploratory Analysis",
        "Modeling Loop",
        "Communication",
      ],
      {
        aliases: ["data science workflow", "analytics process"],
        artifact: {
          type: "workflow",
          title: "End-to-end mini workflow",
          content:
            "Step 1: Define metric\nStep 2: Load table\nStep 3: Profile nulls/outliers\nStep 4: Plot distributions\nStep 5: Fit baseline model\nStep 6: Report lift vs baseline",
          expectedOutput: "Documented workflow with a measurable success metric",
          explanation: "Keeps analysis tied to a decision metric.",
        },
      },
    ),
    topic(
      "ds-exploratory-data-analysis",
      "Exploratory Data Analysis",
      "Profile datasets with summaries, distributions, and correlation checks.",
      [
        "Summary Statistics",
        "Missingness",
        "Outliers",
        "Distributions",
        "Correlation",
        "Group-by Insights",
      ],
      { aliases: ["eda", "exploratory analysis"] },
    ),
    topic(
      "ds-statistics-for-data-science",
      "Statistics for Data Science",
      "Apply probability, sampling, and hypothesis testing to product questions.",
      [
        "Sampling",
        "Bias vs Variance",
        "Confidence Intervals",
        "Hypothesis Tests",
        "p-values Caution",
        "Effect Size",
      ],
      { aliases: ["ds statistics", "hypothesis testing"], difficulty: "intermediate" },
    ),
    topic(
      "ds-feature-engineering",
      "Feature Engineering",
      "Create, encode, and scale features that improve model signal.",
      [
        "Feature Creation",
        "Encoding Categoricals",
        "Scaling",
        "Datetime Features",
        "Leakage Avoidance",
        "Feature Selection Intro",
      ],
      { aliases: ["feature engineering", "encoding"], difficulty: "intermediate" },
    ),
    topic(
      "ds-supervised-modeling-intro",
      "Supervised Modeling Intro",
      "Train baseline classifiers/regressors and compare simple algorithms.",
      [
        "Train/Test Split",
        "Linear Regression",
        "Logistic Regression",
        "Tree Models Intro",
        "Baseline Models",
        "Overfitting Signs",
      ],
      { aliases: ["supervised learning", "baseline models"], difficulty: "intermediate" },
    ),
    topic(
      "ds-model-evaluation",
      "Model Evaluation",
      "Choose metrics and validation strategies that match the business goal.",
      [
        "Accuracy Limits",
        "Precision/Recall",
        "ROC-AUC",
        "RMSE/MAE",
        "Cross-Validation",
        "Confusion Matrix",
      ],
      { aliases: ["model metrics", "cross validation"], difficulty: "intermediate" },
    ),
    topic(
      "ds-visualization-for-insight",
      "Visualization for Insight",
      "Communicate findings with charts that match the question.",
      [
        "Chart Selection",
        "Histograms",
        "Scatter Plots",
        "Bar/Line Charts",
        "Avoid Chart Junk",
        "Audience Framing",
      ],
      { aliases: ["data visualization", "charts"] },
    ),
    topic(
      "ds-experimentation-hygiene",
      "Experimentation Hygiene",
      "Keep analyses reproducible and avoid common leakage pitfalls.",
      [
        "Reproducible Notebooks",
        "Seed Control",
        "Data Leakage",
        "Train-Serve Skew",
        "Documentation",
        "Result Logging",
      ],
      { aliases: ["experiment hygiene", "data leakage"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "data-ai/machine-learning.ts",
  exportName: "machineLearningKnowledgeGraph",
  id: "kg-machine-learning",
  title: "Machine Learning",
  aliases: [
    "machine learning",
    "learn machine learning",
    "ml",
    "learn ml",
    "ml fundamentals",
  ],
  category: "AI / Machine Learning",
  description:
    "Machine Learning curriculum covering problem types, data prep, classical algorithms, training loops, evaluation, regularization, pipelines, and model ops basics.",
  prefix: "ml",
  contamination: ["aws", "vpc", "ec2", "react hooks", "kubernetes pod"],
  skillTypes: DATA_SKILLS,
  topics: [
    topic(
      "ml-problem-framing",
      "ML Problem Framing",
      "Classify problems as supervised, unsupervised, or ranking/recommendation style tasks.",
      [
        "Supervised Learning",
        "Unsupervised Learning",
        "Regression vs Classification",
        "Features and Labels",
        "Online vs Batch",
        "Success Metrics",
      ],
      { aliases: ["ml problems", "supervised unsupervised"] },
    ),
    topic(
      "ml-data-preparation",
      "Data Preparation for ML",
      "Clean, split, and encode datasets without leakage.",
      [
        "Train/Validation/Test",
        "Missing Values",
        "Encoding",
        "Scaling",
        "Class Imbalance",
        "Leakage Checks",
      ],
      { aliases: ["ml preprocessing", "train test split"] },
    ),
    topic(
      "ml-classical-algorithms",
      "Classical Algorithms",
      "Apply linear models, trees, and nearest neighbors as strong baselines.",
      [
        "Linear Models",
        "Decision Trees",
        "Random Forests",
        "k-NN",
        "Naive Bayes",
        "Algorithm Selection",
      ],
      { aliases: ["classical ml", "random forest"], difficulty: "intermediate" },
    ),
    topic(
      "ml-training-and-optimization",
      "Training and Optimization",
      "Fit models with loss functions and gradient-based updates where relevant.",
      [
        "Loss Functions",
        "Gradient Descent",
        "Learning Rate",
        "Batching",
        "Convergence",
        "Local Minima Intuition",
      ],
      { aliases: ["gradient descent", "loss functions"], difficulty: "intermediate" },
    ),
    topic(
      "ml-evaluation-and-validation",
      "Evaluation and Validation",
      "Estimate generalization with proper splits and metrics.",
      [
        "Holdout Evaluation",
        "k-Fold CV",
        "Classification Metrics",
        "Regression Metrics",
        "Calibration Intro",
        "Error Analysis",
      ],
      { aliases: ["ml evaluation", "k-fold"], difficulty: "intermediate" },
    ),
    topic(
      "ml-regularization-and-capacity",
      "Regularization and Capacity",
      "Control overfitting with regularization and model capacity choices.",
      [
        "Overfitting",
        "Underfitting",
        "L1/L2",
        "Early Stopping",
        "Dropout Intuition",
        "Bias-Variance Tradeoff",
      ],
      { aliases: ["regularization", "overfitting"], difficulty: "intermediate" },
    ),
    topic(
      "ml-pipelines",
      "ML Pipelines",
      "Compose preprocessing and estimators into reusable pipelines.",
      [
        "Pipeline Abstraction",
        "Transformers",
        "Estimators",
        "Column Transforms",
        "Hyperparameter Search Intro",
        "Reproducible Fits",
      ],
      {
        aliases: ["sklearn pipeline", "ml pipeline"],
        difficulty: "intermediate",
        artifact: {
          type: "code",
          language: "python",
          title: "Sklearn-style pipeline sketch",
          content:
            "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\npipe = Pipeline([\n  (\"scale\", StandardScaler()),\n  (\"clf\", LogisticRegression()),\n])\n# pipe.fit(X_train, y_train)",
          expectedOutput: "Fitted pipeline object ready for predict",
          explanation: "Scaler + classifier as one estimator.",
        },
      },
    ),
    topic(
      "ml-model-ops-basics",
      "Model Ops Basics",
      "Version data/models and monitor simple production failure modes.",
      [
        "Model Registry Intro",
        "Data Versioning",
        "Prediction Logging",
        "Drift Signals",
        "Rollback Plan",
        "Offline vs Online Eval",
      ],
      { aliases: ["mlops basics", "model monitoring"], difficulty: "advanced" },
    ),
  ],
});

graphs.push({
  file: "data-ai/pandas.ts",
  exportName: "pandasKnowledgeGraph",
  id: "kg-pandas",
  title: "Pandas",
  aliases: ["pandas", "learn pandas", "python pandas", "pandas dataframe"],
  category: "Data",
  description:
    "Pandas starter curriculum covering Series/DataFrame, selection, cleaning, groupby, joins, and time series basics.",
  prefix: "pandas",
  contamination: ["aws", "vpc", "react hooks", "kubernetes pod"],
  skillTypes: DATA_SKILLS,
  topics: [
    topic(
      "pandas-series-and-dataframe",
      "Series and DataFrame",
      "Create and inspect Series/DataFrame objects and their indexes.",
      ["Series", "DataFrame", "Index", "dtypes", "head/info", "shape"],
      {
        aliases: ["dataframe", "pandas series"],
        artifact: {
          type: "code",
          language: "python",
          title: "Build a DataFrame",
          content:
            "import pandas as pd\ndf = pd.DataFrame({\"name\": [\"Ada\", \"Lin\"], \"score\": [95, 88]})\nprint(df.shape)\nprint(df[\"score\"].mean())",
          expectedOutput: "(2, 2)\n91.5",
          explanation: "DataFrame construction and Series aggregation.",
        },
      },
    ),
    topic(
      "pandas-selection-and-filtering",
      "Selection and Filtering",
      "Select columns/rows with loc/iloc and boolean masks.",
      ["Column Selection", "loc", "iloc", "Boolean Masks", "query", "Assignment"],
      { aliases: ["pandas loc", "filtering"] },
    ),
    topic(
      "pandas-cleaning",
      "Data Cleaning",
      "Handle missing values, duplicates, and type conversions.",
      ["isna", "fillna/dropna", "duplicated", "astype", "replace", "string Accessors"],
      { aliases: ["pandas cleaning", "missing values"] },
    ),
    topic(
      "pandas-groupby-aggregations",
      "GroupBy and Aggregations",
      "Split-apply-combine with groupby and agg.",
      ["groupby", "agg", "transform", "multi-aggregations", "Named Aggregation", "reset_index"],
      {
        aliases: ["pandas groupby", "aggregations"],
        difficulty: "intermediate",
        artifact: {
          type: "code",
          language: "python",
          title: "Group mean scores",
          content:
            "import pandas as pd\ndf = pd.DataFrame({\"team\": [\"A\", \"A\", \"B\"], \"score\": [10, 20, 15]})\nprint(df.groupby(\"team\")[\"score\"].mean())",
          expectedOutput: "team\nA    15.0\nB    15.0",
          explanation: "Classic groupby mean.",
        },
      },
    ),
    topic(
      "pandas-joins-and-reshaping",
      "Joins and Reshaping",
      "Combine tables with merge/concat and reshape with pivot/melt.",
      ["merge", "join Keys", "concat", "pivot", "melt", "stack/unstack Intro"],
      { aliases: ["pandas merge", "pivot"], difficulty: "intermediate" },
    ),
    topic(
      "pandas-timeseries-basics",
      "Time Series Basics",
      "Parse dates, set DateTimeIndex, and resample simple series.",
      [
        "to_datetime",
        "DateTimeIndex",
        "dt Accessors",
        "resample",
        "rolling",
        "Time Zone Awareness Intro",
      ],
      { aliases: ["pandas time series", "resample"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "data-ai/numpy.ts",
  exportName: "numpyKnowledgeGraph",
  id: "kg-numpy",
  title: "NumPy",
  aliases: ["numpy", "learn numpy", "np", "python numpy"],
  category: "Data",
  description:
    "NumPy starter curriculum covering ndarray, indexing, broadcasting, ufuncs, linear algebra helpers, and random sampling.",
  prefix: "numpy",
  contamination: ["aws", "vpc", "react hooks", "kubernetes pod"],
  skillTypes: DATA_SKILLS,
  topics: [
    topic(
      "numpy-ndarray-basics",
      "ndarray Basics",
      "Create arrays and inspect shape, dtype, and memory layout basics.",
      ["ndarray", "shape", "dtype", "zeros/ones/arange", "reshape", "axis"],
      {
        aliases: ["numpy array", "ndarray"],
        artifact: {
          type: "code",
          language: "python",
          title: "Create and reshape",
          content:
            "import numpy as np\na = np.arange(6).reshape(2, 3)\nprint(a.shape)\nprint(a.dtype)",
          expectedOutput: "(2, 3)\nint64",
          explanation: "arange + reshape yields a 2x3 array.",
        },
      },
    ),
    topic(
      "numpy-indexing-and-slicing",
      "Indexing and Slicing",
      "Select data with slices, boolean masks, and fancy indexing.",
      [
        "Basic Slicing",
        "Boolean Indexing",
        "Fancy Indexing",
        "Views vs Copies",
        "np.where",
        "Assignment via Masks",
      ],
      { aliases: ["numpy indexing", "boolean mask"] },
    ),
    topic(
      "numpy-broadcasting",
      "Broadcasting",
      "Combine arrays of different shapes using broadcasting rules.",
      [
        "Broadcasting Rules",
        "Shape Compatibility",
        "Scalar Broadcast",
        "Axis Expansion",
        "Common Pitfalls",
        "Vectorization Benefit",
      ],
      { aliases: ["broadcasting", "vectorization"], difficulty: "intermediate" },
    ),
    topic(
      "numpy-ufuncs-and-aggregations",
      "Ufuncs and Aggregations",
      "Apply elementwise ufuncs and reductions across axes.",
      ["ufuncs", "sum/mean/std", "axis Reductions", "cumulative Ops", "clip", "nan-aware Ops Intro"],
      { aliases: ["numpy ufunc", "aggregations"] },
    ),
    topic(
      "numpy-linear-algebra-helpers",
      "Linear Algebra Helpers",
      "Use matmul, transpose, and solve helpers for small linear systems.",
      ["transpose", "matmul/@", "dot", "np.linalg.solve", "norms Intro", "Inverse Caution"],
      { aliases: ["numpy linalg", "matmul"], difficulty: "intermediate" },
    ),
    topic(
      "numpy-random-sampling",
      "Random Sampling",
      "Generate reproducible random samples for simulation and ML splits.",
      [
        "Generator API",
        "random.seed/default_rng",
        "Uniform/Normal",
        "Choice/Shuffle",
        "Reproducibility",
        "Sampling without Replacement",
      ],
      { aliases: ["numpy random", "default_rng"] },
    ),
  ],
});

graphs.push({
  file: "data-ai/deep-learning.ts",
  exportName: "deepLearningKnowledgeGraph",
  id: "kg-deep-learning",
  title: "Deep Learning",
  aliases: [
    "deep learning",
    "learn deep learning",
    "neural networks",
    "dl",
    "deep neural nets",
  ],
  category: "AI / Machine Learning",
  description:
    "Deep Learning starter covering tensors, layers, training loops, CNNs/RNNs intuition, regularization, and transfer learning basics.",
  prefix: "dl",
  contamination: ["aws", "vpc", "react hooks", "sql join"],
  skillTypes: DATA_SKILLS,
  topics: [
    topic(
      "dl-tensors-and-autograd",
      "Tensors and Autograd",
      "Represent data as tensors and compute gradients with autograd.",
      ["Tensors", "dtype/device", "Autograd", "Computational Graph", "backward", "no_grad"],
      { aliases: ["tensors", "autograd"] },
    ),
    topic(
      "dl-layers-and-activations",
      "Layers and Activations",
      "Stack linear layers with nonlinear activations.",
      [
        "Linear Layers",
        "ReLU",
        "Softmax",
        "Embedding Intro",
        "Parameter Tensors",
        "Forward Pass",
      ],
      { aliases: ["neural layers", "activations"] },
    ),
    topic(
      "dl-training-loop",
      "Training Loop",
      "Implement the forward/loss/backward/optimize step cycle.",
      [
        "Loss Functions",
        "Optimizers",
        "Mini-batches",
        "Epochs",
        "Learning Rate",
        "Gradient Clipping Intro",
      ],
      {
        aliases: ["training loop", "optimizer"],
        difficulty: "intermediate",
        artifact: {
          type: "code",
          language: "python",
          title: "Pseudo training step",
          content:
            "# pred = model(xb)\n# loss = criterion(pred, yb)\n# opt.zero_grad(); loss.backward(); opt.step()",
          expectedOutput: "Parameters update once per batch",
          explanation: "Canonical DL training step.",
        },
      },
    ),
    topic(
      "dl-cnn-intuition",
      "CNN Intuition",
      "Understand convolution, pooling, and spatial feature hierarchies.",
      [
        "Convolution",
        "Kernels/Filters",
        "Pooling",
        "Channels",
        "Receptive Field",
        "Image Augmentation Intro",
      ],
      { aliases: ["cnn", "convolution"], difficulty: "intermediate" },
    ),
    topic(
      "dl-sequence-models-intuition",
      "Sequence Models Intuition",
      "Compare RNN/LSTM ideas and transformer attention at a conceptual level.",
      [
        "Sequence Data",
        "RNN Intuition",
        "LSTM/GRU Intuition",
        "Attention Intro",
        "Positional Signals",
        "When to Prefer Transformers",
      ],
      { aliases: ["rnn", "attention"], difficulty: "intermediate" },
    ),
    topic(
      "dl-regularization-and-transfer",
      "Regularization and Transfer Learning",
      "Reduce overfitting and reuse pretrained backbones.",
      [
        "Dropout",
        "Weight Decay",
        "Early Stopping",
        "Data Augmentation",
        "Pretrained Models",
        "Fine-tuning",
      ],
      { aliases: ["transfer learning", "dropout"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "data-ai/statistics.ts",
  exportName: "statisticsKnowledgeGraph",
  id: "kg-statistics",
  title: "Statistics",
  aliases: ["statistics", "learn statistics", "stats", "statistical methods"],
  category: "Data",
  description:
    "Statistics starter covering descriptive stats, probability, distributions, sampling, inference, and correlation/regression basics.",
  prefix: "stats",
  contamination: ["aws", "vpc", "react hooks", "kubernetes pod"],
  skillTypes: [
    "concept-understanding",
    "calculation",
    "practical-scenario",
    "debugging",
    "expected-output",
  ],
  topics: [
    topic(
      "stats-descriptive",
      "Descriptive Statistics",
      "Summarize datasets with center, spread, and shape measures.",
      ["Mean/Median/Mode", "Variance/Std Dev", "Percentiles", "Skewness", "Five-number Summary", "Outlier Flags"],
      {
        aliases: ["descriptive stats", "mean median"],
        artifact: {
          type: "calculation",
          title: "Mean and std",
          content: "values = [2, 4, 4, 4, 5, 5, 7, 9]\nmean = 5\nstd ≈ 2.0",
          expectedOutput: "mean 5 with moderate spread",
          explanation: "Classic descriptive summary.",
        },
      },
    ),
    topic(
      "stats-probability-basics",
      "Probability Basics",
      "Reason with events, conditional probability, and independence.",
      [
        "Sample Space",
        "Probability Rules",
        "Conditional Probability",
        "Independence",
        "Bayes Intuition",
        "Counting Basics",
      ],
      { aliases: ["probability", "bayes"] },
    ),
    topic(
      "stats-distributions",
      "Common Distributions",
      "Recognize Bernoulli/Binomial/Normal/Poisson use cases.",
      ["Bernoulli", "Binomial", "Normal", "Poisson", "PDF vs CDF", "Z-scores"],
      { aliases: ["normal distribution", "binomial"], difficulty: "intermediate" },
    ),
    topic(
      "stats-sampling",
      "Sampling and Estimation",
      "Estimate population parameters from samples with standard error intuition.",
      [
        "Population vs Sample",
        "Sampling Distribution",
        "Standard Error",
        "Point Estimates",
        "Bias",
        "Law of Large Numbers",
      ],
      { aliases: ["sampling", "standard error"], difficulty: "intermediate" },
    ),
    topic(
      "stats-inference",
      "Statistical Inference",
      "Build confidence intervals and run basic hypothesis tests.",
      [
        "Confidence Intervals",
        "Null Hypothesis",
        "p-values",
        "Type I/II Errors",
        "t-tests Intro",
        "Practical Significance",
      ],
      { aliases: ["hypothesis testing", "confidence intervals"], difficulty: "intermediate" },
    ),
    topic(
      "stats-correlation-regression",
      "Correlation and Simple Regression",
      "Measure association and fit a simple linear relationship.",
      [
        "Covariance",
        "Correlation",
        "Simple Linear Regression",
        "Residuals",
        "R-squared",
        "Correlation vs Causation",
      ],
      { aliases: ["correlation", "linear regression"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "data-ai/power-bi.ts",
  exportName: "powerBiKnowledgeGraph",
  id: "kg-power-bi",
  title: "Power BI",
  aliases: ["power bi", "powerbi", "learn power bi", "microsoft power bi"],
  category: "Data",
  description:
    "Power BI starter covering Power Query, the model, DAX basics, visuals, relationships, and refresh/sharing.",
  prefix: "pbi",
  contamination: ["aws", "vpc", "react hooks", "kubernetes pod", "python class"],
  skillTypes: [
    "concept-understanding",
    "configuration-analysis",
    "calculation",
    "practical-scenario",
    "debugging",
  ],
  topics: [
    topic(
      "pbi-power-query",
      "Power Query Transformation",
      "Ingest and shape tables with Power Query steps.",
      [
        "Get Data",
        "Applied Steps",
        "Column Transforms",
        "Merge Queries",
        "Append Queries",
        "Data Types",
      ],
      { aliases: ["power query", "get data"] },
    ),
    topic(
      "pbi-data-model",
      "Data Model Basics",
      "Design star-schema style models with fact and dimension tables.",
      [
        "Fact Tables",
        "Dimension Tables",
        "Star Schema",
        "Relationships",
        "Cardinality",
        "Filter Direction",
      ],
      { aliases: ["power bi model", "star schema"], difficulty: "intermediate" },
    ),
    topic(
      "pbi-dax-basics",
      "DAX Basics",
      "Write measures with CALCULATE, FILTER, and iterator functions.",
      ["Measures vs Columns", "CALCULATE", "FILTER", "SUMX", "Time Intelligence Intro", "Context Transition"],
      {
        aliases: ["dax", "calculate"],
        difficulty: "intermediate",
        artifact: {
          type: "calculation",
          language: "dax",
          title: "Total Sales measure",
          content: "Total Sales = SUM ( Sales[Amount] )\nSales LY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )",
          expectedOutput: "Measures respond to report filters",
          explanation: "Base measure plus simple time intelligence.",
        },
      },
    ),
    topic(
      "pbi-visuals-and-reports",
      "Visuals and Report Design",
      "Build readable reports with appropriate visuals and interactions.",
      [
        "Visual Types",
        "Filters Pane",
        "Slicers",
        "Drillthrough",
        "Bookmarks Intro",
        "Accessibility Contrast",
      ],
      { aliases: ["power bi visuals", "report design"] },
    ),
    topic(
      "pbi-relationships-and-filter-context",
      "Relationships and Filter Context",
      "Predict how filters propagate across relationships.",
      [
        "Filter Context",
        "Row Context",
        "Cross-filtering",
        "Both Directions Caution",
        "Inactive Relationships",
        "USERELATIONSHIP",
      ],
      { aliases: ["filter context", "relationships"], difficulty: "intermediate" },
    ),
    topic(
      "pbi-refresh-and-sharing",
      "Refresh and Sharing",
      "Schedule refresh and share workspaces/apps securely.",
      [
        "Import vs DirectQuery",
        "Gateway Intro",
        "Scheduled Refresh",
        "Workspaces",
        "Apps",
        "Row-Level Security Intro",
      ],
      { aliases: ["power bi refresh", "rls"], difficulty: "intermediate" },
    ),
  ],
});

// ---------- Cloud / DevOps ----------
graphs.push({
  file: "cloud-devops/aws-saa.ts",
  exportName: "awsSaaKnowledgeGraph",
  id: "kg-aws-saa",
  title: "AWS Solutions Architect",
  aliases: [
    "aws",
    "aws saa",
    "saa-c03",
    "aws solutions architect",
    "aws solutions architect associate",
    "learn aws saa",
    "amazon web services saa",
  ],
  category: "Cloud",
  description:
    "AWS SAA curriculum covering IAM, VPC, EC2, S3, databases, high availability, security, and cost/architecture tradeoffs for the Solutions Architect Associate exam path.",
  prefix: "aws-saa",
  contamination: ["react hooks", "jsx", "python class", "sql join syntax"],
  skillTypes: CLOUD_SKILLS,
  topics: [
    topic(
      "aws-saa-iam-and-accounts",
      "IAM and Account Security",
      "Secure AWS access with users, roles, policies, and least privilege.",
      [
        "IAM Users and Groups",
        "IAM Roles",
        "Identity Policies",
        "Resource Policies",
        "MFA",
        "Organizations Intro",
      ],
      {
        aliases: ["iam", "aws iam", "least privilege"],
        artifact: {
          type: "case-study",
          title: "Read-only S3 policy sketch",
          content:
            "Goal: grant a reporting role read access to one bucket only.\nAllow: s3:ListBucket on arn:aws:s3:::reports\nAllow: s3:GetObject on arn:aws:s3:::reports/*\nDeny by omission: any other bucket or mutating actions\nOutcome: least-privilege read path for reports data",
          expectedOutput: "Principal can list/get objects in reports bucket only",
          explanation: "Least-privilege S3 read policy shape.",
        },
      },
    ),
    topic(
      "aws-saa-vpc-networking",
      "VPC Networking",
      "Design VPCs with subnets, route tables, gateways, and security controls.",
      [
        "VPC CIDR",
        "Public/Private Subnets",
        "Route Tables",
        "Internet Gateway",
        "NAT Gateway",
        "Security Groups vs NACLs",
      ],
      {
        aliases: ["vpc", "aws vpc", "subnets", "vpc networking", "VPC Networking"],
        artifact: {
          type: "workflow",
          title: "Two-tier VPC sketch",
          content:
            "Step 1: Create VPC 10.0.0.0/16\nStep 2: Add public subnet 10.0.1.0/24 with IGW for the load balancer\nStep 3: Add private subnet 10.0.2.0/24 with NAT for app tiers\nStep 4: Restrict security groups so only the load balancer can reach app port 443\nOutcome: public ingress stays isolated from private compute",
          expectedOutput: "Public ingress isolated from private compute",
          explanation: "Classic public/private subnet pattern.",
        },
      },
    ),
    topic(
      "aws-saa-ec2-compute",
      "EC2 Compute",
      "Choose instance families, AMIs, storage, and scaling patterns for EC2.",
      [
        "Instance Types",
        "AMIs",
        "EBS Volumes",
        "User Data",
        "Auto Scaling Groups",
        "Launch Templates",
      ],
      { aliases: ["ec2", "auto scaling"], difficulty: "intermediate" },
    ),
    topic(
      "aws-saa-s3-storage",
      "S3 Storage",
      "Store objects with appropriate classes, encryption, and access patterns.",
      [
        "Buckets and Objects",
        "Storage Classes",
        "Versioning",
        "Encryption",
        "Presigned URLs",
        "Lifecycle Rules",
      ],
      { aliases: ["s3", "object storage"], difficulty: "intermediate" },
    ),
    topic(
      "aws-saa-databases",
      "Managed Databases",
      "Select RDS/Aurora/DynamoDB patterns for relational and key-value workloads.",
      [
        "RDS",
        "Aurora",
        "Multi-AZ",
        "Read Replicas",
        "DynamoDB",
        "ElastiCache Intro",
      ],
      { aliases: ["rds", "dynamodb", "aurora"], difficulty: "intermediate" },
    ),
    topic(
      "aws-saa-high-availability",
      "High Availability and Elastic Load Balancing",
      "Distribute traffic and survive AZ failures with ELB and multi-AZ design.",
      [
        "Availability Zones",
        "Application Load Balancer",
        "Target Groups",
        "Health Checks",
        "Multi-AZ Patterns",
        "Decoupling with SQS Intro",
      ],
      { aliases: ["alb", "high availability", "multi-az"], difficulty: "intermediate" },
    ),
    topic(
      "aws-saa-security-services",
      "Security Services",
      "Protect data and apps with KMS, Secrets Manager, WAF, and CloudTrail.",
      [
        "KMS",
        "Secrets Manager",
        "AWS WAF",
        "CloudTrail",
        "GuardDuty Intro",
        "Encryption in Transit/Rest",
      ],
      { aliases: ["kms", "cloudtrail", "waf"], difficulty: "intermediate" },
    ),
    topic(
      "aws-saa-cost-and-architecture",
      "Cost Optimization and Well-Architected Tradeoffs",
      "Balance reliability, performance, and cost using Well-Architected themes.",
      [
        "Pricing Models",
        "Reserved/Savings Plans",
        "Right Sizing",
        "Well-Architected Pillars",
        "Managed vs Self-Managed",
        "Architecture Decision Records",
      ],
      { aliases: ["well-architected", "cost optimization"], difficulty: "advanced" },
    ),
  ],
});

graphs.push({
  file: "cloud-devops/azure-az900.ts",
  exportName: "azureAz900KnowledgeGraph",
  id: "kg-azure-az900",
  title: "Azure AZ-900",
  aliases: [
    "azure",
    "az-900",
    "az900",
    "azure fundamentals",
    "learn az-900",
    "microsoft azure fundamentals",
  ],
  category: "Cloud",
  description:
    "Azure AZ-900 curriculum covering cloud concepts, core Azure services, security/identity, governance, pricing, and management tools.",
  prefix: "az900",
  contamination: ["react hooks", "jsx", "python class", "kubernetes pod"],
  skillTypes: CLOUD_SKILLS,
  topics: [
    topic(
      "az900-cloud-concepts",
      "Cloud Concepts",
      "Explain cloud models, shared responsibility, and consumption benefits.",
      [
        "IaaS/PaaS/SaaS",
        "Public/Private/Hybrid",
        "Shared Responsibility",
        "High Availability",
        "Scalability",
        "CapEx vs OpEx",
      ],
      { aliases: ["cloud concepts", "iaas paas saas", "Cloud Concepts"] },
    ),
    topic(
      "az900-core-services",
      "Core Azure Services",
      "Identify compute, networking, storage, and database building blocks.",
      [
        "Azure VMs",
        "App Service",
        "Virtual Network",
        "Blob Storage",
        "Azure SQL",
        "Regions and AZs",
      ],
      {
        aliases: ["azure services", "blob storage"],
        artifact: {
          type: "configuration",
          title: "Resource group + storage sketch",
          content:
            "Resource Group: rg-learn\nStorage Account: stlearn001 (hot tier)\nContainer: datasets\nVM: optional jump box in same region",
          expectedOutput: "Grouped resources in one region/RG",
          explanation: "AZ-900 style core resource grouping.",
        },
      },
    ),
    topic(
      "az900-identity-and-security",
      "Identity and Security",
      "Use Entra ID, MFA, and defense-in-depth security controls.",
      [
        "Microsoft Entra ID",
        "MFA",
        "Conditional Access Intro",
        "Defense in Depth",
        "Encryption",
        "Network Security Groups",
      ],
      { aliases: ["entra id", "azure security"], difficulty: "intermediate" },
    ),
    topic(
      "az900-governance",
      "Governance and Compliance",
      "Apply management groups, policies, and resource locks.",
      [
        "Management Groups",
        "Subscriptions",
        "Azure Policy",
        "Resource Locks",
        "Tags",
        "Blueprints Intro",
      ],
      { aliases: ["azure policy", "governance"], difficulty: "intermediate" },
    ),
    topic(
      "az900-pricing-and-sla",
      "Pricing and SLAs",
      "Estimate cost factors and interpret service-level agreements.",
      [
        "Pricing Factors",
        "Pricing Calculator",
        "TCO Calculator",
        "SLA",
        "Service Lifecycle",
        "Budgets/Alerts Intro",
      ],
      { aliases: ["azure pricing", "sla"] },
    ),
    topic(
      "az900-management-tools",
      "Management Tools",
      "Operate Azure with Portal, CLI, PowerShell, and Resource Manager.",
      [
        "Azure Portal",
        "Azure CLI",
        "Azure PowerShell",
        "ARM Templates Intro",
        "Cloud Shell",
        "Azure Monitor Intro",
      ],
      { aliases: ["azure cli", "arm templates"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "cloud-devops/aws-developer.ts",
  exportName: "awsDeveloperKnowledgeGraph",
  id: "kg-aws-developer",
  title: "AWS Developer",
  aliases: [
    "aws developer",
    "dva-c02",
    "aws developer associate",
    "learn aws developer",
  ],
  category: "Cloud",
  description:
    "AWS Developer starter covering IAM for apps, Lambda, API Gateway, DynamoDB data access, deployment tooling, and observability.",
  prefix: "aws-dev",
  contamination: ["react hooks", "jsx", "python class"],
  skillTypes: CLOUD_SKILLS,
  topics: [
    topic(
      "aws-dev-iam-for-apps",
      "IAM for Applications",
      "Grant least-privilege roles to compute and temporary credentials.",
      [
        "Task/Instance Roles",
        "sts:AssumeRole",
        "Scoped Policies",
        "Environment Credentials Anti-pattern",
        "Permission Boundaries Intro",
        "Identity Federation Intro",
      ],
      { aliases: ["iam roles", "assume role"] },
    ),
    topic(
      "aws-dev-lambda",
      "AWS Lambda",
      "Build event-driven functions with packaging, timeouts, and concurrency basics.",
      [
        "Handler Model",
        "Runtime/Package",
        "Event Sources",
        "Timeouts/Memory",
        "Environment Variables",
        "Idempotency Basics",
      ],
      { aliases: ["lambda", "serverless functions"], difficulty: "intermediate" },
    ),
    topic(
      "aws-dev-api-gateway",
      "API Gateway",
      "Expose HTTP APIs with routing, auth, and integration to Lambda.",
      [
        "HTTP API vs REST API",
        "Routes/Integrations",
        "Authorizers Intro",
        "Stages",
        "Throttling",
        "CORS Basics",
      ],
      { aliases: ["api gateway", "http api"], difficulty: "intermediate" },
    ),
    topic(
      "aws-dev-dynamodb-access",
      "DynamoDB Data Access",
      "Model keys and read/write with the AWS SDK access patterns.",
      [
        "Partition/Sort Keys",
        "GetItem/Query",
        "PutItem/UpdateItem",
        "GSIs Intro",
        "Conditional Writes",
        "Pagination",
      ],
      { aliases: ["dynamodb", "gsi"], difficulty: "intermediate" },
    ),
    topic(
      "aws-dev-deployment-tooling",
      "Deployment Tooling",
      "Ship app updates with SAM/CDK concepts and CI artifacts.",
      [
        "Infrastructure as Code Intro",
        "SAM Template Basics",
        "CDK App Intro",
        "CI Build Artifacts",
        "Canary/Linear Deploy Intro",
        "Rollback Signals",
      ],
      { aliases: ["aws sam", "cdk"], difficulty: "intermediate" },
    ),
    topic(
      "aws-dev-observability",
      "Observability for Developers",
      "Debug with CloudWatch logs/metrics/traces and X-Ray basics.",
      [
        "CloudWatch Logs",
        "Metrics/Alarms",
        "X-Ray Tracing Intro",
        "Structured Logging",
        "Cold Start Signals",
        "Error Budgets Intro",
      ],
      { aliases: ["cloudwatch", "x-ray"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "cloud-devops/azure-az204.ts",
  exportName: "azureAz204KnowledgeGraph",
  id: "kg-azure-az204",
  title: "Azure AZ-204",
  aliases: [
    "az-204",
    "az204",
    "azure developer",
    "azure developer associate",
    "learn az-204",
  ],
  category: "Cloud",
  description:
    "Azure AZ-204 starter covering App Service, Functions, storage/SDK access, Key Vault, messaging, and monitoring for developers.",
  prefix: "az204",
  contamination: ["react hooks", "jsx", "python class", "kubernetes pod"],
  skillTypes: CLOUD_SKILLS,
  topics: [
    topic(
      "az204-app-service",
      "App Service Web Apps",
      "Deploy and configure web apps on Azure App Service.",
      [
        "App Service Plans",
        "Deployment Slots",
        "App Settings",
        "Scaling",
        "Custom Domains/TLS Intro",
        "Diagnostic Logs",
      ],
      { aliases: ["app service", "deployment slots"] },
    ),
    topic(
      "az204-functions",
      "Azure Functions",
      "Implement trigger/binding-based serverless functions.",
      [
        "Triggers",
        "Bindings",
        "Durable Functions Intro",
        "Hosting Plans",
        "Local Dev",
        "Idempotent Handlers",
      ],
      { aliases: ["azure functions", "bindings"], difficulty: "intermediate" },
    ),
    topic(
      "az204-storage-and-sdk",
      "Storage and SDK Access",
      "Use Blob/Queue/Table storage from application code.",
      [
        "Blob Storage SDK",
        "Containers/Blobs",
        "SAS Tokens",
        "Queues",
        "Table Storage Intro",
        "Retry Policies",
      ],
      { aliases: ["azure storage sdk", "sas"], difficulty: "intermediate" },
    ),
    topic(
      "az204-secure-configuration",
      "Secure App Configuration",
      "Store secrets in Key Vault and wire managed identities.",
      [
        "Key Vault Secrets",
        "Managed Identity",
        "App Configuration Intro",
        "RBAC for Apps",
        "Connection String Hygiene",
        "Rotation Basics",
      ],
      { aliases: ["key vault", "managed identity"], difficulty: "intermediate" },
    ),
    topic(
      "az204-messaging",
      "Messaging with Service Bus and Event Grid",
      "Decouple services with queues/topics and event routing.",
      [
        "Service Bus Queues",
        "Topics/Subscriptions",
        "Event Grid",
        "Poison Messages",
        "At-least-once Delivery",
        "Ordering Caveats",
      ],
      { aliases: ["service bus", "event grid"], difficulty: "intermediate" },
    ),
    topic(
      "az204-monitoring",
      "Monitoring and Troubleshooting",
      "Instrument apps with Application Insights and Log Analytics basics.",
      [
        "Application Insights",
        "Correlation IDs",
        "Dependency Tracking",
        "Availability Tests Intro",
        "Log Analytics Queries Intro",
        "Alert Rules",
      ],
      { aliases: ["application insights", "monitoring"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "cloud-devops/gcp.ts",
  exportName: "gcpKnowledgeGraph",
  id: "kg-gcp",
  title: "Google Cloud Platform",
  aliases: [
    "gcp",
    "google cloud",
    "learn gcp",
    "google cloud platform",
    "gcp cloud",
  ],
  category: "Cloud",
  description:
    "GCP starter covering projects/IAM, Compute Engine, GKE intro, Cloud Storage, networking, and operations tooling.",
  prefix: "gcp",
  contamination: ["react hooks", "jsx", "python class", "sql join"],
  skillTypes: CLOUD_SKILLS,
  topics: [
    topic(
      "gcp-projects-and-iam",
      "Projects and IAM",
      "Organize resources with projects and least-privilege IAM roles.",
      [
        "Projects",
        "Folders/Org Intro",
        "IAM Roles",
        "Service Accounts",
        "Policy Bindings",
        "Least Privilege",
      ],
      { aliases: ["gcp iam", "service accounts"] },
    ),
    topic(
      "gcp-compute-engine",
      "Compute Engine",
      "Launch VMs with machine types, disks, and instance groups.",
      [
        "VM Instances",
        "Machine Types",
        "Persistent Disks",
        "Instance Templates",
        "Managed Instance Groups",
        "Startup Scripts",
      ],
      { aliases: ["compute engine", "gcp vms"], difficulty: "intermediate" },
    ),
    topic(
      "gcp-gke-intro",
      "GKE Intro",
      "Understand GKE clusters, node pools, and workload deployment basics.",
      [
        "Clusters",
        "Node Pools",
        "Workloads",
        "Services",
        "kubectl Context",
        "Autopilot vs Standard Intro",
      ],
      { aliases: ["gke", "google kubernetes"], difficulty: "intermediate" },
    ),
    topic(
      "gcp-cloud-storage",
      "Cloud Storage",
      "Store objects with buckets, classes, and IAM/ACLs carefully.",
      [
        "Buckets",
        "Storage Classes",
        "Object Versioning",
        "IAM vs ACLs",
        "Signed URLs",
        "Lifecycle Rules",
      ],
      { aliases: ["gcs", "cloud storage"] },
    ),
    topic(
      "gcp-networking",
      "VPC Networking on GCP",
      "Connect resources with VPC, subnets, firewall rules, and Cloud NAT.",
      [
        "VPC Networks",
        "Subnets",
        "Firewall Rules",
        "Cloud NAT",
        "Cloud Load Balancing Intro",
        "Private Google Access",
      ],
      { aliases: ["gcp vpc", "firewall rules"], difficulty: "intermediate" },
    ),
    topic(
      "gcp-operations",
      "Operations and Observability",
      "Monitor and troubleshoot with Cloud Monitoring/Logging.",
      [
        "Cloud Monitoring",
        "Cloud Logging",
        "Alerting Policies",
        "Trace Intro",
        "Error Reporting",
        "Dashboards",
      ],
      { aliases: ["cloud monitoring", "cloud logging"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "cloud-devops/terraform.ts",
  exportName: "terraformKnowledgeGraph",
  id: "kg-terraform",
  title: "Terraform",
  aliases: ["terraform", "learn terraform", "hashicorp terraform", "tf"],
  category: "DevOps",
  description:
    "Terraform starter covering HCL, providers/state, resources, variables/outputs, modules, and plan/apply workflows.",
  prefix: "tf",
  contamination: ["react hooks", "jsx", "python class", "sql join"],
  skillTypes: CLOUD_SKILLS,
  topics: [
    topic(
      "tf-hcl-basics",
      "HCL Basics",
      "Author Terraform configuration with blocks, arguments, and expressions.",
      ["Blocks", "Arguments", "Expressions", "Types", "Locals", "Comments"],
      {
        aliases: ["hcl", "terraform syntax"],
        artifact: {
          type: "configuration",
          language: "hcl",
          title: "Minimal null resource",
          content:
            'terraform {\n  required_version = ">= 1.5.0"\n}\nresource "null_resource" "example" {\n  triggers = { always = timestamp() }\n}',
          expectedOutput: "terraform validate succeeds",
          explanation: "Tiny valid configuration for syntax practice.",
        },
      },
    ),
    topic(
      "tf-providers-and-state",
      "Providers and State",
      "Configure providers and reason about local/remote state.",
      [
        "Provider Blocks",
        "Required Providers",
        "State File",
        "Remote Backend Intro",
        "State Locking",
        "terraform init",
      ],
      { aliases: ["terraform state", "providers"], difficulty: "intermediate" },
    ),
    topic(
      "tf-resources-and-dependencies",
      "Resources and Dependencies",
      "Declare resources and understand implicit/explicit dependencies.",
      [
        "Resource Addresses",
        "Implicit Dependencies",
        "depends_on",
        "Count/for_each Intro",
        "Lifecycle Meta-Args",
        "Data Sources",
      ],
      { aliases: ["terraform resources", "depends_on"], difficulty: "intermediate" },
    ),
    topic(
      "tf-variables-and-outputs",
      "Variables and Outputs",
      "Parameterize modules with variables, locals, and outputs.",
      [
        "input Variables",
        "variable Validation",
        "tfvars",
        "Outputs",
        "Sensitive Values",
        "Type Constraints",
      ],
      { aliases: ["tfvars", "terraform outputs"] },
    ),
    topic(
      "tf-modules",
      "Modules",
      "Compose reusable modules with inputs/outputs and version constraints.",
      [
        "Module Blocks",
        "Module Sources",
        "Module Inputs/Outputs",
        "Module Versioning",
        "Root Module",
        "Composition Patterns",
      ],
      { aliases: ["terraform modules", "module source"], difficulty: "intermediate" },
    ),
    topic(
      "tf-plan-apply-workflow",
      "Plan and Apply Workflow",
      "Review plans safely and apply changes with collaboration hygiene.",
      [
        "terraform plan",
        "terraform apply",
        "Plan Files",
        "Destroy Caution",
        "Workspaces Intro",
        "Policy Checks Intro",
      ],
      { aliases: ["terraform plan", "terraform apply"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "cloud-devops/devops.ts",
  exportName: "devopsKnowledgeGraph",
  id: "kg-devops",
  title: "DevOps",
  aliases: ["devops", "learn devops", "devops engineering", "ci cd devops"],
  category: "DevOps",
  description:
    "DevOps starter covering CI/CD, infrastructure as code mindset, environments, observability, collaboration, and release strategies.",
  prefix: "devops",
  contamination: ["react hooks", "jsx", "python class", "sql join"],
  skillTypes: CLOUD_SKILLS,
  topics: [
    topic(
      "devops-cicd-pipelines",
      "CI/CD Pipelines",
      "Automate build, test, and deploy stages with pipeline as code.",
      [
        "Continuous Integration",
        "Continuous Delivery",
        "Pipeline as Code",
        "Build Artifacts",
        "Test Gates",
        "Deploy Stages",
      ],
      {
        aliases: ["ci/cd", "pipelines"],
        artifact: {
          type: "workflow",
          title: "Four-stage pipeline",
          content: "lint -> unit test -> build image -> deploy to staging",
          expectedOutput: "Each commit produces a tested artifact before deploy",
          explanation: "Minimal healthy CI/CD path.",
        },
      },
    ),
    topic(
      "devops-infrastructure-as-code",
      "Infrastructure as Code Mindset",
      "Manage environments declaratively with reviewable config.",
      [
        "Declarative Config",
        "Idempotency",
        "Drift Detection",
        "Code Review for Infra",
        "Secrets Separation",
        "Environment Parity",
      ],
      { aliases: ["iac", "infrastructure as code"], difficulty: "intermediate" },
    ),
    topic(
      "devops-environments",
      "Environments and Promotion",
      "Promote changes through dev/stage/prod with clear controls.",
      [
        "Environment Topology",
        "Promotion Paths",
        "Config per Environment",
        "Feature Flags Intro",
        "Manual Approvals",
        "Blast Radius",
      ],
      { aliases: ["deployment environments", "promotion"] },
    ),
    topic(
      "devops-observability",
      "Observability",
      "Use metrics, logs, and traces to detect and diagnose failures.",
      ["Metrics", "Logs", "Traces", "SLIs/SLOs Intro", "Alert Hygiene", "On-call Runbooks"],
      { aliases: ["observability", "slo"], difficulty: "intermediate" },
    ),
    topic(
      "devops-collaboration-practices",
      "Collaboration Practices",
      "Apply trunk-based development, blameless culture, and docs-as-code.",
      [
        "Trunk-Based Dev",
        "Code Review Norms",
        "Blameless Postmortems",
        "Docs as Code",
        "Cross-functional Ownership",
        "Toil Reduction",
      ],
      { aliases: ["devops culture", "postmortems"] },
    ),
    topic(
      "devops-release-strategies",
      "Release Strategies",
      "Ship safely with blue/green, canaries, and rollback plans.",
      [
        "Blue/Green",
        "Canary Releases",
        "Rolling Updates",
        "Rollback Criteria",
        "Database Migration Caution",
        "Change Failure Rate",
      ],
      { aliases: ["canary", "blue green"], difficulty: "intermediate" },
    ),
  ],
});

graphs.push({
  file: "security-architecture/system-design.ts",
  exportName: "systemDesignKnowledgeGraph",
  id: "kg-system-design",
  title: "System Design",
  aliases: [
    "system design",
    "learn system design",
    "distributed systems design",
    "software architecture design",
  ],
  category: "General Technology",
  description:
    "System Design curriculum covering requirements, capacity, data modeling, caching, messaging, reliability, and API/design tradeoffs.",
  prefix: "sd",
  contamination: ["react hooks", "jsx", "python class"],
  skillTypes: ARCH_SKILLS,
  topics: [
    topic(
      "sd-requirements-and-constraints",
      "Requirements and Constraints",
      "Clarify functional/non-functional requirements and hard constraints.",
      [
        "Functional Requirements",
        "Non-Functional Requirements",
        "SLAs/SLOs",
        "Consistency Needs",
        "Latency Budgets",
        "Cost Constraints",
      ],
      { aliases: ["nfr", "system requirements"] },
    ),
    topic(
      "sd-capacity-and-back-of-envelope",
      "Capacity and Back-of-Envelope Estimates",
      "Estimate QPS, storage, and bandwidth to size components.",
      [
        "QPS Estimation",
        "Storage Estimation",
        "Bandwidth",
        "Peak vs Average",
        "Growth Assumptions",
        "Unit Conversions",
      ],
      {
        aliases: ["back of envelope", "capacity planning"],
        difficulty: "intermediate",
        artifact: {
          type: "calculation",
          title: "Daily write volume",
          content:
            "10M users * 2 writes/day = 20M writes/day\n≈ 231 writes/sec average (ignore peaks)",
          expectedOutput: "~231 average writes/sec before peak factor",
          explanation: "Simple capacity sketch.",
        },
      },
    ),
    topic(
      "sd-data-modeling-and-storage",
      "Data Modeling and Storage Choices",
      "Choose SQL/NoSQL/blob patterns based on access patterns.",
      [
        "Access Patterns First",
        "Relational Fits",
        "Document/Key-Value Fits",
        "Blob/Object Storage",
        "Indexing Strategy",
        "Sharding Intro",
      ],
      { aliases: ["storage choices", "sharding"], difficulty: "intermediate" },
    ),
    topic(
      "sd-caching",
      "Caching Strategies",
      "Reduce load with cache placement, TTLs, and invalidation tactics.",
      [
        "Cache Placement",
        "Cache-Aside",
        "TTL",
        "Invalidation",
        "Stampede Control",
        "Hot Key Handling",
      ],
      { aliases: ["caching", "cache-aside"], difficulty: "intermediate" },
    ),
    topic(
      "sd-messaging-and-async",
      "Messaging and Asynchronous Processing",
      "Decouple services with queues/streams and async workflows.",
      [
        "Message Queues",
        "Pub/Sub",
        "At-least-once Delivery",
        "Idempotent Consumers",
        "Backpressure",
        "Dead-letter Queues",
      ],
      { aliases: ["message queues", "pubsub"], difficulty: "intermediate" },
    ),
    topic(
      "sd-reliability-and-scaling",
      "Reliability and Scaling",
      "Scale horizontally and design for failure with redundancy.",
      [
        "Horizontal Scaling",
        "Load Balancing",
        "Redundancy",
        "Failover",
        "Graceful Degradation",
        "Circuit Breakers Intro",
      ],
      { aliases: ["horizontal scaling", "failover"], difficulty: "intermediate" },
    ),
    topic(
      "sd-api-design",
      "API Design for Systems",
      "Design external/internal APIs with versioning and pagination.",
      [
        "Resource Modeling",
        "Idempotent Methods",
        "Pagination",
        "Versioning",
        "Rate Limiting",
        "Error Contracts",
      ],
      { aliases: ["api design", "rate limiting"], difficulty: "intermediate" },
    ),
    topic(
      "sd-consistency-tradeoffs",
      "Consistency Tradeoffs",
      "Reason about CAP/PACELC-style tradeoffs and consistency models.",
      [
        "Strong Consistency",
        "Eventual Consistency",
        "CAP Intuition",
        "Read-Your-Writes",
        "Transactions Boundaries",
        "Saga Intro",
      ],
      { aliases: ["consistency", "cap theorem"], difficulty: "advanced" },
    ),
  ],
});

for (const g of graphs) {
  const out = path.join(ROOT, g.file);
  fs.writeFileSync(out, renderGraph(g), "utf8");
  console.log("wrote", g.file, g.topics.length, "topics");
}
console.log("part B done", graphs.length);
