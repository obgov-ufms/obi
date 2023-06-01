export interface Usecase<P, T> {
  execute(props: P): T;
}
