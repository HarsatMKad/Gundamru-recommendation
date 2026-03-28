export enum EErrEventType {
  EVENT_TYPE_NOT_FOUND = 'Event type for id not found',
  EVENT_TYPE_EXISTED = 'Event type with name already exists',
}

export enum EErrRecSetting {
  INVALID_SCOPE = 'Invalid scope parameter',
  SETTINGS_NOT_FOUND = 'Setting not found',
  SETTINGS_EXIST = 'Settings already exist',
}

export enum EErrUserEvents {
  TYPE_NOT_FOUND = 'Event type not found',
}

export enum EErrRecSystem {
  ERROR_DURING_GENERATION = 'Error during recommendation generation',
  CALCULATION_ERROR = 'Calculation error',
}

export const API_KEY_VALID_ERROR = 'API Key validation failed';
