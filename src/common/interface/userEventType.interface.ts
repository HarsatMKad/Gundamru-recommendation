import { UserEventNames } from '../enum/UserEventName.enum';

export interface IUserEventType {
  name: UserEventNames;
  weight: number;
  retentionDays: number;
  maxForUser: number;
}
