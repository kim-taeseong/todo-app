# 빌드 스테이지
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./

# 메모리 한도를 8GB로 증가
ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN npm install
COPY . .
RUN npm run build

# 실행 스테이지
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm install --only=production
EXPOSE 3000
CMD ["npm", "start"]
