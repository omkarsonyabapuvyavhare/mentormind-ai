import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","react hooks","sql join"];

const dl_tensors_and_autogradTopic = topic({
  id: "dl-tensors-and-autograd",
  title: "Tensors and Autograd",
  aliases: ["tensors","autograd"],
  description: "Represent data as tensors and compute gradients with autograd.",
  learningOrder: 1,
  
  relatedTopicIds: ["dl-layers-and-activations"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "dl-tensors",
      title: "Tensors",
      description: "Tensors applied in this topic.",
    }),
    concept({
      id: "dl-dtype-device",
      title: "dtype/device",
      description: "dtype/device applied in this topic.",
    }),
    concept({
      id: "dl-autograd",
      title: "Autograd",
      description: "Autograd applied in this topic.",
    }),
    concept({
      id: "dl-computational-graph",
      title: "Computational Graph",
      description: "Computational Graph applied in this topic.",
    }),
    concept({
      id: "dl-backward",
      title: "backward",
      description: "backward applied in this topic.",
    }),
    concept({
      id: "dl-no-grad",
      title: "no_grad",
      description: "no_grad applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Tensors correctly","Explain dtype/device in context"],
  practicalArtifacts: [
    artifact({
      id: "dl-tensors-and-autograd-artifact",
      type: "code",
      title: "Tensors and Autograd worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Tensors, dtype/device, Autograd.",
      conceptIds: ["dl-tensors","dl-dtype-device","dl-autograd","dl-computational-graph"],
    }),
  ],
  commonMistakes: [
    mistake(
      "dl-tensors-and-autograd-mistake-1",
      "Misapplying Tensors",
      "Skipping hands-on checks in Tensors and Autograd",
      "Practice Tensors with a tiny example first.",
      ["dl-tensors"],
    ),
    mistake(
      "dl-tensors-and-autograd-mistake-2",
      "Pulling unrelated-domain demos into Tensors and Autograd",
      "Defaulting to out-of-domain snippets",
      "Stay inside Tensors and Autograd concepts.",
      ["dl-dtype-device"],
    ),
  ],
  exercises: [
    exercise({
      id: "dl-tensors-and-autograd-exercise",
      title: "Tensors and Autograd mini exercise",
      instructions: ["Build a small example covering Tensors.","Extend it with dtype/device.","Verify behavior related to Autograd."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Tensors and Autograd.",
      conceptIds: ["dl-tensors","dl-dtype-device","dl-autograd"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("dl-tensors-and-autograd", ["dl-tensors","dl-dtype-device","dl-autograd","dl-computational-graph","dl-backward"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const dl_layers_and_activationsTopic = topic({
  id: "dl-layers-and-activations",
  title: "Layers and Activations",
  aliases: ["neural layers","activations"],
  description: "Stack linear layers with nonlinear activations.",
  learningOrder: 2,
  prerequisiteIds: ["dl-tensors-and-autograd"],
  relatedTopicIds: ["dl-training-loop"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "dl-linear-layers",
      title: "Linear Layers",
      description: "Linear Layers applied in this topic.",
    }),
    concept({
      id: "dl-relu",
      title: "ReLU",
      description: "ReLU applied in this topic.",
    }),
    concept({
      id: "dl-softmax",
      title: "Softmax",
      description: "Softmax applied in this topic.",
    }),
    concept({
      id: "dl-embedding-intro",
      title: "Embedding Intro",
      description: "Embedding Intro applied in this topic.",
    }),
    concept({
      id: "dl-parameter-tensors",
      title: "Parameter Tensors",
      description: "Parameter Tensors applied in this topic.",
    }),
    concept({
      id: "dl-forward-pass",
      title: "Forward Pass",
      description: "Forward Pass applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Linear Layers correctly","Explain ReLU in context"],
  practicalArtifacts: [
    artifact({
      id: "dl-layers-and-activations-artifact",
      type: "code",
      title: "Layers and Activations worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Linear Layers, ReLU, Softmax.",
      conceptIds: ["dl-linear-layers","dl-relu","dl-softmax","dl-embedding-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "dl-layers-and-activations-mistake-1",
      "Misapplying Linear Layers",
      "Skipping hands-on checks in Layers and Activations",
      "Practice Linear Layers with a tiny example first.",
      ["dl-linear-layers"],
    ),
    mistake(
      "dl-layers-and-activations-mistake-2",
      "Pulling unrelated-domain demos into Layers and Activations",
      "Defaulting to out-of-domain snippets",
      "Stay inside Layers and Activations concepts.",
      ["dl-relu"],
    ),
  ],
  exercises: [
    exercise({
      id: "dl-layers-and-activations-exercise",
      title: "Layers and Activations mini exercise",
      instructions: ["Build a small example covering Linear Layers.","Extend it with ReLU.","Verify behavior related to Softmax."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Layers and Activations.",
      conceptIds: ["dl-linear-layers","dl-relu","dl-softmax"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("dl-layers-and-activations", ["dl-linear-layers","dl-relu","dl-softmax","dl-embedding-intro","dl-parameter-tensors"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const dl_training_loopTopic = topic({
  id: "dl-training-loop",
  title: "Training Loop",
  aliases: ["training loop","optimizer"],
  description: "Implement the forward/loss/backward/optimize step cycle.",
  learningOrder: 3,
  prerequisiteIds: ["dl-layers-and-activations"],
  relatedTopicIds: ["dl-cnn-intuition"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "dl-loss-functions",
      title: "Loss Functions",
      description: "Loss Functions applied in this topic.",
    }),
    concept({
      id: "dl-optimizers",
      title: "Optimizers",
      description: "Optimizers applied in this topic.",
    }),
    concept({
      id: "dl-mini-batches",
      title: "Mini-batches",
      description: "Mini-batches applied in this topic.",
    }),
    concept({
      id: "dl-epochs",
      title: "Epochs",
      description: "Epochs applied in this topic.",
    }),
    concept({
      id: "dl-learning-rate",
      title: "Learning Rate",
      description: "Learning Rate applied in this topic.",
    }),
    concept({
      id: "dl-gradient-clipping-intro",
      title: "Gradient Clipping Intro",
      description: "Gradient Clipping Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Loss Functions correctly","Explain Optimizers in context"],
  practicalArtifacts: [
    artifact({
      id: "dl-training-loop-artifact",
      type: "code",
      title: "Pseudo training step",
      language: "python",
      content: "# pred = model(xb)\n# loss = criterion(pred, yb)\n# opt.zero_grad(); loss.backward(); opt.step()",
      expectedOutput: "Parameters update once per batch",
      explanation: "Canonical DL training step.",
      conceptIds: ["dl-loss-functions","dl-optimizers","dl-mini-batches","dl-epochs"],
    }),
  ],
  commonMistakes: [
    mistake(
      "dl-training-loop-mistake-1",
      "Misapplying Loss Functions",
      "Skipping hands-on checks in Training Loop",
      "Practice Loss Functions with a tiny example first.",
      ["dl-loss-functions"],
    ),
    mistake(
      "dl-training-loop-mistake-2",
      "Pulling unrelated-domain demos into Training Loop",
      "Defaulting to out-of-domain snippets",
      "Stay inside Training Loop concepts.",
      ["dl-optimizers"],
    ),
  ],
  exercises: [
    exercise({
      id: "dl-training-loop-exercise",
      title: "Training Loop mini exercise",
      instructions: ["Build a small example covering Loss Functions.","Extend it with Optimizers.","Verify behavior related to Mini-batches."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Training Loop.",
      conceptIds: ["dl-loss-functions","dl-optimizers","dl-mini-batches"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("dl-training-loop", ["dl-loss-functions","dl-optimizers","dl-mini-batches","dl-epochs","dl-learning-rate"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const dl_cnn_intuitionTopic = topic({
  id: "dl-cnn-intuition",
  title: "CNN Intuition",
  aliases: ["cnn","convolution"],
  description: "Understand convolution, pooling, and spatial feature hierarchies.",
  learningOrder: 4,
  prerequisiteIds: ["dl-training-loop"],
  relatedTopicIds: ["dl-sequence-models-intuition"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "dl-convolution",
      title: "Convolution",
      description: "Convolution applied in this topic.",
    }),
    concept({
      id: "dl-kernels-filters",
      title: "Kernels/Filters",
      description: "Kernels/Filters applied in this topic.",
    }),
    concept({
      id: "dl-pooling",
      title: "Pooling",
      description: "Pooling applied in this topic.",
    }),
    concept({
      id: "dl-channels",
      title: "Channels",
      description: "Channels applied in this topic.",
    }),
    concept({
      id: "dl-receptive-field",
      title: "Receptive Field",
      description: "Receptive Field applied in this topic.",
    }),
    concept({
      id: "dl-image-augmentation-intro",
      title: "Image Augmentation Intro",
      description: "Image Augmentation Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Convolution correctly","Explain Kernels/Filters in context"],
  practicalArtifacts: [
    artifact({
      id: "dl-cnn-intuition-artifact",
      type: "code",
      title: "CNN Intuition worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Convolution, Kernels/Filters, Pooling.",
      conceptIds: ["dl-convolution","dl-kernels-filters","dl-pooling","dl-channels"],
    }),
  ],
  commonMistakes: [
    mistake(
      "dl-cnn-intuition-mistake-1",
      "Misapplying Convolution",
      "Skipping hands-on checks in CNN Intuition",
      "Practice Convolution with a tiny example first.",
      ["dl-convolution"],
    ),
    mistake(
      "dl-cnn-intuition-mistake-2",
      "Pulling unrelated-domain demos into CNN Intuition",
      "Defaulting to out-of-domain snippets",
      "Stay inside CNN Intuition concepts.",
      ["dl-kernels-filters"],
    ),
  ],
  exercises: [
    exercise({
      id: "dl-cnn-intuition-exercise",
      title: "CNN Intuition mini exercise",
      instructions: ["Build a small example covering Convolution.","Extend it with Kernels/Filters.","Verify behavior related to Pooling."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for CNN Intuition.",
      conceptIds: ["dl-convolution","dl-kernels-filters","dl-pooling"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("dl-cnn-intuition", ["dl-convolution","dl-kernels-filters","dl-pooling","dl-channels","dl-receptive-field"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const dl_sequence_models_intuitionTopic = topic({
  id: "dl-sequence-models-intuition",
  title: "Sequence Models Intuition",
  aliases: ["rnn","attention"],
  description: "Compare RNN/LSTM ideas and transformer attention at a conceptual level.",
  learningOrder: 5,
  prerequisiteIds: ["dl-cnn-intuition"],
  relatedTopicIds: ["dl-regularization-and-transfer"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "dl-sequence-data",
      title: "Sequence Data",
      description: "Sequence Data applied in this topic.",
    }),
    concept({
      id: "dl-rnn-intuition",
      title: "RNN Intuition",
      description: "RNN Intuition applied in this topic.",
    }),
    concept({
      id: "dl-lstm-gru-intuition",
      title: "LSTM/GRU Intuition",
      description: "LSTM/GRU Intuition applied in this topic.",
    }),
    concept({
      id: "dl-attention-intro",
      title: "Attention Intro",
      description: "Attention Intro applied in this topic.",
    }),
    concept({
      id: "dl-positional-signals",
      title: "Positional Signals",
      description: "Positional Signals applied in this topic.",
    }),
    concept({
      id: "dl-when-to-prefer-transformers",
      title: "When to Prefer Transformers",
      description: "When to Prefer Transformers applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Sequence Data correctly","Explain RNN Intuition in context"],
  practicalArtifacts: [
    artifact({
      id: "dl-sequence-models-intuition-artifact",
      type: "code",
      title: "Sequence Models Intuition worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Sequence Data, RNN Intuition, LSTM/GRU Intuition.",
      conceptIds: ["dl-sequence-data","dl-rnn-intuition","dl-lstm-gru-intuition","dl-attention-intro"],
    }),
  ],
  commonMistakes: [
    mistake(
      "dl-sequence-models-intuition-mistake-1",
      "Misapplying Sequence Data",
      "Skipping hands-on checks in Sequence Models Intuition",
      "Practice Sequence Data with a tiny example first.",
      ["dl-sequence-data"],
    ),
    mistake(
      "dl-sequence-models-intuition-mistake-2",
      "Pulling unrelated-domain demos into Sequence Models Intuition",
      "Defaulting to out-of-domain snippets",
      "Stay inside Sequence Models Intuition concepts.",
      ["dl-rnn-intuition"],
    ),
  ],
  exercises: [
    exercise({
      id: "dl-sequence-models-intuition-exercise",
      title: "Sequence Models Intuition mini exercise",
      instructions: ["Build a small example covering Sequence Data.","Extend it with RNN Intuition.","Verify behavior related to LSTM/GRU Intuition."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Sequence Models Intuition.",
      conceptIds: ["dl-sequence-data","dl-rnn-intuition","dl-lstm-gru-intuition"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("dl-sequence-models-intuition", ["dl-sequence-data","dl-rnn-intuition","dl-lstm-gru-intuition","dl-attention-intro","dl-positional-signals"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

const dl_regularization_and_transferTopic = topic({
  id: "dl-regularization-and-transfer",
  title: "Regularization and Transfer Learning",
  aliases: ["transfer learning","dropout"],
  description: "Reduce overfitting and reuse pretrained backbones.",
  learningOrder: 6,
  prerequisiteIds: ["dl-sequence-models-intuition"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "dl-dropout",
      title: "Dropout",
      description: "Dropout applied in this topic.",
    }),
    concept({
      id: "dl-weight-decay",
      title: "Weight Decay",
      description: "Weight Decay applied in this topic.",
    }),
    concept({
      id: "dl-early-stopping",
      title: "Early Stopping",
      description: "Early Stopping applied in this topic.",
    }),
    concept({
      id: "dl-data-augmentation",
      title: "Data Augmentation",
      description: "Data Augmentation applied in this topic.",
    }),
    concept({
      id: "dl-pretrained-models",
      title: "Pretrained Models",
      description: "Pretrained Models applied in this topic.",
    }),
    concept({
      id: "dl-fine-tuning",
      title: "Fine-tuning",
      description: "Fine-tuning applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Dropout correctly","Explain Weight Decay in context"],
  practicalArtifacts: [
    artifact({
      id: "dl-regularization-and-transfer-artifact",
      type: "code",
      title: "Regularization and Transfer Learning worked example",
      language: "python",
      content: "values = [1, 2, 3]\nprint(sum(values))",
      expectedOutput: "6",
      explanation: "Demonstrates Dropout, Weight Decay, Early Stopping.",
      conceptIds: ["dl-dropout","dl-weight-decay","dl-early-stopping","dl-data-augmentation"],
    }),
  ],
  commonMistakes: [
    mistake(
      "dl-regularization-and-transfer-mistake-1",
      "Misapplying Dropout",
      "Skipping hands-on checks in Regularization and Transfer Learning",
      "Practice Dropout with a tiny example first.",
      ["dl-dropout"],
    ),
    mistake(
      "dl-regularization-and-transfer-mistake-2",
      "Pulling unrelated-domain demos into Regularization and Transfer Learning",
      "Defaulting to out-of-domain snippets",
      "Stay inside Regularization and Transfer Learning concepts.",
      ["dl-weight-decay"],
    ),
  ],
  exercises: [
    exercise({
      id: "dl-regularization-and-transfer-exercise",
      title: "Regularization and Transfer Learning mini exercise",
      instructions: ["Build a small example covering Dropout.","Extend it with Weight Decay.","Verify behavior related to Early Stopping."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Regularization and Transfer Learning.",
      conceptIds: ["dl-dropout","dl-weight-decay","dl-early-stopping"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("dl-regularization-and-transfer", ["dl-dropout","dl-weight-decay","dl-early-stopping","dl-data-augmentation","dl-pretrained-models"],
    ["concept-understanding","query-interpretation","code-interpretation","practical-scenario","debugging"]),
});

export const deepLearningKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-deep-learning",
  title: "Deep Learning",
  aliases: ["deep learning","learn deep learning","neural networks","dl","deep neural nets"],
  category: "AI / Machine Learning",
  description: "Deep Learning starter covering tensors, layers, training loops, CNNs/RNNs intuition, regularization, and transfer learning basics.",
  topics: [dl_tensors_and_autogradTopic, dl_layers_and_activationsTopic, dl_training_loopTopic, dl_cnn_intuitionTopic, dl_sequence_models_intuitionTopic, dl_regularization_and_transferTopic],
});
