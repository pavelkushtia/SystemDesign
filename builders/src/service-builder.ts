import { ServiceBuilderConfig } from '@scalesim/shared';

export class ServiceBuilder {
  generateCode(config: ServiceBuilderConfig): Record<string, string> {
    // Basic code generation - placeholder for now
    return {
      'app.js': `// Generated ${config.framework} service\nconst express = require('express');\nconst app = express();\n\napp.listen(3000);`,
      'package.json': `{\n  "name": "${config.name}",\n  "version": "1.0.0",\n  "main": "app.js"\n}`
    };
  }
} 