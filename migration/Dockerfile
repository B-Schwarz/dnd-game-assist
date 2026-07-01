# Throwaway image for the 2.0 database migration. Runs on the compose network so
# it can reach the `db` service directly, reading/writing the dump on a shared
# volume. See migration/README.md.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY migrate_to_2_0.py .

ENTRYPOINT ["python", "migrate_to_2_0.py"]
