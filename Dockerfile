# Use Node.js LTS (Alpine) as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
# Note: By default this runs 'vite build'. 
# If you need a specific environment build (e.g., nagad), you can change this to:
# RUN npm run build:nagad
RUN npm run build

# Install a simple static server globally to serve the built files
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Command to serve the 'dist' folder on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
