# ADR 003: Docker and Firejail Nested Sandbox Configuration

## Context

Our code execution service runs user-submitted code in a secure environment. We use both Docker containers as a first layer of isolation and Firejail as a second layer for added defense-in-depth. When running Firejail inside Docker containers, we encountered warning messages about sandbox detection that needed to be addressed.

## Problem

When running Firejail inside a Docker container, Firejail detects it's already running in a sandboxed environment and issues a warning:

```
Warning: an existing sandbox was detected. ls will run without any additional sandboxing features
```

This resulted in Firejail not applying its security restrictions, defeating our dual-layer security approach.

## Decision

We've decided to implement three changes to address this issue:

1. Modify the firejail.profile to include both the `quiet` directive to suppress warnings and the `force` directive to override the sandbox detection.

2. Update the execution command in `src/utils/exec.ts` to include the `--force` and `--quiet` flags.

3. Document this configuration to ensure all developers understand the security architecture.

## Rationale

- We need both layers of security (Docker and Firejail) as part of our defense-in-depth strategy.
- Docker provides basic containerization but lacks fine-grained process and system call restrictions.
- Firejail provides more granular security controls through seccomp filters, capability restrictions, and namespace isolation.
- Using the `--force` flag ensures Firejail applies its security restrictions even when running inside another container.

## Consequences

### Positive

- Maintains our security posture with both layers of protection fully functioning
- Eliminates warning messages in logs
- Provides better isolation for untrusted user code

### Negative

- Nested sandboxing adds complexity
- Potential performance impact from double sandboxing
- May need to revisit if Docker's security features evolve in the future

## Alternatives Considered

1. **Docker-only approach**: Rely solely on Docker's security features, but this would sacrifice the fine-grained control Firejail offers.
   
2. **Non-nested approach**: Run separate containers for each layer, but this would significantly complicate the architecture.

3. **Other sandboxing tools**: Alternatives like gVisor or Kata Containers, but these would require significant architectural changes.

## Technical Implementation

```typescript
// In exec.ts
execCmd(
  `cd ${codePath} && ${config.NODE_ENV === 'development' ? '' : 'firejail --force --quiet --config=/app/firejail.profile'} ${command}`,
  { timeout: options.timeoutMs },
  // ...
);
```

```
# In firejail.profile
# Force firejail to run inside Docker
force
# Suppress warnings
quiet
ignore quiet-by-default
``` 