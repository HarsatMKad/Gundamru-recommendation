# Gundamru-recommendation

Сервис, отвечающий за генерацию рекомендаций товаров

## Технологический стек

*   **Фреймворк:** Nestjs
*   **Язык:** TypeScript, Python
*   **База данных:** PostgreSQL
*   **Используемые библиотеки:**
    * **TypeScript:** typeorm, config, cache-manager
    * **Python:** pandas, scikit-learn, numpy

## Установка и запуск
Установка зависимостей
  ```bash
  yarn
  ```
Запуск
  ```bash
  yarn run start
  ```

## Переменные окружения
Создайте файл `.env` в корне проекта и заполните переменные.
```
PORT=<Порт, на котором запустится проект>
API_KEY=<Значение ключа x-api-key в заголовке запросов>
MAIN_SERVER_URL=<Адрес основного сервера>
PRODUCT_API_KEY=<Ключ x-api-key для получения списка товаров из основного сервера>
```
Параметры базы данных.
```
DB_HOST=<ata base host>
DB_PORT=<data base port>
DB_USERNAME=<data base username>
DB_PASSWORD=<data base password>
DB_DATABASE_NAME=<data base name>
```
Параметры кэша. Используется в recommendations.module, реализовывается в recommendations.service.
```
CACHE_TTL=<Время хранения кэша в секундах>
CACHE_MAX=<Максимальное количество записей в кэше>
```
Параметры cron. CLEANUP_TIME используется в user-events/cleanup.service, GENERATION_TIME используется в generation-system/orchestrator.service.
```
CRON_CLEANUP_TIME=<Время запуска очистки данных, пример: 0 3 * * *>
CRON_GENERATION_TIME=<Время запуска генерации, пример: 0 4 * * *>
```
Параметры генерации. Рекомендуется генерировать в два раза больше товаров от числа, которое необходимо отобразить. (отображаем 10 -> генерируем 20)
```
REC_GENERATION_LENTGH=<Размер массива товаров, которые будут генерироваться>
PYTHON_PATH=<Путь до python на устройстве. Если используется запуск через Dockerfile из проекта, то путь: /opt/venv/bin/python>
```
Параметры методов Python. Более подробно про параметры можно посмотреть в generation-system/strategy/python/config.py
```
MIN_PRODUCT_FOR_USER=<Минимальное количество событий для пользователя, чтобы он учитывался в генерации>
MIN_SIMILARITY_THRESHOLD=<Минимальный порог схожести пользователей. Рекомендуется: 0.001>
PRICE_PERCENTAGE_RANGE=<Размах учета цены. Рекомендуемый диапазон: 0.1-0.4>
PRICE_COEFFICIENT=<Коэффициент для товаров, попавших в диапазон цены. Рекомендуется: 1.3>
INTERACTION_SENSITIVITY_COEFFICIENT=<Коэффициент для уже взаимодействованных товарам. Рекомендуемый диапазон: 0.1 - 0.01>
MAX_DATE_WEIGHT=<Максимальный коэффициент веса по времени. Рекомендуется: 1>
MIN_DATE_WEIGHT=<Минимальный коэффициент веса по времени. Рекомендуется: 0.6>
RELEVANCE_DAYS=<Длительность актуальности события в днях. Рекомендуется: 7>
```
Веса характеристик товаров, используются только в content-based стратегии. Рекомендуемо подобрать веса так, чтобы их сумма была 1.
```
CONTENT_BASED_WEIGHTS_BRAND=<Вес бренда>
CONTENT_BASED_WEIGHTS_GRADE=<Вес грейда>
CONTENT_BASED_WEIGHTS_SCALE=<Вес масштаба>
CONTENT_BASED_WEIGHTS_PRICE=<Вес цены>
```

## Основные api методы
Все api методы требуют заголовок x-api-key со значением API_KEY из конфига.

1. ### Создание событий пользователей

     POST api/user-events/

     body:
      ```json
      {
        "events": [{
            "userId": "user12",
            "productId": "product53",
            "eventName": "view"
        },{
            "userId": "user91",
            "productId": "product11",
            "eventName": "cart"
        }]
      }
      ```
    
2. ### Создание настройки генерации

     POST api/recommendation/settings

     body:
      ```json
      {
        "name": "Главная настройка",
        "type": "main",
        "personalMethods": [{
            "strategy": "collab_user_based",
            "weight": 1
        },{
            "strategy": "content_based",
            "weight": 0.6
        }],
        "fallbackStrategy": "global_popylar",
        "fallbackWeight": 1
      }
      ```
      
3. ### Запустить генерацию вручную

     GET api/recommendation-system

4. ### Получить рекомендации для пользователя

     GET api/recommendation/forUser/:userId

     param:
      ```
      userId="user91"
      ```

     query:
      ```
      limit=2                        // Ограничение на размер выдаваемых рекомендаций, без учета товаров из addRecommendedProducts. По умолчанию = 20
      minScore=0.3                   // Минимальная уверенность сгенерированных товара. По умолчанию = 0
      addRecommendedProducts=false   // Добавить ли все товары, у которых поле is_recommended=true, в результат рекомендаций каждой настройки
      ```

      Формат ответа:
      ```json
      {
        "main": [{
            "sku": "product52",
            "score": 0.53
        },{
            "sku": "product15",
            "score": 0.41
        }]
      }
      ```
