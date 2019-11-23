package main

import (
	"log"
	"net/http"
	"os"

	pusher "github.com/pusher/pusher-http-go"
)

var client = pusher.Client{
	AppID:   os.Getenv("APP_ID"),
	Key:     os.Getenv("KEY"),
	Secret:  os.Getenv("SECRET"),
	Cluster: os.Getenv("CLUSTER"),
	Secure:  true,
}

type user struct {
	Name  string `json:"name" xml:"name" form:"name" query:"name"`
	Email string `json:"email" xml:"email" form:"email" query:"email"`
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("./public")))

	http.HandleFunc("new/user", registerNewUser)
	http.HandleFunc("/pusher/auth", pusherAuth)

	log.Fatal(http.ListenAndServe(":8090", nil))
}

func registerNewUser(rw http.ResponseWriter, req *http.Request) {

}

func pusherAuth(res http.ResponseWriter, req *http.Request) {

}
