// Pattern templates and configuration helpers
export interface PatternTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
}

// Basic pattern templates for now
export const patternTemplates: PatternTemplate[] = [
  {
    id: 'basic-microservices',
    name: 'Basic Microservices',
    category: 'microservices',
    template: 'Basic microservices architecture template'
  }
]; 