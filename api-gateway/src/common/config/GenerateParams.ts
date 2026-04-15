export const agregationConfig = {
  SMOOTHING_ALPHA: 0.2, // штраф, если товар отсутствует в результатах других методов. Чем выше, тем сильнее штрафует (0-1)
};

export const pythonConfig = {
  PYTHON_PATH: '/opt/venv/bin/python', // путь до python
  PYTHON_BASE_PATH: '/app/src/recommender-system/strategy/python', // путь до python папки в проекте
  PYTHON_GATEWAY_NAME: 'python-gateway.py', // название главного файла
};
