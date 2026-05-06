import { ERestStatus } from '../enum/Rest.enum';

export interface IApiSuccessResponse<T> {
  status: ERestStatus;
  statusCode: number;
  path: string;
  message: string;
  timestamp: string;
  data: T;
}
