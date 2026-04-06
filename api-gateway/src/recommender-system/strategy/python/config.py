# Коэффициент крутизны сигмоиды для Z-score (0.5 - 1.0)
# Чем выше, тем резче переход от низкой к высокой уверенности
ZSCORE_SIGMOID_FACTOR = 0.7

# Минимальная уверенность (0.1 - 0.5)
MIN_CONFIDENCE = 0.2

# диапазон нормализации
NORMALIZATION_MIN = 0
NORMALIZATION_DEFAULT = 5
NORMALIZATION_MAX = 10
NEUTRAL_SCORE = 5 # Нейтральная оценка

# Минимальный порог схожести (если меньше - игнорируются)
MIN_SIMILARITY_THRESHOLD = 0.01

# Стандартная уверенность
DEFAULT_CONFIDENCE_LOW_DATA = 0.5

# Порог для проверки std
STD_EPSILON = 0.001
# мин и макс значения z-score
Z_SCORE_CLIP_MIN = -5
Z_SCORE_CLIP_MAX = 5

# Диапазон значений коэфицента актуальности
MAX_DATE_WEIGHT = 1.0
MIN_DATE_WEIGHT = 0.6
# Длительность актуальности события в днях. Пока актуально - имеет максимальный коэфицент актуальности
PLATEAU_DAYS = 6