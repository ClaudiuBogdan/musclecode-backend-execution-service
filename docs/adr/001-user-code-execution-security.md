# ADR-001: Security Hardening for User Code Execution

## Context and Problem Statement

In our system, we need to execute arbitrary user-submitted code in Docker containers orchestrated by Kubernetes. This creates several security challenges:

- **Isolation:** Ensuring that user code executes in a contained environment without access to host system resources.
- **Filesystem Restrictions:** Limiting write access to a designated directory (e.g., `/app/code`) while maintaining a read-only root filesystem for the container.
- **Privilege Escalation Prevention:** Running containers as non-root and denying privilege escalation effectively.
- **Capability Limitation:** Dropping unnecessary Linux capabilities to reduce the attack surface.
- **Resource Control:** Enforcing resource limits to prevent abuse of system resources.

## Decision Drivers

- **Security:** Complete isolation of user code execution is mandatory to protect the host and other containers.
- **Maintainability:** The Docker and Kubernetes configurations should remain simple and clear to facilitate future maintenance.
- **Performance:** While security is a priority, we must ensure that acceptable performance is maintained.

## Considered Options

1. **User Privileges:** Running containers as root vs. non-root. We chose a non-root model by creating an `app_user` in our Dockerfile.
2. **Filesystem Access:** Making the entire filesystem writable vs. restricting write access to a dedicated directory. We chose to mount an `emptyDir` volume at `/app/code` for user code execution, while keeping the root filesystem read-only.
3. **Capabilities:** Granting all capabilities vs. dropping all unnecessary capabilities. We opt for dropping non-essential capabilities.
4. **Resource Limits:** No limits vs. defining strict resource quotas. We use resource requests and limits in Kubernetes to control resource usage.

## Decision Outcome

### Dockerfile Configurations:
- **Base Image:** Use a minimal image (`debian:bookworm-slim`) to reduce the attack surface.
- **Non-Root User:** Create and switch to a non-root user (`app_user`) for running the application.
- **Filesystem:** Set `/app` as the working directory and prepare a dedicated writable directory (`/app/code`).
- **Ownership:** Ensure ownership of `/app` is correctly set for `app_user`.

### Kubernetes Deployment Configurations:
- **Security Context:**
  - `runAsUser: 1001`, `runAsGroup: 1001`, `runAsNonRoot: true` to enforce non-root execution.
  - `readOnlyRootFilesystem: true` to prevent modifications outside designated areas.
  - `allowPrivilegeEscalation: false` to block privilege escalation.
  - Drop all Linux capabilities by specifying `capabilities: { drop: ["ALL"] }`.
- **Volume Mounts:** Mount a dedicated `emptyDir` volume at `/app/code` for any required write operations from user code execution.
- **Resource Limits:** Define resource requests and limits to prevent abuse of system resources.

## Consequences

- **Enhanced Isolation:** User code runs in a strictly confined environment, mitigating risks of system compromise.
- **Minimized Attack Surface:** With a read-only root filesystem and dropped capabilities, the risks of privilege escalation and file system manipulation are greatly reduced.
- **Maintainability:** The approach leverages native Docker and Kubernetes features, keeping configurations clear and centrally managed.
- **Performance:** Resource limits and a dedicated writable volume strike a balance between security enforcement and application performance.

## Future Considerations

- **Runtime Security Enhancements:** Consider implementing additional runtime security mechanisms like Seccomp profiles and AppArmor/SELinux policies.
- **Network Policies:** Introduce strict network policies to further isolate execution environments.
- **Continuous Monitoring:** Regularly scan container images and monitor resource usage to catch any potential misconfigurations or vulnerabilities.

## Rationale

The chosen configuration aims to ensure that arbitrary user-submitted code runs in a fully isolated environment, minimizing potential risks and adhering to industry best practices. By leveraging non-root execution, a read-only filesystem with a designated writable directory, minimal capabilities, and resource limits, we balance security with performance and maintainability. 