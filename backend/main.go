package main

import (
  "encoding/json"
  "github.com/gorilla/websocket"
  "log"
  "net/http"
  "os"
  "strconv"
  "strings"
  "time"
)

var image [][]string
var x = 100
var y = 50

var upgrader = websocket.Upgrader{
  ReadBufferSize:  1024,
  WriteBufferSize: 1024,
  CheckOrigin: func(r *http.Request) bool {
    return true
  },
}

type Connection struct {
  Conn *websocket.Conn
  LastSubmit time.Time
}

type Message struct {
  Type string `json:"type"`
  Data string `json:"data"`
}

var connections map[string]Connection

func main() {
  image = make([][]string, x)
  for i := range image {
    image[i] = make([]string, y)
    for j := range image[i]{
      image[i][j] = "250,250,250"
    }
  }

  connections = make(map[string]Connection, 100)
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	urlPath := r.URL.Path[1:]

	if strings.HasPrefix(urlPath, "socket/") {
		routePath(w, r)
	} else {
		log.Print("Entering static file handler: " + urlPath)
		staticFilePath := "./static/"
		if _, err := os.Stat(staticFilePath + urlPath); os.IsNotExist(err) {
			// path does not exist
			urlPath = ""
		}
		http.ServeFile(w, r, staticFilePath + urlPath)
	}
}

func (this Message) json() []byte {
  m, _ := json.Marshal(this)
  return m
}

func routePath(w http.ResponseWriter, r *http.Request) {
  conn, err := upgrader.Upgrade(w, r, nil)
  if err != nil {
    return
  }
  key := ""
  for {
    _, p, err := conn.ReadMessage()
    if err != nil {
      return
    }
    var m Message
    err = json.Unmarshal(p, &m)
    if err != nil {
      print(err)
    }
    if m.Type == "key" {
      key = m.Data
      if _, ok := connections[key]; ok {
        _ = connections[key].Conn.Close()
      }
      // TODO need to do some security checks
      k := connections[key]
      k.Conn = conn
      connections[key] = k
      im, _ := json.Marshal(image)
      _ = conn.WriteMessage(1, Message{"image", string(im)}.json())
    }
    messageResolverUser(&m, conn)
  }
}

func messageResolverUser(m *Message, conn *websocket.Conn) {
  switch m.Type {
    case "setvalue":
      data := strings.Split(m.Data, "|")
      key := data[2]
      if _, ok := connections[key]; ok {
        // TODO check time out
        if time.Now().Sub(connections[key].LastSubmit) < 2 * time.Second{
          conn.WriteMessage(1, Message{"error", "time out"}.json())
        }else {
          j := connections[key]
          j.LastSubmit = time.Now()
          connections[key] = j
          for k, _ := range connections {
            _ = connections[k].Conn.WriteMessage(1, Message{"change", m.Data}.json())
          }
          ix, _ := strconv.Atoi(data[0])
          iy, _ := strconv.Atoi(data[1])
          image[ix][iy] = data[3]
        }
      }
      break
  case "]":

  }
}
