export interface SuccessResponse {
  status: 200;
  body: {
    message: string;
  };
}

export interface ErrorResponse {
  status: 400 | 404 | 500;
  body: {
    error: string;
  };
}

export type ServiceResponse = SuccessResponse | ErrorResponse;
