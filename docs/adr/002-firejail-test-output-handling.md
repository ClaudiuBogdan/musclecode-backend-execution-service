# ADR 002: Firejail Test Output Handling

## Status
Accepted

## Context
When executing user-submitted code in a sandboxed environment using Firejail, we faced challenges with capturing and processing test output. The main challenge was that Firejail's security restrictions made it difficult to directly write test results to files and read them back, as the sandbox limits file system access.

## Decision
We implemented the following approach to handle test output with Firejail:

1. **Whitelist Directory Access**: 
   - Added specific whitelist rules in the Firejail profile for `/app/code` and `/app/templates`
   - This allows controlled file operations within these directories while maintaining security

2. **Test Output Strategy**:
   - Tests write their output to stdout instead of directly to files
   - The execution service captures this output through Node.js child process execution
   - Output is structured in a standardized JSON format for consistent parsing

3. **Security Considerations**:
   - Maintained Firejail's core security features (network isolation, process isolation)
   - Limited file system access to only the necessary directories
   - Prevented access to sensitive system areas while allowing test execution

## Consequences

### Positive
- Maintains strong security isolation while allowing test execution
- Simplified output handling by using stdout instead of file I/O
- Consistent output format across different test frameworks
- Reduced attack surface by limiting file system access

### Negative
- Slightly more complex implementation compared to direct file I/O
- Need to carefully manage whitelist directories
- Must ensure test frameworks properly format their output

## Implementation Details
The solution is implemented through:
- Firejail profile configuration with specific whitelist rules
- Execution service that captures and processes stdout
- Standardized JSON response format for test results 