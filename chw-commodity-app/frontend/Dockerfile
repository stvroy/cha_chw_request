# frontend/Dockerfile
FROM node:18 as build

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest and build
COPY . .
RUN npm run build

# Serve using nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Remove default nginx config and optionally add your own
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]