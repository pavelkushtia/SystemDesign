import OpenAI from 'openai';

export interface AICodeRequest {
  prompt: string;
  language: string;
  framework?: string;
  context?: {
    componentType?: string;
    connections?: string[];
    requirements?: string[];
  };
}

export interface AIOptimizationRequest {
  code: string;
  language: string;
  framework?: string;
  performanceGoals?: string[];
}

export interface AIArchitectureRequest {
  requirements: string;
  scale: 'small' | 'medium' | 'large' | 'enterprise';
  constraints?: string[];
  preferences?: {
    cloudProvider?: string;
    budget?: string;
    timeline?: string;
  };
}

export class AIAssistant {
  private openai: OpenAI | null = null;
  private anthropicApiKey: string | null = null;

  constructor() {
    // Initialize OpenAI if API key is available
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
      });
    }

    // Store Anthropic API key if available
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || null;
  }

  /**
   * Generate code based on component context and requirements
   */
  async generateCode(request: AICodeRequest): Promise<{
    code: string;
    explanation: string;
    dependencies: string[];
    tests?: string;
  }> {
    if (!this.openai) {
      return this.generateFallbackCode(request);
    }

    try {
      const systemPrompt = this.buildCodeGenerationPrompt(request);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: request.prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseCodeResponse(response, request);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateFallbackCode(request);
    }
  }

  /**
   * Suggest code optimizations and improvements
   */
  async suggestOptimizations(request: AIOptimizationRequest): Promise<{
    suggestions: Array<{
      type: 'performance' | 'security' | 'maintainability' | 'best-practice';
      description: string;
      before: string;
      after: string;
      impact: 'low' | 'medium' | 'high';
    }>;
    overallScore: number;
  }> {
    if (!this.openai) {
      return this.generateFallbackOptimizations(request);
    }

    try {
      const systemPrompt = `You are an expert code reviewer specializing in ${request.language} and ${request.framework || 'general'} development. 
      Analyze the provided code and suggest specific optimizations focusing on:
      1. Performance improvements
      2. Security vulnerabilities
      3. Code maintainability
      4. Best practices
      
      Return your response as JSON with the following structure:
      {
        "suggestions": [
          {
            "type": "performance|security|maintainability|best-practice",
            "description": "Clear description of the issue and solution",
            "before": "Code snippet showing the issue",
            "after": "Improved code snippet",
            "impact": "low|medium|high"
          }
        ],
        "overallScore": 85
      }`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Please analyze this ${request.language} code:\n\n${request.code}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || '';
      try {
        return JSON.parse(response);
      } catch {
        return this.generateFallbackOptimizations(request);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateFallbackOptimizations(request);
    }
  }

  /**
   * Generate system architecture recommendations
   */
  async suggestArchitecture(request: AIArchitectureRequest): Promise<{
    architecture: {
      components: Array<{
        type: string;
        name: string;
        description: string;
        connections: string[];
      }>;
      patterns: string[];
      technologies: string[];
    };
    reasoning: string;
    alternatives: string[];
    estimatedCost?: string;
    timeline?: string;
  }> {
    if (!this.openai) {
      return this.generateFallbackArchitecture(request);
    }

    try {
      const systemPrompt = `You are a senior system architect with expertise in distributed systems, microservices, and cloud architecture.
      Based on the requirements, suggest a comprehensive system architecture including:
      1. Core components and their responsibilities
      2. Architectural patterns to apply
      3. Technology stack recommendations
      4. Reasoning behind decisions
      5. Alternative approaches
      
      Consider scale: ${request.scale}
      ${request.constraints ? `Constraints: ${request.constraints.join(', ')}` : ''}
      ${request.preferences?.cloudProvider ? `Preferred cloud: ${request.preferences.cloudProvider}` : ''}
      
      Return response as JSON with the specified structure.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Requirements: ${request.requirements}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || '';
      try {
        return JSON.parse(response);
      } catch {
        return this.generateFallbackArchitecture(request);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateFallbackArchitecture(request);
    }
  }

  /**
   * Generate documentation for code or architecture
   */
  async generateDocumentation(code: string, type: 'api' | 'architecture' | 'deployment'): Promise<{
    documentation: string;
    format: 'markdown' | 'html';
  }> {
    if (!this.openai) {
      return {
        documentation: `# Documentation\n\nGenerated documentation for the provided ${type}.\n\n\`\`\`\n${code}\n\`\`\``,
        format: 'markdown'
      };
    }

    try {
      const systemPrompt = `You are a technical writer specializing in ${type} documentation.
      Generate comprehensive, clear documentation in Markdown format.
      Include:
      1. Overview and purpose
      2. Key components/endpoints
      3. Usage examples
      4. Configuration details
      5. Best practices
      6. Troubleshooting tips`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Generate documentation for this ${type}:\n\n${code}`
          }
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      return {
        documentation: completion.choices[0]?.message?.content || '',
        format: 'markdown'
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        documentation: `# Documentation\n\nGenerated documentation for the provided ${type}.\n\n\`\`\`\n${code}\n\`\`\``,
        format: 'markdown'
      };
    }
  }

  private buildCodeGenerationPrompt(request: AICodeRequest): string {
    let prompt = `You are an expert ${request.language} developer`;
    
    if (request.framework) {
      prompt += ` specializing in ${request.framework}`;
    }
    
    prompt += `. Generate production-ready code that follows best practices.`;
    
    if (request.context?.componentType) {
      prompt += ` This code is for a ${request.context.componentType} component`;
    }
    
    if (request.context?.connections?.length) {
      prompt += ` that connects to: ${request.context.connections.join(', ')}`;
    }
    
    prompt += `\n\nReturn your response as JSON with this structure:
    {
      "code": "The generated code",
      "explanation": "Brief explanation of the code",
      "dependencies": ["list", "of", "dependencies"],
      "tests": "Optional test code"
    }`;
    
    return prompt;
  }

  private parseCodeResponse(response: string, request: AICodeRequest): {
    code: string;
    explanation: string;
    dependencies: string[];
    tests?: string;
  } {
    try {
      return JSON.parse(response);
    } catch {
      // Fallback parsing if JSON is malformed
      return {
        code: response,
        explanation: `Generated ${request.language} code for ${request.prompt}`,
        dependencies: [],
      };
    }
  }

  private generateFallbackCode(request: AICodeRequest): {
    code: string;
    explanation: string;
    dependencies: string[];
    tests?: string;
  } {
    const templates = {
      javascript: `// ${request.prompt}
function ${request.prompt.replace(/\s+/g, '')}() {
  // TODO: Implement functionality
  console.log('${request.prompt}');
}

module.exports = { ${request.prompt.replace(/\s+/g, '')} };`,
      
      python: `# ${request.prompt}
def ${request.prompt.replace(/\s+/g, '_').toLowerCase()}():
    """${request.prompt}"""
    # TODO: Implement functionality
    print("${request.prompt}")
    pass`,
      
      java: `// ${request.prompt}
public class ${request.prompt.replace(/\s+/g, '')} {
    public void execute() {
        // TODO: Implement functionality
        System.out.println("${request.prompt}");
    }
}`,
    };

    const code = templates[request.language as keyof typeof templates] || 
                 `// ${request.prompt}\n// TODO: Implement functionality`;

    return {
      code,
      explanation: `Template code for ${request.prompt}. AI API not available - using fallback template.`,
      dependencies: [],
    };
  }

  private generateFallbackOptimizations(request: AIOptimizationRequest) {
    return {
      suggestions: [
        {
          type: 'best-practice' as const,
          description: 'Add error handling to improve robustness',
          before: 'function example() { /* code */ }',
          after: 'function example() { try { /* code */ } catch (error) { /* handle */ } }',
          impact: 'medium' as const,
        },
        {
          type: 'performance' as const,
          description: 'Consider using async/await for better performance',
          before: 'callback-based code',
          after: 'async/await based code',
          impact: 'medium' as const,
        }
      ],
      overallScore: 75
    };
  }

  private generateFallbackArchitecture(request: AIArchitectureRequest) {
    return {
      architecture: {
        components: [
          {
            type: 'api_gateway',
            name: 'API Gateway',
            description: 'Entry point for all client requests',
            connections: ['load_balancer', 'microservices']
          },
          {
            type: 'microservice',
            name: 'Core Service',
            description: 'Main business logic service',
            connections: ['database', 'cache']
          },
          {
            type: 'database',
            name: 'Primary Database',
            description: 'Main data storage',
            connections: []
          }
        ],
        patterns: ['API Gateway Pattern', 'Microservices Pattern'],
        technologies: ['Node.js', 'PostgreSQL', 'Redis', 'Docker']
      },
      reasoning: 'Basic microservices architecture suitable for most applications. AI API not available - using template architecture.',
      alternatives: ['Monolithic architecture', 'Serverless architecture'],
      estimatedCost: 'Varies based on scale and cloud provider',
      timeline: '2-4 weeks for initial implementation'
    };
  }
} 