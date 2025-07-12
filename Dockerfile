FROM python:3.10

# Set working directory
WORKDIR /app

# Upgrade pip and install build tools (for pandas, pyarrow, scikit-learn, etc.)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     build-essential \
#     gcc \
#     curl \
#     && pip install --upgrade pip \
#     && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip setuptools wheel
# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run the API
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
