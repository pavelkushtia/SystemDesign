import { DeploymentConfig, Component } from '@scalesim/shared';

export interface CloudProvider {
  name: 'aws' | 'gcp' | 'azure' | 'digitalocean' | 'local';
  region?: string;
  credentials?: Record<string, string>;
}

export interface DeploymentTarget {
  type: 'kubernetes' | 'docker-compose' | 'terraform' | 'helm' | 'serverless';
  provider: CloudProvider;
  environment: 'development' | 'staging' | 'production';
  scaling?: {
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
    targetMemory: number;
  };
  monitoring?: {
    enabled: boolean;
    prometheus?: boolean;
    grafana?: boolean;
    jaeger?: boolean;
  };
  security?: {
    networkPolicies: boolean;
    rbac: boolean;
    podSecurityPolicies: boolean;
    secrets: string[];
  };
}

export interface ExtendedDeploymentConfig extends DeploymentConfig {
  components: Component[];
  target: DeploymentTarget;
  namespace?: string;
  domain?: string;
  ssl?: {
    enabled: boolean;
    certManager?: boolean;
    letsEncrypt?: boolean;
  };
  ingress?: {
    enabled: boolean;
    className?: string;
    annotations?: Record<string, string>;
  };
  persistence?: {
    enabled: boolean;
    storageClass?: string;
    size?: string;
  };
}

export class DeploymentGenerator {
  generateManifests(config: ExtendedDeploymentConfig): Record<string, string> {
    const manifests: Record<string, string> = {};
    
    switch (config.target.type) {
      case 'kubernetes':
        return this.generateKubernetesManifests(config);
      case 'docker-compose':
        return this.generateDockerComposeManifests(config);
      case 'terraform':
        return this.generateTerraformManifests(config);
      case 'helm':
        return this.generateHelmChart(config);
      case 'serverless':
        return this.generateServerlessManifests(config);
      default:
        return this.generateKubernetesManifests(config);
    }
  }

  private generateKubernetesManifests(config: ExtendedDeploymentConfig): Record<string, string> {
    const manifests: Record<string, string> = {};
    
    // Namespace
    if (config.namespace) {
      manifests['00-namespace.yaml'] = this.generateNamespace(config);
    }

    // ConfigMaps and Secrets
    manifests['01-configmap.yaml'] = this.generateConfigMap(config);
    manifests['02-secrets.yaml'] = this.generateSecrets(config);

    // Generate manifests for each component
    config.components.forEach((component, index) => {
      const componentManifests = this.generateComponentManifests(component, config, index);
      Object.entries(componentManifests).forEach(([key, value]) => {
        manifests[`${String(index + 10).padStart(2, '0')}-${component.name.toLowerCase()}-${key}`] = value;
      });
    });

    // Ingress
    if (config.ingress?.enabled) {
      manifests['90-ingress.yaml'] = this.generateIngress(config);
    }

    // Monitoring
    if (config.target.monitoring?.enabled) {
      manifests['91-monitoring.yaml'] = this.generateMonitoring(config);
    }

    // Network Policies
    if (config.target.security?.networkPolicies) {
      manifests['92-network-policies.yaml'] = this.generateNetworkPolicies(config);
    }

    // RBAC
    if (config.target.security?.rbac) {
      manifests['93-rbac.yaml'] = this.generateRBAC(config);
    }

    // HPA (Horizontal Pod Autoscaler)
    if (config.target.scaling) {
      manifests['94-hpa.yaml'] = this.generateHPA(config);
    }

    // PersistentVolumes
    if (config.persistence?.enabled) {
      manifests['95-persistence.yaml'] = this.generatePersistence(config);
    }

    return manifests;
  }

  private generateComponentManifests(component: Component, config: ExtendedDeploymentConfig, index: number): Record<string, string> {
    const manifests: Record<string, string> = {};
    
    // Deployment
    manifests['deployment.yaml'] = this.generateDeployment(component, config);
    
    // Service
    manifests['service.yaml'] = this.generateService(component, config);
    
    // Component-specific resources
    switch (component.type) {
      case 'database':
        manifests['statefulset.yaml'] = this.generateStatefulSet(component, config);
        manifests['pvc.yaml'] = this.generatePVC(component, config);
        break;
      case 'cache':
        manifests['redis-config.yaml'] = this.generateRedisConfig(component, config);
        break;
      case 'message_queue':
        manifests['kafka-config.yaml'] = this.generateKafkaConfig(component, config);
        break;
      case 'ml_model':
        manifests['model-serving.yaml'] = this.generateMLModelServing(component, config);
        break;
    }

    return manifests;
  }

  private generateNamespace(config: ExtendedDeploymentConfig): string {
    return `apiVersion: v1
kind: Namespace
metadata:
  name: ${config.namespace}
  labels:
    name: ${config.namespace}
    environment: ${config.target.environment}
    managed-by: scalesim
  annotations:
    scalesim.io/system-id: "${config.systemId}"
    scalesim.io/created-at: "${new Date().toISOString()}"
`;
  }

  private generateConfigMap(config: ExtendedDeploymentConfig): string {
    const configData = {
      'app.env': config.target.environment,
      'system.id': config.systemId,
      'monitoring.enabled': config.target.monitoring?.enabled ? 'true' : 'false',
      'log.level': config.target.environment === 'production' ? 'info' : 'debug'
    };

    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${config.systemId}-config
  namespace: ${config.namespace || 'default'}
  labels:
    app: ${config.systemId}
    environment: ${config.target.environment}
data:
${Object.entries(configData).map(([key, value]) => `  ${key}: "${value}"`).join('\n')}
`;
  }

  private generateSecrets(config: ExtendedDeploymentConfig): string {
    const secrets = config.target.security?.secrets || [];
    
    return `apiVersion: v1
kind: Secret
metadata:
  name: ${config.systemId}-secrets
  namespace: ${config.namespace || 'default'}
  labels:
    app: ${config.systemId}
    environment: ${config.target.environment}
type: Opaque
data:
  # Add your base64 encoded secrets here
${secrets.map(secret => `  ${secret}: ""`).join('\n')}
  # Example:
  # database-password: cGFzc3dvcmQ=  # base64 encoded 'password'
`;
  }

  private generateDeployment(component: Component, config: ExtendedDeploymentConfig): string {
    const replicas = config.target.scaling?.minReplicas || 1;
    const image = this.getComponentImage(component);
    const ports = this.getComponentPorts(component);
    const env = this.getComponentEnvironment(component, config);
    const resources = this.getComponentResources(component, config);

    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${component.name.toLowerCase()}
  namespace: ${config.namespace || 'default'}
  labels:
    app: ${component.name.toLowerCase()}
    component: ${component.type}
    system: ${config.systemId}
    environment: ${config.target.environment}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${component.name.toLowerCase()}
  template:
    metadata:
      labels:
        app: ${component.name.toLowerCase()}
        component: ${component.type}
        system: ${config.systemId}
        environment: ${config.target.environment}
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "${ports.metrics || '9090'}"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: ${component.name.toLowerCase()}
        image: ${image}
        ports:
${ports.container.map(port => `        - containerPort: ${port.port}\n          name: ${port.name}\n          protocol: ${port.protocol || 'TCP'}`).join('\n')}
        env:
${env.map(e => `        - name: ${e.name}\n          ${e.valueFrom ? `valueFrom:\n            ${e.valueFrom}` : `value: "${e.value}"`}`).join('\n')}
        resources:
          requests:
            memory: "${resources.requests.memory}"
            cpu: "${resources.requests.cpu}"
          limits:
            memory: "${resources.limits.memory}"
            cpu: "${resources.limits.cpu}"
        livenessProbe:
          httpGet:
            path: ${this.getHealthCheckPath(component)}
            port: ${ports.health || ports.container[0]?.port || 8080}
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: ${this.getReadinessCheckPath(component)}
            port: ${ports.health || ports.container[0]?.port || 8080}
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        ${component.type === 'database' || config.persistence?.enabled ? `
        volumeMounts:
        - name: data
          mountPath: ${this.getDataMountPath(component)}
        ` : ''}
      ${component.type === 'database' || config.persistence?.enabled ? `
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: ${component.name.toLowerCase()}-pvc
      ` : ''}
      restartPolicy: Always
`;
  }

  private generateService(component: Component, config: ExtendedDeploymentConfig): string {
    const ports = this.getComponentPorts(component);
    const serviceType = this.getServiceType(component, config);

    return `apiVersion: v1
kind: Service
metadata:
  name: ${component.name.toLowerCase()}-service
  namespace: ${config.namespace || 'default'}
  labels:
    app: ${component.name.toLowerCase()}
    component: ${component.type}
    system: ${config.systemId}
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: ${serviceType}
  selector:
    app: ${component.name.toLowerCase()}
  ports:
${ports.service.map(port => `  - port: ${port.port}\n    targetPort: ${port.targetPort || port.port}\n    name: ${port.name}\n    protocol: ${port.protocol || 'TCP'}`).join('\n')}
  ${serviceType === 'LoadBalancer' ? `
  loadBalancerSourceRanges:
  - 0.0.0.0/0  # Configure appropriately for production
  ` : ''}
`;
  }

  private generateStatefulSet(component: Component, config: ExtendedDeploymentConfig): string {
    if (component.type !== 'database') return '';

    return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${component.name.toLowerCase()}-statefulset
  namespace: ${config.namespace || 'default'}
  labels:
    app: ${component.name.toLowerCase()}
    component: ${component.type}
spec:
  serviceName: ${component.name.toLowerCase()}-headless
  replicas: 1
  selector:
    matchLabels:
      app: ${component.name.toLowerCase()}
  template:
    metadata:
      labels:
        app: ${component.name.toLowerCase()}
        component: ${component.type}
    spec:
      containers:
      - name: ${component.name.toLowerCase()}
        image: ${this.getComponentImage(component)}
        ports:
        - containerPort: ${this.getDatabasePort(component)}
          name: database
        env:
        - name: POSTGRES_DB
          value: "app_db"
        - name: POSTGRES_USER
          value: "postgres"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ${config.systemId}-secrets
              key: database-password
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: ${config.persistence?.storageClass || 'standard'}
      resources:
        requests:
          storage: ${config.persistence?.size || '10Gi'}
`;
  }

  private generateIngress(config: ExtendedDeploymentConfig): string {
    const domain = config.domain || `${config.systemId}.local`;
    const tlsEnabled = config.ssl?.enabled || false;

    return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${config.systemId}-ingress
  namespace: ${config.namespace || 'default'}
  labels:
    app: ${config.systemId}
  annotations:
    kubernetes.io/ingress.class: ${config.ingress?.className || 'nginx'}
    nginx.ingress.kubernetes.io/rewrite-target: /
    ${config.ssl?.certManager ? 'cert-manager.io/cluster-issuer: "letsencrypt-prod"' : ''}
    ${Object.entries(config.ingress?.annotations || {}).map(([key, value]) => `${key}: "${value}"`).join('\n    ')}
spec:
  ${tlsEnabled ? `
  tls:
  - hosts:
    - ${domain}
    secretName: ${config.systemId}-tls
  ` : ''}
  rules:
  - host: ${domain}
    http:
      paths:
${config.components
  .filter(c => ['api_gateway', 'microservice', 'web_server'].includes(c.type))
  .map(component => `      - path: /${component.name.toLowerCase()}
        pathType: Prefix
        backend:
          service:
            name: ${component.name.toLowerCase()}-service
            port:
              number: 80`).join('\n')}
`;
  }

  private generateMonitoring(config: ExtendedDeploymentConfig): string {
    return `# Prometheus ServiceMonitor
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ${config.systemId}-monitoring
  namespace: ${config.namespace || 'default'}
  labels:
    app: ${config.systemId}
spec:
  selector:
    matchLabels:
      system: ${config.systemId}
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
---
# Grafana Dashboard ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${config.systemId}-dashboard
  namespace: ${config.namespace || 'default'}
  labels:
    grafana_dashboard: "1"
data:
  dashboard.json: |
    {
      "dashboard": {
        "title": "${config.systemId} Dashboard",
        "panels": [
          {
            "title": "Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total[5m])",
                "legendFormat": "{{service}}"
              }
            ]
          }
        ]
      }
    }
`;
  }

  private generateHPA(config: ExtendedDeploymentConfig): string {
    const scaling = config.target.scaling!;

    return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${config.systemId}-hpa
  namespace: ${config.namespace || 'default'}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${config.components[0]?.name.toLowerCase() || 'app'}
  minReplicas: ${scaling.minReplicas}
  maxReplicas: ${scaling.maxReplicas}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: ${scaling.targetCPU}
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: ${scaling.targetMemory}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
`;
  }

  // Helper methods
  private getComponentImage(component: Component): string {
    const imageMap: Record<string, string> = {
      'api_gateway': 'nginx:1.21-alpine',
      'microservice': 'node:18-alpine',
      'database': 'postgres:15-alpine',
      'cache': 'redis:7-alpine',
      'message_queue': 'confluentinc/cp-kafka:latest',
      'load_balancer': 'nginx:1.21-alpine',
      'web_server': 'nginx:1.21-alpine',
      'ml_model': 'python:3.9-slim'
    };

    return component.config?.image || imageMap[component.type] || 'alpine:latest';
  }

  private getComponentPorts(component: Component): any {
    const portMap: Record<string, any> = {
      'api_gateway': {
        container: [{ port: 80, name: 'http' }, { port: 443, name: 'https' }],
        service: [{ port: 80, name: 'http' }, { port: 443, name: 'https' }],
        health: 80
      },
      'microservice': {
        container: [{ port: 3000, name: 'http' }],
        service: [{ port: 80, targetPort: 3000, name: 'http' }],
        health: 3000
      },
      'database': {
        container: [{ port: 5432, name: 'postgres' }],
        service: [{ port: 5432, name: 'postgres' }],
        health: 5432
      },
      'cache': {
        container: [{ port: 6379, name: 'redis' }],
        service: [{ port: 6379, name: 'redis' }],
        health: 6379
      },
      'message_queue': {
        container: [{ port: 9092, name: 'kafka' }],
        service: [{ port: 9092, name: 'kafka' }],
        health: 9092
      }
    };

    return portMap[component.type] || {
      container: [{ port: 8080, name: 'http' }],
      service: [{ port: 80, targetPort: 8080, name: 'http' }],
      health: 8080
    };
  }

  private getComponentEnvironment(component: Component, config: ExtendedDeploymentConfig): any[] {
    const baseEnv = [
      { name: 'NODE_ENV', value: config.target.environment },
      { name: 'SYSTEM_ID', value: config.systemId },
      { name: 'COMPONENT_NAME', value: component.name },
      { name: 'COMPONENT_TYPE', value: component.type }
    ];

    // Add component-specific environment variables
    switch (component.type) {
      case 'database':
        baseEnv.push(
          { name: 'POSTGRES_DB', value: 'app_db' },
          { name: 'POSTGRES_USER', value: 'postgres' },
          { 
            name: 'POSTGRES_PASSWORD', 
            valueFrom: 'secretKeyRef:\n              name: ' + config.systemId + '-secrets\n              key: database-password'
          }
        );
        break;
      case 'cache':
        baseEnv.push(
          { name: 'REDIS_PASSWORD', valueFrom: 'secretKeyRef:\n              name: ' + config.systemId + '-secrets\n              key: redis-password' }
        );
        break;
    }

    return baseEnv;
  }

  private getComponentResources(component: Component, config: ExtendedDeploymentConfig): any {
    const resourceMap: Record<string, any> = {
      'database': {
        requests: { memory: '256Mi', cpu: '250m' },
        limits: { memory: '512Mi', cpu: '500m' }
      },
      'cache': {
        requests: { memory: '128Mi', cpu: '100m' },
        limits: { memory: '256Mi', cpu: '200m' }
      },
      'microservice': {
        requests: { memory: '128Mi', cpu: '100m' },
        limits: { memory: '256Mi', cpu: '200m' }
      },
      'api_gateway': {
        requests: { memory: '64Mi', cpu: '50m' },
        limits: { memory: '128Mi', cpu: '100m' }
      }
    };

    return resourceMap[component.type] || {
      requests: { memory: '64Mi', cpu: '50m' },
      limits: { memory: '128Mi', cpu: '100m' }
    };
  }

  private getHealthCheckPath(component: Component): string {
    const pathMap: Record<string, string> = {
      'api_gateway': '/health',
      'microservice': '/health',
      'web_server': '/health',
      'ml_model': '/health'
    };

    return pathMap[component.type] || '/health';
  }

  private getReadinessCheckPath(component: Component): string {
    return this.getHealthCheckPath(component);
  }

  private getDataMountPath(component: Component): string {
    const pathMap: Record<string, string> = {
      'database': '/var/lib/postgresql/data',
      'cache': '/data',
      'message_queue': '/var/lib/kafka/data'
    };

    return pathMap[component.type] || '/data';
  }

  private getServiceType(component: Component, config: ExtendedDeploymentConfig): string {
    if (['api_gateway', 'load_balancer'].includes(component.type)) {
      return config.target.environment === 'production' ? 'LoadBalancer' : 'NodePort';
    }
    return 'ClusterIP';
  }

  private getDatabasePort(component: Component): number {
    const portMap: Record<string, number> = {
      'postgres': 5432,
      'mysql': 3306,
      'mongodb': 27017,
      'redis': 6379
    };

    const dbType = component.config?.type || 'postgres';
    return portMap[dbType] || 5432;
  }

  // Additional methods for other deployment types...
  private generateDockerComposeManifests(config: ExtendedDeploymentConfig): Record<string, string> {
    const services: Record<string, any> = {};
    const volumes: Record<string, any> = {};
    const networks: Record<string, any> = {
      'app-network': {
        driver: 'bridge'
      }
    };

    config.components.forEach(component => {
      const service = this.generateDockerComposeService(component, config);
      services[component.name.toLowerCase()] = service;

      if (component.type === 'database') {
        volumes[`${component.name.toLowerCase()}_data`] = {};
      }
    });

    const compose = {
      version: '3.8',
      services,
      volumes,
      networks
    };

    return {
      'docker-compose.yml': `# Generated docker-compose.yml for ${config.systemId}
# Environment: ${config.target.environment}
# Generated by ScaleSim

${this.yamlStringify(compose)}`
    };
  }

  private generateDockerComposeService(component: Component, config: ExtendedDeploymentConfig): any {
    const image = this.getComponentImage(component);
    const ports = this.getComponentPorts(component);
    const environment = this.getComponentEnvironment(component, config);

    const service: any = {
      image,
      container_name: `${config.systemId}_${component.name.toLowerCase()}`,
      ports: ports.service.map((p: any) => `${p.port}:${p.targetPort || p.port}`),
      environment: environment.reduce((env: any, e: any) => {
        env[e.name] = e.value || '${' + e.name + '}';
        return env;
      }, {}),
      networks: ['app-network'],
      restart: 'unless-stopped'
    };

    if (component.type === 'database') {
      service.volumes = [`${component.name.toLowerCase()}_data:${this.getDataMountPath(component)}`];
    }

    return service;
  }

  private generateTerraformManifests(config: ExtendedDeploymentConfig): Record<string, string> {
    return {
      'main.tf': this.generateTerraformMain(config),
      'variables.tf': this.generateTerraformVariables(config),
      'outputs.tf': this.generateTerraformOutputs(config),
      'versions.tf': this.generateTerraformVersions(config)
    };
  }

  private generateTerraformMain(config: ExtendedDeploymentConfig): string {
    const provider = config.target.provider.name;
    
    return `# Generated Terraform configuration for ${config.systemId}
# Provider: ${provider}
# Environment: ${config.target.environment}

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    ${provider} = {
      source  = "hashicorp/${provider}"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "${provider}" {
  region = var.region
}

# Kubernetes cluster
${this.generateTerraformCluster(config)}

# Application resources
${config.components.map(component => this.generateTerraformComponent(component, config)).join('\n\n')}
`;
  }

  private generateTerraformCluster(config: ExtendedDeploymentConfig): string {
    const provider = config.target.provider.name;
    
    switch (provider) {
      case 'aws':
        return `
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = var.cluster_name
  cluster_version = "1.27"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    main = {
      desired_capacity = var.node_count
      max_capacity     = var.max_node_count
      min_capacity     = var.min_node_count
      
      instance_types = [var.instance_type]
    }
  }
}`;
      case 'gcp':
        return `
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region
  
  initial_node_count = var.node_count
  
  node_config {
    machine_type = var.instance_type
    disk_size_gb = 20
  }
}`;
      default:
        return '# Cluster configuration for ' + provider;
    }
  }

  private generateTerraformComponent(component: Component, config: ExtendedDeploymentConfig): string {
    return `# ${component.name} component
resource "kubernetes_deployment" "${component.name.toLowerCase()}" {
  metadata {
    name      = "${component.name.toLowerCase()}"
    namespace = kubernetes_namespace.main.metadata[0].name
    
    labels = {
      app       = "${component.name.toLowerCase()}"
      component = "${component.type}"
      system    = "${config.systemId}"
    }
  }
  
  spec {
    replicas = var.${component.name.toLowerCase()}_replicas
    
    selector {
      match_labels = {
        app = "${component.name.toLowerCase()}"
      }
    }
    
    template {
      metadata {
        labels = {
          app       = "${component.name.toLowerCase()}"
          component = "${component.type}"
        }
      }
      
      spec {
        container {
          name  = "${component.name.toLowerCase()}"
          image = "${this.getComponentImage(component)}"
          
          port {
            container_port = ${this.getComponentPorts(component).container[0].port}
          }
          
          resources {
            requests = {
              memory = var.${component.name.toLowerCase()}_memory_request
              cpu    = var.${component.name.toLowerCase()}_cpu_request
            }
            limits = {
              memory = var.${component.name.toLowerCase()}_memory_limit
              cpu    = var.${component.name.toLowerCase()}_cpu_limit
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "${component.name.toLowerCase()}" {
  metadata {
    name      = "${component.name.toLowerCase()}-service"
    namespace = kubernetes_namespace.main.metadata[0].name
  }
  
  spec {
    selector = {
      app = "${component.name.toLowerCase()}"
    }
    
    port {
      port        = 80
      target_port = ${this.getComponentPorts(component).container[0].port}
    }
    
    type = "${this.getServiceType(component, config)}"
  }
}`;
  }

  private generateTerraformVariables(config: ExtendedDeploymentConfig): string {
    return `variable "region" {
  description = "Cloud provider region"
  type        = string
  default     = "${config.target.provider.region || 'us-west-2'}"
}

variable "cluster_name" {
  description = "Kubernetes cluster name"
  type        = string
  default     = "${config.systemId}-cluster"
}

variable "node_count" {
  description = "Number of worker nodes"
  type        = number
  default     = ${config.target.scaling?.minReplicas || 2}
}

variable "max_node_count" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = ${config.target.scaling?.maxReplicas || 10}
}

variable "min_node_count" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = ${config.target.scaling?.minReplicas || 1}
}

variable "instance_type" {
  description = "Instance type for worker nodes"
  type        = string
  default     = "t3.medium"
}

${config.components.map(component => `
variable "${component.name.toLowerCase()}_replicas" {
  description = "Number of replicas for ${component.name}"
  type        = number
  default     = 1
}

variable "${component.name.toLowerCase()}_memory_request" {
  description = "Memory request for ${component.name}"
  type        = string
  default     = "128Mi"
}

variable "${component.name.toLowerCase()}_memory_limit" {
  description = "Memory limit for ${component.name}"
  type        = string
  default     = "256Mi"
}

variable "${component.name.toLowerCase()}_cpu_request" {
  description = "CPU request for ${component.name}"
  type        = string
  default     = "100m"
}

variable "${component.name.toLowerCase()}_cpu_limit" {
  description = "CPU limit for ${component.name}"
  type        = string
  default     = "200m"
}`).join('')}
`;
  }

  private generateTerraformOutputs(config: ExtendedDeploymentConfig): string {
    return `output "cluster_endpoint" {
  description = "Kubernetes cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "Kubernetes cluster name"
  value       = module.eks.cluster_id
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

${config.components.map(component => `
output "${component.name.toLowerCase()}_service_url" {
  description = "Service URL for ${component.name}"
  value       = "http://\${kubernetes_service.${component.name.toLowerCase()}.status.0.load_balancer.0.ingress.0.hostname}"
}`).join('')}
`;
  }

  private generateTerraformVersions(config: ExtendedDeploymentConfig): string {
    return `terraform {
  required_version = ">= 1.0"
  
  required_providers {
    ${config.target.provider.name} = {
      source  = "hashicorp/${config.target.provider.name}"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}
`;
  }

  private generateHelmChart(config: ExtendedDeploymentConfig): Record<string, string> {
    return {
      'Chart.yaml': this.generateHelmChartYaml(config),
      'values.yaml': this.generateHelmValues(config),
      'templates/deployment.yaml': this.generateHelmDeploymentTemplate(config),
      'templates/service.yaml': this.generateHelmServiceTemplate(config),
      'templates/ingress.yaml': this.generateHelmIngressTemplate(config),
      'templates/configmap.yaml': this.generateHelmConfigMapTemplate(config),
      'templates/secrets.yaml': this.generateHelmSecretsTemplate(config),
      'templates/_helpers.tpl': this.generateHelmHelpers(config)
    };
  }

  private generateHelmChartYaml(config: ExtendedDeploymentConfig): string {
    return `apiVersion: v2
name: ${config.systemId}
description: A Helm chart for ${config.systemId}
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - scalesim
  - microservices
  - ${config.target.environment}
maintainers:
  - name: ScaleSim
    email: support@scalesim.io
`;
  }

  private generateHelmValues(config: ExtendedDeploymentConfig): string {
    return `# Default values for ${config.systemId}
# This is a YAML-formatted file.

global:
  environment: ${config.target.environment}
  namespace: ${config.namespace || 'default'}

replicaCount: ${config.target.scaling?.minReplicas || 1}

image:
  repository: ${config.systemId}
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ${config.target.environment === 'production' ? 'LoadBalancer' : 'ClusterIP'}
  port: 80

ingress:
  enabled: ${config.ingress?.enabled || false}
  className: ${config.ingress?.className || 'nginx'}
  annotations: {}
  hosts:
    - host: ${config.domain || config.systemId + '.local'}
      paths:
        - path: /
          pathType: Prefix
  tls: []

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: ${!!config.target.scaling}
  minReplicas: ${config.target.scaling?.minReplicas || 1}
  maxReplicas: ${config.target.scaling?.maxReplicas || 10}
  targetCPUUtilizationPercentage: ${config.target.scaling?.targetCPU || 80}

nodeSelector: {}

tolerations: []

affinity: {}

monitoring:
  enabled: ${config.target.monitoring?.enabled || false}
  prometheus: ${config.target.monitoring?.prometheus || false}
  grafana: ${config.target.monitoring?.grafana || false}

security:
  networkPolicies: ${config.target.security?.networkPolicies || false}
  rbac: ${config.target.security?.rbac || false}
  podSecurityPolicies: ${config.target.security?.podSecurityPolicies || false}

persistence:
  enabled: ${config.persistence?.enabled || false}
  storageClass: ${config.persistence?.storageClass || 'standard'}
  size: ${config.persistence?.size || '10Gi'}

${config.components.map(component => `
${component.name.toLowerCase()}:
  enabled: true
  image: ${this.getComponentImage(component)}
  replicas: 1
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"`).join('')}
`;
  }

  private generateHelmDeploymentTemplate(config: ExtendedDeploymentConfig): string {
    return `{{- range $component := .Values.components }}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "${config.systemId}.fullname" $ }}-{{ $component.name }}
  labels:
    {{- include "${config.systemId}.labels" $ | nindent 4 }}
    component: {{ $component.name }}
spec:
  {{- if not $.Values.autoscaling.enabled }}
  replicas: {{ $component.replicas | default 1 }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "${config.systemId}.selectorLabels" $ | nindent 6 }}
      component: {{ $component.name }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") $ | sha256sum }}
      labels:
        {{- include "${config.systemId}.selectorLabels" $ | nindent 8 }}
        component: {{ $component.name }}
    spec:
      containers:
        - name: {{ $component.name }}
          image: "{{ $component.image }}"
          imagePullPolicy: {{ $.Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
          livenessProbe:
            httpGet:
              path: /health
              port: http
          readinessProbe:
            httpGet:
              path: /health
              port: http
          resources:
            {{- toYaml $component.resources | nindent 12 }}
          env:
            - name: ENVIRONMENT
              value: {{ $.Values.global.environment }}
            - name: COMPONENT_NAME
              value: {{ $component.name }}
{{- end }}
`;
  }

  private generateHelmServiceTemplate(config: ExtendedDeploymentConfig): string {
    return `{{- range $component := .Values.components }}
---
apiVersion: v1
kind: Service
metadata:
  name: {{ include "${config.systemId}.fullname" $ }}-{{ $component.name }}
  labels:
    {{- include "${config.systemId}.labels" $ | nindent 4 }}
    component: {{ $component.name }}
spec:
  type: {{ $.Values.service.type }}
  ports:
    - port: {{ $.Values.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    {{- include "${config.systemId}.selectorLabels" $ | nindent 4 }}
    component: {{ $component.name }}
{{- end }}
`;
  }

  private generateHelmIngressTemplate(config: ExtendedDeploymentConfig): string {
    return `{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "${config.systemId}.fullname" . }}
  labels:
    {{- include "${config.systemId}.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  {{- if .Values.ingress.tls }}
  tls:
    {{- range .Values.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            {{- if .pathType }}
            pathType: {{ .pathType }}
            {{- end }}
            backend:
              service:
                name: {{ include "${config.systemId}.fullname" $ }}
                port:
                  number: {{ $.Values.service.port }}
          {{- end }}
    {{- end }}
{{- end }}
`;
  }

  private generateHelmConfigMapTemplate(config: ExtendedDeploymentConfig): string {
    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "${config.systemId}.fullname" . }}
  labels:
    {{- include "${config.systemId}.labels" . | nindent 4 }}
data:
  environment: {{ .Values.global.environment }}
  system-id: {{ .Chart.Name }}
  monitoring-enabled: {{ .Values.monitoring.enabled | quote }}
`;
  }

  private generateHelmSecretsTemplate(config: ExtendedDeploymentConfig): string {
    return `apiVersion: v1
kind: Secret
metadata:
  name: {{ include "${config.systemId}.fullname" . }}
  labels:
    {{- include "${config.systemId}.labels" . | nindent 4 }}
type: Opaque
data:
  # Add your base64 encoded secrets here
  # database-password: {{ .Values.secrets.databasePassword | b64enc }}
`;
  }

  private generateHelmHelpers(config: ExtendedDeploymentConfig): string {
    return `{{/*
Expand the name of the chart.
*/}}
{{- define "${config.systemId}.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "${config.systemId}.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "${config.systemId}.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "${config.systemId}.labels" -}}
helm.sh/chart: {{ include "${config.systemId}.chart" . }}
{{ include "${config.systemId}.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "${config.systemId}.selectorLabels" -}}
app.kubernetes.io/name: {{ include "${config.systemId}.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
`;
  }

  private generateServerlessManifests(config: ExtendedDeploymentConfig): Record<string, string> {
    return {
      'serverless.yml': this.generateServerlessConfig(config),
      'handler.js': this.generateServerlessHandler(config),
      'package.json': this.generateServerlessPackageJson(config)
    };
  }

  private generateServerlessConfig(config: ExtendedDeploymentConfig): string {
    return `service: ${config.systemId}

frameworkVersion: '3'

provider:
  name: ${config.target.provider.name === 'aws' ? 'aws' : 'gcp'}
  runtime: nodejs18.x
  region: ${config.target.provider.region || 'us-west-2'}
  stage: ${config.target.environment}
  
  environment:
    STAGE: \${self:provider.stage}
    SYSTEM_ID: ${config.systemId}

functions:
${config.components
  .filter(c => ['microservice', 'api_gateway'].includes(c.type))
  .map(component => `  ${component.name.toLowerCase()}:
    handler: handler.${component.name.toLowerCase()}
    events:
      - http:
          path: /${component.name.toLowerCase()}/{proxy+}
          method: ANY
          cors: true`).join('\n')}

plugins:
  - serverless-offline
  - serverless-webpack

custom:
  webpack:
    webpackConfig: ./webpack.config.js
    includeModules: true
`;
  }

  private generateServerlessHandler(config: ExtendedDeploymentConfig): string {
    return `'use strict';

${config.components
  .filter(c => ['microservice', 'api_gateway'].includes(c.type))
  .map(component => `
module.exports.${component.name.toLowerCase()} = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message: '${component.name} function executed successfully!',
      input: event,
    }),
  };
};`).join('')}
`;
  }

  private generateServerlessPackageJson(config: ExtendedDeploymentConfig): string {
    return `{
  "name": "${config.systemId}",
  "version": "1.0.0",
  "description": "Serverless deployment for ${config.systemId}",
  "main": "handler.js",
  "scripts": {
    "deploy": "serverless deploy",
    "remove": "serverless remove",
    "logs": "serverless logs -f",
    "offline": "serverless offline"
  },
  "devDependencies": {
    "serverless": "^3.0.0",
    "serverless-offline": "^12.0.0",
    "serverless-webpack": "^5.0.0",
    "webpack": "^5.0.0"
  },
  "dependencies": {
    "aws-lambda": "^1.0.7"
  }
}`;
  }

  // Utility methods
  private yamlStringify(obj: any): string {
    // Simple YAML stringifier - in production, use a proper YAML library
    return JSON.stringify(obj, null, 2)
      .replace(/"/g, '')
      .replace(/,/g, '')
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/\[/g, '')
      .replace(/\]/g, '');
  }

  private generatePVC(component: Component, config: ExtendedDeploymentConfig): string {
    return `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${component.name.toLowerCase()}-pvc
  namespace: ${config.namespace || 'default'}
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ${config.persistence?.storageClass || 'standard'}
  resources:
    requests:
      storage: ${config.persistence?.size || '10Gi'}
`;
  }

  private generateRedisConfig(component: Component, config: ExtendedDeploymentConfig): string {
    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${component.name.toLowerCase()}-config
  namespace: ${config.namespace || 'default'}
data:
  redis.conf: |
    maxmemory 256mb
    maxmemory-policy allkeys-lru
    save 900 1
    save 300 10
    save 60 10000
`;
  }

  private generateKafkaConfig(component: Component, config: ExtendedDeploymentConfig): string {
    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${component.name.toLowerCase()}-config
  namespace: ${config.namespace || 'default'}
data:
  server.properties: |
    broker.id=1
    listeners=PLAINTEXT://0.0.0.0:9092
    advertised.listeners=PLAINTEXT://localhost:9092
    num.network.threads=3
    num.io.threads=8
    socket.send.buffer.bytes=102400
    socket.receive.buffer.bytes=102400
    socket.request.max.bytes=104857600
    log.dirs=/var/lib/kafka/data
    num.partitions=1
    num.recovery.threads.per.data.dir=1
    offsets.topic.replication.factor=1
    transaction.state.log.replication.factor=1
    transaction.state.log.min.isr=1
    log.retention.hours=168
    log.segment.bytes=1073741824
    log.retention.check.interval.ms=300000
    zookeeper.connect=zookeeper:2181
    zookeeper.connection.timeout.ms=18000
    group.initial.rebalance.delay.ms=0
`;
  }

  private generateMLModelServing(component: Component, config: ExtendedDeploymentConfig): string {
    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${component.name.toLowerCase()}-model-config
  namespace: ${config.namespace || 'default'}
data:
  model_config.json: |
    {
      "model_name": "${component.name}",
      "model_version": "1.0.0",
      "model_path": "/models/${component.name}",
      "batch_size": 32,
      "max_batch_delay": 100,
      "instance_group": [
        {
          "name": "default",
          "kind": "KIND_GPU",
          "count": 1
        }
      ]
    }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${component.name.toLowerCase()}-serving
  namespace: ${config.namespace || 'default'}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${component.name.toLowerCase()}-serving
  template:
    metadata:
      labels:
        app: ${component.name.toLowerCase()}-serving
    spec:
      containers:
      - name: triton-server
        image: nvcr.io/nvidia/tritonserver:23.04-py3
        ports:
        - containerPort: 8000
          name: http
        - containerPort: 8001
          name: grpc
        - containerPort: 8002
          name: metrics
        volumeMounts:
        - name: model-repository
          mountPath: /models
        - name: model-config
          mountPath: /config
        command:
        - tritonserver
        - --model-repository=/models
        - --model-config-name=model_config.json
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
            nvidia.com/gpu: 1
      volumes:
      - name: model-repository
        persistentVolumeClaim:
          claimName: ${component.name.toLowerCase()}-model-pvc
      - name: model-config
        configMap:
          name: ${component.name.toLowerCase()}-model-config
`;
  }

  private generateNetworkPolicies(config: ExtendedDeploymentConfig): string {
    return `# Default deny all ingress traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: ${config.namespace || 'default'}
spec:
  podSelector: {}
  policyTypes:
  - Ingress
---
# Allow ingress from same namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-same-namespace
  namespace: ${config.namespace || 'default'}
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ${config.namespace || 'default'}
---
# Allow ingress to API Gateway
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-gateway-ingress
  namespace: ${config.namespace || 'default'}
spec:
  podSelector:
    matchLabels:
      component: api_gateway
  policyTypes:
  - Ingress
  ingress:
  - from: []
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
`;
  }

  private generateRBAC(config: ExtendedDeploymentConfig): string {
    return `apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${config.systemId}-service-account
  namespace: ${config.namespace || 'default'}
  labels:
    app: ${config.systemId}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: ${config.namespace || 'default'}
  name: ${config.systemId}-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ${config.systemId}-role-binding
  namespace: ${config.namespace || 'default'}
subjects:
- kind: ServiceAccount
  name: ${config.systemId}-service-account
  namespace: ${config.namespace || 'default'}
roleRef:
  kind: Role
  name: ${config.systemId}-role
  apiGroup: rbac.authorization.k8s.io
`;
  }

  private generatePersistence(config: ExtendedDeploymentConfig): string {
    return `# Storage Class
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ${config.systemId}-storage
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  fsType: ext4
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
---
# Persistent Volume Claims for stateful components
${config.components
  .filter(c => ['database', 'cache', 'message_queue'].includes(c.type))
  .map(component => `
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${component.name.toLowerCase()}-pvc
  namespace: ${config.namespace || 'default'}
  labels:
    app: ${component.name.toLowerCase()}
    component: ${component.type}
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ${config.persistence?.storageClass || config.systemId + '-storage'}
  resources:
    requests:
      storage: ${config.persistence?.size || '10Gi'}
`).join('---')}
`;
  }
} 