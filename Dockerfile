FROM ubuntu:latest
LABEL authors="User"

FROM python:3.11
ENV PYTHONBUFFERED 1
WORKDIR /hackerton
COPY requirements.txt /hackerton/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /hackerton/

ENTRYPOINT ["top", "-b"]