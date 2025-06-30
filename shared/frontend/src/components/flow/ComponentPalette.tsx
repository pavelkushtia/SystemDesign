import React, { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ComponentCategory {
  name: string;
  components: ComponentDefinition[];
}

interface ComponentDefinition {
  type: string;
  name: string;
  icon: React.ComponentType<any> | string; // Can be component or URL
  description: string;
  color: string;
  logoUrl?: string; // Official logo URL
}

// Custom Logo Components for better visual appeal
const AWSLogo = () => (
  <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">
    AWS
  </div>
);

const KubernetesLogo = () => (
  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
    K8s
  </div>
);

const DockerLogo = () => (
  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs">
    🐳
  </div>
);

const PostgreSQLLogo = () => (
  <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white font-bold text-xs">
    🐘
  </div>
);

const RedisLogo = () => (
  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">
    Redis
  </div>
);

const KafkaLogo = () => (
  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white font-bold text-xs">
    ⚡
  </div>
);

const NginxLogo = () => (
  <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">
    nginx
  </div>
);

const PyTorchLogo = () => (
  <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-xs">
    🔥
  </div>
);

const TensorFlowLogo = () => (
  <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center text-white font-bold text-xs">
    TF
  </div>
);

const PrometheusLogo = () => (
  <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">
    📊
  </div>
);

const GrafanaLogo = () => (
  <div className="w-8 h-8 bg-orange-700 rounded flex items-center justify-center text-white font-bold text-xs">
    📈
  </div>
);

const ElasticsearchLogo = () => (
  <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white font-bold text-xs">
    🔍
  </div>
);

const MongoDBLogo = () => (
  <div className="w-8 h-8 bg-green-700 rounded flex items-center justify-center text-white font-bold text-xs">
    🍃
  </div>
);

const MySQLLogo = () => (
  <div className="w-8 h-8 bg-blue-800 rounded flex items-center justify-center text-white font-bold text-xs">
    🐬
  </div>
);

const GenericIcon = ({ emoji, bgColor }: { emoji: string; bgColor: string }) => (
  <div className={`w-8 h-8 ${bgColor} rounded flex items-center justify-center text-white text-lg`}>
    {emoji}
  </div>
);

const componentCategories: ComponentCategory[] = [
  {
    name: 'Infrastructure',
    components: [
      {
        type: 'load_balancer',
        name: 'Load Balancer',
        icon: NginxLogo,
        description: 'Distribute incoming requests',
        color: 'bg-green-600',
      },
      {
        type: 'api_gateway',
        name: 'API Gateway',
        icon: () => <GenericIcon emoji="🚪" bgColor="bg-indigo-500" />,
        description: 'Central API management',
        color: 'bg-indigo-500',
      },
      {
        type: 'microservice',
        name: 'Microservice',
        icon: DockerLogo,
        description: 'Independent service component',
        color: 'bg-blue-500',
      },
      {
        type: 'kubernetes',
        name: 'Kubernetes',
        icon: KubernetesLogo,
        description: 'Container orchestration',
        color: 'bg-blue-600',
      },
    ],
  },
  {
    name: 'Databases',
    components: [
      {
        type: 'postgresql',
        name: 'PostgreSQL',
        icon: PostgreSQLLogo,
        description: 'Relational database',
        color: 'bg-blue-700',
      },
      {
        type: 'mongodb',
        name: 'MongoDB',
        icon: MongoDBLogo,
        description: 'Document database',
        color: 'bg-green-700',
      },
      {
        type: 'mysql',
        name: 'MySQL',
        icon: MySQLLogo,
        description: 'Relational database',
        color: 'bg-blue-800',
      },
      {
        type: 'redis',
        name: 'Redis',
        icon: RedisLogo,
        description: 'In-memory cache',
        color: 'bg-red-600',
      },
    ],
  },
  {
    name: 'Messaging',
    components: [
      {
        type: 'kafka',
        name: 'Apache Kafka',
        icon: KafkaLogo,
        description: 'Event streaming platform',
        color: 'bg-gray-800',
      },
      {
        type: 'rabbitmq',
        name: 'RabbitMQ',
        icon: () => <GenericIcon emoji="🐰" bgColor="bg-orange-600" />,
        description: 'Message broker',
        color: 'bg-orange-600',
      },
      {
        type: 'pulsar',
        name: 'Apache Pulsar',
        icon: () => <GenericIcon emoji="⚡" bgColor="bg-purple-600" />,
        description: 'Cloud-native messaging',
        color: 'bg-purple-600',
      },
    ],
  },
  {
    name: 'Machine Learning',
    components: [
      {
        type: 'pytorch',
        name: 'PyTorch',
        icon: PyTorchLogo,
        description: 'Deep learning framework',
        color: 'bg-orange-600',
      },
      {
        type: 'tensorflow',
        name: 'TensorFlow',
        icon: TensorFlowLogo,
        description: 'ML platform',
        color: 'bg-yellow-600',
      },
      {
        type: 'mlflow',
        name: 'MLflow',
        icon: () => <GenericIcon emoji="🤖" bgColor="bg-blue-600" />,
        description: 'ML lifecycle management',
        color: 'bg-blue-600',
      },
      {
        type: 'kubeflow',
        name: 'Kubeflow',
        icon: () => <GenericIcon emoji="🧠" bgColor="bg-indigo-600" />,
        description: 'ML on Kubernetes',
        color: 'bg-indigo-600',
      },
    ],
  },
  {
    name: 'Observability',
    components: [
      {
        type: 'prometheus',
        name: 'Prometheus',
        icon: PrometheusLogo,
        description: 'Monitoring system',
        color: 'bg-orange-500',
      },
      {
        type: 'grafana',
        name: 'Grafana',
        icon: GrafanaLogo,
        description: 'Analytics platform',
        color: 'bg-orange-700',
      },
      {
        type: 'elasticsearch',
        name: 'Elasticsearch',
        icon: ElasticsearchLogo,
        description: 'Search and analytics',
        color: 'bg-yellow-500',
      },
      {
        type: 'jaeger',
        name: 'Jaeger',
        icon: () => <GenericIcon emoji="🔍" bgColor="bg-purple-500" />,
        description: 'Distributed tracing',
        color: 'bg-purple-500',
      },
    ],
  },
  {
    name: 'Cloud Services',
    components: [
      {
        type: 'aws_s3',
        name: 'AWS S3',
        icon: AWSLogo,
        description: 'Object storage',
        color: 'bg-orange-500',
      },
      {
        type: 'aws_lambda',
        name: 'AWS Lambda',
        icon: () => <GenericIcon emoji="λ" bgColor="bg-orange-500" />,
        description: 'Serverless compute',
        color: 'bg-orange-500',
      },
      {
        type: 'aws_rds',
        name: 'AWS RDS',
        icon: () => <GenericIcon emoji="💾" bgColor="bg-orange-500" />,
        description: 'Managed database',
        color: 'bg-orange-500',
      },
    ],
  },
];

interface ComponentPaletteProps {
  className?: string;
}

export function ComponentPalette({ className = '' }: ComponentPaletteProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const onDragStart = (
    event: React.DragEvent,
    componentType: string,
    componentName: string
  ) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.setData('application/name', componentName);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Mobile overlay
  if (window.innerWidth < 768) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-20 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border border-gray-200 md:hidden"
        >
          <Bars3Icon className="w-5 h-5 text-gray-600" />
        </button>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileOpen(false)}
            />
            
            {/* Panel */}
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Components</h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ComponentList onDragStart={onDragStart} />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop version
  return (
    <div 
      className={`relative bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-80'
      } ${className}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 z-10 p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Components</h2>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isCollapsed ? (
          <CollapsedView />
        ) : (
          <div className="p-4">
            <ComponentList onDragStart={onDragStart} />
          </div>
        )}
      </div>
    </div>
  );
}

// Collapsed view shows just category icons
function CollapsedView() {
     return (
     <div className="p-2 space-y-3">
       {componentCategories.map((category) => (
         <div
           key={category.name}
           className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
           title={category.name}
         >
          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mb-1">
            <span className="text-xs font-medium text-gray-600">
              {category.name.charAt(0)}
            </span>
          </div>
          <span className="text-xs text-gray-500 text-center leading-tight">
            {category.name.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

// Main component list
function ComponentList({ onDragStart }: { onDragStart: (event: React.DragEvent, type: string, name: string) => void }) {
  return (
    <div className="space-y-6">
      {componentCategories.map((category) => (
        <div key={category.name}>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <span className="flex-1">{category.name}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {category.components.length}
            </span>
          </h3>
          <div className="space-y-2">
            {category.components.map((component) => (
              <div
                key={component.type}
                className="group flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200"
                draggable
                onDragStart={(e) => onDragStart(e, component.type, component.name)}
              >
                <div className="mr-3 flex-shrink-0">
                  <component.icon />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-800">
                    {component.name}
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600">
                    {component.description}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 