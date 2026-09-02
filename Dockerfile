FROM node:22-slim AS build

WORKDIR /app

COPY client/package*.json client/
RUN cd client && npm ci

COPY server/package*.json server/
COPY server/prisma server/prisma
RUN cd server && npm ci

COPY client/ client/
RUN cd client && npm run build

COPY server/ server/
RUN cd server && npm run build

FROM node:22-slim

WORKDIR /app/server
ENV NODE_ENV=production

COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/node_modules ./node_modules
COPY --from=build /app/server/prisma ./prisma
COPY --from=build /app/server/package.json ./package.json
COPY --from=build /app/client/dist ../client/dist

EXPOSE 3333
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
