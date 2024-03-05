interface IRequest<B = any, P = any, Q = any> {
  body: B;
  params: P;
  query: Q;
}

export default IRequest;
