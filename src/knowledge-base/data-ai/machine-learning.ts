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

const ml_problem_framingTopic = topic({
  id: "ml-problem-framing",
  title: "ML Problem Framing",
  aliases: ["ml problems","supervised unsupervised"],
  description: "Classify problems as supervised, unsupervised, or ranking/recommendation style tasks.",
  learningOrder: 1,
  
  relatedTopicIds: ["ml-data-preparation"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ml-supervised-learning",
      title: "Supervised Learning",
      description: "Supervised Learning applied in this topic.",
    }),
    concept({
      id: "ml-unsupervised-learning",
      title: "Unsupervised Learning",
      description: "Unsupervised Learning applied in this topic.",
    }),
    concept({
      id: "ml-regression-vs-classification",
      title: "Regression vs Classification",
      description: "Regression vs Classification applied in this topic.",
    }),
    concept({
      id: "ml-features-and-labels",
      title: "Features and Labels",
      description: "Features and Labels applied in this topic.",
    }),
    concept({
      id: "ml-online-vs-batch",
      title: "Online vs Batch",
      description: "Online vs Batch applied in this topic.",
    }),
    concept({
      id: "ml-success-metrics",
      title: "Success Metrics",
      description: "Success Metrics applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Supervised Learning correctly","Explain Unsupervised Learning in context"],
  practicalArtifacts: [
    artifact({
      id: "ml-problem-framing-artifact",
      type: "code",
      title: "ML Problem Framing worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Supervised Learning, Unsupervised Learning, Regression vs Classification.",
      conceptIds: ["ml-supervised-learning","ml-unsupervised-learning","ml-regression-vs-classification","ml-features-and-labels"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ml-problem-framing-mistake-1",
      "Misapplying Supervised Learning",
      "Skipping hands-on checks in ML Problem Framing",
      "Practice Supervised Learning with a tiny example first.",
      ["ml-supervised-learning"],
    ),
    mistake(
      "ml-problem-framing-mistake-2",
      "Pulling unrelated-domain demos into ML Problem Framing",
      "Defaulting to out-of-domain snippets",
      "Stay inside ML Problem Framing concepts.",
      ["ml-unsupervised-learning"],
    ),
  ],
  exercises: [
    exercise({
      id: "ml-problem-framing-exercise",
      title: "ML Problem Framing mini exercise",
      instructions: ["Build a small example covering Supervised Learning.","Extend it with Unsupervised Learning.","Verify behavior related to Regression vs Classification."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for ML Problem Framing.",
      conceptIds: ["ml-supervised-learning","ml-unsupervised-learning","ml-regression-vs-classification"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("ml-problem-framing", ["ml-supervised-learning","ml-unsupervised-learning","ml-regression-vs-classification","ml-features-and-labels","ml-online-vs-batch"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ml_data_preparationTopic = topic({
  id: "ml-data-preparation",
  title: "Data Preparation for ML",
  aliases: ["ml preprocessing","train test split"],
  description: "Clean, split, and encode datasets without leakage.",
  learningOrder: 2,
  prerequisiteIds: ["ml-problem-framing"],
  relatedTopicIds: ["ml-classical-algorithms"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ml-train-validation-test",
      title: "Train/Validation/Test",
      description: "Train/Validation/Test applied in this topic.",
    }),
    concept({
      id: "ml-missing-values",
      title: "Missing Values",
      description: "Missing Values applied in this topic.",
    }),
    concept({
      id: "ml-encoding",
      title: "Encoding",
      description: "Encoding applied in this topic.",
    }),
    concept({
      id: "ml-scaling",
      title: "Scaling",
      description: "Scaling applied in this topic.",
    }),
    concept({
      id: "ml-class-imbalance",
      title: "Class Imbalance",
      description: "Class Imbalance applied in this topic.",
    }),
    concept({
      id: "ml-leakage-checks",
      title: "Leakage Checks",
      description: "Leakage Checks applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Train/Validation/Test correctly","Explain Missing Values in context"],
  practicalArtifacts: [
    artifact({
      id: "ml-data-preparation-artifact",
      type: "code",
      title: "Data Preparation for ML worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Train/Validation/Test, Missing Values, Encoding.",
      conceptIds: ["ml-train-validation-test","ml-missing-values","ml-encoding","ml-scaling"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ml-data-preparation-mistake-1",
      "Misapplying Train/Validation/Test",
      "Skipping hands-on checks in Data Preparation for ML",
      "Practice Train/Validation/Test with a tiny example first.",
      ["ml-train-validation-test"],
    ),
    mistake(
      "ml-data-preparation-mistake-2",
      "Pulling unrelated-domain demos into Data Preparation for ML",
      "Defaulting to out-of-domain snippets",
      "Stay inside Data Preparation for ML concepts.",
      ["ml-missing-values"],
    ),
  ],
  exercises: [
    exercise({
      id: "ml-data-preparation-exercise",
      title: "Data Preparation for ML mini exercise",
      instructions: ["Build a small example covering Train/Validation/Test.","Extend it with Missing Values.","Verify behavior related to Encoding."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Data Preparation for ML.",
      conceptIds: ["ml-train-validation-test","ml-missing-values","ml-encoding"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("ml-data-preparation", ["ml-train-validation-test","ml-missing-values","ml-encoding","ml-scaling","ml-class-imbalance"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ml_classical_algorithmsTopic = topic({
  id: "ml-classical-algorithms",
  title: "Classical Algorithms",
  aliases: ["classical ml","random forest"],
  description: "Apply linear models, trees, and nearest neighbors as strong baselines.",
  learningOrder: 3,
  prerequisiteIds: ["ml-data-preparation"],
  relatedTopicIds: ["ml-training-and-optimization"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ml-linear-models",
      title: "Linear Models",
      description: "Linear Models applied in this topic.",
    }),
    concept({
      id: "ml-decision-trees",
      title: "Decision Trees",
      description: "Decision Trees applied in this topic.",
    }),
    concept({
      id: "ml-random-forests",
      title: "Random Forests",
      description: "Random Forests applied in this topic.",
    }),
    concept({
      id: "ml-k-nn",
      title: "k-NN",
      description: "k-NN applied in this topic.",
    }),
    concept({
      id: "ml-naive-bayes",
      title: "Naive Bayes",
      description: "Naive Bayes applied in this topic.",
    }),
    concept({
      id: "ml-algorithm-selection",
      title: "Algorithm Selection",
      description: "Algorithm Selection applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Linear Models correctly","Explain Decision Trees in context"],
  practicalArtifacts: [
    artifact({
      id: "ml-classical-algorithms-artifact",
      type: "code",
      title: "Classical Algorithms worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Linear Models, Decision Trees, Random Forests.",
      conceptIds: ["ml-linear-models","ml-decision-trees","ml-random-forests","ml-k-nn"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ml-classical-algorithms-mistake-1",
      "Misapplying Linear Models",
      "Skipping hands-on checks in Classical Algorithms",
      "Practice Linear Models with a tiny example first.",
      ["ml-linear-models"],
    ),
    mistake(
      "ml-classical-algorithms-mistake-2",
      "Pulling unrelated-domain demos into Classical Algorithms",
      "Defaulting to out-of-domain snippets",
      "Stay inside Classical Algorithms concepts.",
      ["ml-decision-trees"],
    ),
  ],
  exercises: [
    exercise({
      id: "ml-classical-algorithms-exercise",
      title: "Classical Algorithms mini exercise",
      instructions: ["Build a small example covering Linear Models.","Extend it with Decision Trees.","Verify behavior related to Random Forests."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Classical Algorithms.",
      conceptIds: ["ml-linear-models","ml-decision-trees","ml-random-forests"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ml-classical-algorithms", ["ml-linear-models","ml-decision-trees","ml-random-forests","ml-k-nn","ml-naive-bayes"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ml_training_and_optimizationTopic = topic({
  id: "ml-training-and-optimization",
  title: "Training and Optimization",
  aliases: ["gradient descent","loss functions"],
  description: "Fit models with loss functions and gradient-based updates where relevant.",
  learningOrder: 4,
  prerequisiteIds: ["ml-classical-algorithms"],
  relatedTopicIds: ["ml-evaluation-and-validation"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ml-loss-functions",
      title: "Loss Functions",
      description: "Loss Functions applied in this topic.",
    }),
    concept({
      id: "ml-gradient-descent",
      title: "Gradient Descent",
      description: "Gradient Descent applied in this topic.",
    }),
    concept({
      id: "ml-learning-rate",
      title: "Learning Rate",
      description: "Learning Rate applied in this topic.",
    }),
    concept({
      id: "ml-batching",
      title: "Batching",
      description: "Batching applied in this topic.",
    }),
    concept({
      id: "ml-convergence",
      title: "Convergence",
      description: "Convergence applied in this topic.",
    }),
    concept({
      id: "ml-local-minima-intuition",
      title: "Local Minima Intuition",
      description: "Local Minima Intuition applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Loss Functions correctly","Explain Gradient Descent in context"],
  practicalArtifacts: [
    artifact({
      id: "ml-training-and-optimization-artifact",
      type: "code",
      title: "Training and Optimization worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Loss Functions, Gradient Descent, Learning Rate.",
      conceptIds: ["ml-loss-functions","ml-gradient-descent","ml-learning-rate","ml-batching"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ml-training-and-optimization-mistake-1",
      "Misapplying Loss Functions",
      "Skipping hands-on checks in Training and Optimization",
      "Practice Loss Functions with a tiny example first.",
      ["ml-loss-functions"],
    ),
    mistake(
      "ml-training-and-optimization-mistake-2",
      "Pulling unrelated-domain demos into Training and Optimization",
      "Defaulting to out-of-domain snippets",
      "Stay inside Training and Optimization concepts.",
      ["ml-gradient-descent"],
    ),
  ],
  exercises: [
    exercise({
      id: "ml-training-and-optimization-exercise",
      title: "Training and Optimization mini exercise",
      instructions: ["Build a small example covering Loss Functions.","Extend it with Gradient Descent.","Verify behavior related to Learning Rate."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Training and Optimization.",
      conceptIds: ["ml-loss-functions","ml-gradient-descent","ml-learning-rate"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ml-training-and-optimization", ["ml-loss-functions","ml-gradient-descent","ml-learning-rate","ml-batching","ml-convergence"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ml_evaluation_and_validationTopic = topic({
  id: "ml-evaluation-and-validation",
  title: "Evaluation and Validation",
  aliases: ["ml evaluation","k-fold"],
  description: "Estimate generalization with proper splits and metrics.",
  learningOrder: 5,
  prerequisiteIds: ["ml-training-and-optimization"],
  relatedTopicIds: ["ml-regularization-and-capacity"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ml-holdout-evaluation",
      title: "Holdout Evaluation",
      description: "Holdout Evaluation applied in this topic.",
    }),
    concept({
      id: "ml-k-fold-cv",
      title: "k-Fold CV",
      description: "k-Fold CV applied in this topic.",
    }),
    concept({
      id: "ml-classification-metrics",
      title: "Classification Metrics",
      description: "Classification Metrics applied in this topic.",
    }),
    concept({
      id: "ml-regression-metrics",
      title: "Regression Metrics",
      description: "Regression Metrics applied in this topic.",
    }),
    concept({
      id: "ml-calibration-intro",
      title: "Calibration Intro",
      description: "Calibration Intro applied in this topic.",
    }),
    concept({
      id: "ml-error-analysis",
      title: "Error Analysis",
      description: "Error Analysis applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Holdout Evaluation correctly","Explain k-Fold CV in context"],
  practicalArtifacts: [
    artifact({
      id: "ml-evaluation-and-validation-artifact",
      type: "code",
      title: "Evaluation and Validation worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Holdout Evaluation, k-Fold CV, Classification Metrics.",
      conceptIds: ["ml-holdout-evaluation","ml-k-fold-cv","ml-classification-metrics","ml-regression-metrics"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ml-evaluation-and-validation-mistake-1",
      "Misapplying Holdout Evaluation",
      "Skipping hands-on checks in Evaluation and Validation",
      "Practice Holdout Evaluation with a tiny example first.",
      ["ml-holdout-evaluation"],
    ),
    mistake(
      "ml-evaluation-and-validation-mistake-2",
      "Pulling unrelated-domain demos into Evaluation and Validation",
      "Defaulting to out-of-domain snippets",
      "Stay inside Evaluation and Validation concepts.",
      ["ml-k-fold-cv"],
    ),
  ],
  exercises: [
    exercise({
      id: "ml-evaluation-and-validation-exercise",
      title: "Evaluation and Validation mini exercise",
      instructions: ["Build a small example covering Holdout Evaluation.","Extend it with k-Fold CV.","Verify behavior related to Classification Metrics."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Evaluation and Validation.",
      conceptIds: ["ml-holdout-evaluation","ml-k-fold-cv","ml-classification-metrics"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ml-evaluation-and-validation", ["ml-holdout-evaluation","ml-k-fold-cv","ml-classification-metrics","ml-regression-metrics","ml-calibration-intro"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ml_regularization_and_capacityTopic = topic({
  id: "ml-regularization-and-capacity",
  title: "Regularization and Capacity",
  aliases: ["regularization","overfitting"],
  description: "Control overfitting with regularization and model capacity choices.",
  learningOrder: 6,
  prerequisiteIds: ["ml-evaluation-and-validation"],
  relatedTopicIds: ["ml-pipelines"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ml-overfitting",
      title: "Overfitting",
      description: "Overfitting applied in this topic.",
    }),
    concept({
      id: "ml-underfitting",
      title: "Underfitting",
      description: "Underfitting applied in this topic.",
    }),
    concept({
      id: "ml-l1-l2",
      title: "L1/L2",
      description: "L1/L2 applied in this topic.",
    }),
    concept({
      id: "ml-early-stopping",
      title: "Early Stopping",
      description: "Early Stopping applied in this topic.",
    }),
    concept({
      id: "ml-dropout-intuition",
      title: "Dropout Intuition",
      description: "Dropout Intuition applied in this topic.",
    }),
    concept({
      id: "ml-bias-variance-tradeoff",
      title: "Bias-Variance Tradeoff",
      description: "Bias-Variance Tradeoff applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Overfitting correctly","Explain Underfitting in context"],
  practicalArtifacts: [
    artifact({
      id: "ml-regularization-and-capacity-artifact",
      type: "code",
      title: "Regularization and Capacity worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Overfitting, Underfitting, L1/L2.",
      conceptIds: ["ml-overfitting","ml-underfitting","ml-l1-l2","ml-early-stopping"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ml-regularization-and-capacity-mistake-1",
      "Misapplying Overfitting",
      "Skipping hands-on checks in Regularization and Capacity",
      "Practice Overfitting with a tiny example first.",
      ["ml-overfitting"],
    ),
    mistake(
      "ml-regularization-and-capacity-mistake-2",
      "Pulling unrelated-domain demos into Regularization and Capacity",
      "Defaulting to out-of-domain snippets",
      "Stay inside Regularization and Capacity concepts.",
      ["ml-underfitting"],
    ),
  ],
  exercises: [
    exercise({
      id: "ml-regularization-and-capacity-exercise",
      title: "Regularization and Capacity mini exercise",
      instructions: ["Build a small example covering Overfitting.","Extend it with Underfitting.","Verify behavior related to L1/L2."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Regularization and Capacity.",
      conceptIds: ["ml-overfitting","ml-underfitting","ml-l1-l2"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ml-regularization-and-capacity", ["ml-overfitting","ml-underfitting","ml-l1-l2","ml-early-stopping","ml-dropout-intuition"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ml_pipelinesTopic = topic({
  id: "ml-pipelines",
  title: "ML Pipelines",
  aliases: ["sklearn pipeline","ml pipeline"],
  description: "Compose preprocessing and estimators into reusable pipelines.",
  learningOrder: 7,
  prerequisiteIds: ["ml-regularization-and-capacity"],
  relatedTopicIds: ["ml-model-ops-basics"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ml-pipeline-abstraction",
      title: "Pipeline Abstraction",
      description: "Pipeline Abstraction applied in this topic.",
    }),
    concept({
      id: "ml-transformers",
      title: "Transformers",
      description: "Transformers applied in this topic.",
    }),
    concept({
      id: "ml-estimators",
      title: "Estimators",
      description: "Estimators applied in this topic.",
    }),
    concept({
      id: "ml-column-transforms",
      title: "Column Transforms",
      description: "Column Transforms applied in this topic.",
    }),
    concept({
      id: "ml-hyperparameter-search-intro",
      title: "Hyperparameter Search Intro",
      description: "Hyperparameter Search Intro applied in this topic.",
    }),
    concept({
      id: "ml-reproducible-fits",
      title: "Reproducible Fits",
      description: "Reproducible Fits applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Pipeline Abstraction correctly","Explain Transformers in context"],
  practicalArtifacts: [
    artifact({
      id: "ml-pipelines-artifact",
      type: "code",
      title: "Sklearn-style pipeline sketch",
      language: "python",
      content: "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\npipe = Pipeline([\n  (\"scale\", StandardScaler()),\n  (\"clf\", LogisticRegression()),\n])\n# pipe.fit(X_train, y_train)",
      expectedOutput: "Fitted pipeline object ready for predict",
      explanation: "Scaler + classifier as one estimator.",
      conceptIds: ["ml-pipeline-abstraction","ml-transformers","ml-estimators","ml-column-transforms"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ml-pipelines-mistake-1",
      "Misapplying Pipeline Abstraction",
      "Skipping hands-on checks in ML Pipelines",
      "Practice Pipeline Abstraction with a tiny example first.",
      ["ml-pipeline-abstraction"],
    ),
    mistake(
      "ml-pipelines-mistake-2",
      "Pulling unrelated-domain demos into ML Pipelines",
      "Defaulting to out-of-domain snippets",
      "Stay inside ML Pipelines concepts.",
      ["ml-transformers"],
    ),
  ],
  exercises: [
    exercise({
      id: "ml-pipelines-exercise",
      title: "ML Pipelines mini exercise",
      instructions: ["Build a small example covering Pipeline Abstraction.","Extend it with Transformers.","Verify behavior related to Estimators."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for ML Pipelines.",
      conceptIds: ["ml-pipeline-abstraction","ml-transformers","ml-estimators"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ml-pipelines", ["ml-pipeline-abstraction","ml-transformers","ml-estimators","ml-column-transforms","ml-hyperparameter-search-intro"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const ml_model_ops_basicsTopic = topic({
  id: "ml-model-ops-basics",
  title: "Model Ops Basics",
  aliases: ["mlops basics","model monitoring"],
  description: "Version data/models and monitor simple production failure modes.",
  learningOrder: 8,
  prerequisiteIds: ["ml-pipelines"],
  
  difficulty: "advanced",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "ml-model-registry-intro",
      title: "Model Registry Intro",
      description: "Model Registry Intro applied in this topic.",
    }),
    concept({
      id: "ml-data-versioning",
      title: "Data Versioning",
      description: "Data Versioning applied in this topic.",
    }),
    concept({
      id: "ml-prediction-logging",
      title: "Prediction Logging",
      description: "Prediction Logging applied in this topic.",
    }),
    concept({
      id: "ml-drift-signals",
      title: "Drift Signals",
      description: "Drift Signals applied in this topic.",
    }),
    concept({
      id: "ml-rollback-plan",
      title: "Rollback Plan",
      description: "Rollback Plan applied in this topic.",
    }),
    concept({
      id: "ml-offline-vs-online-eval",
      title: "Offline vs Online Eval",
      description: "Offline vs Online Eval applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Model Registry Intro correctly","Explain Data Versioning in context"],
  practicalArtifacts: [
    artifact({
      id: "ml-model-ops-basics-artifact",
      type: "code",
      title: "Model Ops Basics worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Model Registry Intro, Data Versioning, Prediction Logging.",
      conceptIds: ["ml-model-registry-intro","ml-data-versioning","ml-prediction-logging","ml-drift-signals"],
    }),
  ],
  commonMistakes: [
    mistake(
      "ml-model-ops-basics-mistake-1",
      "Misapplying Model Registry Intro",
      "Skipping hands-on checks in Model Ops Basics",
      "Practice Model Registry Intro with a tiny example first.",
      ["ml-model-registry-intro"],
    ),
    mistake(
      "ml-model-ops-basics-mistake-2",
      "Pulling unrelated-domain demos into Model Ops Basics",
      "Defaulting to out-of-domain snippets",
      "Stay inside Model Ops Basics concepts.",
      ["ml-data-versioning"],
    ),
  ],
  exercises: [
    exercise({
      id: "ml-model-ops-basics-exercise",
      title: "Model Ops Basics mini exercise",
      instructions: ["Build a small example covering Model Registry Intro.","Extend it with Data Versioning.","Verify behavior related to Prediction Logging."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Model Ops Basics.",
      conceptIds: ["ml-model-registry-intro","ml-data-versioning","ml-prediction-logging"],
      difficulty: "advanced",
    }),
  ],
  assessmentSkills: defaultTopicSkills("ml-model-ops-basics", ["ml-model-registry-intro","ml-data-versioning","ml-prediction-logging","ml-drift-signals","ml-rollback-plan"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

export const machineLearningKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-machine-learning",
  title: "Machine Learning",
  aliases: ["machine learning","learn machine learning","ml","learn ml","ml fundamentals"],
  category: "AI / Machine Learning",
  description: "Machine Learning curriculum covering problem types, data prep, classical algorithms, training loops, evaluation, regularization, pipelines, and model ops basics.",
  topics: [ml_problem_framingTopic, ml_data_preparationTopic, ml_classical_algorithmsTopic, ml_training_and_optimizationTopic, ml_evaluation_and_validationTopic, ml_regularization_and_capacityTopic, ml_pipelinesTopic, ml_model_ops_basicsTopic],
});
