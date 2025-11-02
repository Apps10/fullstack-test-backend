export type Result<T, E> = Ok<T> | Err<E>;

export class Ok<T> {
  readonly isOk = true;
  constructor(public value: T) {}
}
export class Err<E> {
  readonly isOk = false;
  constructor(public error: E) {}
}

export const ok = <T>(v: T): Result<T, never> => new Ok(v);
export const err = <E>(e: E): Result<never, E> => new Err(e);

export const bind = async <T, U, E>(
  r: Result<T, E> | Promise<Result<T, E>>,
  fn: (v: T) => Promise<Result<U, E>> | Result<U, E>
): Promise<Result<U, E>> => {
  const rr = await r;
  if (rr instanceof Ok) return await fn(rr.value);
  return rr as Err<E>;
};
