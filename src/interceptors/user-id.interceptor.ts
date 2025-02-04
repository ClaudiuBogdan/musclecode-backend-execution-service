import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { asyncLocalStorage } from './request-context';

// This interceptor sets the async local storage with the userId from the request, ensuring the context is available later
// Architectural decision: Using a request-scoped interceptor instead of middleware ensures the request.user is available, as middleware runs before guards.
@Injectable({ scope: Scope.REQUEST })
export class UserIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { user } = context.switchToHttp().getRequest();

    if (!user?.id) return next.handle();

    return new Observable((subscriber) => {
      asyncLocalStorage.run({ userId: user.id }, () => {
        const subscription = next.handle().subscribe(subscriber);
        return () => subscription.unsubscribe();
      });
    });
  }
}
