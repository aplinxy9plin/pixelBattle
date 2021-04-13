package main

import (
  "bytes"
  "fmt"
  "io/ioutil"
  "os/exec"
)

func compileAndBuild(code []byte) (string, error) {
  fname := "tmp/program.go"
  err := ioutil.WriteFile(fname, code, 0644)
  if err != nil {
    return "", err
  }
  c := exec.Command("go build "+ fname)

  var out bytes.Buffer
  var stderr bytes.Buffer
  c.Stdout = &out
  c.Stderr = &stderr
  err = c.Run()
  if err != nil {
    return out.String(), err
  }
  return fname, nil
}

func runProgram(name string) (string, error){
  c := exec.Command(name)

  var out bytes.Buffer
  var stderr bytes.Buffer
  c.Stdout = &out
  c.Stderr = &stderr
  err := c.Run()
  if err != nil {
    fmt.Println(stderr.String())
    return "", nil
  }

  fmt.Println("Result: " + out.String())
  return "", nil
}
