import { UserEventNames } from '../enum/UserEventName.enum';
import { IUserEventType } from '../interface/IUserEventType.interface';

export class UserEventType {
  private static eventsMap = new Map<UserEventNames, IUserEventType>([
    [
      UserEventNames.VIEW,
      {
        name: UserEventNames.VIEW,
        weight: 1,
        retentionDays: 30,
        maxForUser: 100,
      },
    ],
    [
      UserEventNames.WISHLIST,
      {
        name: UserEventNames.WISHLIST,
        weight: 10,
        retentionDays: 30,
        maxForUser: 50,
      },
    ],
    [
      UserEventNames.BOUGHT,
      {
        name: UserEventNames.BOUGHT,
        weight: 20,
        retentionDays: 30,
        maxForUser: 50,
      },
    ],
  ]);

  static getConfig(eventName: UserEventNames): IUserEventType {
    const config = this.eventsMap.get(eventName);
    if (!config) {
      throw new Error(`Unknown event type: ${eventName}`);
    }
    return config;
  }

  static getAllEvents(): IUserEventType[] {
    return Array.from(this.eventsMap.values());
  }

  static getWeight(eventName: UserEventNames): number {
    return this.getConfig(eventName).weight;
  }

  static getRetentionDays(eventName: UserEventNames): number {
    return this.getConfig(eventName).retentionDays;
  }

  static getMaxForUser(eventName: UserEventNames): number {
    return this.getConfig(eventName).maxForUser;
  }

  static isValidEvent(eventName: string): eventName is UserEventNames {
    return this.eventsMap.has(eventName as UserEventNames);
  }
}
