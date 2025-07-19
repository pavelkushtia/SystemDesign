import { Router, Request, Response, NextFunction } from 'express';
import { 
  ValidationError,
  ApiResponse,
  validateData
} from '@scalesim/shared';
import { AIAssistant, AICodeRequest, AIOptimizationRequest, AIArchitectureRequest } from '@scalesim/ai-assistant';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const aiAssistant = new AIAssistant();

// ============================================================================
// AI-POWERED CODE GENERATION
// ============================================================================

// POST /api/ai/generate-code - Generate code using AI
router.post('/generate-code', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, language, framework, context } = req.body;
    const userId = (req as any).user?.id;

    if (!prompt || !language) {
      return next(new ValidationError('Prompt and language are required', []));
    }

    const request: AICodeRequest = {
      prompt,
      language,
      framework,
      context
    };

    logger.info(`AI code generation requested by user ${userId}: ${prompt}`);

    const result = await aiAssistant.generateCode(request);

    const response: ApiResponse = {
      success: true,
      data: result,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('AI code generation error:', error);
    next(error);
  }
});

// POST /api/ai/optimize-code - Get code optimization suggestions
router.post('/optimize-code', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, language, framework, performanceGoals } = req.body;
    const userId = (req as any).user?.id;

    if (!code || !language) {
      return next(new ValidationError('Code and language are required', []));
    }

    const request: AIOptimizationRequest = {
      code,
      language,
      framework,
      performanceGoals
    };

    logger.info(`AI code optimization requested by user ${userId}`);

    const result = await aiAssistant.suggestOptimizations(request);

    const response: ApiResponse = {
      success: true,
      data: result,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('AI code optimization error:', error);
    next(error);
  }
});

// POST /api/ai/suggest-architecture - Get architecture recommendations
router.post('/suggest-architecture', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requirements, scale, constraints, preferences } = req.body;
    const userId = (req as any).user?.id;

    if (!requirements || !scale) {
      return next(new ValidationError('Requirements and scale are required', []));
    }

    const request: AIArchitectureRequest = {
      requirements,
      scale,
      constraints,
      preferences
    };

    logger.info(`AI architecture suggestion requested by user ${userId}: ${requirements}`);

    const result = await aiAssistant.suggestArchitecture(request);

    const response: ApiResponse = {
      success: true,
      data: result,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('AI architecture suggestion error:', error);
    next(error);
  }
});

// POST /api/ai/generate-documentation - Generate documentation
router.post('/generate-documentation', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, type } = req.body;
    const userId = (req as any).user?.id;

    if (!code || !type) {
      return next(new ValidationError('Code and type are required', []));
    }

    if (!['api', 'architecture', 'deployment'].includes(type)) {
      return next(new ValidationError('Type must be one of: api, architecture, deployment', []));
    }

    logger.info(`AI documentation generation requested by user ${userId}: ${type}`);

    const result = await aiAssistant.generateDocumentation(code, type);

    const response: ApiResponse = {
      success: true,
      data: result,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('AI documentation generation error:', error);
    next(error);
  }
});

// POST /api/ai/chat - General AI chat interface
router.post('/chat', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, action, context } = req.body;
    const userId = (req as any).user?.id;

    if (!message) {
      return next(new ValidationError('Message is required', []));
    }

    logger.info(`AI chat request from user ${userId}: ${action || 'general'}`);

    let response = '';
    let additionalData = null;

    switch (action) {
      case 'code-generation':
        const codeResult = await aiAssistant.generateCode({
          prompt: message,
          language: detectLanguage(message),
          framework: detectFramework(message),
          context: {
            componentType: context?.selectedComponent?.type,
            connections: context?.selectedComponent?.connections,
            requirements: extractRequirements(message)
          }
        });
        
        response = formatCodeResponse(codeResult);
        additionalData = codeResult;
        break;

      case 'optimization':
        if (context?.selectedComponent?.code) {
          const optimizationResult = await aiAssistant.suggestOptimizations({
            code: context.selectedComponent.code,
            language: detectLanguage(context.selectedComponent.code),
            framework: detectFramework(context.selectedComponent.code),
            performanceGoals: extractPerformanceGoals(message)
          });
          
          response = formatOptimizationResponse(optimizationResult);
          additionalData = optimizationResult;
        } else {
          response = "I'd be happy to help optimize your code! Please select a component with code or provide the code you'd like me to review.";
        }
        break;

      case 'architecture':
        const architectureResult = await aiAssistant.suggestArchitecture({
          requirements: message,
          scale: detectScale(message),
          constraints: extractConstraints(message),
          preferences: {
            cloudProvider: detectCloudProvider(message),
            budget: extractBudget(message),
            timeline: extractTimeline(message)
          }
        });
        
        response = formatArchitectureResponse(architectureResult);
        additionalData = architectureResult;
        break;

      case 'documentation':
        if (context?.systemId) {
          const systemData = { id: context.systemId, components: [], connections: [] };
          const docResult = await aiAssistant.generateDocumentation(
            JSON.stringify(systemData, null, 2),
            'architecture'
          );
          
          response = docResult.documentation;
          additionalData = docResult;
        } else {
          response = "I can help generate documentation! Please specify what you'd like documented or select a system.";
        }
        break;

      default:
        response = await generateGeneralResponse(message, context);
        break;
    }

    const apiResponse: ApiResponse = {
      success: true,
      data: {
        response,
        action,
        additionalData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    };

    res.json(apiResponse);

  } catch (error) {
    logger.error('AI chat error:', error);
    next(error);
  }
});

// ============================================================================
// AI ASSISTANT STATUS AND CONFIGURATION
// ============================================================================

// GET /api/ai/status - Check AI assistant availability
router.get('/status', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const openaiAvailable = !!process.env.OPENAI_API_KEY;
    const anthropicAvailable = !!process.env.ANTHROPIC_API_KEY;

    const response: ApiResponse = {
      success: true,
      data: {
        openai: {
          available: openaiAvailable,
          status: openaiAvailable ? 'configured' : 'not_configured'
        },
        anthropic: {
          available: anthropicAvailable,
          status: anthropicAvailable ? 'configured' : 'not_configured'
        },
        fallbackMode: !openaiAvailable && !anthropicAvailable,
        features: {
          codeGeneration: true,
          codeOptimization: true,
          architectureSuggestions: true,
          documentationGeneration: true
        }
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AI-POWERED SYSTEM ANALYSIS
// ============================================================================

// POST /api/ai/analyze-system - Analyze system design and suggest improvements
router.post('/analyze-system', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { systemId, components, connections } = req.body;
    const userId = (req as any).user?.id;

    if (!systemId || !components) {
      return next(new ValidationError('System ID and components are required', []));
    }

    logger.info(`AI system analysis requested by user ${userId} for system ${systemId}`);

    // Create a description of the system for AI analysis
    const systemDescription = `
System Components:
${components.map((comp: any) => `- ${comp.type}: ${comp.name}`).join('\n')}

Connections:
${connections ? connections.map((conn: any) => `- ${conn.source} -> ${conn.target}`).join('\n') : 'No connections defined'}
    `;

    const architectureRequest: AIArchitectureRequest = {
      requirements: `Analyze and improve this existing system: ${systemDescription}`,
      scale: 'medium',
      constraints: ['Maintain existing components where possible'],
      preferences: {}
    };

    const result = await aiAssistant.suggestArchitecture(architectureRequest);

    // Add system-specific analysis
    const analysis = {
      ...result,
      systemAnalysis: {
        componentCount: components.length,
        connectionCount: connections ? connections.length : 0,
        complexity: components.length > 10 ? 'high' : components.length > 5 ? 'medium' : 'low',
        recommendations: [
          'Consider adding monitoring components',
          'Implement proper error handling',
          'Add security layers',
          'Consider scalability patterns'
        ]
      }
    };

    const response: ApiResponse = {
      success: true,
      data: analysis,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('AI system analysis error:', error);
    next(error);
  }
});

// Helper functions
function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('javascript') || lowerText.includes('js') || lowerText.includes('node')) {
    return 'javascript';
  }
  if (lowerText.includes('typescript') || lowerText.includes('ts')) {
    return 'typescript';
  }
  if (lowerText.includes('python') || lowerText.includes('py')) {
    return 'python';
  }
  if (lowerText.includes('java')) {
    return 'java';
  }
  if (lowerText.includes('go') || lowerText.includes('golang')) {
    return 'go';
  }
  if (lowerText.includes('rust')) {
    return 'rust';
  }
  
  return 'javascript'; // Default
}

function detectFramework(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('react')) return 'react';
  if (lowerText.includes('vue')) return 'vue';
  if (lowerText.includes('angular')) return 'angular';
  if (lowerText.includes('express')) return 'express';
  if (lowerText.includes('fastapi')) return 'fastapi';
  if (lowerText.includes('django')) return 'django';
  if (lowerText.includes('flask')) return 'flask';
  if (lowerText.includes('spring')) return 'spring';
  
  return undefined;
}

function detectScale(text: string): 'small' | 'medium' | 'large' | 'enterprise' {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('enterprise') || lowerText.includes('large scale')) {
    return 'enterprise';
  }
  if (lowerText.includes('large') || lowerText.includes('high traffic')) {
    return 'large';
  }
  if (lowerText.includes('small') || lowerText.includes('startup')) {
    return 'small';
  }
  
  return 'medium';
}

function detectCloudProvider(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('aws') || lowerText.includes('amazon')) return 'aws';
  if (lowerText.includes('azure') || lowerText.includes('microsoft')) return 'azure';
  if (lowerText.includes('gcp') || lowerText.includes('google cloud')) return 'gcp';
  if (lowerText.includes('digitalocean')) return 'digitalocean';
  
  return undefined;
}

function extractRequirements(text: string): string[] {
  const requirements = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('authentication') || lowerText.includes('auth')) {
    requirements.push('authentication');
  }
  if (lowerText.includes('database') || lowerText.includes('db')) {
    requirements.push('database');
  }
  if (lowerText.includes('api') || lowerText.includes('rest')) {
    requirements.push('api');
  }
  if (lowerText.includes('real-time') || lowerText.includes('websocket')) {
    requirements.push('real-time');
  }
  
  return requirements;
}

function extractConstraints(text: string): string[] {
  const constraints = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('budget') || lowerText.includes('cost')) {
    constraints.push('budget-conscious');
  }
  if (lowerText.includes('performance') || lowerText.includes('fast')) {
    constraints.push('high-performance');
  }
  if (lowerText.includes('security') || lowerText.includes('secure')) {
    constraints.push('security-focused');
  }
  
  return constraints;
}

function extractPerformanceGoals(text: string): string[] {
  const goals = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('speed') || lowerText.includes('fast')) {
    goals.push('speed');
  }
  if (lowerText.includes('memory') || lowerText.includes('ram')) {
    goals.push('memory-efficiency');
  }
  if (lowerText.includes('scalability') || lowerText.includes('scale')) {
    goals.push('scalability');
  }
  
  return goals;
}

function extractBudget(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('low budget') || lowerText.includes('cheap')) {
    return 'low';
  }
  if (lowerText.includes('high budget') || lowerText.includes('enterprise budget')) {
    return 'high';
  }
  
  return undefined;
}

function extractTimeline(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('urgent') || lowerText.includes('asap')) {
    return 'urgent';
  }
  if (lowerText.includes('week')) {
    return '1-2 weeks';
  }
  if (lowerText.includes('month')) {
    return '1-3 months';
  }
  
  return undefined;
}

function formatCodeResponse(result: any): string {
  return `I've generated the code for you:

\`\`\`${result.language || 'javascript'}
${result.code}
\`\`\`

**Explanation:**
${result.explanation}

**Dependencies:**
${result.dependencies.length > 0 ? result.dependencies.map((dep: string) => `• ${dep}`).join('\n') : 'No additional dependencies required'}

${result.tests ? `\n**Tests:**\n\`\`\`${result.language || 'javascript'}\n${result.tests}\n\`\`\`` : ''}`;
}

function formatOptimizationResponse(result: any): string {
  let response = `I've analyzed your code and found ${result.suggestions.length} optimization opportunities:\n\n`;
  
  result.suggestions.forEach((suggestion: any, index: number) => {
    response += `**${index + 1}. ${suggestion.type.toUpperCase()} - ${suggestion.impact.toUpperCase()} Impact**\n`;
    response += `${suggestion.description}\n\n`;
    response += `*Before:*\n\`\`\`\n${suggestion.before}\n\`\`\`\n\n`;
    response += `*After:*\n\`\`\`\n${suggestion.after}\n\`\`\`\n\n`;
  });
  
  response += `**Overall Code Quality Score: ${result.overallScore}/100**`;
  
  return response;
}

function formatArchitectureResponse(result: any): string {
  let response = `Here's my recommended architecture:\n\n`;
  
  response += `**Components:**\n`;
  result.architecture.components.forEach((component: any) => {
    response += `• **${component.name}** (${component.type}): ${component.description}\n`;
  });
  
  response += `\n**Recommended Patterns:**\n`;
  result.architecture.patterns.forEach((pattern: string) => {
    response += `• ${pattern}\n`;
  });
  
  response += `\n**Technology Stack:**\n`;
  result.architecture.technologies.forEach((tech: string) => {
    response += `• ${tech}\n`;
  });
  
  response += `\n**Reasoning:**\n${result.reasoning}`;
  
  if (result.alternatives.length > 0) {
    response += `\n\n**Alternative Approaches:**\n`;
    result.alternatives.forEach((alt: string) => {
      response += `• ${alt}\n`;
    });
  }
  
  if (result.estimatedCost) {
    response += `\n**Estimated Cost:** ${result.estimatedCost}`;
  }
  
  if (result.timeline) {
    response += `\n**Timeline:** ${result.timeline}`;
  }
  
  return response;
}

async function generateGeneralResponse(message: string, context: any): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm here to help you with your system design, code generation, architecture suggestions, and more. What can I assist you with today?";
  }
  
  if (lowerMessage.includes('help')) {
    return `I can help you with:

• **Code Generation** - Generate code for components, APIs, and services
• **Architecture Design** - Suggest system architectures and patterns
• **Code Optimization** - Improve performance and best practices
• **Documentation** - Generate comprehensive documentation
• **System Analysis** - Analyze your current system design

Just ask me what you need help with!`;
  }
  
  if (lowerMessage.includes('what') && lowerMessage.includes('do')) {
    return "I'm an AI assistant specialized in distributed systems and software architecture. I can help you design, build, and optimize scalable systems. Try asking me to generate code, suggest an architecture, or optimize existing code!";
  }
  
  return "I understand you're looking for help with your system. Could you be more specific about what you'd like me to assist with? I can help with code generation, architecture design, optimization, or documentation.";
}

export default router;