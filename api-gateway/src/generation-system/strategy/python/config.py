from util.classes import PythonConfig

class Config:
    # ---- Стоит настроить. Доступно для настройки через конфиг ----

    # Если пользователь взаимодействовал с меньшим количеством товаров, то этот пользователь и его события не учитываются в генерации
    MIN_PRODUCT_FOR_USER = 10
    # Минимальный порог схожести пользователей, чем меньше, тем более строгий отбор по похожести
    MIN_SIMILARITY_THRESHOLD = 0.001

    # Размах учета цены. От 0 до 1. Рекомендуемый диапазон (0.1 - 0.4)
    PRICE_PERCENTAGE_RANGE = 0.25 # ±25% от предпочитаемой цены пользователя
    # Коэффицент для товаров, попавших в диапазон предпочитаемой цены
    PRICE_COEFFICIENT = 1.3

    # Коэффицент штрафа к уже взаимодействованным товарам. Чем больше, тем сильнее штраф. Рекомендуемый диапазон (0.1 - 0.01) 
    # При 1 - при просмотре товара он больше не будет рекомендоваться. При 0 - товары не будут получать штраф при взаимодействиях с ними
    INTERACTION_SENSITIVITY_COEFFICIENT = 0.05

    # Диапазон значений коэфицента актуальности события
    MAX_DATE_WEIGHT = 1.0 # для актуальных нет штрафа
    MIN_DATE_WEIGHT = 0.6 # вес события станет слабее, если событие было давно
    # Длительность актуальности события в днях
    RELEVANCE_DAYS = 7 #  Пока не прошло 7 дней - имеет максимальный коэфицент актуальности, а дальше вес плавно убывает до min

    # Только для контентной фильтрации на основе схожести характеристик товаров)
    # Веса характеристик. Желательно чтобы сумма была = 1
    CONTENT_BASED_WEIGHTS = {
        'brand': 0.1,
        'grade': 0.2,
        'scale': 0.4,
        'price': 0.3
    }

    # ---- Настроить по желанию. Настраивается только через код ----

    # Диапазон для нормализации. Оценки будут от 0 до 10
    NORMALIZATION_MIN = 0
    NORMALIZATION_DEFAULT = 5
    NORMALIZATION_MAX = 10

    # Коэффициент крутизны сигмоиды для Z-score (0.5 - 1.0)
    # Чем выше, тем резче переход от низкой к высокой уверенности
    ZSCORE_SIGMOID_FACTOR = 0.7

    # Границы нормализации Z-score.
    Z_SCORE_CLIP_MIN = -5
    Z_SCORE_CLIP_MAX = 5

    # Минимальная уверенность, чтобы избежать уверенности = 0
    MIN_CONFIDENCE = 0.1
    # Стандартная уверенность
    DEFAULT_CONFIDENCE_LOW_DATA = 0.5

    # Порог для проверки std
    STD_EPSILON = 1e-6

    @classmethod
    def update_config(cls, config_data: PythonConfig):
        if not config_data:
            return
        cls.MIN_PRODUCT_FOR_USER = config_data.minProductForUser
        cls.MIN_SIMILARITY_THRESHOLD = config_data.minSumularityThreshold
        cls.PRICE_PERCENTAGE_RANGE = config_data.pricePercentageRande
        cls.PRICE_COEFFICIENT = config_data.priceCoefficient
        cls.INTERACTION_SENSITIVITY_COEFFICIENT = config_data.interactionSensitivityCoefficient
        cls.MAX_DATE_WEIGHT = config_data.maxDateWeight
        cls.MIN_DATE_WEIGHT = config_data.minDateWeight
        cls.RELEVANCE_DAYS = config_data.relevanceDays
        cls.CONTENT_BASED_WEIGHTS.update({
            'brand': config_data.weightCharacteristics.brand,
            'grade': config_data.weightCharacteristics.grade,
            'scale': config_data.weightCharacteristics.scale,
            'price': config_data.weightCharacteristics.price
        })
