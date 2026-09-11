export interface ErrorSource {
  path: string;
  message: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errorSources: ErrorSource[];
}
