export enum ERestStatus {
  SUCCESS = 'Success',
  CREATED = 'Created',
  UPDATED = 'Updated',
  DELETED = 'Deleted',
  DEACTIVATED = 'Deactivated',
  LOG_CREATED = 'Log created',
  BUSY = 'Busy',
  ACCEPTED = 'accepted',
  ERROR = 'Error',
}

export enum ERestMessages {
  INVALID_MOD = 'Invalid mode parameter',
  GENERATION_RUN_BACKGROUND = 'Generation is running in the background',
  GENERATION_STILL_PROGRESS = 'Generation is still in progress',
}
