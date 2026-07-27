// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { demo } from "@/constants/demo";
import { thresholds } from "@/constants/thresholds";
import { awsSaaQuizzes } from "@/data/aws-saa-seed";
import {
  buildAssessmentFromLesson,
} from "@/lib/assessment/build-lesson-assessment";
import {
  buildDeterministicAssessmentQuestions,
  buildDeterministicTopicAssessment,
} from "@/lib/assessment/assessment-fallback";
import {
  readCachedAssessment,
  writeCachedAssessment,
} from "@/lib/assessment/assessment-session-cache";
import { topicAssessmentSchema, TARGET_ASSESSMENT_QUESTIONS } from "@/lib/assessment/assessment-schema";
import { isGenericStudyAdviceQuestion } from "@/lib/assessment/assessment-question-quality";
import { scoreAssessmentByConcept } from "@/lib/assessment/concept-scoring";
import { buildQuizCompletedPayload } from "@/lib/assessment/normalize-quiz-result";
import { topicQuizToAssessment } from "@/lib/assessment/seed-quiz-adapter";
import { resolveAssessmentHref } from "@/lib/tutor/mission";
import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";
import {
  selectInjectedRemedialTaskCount,
  selectLatestDecision,
  selectTopicStrength,
  selectWeakTopics,
} from "@/stores/selectors";
import { createTestAppStore } from "@/stores/use-app-store";

const START = "2026-07-17T00:00:00.000Z";

function buildSampleLesson(overrides: Partial<GeneratedLessonPayload> = {}): GeneratedLessonPayload {
  return {
    topicId: "cloud-concepts",
    source: "ai",
    title: "Azure Cloud Concepts Overview",
    estimatedMinutes: 45,
    learningObjectives: [
      "Explain cloud service models",
      "Compare CapEx and OpEx in Azure",
      "Describe shared responsibility in Azure",
    ],
    sections: [
      {
        heading: "Cloud service models",
        content: "Azure supports IaaS, PaaS, and SaaS delivery models for different workload needs.",
        practicalExample: "Choose PaaS for a web app where Azure manages runtime patching.",
        commonMistakes: ["Assuming SaaS removes all customer responsibility"],
        summary: ["Match the service model to operational ownership needs"],
        knowledgeCheck: [
          {
            question: "Which Azure service model gives the most control over the OS?",
            options: ["IaaS", "PaaS", "SaaS", "Serverless only"] as [
              string,
              string,
              string,
              string,
            ],
            correctIndex: 0,
            explanation: "IaaS leaves OS management with the customer.",
            conceptTag: "service-models",
          },
          {
            question: "Which option describes SaaS delivery?",
            options: [
              "Managed application consumed over the network",
              "Raw virtual machines only",
              "Manual OS patching required",
              "On-premises hardware only",
            ] as [string, string, string, string],
            correctIndex: 0,
            explanation: "SaaS delivers a managed application experience.",
            conceptTag: "saas",
          },
          {
            question: "Which Azure model fits managed runtime patching?",
            options: ["PaaS", "IaaS", "Bare metal", "Colocation"] as [string, string, string, string],
            correctIndex: 0,
            explanation: "PaaS abstracts runtime management.",
            conceptTag: "paas",
          },
        ],
      },
      {
        heading: "Cost models",
        content: "Azure shifts capital expenses to operational consumption-based billing.",
        practicalExample: "Compare reserved VM pricing with pay-as-you-go for seasonal workloads.",
        commonMistakes: ["Ignoring reserved capacity discounts"],
        summary: ["OpEx billing aligns cloud spend with usage patterns"],
        knowledgeCheck: [
          {
            question: "What is a key financial benefit of Azure cloud adoption?",
            options: [
              "Converting CapEx to OpEx",
              "Eliminating all infrastructure costs",
              "Avoiding budgeting entirely",
              "Removing the need for governance",
            ] as [string, string, string, string],
            correctIndex: 0,
            explanation: "Cloud consumption shifts large upfront costs to usage-based spend.",
            conceptTag: "cost-models",
          },
          {
            question: "Which pricing approach helps seasonal Azure workloads?",
            options: [
              "Pay-as-you-go consumption",
              "Fixed perpetual licenses only",
              "Ignoring usage metrics",
              "Avoiding autoscaling",
            ] as [string, string, string, string],
            correctIndex: 0,
            explanation: "Consumption billing aligns cost with demand.",
            conceptTag: "pricing",
          },
        ],
      },
    ],
    ...overrides,
  };
}

function buildKubernetesLesson(): GeneratedLessonPayload {
  return buildSampleLesson({
    topicId: "kubernetes-networking",
    title: "Kubernetes Networking Essentials",
    learningObjectives: [
      "Explain pod networking in Kubernetes",
      "Differentiate Services and Ingress",
      "Identify common networking mistakes",
    ],
    sections: [
      {
        heading: "Pod networking",
        content: "Pods receive cluster-internal IP addresses and communicate across nodes via CNI plugins.",
        practicalExample: "Expose a Deployment through a ClusterIP Service before adding Ingress.",
        commonMistakes: ["Confusing pod IPs with stable service endpoints"],
        summary: ["Pods are ephemeral; Services provide stable access"],
        knowledgeCheck: [
          {
            question: "What provides stable access to a set of pods?",
            options: ["Service", "ConfigMap", "PersistentVolume", "Job"] as [
              string,
              string,
              string,
              string,
            ],
            correctIndex: 0,
            explanation: "Services abstract pod endpoints behind a stable address.",
          },
        ],
      },
      {
        heading: "Ingress routing",
        content: "Ingress controllers route external HTTP traffic to in-cluster Services.",
        practicalExample: "Use Ingress rules to host multiple hostnames on one load balancer.",
        commonMistakes: ["Creating Ingress without an installed controller"],
        summary: ["Ingress depends on a controller to enforce routing rules"],
        knowledgeCheck: [
          {
            question: "What component applies Ingress routing rules in the cluster?",
            options: [
              "Ingress controller",
              "kube-scheduler",
              "etcd",
              "Container runtime",
            ] as [string, string, string, string],
            correctIndex: 0,
            explanation: "An Ingress controller watches Ingress resources and configures routing.",
          },
        ],
      },
    ],
  });
}

describe("generated assessment builder", () => {
  it("always produces exactly 5 questions", () => {
    const assessment = buildAssessmentFromLesson(buildSampleLesson(), {
      goalSlug: "azure-fundamentals",
      goalCategory: "Cloud",
    });

    expect(assessment.questions).toHaveLength(TARGET_ASSESSMENT_QUESTIONS);
    expect(topicAssessmentSchema.safeParse(assessment).success).toBe(true);
  });

  it("Azure lesson produces an Azure assessment with 5 questions", () => {
    const assessment = buildAssessmentFromLesson(buildSampleLesson(), {
      goalSlug: "azure-fundamentals",
      goalCategory: "Cloud",
    });

    expect(topicAssessmentSchema.safeParse(assessment).success).toBe(true);
    expect(assessment.topicId).toBe("cloud-concepts");
    expect(assessment.questions.length).toBe(5);
    expect(JSON.stringify(assessment).toLowerCase()).toContain("azure");
    expect(JSON.stringify(assessment).toLowerCase()).not.toContain("amazon ec2");
  });

  it("Kubernetes lesson produces a Kubernetes assessment", () => {
    const assessment = buildAssessmentFromLesson(buildKubernetesLesson(), {
      goalSlug: "learn-kubernetes",
      goalCategory: "DevOps",
    });

    expect(assessment.topicId).toBe("kubernetes-networking");
    expect(assessment.questions.length).toBe(5);
    expect(JSON.stringify(assessment).toLowerCase()).toContain("kubernetes");
    expect(JSON.stringify(assessment).toLowerCase()).not.toContain("aws global infrastructure");
  });

  it("invalid extracted questions trigger deterministic fallback", () => {
    const invalidLesson = buildSampleLesson({
      sections: [
        {
          heading: "Amazon EC2 compute",
          content: "EC2 provides resizable compute capacity in AWS.",
          practicalExample: "Launch an EC2 instance in a public subnet.",
          commonMistakes: ["Using the wrong AMI"],
          summary: ["EC2 is core AWS compute"],
          knowledgeCheck: [
            {
              question: "What is Amazon EC2?",
              options: ["Compute", "Storage", "DNS", "Queue"] as [string, string, string, string],
              correctIndex: 0,
              explanation: "EC2 is compute.",
            },
          ],
        },
      ],
    });

    const assessment = buildAssessmentFromLesson(invalidLesson, {
      goalSlug: "azure-fundamentals",
      goalCategory: "Cloud",
    });

    expect(assessment.source).toBe("fallback");
    expect(assessment.questions.length).toBe(5);
    expect(JSON.stringify(assessment).toLowerCase()).not.toContain("amazon ec2");
  });

  it("prefers lesson knowledge checks and supplements to 5", () => {
    const assessment = buildAssessmentFromLesson(buildSampleLesson(), {
      goalSlug: "azure-fundamentals",
      goalCategory: "Cloud",
    });

    expect(assessment.source).toBe("lesson");
    expect(assessment.questions.length).toBe(5);
    expect(assessment.questions.some((question) => /service model|azure/i.test(question.prompt))).toBe(
      true,
    );
  });

  it("Java assessment contains Java-specific questions without study advice", () => {
    const assessment = buildDeterministicTopicAssessment({
      topicId: "java-syntax-and-data-types",
      topicTitle: "Java Syntax and Variables",
      goalSlug: "learn-java",
      goalCategory: "Programming",
      learningObjectives: ["Declare Java variables"],
      sections: [{ heading: "Java Syntax", summary: ["Use valid declarations"], content: "..." }],
    });

    expect(assessment.questions).toHaveLength(5);
    expect(assessment.questions.some((question) => /java/i.test(question.prompt))).toBe(true);
    expect(
      assessment.questions.every((question) => !isGenericStudyAdviceQuestion(question.prompt)),
    ).toBe(true);
  });

  it("Python assessment contains Python-specific questions", () => {
    const assessment = buildDeterministicTopicAssessment({
      topicId: "python-basics",
      topicTitle: "Python Basics",
      goalSlug: "learn-python",
      goalCategory: "Programming",
      learningObjectives: ["Declare Python variables"],
      sections: [{ heading: "Python Basics", summary: ["Use valid assignments"], content: "..." }],
    });

    expect(assessment.questions).toHaveLength(5);
    expect(assessment.questions.some((question) => /python/i.test(question.prompt))).toBe(true);
    expect(assessment.questions.every((question) => !/java/i.test(question.prompt))).toBe(true);
  });

  it("removes invalid generic study-advice lesson questions during build", () => {
    const lesson = buildSampleLesson({
      sections: [
        {
          heading: "Study tips",
          content: "Generic study guidance.",
          practicalExample: "Review notes daily.",
          commonMistakes: ["Skipping review"],
          summary: ["Review consistently"],
          knowledgeCheck: [
            {
              question: "What is the best way to study Azure?",
              options: ["Review", "Ignore", "Skip", "Guess"] as [string, string, string, string],
              correctIndex: 0,
              explanation: "Review helps.",
              conceptTag: "study-advice",
            },
          ],
        },
      ],
    });

    const assessment = buildAssessmentFromLesson(lesson, {
      goalSlug: "azure-fundamentals",
      goalCategory: "Cloud",
    });

    expect(assessment.questions).toHaveLength(5);
    expect(
      assessment.questions.every((question) => !isGenericStudyAdviceQuestion(question.prompt)),
    ).toBe(true);
  });

  it("calculates score and concept-level weakness detection", () => {
    const assessment = buildAssessmentFromLesson(buildSampleLesson(), {
      goalSlug: "azure-fundamentals",
      goalCategory: "Cloud",
    });
    const answers = Object.fromEntries(
      assessment.questions.map((question, index) => [
        question.id,
        index === 0 ? question.correctIndex : question.correctIndex === 0 ? 1 : 0,
      ]),
    );

    const result = scoreAssessmentByConcept(
      assessment.questions,
      answers,
      assessment.passingScore,
      thresholds.masteryScore,
    );

    expect(result.totalQuestions).toBe(assessment.questions.length);
    expect(result.correctCount).toBeGreaterThan(0);
    expect(result.incorrectCount).toBeGreaterThan(0);
    expect(result.weakConceptTags.length).toBeGreaterThan(0);
  });
});

describe("assessment engine integration", () => {
  let store: ReturnType<typeof createTestAppStore>;

  beforeEach(() => {
    store = createTestAppStore();
    store.getState().initializeDemoLearner(START);
  });

  it("low score triggers remediation through the Decision Engine", () => {
    const assessment = buildAssessmentFromLesson(buildSampleLesson(), {
      goalSlug: "azure-fundamentals",
      goalCategory: "Cloud",
    });
    const answers = Object.fromEntries(
      assessment.questions.map((question) => [question.id, question.correctIndex === 0 ? 1 : 0]),
    );
    const result = scoreAssessmentByConcept(
      assessment.questions,
      answers,
      assessment.passingScore,
      thresholds.masteryScore,
    );
    const lowScore = 42;

    store.getState().dispatchLearnerEvent(
      buildQuizCompletedPayload(assessment, { ...result, score: lowScore, passed: false, mastery: false }, START),
    );

    const state = store.getState();
    expect(selectWeakTopics(state).some((topic) => topic.topicId === "cloud-concepts")).toBe(true);
    expect(selectInjectedRemedialTaskCount(state)).toBeGreaterThan(0);
    expect(selectLatestDecision(state)?.reasons).toContain("QUIZ_BELOW_THRESHOLD");
  });

  it("high score on a previously weak topic triggers mastery progression", () => {
    const assessment = buildAssessmentFromLesson(buildSampleLesson(), {
      goalSlug: "azure-fundamentals",
      goalCategory: "Cloud",
    });

    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "cloud-concepts",
      score: demo.weakQuizScore,
      totalQuestions: assessment.questions.length,
      timestamp: START,
    });

    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "cloud-concepts",
      score: demo.masteryQuizScore,
      totalQuestions: assessment.questions.length,
      weakConceptTags: [],
      masteredConceptTags: ["explain-cloud-service-models"],
      timestamp: "2026-07-28T20:00:00.000Z",
    });

    const state = store.getState();
    expect(selectTopicStrength(state, "cloud-concepts")).toBeDefined();
    expect(selectLatestDecision(state)?.reasons).toContain("QUIZ_MASTERY_ACHIEVED");
  });
});

describe("assessment routing and cache", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("reuses cached assessment in the same session", () => {
    const assessment = buildDeterministicTopicAssessment({
      topicId: "cloud-concepts",
      topicTitle: "Cloud Concepts",
      goalSlug: "azure-fundamentals",
      goalCategory: "Cloud",
      learningObjectives: ["Explain cloud service models"],
      sections: [{ heading: "Cloud Concepts", summary: ["Understand cloud models"], content: "..." }],
    });

    writeCachedAssessment("azure-fundamentals", assessment);
    const cached = readCachedAssessment("azure-fundamentals", "cloud-concepts");

    expect(cached?.questions.length).toBe(5);
    expect(cached?.topicId).toBe("cloud-concepts");
  });

  it("rejects stale 3-question session cache and clears storage", () => {
    window.sessionStorage.setItem(
      "mentormind-assessment-cache:learn-python:python-basics",
      JSON.stringify({
        topicId: "python-basics",
        passingScore: 70,
        source: "lesson",
        questions: [
          {
            id: "q1",
            topicId: "python-basics",
            conceptTag: "one",
            prompt: "Question 1?",
            options: ["A", "B", "C", "D"],
            correctIndex: 0,
            explanation: "Because A.",
          },
          {
            id: "q2",
            topicId: "python-basics",
            conceptTag: "two",
            prompt: "Question 2?",
            options: ["A", "B", "C", "D"],
            correctIndex: 0,
            explanation: "Because A.",
          },
          {
            id: "q3",
            topicId: "python-basics",
            conceptTag: "three",
            prompt: "Question 3?",
            options: ["A", "B", "C", "D"],
            correctIndex: 0,
            explanation: "Because A.",
          },
        ],
      }),
    );

    expect(readCachedAssessment("learn-python", "python-basics")).toBeNull();
    expect(
      window.sessionStorage.getItem("mentormind-assessment-cache:learn-python:python-basics"),
    ).toBeNull();
  });

  it("demo mode keeps the stable AWS VPC assessment route", () => {
    const store = createTestAppStore();
    store.getState().initializeDemoLearner(START);

    expect(resolveAssessmentHref(store.getState(), "vpc-networking")).toBe("/assessment/vpc-networking");
  });

  it("normal onboarding uses generated topic assessment route", () => {
    const store = createTestAppStore();
    store.getState().initializeDemoLearner(START);
    store.setState({ presenterMode: false });

    expect(resolveAssessmentHref(store.getState(), "cloud-concepts")).toBe("/assessment/cloud-concepts");
  });

  it("demo seed quiz adapter remains unchanged for VPC assessment", () => {
    const seedAssessment = topicQuizToAssessment(awsSaaQuizzes["vpc-networking"]);

    expect(seedAssessment.source).toBe("seed");
    expect(seedAssessment.questions.length).toBe(awsSaaQuizzes["vpc-networking"].questions.length);
  });
});

describe("deterministic supplemental questions", () => {
  it("never uses AWS content for Azure supplemental questions", () => {
    const questions = buildDeterministicAssessmentQuestions({
      topicId: "cloud-concepts",
      topicTitle: "Cloud Concepts",
      goalSlug: "azure-fundamentals",
      goalCategory: "Cloud",
      learningObjectives: ["Explain cloud service models"],
      sections: [{ heading: "Cloud Concepts", summary: ["Understand Azure cloud models"], content: "..." }],
      count: 5,
    });

    expect(questions).toHaveLength(5);
    expect(JSON.stringify(questions).toLowerCase()).not.toContain("amazon web services");
    expect(JSON.stringify(questions).toLowerCase()).toContain("azure");
  });
});
