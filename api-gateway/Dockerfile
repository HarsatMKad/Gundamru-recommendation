FROM node:20

RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

RUN python3 -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

COPY ./src/generation-system/strategy/python/requirements.txt ./src/generation-system/strategy/python/requirements.txt

RUN pip install --no-cache-dir -r ./src/generation-system/strategy/python/requirements.txt

COPY . .

RUN yarn build

EXPOSE 3000

CMD [ "yarn", "start" ]