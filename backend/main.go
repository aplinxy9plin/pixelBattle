package main

import (
  "log"
  "net/http"
  "os"
  "strings"
)

func main() {
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
