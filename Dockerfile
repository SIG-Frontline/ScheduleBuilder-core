# Use the official Node.js image as the base image
FROM node:20

RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install the application dependencies
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN pnpm run build

# Expose the application port
EXPOSE 4000

# Command to run the application
CMD ["node", "dist/src/main"]