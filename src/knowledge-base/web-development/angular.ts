import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws","vpc","kubernetes pod","sql join","python class","vue composition"];

const angular_componentsTopic = topic({
  id: "angular-components",
  title: "Components and Modules",
  aliases: ["angular components","ng component"],
  description: "Create components with selectors, templates, and styles.",
  learningOrder: 1,
  
  relatedTopicIds: ["angular-templates-and-binding"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "angular-component",
      title: "@Component",
      description: "@Component applied in this topic.",
    }),
    concept({
      id: "angular-selectors",
      title: "Selectors",
      description: "Selectors applied in this topic.",
    }),
    concept({
      id: "angular-templates",
      title: "Templates",
      description: "Templates applied in this topic.",
    }),
    concept({
      id: "angular-styles",
      title: "Styles",
      description: "Styles applied in this topic.",
    }),
    concept({
      id: "angular-standalone-components",
      title: "Standalone Components",
      description: "Standalone Components applied in this topic.",
    }),
    concept({
      id: "angular-component-inputs-intro",
      title: "Component Inputs Intro",
      description: "Component Inputs Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply @Component correctly","Explain Selectors in context"],
  practicalArtifacts: [
    artifact({
      id: "angular-components-artifact",
      type: "code",
      title: "Components and Modules worked example",
      
      content: "// Practical example for Components and Modules\n// Covers: @Component, Selectors, Templates",
      
      explanation: "Demonstrates @Component, Selectors, Templates.",
      conceptIds: ["angular-component","angular-selectors","angular-templates","angular-styles"],
    }),
  ],
  commonMistakes: [
    mistake(
      "angular-components-mistake-1",
      "Misapplying @Component",
      "Skipping hands-on checks in Components and Modules",
      "Practice @Component with a tiny example first.",
      ["angular-component"],
    ),
    mistake(
      "angular-components-mistake-2",
      "Pulling unrelated-domain demos into Components and Modules",
      "Defaulting to out-of-domain snippets",
      "Stay inside Components and Modules concepts.",
      ["angular-selectors"],
    ),
  ],
  exercises: [
    exercise({
      id: "angular-components-exercise",
      title: "Components and Modules mini exercise",
      instructions: ["Build a small example covering @Component.","Extend it with Selectors.","Verify behavior related to Templates."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Components and Modules.",
      conceptIds: ["angular-component","angular-selectors","angular-templates"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("angular-components", ["angular-component","angular-selectors","angular-templates","angular-styles","angular-standalone-components"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const angular_templates_and_bindingTopic = topic({
  id: "angular-templates-and-binding",
  title: "Templates and Data Binding",
  aliases: ["angular binding","ngif ngfor"],
  description: "Bind data with interpolation, property, event, and two-way binding.",
  learningOrder: 2,
  prerequisiteIds: ["angular-components"],
  relatedTopicIds: ["angular-services-and-di"],
  
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "angular-interpolation",
      title: "Interpolation",
      description: "Interpolation applied in this topic.",
    }),
    concept({
      id: "angular-property-binding",
      title: "Property Binding",
      description: "Property Binding applied in this topic.",
    }),
    concept({
      id: "angular-event-binding",
      title: "Event Binding",
      description: "Event Binding applied in this topic.",
    }),
    concept({
      id: "angular-two-way-binding",
      title: "Two-Way Binding",
      description: "Two-Way Binding applied in this topic.",
    }),
    concept({
      id: "angular-ngif-ngfor",
      title: "*ngIf/*ngFor",
      description: "*ngIf/*ngFor applied in this topic.",
    }),
    concept({
      id: "angular-pipes-intro",
      title: "Pipes Intro",
      description: "Pipes Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Interpolation correctly","Explain Property Binding in context"],
  practicalArtifacts: [
    artifact({
      id: "angular-templates-and-binding-artifact",
      type: "code",
      title: "Templates and Data Binding worked example",
      
      content: "// Practical example for Templates and Data Binding\n// Covers: Interpolation, Property Binding, Event Binding",
      
      explanation: "Demonstrates Interpolation, Property Binding, Event Binding.",
      conceptIds: ["angular-interpolation","angular-property-binding","angular-event-binding","angular-two-way-binding"],
    }),
  ],
  commonMistakes: [
    mistake(
      "angular-templates-and-binding-mistake-1",
      "Misapplying Interpolation",
      "Skipping hands-on checks in Templates and Data Binding",
      "Practice Interpolation with a tiny example first.",
      ["angular-interpolation"],
    ),
    mistake(
      "angular-templates-and-binding-mistake-2",
      "Pulling unrelated-domain demos into Templates and Data Binding",
      "Defaulting to out-of-domain snippets",
      "Stay inside Templates and Data Binding concepts.",
      ["angular-property-binding"],
    ),
  ],
  exercises: [
    exercise({
      id: "angular-templates-and-binding-exercise",
      title: "Templates and Data Binding mini exercise",
      instructions: ["Build a small example covering Interpolation.","Extend it with Property Binding.","Verify behavior related to Event Binding."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Templates and Data Binding.",
      conceptIds: ["angular-interpolation","angular-property-binding","angular-event-binding"],
      
    }),
  ],
  assessmentSkills: defaultTopicSkills("angular-templates-and-binding", ["angular-interpolation","angular-property-binding","angular-event-binding","angular-two-way-binding","angular-ngif-ngfor"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const angular_services_and_diTopic = topic({
  id: "angular-services-and-di",
  title: "Services and Dependency Injection",
  aliases: ["angular services","dependency injection"],
  description: "Share logic with injectable services and constructor DI.",
  learningOrder: 3,
  prerequisiteIds: ["angular-templates-and-binding"],
  relatedTopicIds: ["angular-routing"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "angular-injectable",
      title: "@Injectable",
      description: "@Injectable applied in this topic.",
    }),
    concept({
      id: "angular-providedin-root",
      title: "providedIn root",
      description: "providedIn root applied in this topic.",
    }),
    concept({
      id: "angular-constructor-injection",
      title: "Constructor Injection",
      description: "Constructor Injection applied in this topic.",
    }),
    concept({
      id: "angular-service-state",
      title: "Service State",
      description: "Service State applied in this topic.",
    }),
    concept({
      id: "angular-interface-contracts",
      title: "Interface Contracts",
      description: "Interface Contracts applied in this topic.",
    }),
    concept({
      id: "angular-tree-shakeable-providers",
      title: "Tree-Shakeable Providers",
      description: "Tree-Shakeable Providers applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply @Injectable correctly","Explain providedIn root in context"],
  practicalArtifacts: [
    artifact({
      id: "angular-services-and-di-artifact",
      type: "code",
      title: "Services and Dependency Injection worked example",
      
      content: "// Practical example for Services and Dependency Injection\n// Covers: @Injectable, providedIn root, Constructor Injection",
      
      explanation: "Demonstrates @Injectable, providedIn root, Constructor Injection.",
      conceptIds: ["angular-injectable","angular-providedin-root","angular-constructor-injection","angular-service-state"],
    }),
  ],
  commonMistakes: [
    mistake(
      "angular-services-and-di-mistake-1",
      "Misapplying @Injectable",
      "Skipping hands-on checks in Services and Dependency Injection",
      "Practice @Injectable with a tiny example first.",
      ["angular-injectable"],
    ),
    mistake(
      "angular-services-and-di-mistake-2",
      "Pulling unrelated-domain demos into Services and Dependency Injection",
      "Defaulting to out-of-domain snippets",
      "Stay inside Services and Dependency Injection concepts.",
      ["angular-providedin-root"],
    ),
  ],
  exercises: [
    exercise({
      id: "angular-services-and-di-exercise",
      title: "Services and Dependency Injection mini exercise",
      instructions: ["Build a small example covering @Injectable.","Extend it with providedIn root.","Verify behavior related to Constructor Injection."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Services and Dependency Injection.",
      conceptIds: ["angular-injectable","angular-providedin-root","angular-constructor-injection"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("angular-services-and-di", ["angular-injectable","angular-providedin-root","angular-constructor-injection","angular-service-state","angular-interface-contracts"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const angular_routingTopic = topic({
  id: "angular-routing",
  title: "Routing",
  aliases: ["angular router","routing"],
  description: "Navigate views with the Angular Router and route params.",
  learningOrder: 4,
  prerequisiteIds: ["angular-services-and-di"],
  relatedTopicIds: ["angular-forms"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "angular-routermodule",
      title: "RouterModule",
      description: "RouterModule applied in this topic.",
    }),
    concept({
      id: "angular-routes-config",
      title: "Routes Config",
      description: "Routes Config applied in this topic.",
    }),
    concept({
      id: "angular-routerlink",
      title: "routerLink",
      description: "routerLink applied in this topic.",
    }),
    concept({
      id: "angular-router-outlet",
      title: "router-outlet",
      description: "router-outlet applied in this topic.",
    }),
    concept({
      id: "angular-route-params",
      title: "Route Params",
      description: "Route Params applied in this topic.",
    }),
    concept({
      id: "angular-lazy-loading-intro",
      title: "Lazy Loading Intro",
      description: "Lazy Loading Intro applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply RouterModule correctly","Explain Routes Config in context"],
  practicalArtifacts: [
    artifact({
      id: "angular-routing-artifact",
      type: "code",
      title: "Routing worked example",
      
      content: "// Practical example for Routing\n// Covers: RouterModule, Routes Config, routerLink",
      
      explanation: "Demonstrates RouterModule, Routes Config, routerLink.",
      conceptIds: ["angular-routermodule","angular-routes-config","angular-routerlink","angular-router-outlet"],
    }),
  ],
  commonMistakes: [
    mistake(
      "angular-routing-mistake-1",
      "Misapplying RouterModule",
      "Skipping hands-on checks in Routing",
      "Practice RouterModule with a tiny example first.",
      ["angular-routermodule"],
    ),
    mistake(
      "angular-routing-mistake-2",
      "Pulling unrelated-domain demos into Routing",
      "Defaulting to out-of-domain snippets",
      "Stay inside Routing concepts.",
      ["angular-routes-config"],
    ),
  ],
  exercises: [
    exercise({
      id: "angular-routing-exercise",
      title: "Routing mini exercise",
      instructions: ["Build a small example covering RouterModule.","Extend it with Routes Config.","Verify behavior related to routerLink."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Routing.",
      conceptIds: ["angular-routermodule","angular-routes-config","angular-routerlink"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("angular-routing", ["angular-routermodule","angular-routes-config","angular-routerlink","angular-router-outlet","angular-route-params"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const angular_formsTopic = topic({
  id: "angular-forms",
  title: "Reactive and Template Forms",
  aliases: ["angular forms","formcontrol"],
  description: "Capture input with template-driven and reactive forms.",
  learningOrder: 5,
  prerequisiteIds: ["angular-routing"],
  relatedTopicIds: ["angular-httpclient"],
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "angular-template-driven-forms",
      title: "Template-Driven Forms",
      description: "Template-Driven Forms applied in this topic.",
    }),
    concept({
      id: "angular-reactive-forms",
      title: "Reactive Forms",
      description: "Reactive Forms applied in this topic.",
    }),
    concept({
      id: "angular-formcontrol",
      title: "FormControl",
      description: "FormControl applied in this topic.",
    }),
    concept({
      id: "angular-formgroup",
      title: "FormGroup",
      description: "FormGroup applied in this topic.",
    }),
    concept({
      id: "angular-validators",
      title: "Validators",
      description: "Validators applied in this topic.",
    }),
    concept({
      id: "angular-form-submission",
      title: "Form Submission",
      description: "Form Submission applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply Template-Driven Forms correctly","Explain Reactive Forms in context"],
  practicalArtifacts: [
    artifact({
      id: "angular-forms-artifact",
      type: "code",
      title: "Reactive and Template Forms worked example",
      
      content: "// Practical example for Reactive and Template Forms\n// Covers: Template-Driven Forms, Reactive Forms, FormControl",
      
      explanation: "Demonstrates Template-Driven Forms, Reactive Forms, FormControl.",
      conceptIds: ["angular-template-driven-forms","angular-reactive-forms","angular-formcontrol","angular-formgroup"],
    }),
  ],
  commonMistakes: [
    mistake(
      "angular-forms-mistake-1",
      "Misapplying Template-Driven Forms",
      "Skipping hands-on checks in Reactive and Template Forms",
      "Practice Template-Driven Forms with a tiny example first.",
      ["angular-template-driven-forms"],
    ),
    mistake(
      "angular-forms-mistake-2",
      "Pulling unrelated-domain demos into Reactive and Template Forms",
      "Defaulting to out-of-domain snippets",
      "Stay inside Reactive and Template Forms concepts.",
      ["angular-reactive-forms"],
    ),
  ],
  exercises: [
    exercise({
      id: "angular-forms-exercise",
      title: "Reactive and Template Forms mini exercise",
      instructions: ["Build a small example covering Template-Driven Forms.","Extend it with Reactive Forms.","Verify behavior related to FormControl."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for Reactive and Template Forms.",
      conceptIds: ["angular-template-driven-forms","angular-reactive-forms","angular-formcontrol"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("angular-forms", ["angular-template-driven-forms","angular-reactive-forms","angular-formcontrol","angular-formgroup","angular-validators"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

const angular_httpclientTopic = topic({
  id: "angular-httpclient",
  title: "HttpClient and Async Data",
  aliases: ["angular http","httpclient"],
  description: "Call APIs with HttpClient and consume Observables in components.",
  learningOrder: 6,
  prerequisiteIds: ["angular-forms"],
  
  difficulty: "intermediate",
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({
      id: "angular-httpclient",
      title: "HttpClient",
      description: "HttpClient applied in this topic.",
    }),
    concept({
      id: "angular-get-requests",
      title: "GET Requests",
      description: "GET Requests applied in this topic.",
    }),
    concept({
      id: "angular-post-requests",
      title: "POST Requests",
      description: "POST Requests applied in this topic.",
    }),
    concept({
      id: "angular-observables",
      title: "Observables",
      description: "Observables applied in this topic.",
    }),
    concept({
      id: "angular-async-pipe",
      title: "async Pipe",
      description: "async Pipe applied in this topic.",
    }),
    concept({
      id: "angular-error-handling",
      title: "Error Handling",
      description: "Error Handling applied in this topic.",
    }),
  ],
  learningObjectives: ["Apply HttpClient correctly","Explain GET Requests in context"],
  practicalArtifacts: [
    artifact({
      id: "angular-httpclient-artifact",
      type: "code",
      title: "HttpClient and Async Data worked example",
      
      content: "// Practical example for HttpClient and Async Data\n// Covers: HttpClient, GET Requests, POST Requests",
      
      explanation: "Demonstrates HttpClient, GET Requests, POST Requests.",
      conceptIds: ["angular-httpclient","angular-get-requests","angular-post-requests","angular-observables"],
    }),
  ],
  commonMistakes: [
    mistake(
      "angular-httpclient-mistake-1",
      "Misapplying HttpClient",
      "Skipping hands-on checks in HttpClient and Async Data",
      "Practice HttpClient with a tiny example first.",
      ["angular-httpclient"],
    ),
    mistake(
      "angular-httpclient-mistake-2",
      "Pulling unrelated-domain demos into HttpClient and Async Data",
      "Defaulting to out-of-domain snippets",
      "Stay inside HttpClient and Async Data concepts.",
      ["angular-get-requests"],
    ),
  ],
  exercises: [
    exercise({
      id: "angular-httpclient-exercise",
      title: "HttpClient and Async Data mini exercise",
      instructions: ["Build a small example covering HttpClient.","Extend it with GET Requests.","Verify behavior related to POST Requests."],
      hints: ["Keep scope tiny","Stay in-domain"],
      expectedOutcome: "A working micro-example for HttpClient and Async Data.",
      conceptIds: ["angular-httpclient","angular-get-requests","angular-post-requests"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("angular-httpclient", ["angular-httpclient","angular-get-requests","angular-post-requests","angular-observables","angular-async-pipe"],
    ["concept-understanding","code-interpretation","debugging","expected-output","practical-scenario"]),
});

export const angularKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-angular",
  title: "Angular",
  aliases: ["angular","learn angular","angular framework","angularjs spa"],
  category: "Web Development",
  description: "Angular starter curriculum covering components, templates, services/DI, routing, forms, and HttpClient.",
  topics: [angular_componentsTopic, angular_templates_and_bindingTopic, angular_services_and_diTopic, angular_routingTopic, angular_formsTopic, angular_httpclientTopic],
});
