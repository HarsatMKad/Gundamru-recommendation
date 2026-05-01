import path from 'path';

export const agregationConfig = {
  SMOOTHING_ALPHA: 0.2, // штраф для товаров отсутствующих в результатах других методов. Чем выше, тем сильнее штрафует (0-1)
};

export const pythonConfig = {
  PYTHON_BASE_PATH: path.join(
    __dirname,
    '../../../src/generation-system/strategy/python',
  ), //'/app/src/generation-system/strategy/python', // путь до python папки в проекте
  PYTHON_GATEWAY_NAME: 'python-gateway.py', // название главного файла
};
