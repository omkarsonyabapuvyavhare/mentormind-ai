import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = [
  "aws",
  "vpc",
  "ec2",
  "react hooks",
  "jsx",
  "python",
  "django",
  "flask",
  "pandas",
  "numpy",
  "pytest",
];

const syntaxTopic = topic({
  id: "java-syntax-and-types",
  title: "Java Syntax and Types",
  aliases: ["java basics", "primitives", "java variables"],
  description: "Declare variables, choose primitive types, and write a main entry point.",
  learningOrder: 1,
  relatedTopicIds: ["java-control-flow-and-methods"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "java-main", title: "main Method", description: "Program entry point: public static void main(String[] args)." }),
    concept({ id: "java-primitives", title: "Primitive Types", description: "byte, short, int, long, float, double, char, boolean." }),
    concept({ id: "java-variables", title: "Variables", description: "Typed bindings declared before use." }),
    concept({ id: "java-strings", title: "String", description: "Immutable sequence of characters (reference type)." }),
    concept({ id: "java-system-out", title: "System.out", description: "Print text to standard output." }),
    concept({ id: "java-final", title: "final Variables", description: "Bindings that cannot be reassigned after initialization." }),
  ],
  learningObjectives: [
    "Write a compilable class with main",
    "Choose appropriate primitive types and String",
  ],
  practicalArtifacts: [
    artifact({
      id: "java-syntax-hello-profile",
      type: "code",
      title: "Profile printer",
      language: "java",
      content:
        'public class Profile {\n  public static void main(String[] args) {\n    final String name = "Ada";\n    int hours = 12;\n    boolean active = true;\n    System.out.println(name + " hours=" + hours + " active=" + active);\n  }\n}',
      expectedOutput: "Ada hours=12 active=true",
      explanation: "main, primitives, String, final, and System.out.",
      conceptIds: ["java-main", "java-primitives", "java-strings", "java-system-out"],
    }),
  ],
  commonMistakes: [
    mistake(
      "java-syntax-main-sig",
      "Wrong main signature preventing launch",
      "Omitting static or String[] args",
      "Use public static void main(String[] args).",
      ["java-main"],
    ),
    mistake(
      "java-syntax-untyped",
      "Treating Java like dynamically typed JS",
      "Forgetting declared types",
      "Declare types for every local variable.",
      ["java-variables", "java-primitives"],
    ),
  ],
  exercises: [
    exercise({
      id: "java-syntax-exercise",
      title: "Temperature line",
      instructions: [
        "Create a class with main that stores celsius as double.",
        "Compute fahrenheit and print both values.",
      ],
      hints: ["F = C * 9/5 + 32", "Use System.out.println"],
      expectedOutcome: "Printed celsius and fahrenheit numbers.",
      conceptIds: ["java-main", "java-primitives", "java-system-out"],
    }),
  ],
  assessmentSkills: defaultTopicSkills("java-syntax", [
    "java-main",
    "java-primitives",
    "java-variables",
    "java-strings",
    "java-final",
  ]),
});

const controlTopic = topic({
  id: "java-control-flow-and-methods",
  title: "Control Flow and Methods",
  aliases: ["java methods", "if else", "for loops java"],
  description: "Branch with if/else, iterate with for/while, and extract methods.",
  learningOrder: 2,
  prerequisiteIds: ["java-syntax-and-types"],
  relatedTopicIds: ["java-classes-and-objects"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "java-if-else", title: "if/else", description: "Conditional branching on boolean expressions." }),
    concept({ id: "java-for-loop", title: "for Loops", description: "Counted iteration with initializer, condition, and update." }),
    concept({ id: "java-while-loop", title: "while Loops", description: "Repeat while a condition remains true." }),
    concept({ id: "java-methods", title: "Methods", description: "Named reusable blocks with parameters and return types." }),
    concept({ id: "java-overloading", title: "Method Overloading", description: "Same method name with different parameter lists." }),
    concept({ id: "java-return", title: "return", description: "Exit a method and optionally provide a value." }),
  ],
  learningObjectives: [
    "Implement branching and loops",
    "Extract typed methods with overloads",
  ],
  practicalArtifacts: [
    artifact({
      id: "java-control-grade",
      type: "code",
      title: "Grade band helper",
      language: "java",
      content:
        'public class Grades {\n  static String band(int score) {\n    if (score >= 90) return "A";\n    if (score >= 80) return "B";\n    return "C";\n  }\n  public static void main(String[] args) {\n    for (int s : new int[]{95, 82, 70}) {\n      System.out.println(s + "->" + band(s));\n    }\n  }\n}',
      expectedOutput: "95->A\n82->B\n70->C",
      explanation: "if/else chain, method return, and enhanced for loop.",
      conceptIds: ["java-if-else", "java-methods", "java-for-loop", "java-return"],
    }),
  ],
  commonMistakes: [
    mistake(
      "java-control-off-by-one",
      "Off-by-one errors in for bounds",
      "Confusing < with <=",
      "Write the loop invariant and check endpoints.",
      ["java-for-loop"],
    ),
    mistake(
      "java-control-void-return",
      "Trying to return a value from a void method",
      "Mismatched signatures",
      "Match the declared return type.",
      ["java-methods", "java-return"],
    ),
  ],
  exercises: [
    exercise({
      id: "java-control-exercise",
      title: "Clamp method",
      instructions: [
        "Write int clamp(int n, int min, int max).",
        "Print clamp results for -5, 40, and 120 with min=0 max=100.",
      ],
      hints: ["Use Math.min/Math.max or if/else", "Keep main thin"],
      expectedOutcome: "Printed 0, 40, and 100.",
      conceptIds: ["java-methods", "java-if-else", "java-return"],
    }),
  ],
  assessmentSkills: defaultTopicSkills("java-control", [
    "java-if-else",
    "java-for-loop",
    "java-methods",
    "java-overloading",
    "java-return",
  ]),
});

const oopTopic = topic({
  id: "java-classes-and-objects",
  title: "Classes and Objects",
  aliases: ["java oop", "constructors", "fields"],
  description: "Model state with classes, constructors, fields, and instance methods.",
  learningOrder: 3,
  prerequisiteIds: ["java-control-flow-and-methods"],
  relatedTopicIds: ["java-collections-framework"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "java-class", title: "Classes", description: "Blueprints defining fields and methods." }),
    concept({ id: "java-object", title: "Objects", description: "Instances created with new." }),
    concept({ id: "java-constructor", title: "Constructors", description: "Special methods that initialize new instances." }),
    concept({ id: "java-fields", title: "Fields", description: "Per-instance (or static) state stored on a class." }),
    concept({ id: "java-this", title: "this Keyword", description: "Reference to the current instance." }),
    concept({ id: "java-encapsulation", title: "Encapsulation", description: "Hide fields behind accessors and invariants." }),
  ],
  learningObjectives: [
    "Define a class with constructor and methods",
    "Protect fields with encapsulation",
  ],
  practicalArtifacts: [
    artifact({
      id: "java-oop-counter",
      type: "code",
      title: "Counter class",
      language: "java",
      content:
        "public class Counter {\n  private int value;\n  public Counter(int start) { this.value = start; }\n  public void inc() { value++; }\n  public int getValue() { return value; }\n  public static void main(String[] args) {\n    Counter c = new Counter(0);\n    c.inc();\n    System.out.println(c.getValue());\n  }\n}",
      expectedOutput: "1",
      explanation: "Constructor, private field, this, and getter.",
      conceptIds: ["java-class", "java-constructor", "java-encapsulation", "java-this"],
    }),
  ],
  commonMistakes: [
    mistake(
      "java-oop-public-fields",
      "Exposing mutable fields publicly",
      "Skipping encapsulation",
      "Keep fields private; expose controlled methods.",
      ["java-encapsulation", "java-fields"],
    ),
    mistake(
      "java-oop-null-new",
      "Using an object before new",
      "Forgetting instantiation",
      "Assign with new before calling instance methods.",
      ["java-object", "java-constructor"],
    ),
  ],
  exercises: [
    exercise({
      id: "java-oop-exercise",
      title: "BankAccount",
      instructions: [
        "Create BankAccount with private balance.",
        "Add deposit/withdraw that reject negative amounts.",
        "Print balance after a deposit and withdraw.",
      ],
      hints: ["Validate in methods", "Use this.balance"],
      expectedOutcome: "Balance reflects valid operations only.",
      conceptIds: ["java-class", "java-encapsulation", "java-methods"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("java-oop", [
    "java-class",
    "java-object",
    "java-constructor",
    "java-fields",
    "java-encapsulation",
  ]),
});

const collectionsTopic = topic({
  id: "java-collections-framework",
  title: "Collections Framework",
  aliases: ["arraylist", "hashmap java", "java list"],
  description: "Use List and Map implementations for dynamic data.",
  learningOrder: 4,
  prerequisiteIds: ["java-classes-and-objects"],
  relatedTopicIds: ["java-exceptions-and-io"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "java-list", title: "List", description: "Ordered collection interface supporting index access." }),
    concept({ id: "java-arraylist", title: "ArrayList", description: "Resizable-array List implementation." }),
    concept({ id: "java-map", title: "Map", description: "Key-value association interface." }),
    concept({ id: "java-hashmap", title: "HashMap", description: "Hash table Map implementation." }),
    concept({ id: "java-generics-collections", title: "Generic Collections", description: "Parameterized types like List<String>." }),
    concept({ id: "java-foreach", title: "Enhanced for", description: "Iterate collections without manual indexes." }),
  ],
  learningObjectives: [
    "Store data in ArrayList and HashMap",
    "Iterate collections safely with generics",
  ],
  practicalArtifacts: [
    artifact({
      id: "java-collections-roster",
      type: "code",
      title: "Roster with HashMap counts",
      language: "java",
      content:
        'import java.util.*;\npublic class Roster {\n  public static void main(String[] args) {\n    List<String> names = new ArrayList<>(List.of("Ada", "Lin", "Ada"));\n    Map<String, Integer> counts = new HashMap<>();\n    for (String n : names) {\n      counts.put(n, counts.getOrDefault(n, 0) + 1);\n    }\n    System.out.println(counts.get("Ada"));\n  }\n}',
      expectedOutput: "2",
      explanation: "ArrayList iteration feeding a HashMap frequency count.",
      conceptIds: ["java-arraylist", "java-hashmap", "java-foreach", "java-generics-collections"],
    }),
  ],
  commonMistakes: [
    mistake(
      "java-coll-raw-type",
      "Using raw List/Map without type parameters",
      "Old examples omit generics",
      "Always parameterize collections.",
      ["java-generics-collections"],
    ),
    mistake(
      "java-coll-npe-get",
      "Calling methods on a null Map.get result",
      "Missing key handling",
      "Use containsKey/getOrDefault before use.",
      ["java-hashmap"],
    ),
  ],
  exercises: [
    exercise({
      id: "java-collections-exercise",
      title: "Unique tags",
      instructions: [
        "Given a List<String> of tags, print the count of unique tags.",
        "Also print tags sorted alphabetically.",
      ],
      hints: ["HashSet for uniqueness", "new ArrayList<>(set) then Collections.sort"],
      expectedOutcome: "Unique count and sorted tag list printed.",
      conceptIds: ["java-list", "java-arraylist", "java-foreach"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("java-collections", [
    "java-list",
    "java-arraylist",
    "java-map",
    "java-hashmap",
    "java-generics-collections",
  ]),
});

const exceptionsTopic = topic({
  id: "java-exceptions-and-io",
  title: "Exceptions and I/O Basics",
  aliases: ["java exceptions", "try catch", "java files"],
  description: "Handle failures with try/catch/finally and read simple text files.",
  learningOrder: 5,
  prerequisiteIds: ["java-control-flow-and-methods"],
  relatedTopicIds: ["java-interfaces-and-generics"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "java-try-catch", title: "try/catch", description: "Catch expected exceptions without crashing the process." }),
    concept({ id: "java-finally", title: "finally", description: "Block that runs after try/catch for cleanup." }),
    concept({ id: "java-checked", title: "Checked Exceptions", description: "Exceptions the compiler requires you to handle or declare." }),
    concept({ id: "java-throw", title: "throw", description: "Signal a failure by throwing an exception instance." }),
    concept({ id: "java-files-read", title: "Reading Files", description: "Load text with APIs such as Files.readString / BufferedReader." }),
    concept({ id: "java-try-with-resources", title: "try-with-resources", description: "Auto-close Closeable resources." }),
  ],
  learningObjectives: [
    "Catch and throw meaningful exceptions",
    "Read a text file with resource safety",
  ],
  practicalArtifacts: [
    artifact({
      id: "java-exceptions-parse",
      type: "code",
      title: "Safe int parse",
      language: "java",
      content:
        'public class Parse {\n  static int parseOrDefault(String raw, int fallback) {\n    try {\n      return Integer.parseInt(raw.trim());\n    } catch (NumberFormatException ex) {\n      return fallback;\n    }\n  }\n  public static void main(String[] args) {\n    System.out.println(parseOrDefault("42", 0));\n    System.out.println(parseOrDefault("x", 0));\n  }\n}',
      expectedOutput: "42\n0",
      explanation: "try/catch around Integer.parseInt with a fallback.",
      conceptIds: ["java-try-catch", "java-throw"],
    }),
  ],
  commonMistakes: [
    mistake(
      "java-ex-swallow",
      "Empty catch blocks that hide failures",
      "Only caring about compilation",
      "Log or return a safe fallback deliberately.",
      ["java-try-catch"],
    ),
    mistake(
      "java-ex-no-close",
      "Leaving readers/streams open",
      "Forgetting finally/close",
      "Use try-with-resources.",
      ["java-try-with-resources", "java-files-read"],
    ),
  ],
  exercises: [
    exercise({
      id: "java-exceptions-exercise",
      title: "Line counter",
      instructions: [
        "Read a UTF-8 text file and count non-empty lines.",
        "If the file is missing, print a clear error and exit nonzero.",
      ],
      hints: ["Files.readAllLines", "Catch IOException"],
      expectedOutcome: "Printed line count or a missing-file error.",
      conceptIds: ["java-files-read", "java-try-catch", "java-checked"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "java-exceptions",
    ["java-try-catch", "java-finally", "java-checked", "java-files-read", "java-try-with-resources"],
    ["concept-understanding", "debugging", "code-interpretation", "practical-scenario", "expected-output"],
  ),
});

const interfacesTopic = topic({
  id: "java-interfaces-and-generics",
  title: "Interfaces and Generics",
  aliases: ["java interfaces", "implements", "generic methods"],
  description: "Define contracts with interfaces and reuse logic with generics.",
  learningOrder: 6,
  prerequisiteIds: ["java-classes-and-objects", "java-collections-framework"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "java-interface", title: "Interfaces", description: "Contracts of abstract methods (and defaults) classes can implement." }),
    concept({ id: "java-implements", title: "implements", description: "Keyword indicating a class fulfills an interface." }),
    concept({ id: "java-polymorphism", title: "Polymorphism", description: "Call interface methods on different implementations." }),
    concept({ id: "java-generic-class", title: "Generic Classes", description: "Type parameters on class declarations, e.g. Box<T>." }),
    concept({ id: "java-generic-method", title: "Generic Methods", description: "Methods with their own type parameters." }),
    concept({ id: "java-bounded-type", title: "Bounded Type Parameters", description: "Restrict type parameters with extends." }),
  ],
  learningObjectives: [
    "Implement an interface with two classes",
    "Write a small generic helper type",
  ],
  practicalArtifacts: [
    artifact({
      id: "java-interfaces-notifier",
      type: "code",
      title: "Notifier interface",
      language: "java",
      content:
        'interface Notifier { void send(String msg); }\nclass ConsoleNotifier implements Notifier {\n  public void send(String msg) { System.out.println("MSG:" + msg); }\n}\npublic class Demo {\n  static <T> void printBox(T value) { System.out.println(value); }\n  public static void main(String[] args) {\n    Notifier n = new ConsoleNotifier();\n    n.send("ready");\n    printBox(42);\n  }\n}',
      expectedOutput: "MSG:ready\n42",
      explanation: "Interface implementation plus a generic method.",
      conceptIds: ["java-interface", "java-implements", "java-polymorphism", "java-generic-method"],
    }),
  ],
  commonMistakes: [
    mistake(
      "java-iface-partial",
      "Leaving interface methods unimplemented",
      "Forgetting a method after signature changes",
      "Implement every abstract method or mark the class abstract.",
      ["java-implements", "java-interface"],
    ),
    mistake(
      "java-generic-erase-cast",
      "Unnecessary casts that defeat generics",
      "Working around raw types",
      "Keep type parameters consistent end-to-end.",
      ["java-generic-class"],
    ),
  ],
  exercises: [
    exercise({
      id: "java-interfaces-exercise",
      title: "PaymentMethod interface",
      instructions: [
        "Define PaymentMethod with pay(double amount).",
        "Implement CardPayment and CashPayment with different printouts.",
        "Write a generic Box<T> holding one value with get().",
      ],
      hints: ["Program to the interface type", "Box stores private T value"],
      expectedOutcome: "Both payments print distinct lines; Box returns stored value.",
      conceptIds: ["java-interface", "java-polymorphism", "java-generic-class"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "java-interfaces",
    ["java-interface", "java-implements", "java-polymorphism", "java-generic-class", "java-bounded-type"],
    ["concept-understanding", "code-interpretation", "architecture-reasoning", "debugging", "practical-scenario"],
  ),
});

export const javaKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-java",
  title: "Java",
  aliases: ["java", "learn java", "java programming", "java developer"],
  category: "Programming",
  description:
    "Starter Java curriculum covering syntax/types, control flow/methods, OOP, collections, exceptions/I/O, and interfaces/generics.",
  topics: [syntaxTopic, controlTopic, oopTopic, collectionsTopic, exceptionsTopic, interfacesTopic],
});
