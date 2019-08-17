FROM python:3.7.4
MAINTAINER Mitchel Humpherys <mitch.special@gmail.com>

ENV PYTHONUNBUFFERED 1
RUN mkdir -p /app
COPY requirements.txt /app
WORKDIR /app
RUN pip install -r requirements.txt
COPY . /app
CMD ["python", "app.py"]
