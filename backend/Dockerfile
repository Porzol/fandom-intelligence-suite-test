FROM python:3.10-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pydantic[email]

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PYTHONPATH=/app

# Expose the port
EXPOSE $PORT

# Run the application
# CMD gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
CMD uvicorn main:app --host 0.0.0.0 --port 8000
