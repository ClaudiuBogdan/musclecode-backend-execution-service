# TypeScript Execution Template

This folder serves as a template for TypeScript code execution environments. It contains all necessary dependencies and configurations pre-installed to optimize execution time and ensure consistency.

## Structure
```
template-folder/
├── node_modules/     # Pre-installed dependencies
├── package.json      # Project configuration and dependencies
├── tsconfig.json     # TypeScript configuration
└── vitest.config.ts  # Test runner configuration
```

## Dependencies
- vitest: ^3.0.4 (Test runner)
- typescript: ^5.3.3 (TypeScript compiler)
- @types/node: ^20.11.0 (Node.js type definitions)

## Usage
This template is used internally by the execution service. The service will:
1. Copy this template to a temporary execution directory
2. Place user code in the src/ directory
3. Execute tests using the pre-configured Vitest setup

## Maintenance
To update dependencies:
1. Update versions in package.json
2. Run `npm install` to update node_modules
3. Test the template with sample code
4. Lock down permissions if necessary

## Security
- Template directory should be read-only
- Dependencies are locked to specific versions
- User code is isolated in src/ directory 