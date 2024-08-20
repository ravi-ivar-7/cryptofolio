# Use the official Node.js image as a base image
FROM node:21

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY backend-nodejs/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY backend-nodejs/ .

EXPOSE 3001

# Start the Node.js server
CMD ["npm", "start"]
