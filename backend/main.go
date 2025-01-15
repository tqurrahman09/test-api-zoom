package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"time"
)

type Meeting struct {
	Id            int    `json:"id"`
	ZoomMeetingId string `json:"zoomMeetingId"`
	Topic         string `json:"topic"`
	StartTime     string `json:"startTime"`
	Duration      int    `json:"duration"`
	CreatedAt     string `json:"created_at"`
}

// main function
func main() {
	// connect to database
	db, err := sql.Open("mysql", "root:@tcp(127.0.0.1:3306)/zoom")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// create router
	router := mux.NewRouter()
	router.HandleFunc("/api/go/meetings", getMeetings(db)).Methods("GET")
	router.HandleFunc("/api/go/meetings", createMeeting(db)).Methods("POST")
	router.HandleFunc("/api/go/meetings/{id}", getMeeting(db)).Methods("GET")
	router.HandleFunc("/api/go/meetings/{id}", updateMeeting(db)).Methods("PUT")
	router.HandleFunc("/api/go/meetings/{id}", deleteMeeting(db)).Methods("DELETE")

	// wrap the router with CORS and JSON content type middlewares
	enhancedRouter := enableCORS(jsonContentTypeMiddleware(router))
	// start server
	log.Fatal(http.ListenAndServe(":8000", enhancedRouter))
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow any origin
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Check if the request is for CORS preflight
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Pass down the request to the next middleware (or final handler)
		next.ServeHTTP(w, r)
	})
}

func jsonContentTypeMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set JSON Content-Type
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

// get all meetings
func getMeetings(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT * FROM meetings")
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()

		meetings := []Meeting{} // array of meetings
		for rows.Next() {
			var u Meeting
			if err := rows.Scan(&u.Id, &u.ZoomMeetingId, &u.Topic, &u.StartTime, &u.Duration, &u.CreatedAt); err != nil {
				log.Fatal(err)
			}
			meetings = append(meetings, u)
		}
		if err := rows.Err(); err != nil {
			log.Fatal(err)
		}

		json.NewEncoder(w).Encode(meetings)

	}

}

// get meeting by id
func getMeeting(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]

		var u Meeting
		err := db.QueryRow("SELECT * FROM meetings WHERE id = $1", id).Scan(&u.Id, &u.ZoomMeetingId, &u.Topic, &u.StartTime, &u.Duration, &u.CreatedAt)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(u)
	}
}

// create Meeting
func createMeeting(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var u Meeting
		err := json.NewDecoder(r.Body).Decode(&u)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		result, err := db.Exec("INSERT INTO meetings (topic, startTime, duration, zoomMeetingId, created_at) VALUES (?, ?, ?, ?, ?)", u.Topic, u.StartTime, u.Duration, u.ZoomMeetingId, time.Now().Format("2006-01-02 15:04:05"))
		if err != nil {
			log.Printf("Error inserting meetings: %v", err)
			http.Error(w, "Failed to create meeting", http.StatusInternalServerError)
			return
		}

		id, err := result.LastInsertId()
		if err != nil {
			log.Printf("Error retrieving last insert ID: %v", err)
			http.Error(w, "Failed to retrieve meeting ID", http.StatusInternalServerError)
			return
		}

		u.Id = int(id)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(u)
	}
}

// update meeting
func updateMeeting(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var u Meeting
		if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		vars := mux.Vars(r)
		id := vars["id"]

		// Execute the update query
		_, err := db.Exec("UPDATE meetings SET topic = ?, startTime = ?, duration = ?, zoomMeetingId = ?, created_at = ? WHERE id = ?", u.Topic, u.StartTime, u.Duration, u.ZoomMeetingId, time.Now().Format("2006-01-02 15:04:05"), id)
		if err != nil {
			log.Printf("Error updating meeting: %v", err)
			http.Error(w, "Failed to update meeting", http.StatusInternalServerError)
			return
		}

		// Retrieve the updated meeting data from the database
		var updatedMeeting Meeting
		err = db.QueryRow("SELECT id, topic, startTime, duration, zoomMeetingId, created_at FROM meetings WHERE id = ?", id).Scan(&updatedMeeting.Id, &updatedMeeting.Topic, &updatedMeeting.StartTime, &updatedMeeting.Duration, &updatedMeeting.ZoomMeetingId, &updatedMeeting.CreatedAt)
		if err != nil {
			log.Printf("Error retrieving updated meeting: %v", err)
			http.Error(w, "Failed to retrieve updated meeting", http.StatusInternalServerError)
			return
		}

		// Send the updated meeting data in the response
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(updatedMeeting)
	}
}

// delete meeting
func deleteMeeting(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]

		var u Meeting
		err := db.QueryRow("SELECT * FROM meetings WHERE id = ?", id).Scan(&u.Id, &u.Topic, &u.StartTime, &u.Duration, &u.ZoomMeetingId, &u.CreatedAt)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		} else {
			_, err := db.Exec("DELETE FROM meetings WHERE id = ?", id)
			if err != nil {
				//todo : fix error handling
				w.WriteHeader(http.StatusNotFound)
				return
			}

			json.NewEncoder(w).Encode("Meeting deleted")
		}
	}
}
