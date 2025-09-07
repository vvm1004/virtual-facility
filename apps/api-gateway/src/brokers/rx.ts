import {
  lastValueFrom,
  timeout,
  retry,
  catchError,
  throwError,
  Observable,
} from 'rxjs';
import { TimeoutError } from 'rxjs';

export async function ask<T>(
  obs$: Observable<any>,
  ms = 3000,
  retries = 1,
): Promise<T> {
  return lastValueFrom(
    obs$.pipe(
      timeout(ms),
      retry({ count: retries, delay: 200 }),
      catchError((err) =>
        throwError(() =>
          err instanceof TimeoutError ? new Error('UPSTREAM_TIMEOUT') : err,
        ),
      ),
    ),
  );
}
