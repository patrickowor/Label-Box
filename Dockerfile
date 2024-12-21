# Use a Python + Node.js base image
FROM nikolaik/python-nodejs:latest

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Change to the template directory
WORKDIR /app/template

# Install Node.js dependencies and build the project
RUN npm install
RUN npm run build

# Return to the root directory
WORKDIR /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port the app runs on
EXPOSE 4000

# Run the application
CMD ["uvicorn", "--port", "4000","--host", "0.0.0.0", "app.main:app"]