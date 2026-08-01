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

const numpy_ndarray_basicsTopic = topic({
  id: "numpy-ndarray-basics",
  title: "ndarray Basics",
  aliases: ["numpy array","ndarray"],
  description: "Create arrays and inspect shape, dtype, and memory layout basics.",
  learningOrder: 1,
  
  relatedTopicIds: ["numpy-indexing-and-slicing"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "numpy-ndarray",
      title: "ndarray",
      description: "ndarray applied in this topic.",
    }),
    concept({
      id: "numpy-shape",
      title: "shape",
      description: "shape applied in this topic.",
    }),
    concept({
      id: "numpy-dtype",
      title: "dtype",
      description: "dtype applied in this topic.",
    }),
    concept({
      id: "numpy-zeros-ones-arange",
      title: "zeros/ones/arange",
      description: "zeros/ones/arange applied in this topic.",
    }),
    concept({
      id: "numpy-reshape",
      title: "reshape",
      description: "reshape applied in this topic.",
    }),
    concept({
      id: "numpy-axis",
      title: "axis",
      description: "axis applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply ndarray correctly","Explain shape in context"],
  practicalArtifacts: [
    artifact({
      id: "numpy-ndarray-basics-artifact",
      type: "code",
      title: "Create and reshape",
      language: "python",
      content: "import numpy as np\na = np.arange(6).reshape(2, 3)\nprint(a.shape)\nprint(a.dtype)",
      expectedOutput: "(2, 3)\nint64",
      explanation: "arange + reshape yields a 2x3 array.",
      conceptIds: ["numpy-ndarray","numpy-shape","numpy-dtype","numpy-zeros-ones-arange"],
    }),
  ],
  commonMistakes: [
    mistake(
      "numpy-ndarray-basics-mistake-1",
      "Misapplying ndarray",
      "Skipping hands-on checks in ndarray Basics",
      "Practice ndarray with a tiny example first.",
      ["numpy-ndarray"],
    ),
    mistake(
      "numpy-ndarray-basics-mistake-2",
      "Pulling unrelated-domain demos into ndarray Basics",
      "Defaulting to out-of-domain snippets",
      "Stay inside ndarray Basics concepts.",
      ["numpy-shape"],
    ),
  ],
  exercises: [
    exercise({
      id: "numpy-ndarray-basics-exercise",
      title: "ndarray Basics mini exercise",
      instructions: ["Build a small example covering ndarray.","Extend it with shape.","Verify behavior related to dtype."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for ndarray Basics.",
      conceptIds: ["numpy-ndarray","numpy-shape","numpy-dtype"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("numpy-ndarray-basics", ["numpy-ndarray","numpy-shape","numpy-dtype","numpy-zeros-ones-arange","numpy-reshape"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const numpy_indexing_and_slicingTopic = topic({
  id: "numpy-indexing-and-slicing",
  title: "Indexing and Slicing",
  aliases: ["numpy indexing","boolean mask"],
  description: "Select data with slices, boolean masks, and fancy indexing.",
  learningOrder: 2,
  prerequisiteIds: ["numpy-ndarray-basics"],
  relatedTopicIds: ["numpy-broadcasting"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "numpy-basic-slicing",
      title: "Basic Slicing",
      description: "Basic Slicing applied in this topic.",
    }),
    concept({
      id: "numpy-boolean-indexing",
      title: "Boolean Indexing",
      description: "Boolean Indexing applied in this topic.",
    }),
    concept({
      id: "numpy-fancy-indexing",
      title: "Fancy Indexing",
      description: "Fancy Indexing applied in this topic.",
    }),
    concept({
      id: "numpy-views-vs-copies",
      title: "Views vs Copies",
      description: "Views vs Copies applied in this topic.",
    }),
    concept({
      id: "numpy-np-where",
      title: "np.where",
      description: "np.where applied in this topic.",
    }),
    concept({
      id: "numpy-assignment-via-masks",
      title: "Assignment via Masks",
      description: "Assignment via Masks applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Basic Slicing correctly","Explain Boolean Indexing in context"],
  practicalArtifacts: [
    artifact({
      id: "numpy-indexing-and-slicing-artifact",
      type: "code",
      title: "Indexing and Slicing worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Basic Slicing, Boolean Indexing, Fancy Indexing.",
      conceptIds: ["numpy-basic-slicing","numpy-boolean-indexing","numpy-fancy-indexing","numpy-views-vs-copies"],
    }),
  ],
  commonMistakes: [
    mistake(
      "numpy-indexing-and-slicing-mistake-1",
      "Misapplying Basic Slicing",
      "Skipping hands-on checks in Indexing and Slicing",
      "Practice Basic Slicing with a tiny example first.",
      ["numpy-basic-slicing"],
    ),
    mistake(
      "numpy-indexing-and-slicing-mistake-2",
      "Pulling unrelated-domain demos into Indexing and Slicing",
      "Defaulting to out-of-domain snippets",
      "Stay inside Indexing and Slicing concepts.",
      ["numpy-boolean-indexing"],
    ),
  ],
  exercises: [
    exercise({
      id: "numpy-indexing-and-slicing-exercise",
      title: "Indexing and Slicing mini exercise",
      instructions: ["Build a small example covering Basic Slicing.","Extend it with Boolean Indexing.","Verify behavior related to Fancy Indexing."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Indexing and Slicing.",
      conceptIds: ["numpy-basic-slicing","numpy-boolean-indexing","numpy-fancy-indexing"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("numpy-indexing-and-slicing", ["numpy-basic-slicing","numpy-boolean-indexing","numpy-fancy-indexing","numpy-views-vs-copies","numpy-np-where"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const numpy_broadcastingTopic = topic({
  id: "numpy-broadcasting",
  title: "Broadcasting",
  aliases: ["broadcasting","vectorization"],
  description: "Combine arrays of different shapes using broadcasting rules.",
  learningOrder: 3,
  prerequisiteIds: ["numpy-indexing-and-slicing"],
  relatedTopicIds: ["numpy-ufuncs-and-aggregations"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "numpy-broadcasting-rules",
      title: "Broadcasting Rules",
      description: "Broadcasting Rules applied in this topic.",
    }),
    concept({
      id: "numpy-shape-compatibility",
      title: "Shape Compatibility",
      description: "Shape Compatibility applied in this topic.",
    }),
    concept({
      id: "numpy-scalar-broadcast",
      title: "Scalar Broadcast",
      description: "Scalar Broadcast applied in this topic.",
    }),
    concept({
      id: "numpy-axis-expansion",
      title: "Axis Expansion",
      description: "Axis Expansion applied in this topic.",
    }),
    concept({
      id: "numpy-common-pitfalls",
      title: "Common Pitfalls",
      description: "Common Pitfalls applied in this topic.",
    }),
    concept({
      id: "numpy-vectorization-benefit",
      title: "Vectorization Benefit",
      description: "Vectorization Benefit applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Broadcasting Rules correctly","Explain Shape Compatibility in context"],
  practicalArtifacts: [
    artifact({
      id: "numpy-broadcasting-artifact",
      type: "code",
      title: "Broadcasting worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Broadcasting Rules, Shape Compatibility, Scalar Broadcast.",
      conceptIds: ["numpy-broadcasting-rules","numpy-shape-compatibility","numpy-scalar-broadcast","numpy-axis-expansion"],
    }),
  ],
  commonMistakes: [
    mistake(
      "numpy-broadcasting-mistake-1",
      "Misapplying Broadcasting Rules",
      "Skipping hands-on checks in Broadcasting",
      "Practice Broadcasting Rules with a tiny example first.",
      ["numpy-broadcasting-rules"],
    ),
    mistake(
      "numpy-broadcasting-mistake-2",
      "Pulling unrelated-domain demos into Broadcasting",
      "Defaulting to out-of-domain snippets",
      "Stay inside Broadcasting concepts.",
      ["numpy-shape-compatibility"],
    ),
  ],
  exercises: [
    exercise({
      id: "numpy-broadcasting-exercise",
      title: "Broadcasting mini exercise",
      instructions: ["Build a small example covering Broadcasting Rules.","Extend it with Shape Compatibility.","Verify behavior related to Scalar Broadcast."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Broadcasting.",
      conceptIds: ["numpy-broadcasting-rules","numpy-shape-compatibility","numpy-scalar-broadcast"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("numpy-broadcasting", ["numpy-broadcasting-rules","numpy-shape-compatibility","numpy-scalar-broadcast","numpy-axis-expansion","numpy-common-pitfalls"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const numpy_ufuncs_and_aggregationsTopic = topic({
  id: "numpy-ufuncs-and-aggregations",
  title: "Ufuncs and Aggregations",
  aliases: ["numpy ufunc","aggregations"],
  description: "Apply elementwise ufuncs and reductions across axes.",
  learningOrder: 4,
  prerequisiteIds: ["numpy-broadcasting"],
  relatedTopicIds: ["numpy-linear-algebra-helpers"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "numpy-ufuncs",
      title: "ufuncs",
      description: "ufuncs applied in this topic.",
    }),
    concept({
      id: "numpy-sum-mean-std",
      title: "sum/mean/std",
      description: "sum/mean/std applied in this topic.",
    }),
    concept({
      id: "numpy-axis-reductions",
      title: "axis Reductions",
      description: "axis Reductions applied in this topic.",
    }),
    concept({
      id: "numpy-cumulative-ops",
      title: "cumulative Ops",
      description: "cumulative Ops applied in this topic.",
    }),
    concept({
      id: "numpy-clip",
      title: "clip",
      description: "clip applied in this topic.",
    }),
    concept({
      id: "numpy-nan-aware-ops-intro",
      title: "nan-aware Ops Intro",
      description: "nan-aware Ops Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply ufuncs correctly","Explain sum/mean/std in context"],
  practicalArtifacts: [
    artifact({
      id: "numpy-ufuncs-and-aggregations-artifact",
      type: "code",
      title: "Ufuncs and Aggregations worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates ufuncs, sum/mean/std, axis Reductions.",
      conceptIds: ["numpy-ufuncs","numpy-sum-mean-std","numpy-axis-reductions","numpy-cumulative-ops"],
    }),
  ],
  commonMistakes: [
    mistake(
      "numpy-ufuncs-and-aggregations-mistake-1",
      "Misapplying ufuncs",
      "Skipping hands-on checks in Ufuncs and Aggregations",
      "Practice ufuncs with a tiny example first.",
      ["numpy-ufuncs"],
    ),
    mistake(
      "numpy-ufuncs-and-aggregations-mistake-2",
      "Pulling unrelated-domain demos into Ufuncs and Aggregations",
      "Defaulting to out-of-domain snippets",
      "Stay inside Ufuncs and Aggregations concepts.",
      ["numpy-sum-mean-std"],
    ),
  ],
  exercises: [
    exercise({
      id: "numpy-ufuncs-and-aggregations-exercise",
      title: "Ufuncs and Aggregations mini exercise",
      instructions: ["Build a small example covering ufuncs.","Extend it with sum/mean/std.","Verify behavior related to axis Reductions."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Ufuncs and Aggregations.",
      conceptIds: ["numpy-ufuncs","numpy-sum-mean-std","numpy-axis-reductions"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("numpy-ufuncs-and-aggregations", ["numpy-ufuncs","numpy-sum-mean-std","numpy-axis-reductions","numpy-cumulative-ops","numpy-clip"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const numpy_linear_algebra_helpersTopic = topic({
  id: "numpy-linear-algebra-helpers",
  title: "Linear Algebra Helpers",
  aliases: ["numpy linalg","matmul"],
  description: "Use matmul, transpose, and solve helpers for small linear systems.",
  learningOrder: 5,
  prerequisiteIds: ["numpy-ufuncs-and-aggregations"],
  relatedTopicIds: ["numpy-random-sampling"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "numpy-transpose",
      title: "transpose",
      description: "transpose applied in this topic.",
    }),
    concept({
      id: "numpy-matmul",
      title: "matmul/@",
      description: "matmul/@ applied in this topic.",
    }),
    concept({
      id: "numpy-dot",
      title: "dot",
      description: "dot applied in this topic.",
    }),
    concept({
      id: "numpy-np-linalg-solve",
      title: "np.linalg.solve",
      description: "np.linalg.solve applied in this topic.",
    }),
    concept({
      id: "numpy-norms-intro",
      title: "norms Intro",
      description: "norms Intro applied in this topic.",
    }),
    concept({
      id: "numpy-inverse-caution",
      title: "Inverse Caution",
      description: "Inverse Caution applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply transpose correctly","Explain matmul/@ in context"],
  practicalArtifacts: [
    artifact({
      id: "numpy-linear-algebra-helpers-artifact",
      type: "code",
      title: "Linear Algebra Helpers worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates transpose, matmul/@, dot.",
      conceptIds: ["numpy-transpose","numpy-matmul","numpy-dot","numpy-np-linalg-solve"],
    }),
  ],
  commonMistakes: [
    mistake(
      "numpy-linear-algebra-helpers-mistake-1",
      "Misapplying transpose",
      "Skipping hands-on checks in Linear Algebra Helpers",
      "Practice transpose with a tiny example first.",
      ["numpy-transpose"],
    ),
    mistake(
      "numpy-linear-algebra-helpers-mistake-2",
      "Pulling unrelated-domain demos into Linear Algebra Helpers",
      "Defaulting to out-of-domain snippets",
      "Stay inside Linear Algebra Helpers concepts.",
      ["numpy-matmul"],
    ),
  ],
  exercises: [
    exercise({
      id: "numpy-linear-algebra-helpers-exercise",
      title: "Linear Algebra Helpers mini exercise",
      instructions: ["Build a small example covering transpose.","Extend it with matmul/@.","Verify behavior related to dot."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Linear Algebra Helpers.",
      conceptIds: ["numpy-transpose","numpy-matmul","numpy-dot"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("numpy-linear-algebra-helpers", ["numpy-transpose","numpy-matmul","numpy-dot","numpy-np-linalg-solve","numpy-norms-intro"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const numpy_random_samplingTopic = topic({
  id: "numpy-random-sampling",
  title: "Random Sampling",
  aliases: ["numpy random","default_rng"],
  description: "Generate reproducible random samples for simulation and ML splits.",
  learningOrder: 6,
  prerequisiteIds: ["numpy-linear-algebra-helpers"],
  
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "numpy-generator-api",
      title: "Generator API",
      description: "Generator API applied in this topic.",
    }),
    concept({
      id: "numpy-random-seed-default-rng",
      title: "random.seed/default_rng",
      description: "random.seed/default_rng applied in this topic.",
    }),
    concept({
      id: "numpy-uniform-normal",
      title: "Uniform/Normal",
      description: "Uniform/Normal applied in this topic.",
    }),
    concept({
      id: "numpy-choice-shuffle",
      title: "Choice/Shuffle",
      description: "Choice/Shuffle applied in this topic.",
    }),
    concept({
      id: "numpy-reproducibility",
      title: "Reproducibility",
      description: "Reproducibility applied in this topic.",
    }),
    concept({
      id: "numpy-sampling-without-replacement",
      title: "Sampling without Replacement",
      description: "Sampling without Replacement applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Generator API correctly","Explain random.seed/default_rng in context"],
  practicalArtifacts: [
    artifact({
      id: "numpy-random-sampling-artifact",
      type: "code",
      title: "Random Sampling worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Generator API, random.seed/default_rng, Uniform/Normal.",
      conceptIds: ["numpy-generator-api","numpy-random-seed-default-rng","numpy-uniform-normal","numpy-choice-shuffle"],
    }),
  ],
  commonMistakes: [
    mistake(
      "numpy-random-sampling-mistake-1",
      "Misapplying Generator API",
      "Skipping hands-on checks in Random Sampling",
      "Practice Generator API with a tiny example first.",
      ["numpy-generator-api"],
    ),
    mistake(
      "numpy-random-sampling-mistake-2",
      "Pulling unrelated-domain demos into Random Sampling",
      "Defaulting to out-of-domain snippets",
      "Stay inside Random Sampling concepts.",
      ["numpy-random-seed-default-rng"],
    ),
  ],
  exercises: [
    exercise({
      id: "numpy-random-sampling-exercise",
      title: "Random Sampling mini exercise",
      instructions: ["Build a small example covering Generator API.","Extend it with random.seed/default_rng.","Verify behavior related to Uniform/Normal."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Random Sampling.",
      conceptIds: ["numpy-generator-api","numpy-random-seed-default-rng","numpy-uniform-normal"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("numpy-random-sampling", ["numpy-generator-api","numpy-random-seed-default-rng","numpy-uniform-normal","numpy-choice-shuffle","numpy-reproducibility"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

export const numpyKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-numpy",
  title: "NumPy",
  aliases: ["numpy","learn numpy","np","python numpy"],
  category: "Data",
  description: "NumPy starter curriculum covering ndarray, indexing, broadcasting, ufuncs, linear algebra helpers, and random sampling.",
  topics: [numpy_ndarray_basicsTopic, numpy_indexing_and_slicingTopic, numpy_broadcastingTopic, numpy_ufuncs_and_aggregationsTopic, numpy_linear_algebra_helpersTopic, numpy_random_samplingTopic],
});
