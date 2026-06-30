# Hatua ya 1: Ku-build mradi wa React
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Hatua ya 2: Kuhost faili za dist kwa Nginx ya ndani
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Huu ni usanidi wa ndani wa Nginx kushughulikia React Routing
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
