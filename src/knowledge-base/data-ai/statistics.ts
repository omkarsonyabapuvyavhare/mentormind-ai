import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","react hooks","kubernetes pod"];

const stats_descriptiveTopic = topic({
  id: "stats-descriptive",
  title: "Descriptive Statistics",
  aliases: ["descriptive stats","mean median"],
  description: "Summarize datasets with center, spread, and shape measures.",
  learningOrder: 1,
  
  relatedTopicIds: ["stats-probability-basics"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "stats-mean-median-mode",
      title: "Mean/Median/Mode",
      description: "Mean/Median/Mode applied in this topic.",
    }),
    concept({
      id: "stats-variance-std-dev",
      title: "Variance/Std Dev",
      description: "Variance/Std Dev applied in this topic.",
    }),
    concept({
      id: "stats-percentiles",
      title: "Percentiles",
      description: "Percentiles applied in this topic.",
    }),
    concept({
      id: "stats-skewness",
      title: "Skewness",
      description: "Skewness applied in this topic.",
    }),
    concept({
      id: "stats-five-number-summary",
      title: "Five-number Summary",
      description: "Five-number Summary applied in this topic.",
    }),
    concept({
      id: "stats-outlier-flags",
      title: "Outlier Flags",
      description: "Outlier Flags applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Mean/Median/Mode correctly","Explain Variance/Std Dev in context"],
  practicalArtifacts: [
    artifact({
      id: "stats-descriptive-artifact",
      type: "calculation",
      title: "Mean and std",
      
      content: "values = [2, 4, 4, 4, 5, 5, 7, 9]\nmean = 5\nstd ≈ 2.0",
      expectedOutput: "mean 5 with moderate spread",
      explanation: "Classic descriptive summary.",
      conceptIds: ["stats-mean-median-mode","stats-variance-std-dev","stats-percentiles","stats-skewness"],
    }),
  ],
  commonMistakes: [
    mistake(
      "stats-descriptive-mistake-1",
      "Misapplying Mean/Median/Mode",
      "Skipping hands-on checks in Descriptive Statistics",
      "Practice Mean/Median/Mode with a tiny example first.",
      ["stats-mean-median-mode"],
    ),
    mistake(
      "stats-descriptive-mistake-2",
      "Pulling unrelated-domain demos into Descriptive Statistics",
      "Defaulting to out-of-domain snippets",
      "Stay inside Descriptive Statistics concepts.",
      ["stats-variance-std-dev"],
    ),
  ],
  exercises: [
    exercise({
      id: "stats-descriptive-exercise",
      title: "Descriptive Statistics mini exercise",
      instructions: ["Build a small example covering Mean/Median/Mode.","Extend it with Variance/Std Dev.","Verify behavior related to Percentiles."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Descriptive Statistics.",
      conceptIds: ["stats-mean-median-mode","stats-variance-std-dev","stats-percentiles"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("stats-descriptive", ["stats-mean-median-mode","stats-variance-std-dev","stats-percentiles","stats-skewness","stats-five-number-summary"],
    ["concept-understanding","calculation","practical-scenario","debugging","expected-output"]),
});

const stats_probability_basicsTopic = topic({
  id: "stats-probability-basics",
  title: "Probability Basics",
  aliases: ["probability","bayes"],
  description: "Reason with events, conditional probability, and independence.",
  learningOrder: 2,
  prerequisiteIds: ["stats-descriptive"],
  relatedTopicIds: ["stats-distributions"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "stats-sample-space",
      title: "Sample Space",
      description: "Sample Space applied in this topic.",
    }),
    concept({
      id: "stats-probability-rules",
      title: "Probability Rules",
      description: "Probability Rules applied in this topic.",
    }),
    concept({
      id: "stats-conditional-probability",
      title: "Conditional Probability",
      description: "Conditional Probability applied in this topic.",
    }),
    concept({
      id: "stats-independence",
      title: "Independence",
      description: "Independence applied in this topic.",
    }),
    concept({
      id: "stats-bayes-intuition",
      title: "Bayes Intuition",
      description: "Bayes Intuition applied in this topic.",
    }),
    concept({
      id: "stats-counting-basics",
      title: "Counting Basics",
      description: "Counting Basics applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Sample Space correctly","Explain Probability Rules in context"],
  practicalArtifacts: [
    artifact({
      id: "stats-probability-basics-artifact",
      type: "code",
      title: "Probability Basics worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Sample Space, Probability Rules, Conditional Probability.",
      conceptIds: ["stats-sample-space","stats-probability-rules","stats-conditional-probability","stats-independence"],
    }),
  ],
  commonMistakes: [
    mistake(
      "stats-probability-basics-mistake-1",
      "Misapplying Sample Space",
      "Skipping hands-on checks in Probability Basics",
      "Practice Sample Space with a tiny example first.",
      ["stats-sample-space"],
    ),
    mistake(
      "stats-probability-basics-mistake-2",
      "Pulling unrelated-domain demos into Probability Basics",
      "Defaulting to out-of-domain snippets",
      "Stay inside Probability Basics concepts.",
      ["stats-probability-rules"],
    ),
  ],
  exercises: [
    exercise({
      id: "stats-probability-basics-exercise",
      title: "Probability Basics mini exercise",
      instructions: ["Build a small example covering Sample Space.","Extend it with Probability Rules.","Verify behavior related to Conditional Probability."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Probability Basics.",
      conceptIds: ["stats-sample-space","stats-probability-rules","stats-conditional-probability"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("stats-probability-basics", ["stats-sample-space","stats-probability-rules","stats-conditional-probability","stats-independence","stats-bayes-intuition"],
    ["concept-understanding","calculation","practical-scenario","debugging","expected-output"]),
});

const stats_distributionsTopic = topic({
  id: "stats-distributions",
  title: "Common Distributions",
  aliases: ["normal distribution","binomial"],
  description: "Recognize Bernoulli/Binomial/Normal/Poisson use cases.",
  learningOrder: 3,
  prerequisiteIds: ["stats-probability-basics"],
  relatedTopicIds: ["stats-sampling"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "stats-bernoulli",
      title: "Bernoulli",
      description: "Bernoulli applied in this topic.",
    }),
    concept({
      id: "stats-binomial",
      title: "Binomial",
      description: "Binomial applied in this topic.",
    }),
    concept({
      id: "stats-normal",
      title: "Normal",
      description: "Normal applied in this topic.",
    }),
    concept({
      id: "stats-poisson",
      title: "Poisson",
      description: "Poisson applied in this topic.",
    }),
    concept({
      id: "stats-pdf-vs-cdf",
      title: "PDF vs CDF",
      description: "PDF vs CDF applied in this topic.",
    }),
    concept({
      id: "stats-z-scores",
      title: "Z-scores",
      description: "Z-scores applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Bernoulli correctly","Explain Binomial in context"],
  practicalArtifacts: [
    artifact({
      id: "stats-distributions-artifact",
      type: "code",
      title: "Common Distributions worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Bernoulli, Binomial, Normal.",
      conceptIds: ["stats-bernoulli","stats-binomial","stats-normal","stats-poisson"],
    }),
  ],
  commonMistakes: [
    mistake(
      "stats-distributions-mistake-1",
      "Misapplying Bernoulli",
      "Skipping hands-on checks in Common Distributions",
      "Practice Bernoulli with a tiny example first.",
      ["stats-bernoulli"],
    ),
    mistake(
      "stats-distributions-mistake-2",
      "Pulling unrelated-domain demos into Common Distributions",
      "Defaulting to out-of-domain snippets",
      "Stay inside Common Distributions concepts.",
      ["stats-binomial"],
    ),
  ],
  exercises: [
    exercise({
      id: "stats-distributions-exercise",
      title: "Common Distributions mini exercise",
      instructions: ["Build a small example covering Bernoulli.","Extend it with Binomial.","Verify behavior related to Normal."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Common Distributions.",
      conceptIds: ["stats-bernoulli","stats-binomial","stats-normal"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("stats-distributions", ["stats-bernoulli","stats-binomial","stats-normal","stats-poisson","stats-pdf-vs-cdf"],
    ["concept-understanding","calculation","practical-scenario","debugging","expected-output"]),
});

const stats_samplingTopic = topic({
  id: "stats-sampling",
  title: "Sampling and Estimation",
  aliases: ["sampling","standard error"],
  description: "Estimate population parameters from samples with standard error intuition.",
  learningOrder: 4,
  prerequisiteIds: ["stats-distributions"],
  relatedTopicIds: ["stats-inference"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "stats-population-vs-sample",
      title: "Population vs Sample",
      description: "Population vs Sample applied in this topic.",
    }),
    concept({
      id: "stats-sampling-distribution",
      title: "Sampling Distribution",
      description: "Sampling Distribution applied in this topic.",
    }),
    concept({
      id: "stats-standard-error",
      title: "Standard Error",
      description: "Standard Error applied in this topic.",
    }),
    concept({
      id: "stats-point-estimates",
      title: "Point Estimates",
      description: "Point Estimates applied in this topic.",
    }),
    concept({
      id: "stats-bias",
      title: "Bias",
      description: "Bias applied in this topic.",
    }),
    concept({
      id: "stats-law-of-large-numbers",
      title: "Law of Large Numbers",
      description: "Law of Large Numbers applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Population vs Sample correctly","Explain Sampling Distribution in context"],
  practicalArtifacts: [
    artifact({
      id: "stats-sampling-artifact",
      type: "code",
      title: "Sampling and Estimation worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Population vs Sample, Sampling Distribution, Standard Error.",
      conceptIds: ["stats-population-vs-sample","stats-sampling-distribution","stats-standard-error","stats-point-estimates"],
    }),
  ],
  commonMistakes: [
    mistake(
      "stats-sampling-mistake-1",
      "Misapplying Population vs Sample",
      "Skipping hands-on checks in Sampling and Estimation",
      "Practice Population vs Sample with a tiny example first.",
      ["stats-population-vs-sample"],
    ),
    mistake(
      "stats-sampling-mistake-2",
      "Pulling unrelated-domain demos into Sampling and Estimation",
      "Defaulting to out-of-domain snippets",
      "Stay inside Sampling and Estimation concepts.",
      ["stats-sampling-distribution"],
    ),
  ],
  exercises: [
    exercise({
      id: "stats-sampling-exercise",
      title: "Sampling and Estimation mini exercise",
      instructions: ["Build a small example covering Population vs Sample.","Extend it with Sampling Distribution.","Verify behavior related to Standard Error."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Sampling and Estimation.",
      conceptIds: ["stats-population-vs-sample","stats-sampling-distribution","stats-standard-error"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("stats-sampling", ["stats-population-vs-sample","stats-sampling-distribution","stats-standard-error","stats-point-estimates","stats-bias"],
    ["concept-understanding","calculation","practical-scenario","debugging","expected-output"]),
});

const stats_inferenceTopic = topic({
  id: "stats-inference",
  title: "Statistical Inference",
  aliases: ["hypothesis testing","confidence intervals"],
  description: "Build confidence intervals and run basic hypothesis tests.",
  learningOrder: 5,
  prerequisiteIds: ["stats-sampling"],
  relatedTopicIds: ["stats-correlation-regression"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "stats-confidence-intervals",
      title: "Confidence Intervals",
      description: "Confidence Intervals applied in this topic.",
    }),
    concept({
      id: "stats-null-hypothesis",
      title: "Null Hypothesis",
      description: "Null Hypothesis applied in this topic.",
    }),
    concept({
      id: "stats-p-values",
      title: "p-values",
      description: "p-values applied in this topic.",
    }),
    concept({
      id: "stats-type-i-ii-errors",
      title: "Type I/II Errors",
      description: "Type I/II Errors applied in this topic.",
    }),
    concept({
      id: "stats-t-tests-intro",
      title: "t-tests Intro",
      description: "t-tests Intro applied in this topic.",
    }),
    concept({
      id: "stats-practical-significance",
      title: "Practical Significance",
      description: "Practical Significance applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Confidence Intervals correctly","Explain Null Hypothesis in context"],
  practicalArtifacts: [
    artifact({
      id: "stats-inference-artifact",
      type: "code",
      title: "Statistical Inference worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Confidence Intervals, Null Hypothesis, p-values.",
      conceptIds: ["stats-confidence-intervals","stats-null-hypothesis","stats-p-values","stats-type-i-ii-errors"],
    }),
  ],
  commonMistakes: [
    mistake(
      "stats-inference-mistake-1",
      "Misapplying Confidence Intervals",
      "Skipping hands-on checks in Statistical Inference",
      "Practice Confidence Intervals with a tiny example first.",
      ["stats-confidence-intervals"],
    ),
    mistake(
      "stats-inference-mistake-2",
      "Pulling unrelated-domain demos into Statistical Inference",
      "Defaulting to out-of-domain snippets",
      "Stay inside Statistical Inference concepts.",
      ["stats-null-hypothesis"],
    ),
  ],
  exercises: [
    exercise({
      id: "stats-inference-exercise",
      title: "Statistical Inference mini exercise",
      instructions: ["Build a small example covering Confidence Intervals.","Extend it with Null Hypothesis.","Verify behavior related to p-values."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Statistical Inference.",
      conceptIds: ["stats-confidence-intervals","stats-null-hypothesis","stats-p-values"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("stats-inference", ["stats-confidence-intervals","stats-null-hypothesis","stats-p-values","stats-type-i-ii-errors","stats-t-tests-intro"],
    ["concept-understanding","calculation","practical-scenario","debugging","expected-output"]),
});

const stats_correlation_regressionTopic = topic({
  id: "stats-correlation-regression",
  title: "Correlation and Simple Regression",
  aliases: ["correlation","linear regression"],
  description: "Measure association and fit a simple linear relationship.",
  learningOrder: 6,
  prerequisiteIds: ["stats-inference"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "stats-covariance",
      title: "Covariance",
      description: "Covariance applied in this topic.",
    }),
    concept({
      id: "stats-correlation",
      title: "Correlation",
      description: "Correlation applied in this topic.",
    }),
    concept({
      id: "stats-simple-linear-regression",
      title: "Simple Linear Regression",
      description: "Simple Linear Regression applied in this topic.",
    }),
    concept({
      id: "stats-residuals",
      title: "Residuals",
      description: "Residuals applied in this topic.",
    }),
    concept({
      id: "stats-r-squared",
      title: "R-squared",
      description: "R-squared applied in this topic.",
    }),
    concept({
      id: "stats-correlation-vs-causation",
      title: "Correlation vs Causation",
      description: "Correlation vs Causation applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Covariance correctly","Explain Correlation in context"],
  practicalArtifacts: [
    artifact({
      id: "stats-correlation-regression-artifact",
      type: "code",
      title: "Correlation and Simple Regression worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Covariance, Correlation, Simple Linear Regression.",
      conceptIds: ["stats-covariance","stats-correlation","stats-simple-linear-regression","stats-residuals"],
    }),
  ],
  commonMistakes: [
    mistake(
      "stats-correlation-regression-mistake-1",
      "Misapplying Covariance",
      "Skipping hands-on checks in Correlation and Simple Regression",
      "Practice Covariance with a tiny example first.",
      ["stats-covariance"],
    ),
    mistake(
      "stats-correlation-regression-mistake-2",
      "Pulling unrelated-domain demos into Correlation and Simple Regression",
      "Defaulting to out-of-domain snippets",
      "Stay inside Correlation and Simple Regression concepts.",
      ["stats-correlation"],
    ),
  ],
  exercises: [
    exercise({
      id: "stats-correlation-regression-exercise",
      title: "Correlation and Simple Regression mini exercise",
      instructions: ["Build a small example covering Covariance.","Extend it with Correlation.","Verify behavior related to Simple Linear Regression."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Correlation and Simple Regression.",
      conceptIds: ["stats-covariance","stats-correlation","stats-simple-linear-regression"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("stats-correlation-regression", ["stats-covariance","stats-correlation","stats-simple-linear-regression","stats-residuals","stats-r-squared"],
    ["concept-understanding","calculation","practical-scenario","debugging","expected-output"]),
});

export const statisticsKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-statistics",
  title: "Statistics",
  aliases: ["statistics","learn statistics","stats","statistical methods"],
  category: "Data",
  description: "Statistics starter covering descriptive stats, probability, distributions, sampling, inference, and correlation/regression basics.",
  topics: [stats_descriptiveTopic, stats_probability_basicsTopic, stats_distributionsTopic, stats_samplingTopic, stats_inferenceTopic, stats_correlation_regressionTopic],
});
