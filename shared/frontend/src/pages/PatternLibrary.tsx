import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  RectangleStackIcon,
  CubeIcon,
  BeakerIcon,
  EyeIcon,
  PlusIcon,
  CloudIcon,
  CircleStackIcon,
  CpuChipIcon,
  DocumentTextIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface Pattern {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  components: string[];
  tags: string[];
  estimatedTime: string;
  useCases: string[];
  icon: string;
  emoji: string;
}

const patterns: Pattern[] = [
  {
    id: 'microservices-api-gateway',
    name: 'API Gateway Pattern',
    description: 'Centralized entry point for all microservices with authentication, rate limiting, and routing.',
    category: 'Microservices',
    difficulty: 'Intermediate',
    components: ['API Gateway', 'Load Balancer', 'Microservice', 'Database', 'Cache'],
    tags: ['authentication', 'routing', 'scalability'],
    estimatedTime: '2-3 hours',
    useCases: ['E-commerce platforms', 'SaaS applications', 'Mobile backends'],
    icon: '🏗️',
    emoji: '⚡'
  },
  {
    id: 'event-sourcing-cqrs',
    name: 'Event Sourcing + CQRS',
    description: 'Separate read and write models with event-driven architecture for high-performance applications.',
    category: 'Microservices',
    difficulty: 'Advanced',
    components: ['Command Service', 'Query Service', 'Event Store', 'Read Database', 'Message Queue'],
    tags: ['event-driven', 'performance', 'scalability'],
    estimatedTime: '4-6 hours',
    useCases: ['Financial systems', 'Audit trails', 'Real-time analytics'],
    icon: '📊',
    emoji: '🎯'
  },
  {
    id: 'ml-pipeline-training',
    name: 'ML Training Pipeline',
    description: 'End-to-end machine learning pipeline for data processing, model training, and deployment.',
    category: 'Machine Learning',
    difficulty: 'Intermediate',
    components: ['Data Source', 'Feature Store', 'Training Service', 'Model Registry', 'Monitoring'],
    tags: ['ml-ops', 'automation', 'monitoring'],
    estimatedTime: '3-4 hours',
    useCases: ['Recommendation systems', 'Predictive analytics', 'Computer vision'],
    icon: '🤖',
    emoji: '🚀'
  },
  {
    id: 'stream-processing',
    name: 'Stream Processing',
    description: 'Real-time data processing with Kafka and stream processing frameworks.',
    category: 'Data Processing',
    difficulty: 'Intermediate',
    components: ['Kafka', 'Stream Processor', 'Database', 'Monitoring', 'Storage'],
    tags: ['real-time', 'streaming', 'big-data'],
    estimatedTime: '2-3 hours',
    useCases: ['IoT data processing', 'Real-time analytics', 'Event streaming'],
    icon: '⚡',
    emoji: '📡'
  },
  {
    id: 'lambda-architecture',
    name: 'Lambda Architecture',
    description: 'Hybrid batch and stream processing architecture for handling big data workloads.',
    category: 'Data Processing',
    difficulty: 'Advanced',
    components: ['Batch Layer', 'Speed Layer', 'Serving Layer', 'Data Lake', 'Stream Processor'],
    tags: ['big-data', 'batch-processing', 'real-time'],
    estimatedTime: '5-8 hours',
    useCases: ['Big data analytics', 'Business intelligence', 'Data warehousing'],
    icon: '📈',
    emoji: '🔥'
  },
  {
    id: 'serverless-microservices',
    name: 'Serverless Microservices',
    description: 'Event-driven serverless architecture with functions and managed services.',
    category: 'Serverless',
    difficulty: 'Beginner',
    components: ['Lambda Functions', 'API Gateway', 'DynamoDB', 'S3', 'CloudWatch'],
    tags: ['serverless', 'cost-effective', 'scalable'],
    estimatedTime: '1-2 hours',
    useCases: ['Web applications', 'APIs', 'Data processing'],
    icon: '☁️',
    emoji: '⚡'
  },
];

const categories = ['All', 'Microservices', 'Machine Learning', 'Data Processing', 'Serverless'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// Emergency icon style to prevent giant icons
const iconStyle = { 
  width: '1rem', 
  height: '1rem', 
  maxWidth: '1rem', 
  maxHeight: '1rem',
  minWidth: '1rem',
  minHeight: '1rem'
};

export default function PatternLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPatterns = patterns.filter((pattern) => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || pattern.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || pattern.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Microservices':
        return CubeIcon;
      case 'Machine Learning':
        return BeakerIcon;
      case 'Data Processing':
        return RectangleStackIcon;
      default:
        return RectangleStackIcon;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <div 
      className="min-h-full bg-gray-50 dark:bg-gray-900"
      style={{ minHeight: '100%', backgroundColor: '#f9fafb', padding: 0 }}
    >
      <div 
        className="py-8 px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: '2rem', paddingBottom: '2rem', paddingLeft: '2rem', paddingRight: '2rem' }}
      >
        {/* Header */}
        <div 
          className="mb-8"
          style={{ marginBottom: '2rem' }}
        >
          <h1 
            className="text-3xl font-bold text-gray-900 dark:text-white"
            style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}
          >
            Pattern Library
          </h1>
          <p 
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
            style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}
          >
            Discover and apply proven architecture patterns to your systems
          </p>
        </div>

        {/* Search and Filters */}
        <div 
          className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6"
          style={{ 
            marginBottom: '2rem', 
            backgroundColor: 'white', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            borderRadius: '0.5rem', 
            padding: '1.5rem' 
          }}
        >
          <div 
            className="flex flex-col sm:flex-row gap-4"
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {/* Search */}
            <div 
              className="flex-1"
              style={{ flex: '1 1 0%' }}
            >
              <div 
                className="relative"
                style={{ position: 'relative' }}
              >
                <MagnifyingGlassIcon 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
                  style={{...iconStyle, position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)'}}
                />
                <input
                  type="text"
                  placeholder="Search patterns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  style={{ 
                    width: '100%', 
                    paddingLeft: '2.5rem', 
                    paddingRight: '1rem', 
                    paddingTop: '0.5rem', 
                    paddingBottom: '0.5rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    color: '#111827'
                  }}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                paddingLeft: '1rem', 
                paddingRight: '1rem', 
                paddingTop: '0.5rem', 
                paddingBottom: '0.5rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem', 
                backgroundColor: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}
            >
              <FunnelIcon 
                className="h-4 w-4 mr-2" 
                style={{...iconStyle, marginRight: '0.5rem'}}
              />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div 
              className="mt-4 flex flex-wrap gap-4"
              style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}
            >
              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}
                >
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  style={{ 
                    paddingLeft: '0.75rem', 
                    paddingRight: '0.75rem', 
                    paddingTop: '0.5rem', 
                    paddingBottom: '0.5rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.375rem', 
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    color: '#111827'
                  }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}
                >
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  style={{ 
                    paddingLeft: '0.75rem', 
                    paddingRight: '0.75rem', 
                    paddingTop: '0.5rem', 
                    paddingBottom: '0.5rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.375rem', 
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    color: '#111827'
                  }}
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}
        >
          {filteredPatterns.map((pattern) => {
            const CategoryIcon = getCategoryIcon(pattern.category);
            
            return (
              <div
                key={pattern.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  padding: '1.5rem',
                  transition: 'box-shadow 0.15s ease-in-out'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="text-3xl"
                      style={{ fontSize: '2rem', lineHeight: '1' }}
                    >
                      {pattern.icon}{pattern.emoji}
                    </div>
                    <div>
                      <h3
                        className="text-lg font-semibold text-gray-900 dark:text-white"
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          color: '#111827',
                          lineHeight: '1.5rem'
                        }}
                      >
                        {pattern.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pattern.difficulty === 'Beginner'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : pattern.difficulty === 'Intermediate'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                          style={{
                            paddingLeft: '0.5rem',
                            paddingRight: '0.5rem',
                            paddingTop: '0.25rem',
                            paddingBottom: '0.25rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            backgroundColor:
                              pattern.difficulty === 'Beginner'
                                ? '#dcfce7'
                                : pattern.difficulty === 'Intermediate'
                                ? '#fef3c7'
                                : '#fee2e2',
                            color:
                              pattern.difficulty === 'Beginner'
                                ? '#166534'
                                : pattern.difficulty === 'Intermediate'
                                ? '#92400e'
                                : '#991b1b'
                          }}
                        >
                          {pattern.difficulty}
                        </span>
                        <span
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                          style={{
                            paddingLeft: '0.5rem',
                            paddingRight: '0.5rem',
                            paddingTop: '0.25rem',
                            paddingBottom: '0.25rem',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          {pattern.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p
                  className="text-gray-600 dark:text-gray-400 mb-4"
                  style={{
                    color: '#4b5563',
                    marginBottom: '1rem',
                    lineHeight: '1.5'
                  }}
                >
                  {pattern.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UsersIcon
                      className="w-4 h-4 text-gray-400"
                      style={{ ...iconStyle, color: '#9ca3af' }}
                    />
                    <span
                      className="text-sm text-gray-500 dark:text-gray-400"
                      style={{ fontSize: '0.875rem', color: '#6b7280' }}
                    >
                      {Math.floor(Math.random() * 50) + 10} components
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      style={{
                        paddingLeft: '0.75rem',
                        paddingRight: '0.75rem',
                        paddingTop: '0.375rem',
                        paddingBottom: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#2563eb',
                        borderRadius: '0.375rem',
                        transition: 'all 0.15s ease-in-out',
                        cursor: 'pointer'
                      }}
                    >
                      Preview
                    </button>
                    <button
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                      style={{
                        paddingLeft: '0.75rem',
                        paddingRight: '0.75rem',
                        paddingTop: '0.375rem',
                        paddingBottom: '0.375rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        borderRadius: '0.375rem',
                        border: 'none',
                        transition: 'all 0.15s ease-in-out',
                        cursor: 'pointer'
                      }}
                    >
                      Use Pattern
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPatterns.length === 0 && (
          <div className="text-center py-12">
            <RectangleStackIcon 
              className="mx-auto h-12 w-12 text-gray-400" 
              style={{ ...iconStyle, width: '3rem', height: '3rem', maxWidth: '3rem', maxHeight: '3rem' }}
            />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No patterns found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 