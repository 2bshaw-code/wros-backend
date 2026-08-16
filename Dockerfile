FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV PORT=$PORT
ENV MONGO_URI=$MONGO_URI
ENV JWT_SECRET=$JWT_SECRET
EXPOSE 8080
CMD ["node", "server.js"]
