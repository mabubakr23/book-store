# Use official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start app with compiled JS
CMD ["npm", "run", "start"]
