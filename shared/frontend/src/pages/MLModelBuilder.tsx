import React, { useState } from 'react';
import { PlayIcon, CloudArrowDownIcon, DocumentTextIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CodeEditor } from '@/components/editors/CodeEditor';
import { CodeGenerator, MLModelConfig, LayerConfig } from '@/components/builders/CodeGenerator';
import JSZip from 'jszip';

const iconStyle = {
  width: '1rem',
  height: '1rem',
  maxWidth: '1rem',
  maxHeight: '1rem'
};

export default function MLModelBuilder() {
  const [modelName, setModelName] = useState('MyModel');
  const [selectedFramework, setSelectedFramework] = useState('pytorch');
  const [taskType, setTaskType] = useState('classification');
  const [architecture, setArchitecture] = useState<LayerConfig[]>([
    { type: 'linear', config: { in_features: 784, out_features: 128 } },
    { type: 'relu', config: {} },
    { type: 'dropout', config: { p: 0.2 } },
    { type: 'linear', config: { in_features: 128, out_features: 10 } }
  ]);
  const [hyperparameters, setHyperparameters] = useState({
    learning_rate: 0.001,
    epochs: 10,
    batch_size: 32
  });
  const [generatedCode, setGeneratedCode] = useState<{ [filename: string]: string }>({});
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [currentCode, setCurrentCode] = useState('');

  const frameworks = [
    { id: 'pytorch', name: 'PyTorch', icon: '🔥', description: 'Dynamic neural networks' },
    { id: 'tensorflow', name: 'TensorFlow', icon: '🧠', description: 'Production ML platform' },
    { id: 'scikit-learn', name: 'Scikit-learn', icon: '📊', description: 'Traditional ML algorithms' }
  ];

  const taskTypes = [
    { id: 'classification', name: 'Classification', icon: '🎯', description: 'Categorize data' },
    { id: 'regression', name: 'Regression', icon: '📈', description: 'Predict continuous values' },
    { id: 'clustering', name: 'Clustering', icon: '🔗', description: 'Group similar data' },
    { id: 'nlp', name: 'NLP', icon: '📝', description: 'Natural language processing' }
  ];

  const layerTypes = [
    { id: 'linear', name: 'Linear/Dense', params: ['in_features', 'out_features'] },
    { id: 'conv2d', name: 'Conv2D', params: ['in_channels', 'out_channels', 'kernel_size'] },
    { id: 'relu', name: 'ReLU', params: [] },
    { id: 'dropout', name: 'Dropout', params: ['p'] },
    { id: 'lstm', name: 'LSTM', params: ['input_size', 'hidden_size'] }
  ];

  const generateCode = () => {
    const config: MLModelConfig = {
      name: modelName,
      framework: selectedFramework,
      taskType: taskType,
      architecture: architecture,
      hyperparameters: hyperparameters
    };

    try {
      const generated = CodeGenerator.generateMLModelCode(config);
      setGeneratedCode(generated);
      
      // Select the first file by default
      const firstFile = Object.keys(generated)[0];
      if (firstFile) {
        setSelectedFile(firstFile);
        setCurrentCode(generated[firstFile]);
      }
    } catch (error) {
      console.error('Code generation failed:', error);
      alert('Code generation failed: ' + (error as Error).message);
    }
  };

  const addLayer = () => {
    setArchitecture([...architecture, { type: 'linear', config: { in_features: 128, out_features: 64 } }]);
  };

  const updateLayer = (index: number, field: string, value: any) => {
    const updated = [...architecture];
    if (field === 'type') {
      updated[index] = { type: value, config: {} };
    } else {
      updated[index] = { ...updated[index], config: { ...updated[index].config, [field]: value } };
    }
    setArchitecture(updated);
  };

  const removeLayer = (index: number) => {
    setArchitecture(architecture.filter((_, i) => i !== index));
  };

  const downloadCode = () => {
    const zip = new JSZip();
    Object.entries(generatedCode).forEach(([filename, content]) => {
      zip.file(filename, content);
    });
    
    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelName.toLowerCase()}-model.zip`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const getLanguageFromFile = (filename: string): string => {
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.txt')) return 'text';
    if (filename.startsWith('Dockerfile')) return 'dockerfile';
    return 'text';
  };

  const updateHyperparameter = (key: string, value: any) => {
    setHyperparameters({ ...hyperparameters, [key]: value });
  };

  return (
    <div
      className="space-y-6"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}
    >
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}
        >
          🤖 ML Model Builder
        </h1>
        <p
          className="text-gray-600 dark:text-gray-400 mt-2"
          style={{ color: '#4b5563', marginTop: '0.5rem' }}
        >
          Build and train machine learning models with visual architecture design
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            padding: '1.5rem'
          }}
        >
          <h2
            className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}
          >
            Model Configuration
          </h2>

          {/* Model Name */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}
            >
              Model Name
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                width: '100%',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Framework Selection */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}
            >
              ML Framework
            </label>
            <div className="grid grid-cols-1 gap-2">
              {frameworks.map((framework) => (
                <button
                  key={framework.id}
                  onClick={() => setSelectedFramework(framework.id)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedFramework === framework.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  style={{
                    padding: '0.75rem',
                    border: selectedFramework === framework.id ? '1px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    textAlign: 'left',
                    transition: 'all 0.15s ease-in-out',
                    backgroundColor: selectedFramework === framework.id ? '#eff6ff' : 'transparent',
                    color: selectedFramework === framework.id ? '#1d4ed8' : '#374151'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div style={{ fontSize: '1.5rem' }}>{framework.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{framework.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{framework.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Task Type */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}
            >
              Task Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {taskTypes.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setTaskType(task.id)}
                  className={`p-2 border rounded-md text-center ${
                    taskType === task.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  style={{
                    padding: '0.5rem',
                    border: taskType === task.id ? '1px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    backgroundColor: taskType === task.id ? '#eff6ff' : 'transparent',
                    color: taskType === task.id ? '#1d4ed8' : '#374151'
                  }}
                >
                  <div style={{ fontSize: '1.25rem' }}>{task.icon}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{task.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Architecture */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}
              >
                Model Architecture
              </label>
              <button
                onClick={addLayer}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                style={{
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.25rem',
                  paddingBottom: '0.25rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontSize: '0.875rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <PlusIcon
                  className="w-4 h-4 inline mr-1"
                  style={{ ...iconStyle, marginRight: '0.25rem', display: 'inline' }}
                />
                Add Layer
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {architecture.map((layer, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-md"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem'
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <select
                      value={layer.type}
                      onChange={(e) => updateLayer(index, 'type', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      style={{
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        paddingTop: '0.25rem',
                        paddingBottom: '0.25rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      {layerTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeLayer(index)}
                      className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      style={{
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        paddingTop: '0.25rem',
                        paddingBottom: '0.25rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        fontSize: '0.875rem',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <TrashIcon
                        className="w-4 h-4"
                        style={iconStyle}
                      />
                    </button>
                  </div>
                  
                  {/* Layer Parameters */}
                  {layerTypes.find(t => t.id === layer.type)?.params.map((param) => (
                    <div key={param} className="mb-2">
                      <label className="block text-xs text-gray-600 mb-1">{param}</label>
                      <input
                        type="number"
                        value={layer.config[param] || ''}
                        onChange={(e) => updateLayer(index, param, parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        style={{
                          width: '100%',
                          paddingLeft: '0.5rem',
                          paddingRight: '0.5rem',
                          paddingTop: '0.25rem',
                          paddingBottom: '0.25rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Hyperparameters */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}
            >
              Hyperparameters
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Learning Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={hyperparameters.learning_rate}
                  onChange={(e) => updateHyperparameter('learning_rate', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  style={{
                    width: '100%',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    paddingTop: '0.25rem',
                    paddingBottom: '0.25rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Epochs</label>
                <input
                  type="number"
                  value={hyperparameters.epochs}
                  onChange={(e) => updateHyperparameter('epochs', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  style={{
                    width: '100%',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    paddingTop: '0.25rem',
                    paddingBottom: '0.25rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Batch Size</label>
                <input
                  type="number"
                  value={hyperparameters.batch_size}
                  onChange={(e) => updateHyperparameter('batch_size', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  style={{
                    width: '100%',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    paddingTop: '0.25rem',
                    paddingBottom: '0.25rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateCode}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: 500,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out'
            }}
          >
            <PlayIcon
              className="w-4 h-4 mr-2"
              style={{ ...iconStyle, marginRight: '0.5rem' }}
            />
            Generate Model Code
          </button>
        </div>

        {/* Code Preview Panel */}
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}
        >
          <div
            className="p-4 border-b border-gray-200 dark:border-gray-700"
            style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-semibold text-gray-900 dark:text-white"
                style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}
              >
                Generated Model Code
              </h2>
              {Object.keys(generatedCode).length > 0 && (
                <button
                  onClick={downloadCode}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    paddingLeft: '0.75rem',
                    paddingRight: '0.75rem',
                    paddingTop: '0.375rem',
                    paddingBottom: '0.375rem',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <CloudArrowDownIcon
                    className="w-4 h-4 mr-1.5"
                    style={{ ...iconStyle, marginRight: '0.375rem' }}
                  />
                  Download ZIP
                </button>
              )}
            </div>

            {/* File Tabs */}
            {Object.keys(generatedCode).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {Object.keys(generatedCode).map((filename) => (
                  <button
                    key={filename}
                    onClick={() => {
                      setSelectedFile(filename);
                      setCurrentCode(generatedCode[filename]);
                    }}
                    className={`px-3 py-1 text-sm rounded-t-md ${
                      selectedFile === filename
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{
                      paddingLeft: '0.75rem',
                      paddingRight: '0.75rem',
                      paddingTop: '0.25rem',
                      paddingBottom: '0.25rem',
                      fontSize: '0.875rem',
                      borderTopLeftRadius: '0.375rem',
                      borderTopRightRadius: '0.375rem',
                      backgroundColor: selectedFile === filename ? '#dbeafe' : '#f3f4f6',
                      color: selectedFile === filename ? '#1d4ed8' : '#374151',
                      border: selectedFile === filename ? '1px solid #93c5fd' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {filename}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: '500px' }}>
            {currentCode ? (
              <CodeEditor
                value={currentCode}
                onChange={setCurrentCode}
                language={getLanguageFromFile(selectedFile)}
                height="500px"
                readOnly={true}
              />
            ) : (
              <div
                className="flex items-center justify-center h-full text-gray-500"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#6b7280'
                }}
              >
                <div className="text-center">
                  <DocumentTextIcon
                    className="w-12 h-12 mx-auto mb-4"
                    style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem auto' }}
                  />
                  <p>Configure your model and click "Generate Model Code" to see the code</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 