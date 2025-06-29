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

// Emergency icon style to prevent giant icons
const iconStyle = { 
  width: '1rem', 
  height: '1rem', 
  maxWidth: '1rem', 
  maxHeight: '1rem',
  minWidth: '1rem',
  minHeight: '1rem'
};

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

  const onDragStart = useCallback((event: React.DragEvent, componentType: string) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onNodeUpdate = useCallback((updatedNode: Node) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === updatedNode.id ? updatedNode : node
      )
    );
  }, [setNodes]);

  return (
    <div 
      className="h-full flex flex-col bg-gray-50 dark:bg-gray-900"
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#f9fafb' 
      }}
    >
      {/* Toolbar */}
      <div 
        className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        style={{ 
          flexShrink: 0, 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e5e7eb' 
        }}
      >
        <SystemToolbar
          systemName={systemName}
          onSystemNameChange={setSystemName}
          onSave={onSave}
          onSimulate={onSimulate}
          onDeploy={onDeploy}
          isSimulating={isSimulating}
        />
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 flex"
        style={{ 
          flex: '1 1 0%', 
          display: 'flex' 
        }}
      >
        {/* Component Palette */}
        <div 
          className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
          style={{ 
            width: '20rem', 
            backgroundColor: 'white', 
            borderRight: '1px solid #e5e7eb', 
            display: 'flex', 
            flexDirection: 'column' 
          }}
        >
          <ComponentPalette />
        </div>

        {/* Main Canvas Area */}
        <div 
          className="flex-1 bg-gray-50 dark:bg-gray-900"
          style={{ 
            flex: '1 1 0%', 
            backgroundColor: '#f9fafb',
            position: 'relative'
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            proOptions={{ hideAttribution: true }}
            style={{ width: '100%', height: '100%' }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Property Panel */}
        {selectedNode && (
          <div 
            className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
            style={{ 
              width: '20rem', 
              backgroundColor: 'white', 
              borderLeft: '1px solid #e5e7eb' 
            }}
          >
            <PropertyPanel 
              node={selectedNode} 
              onNodeUpdate={onNodeUpdate} 
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
} 