import {
  lastValueFrom,
  timeout,
  retry,
  catchError,
  throwError,
  Observable,
  defaultIfEmpty,
  TimeoutError,
} from 'rxjs';

export async function ask<T>(
  obs$: Observable<T>,
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

export async function ack(obs$: Observable<unknown>, ms = 3000): Promise<void> {
  await lastValueFrom(obs$.pipe(timeout(ms), defaultIfEmpty(undefined)));
}
