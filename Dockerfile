FROM python:3.11
LABEL authors="User"
ENV PYTHONBUFFERED 1
WORKDIR /hackerton
COPY requirements.txt /hackerton/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /hackerton/

ENTRYPOINT ["python", "manage.py", "runserver", "0.0.0.0:8000"]