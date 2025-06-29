import React from 'react';
import {
  CubeIcon,
  CircleStackIcon,
  CloudIcon,
  ServerIcon,
  CpuChipIcon,
  QueueListIcon,
  ShieldCheckIcon,
  BeakerIcon,
  ChartBarIcon,
  GlobeAltIcon,
  DocumentIcon,
  CameraIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface ComponentCategory {
  name: string;
  components: ComponentDefinition[];
}

interface ComponentDefinition {
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

const componentCategories: ComponentCategory[] = [
  {
    name: 'Infrastructure',
    components: [
      {
        type: 'load_balancer',
        name: 'Load Balancer',
        icon: ShieldCheckIcon,
        description: 'Distribute incoming requests',
        color: 'bg-blue-500',
      },
      {
        type: 'api_gateway',
        name: 'API Gateway',
        icon: GlobeAltIcon,
        description: 'Central API management',
        color: 'bg-indigo-500',
      },
      {
        type: 'microservice',
        name: 'Microservice',
        icon: CubeIcon,
        description: 'Independent service component',
        color: 'bg-green-500',
      },
      {
        type: 'database',
        name: 'Database',
        icon: CircleStackIcon,
        description: 'Data storage and retrieval',
        color: 'bg-purple-500',
      },
      {
        type: 'cache',
        name: 'Cache',
        icon: ServerIcon,
        description: 'In-memory data store',
        color: 'bg-orange-500',
      },
      {
        type: 'message_queue',
        name: 'Message Queue',
        icon: QueueListIcon,
        description: 'Asynchronous messaging',
        color: 'bg-yellow-500',
      },
    ],
  },
  {
    name: 'Machine Learning',
    components: [
      {
        type: 'ml_model',
        name: 'ML Model',
        icon: BeakerIcon,
        description: 'Machine learning model',
        color: 'bg-pink-500',
      },
      {
        type: 'feature_store',
        name: 'Feature Store',
        icon: DocumentIcon,
        description: 'ML feature management',
        color: 'bg-teal-500',
      },
      {
        type: 'model_registry',
        name: 'Model Registry',
        icon: CameraIcon,
        description: 'Model versioning hub',
        color: 'bg-rose-500',
      },
      {
        type: 'training_pipeline',
        name: 'Training Pipeline',
        icon: CpuChipIcon,
        description: 'Model training workflow',
        color: 'bg-violet-500',
      },
    ],
  },
  {
    name: 'Observability',
    components: [
      {
        type: 'monitoring',
        name: 'Monitoring',
        icon: ChartBarIcon,
        description: 'System monitoring',
        color: 'bg-gray-500',
      },
      {
        type: 'logging',
        name: 'Logging',
        icon: DocumentIcon,
        description: 'Log aggregation',
        color: 'bg-slate-500',
      },
      {
        type: 'tracing',
        name: 'Tracing',
        icon: MagnifyingGlassIcon,
        description: 'Distributed tracing',
        color: 'bg-zinc-500',
      },
    ],
  },
  {
    name: 'Storage',
    components: [
      {
        type: 'object_storage',
        name: 'Object Storage',
        icon: CloudIcon,
        description: 'Cloud object storage',
        color: 'bg-cyan-500',
      },
      {
        type: 'compute',
        name: 'Compute',
        icon: CpuChipIcon,
        description: 'Computing resources',
        color: 'bg-red-500',
      },
    ],
  },
];

// Emergency icon style to prevent giant icons
const iconStyle = { 
  width: '1rem', 
  height: '1rem', 
  maxWidth: '1rem', 
  maxHeight: '1rem',
  minWidth: '1rem',
  minHeight: '1rem'
};

export function ComponentPalette() {
  const onDragStart = (
    event: React.DragEvent,
    componentType: string,
    componentName: string
  ) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.setData('application/name', componentName);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className="flex-1 overflow-y-auto p-4"
      style={{ 
        flex: '1 1 0%', 
        overflowY: 'auto', 
        padding: '1rem' 
      }}
    >
      <div 
        className="space-y-6"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        {componentCategories.map((category) => (
          <div 
            key={category.name}
            style={{ marginBottom: '1rem' }}
          >
            <h3 
              className="text-sm font-medium text-gray-900 dark:text-white mb-3"
              style={{ 
                fontSize: '0.875rem', 
                fontWeight: 500, 
                color: '#111827', 
                marginBottom: '0.75rem' 
              }}
            >
              {category.name}
            </h3>
            <div 
              className="space-y-2"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              {category.components.map((component) => (
                <div
                  key={component.type}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  draggable
                  onDragStart={(e) =>
                    onDragStart(e, component.type, component.name)
                  }
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '0.5rem', 
                    cursor: 'move'
                  }}
                >
                  <div 
                    className={`p-2 rounded-md ${component.color} mr-3 flex-shrink-0`}
                    style={{ 
                      padding: '0.5rem', 
                      borderRadius: '0.375rem', 
                      marginRight: '0.75rem', 
                      flexShrink: 0 
                    }}
                  >
                    <component.icon 
                      className="w-4 h-4 text-white" 
                      style={{ ...iconStyle, color: 'white' }}
                    />
                  </div>
                  <div 
                    className="min-w-0 flex-1"
                    style={{ minWidth: 0, flex: '1 1 0%' }}
                  >
                    <p 
                      className="text-sm font-medium text-gray-900 dark:text-white"
                      style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 500, 
                        color: '#111827' 
                      }}
                    >
                      {component.name}
                    </p>
                    <p 
                      className="text-xs text-gray-500 dark:text-gray-400"
                      style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280' 
                      }}
                    >
                      {component.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 