FROM python:3.7.4

ENV PYTHONUNBUFFERED 1
RUN mkdir -p /app
COPY requirements.txt /app
WORKDIR /app
RUN pip install -r requirements.txt
COPY . /app
WORKDIR /app/yangify
CMD ["/app/start.sh"]
