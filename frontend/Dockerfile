FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
<<<<<<< HEAD
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN npm ci
=======
RUN npm install

>>>>>>> parent of 48e002c (javascript 메모리 문제 해결)
COPY . .

RUN npm run build

<<<<<<< HEAD
# 실행 스테이지
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm ci --only=production
=======
>>>>>>> parent of 48e002c (javascript 메모리 문제 해결)
EXPOSE 3000

CMD ["npm", "start"]
