import React, { useState } from 'react';
import {
  CloudIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// Emergency icon style to prevent giant icons
const iconStyle = { 
  width: '1rem', 
  height: '1rem', 
  maxWidth: '1rem', 
  maxHeight: '1rem',
  minWidth: '1rem',
  minHeight: '1rem'
};

export default function Deployment() {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const platforms = [
    { id: 'kubernetes', name: 'Kubernetes', icon: '☸️' },
    { id: 'docker-compose', name: 'Docker Compose', icon: '🐳' },
    { id: 'terraform', name: 'Terraform', icon: '🏗️' },
    { id: 'helm', name: 'Helm Charts', icon: '⚓' },
  ];

  const generateDeployment = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedConfig(`# Generated ${selectedPlatform} Configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scalesim-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: scalesim-app`);
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div 
      className="min-h-full bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8"
      style={{ 
        minHeight: '100%', 
        backgroundColor: '#f9fafb', 
        paddingTop: '2rem', 
        paddingBottom: '2rem', 
        paddingLeft: '2rem', 
        paddingRight: '2rem' 
      }}
    >
      <div 
        className="mb-8"
        style={{ marginBottom: '2rem' }}
      >
        <h1 
          className="text-3xl font-bold text-gray-900 dark:text-white flex items-center"
          style={{ 
            fontSize: '1.875rem', 
            fontWeight: 700, 
            color: '#111827', 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}
        >
          <CloudIcon 
            className="h-8 w-8 mr-3 text-brand-500" 
            style={{ ...iconStyle, width: '2rem', height: '2rem', maxWidth: '2rem', maxHeight: '2rem', marginRight: '0.75rem' }}
          />
          Infrastructure Deployment
        </h1>
        <p 
          className="mt-2 text-sm text-gray-600 dark:text-gray-400"
          style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}
        >
          Generate infrastructure as code for your systems
        </p>
      </div>

      <div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}
      >
        <div 
          className="space-y-6"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div 
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
            style={{ 
              backgroundColor: 'white', 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
              borderRadius: '0.5rem', 
              padding: '1.5rem' 
            }}
          >
            <h2 
              className="text-lg font-medium mb-4"
              style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827', marginBottom: '1rem' }}
            >
              Deployment Platform
            </h2>
            <div 
              className="grid grid-cols-2 gap-4"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
            >
              {platforms.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer ${
                    selectedPlatform === p.id ? 'border-brand-500' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPlatform(p.id)}
                  style={{ 
                    padding: '1rem', 
                    border: selectedPlatform === p.id ? '2px solid #0284c7' : '2px solid #e5e7eb', 
                    borderRadius: '0.5rem', 
                    cursor: 'pointer',
                    backgroundColor: 'white'
                  }}
                >
                  <span 
                    className="text-xl"
                    style={{ fontSize: '1.25rem', display: 'block', marginBottom: '0.5rem' }}
                  >
                    {p.icon}
                  </span>
                  <h3 
                    className="font-medium"
                    style={{ fontWeight: 500, color: '#111827' }}
                  >
                    {p.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          <div 
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
            style={{ 
              backgroundColor: 'white', 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
              borderRadius: '0.5rem', 
              padding: '1.5rem' 
            }}
          >
            <h2 
              className="text-lg font-medium mb-4"
              style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827', marginBottom: '1rem' }}
            >
              Configuration
            </h2>
            <div 
              className="space-y-4"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#111827' }}
                >
                  Environment
                </label>
                <select 
                  className="w-full px-3 py-2 border rounded-md"
                  style={{ 
                    width: '100%', 
                    paddingLeft: '0.75rem', 
                    paddingRight: '0.75rem', 
                    paddingTop: '0.5rem', 
                    paddingBottom: '0.5rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    color: '#111827'
                  }}
                >
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                </select>
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#111827' }}
                >
                  Namespace
                </label>
                <input 
                  type="text" 
                  defaultValue="default" 
                  className="w-full px-3 py-2 border rounded-md" 
                  style={{ 
                    width: '100%', 
                    paddingLeft: '0.75rem', 
                    paddingRight: '0.75rem', 
                    paddingTop: '0.5rem', 
                    paddingBottom: '0.5rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    color: '#111827'
                  }}
                />
              </div>
              <button
                onClick={generateDeployment}
                disabled={isGenerating}
                className="w-full bg-brand-600 text-white py-2 px-4 rounded-md hover:bg-brand-700 disabled:opacity-50"
                style={{ 
                  width: '100%', 
                  backgroundColor: '#0284c7', 
                  color: 'white', 
                  paddingTop: '0.5rem', 
                  paddingBottom: '0.5rem', 
                  paddingLeft: '1rem', 
                  paddingRight: '1rem', 
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: isGenerating ? 0.5 : 1
                }}
              >
                {isGenerating ? 'Generating...' : 'Generate Manifests'}
              </button>
            </div>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 shadow rounded-lg"
          style={{ 
            backgroundColor: 'white', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            borderRadius: '0.5rem'
          }}
        >
          <div 
            className="px-6 py-4 border-b"
            style={{ 
              paddingLeft: '1.5rem', 
              paddingRight: '1.5rem', 
              paddingTop: '1rem', 
              paddingBottom: '1rem', 
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            <h2 
              className="text-lg font-medium flex items-center"
              style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827', display: 'flex', alignItems: 'center' }}
            >
              <DocumentTextIcon 
                className="h-5 w-5 mr-2" 
                style={{...iconStyle, marginRight: '0.5rem'}} 
              />
              Generated Manifests
            </h2>
          </div>
          <div 
            className="p-6"
            style={{ padding: '1.5rem' }}
          >
            {generatedConfig ? (
              <div>
                <pre 
                  className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto"
                  style={{ 
                    backgroundColor: '#111827', 
                    color: '#4ade80', 
                    padding: '1rem', 
                    borderRadius: '0.375rem', 
                    fontSize: '0.875rem', 
                    overflowX: 'auto',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                >
                  <code>{generatedConfig}</code>
                </pre>
                <div 
                  className="mt-4 flex space-x-4"
                  style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}
                >
                  <button 
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    style={{ 
                      backgroundColor: '#16a34a', 
                      color: 'white', 
                      paddingLeft: '1rem', 
                      paddingRight: '1rem', 
                      paddingTop: '0.5rem', 
                      paddingBottom: '0.5rem', 
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <RocketLaunchIcon 
                      className="h-4 w-4 inline mr-1" 
                      style={{...iconStyle, marginRight: '0.25rem'}} 
                    />
                    Deploy
                  </button>
                  <button 
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    style={{ 
                      backgroundColor: '#4b5563', 
                      color: 'white', 
                      paddingLeft: '1rem', 
                      paddingRight: '1rem', 
                      paddingTop: '0.5rem', 
                      paddingBottom: '0.5rem', 
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="text-center py-12 text-gray-500"
                style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem', color: '#6b7280' }}
              >
                Generate manifests to see deployment configuration
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 