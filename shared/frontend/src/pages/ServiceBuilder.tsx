import React, { useState } from 'react';
import { ChevronDownIcon, PlayIcon, CloudArrowDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { CodeEditor } from '@/components/editors/CodeEditor';
import { CodeGenerator, ServiceConfig, EndpointConfig } from '@/components/builders/CodeGenerator';
import JSZip from 'jszip';

const iconStyle = {
  width: '1rem',
  height: '1rem',
  maxWidth: '1rem',
  maxHeight: '1rem'
};

export default function ServiceBuilder() {
  const [selectedFramework, setSelectedFramework] = useState('spring-boot');
  const [serviceName, setServiceName] = useState('MyService');
  const [selectedDatabase, setSelectedDatabase] = useState('postgresql');
  const [selectedAuth, setSelectedAuth] = useState('jwt');
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>([
    { method: 'GET', path: '/users', description: 'Get all users', requestBody: '', responseType: 'User[]' },
    { method: 'POST', path: '/users', description: 'Create a new user', requestBody: 'User', responseType: 'User' }
  ]);
  const [generatedCode, setGeneratedCode] = useState<{ [filename: string]: string }>({});
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [currentCode, setCurrentCode] = useState('');

  const frameworks = [
    { id: 'spring-boot', name: 'Spring Boot', icon: '☕', description: 'Java enterprise framework' },
    { id: 'django', name: 'Django', icon: '🐍', description: 'Python web framework' },
    { id: 'express', name: 'Express.js', icon: '⚡', description: 'Node.js web framework' },
    { id: 'fastapi', name: 'FastAPI', icon: '🚀', description: 'Modern Python framework' }
  ];

  const databases = [
    { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
    { id: 'mysql', name: 'MySQL', icon: '🗄️' },
    { id: 'mongodb', name: 'MongoDB', icon: '🍃' },
    { id: 'sqlite', name: 'SQLite', icon: '📁' }
  ];

  const generateCode = () => {
    const config: ServiceConfig = {
      name: serviceName,
      framework: selectedFramework,
      database: selectedDatabase,
      authentication: selectedAuth,
      endpoints: endpoints
    };

    try {
      const generated = CodeGenerator.generateServiceCode(config);
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

  const addEndpoint = () => {
    setEndpoints([...endpoints, { 
      method: 'GET', 
      path: '/new-endpoint', 
      description: 'New endpoint',
      requestBody: '',
      responseType: 'any'
    }]);
  };

  const updateEndpoint = (index: number, field: keyof EndpointConfig, value: string) => {
    const updated = [...endpoints];
    updated[index] = { ...updated[index], [field]: value };
    setEndpoints(updated);
  };

  const removeEndpoint = (index: number) => {
    setEndpoints(endpoints.filter((_, i) => i !== index));
  };

  const downloadCode = () => {
    // Create and download ZIP file with all generated files
    const zip = new JSZip();
    Object.entries(generatedCode).forEach(([filename, content]) => {
      zip.file(filename, content);
    });
    
    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${serviceName.toLowerCase()}-service.zip`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const getLanguageFromFile = (filename: string): string => {
    if (filename.endsWith('.java')) return 'java';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.xml')) return 'xml';
    if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return 'yaml';
    if (filename.startsWith('Dockerfile')) return 'dockerfile';
    return 'text';
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
          🔧 Service Builder
        </h1>
        <p
          className="text-gray-600 dark:text-gray-400 mt-2"
          style={{ color: '#4b5563', marginTop: '0.5rem' }}
        >
          Generate production-ready microservices with visual configuration
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
            Service Configuration
          </h2>

          {/* Service Name */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}
            >
              Service Name
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
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
              Framework
            </label>
            <div className="grid grid-cols-2 gap-2">
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
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{framework.icon}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{framework.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{framework.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Database Selection */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}
            >
              Database
            </label>
            <div className="grid grid-cols-2 gap-2">
              {databases.map((db) => (
                <button
                  key={db.id}
                  onClick={() => setSelectedDatabase(db.id)}
                  className={`p-2 border rounded-md text-center ${
                    selectedDatabase === db.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  style={{
                    padding: '0.5rem',
                    border: selectedDatabase === db.id ? '1px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    backgroundColor: selectedDatabase === db.id ? '#eff6ff' : 'transparent',
                    color: selectedDatabase === db.id ? '#1d4ed8' : '#374151'
                  }}
                >
                  <div style={{ fontSize: '1.25rem' }}>{db.icon}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{db.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Endpoints */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}
              >
                API Endpoints
              </label>
              <button
                onClick={addEndpoint}
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
                Add Endpoint
              </button>
            </div>
            <div className="space-y-2">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex gap-2 p-2 border border-gray-200 rounded-md"
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem'
                  }}
                >
                  <select
                    value={endpoint.method}
                    onChange={(e) => updateEndpoint(index, 'method', e.target.value)}
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
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <input
                    type="text"
                    value={endpoint.path}
                    onChange={(e) => updateEndpoint(index, 'path', e.target.value)}
                    placeholder="/endpoint"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    style={{
                      flex: '1 1 0%',
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                      paddingTop: '0.25rem',
                      paddingBottom: '0.25rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                  />
                  <input
                    type="text"
                    value={endpoint.description}
                    onChange={(e) => updateEndpoint(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    style={{
                      flex: '1 1 0%',
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                      paddingTop: '0.25rem',
                      paddingBottom: '0.25rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                  />
                  <button
                    onClick={() => removeEndpoint(index)}
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
                    ×
                  </button>
                </div>
              ))}
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
            Generate Service Code
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
                Generated Code
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
                  <p>Configure your service and click "Generate Service Code" to see the code</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 