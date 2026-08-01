import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const t1 = topic({
  id: "k8s-cluster-architecture",
  title: "Kubernetes Cluster Architecture",
  aliases: ["cluster architecture", "control plane", "kube architecture"],
  description: "Map control plane and node components that make a cluster work.",
  difficulty: "beginner",
  learningOrder: 1,
  prerequisiteIds: [],
  relatedTopicIds: [],
  contaminationTerms: ["react hooks", "jsx", "python class", "vpc subnet"],
  concepts: [
    concept({ id: "k8s-control-plane", title: "Control Plane", description: "API server, scheduler, controller manager, and etcd." }),
    concept({ id: "k8s-nodes", title: "Worker Nodes", description: "Machines that run kubelet and workloads." }),
    concept({ id: "k8s-kubelet", title: "Kubelet", description: "Node agent that runs pods assigned to the node." }),
    concept({ id: "k8s-api-server", title: "API Server", description: "Front door for cluster state and clients." }),
    concept({ id: "k8s-etcd", title: "etcd", description: "Consistent key-value store for cluster state." }),
    concept({ id: "k8s-scheduler", title: "Scheduler", description: "Assigns pending pods to suitable nodes." })
  ],
  learningObjectives: ["Identify control-plane vs node components", "Explain how a pod gets scheduled"],
  practicalArtifacts: [
    artifact({
      id: "k8s-arch-diagram",
      type: "diagram",
      title: "Cluster component map",
      
      content: "kubectl/API clients -> kube-apiserver -> etcd\n                   |-> scheduler / controllers\nworker: kubelet -> pod runtimes",
      
      explanation: "Shows request flow into the API server and out to nodes.",
      conceptIds: ["k8s-control-plane", "k8s-api-server", "k8s-nodes", "k8s-kubelet"],
    }),
  ],
  commonMistakes: [
    mistake("k8s-arch-master-only", "Thinking apps run on the control plane by default", "Tutorial clusters blur roles", "Schedule workloads to worker nodes.", ["k8s-nodes", "k8s-scheduler"]),
    mistake("k8s-arch-etcd-ignore", "Ignoring etcd as critical state", "Focusing only on kubelet", "Protect etcd backups and access.", ["k8s-etcd"])
  ],
  exercises: [
    exercise({
      id: "k8s-arch-exercise",
      title: "Label the data path",
      instructions: ["Trace a kubectl apply from client to etcd and then to kubelet.", "List which component validates the object."],
      hints: ["API server admits objects", "Controllers/scheduler act after persistence"],
      expectedOutcome: "Correct ordered path across components.",
      conceptIds: ["k8s-api-server", "k8s-etcd", "k8s-scheduler", "k8s-kubelet"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("k8s-cluster-architecture", [
    "k8s-control-plane", "k8s-nodes", "k8s-kubelet", "k8s-api-server", "k8s-etcd"
  ], ["concept-understanding", "architecture-reasoning", "configuration-analysis", "practical-scenario", "debugging"]),
});


const t2 = topic({
  id: "k8s-pods-and-workloads",
  title: "Pods and Workloads",
  aliases: ["pods", "workloads", "containers in k8s"],
  description: "Run containers in pods and understand pod lifecycle basics.",
  difficulty: "beginner",
  learningOrder: 2,
  prerequisiteIds: ["k8s-cluster-architecture"],
  relatedTopicIds: [],
  contaminationTerms: ["aws vpc", "react", "sql join"],
  concepts: [
    concept({ id: "k8s-pod", title: "Pod", description: "Smallest deployable unit that hosts one or more containers." }),
    concept({ id: "k8s-container-spec", title: "Container Spec", description: "Image, command, ports, and resources for a container." }),
    concept({ id: "k8s-pod-lifecycle", title: "Pod Lifecycle", description: "Pending, Running, Succeeded, Failed, Unknown." }),
    concept({ id: "k8s-labels-selectors", title: "Labels and Selectors", description: "Identify and group objects." }),
    concept({ id: "k8s-probes", title: "Probes", description: "Liveness and readiness checks for containers." }),
    concept({ id: "k8s-resource-requests", title: "Requests and Limits", description: "CPU/memory declarations that affect scheduling and eviction." })
  ],
  learningObjectives: ["Write a basic pod/container spec", "Use labels and resource requests"],
  practicalArtifacts: [
    artifact({
      id: "k8s-pod-yaml",
      type: "configuration",
      title: "Nginx pod manifest",
      language: "yaml",
      content: "apiVersion: v1\nkind: Pod\nmetadata:\n  name: web\n  labels:\n    app: web\nspec:\n  containers:\n    - name: nginx\n      image: nginx:1.25\n      ports:\n        - containerPort: 80\n      resources:\n        requests:\n          cpu: 100m\n          memory: 128Mi",
      expectedOutput: "Pod object accepted and scheduled when cluster has capacity",
      explanation: "Minimal pod with labels, port, and requests.",
      conceptIds: ["k8s-pod", "k8s-container-spec", "k8s-labels-selectors", "k8s-resource-requests"],
    }),
  ],
  commonMistakes: [
    mistake("k8s-pod-latest", "Using image:latest in production pods", "Convenience tagging", "Pin versions for rollbacks and reproducibility.", ["k8s-container-spec"]),
    mistake("k8s-pod-no-requests", "Omitting resource requests", "Surprise evictions and poor packing", "Set realistic requests/limits.", ["k8s-resource-requests"])
  ],
  exercises: [
    exercise({
      id: "k8s-pod-exercise",
      title: "Labeled busybox pod",
      instructions: ["Create a pod running busybox that sleeps.", "Add app=demo label and memory request."],
      hints: ["command: ['sleep', '3600']", "resources.requests.memory"],
      expectedOutcome: "Pod YAML with label and request that applies cleanly.",
      conceptIds: ["k8s-pod", "k8s-labels-selectors", "k8s-resource-requests"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("k8s-pods-and-workloads", [
    "k8s-pod", "k8s-container-spec", "k8s-pod-lifecycle", "k8s-labels-selectors", "k8s-probes"
  ], ["concept-understanding", "configuration-analysis", "debugging", "practical-scenario", "expected-output"]),
});


const t3 = topic({
  id: "k8s-deployments",
  title: "Deployments",
  aliases: ["deployment", "replica sets", "rollouts"],
  description: "Manage replicated pods with Declarative Deployments and rollouts.",
  difficulty: "beginner",
  learningOrder: 3,
  prerequisiteIds: ["k8s-pods-and-workloads"],
  relatedTopicIds: [],
  contaminationTerms: ["aws", "react hooks"],
  concepts: [
    concept({ id: "k8s-deployment", title: "Deployment", description: "Declarative controller for replicated pods." }),
    concept({ id: "k8s-replicaset", title: "ReplicaSet", description: "Maintains a stable set of pod replicas." }),
    concept({ id: "k8s-rollout", title: "Rollouts", description: "Update pods gradually to a new revision." }),
    concept({ id: "k8s-rollback", title: "Rollback", description: "Revert to a previous Deployment revision." }),
    concept({ id: "k8s-strategy", title: "Rolling Update Strategy", description: "maxUnavailable / maxSurge control surge behavior." }),
    concept({ id: "k8s-declarative-apply", title: "Declarative Apply", description: "Desired state lives in manifests applied repeatedly." })
  ],
  learningObjectives: ["Create a Deployment", "Roll out and roll back a revision"],
  practicalArtifacts: [
    artifact({
      id: "k8s-deploy-yaml",
      type: "configuration",
      title: "Web Deployment",
      language: "yaml",
      content: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: nginx\n          image: nginx:1.25",
      expectedOutput: "Three pods managed by the Deployment/ReplicaSet",
      explanation: "Replicas, selector, and pod template alignment.",
      conceptIds: ["k8s-deployment", "k8s-replicaset", "k8s-declarative-apply"],
    }),
  ],
  commonMistakes: [
    mistake("k8s-deploy-selector-mismatch", "Pod template labels not matching selector", "Typo in labels", "Keep selector and template labels aligned.", ["k8s-deployment"]),
    mistake("k8s-deploy-edit-live-only", "Only editing live objects with kubectl edit", "Lost desired state", "Keep manifests in source control and apply.", ["k8s-declarative-apply"])
  ],
  exercises: [
    exercise({
      id: "k8s-deploy-exercise",
      title: "Roll out a new image",
      instructions: ["Start with a 2-replica Deployment.", "Update the image and verify rollout status, then roll back."],
      hints: ["kubectl rollout status", "kubectl rollout undo"],
      expectedOutcome: "Successful rollout and rollback demonstration.",
      conceptIds: ["k8s-rollout", "k8s-rollback", "k8s-deployment"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("k8s-deployments", [
    "k8s-deployment", "k8s-replicaset", "k8s-rollout", "k8s-rollback", "k8s-strategy"
  ], ["concept-understanding", "configuration-analysis", "debugging", "practical-scenario", "expected-output"]),
});


const t4 = topic({
  id: "k8s-services-and-networking",
  title: "Services and Networking",
  aliases: ["services", "clusterip", "kube networking"],
  description: "Expose pods stably with Services and understand ClusterIP basics.",
  difficulty: "beginner",
  learningOrder: 4,
  prerequisiteIds: ["k8s-deployments"],
  relatedTopicIds: [],
  contaminationTerms: ["aws vpc", "react", "python"],
  concepts: [
    concept({ id: "k8s-service", title: "Service", description: "Stable virtual IP and DNS name for a set of pods." }),
    concept({ id: "k8s-clusterip", title: "ClusterIP", description: "Internal service reachable inside the cluster." }),
    concept({ id: "k8s-service-selectors", title: "Service Selectors", description: "Bind services to pods via labels." }),
    concept({ id: "k8s-endpoints", title: "Endpoints", description: "Resolved pod IPs backing a service." }),
    concept({ id: "k8s-dns", title: "Cluster DNS", description: "Resolve service names within namespaces." }),
    concept({ id: "k8s-north-south", title: "North-South Access Patterns", description: "NodePort/LoadBalancer/Ingress expose outside traffic." })
  ],
  learningObjectives: ["Create a ClusterIP Service", "Explain selector-to-endpoints binding"],
  practicalArtifacts: [
    artifact({
      id: "k8s-service-yaml",
      type: "configuration",
      title: "ClusterIP Service",
      language: "yaml",
      content: "apiVersion: v1\nkind: Service\nmetadata:\n  name: web\nspec:\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 80",
      expectedOutput: "Service routes to pods labeled app=web",
      explanation: "Selector binds Service to Deployment pods.",
      conceptIds: ["k8s-service", "k8s-clusterip", "k8s-service-selectors"],
    }),
  ],
  commonMistakes: [
    mistake("k8s-svc-selector-typo", "Service selector not matching pod labels", "Silent empty endpoints", "Verify kubectl get endpoints.", ["k8s-service-selectors", "k8s-endpoints"]),
    mistake("k8s-svc-targetport", "Confusing Service port and container port", "Misaligned targetPort", "Set targetPort to the containerPort.", ["k8s-service"])
  ],
  exercises: [
    exercise({
      id: "k8s-svc-exercise",
      title: "Expose the web Deployment",
      instructions: ["Create a ClusterIP Service for app=web.", "Curl the service DNS from a debug pod."],
      hints: ["web.default.svc.cluster.local", "Check endpoints first"],
      expectedOutcome: "Successful in-cluster HTTP response via Service DNS.",
      conceptIds: ["k8s-service", "k8s-dns", "k8s-endpoints"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("k8s-services-and-networking", [
    "k8s-service", "k8s-clusterip", "k8s-service-selectors", "k8s-endpoints", "k8s-dns"
  ], ["concept-understanding", "configuration-analysis", "debugging", "practical-scenario", "architecture-reasoning"]),
});


const t5 = topic({
  id: "k8s-configmaps-and-secrets",
  title: "ConfigMaps and Secrets",
  aliases: ["configmaps", "secrets", "configuration data"],
  description: "Inject configuration and sensitive values into pods.",
  difficulty: "beginner",
  learningOrder: 5,
  prerequisiteIds: ["k8s-services-and-networking"],
  relatedTopicIds: [],
  contaminationTerms: ["react hooks", "sql window"],
  concepts: [
    concept({ id: "k8s-configmap", title: "ConfigMap", description: "Store non-sensitive configuration as keys." }),
    concept({ id: "k8s-secret", title: "Secret", description: "Store sensitive data with access controls." }),
    concept({ id: "k8s-envfrom", title: "envFrom / valueFrom", description: "Inject keys as environment variables." }),
    concept({ id: "k8s-volume-mount-config", title: "Config Volumes", description: "Mount config/secret keys as files." }),
    concept({ id: "k8s-secret-hygiene", title: "Secret Hygiene", description: "Limit RBAC access and avoid logging secrets." }),
    concept({ id: "k8s-immutable-config", title: "Immutable Config", description: "Lock ConfigMaps/Secrets to prevent accidental edits." })
  ],
  learningObjectives: ["Mount ConfigMaps and Secrets", "Choose env vs file injection"],
  practicalArtifacts: [
    artifact({
      id: "k8s-config-env",
      type: "configuration",
      title: "ConfigMap env injection",
      language: "yaml",
      content: "envFrom:\n  - configMapRef:\n      name: web-config",
      expectedOutput: "Container receives keys from web-config as env vars",
      explanation: "envFrom injects all ConfigMap keys.",
      conceptIds: ["k8s-configmap", "k8s-envfrom"],
    }),
  ],
  commonMistakes: [
    mistake("k8s-secret-in-image", "Baking secrets into container images", "Convenience for demos", "Inject at runtime via Secret objects.", ["k8s-secret", "k8s-secret-hygiene"]),
    mistake("k8s-config-edit-live", "Editing a mounted ConfigMap and expecting instant restarts", "Assuming auto reload", "Redeploy or use an app that watches files.", ["k8s-volume-mount-config"])
  ],
  exercises: [
    exercise({
      id: "k8s-config-exercise",
      title: "App config + DB password",
      instructions: ["Create a ConfigMap for APP_MODE and a Secret for DB_PASSWORD.", "Inject both into a Deployment."],
      hints: ["valueFrom.secretKeyRef", "Do not echo secrets"],
      expectedOutcome: "Pod env contains config and secret keys without plaintext in the image.",
      conceptIds: ["k8s-configmap", "k8s-secret", "k8s-envfrom", "k8s-secret-hygiene"],
      difficulty: "beginner",
    }),
  ],
  assessmentSkills: defaultTopicSkills("k8s-configmaps-and-secrets", [
    "k8s-configmap", "k8s-secret", "k8s-envfrom", "k8s-volume-mount-config", "k8s-secret-hygiene"
  ], ["concept-understanding", "configuration-analysis", "debugging", "practical-scenario", "architecture-reasoning"]),
});


const t6 = topic({
  id: "k8s-rbac-and-pod-security",
  title: "RBAC and Pod Security",
  aliases: ["rbac", "service accounts", "pod security"],
  description: "Authorize API access and harden pod security posture.",
  difficulty: "intermediate",
  learningOrder: 6,
  prerequisiteIds: ["k8s-configmaps-and-secrets"],
  relatedTopicIds: [],
  contaminationTerms: ["aws iam user tutorial", "react", "python oop"],
  concepts: [
    concept({ id: "k8s-service-account", title: "ServiceAccount", description: "Identity for in-cluster processes." }),
    concept({ id: "k8s-role-binding", title: "Roles and Bindings", description: "Grant verbs on resources within a scope." }),
    concept({ id: "k8s-least-privilege", title: "Least Privilege", description: "Grant only required API permissions." }),
    concept({ id: "k8s-pod-security", title: "Pod Security", description: "Restrict privileged containers and host access." }),
    concept({ id: "k8s-security-context", title: "Security Context", description: "RunAsNonRoot, readOnlyRootFilesystem, and capabilities." }),
    concept({ id: "k8s-audit-mindset", title: "Audit Mindset", description: "Review who can read secrets and escalate." })
  ],
  learningObjectives: ["Bind a ServiceAccount with minimal RBAC", "Apply a basic securityContext"],
  practicalArtifacts: [
    artifact({
      id: "k8s-rbac-role",
      type: "configuration",
      title: "Read-only RoleBinding sketch",
      language: "yaml",
      content: "kind: Role\nrules:\n  - apiGroups: ['']\n    resources: ['configmaps']\n    verbs: ['get', 'list']",
      expectedOutput: "Identity can read ConfigMaps only",
      explanation: "Least-privilege Role focused on ConfigMaps.",
      conceptIds: ["k8s-role-binding", "k8s-least-privilege"],
    }),
  ],
  commonMistakes: [
    mistake("k8s-rbac-cluster-admin", "Binding cluster-admin for app workloads", "Shortcut during debugging", "Create narrow Roles for the app ServiceAccount.", ["k8s-least-privilege"]),
    mistake("k8s-rbac-privileged", "Running privileged containers without need", "Copying sample YAML", "Drop capabilities; run as non-root.", ["k8s-security-context", "k8s-pod-security"])
  ],
  exercises: [
    exercise({
      id: "k8s-rbac-exercise",
      title: "Harden a Deployment",
      instructions: ["Add runAsNonRoot and drop ALL capabilities.", "Create a Role that only gets pods in one namespace."],
      hints: ["securityContext under pod/container", "Role + RoleBinding + ServiceAccount"],
      expectedOutcome: "Deployment runs non-root with a narrow Role.",
      conceptIds: ["k8s-security-context", "k8s-role-binding", "k8s-service-account"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("k8s-rbac-and-pod-security", [
    "k8s-service-account", "k8s-role-binding", "k8s-least-privilege", "k8s-pod-security", "k8s-security-context"
  ], ["concept-understanding", "configuration-analysis", "architecture-reasoning", "practical-scenario", "debugging"]),
});


const t7 = topic({
  id: "k8s-storage-and-persistence",
  title: "Storage and Persistence",
  aliases: ["persistent volumes", "pvc", "volumes"],
  description: "Persist data with Volumes, PVCs, and storage classes at a conceptual level.",
  difficulty: "intermediate",
  learningOrder: 7,
  prerequisiteIds: ["k8s-rbac-and-pod-security"],
  relatedTopicIds: [],
  contaminationTerms: ["aws ebs deep dive as default", "react"],
  concepts: [
    concept({ id: "k8s-volumes", title: "Volumes", description: "Attach storage into a pod filesystem." }),
    concept({ id: "k8s-pvc", title: "PersistentVolumeClaim", description: "Request durable storage for workloads." }),
    concept({ id: "k8s-pv", title: "PersistentVolume", description: "Cluster storage resource backing claims." }),
    concept({ id: "k8s-storageclass", title: "StorageClass", description: "Dynamic provisioning profile for PVCs." }),
    concept({ id: "k8s-access-modes", title: "Access Modes", description: "ReadWriteOnce and related mounting rules." }),
    concept({ id: "k8s-stateful-vs-stateless", title: "Stateful vs Stateless", description: "Choose persistence only when needed." })
  ],
  learningObjectives: ["Claim storage with a PVC", "Mount a volume into a pod"],
  practicalArtifacts: [
    artifact({
      id: "k8s-pvc-mount",
      type: "configuration",
      title: "PVC mount snippet",
      language: "yaml",
      content: "volumes:\n  - name: data\n    persistentVolumeClaim:\n      claimName: app-data\nvolumeMounts:\n  - name: data\n    mountPath: /var/lib/app",
      expectedOutput: "Pod writes persist via the bound claim",
      explanation: "PVC referenced as a volume and mounted into the container.",
      conceptIds: ["k8s-pvc", "k8s-volumes"],
    }),
  ],
  commonMistakes: [
    mistake("k8s-storage-emptydir-durable", "Expecting emptyDir to survive node loss", "Confusing scratch with durable storage", "Use PVC for durable data.", ["k8s-volumes", "k8s-pvc"]),
    mistake("k8s-storage-rwx-assume", "Assuming every StorageClass supports multi-attach", "Access mode mismatches", "Check accessModes before multi-pod mounts.", ["k8s-access-modes", "k8s-storageclass"])
  ],
  exercises: [
    exercise({
      id: "k8s-storage-exercise",
      title: "Persist app data",
      instructions: ["Create a 1Gi PVC.", "Mount it into a Deployment at /data and write a file."],
      hints: ["Match accessModes", "Delete pod and confirm file remains if binding is durable"],
      expectedOutcome: "File survives pod restart via PVC.",
      conceptIds: ["k8s-pvc", "k8s-volumes", "k8s-stateful-vs-stateless"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("k8s-storage-and-persistence", [
    "k8s-volumes", "k8s-pvc", "k8s-pv", "k8s-storageclass", "k8s-access-modes"
  ], ["concept-understanding", "configuration-analysis", "debugging", "practical-scenario", "architecture-reasoning"]),
});


const t8 = topic({
  id: "k8s-troubleshooting-workloads",
  title: "Troubleshooting Workloads",
  aliases: ["kubectl debug", "crashloop", "k8s troubleshooting"],
  description: "Diagnose pending, crashing, and networking issues with kubectl.",
  difficulty: "intermediate",
  learningOrder: 8,
  prerequisiteIds: ["k8s-storage-and-persistence"],
  relatedTopicIds: [],
  contaminationTerms: ["aws vpc wizard", "react hooks"],
  concepts: [
    concept({ id: "k8s-kubectl-get-describe", title: "get and describe", description: "Inspect object status and events." }),
    concept({ id: "k8s-logs", title: "Logs", description: "Read container stdout/stderr." }),
    concept({ id: "k8s-crashloop", title: "CrashLoopBackOff", description: "Containers repeatedly exiting." }),
    concept({ id: "k8s-imagepull", title: "ImagePullBackOff", description: "Image fetch or auth failures." }),
    concept({ id: "k8s-pending-pods", title: "Pending Pods", description: "Scheduling failures from resources/taints/affinity." }),
    concept({ id: "k8s-debug-checklist", title: "Debug Checklist", description: "Status \u2192 events \u2192 logs \u2192 config \u2192 networking order." })
  ],
  learningObjectives: ["Triaging CrashLoop and Pending states", "Use describe/logs effectively"],
  practicalArtifacts: [
    artifact({
      id: "k8s-troubleshoot-flow",
      type: "command",
      title: "Debug command sequence",
      language: "bash",
      content: "kubectl get pods\nkubectl describe pod web-0\nkubectl logs web-0 -c nginx --previous",
      expectedOutput: "Events and logs that reveal the failure reason",
      explanation: "Ordered checklist from status to previous logs.",
      conceptIds: ["k8s-kubectl-get-describe", "k8s-logs", "k8s-debug-checklist"],
    }),
  ],
  commonMistakes: [
    mistake("k8s-debug-delete-first", "Deleting pods before reading events", "Wanting a quick reset", "Capture describe/logs first.", ["k8s-debug-checklist"]),
    mistake("k8s-debug-wrong-container", "Checking logs on the wrong container", "Multi-container pods", "Pass -c <container>.", ["k8s-logs"])
  ],
  exercises: [
    exercise({
      id: "k8s-debug-exercise",
      title: "Fix a crashing Deployment",
      instructions: ["Deploy a pod with a bad command that crashes.", "Use describe/logs to identify the issue and fix the manifest."],
      hints: ["Exit code in describe", "--previous for last crash"],
      expectedOutcome: "Root cause identified from events/logs and corrected.",
      conceptIds: ["k8s-crashloop", "k8s-logs", "k8s-kubectl-get-describe"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills("k8s-troubleshooting-workloads", [
    "k8s-kubectl-get-describe", "k8s-logs", "k8s-crashloop", "k8s-imagepull", "k8s-pending-pods"
  ], ["debugging", "configuration-analysis", "practical-scenario", "concept-understanding", "expected-output"]),
});


export const kubernetesKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-kubernetes",
  title: "Kubernetes",
  aliases: ["kubernetes", "k8s", "learn kubernetes", "kubernetes administrator"],
  category: "DevOps",
  description:
    "Canonical Kubernetes curriculum covering architecture, pods, deployments, services, config, RBAC, storage, and troubleshooting.",
  topics: [t1, t2, t3, t4, t5, t6, t7, t8],
});

