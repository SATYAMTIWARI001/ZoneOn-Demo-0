# ZoneOn AI API Reference Documentation

This document describes the request/response payloads, authentication, and HTTP verbs for the ZoneOn AI backend routes.

---

## 🛰️ Base URL
All API requests must target: `/api/*`

---

## 📌 Endpoint Summary

### 1. `GET /api/health`
- **Description**: Verification of Express service and backend container status.
- **Response**:
  ```json
  { "status": "ok" }
  ```

---

### 2. `GET /api/weather`
- **Description**: Fetches current meteorological data corresponding to the World Cup stadium coordinates.
- **Response**:
  ```json
  {
    "location": "MetLife Stadium, East Rutherford",
    "temperature": 24.5,
    "weather": "Clear Sky",
    "details": "Wind speed: 12km/h, Humidity: 62%"
  }
  ```

---

### 3. `GET /api/incidents`
- **Description**: Returns all currently active and resolved incidents.
- **Response**:
  ```json
  [
    {
      "id": "inc-01",
      "title": "Minor Spillage Gate C",
      "description": "Spilled beverage on stairs",
      "category": "Facilities",
      "severity": "Low",
      "status": "Active",
      "sector": "Sector 3",
      "checklist": ["Cordon off stairwell", "Deploy mop team"],
      "createdAt": "2026-07-08T10:00:00Z"
    }
  ]
  ```

---

### 4. `POST /api/incidents`
- **Description**: Reports a raw incident, auto-triaged by Google Gemini.
- **Request Body**:
  ```json
  {
    "description": "Heatstroke reported by fan in seat row 12 of Sector 4",
    "sector": "Sector 4"
  }
  ```
- **Response**:
  ```json
  {
    "id": "inc-55a29",
    "title": "Medical Incident: Heatstroke in Sector 4",
    "description": "Heatstroke reported by fan in seat row 12 of Sector 4",
    "category": "Medical",
    "severity": "High",
    "status": "Active",
    "sector": "Sector 4",
    "checklist": ["Dispatch first-responder medical bag", "Initiate cooling compress"],
    "createdAt": "2026-07-08T11:45:00Z"
  }
  ```

---

### 5. `POST /api/incidents/:id/resolve`
- **Description**: Resolves an active incident, updating status coordinates.
- **Response**:
  ```json
  {
    "success": true,
    "id": "inc-55a29"
  }
  ```

---

### 6. `GET /api/transport`
- **Description**: Retrieves delays and durations for active transit routes.
- **Response**:
  ```json
  [
    {
      "name": "Hudson Shuttle",
      "delay": 2,
      "duration": 15,
      "status": "Normal"
    }
  ]
  ```

---

### 7. `POST /api/transport/update`
- **Description**: Updates delay parameters on a specified transport route.
- **Request Body**:
  ```json
  {
    "name": "Hudson Shuttle",
    "delay": 10,
    "duration": 15
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "transit": {
      "name": "Hudson Shuttle",
      "delay": 10,
      "duration": 15,
      "status": "Delayed"
    }
  }
  ```
