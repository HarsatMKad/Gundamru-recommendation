export enum ELogHandler {
  CLEANUP_START = 'Process of cleaning old data has begun',
  CLEANUP_STOP = 'Cleaning process is complete',
  DELETED_RECODS = 'Records deleted',
  REC_GENERATION_START = 'Process of generating recommendations has begun',
  REC_GENERATION_STOP = 'Generation process is complete',
  DISABLED_SETTINGS_FOUND = 'Disabled settings found',
  CLEANING_REC_COMPLETE = 'Cleaning of inactive recommendations is complete',
  REC_SAVED = 'Personal recommendations were saved',
  REC_NO_SAVED = 'No recommendation records were saved',
  GENERATION_MANUAL_INITIALIZED = 'Manual trigger generation: started',
  GENERATION_MANUAL_COMPLITE = 'Manual trigger generation: completed',
  FALLBACK_UPDATE_COMPLETE = 'Fallback update complete',
}
