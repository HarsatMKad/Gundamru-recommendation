export const agregation_config = {
  SMOOTHING_BASE_SCORE: 4, // какую оценку чаще получают товары. В сторону какой оценки сглаживать
  SMOOTHING_LAMBDA: 0.3, // сила сглаживания. 0.1 слабее, 1 сильнее
  SMOOTHING_ALPHA: 0.5, // сила штрафа. 0.3 слабее, 1.0 сильнее
};
