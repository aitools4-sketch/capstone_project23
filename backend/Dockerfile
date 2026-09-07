FROM python:3.11.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Docker's build runs as root, unlike Render's native Python buildpack —
# that's the whole reason this service is on Docker. --with-deps installs
# Chromium's OS-level shared libraries via apt-get, which failed with
# "su: Authentication failure" under the old buildpack (see render.yaml
# history) because that environment grants no root/sudo.
RUN playwright install --with-deps chromium

COPY . .

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
