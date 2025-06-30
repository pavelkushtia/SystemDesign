import React, { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  ConnectionMode,
  Node,
  NodeTypes,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node components
import { ComponentNode } from '@/components/flow/ComponentNode';
import { ComponentPalette } from '@/components/flow/ComponentPalette';
import { PropertyPanel } from '@/components/flow/PropertyPanel';
import { SystemToolbar } from '@/components/flow/SystemToolbar';

const nodeTypes: NodeTypes = {
  component: ComponentNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'component',
    position: { x: 250, y: 100 },
    data: {
      componentType: 'load_balancer',
      name: 'Load Balancer',
      config: {
        algorithm: 'round_robin',
        health_check: true,
      },
    },
  },
  {
    id: '2',
    type: 'component',
    position: { x: 450, y: 200 },
    data: {
      componentType: 'microservice',
      name: 'User Service',
      config: {
        framework: 'spring_boot',
        port: 8080,
      },
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'default',
    animated: true,
  },
];

export default function SystemDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [systemName, setSystemName] = useState('Untitled System');
  const [isSimulating, setIsSimulating] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = (event.target as Element)
        .closest('.react-flow')
        ?.getBoundingClientRect();

      if (!reactFlowBounds) return;

      const componentType = event.dataTransfer.getData('application/reactflow');
      const componentName = event.dataTransfer.getData('application/name');

      if (!componentType) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 75, // Center the node
        y: event.clientY - reactFlowBounds.top - 25,
      };

      const newNode: Node = {
        id: `${Date.now()}`,
        type: 'component',
        position,
        data: {
          componentType,
          name: componentName,
          config: getDefaultConfig(componentType),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const getDefaultConfig = (componentType: string) => {
    const configs: Record<string, Record<string, any>> = {
      load_balancer: { algorithm: 'round_robin', health_check: true },
      microservice: { framework: 'spring_boot', port: 8080 },
      database: { type: 'postgresql', replicas: 1 },
      cache: { type: 'redis', ttl: 3600 },
      message_queue: { type: 'kafka', partitions: 3 },
      api_gateway: { auth: 'jwt', rate_limit: 1000 },
      ml_model: { framework: 'pytorch', accelerator: 'gpu' },
      monitoring: { type: 'prometheus', retention: '30d' },
      // New component types
      postgresql: { version: '14', replicas: 1, storage: '10Gi' },
      mongodb: { version: '5.0', replicas: 1, storage: '20Gi' },
      mysql: { version: '8.0', replicas: 1, storage: '10Gi' },
      redis: { version: '7.0', memory: '2Gi', persistence: true },
      kafka: { version: '3.3', partitions: 3, replicas: 1 },
      rabbitmq: { version: '3.11', memory: '1Gi', disk: '5Gi' },
      pulsar: { version: '2.10', bookkeeper_replicas: 3 },
      pytorch: { version: '1.13', gpu: true, replicas: 1 },
      tensorflow: { version: '2.11', gpu: true, serving: true },
      mlflow: { version: '2.1', tracking_uri: 'http://mlflow:5000' },
      kubeflow: { version: '1.6', namespace: 'kubeflow' },
      prometheus: { version: '2.40', retention: '15d', storage: '50Gi' },
      grafana: { version: '9.3', admin_password: 'admin' },
      elasticsearch: { version: '8.5', replicas: 3, storage: '30Gi' },
      jaeger: { version: '1.38', collector_replicas: 2 },
      aws_s3: { bucket_name: 'my-bucket', region: 'us-east-1' },
      aws_lambda: { runtime: 'python3.9', memory: 512, timeout: 30 },
      aws_rds: { engine: 'postgres', instance_class: 'db.t3.micro' },
      kubernetes: { version: '1.25', node_count: 3, node_type: 't3.medium' },
    };
    return configs[componentType] || {};
  };

  const onSave = () => {
    const systemData = {
      name: systemName,
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    
    // TODO: Save to backend
    console.log('Saving system:', systemData);
  };

  const onSimulate = () => {
    setIsSimulating(true);
    // TODO: Start simulation
    setTimeout(() => {
      setIsSimulating(false);
      console.log('Simulation completed');
    }, 3000);
  };

  const onDeploy = () => {
    // TODO: Navigate to deployment page
    console.log('Deploying system');
  };

  const onNodeUpdate = useCallback((updatedNode: Node) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === updatedNode.id ? updatedNode : node
      )
    );
  }, [setNodes]);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Component Palette Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <ComponentPalette />
      </div>

      {/* Main Designer Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <SystemToolbar
            systemName={systemName}
            onSystemNameChange={setSystemName}
            onSave={onSave}
            onSimulate={onSimulate}
            onDeploy={onDeploy}
            isSimulating={isSimulating}
          />
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gray-50 dark:bg-gray-900"
          >
            <Background color="#94a3b8" />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.data?.componentType) {
                  case 'load_balancer':
                    return '#10b981';
                  case 'microservice':
                    return '#3b82f6';
                  case 'database':
                    return '#8b5cf6';
                  case 'cache':
                    return '#ef4444';
                  case 'message_queue':
                    return '#f59e0b';
                  case 'api_gateway':
                    return '#06b6d4';
                  case 'ml_model':
                    return '#ec4899';
                  case 'monitoring':
                    return '#6b7280';
                  default:
                    return '#6b7280';
                }
              }}
              pannable
              zoomable
            />
          </ReactFlow>
        </div>
      </div>

      {/* Property Panel Sidebar */}
      {selectedNode && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <PropertyPanel
            node={selectedNode}
            onNodeUpdate={onNodeUpdate}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  );
} 