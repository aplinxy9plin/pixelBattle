FROM golang

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

COPY ./backend/ /usr/src/app/

RUN go mod download

RUN go build

EXPOSE 8080

# Run the executable
CMD ["/usr/src/app/backend"]

