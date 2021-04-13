package main

import (
  "encoding/json"
  "github.com/gorilla/websocket"
  "net/http"
)

var upgrader = websocket.Upgrader{
  ReadBufferSize:  1024,
  WriteBufferSize: 1024,
  CheckOrigin: func(r *http.Request) bool {
    return true
  },
}

type Message struct {
  Type string `json:"type"`
  Data string `json:"data"`
}

func routePath(w http.ResponseWriter, r *http.Request) {
  conn, err := upgrader.Upgrade(w, r, nil)
  if err != nil {
    return
  }
  for {
    _, p, err := conn.ReadMessage()

    if err != nil {
      print("conn closed")
      return
    }

    messageResolverUser(p, conn)
  }
}


func messageResolverUser(s []byte, conn *websocket.Conn) {
  var m Message
  err := json.Unmarshal(s, &m)
  if err != nil {
    print(err)
  }

  switch m.Type {
  case "renderCode":
    // got message from socket
    
  }
}
