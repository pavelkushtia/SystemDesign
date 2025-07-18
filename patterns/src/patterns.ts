import { Pattern, PatternCategory, ComponentType } from '@scalesim/shared';

// Basic working patterns for the workspace package
export const allPatterns: Pattern[] = [
  {
    id: 'basic-pattern',
    name: 'Basic Pattern',
    description: 'Basic pattern example',
    category: PatternCategory.DISTRIBUTED_SYSTEMS,
    template: {},
    implementation: {
      complexity: 'beginner' as const,
      frameworks: ['express'],
      technologies: ['nodejs']
    },
    components: [],
    connections: [],
    documentation: {
      overview: 'Basic pattern for demonstration',
      useCases: ['Example use case'],
      benefits: ['Simple to understand'],
      tradeoffs: ['Limited functionality']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]; 