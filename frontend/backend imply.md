Backend — Current Setup
1. Architecture

Keywords:

Java
Spring Boot
Microservices Architecture
API Gateway
Service Decomposition
Horizontal Scaling
Client-Side Load Balancing
Spring Cloud LoadBalancer
Frontend
   ↓
API Gateway :8080
   ↓
Spring Cloud LoadBalancer
   ├── Creation Service :8081
   ├── Creation Service :8083
   ├── Redirect Service :8082
   └── Redirect Service :8084

Frontend ONLY calls :8080.

2. Authentication

Keywords:

JWT
Stateless Authentication
BCrypt Password Hashing
Spring Security
Bearer Token
Protected Routes

APIs:

POST /api/users/signup
POST /api/users/login

Signup:

{
  "username": "...",
  "email": "...",
  "password": "..."
}

Login:

{
  "email": "...",
  "password": "..."
}

Authenticated requests:

Authorization: Bearer <JWT>
3. URL Management / CRUD

Keywords:

REST API
CRUD
User-Owned URLs
DTO
URL Validation

APIs:

POST   /api/urls
GET    /api/urls
PUT    /api/urls/{id}
DELETE /api/urls/{id}

Create/update body:

{
  "originalUrl": "https://example.com"
}

Response:

{
  "id": 1,
  "originalUrl": "https://example.com",
  "shortCode": "Ab12Xy",
  "expiresAt": "2027-07-26T15:20:30"
}
4. URL Business Rules

Keywords:

Maximum 4 URLs per user
Duplicate prevention
User ownership
URL expiration
One-year expiration
HTTP/HTTPS validation

Rules:

Maximum 4 URLs/user

Same user + same original URL
→ cannot create duplicate

Different users + same URL
→ allowed

Edit URL
→ shortCode stays the same

Delete URL
→ removes URL

Expiration
→ 1 year from creation
5. Short Code Generation

Keywords:

Redis Atomic Counter
Distributed ID Generation
Base62
6-character short code
Unpredictable short codes
Backend-generated IDs

Important:

Frontend does NOT generate short codes.

Backend generates the 6-character code.

6. Redis

Keywords:

Redis
Cache-Aside Pattern
URL Cache
Atomic Counter
Rate Limiting
TTL
Cache Invalidation

Redis is used for:

1. URL → original URL cache
2. Atomic counter for short-code generation
3. Gateway rate limiting

Frontend never talks directly to Redis.

7. MySQL

Keywords:

MySQL
Persistent Storage
Source of Truth
JPA
Hibernate
Database Constraints

Stores:

Users
Short URLs
Original URL
Short Code
Expiration
User ownership
Original URL hash

Frontend never talks directly to MySQL.

8. Redirect System

Keywords:

URL Redirect
Cache-Aside
Redis Cache
MySQL Fallback
HTTP 302
URL Expiration

API:

GET /{shortCode}

Flow:

Short URL
   ↓
Redirect Service
   ↓
Redis
   ├── HIT → original URL → 302
   │
   └── MISS
        ↓
      MySQL
        ↓
    expiration check
        ↓
      Redis cache
        ↓
       302

The frontend should not implement the actual redirect logic.

9. Rate Limiting

Keywords:

Redis-backed Rate Limiting
RequestRateLimiter
Throttling
IP-based Rate Limiting

Gateway currently limits:

Signup
Login
Create URL
Update URL
Delete URL

Frontend must handle:

429 Too Many Requests
10. CORS

Keywords:

Cross-Origin Resource Sharing
API Gateway CORS
Authorization Header
Credentials

Local frontend:

http://localhost:5173

Gateway allows the frontend origin.

11. Error Handling

Frontend should explicitly handle:

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
Network Error

Especially:

401 → clear auth → login

429 → wait / retry later

404 → proper not-found UI

500/502/503 → friendly server error UI

Never expose backend stack traces or internal service information.

12. Frontend API Configuration

Development:

VITE_API_URL=http://localhost:8080

Production will eventually be something like:

VITE_API_URL=https://api.yourdomain.com

The frontend should have one centralized API service layer.

React
 ↓
api.js
 ↓
API Gateway
 ↓
Microservices
13. Dashboard Requirements

Keywords:

Protected Dashboard
User Profile
Username
Email
URL CRUD
Copy URL
Share
QR Code
Expiration
Analytics
Logout

Dashboard should show:

Username
Email

URLs: X / 4

My URLs
 ├── Original URL
 ├── Short URL
 ├── Expiration
 ├── Copy
 ├── Share
 ├── QR
 ├── Edit
 ├── Delete
 └── Analytics
14. Analytics

Current backend: NOT IMPLEMENTED YET.

Frontend should only prepare:

Analytics Dashboard UI
Per-URL Analytics UI
Charts/components

Do not invent analytics APIs or fake real data.

Future possibilities:

Total clicks
Clicks over time
Country/region
Daily/weekly/monthly
Per-URL statistics
15. QR + Sharing

These are frontend features.

QR should encode:

PUBLIC_SHORT_URL

Example:

https://yourdomain.com/Ab12Xy

Not:

http://localhost:8081/Ab12Xy

Sharing should use the browser Web Share API where available, with fallback options.