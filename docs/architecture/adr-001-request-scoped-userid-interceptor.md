# ADR-001: Request-Scoped UserId Interceptor

## Status
Proposed

## Context
In our current implementation, the authentication guard was responsible for setting the userId in the AsyncLocalStorage context. However, this approach had a limitation because it tightly coupled authentication logic with request context management and was executed within the guard. Moreover, using middleware for this task is not feasible in NestJS since middleware is not request scoped and runs before guards, which means that the necessary user information (set by the guard) is not available.

## Decision
We refactored the userId middleware by creating a new request-scoped interceptor called `UserIdInterceptor`. This interceptor runs after the auth guard, ensuring that `request.user` is populated and available. The interceptor then sets the userId in the AsyncLocalStorage context. This decouples authentication from context management and adheres to NestJS best practices.

## Consequences
- Better separation of concerns between authentication and context management.
- Using an interceptor ensures request scoping, as opposed to middleware which cannot be request scoped.
- Simplifies testing and maintenance of each component.

## Alternatives Considered
- Keeping the functionality in the auth guard: This approach tightly coupled authentication with context management, reducing modularity.
- Implementing a middleware: However, NestJS middleware runs before guards and doesn't support request scoping, which was not suitable for our needs.

## References
- NestJS Documentation on Interceptors and Request Scope 