# ADR 001: Logging System using Winston and OpenTelemetry

**Status:** Accepted (2023-10-04)

## Context

Our application requires a robust logging system that:

- Logs to both the console (for development and debugging) and a SigNoz endpoint (for production monitoring).
- Enriches logs with distributed tracing information such as trace IDs and span IDs from OpenTelemetry.
- Is compatible with the NestJS framework and adheres to best practices for maintainability and testability.

## Decision

We implemented a custom logging service, `AppLoggerService`, by leveraging the following components:

1. **Winston Logging Library**:
   - Selected for its mature ecosystem, support for multiple transports (Console and HTTP), and ability to create child loggers for propagating context.

2. **Dual Transports**:
   - **Console Transport:** Provides immediate feedback during development using Winston's built-in Console transport.
   - **HTTP Transport:** Configured to send log events to a SigNoz endpoint. Parameters such as host, port, and path are configurable based on the SigNoz setup.

3. **OpenTelemetry Integration**:
   - Uses the OpenTelemetry API to extract trace context (traceId and spanId) from the active span in the current execution context.
   - These identifiers are automatically appended to each log entry, enabling seamless connection between application logs and distributed tracing data.

4. **Child Logger Support**:
   - Implements a `child` method that allows the creation of child logger instances inheriting the parent context along with additional metadata. This is vital for capturing the execution chain across asynchronous calls.

5. **NestJS Logger Interface Compliance**:
   - The custom logger implements NestJS's `LoggerService` interface, making it easily replaceable or injectable across the application.

## Consequences

- **Enhanced Debugging:** Logs enriched with trace and span identifiers assist in correlating log events with distributed traces.
- **Flexibility:** The design supports swapping or extending transports without major architectural changes.
- **Maintainability:** Modular implementation and comprehensive documentation ensure that future updates or changes can be made cost-effectively.

## Alternatives Considered

- **Pino Logging Library:** Although Pino was considered for its performance benefits, Winston was chosen due to its superior support for multiple transports and native child loggers.
- **Direct OpenTelemetry Collector Integration:** While direct integration could reduce custom code, using a custom logger was preferred for its flexibility and fine-grained control over logging behavior.

## Rationale

This approach provides a scalable, production-grade logging solution that meets our current requirements and allows for future extensibility. By integrating Winston with OpenTelemetry, we ensure a robust connection between log data and distributed tracing, which is critical in modern, microservices-based architectures. 