# ADR 0001: Template-Based Execution Environment

## Status
Accepted

## Context
The code execution service needs to run user code in isolated environments with necessary dependencies. Previously, we were installing dependencies for each execution, which was time-consuming and inefficient. We needed a solution that would:
- Reduce execution setup time
- Maintain consistent dependency versions
- Support multiple programming languages
- Keep the execution environment secure and isolated
- Handle templates correctly in both development and production environments

## Decision
We will implement a template-based execution environment system using symlinks where:
1. Each programming language has a pre-configured template folder in a dedicated templates directory:
   - Located at project root in development
   - Copied to dist/templates in production
   - Contains all necessary dependencies and configurations
2. For each execution:
   - Create symlinks to template files (package.json, node_modules, etc.)
   - Create a fresh src/ directory for user code
   - Run tests/execution using the symlinked dependencies

## Consequences

### Positive
- Near-instant setup time (symlinks instead of copying)
- Zero disk space overhead for dependencies
- Consistent dependency versions across executions
- Better control over the execution environment
- Reduced network usage and dependency on package registries
- Atomic operations (symlinks are atomic)
- Templates properly handled in both dev and prod environments
- Templates excluded from TypeScript compilation

### Negative
- Need to maintain template versions
- Must manually update templates when dependencies need updating
- Potential for template corruption (mitigated by file permissions)
- Symlinks require careful security considerations
- Additional build step to copy templates to dist

## Implementation Details
1. Template Structure:
   ```
   project_root/
   ├── src/
   │   └── execute/
   │       └── languages/
   │           └── typescript/
   │               └── index.ts
   ├── templates/
   │   └── typescript/
   │       ├── node_modules/     # Symlinked to execution environment
   │       ├── package.json      # Symlinked to execution environment
   │       ├── tsconfig.json     # Symlinked to execution environment
   │       └── vitest.config.ts  # Symlinked to execution environment
   └── dist/
       └── templates/            # Copied during build
           └── typescript/
               └── ...
   ```

2. Build Process:
   - Templates directory excluded from TypeScript compilation
   - Templates copied to dist/templates during build
   - Environment-aware template path resolution

3. Security Measures:
   - Template directories are read-only
   - User code is isolated in src/ directory
   - Dependencies are locked to specific versions
   - Symlinks are created with appropriate permissions

4. Performance Impact:
   - Setup time reduced from ~5s to ~1ms (symlink creation)
   - Zero disk space overhead (symlinks only)
   - No network usage for dependencies
   - Minimal build time impact

## Alternatives Considered
1. Full directory copying:
   - Pros: Complete isolation
   - Cons: Slow, high disk usage
2. Docker-based isolation:
   - Pros: Better isolation
   - Cons: Higher overhead, slower startup
3. On-demand dependency installation:
   - Pros: No template maintenance
   - Cons: Slow, network-dependent
4. Shared global dependencies:
   - Pros: Minimal disk usage
   - Cons: Version conflicts, security risks
5. Templates in source directory:
   - Pros: Simpler structure
   - Cons: TypeScript compilation issues, production deployment problems 