import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["react hooks", "jsx", "python class", "sql join", "power bi"];

const fundamentalsTopic = topic({
  id: "docker-container-fundamentals",
  title: "Container Fundamentals",
  aliases: ["containers vs vms", "docker intro", "images vs containers"],
  description: "Distinguish images, containers, and the Docker Engine workflow.",
  learningOrder: 1,
  relatedTopicIds: ["docker-images-and-dockerfiles"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "docker-image", title: "Image", description: "Immutable filesystem snapshot plus metadata used to start containers." }),
    concept({ id: "docker-container", title: "Container", description: "Runnable instance of an image with its own writable layer." }),
    concept({ id: "docker-engine", title: "Docker Engine", description: "Daemon and API that build, run, and manage containers." }),
    concept({ id: "docker-registry", title: "Registry", description: "Store for named image repositories (e.g. Docker Hub)." }),
    concept({ id: "docker-cli", title: "Docker CLI", description: "Command-line client that talks to the Engine API." }),
    concept({ id: "docker-vs-vm", title: "Containers vs VMs", description: "Containers share the host kernel; VMs virtualize hardware/OS." }),
  ],
  learningObjectives: [
    "Explain image vs container vs registry",
    "Run a first container with the Docker CLI",
  ],
  practicalArtifacts: [
    artifact({
      id: "docker-fundamentals-run",
      type: "command",
      title: "Run hello-world and inspect",
      content:
        "docker pull hello-world\ndocker run --rm hello-world\ndocker images hello-world",
      expectedOutput: "Hello from Docker! message and a local image listed",
      explanation: "Pulls an image, runs a one-shot container, lists the image.",
      conceptIds: ["docker-image", "docker-container", "docker-cli", "docker-registry"],
    }),
  ],
  commonMistakes: [
    mistake(
      "docker-fund-image-container",
      "Calling a stopped container an image",
      "Blurred terminology in tutorials",
      "Images are templates; containers are instances.",
      ["docker-image", "docker-container"],
    ),
    mistake(
      "docker-fund-vm-equate",
      "Treating containers as full VMs",
      "Assuming a guest OS per container",
      "Remember containers share the host kernel.",
      ["docker-vs-vm"],
    ),
  ],
  exercises: [
    exercise({
      id: "docker-fundamentals-exercise",
      title: "Name and remove a container",
      instructions: [
        "Run nginx:alpine detached with --name web-lab.",
        "Confirm it is running, then stop and remove it.",
      ],
      hints: ["docker run -d --name", "docker ps / docker rm -f"],
      expectedOutcome: "Named container created then cleaned up.",
      conceptIds: ["docker-container", "docker-cli", "docker-image"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "docker-fundamentals",
    ["docker-image", "docker-container", "docker-engine", "docker-registry", "docker-vs-vm"],
    ["concept-understanding", "configuration-analysis", "practical-scenario", "debugging", "expected-output"],
  ),
});

const dockerfileTopic = topic({
  id: "docker-images-and-dockerfiles",
  title: "Images and Dockerfiles",
  aliases: ["dockerfile", "docker build", "from run copy"],
  description: "Author Dockerfiles and build tagged images layer by layer.",
  learningOrder: 2,
  prerequisiteIds: ["docker-container-fundamentals"],
  relatedTopicIds: ["docker-container-runtime"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "docker-from", title: "FROM", description: "Base image instruction that starts a Dockerfile." }),
    concept({ id: "docker-run-instr", title: "RUN", description: "Execute build-time commands that create new layers." }),
    concept({ id: "docker-copy", title: "COPY", description: "Copy files from build context into the image." }),
    concept({ id: "docker-cmd", title: "CMD", description: "Default command for containers started from the image." }),
    concept({ id: "docker-build", title: "docker build", description: "Build an image from a Dockerfile and context." }),
    concept({ id: "docker-tag", title: "Image Tags", description: "Name:tag references for versions of an image." }),
  ],
  learningObjectives: [
    "Write a minimal Dockerfile for a static app",
    "Build and tag an image locally",
  ],
  practicalArtifacts: [
    artifact({
      id: "docker-dockerfile-static",
      type: "configuration",
      title: "Nginx static site Dockerfile",
      language: "dockerfile",
      content:
        "FROM nginx:1.25-alpine\nCOPY ./public /usr/share/nginx/html\nEXPOSE 80\nCMD [\"nginx\", \"-g\", \"daemon off;\"]",
      expectedOutput: "Image builds; container serves files from /usr/share/nginx/html",
      explanation: "FROM + COPY + CMD pattern for a static site.",
      conceptIds: ["docker-from", "docker-copy", "docker-cmd"],
    }),
  ],
  commonMistakes: [
    mistake(
      "docker-df-context",
      "COPY paths outside the build context",
      "Assuming any host path is readable",
      "Keep required files inside the context directory.",
      ["docker-copy", "docker-build"],
    ),
    mistake(
      "docker-df-latest",
      "Pinning nothing and relying on latest",
      "Non-reproducible builds",
      "Tag base images with explicit versions.",
      ["docker-from", "docker-tag"],
    ),
  ],
  exercises: [
    exercise({
      id: "docker-dockerfile-exercise",
      title: "Build a tagged web image",
      instructions: [
        "Create a Dockerfile that copies a public/ folder into nginx.",
        "Build as web-lab:0.1 and run it publishing port 8080.",
      ],
      hints: ["docker build -t web-lab:0.1 .", "docker run --rm -p 8080:80"],
      expectedOutcome: "Browser/curl on localhost:8080 returns the static page.",
      conceptIds: ["docker-build", "docker-tag", "docker-cmd"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "docker-dockerfile",
    ["docker-from", "docker-run-instr", "docker-copy", "docker-cmd", "docker-build"],
    ["configuration-analysis", "concept-understanding", "debugging", "practical-scenario", "expected-output"],
  ),
});

const runtimeTopic = topic({
  id: "docker-container-runtime",
  title: "Container Runtime Operations",
  aliases: ["docker run flags", "docker logs", "docker exec"],
  description: "Start, inspect, log, and exec into running containers.",
  learningOrder: 3,
  prerequisiteIds: ["docker-images-and-dockerfiles"],
  relatedTopicIds: ["docker-volumes-and-networking"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "docker-run-flags", title: "docker run Flags", description: "-d, --name, -p, -e, --rm control runtime behavior." }),
    concept({ id: "docker-ports", title: "Port Publishing", description: "Map host:container ports with -p." }),
    concept({ id: "docker-env", title: "Environment Variables", description: "Inject config via -e or --env-file." }),
    concept({ id: "docker-logs", title: "docker logs", description: "Read container stdout/stderr streams." }),
    concept({ id: "docker-exec", title: "docker exec", description: "Run a command inside a running container." }),
    concept({ id: "docker-inspect", title: "docker inspect", description: "View low-level container/image JSON metadata." }),
  ],
  learningObjectives: [
    "Publish ports and inject env vars",
    "Debug with logs, exec, and inspect",
  ],
  practicalArtifacts: [
    artifact({
      id: "docker-runtime-nginx",
      type: "command",
      title: "Run, log, and exec nginx",
      content:
        "docker run -d --name web -p 8080:80 -e NGINX_HOST=local nginx:1.25-alpine\ndocker logs web\ndocker exec web nginx -v\ndocker rm -f web",
      expectedOutput: "Container serves on 8080; logs and nginx version printed",
      explanation: "Detached run with port/env, then logs/exec cleanup.",
      conceptIds: ["docker-run-flags", "docker-ports", "docker-logs", "docker-exec"],
    }),
  ],
  commonMistakes: [
    mistake(
      "docker-runtime-port-order",
      "Reversing host/container ports in -p",
      "Guessing the order",
      "Remember hostPort:containerPort.",
      ["docker-ports"],
    ),
    mistake(
      "docker-runtime-exec-stopped",
      "docker exec on a stopped container",
      "Confusing run vs exec",
      "Start the container before exec.",
      ["docker-exec"],
    ),
  ],
  exercises: [
    exercise({
      id: "docker-runtime-exercise",
      title: "Env-driven echo container",
      instructions: [
        "Run busybox with -e MESSAGE=hello printing $MESSAGE.",
        "Capture logs and remove the container.",
      ],
      hints: ['sh -c \'echo $MESSAGE\'', "--rm helps cleanup"],
      expectedOutcome: "Logs contain hello.",
      conceptIds: ["docker-env", "docker-logs", "docker-run-flags"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "docker-runtime",
    ["docker-run-flags", "docker-ports", "docker-env", "docker-logs", "docker-exec"],
    ["configuration-analysis", "debugging", "practical-scenario", "expected-output", "concept-understanding"],
  ),
});

const volumesTopic = topic({
  id: "docker-volumes-and-networking",
  title: "Volumes and Networking",
  aliases: ["docker volumes", "docker network", "bind mounts"],
  description: "Persist data with volumes/bind mounts and connect containers on networks.",
  learningOrder: 4,
  prerequisiteIds: ["docker-container-runtime"],
  relatedTopicIds: ["docker-compose-multi-container"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "docker-volume", title: "Named Volumes", description: "Engine-managed persistent storage mountable into containers." }),
    concept({ id: "docker-bind-mount", title: "Bind Mounts", description: "Mount a host path directly into a container." }),
    concept({ id: "docker-network-bridge", title: "Bridge Network", description: "Default network driver for container-to-container DNS/IP." }),
    concept({ id: "docker-network-connect", title: "Network Connect", description: "Attach containers so they can resolve each other by name." }),
    concept({ id: "docker-volume-flags", title: "-v / --mount", description: "CLI flags that attach storage at runtime." }),
    concept({ id: "docker-data-lifecycle", title: "Data Lifecycle", description: "Volumes persist after container removal; writable layer does not." }),
  ],
  learningObjectives: [
    "Mount a volume for durable data",
    "Place two containers on a user-defined bridge network",
  ],
  practicalArtifacts: [
    artifact({
      id: "docker-volumes-pg-data",
      type: "command",
      title: "Postgres with named volume",
      content:
        "docker network create labnet\ndocker volume create pgdata\ndocker run -d --name db --network labnet -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret postgres:16-alpine\ndocker exec db pg_isready",
      expectedOutput: "accepting connections",
      explanation: "User bridge network + named volume for database files.",
      conceptIds: ["docker-volume", "docker-network-bridge", "docker-volume-flags"],
    }),
  ],
  commonMistakes: [
    mistake(
      "docker-vol-bind-secret",
      "Bind-mounting secrets into images at build time",
      "Baking credentials into layers",
      "Inject secrets at runtime; prefer volumes/tmpfs carefully.",
      ["docker-bind-mount", "docker-data-lifecycle"],
    ),
    mistake(
      "docker-vol-default-net",
      "Expecting automatic DNS on the default bridge for custom names",
      "Legacy default bridge limits",
      "Create a user-defined bridge for name resolution.",
      ["docker-network-bridge", "docker-network-connect"],
    ),
  ],
  exercises: [
    exercise({
      id: "docker-volumes-exercise",
      title: "Shared volume note",
      instructions: [
        "Create a named volume notes.",
        "Write a file into it from one alpine container and read it from another.",
      ],
      hints: ["Same -v notes:/data on both", "Use cat/echo"],
      expectedOutcome: "Second container prints the file written by the first.",
      conceptIds: ["docker-volume", "docker-volume-flags", "docker-data-lifecycle"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "docker-volumes",
    ["docker-volume", "docker-bind-mount", "docker-network-bridge", "docker-network-connect", "docker-data-lifecycle"],
    ["configuration-analysis", "architecture-reasoning", "debugging", "practical-scenario", "concept-understanding"],
  ),
});

const composeTopic = topic({
  id: "docker-compose-multi-container",
  title: "Compose Multi-Container Apps",
  aliases: ["docker compose", "compose.yaml", "multi container"],
  description: "Declare multi-service stacks with Compose and manage their lifecycle.",
  learningOrder: 5,
  prerequisiteIds: ["docker-volumes-and-networking"],
  relatedTopicIds: ["docker-image-hardening"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "docker-compose-file", title: "compose.yaml", description: "Declarative file listing services, networks, and volumes." }),
    concept({ id: "docker-compose-services", title: "Services", description: "Long-running containers defined under services:." }),
    concept({ id: "docker-compose-up", title: "compose up/down", description: "Create and tear down the whole stack." }),
    concept({ id: "docker-compose-depends", title: "depends_on", description: "Startup ordering hint between services." }),
    concept({ id: "docker-compose-env", title: "Compose Environment", description: "Pass env vars via environment: or env_file:." }),
    concept({ id: "docker-compose-networks", title: "Compose Networks", description: "Networks created and attached by Compose automatically." }),
  ],
  learningObjectives: [
    "Author a two-service compose.yaml",
    "Bring the stack up and down cleanly",
  ],
  practicalArtifacts: [
    artifact({
      id: "docker-compose-web-redis",
      type: "configuration",
      title: "Web + Redis compose.yaml",
      language: "yaml",
      content:
        "services:\n  web:\n    image: nginx:1.25-alpine\n    ports:\n      - \"8080:80\"\n    depends_on:\n      - cache\n  cache:\n    image: redis:7-alpine\n    volumes:\n      - redisdata:/data\nvolumes:\n  redisdata:",
      expectedOutput: "compose up starts nginx on 8080 and a redis service",
      explanation: "Two services, depends_on, and a named volume.",
      conceptIds: ["docker-compose-file", "docker-compose-services", "docker-compose-depends"],
    }),
  ],
  commonMistakes: [
    mistake(
      "docker-compose-ready",
      "Assuming depends_on waits for app readiness",
      "It only waits for container start",
      "Add healthchecks or retry logic for readiness.",
      ["docker-compose-depends"],
    ),
    mistake(
      "docker-compose-host-dns",
      "Using localhost inside one container to reach another",
      "localhost is the container itself",
      "Use the Compose service name as hostname.",
      ["docker-compose-networks", "docker-compose-services"],
    ),
  ],
  exercises: [
    exercise({
      id: "docker-compose-exercise",
      title: "API + DB compose stack",
      instructions: [
        "Write compose.yaml with api (any language image) and db (postgres).",
        "Mount a volume for postgres data and expose the API port.",
        "Document compose up / down commands.",
      ],
      hints: ["Service DNS name is db", "Set POSTGRES_PASSWORD"],
      expectedOutcome: "Stack starts; API can resolve host db.",
      conceptIds: ["docker-compose-file", "docker-compose-up", "docker-compose-env"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "docker-compose",
    ["docker-compose-file", "docker-compose-services", "docker-compose-up", "docker-compose-depends", "docker-compose-networks"],
    ["configuration-analysis", "architecture-reasoning", "practical-scenario", "debugging", "concept-understanding"],
  ),
});

const hardenTopic = topic({
  id: "docker-image-hardening",
  title: "Image Optimization and Hardening",
  aliases: ["multi stage build", "docker security", "slim images"],
  description: "Shrink images and reduce risk with multi-stage builds and safer defaults.",
  learningOrder: 6,
  prerequisiteIds: ["docker-images-and-dockerfiles", "docker-compose-multi-container"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "docker-multistage", title: "Multi-stage Builds", description: "Use intermediate stages so final images omit build toolchains." }),
    concept({ id: "docker-nonroot", title: "Non-root USER", description: "Run processes as a non-root user inside the container." }),
    concept({ id: "docker-layer-cache", title: "Layer Caching", description: "Order Dockerfile instructions to maximize cache hits." }),
    concept({ id: "docker-gitignore-docker", title: ".dockerignore", description: "Exclude files from the build context." }),
    concept({ id: "docker-scan-basics", title: "Image Scanning Basics", description: "Check images for known vulnerabilities before deploy." }),
    concept({ id: "docker-read-only", title: "Read-only Root FS", description: "Optional hardening that blocks writes to the container filesystem." }),
  ],
  learningObjectives: [
    "Produce a smaller multi-stage image",
    "Apply non-root USER and .dockerignore",
  ],
  practicalArtifacts: [
    artifact({
      id: "docker-harden-multistage",
      type: "configuration",
      title: "Multi-stage Node build",
      language: "dockerfile",
      content:
        "FROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nRUN addgroup -S app && adduser -S app -G app\nCOPY --from=build /app/dist ./dist\nUSER app\nCMD [\"node\", \"dist/server.js\"]",
      expectedOutput: "Final image lacks npm build toolchain; runs as app user",
      explanation: "Build stage discarded; runtime stage uses USER app.",
      conceptIds: ["docker-multistage", "docker-nonroot", "docker-layer-cache"],
    }),
  ],
  commonMistakes: [
    mistake(
      "docker-harden-root",
      "Leaving containers running as root unnecessarily",
      "Default USER in many base images",
      "Add a non-root USER for app processes.",
      ["docker-nonroot"],
    ),
    mistake(
      "docker-harden-context",
      "Sending .git and secrets in the build context",
      "Missing .dockerignore",
      "Ignore VCS dirs, env files, and node_modules.",
      ["docker-gitignore-docker"],
    ),
  ],
  exercises: [
    exercise({
      id: "docker-harden-exercise",
      title: "Slim the static image",
      instructions: [
        "Convert a single-stage Dockerfile to multi-stage if it builds assets.",
        "Add .dockerignore and a non-root USER.",
        "Compare image sizes before and after.",
      ],
      hints: ["COPY --from=build", "docker images"],
      expectedOutcome: "Smaller final image running as non-root.",
      conceptIds: ["docker-multistage", "docker-nonroot", "docker-gitignore-docker"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "docker-harden",
    ["docker-multistage", "docker-nonroot", "docker-layer-cache", "docker-gitignore-docker", "docker-scan-basics"],
    ["configuration-analysis", "architecture-reasoning", "practical-scenario", "debugging", "concept-understanding"],
  ),
});

export const dockerKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-docker",
  title: "Docker",
  aliases: ["docker", "containers", "learn docker", "docker compose"],
  category: "DevOps",
  description:
    "Starter Docker curriculum covering fundamentals, Dockerfiles, runtime ops, volumes/networks, Compose, and image hardening.",
  topics: [
    fundamentalsTopic,
    dockerfileTopic,
    runtimeTopic,
    volumesTopic,
    composeTopic,
    hardenTopic,
  ],
});
