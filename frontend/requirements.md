MASTER FRONTEND DEVELOPMENT PROMPT

You are building the frontend for an existing URL Shortener / Bitly-like application.

The backend is already implemented in Java + Spring Boot as a microservices architecture. Your job is to build the frontend around the existing backend APIs. Do not redesign, replace, or invent backend services or API contracts.

Use:

React
JavaScript
Vite
React Router
Modern CSS / responsive UI
Fetch or Axios for HTTP requests
QR-code generation library if needed
No TypeScript
No Next.js

The frontend must be professional, responsive, polished, and portfolio-quality.

1. EXISTING BACKEND ARCHITECTURE

The backend consists of 3 Spring Boot projects:

1. url-creation-service
2. url-redirect-service
3. api-gateway

There are currently multiple running instances for horizontal scaling.

Local development ports
API Gateway
localhost:8080

Creation Service #1
localhost:8081

Creation Service #2
localhost:8083

Redirect Service #1
localhost:8082

Redirect Service #2
localhost:8084

The frontend must ONLY communicate with the API Gateway on port 8080.

The frontend must NEVER directly call:

8081
8082
8083
8084

The Gateway handles routing and load balancing.

2. BACKEND ARCHITECTURE

Current architecture:

                    React Frontend
                          |
                          | HTTP
                          ↓
                  API Gateway :8080
                          |
                 Spring Cloud
                 Load Balancer
                    /       \
                   /         \
          Creation Services   Redirect Services
             /       \          /       \
           :8081    :8083     :8082    :8084
                \              /
                 \            /
                    Redis
                      +
                    MySQL

The backend uses:

API Gateway Pattern

The Gateway is the single entry point for frontend requests.

Microservices Architecture

Creation and Redirect functionality are separated into independent services.

Horizontal Scaling

There are currently:

Creation Service ×2
Redirect Service ×2

The Gateway distributes requests between instances.

Client-Side Load Balancing

Spring Cloud LoadBalancer is used internally by the Gateway.

Redis

Redis is used for:

URL caching
Atomic counter for short-code generation
Gateway rate limiting
MySQL

MySQL is the permanent source of truth for users and URLs.

JWT

Authentication is stateless and uses JWT.

Rate Limiting

The API Gateway rate-limits sensitive operations such as:

Signup
Login
URL creation
URL update
URL deletion

The redirect endpoint is intentionally not aggressively rate-limited.

3. FRONTEND API BASE URL

Create:

.env

with:

VITE_API_URL=http://localhost:8080

Every API request must use this environment variable.

Create a centralized API layer such as:

src/
├── api/
│   └── api.js

Do NOT scatter API URLs throughout components.

Example:

const API_URL = import.meta.env.VITE_API_URL;

All API requests should ultimately go through the centralized API layer.

4. AUTHENTICATION

Backend authentication uses JWT.

Users can:

Signup
Login
Logout

After successful login, the backend returns a JWT.

The frontend should store the JWT appropriately for this portfolio project and attach it to authenticated API requests:

Authorization: Bearer <JWT>

Authenticated endpoints require the JWT.

Unauthenticated users must not be able to access the dashboard.

5. EXISTING USER APIs

The backend already provides:

POST /api/users/signup
POST /api/users/login

These are publicly accessible through the Gateway.

Signup should collect the information required by the existing backend:

username
email
password

Login should use:

email
password

Do not invent additional required backend fields.

6. USER DASHBOARD

After successful login:

/login
   ↓
/dashboard

The dashboard is protected.

If there is no valid authentication token:

/dashboard

must redirect the user to:

/login
7. DASHBOARD USER INFORMATION

The dashboard should display the logged-in user's:

Username
Email

The existing backend's authenticated user information should be used.

Do not expose or display:

password
JWT
database IDs unless actually useful
internal backend fields

The password must never be displayed.

8. URL CRUD FUNCTIONALITY

The main purpose of the dashboard is URL management.

Existing backend URL APIs:

POST   /api/urls
GET    /api/urls
PUT    /api/urls/{id}
DELETE /api/urls/{id}

All require authentication.

9. CREATE URL

Provide a clear URL creation form.

Example:

┌───────────────────────────────────────┐
│ Enter your long URL                   │
│                                       │
│ https://example.com/some/very/long... │
│                                       │
│             [ Shorten URL ]           │
└───────────────────────────────────────┘

The request body is:

{
  "originalUrl": "https://example.com"
}

On success, display:

Original URL
Short URL
Expiration date
Actions

The backend automatically generates the short code.

Do not attempt to generate short codes in the frontend.

10. URL RESPONSE

The backend now returns:

{
  "id": 1,
  "originalUrl": "https://example.com",
  "shortCode": "Ab12Xy",
  "expiresAt": "2027-07-26T15:20:30"
}

The frontend should use these fields.

Do NOT expect or display:

originalUrlHash
user
password
database internals
11. MAXIMUM URL LIMIT

The backend currently allows a maximum of:

4 URLs per user

The frontend should make this clear.

For example:

Your URLs: 3 / 4

When the user has reached the limit:

4 / 4 URLs used

disable or hide the create button/form appropriately.

However, the backend remains the authority.

Do not rely solely on frontend validation.

If the backend returns:

Maximum 4 URLs allowed

display that error clearly.

12. DUPLICATE URL RULE

The backend prevents the same user from shortening the same original URL more than once.

Therefore the frontend must properly handle the backend error:

You already shortened this URL

Display a friendly message rather than a generic error.

Different users are allowed to shorten the same original URL.

13. URL LIST

The dashboard should contain a section:

My URLs

Display each URL in a polished card/table.

Example:

┌───────────────────────────────────────────────────────┐
│ Original URL                                          │
│ https://example.com/something/very/long              │
│                                                       │
│ Short URL                                             │
│ https://your-domain.com/Ab12Xy                        │
│                                                       │
│ Expires: July 26, 2027                                │
│                                                       │
│ [Copy] [Share] [QR] [Edit] [Delete] [Analytics]      │
└───────────────────────────────────────────────────────┘

Make the layout responsive.

On mobile, actions can become a menu or stacked buttons.

14. COPY SHORT URL

Provide a copy button.

When clicked:

navigator.clipboard.writeText(...)

Copy the complete public short URL.

For example:

https://your-domain.com/Ab12Xy

Show temporary feedback:

Copied!
15. SHARING

Each URL should have a Share button.

Use the Web Share API where available:

navigator.share(...)

Provide fallback behavior for browsers that don't support Web Share API.

Fallback can provide:

Copy URL
WhatsApp share
Email share
Social sharing options if appropriate

Do not expose internal API URLs.

Share the public short URL.

16. QR CODE GENERATION

Each URL should have a:

QR Code

button.

When clicked, generate a QR code representing the public short URL.

For example:

https://your-domain.com/Ab12Xy

NOT:

http://localhost:8080/Ab12Xy

unless running locally.

The QR code should be displayed in a modal/dialog.

Example:

┌─────────────────────────┐
│       QR Code           │
│                         │
│       ████████          │
│       ██    ██          │
│       ████████          │
│          ...            │
│                         │
│ [Download] [Share]      │
└─────────────────────────┘

Use a reliable React-compatible QR library.

17. EDIT URL

Existing API:

PUT /api/urls/{id}

Request:

{
  "originalUrl": "https://new-url.com"
}

The short code remains the same.

Example:

Before:

shortCode = Ab12Xy
originalUrl = https://old.com

After:

shortCode = Ab12Xy
originalUrl = https://new.com

The frontend should provide an edit modal/form.

After successful update:

update the UI
show success feedback
close modal
18. DELETE URL

Existing API:

DELETE /api/urls/{id}

Provide a delete button.

Do NOT immediately delete without confirmation.

Show:

Are you sure you want to delete this URL?

This action cannot be undone.

[Cancel] [Delete]

After successful deletion:

remove URL from UI
show success message
19. EXPIRATION

Every URL expires one year after creation.

The backend returns:

expiresAt

Display:

Expires on:
July 26, 2027

Also provide a useful countdown where appropriate:

Expires in 364 days

or:

Expires in 5 days

For expired URLs:

Expired

Use clear visual treatment.

Do not calculate a new expiration date in the frontend.

The backend is authoritative.

20. PUBLIC REDIRECT

The redirect service handles:

/{shortCode}

Example:

https://your-domain.com/Ab12Xy

The frontend should not replace the redirect backend logic.

The backend redirect flow is:

Request
   ↓
Redirect Service
   ↓
Redis cache
   ↓
if miss → MySQL
   ↓
expiration check
   ↓
302 redirect
21. REDIRECTING EXPERIENCE

Before the final production redirect behavior is wired into the deployed domain, create a polished redirecting experience where appropriate.

For the frontend redirect UI/route, if a redirecting screen is used, show:

Redirecting...

3
2
1

Example:

┌──────────────────────────────┐
│                              │
│       Redirecting...         │
│                              │
│              3               │
│                              │
│   Taking you to your link    │
│                              │
└──────────────────────────────┘

Then:

3 → 2 → 1 → destination

However, do not break the existing backend's direct HTTP 302 redirect mechanism.

The backend redirect endpoint remains the source of truth for actual short-link redirection.

22. ANALYTICS DASHBOARD

Create an analytics section in the dashboard UI.

The analytics functionality will be implemented later.

Therefore:

Build the UI structure now.

Possible dashboard:

Analytics
──────────────────────────────

Total Clicks
     1,248

Unique Visitors
     --

Countries
     --

Clicks Over Time
     [Chart placeholder]

Top URLs
     --

Device / Browser
     --

Do NOT invent analytics backend endpoints.

Do NOT generate fake click data and present it as real data.

For now:

Analytics coming soon

or a clean empty-state design is acceptable.

The architecture should make it easy to connect real analytics APIs later.

23. ANALYTICS PER URL

Each URL can have:

[Analytics]

button.

For now, this can open the analytics page with the selected URL:

/dashboard/analytics/:id

But do not make API requests to nonexistent analytics endpoints.

Prepare the frontend architecture for future implementation.

24. DASHBOARD NAVIGATION

Create a professional dashboard layout.

Example:

┌──────────────────────────────────────────────────────────┐
│ URL SHORTENER                         User ▼              │
├───────────────┬──────────────────────────────────────────┤
│ Dashboard     │                                          │
│ My URLs       │  Dashboard                               │
│ Analytics     │                                          │
│               │                                          │
│               │  Welcome, username                       │
│               │                                          │
│               │  [Create URL]                            │
│               │                                          │
│               │  My URLs                                 │
│               │  ...                                     │
│               │                                          │
│               │                                          │
│ Logout        │                                          │
└───────────────┴──────────────────────────────────────────┘

Mobile should have a responsive navigation/menu.

25. LOGOUT

Provide:

Logout

When clicked:

Remove authentication token.
Clear authentication state.
Clear sensitive frontend state.
Redirect to /login.

After logout, accessing /dashboard should redirect back to /login.

26. LANDING PAGE

Create a professional landing page.

Route:

/

It should contain:

Hero
Shorten links.
Share faster.
Track better.

With a strong CTA:

Get Started

and:

Login
Product explanation

Explain:

Short links
Easy sharing
QR codes
URL management
Analytics
Secure authentication
How it works
1. Create an account
2. Shorten your URL
3. Share your short link
4. Track performance
CTA
Start shortening URLs

The landing page should feel like a real SaaS product rather than a tutorial project.

27. SIGNUP PAGE

Route:

/signup

Fields:

Username
Email
Password
Confirm Password

Frontend validation:

required fields
valid email format
password confirmation
reasonable password validation

Backend remains authoritative.

On successful signup:

/signup
   ↓
/login

Show:

Account created successfully. Please log in.
28. LOGIN PAGE

Route:

/login

Fields:

Email
Password

Include:

Remember me

only if implemented consistently with the chosen authentication-storage approach.

Don't pretend it provides server-side session persistence because our backend is stateless JWT authentication.

Include:

Don't have an account?
Sign up
29. LOGIN/SIGNUP ANIMATIONS

Both login and signup pages should have polished animations.

Possible design:

Left side:
Brand / product illustration

Right side:
Authentication form

Animate:

page entrance
form appearance
buttons
validation messages
transitions between login/signup

Keep animations:

smooth
professional
subtle
fast

Do NOT use excessive animations that hurt usability.

Respect:

prefers-reduced-motion

where appropriate.

30. ERROR HANDLING — VERY IMPORTANT

Every API request must have deliberate error handling.

Do NOT simply do:

catch (error) {
    console.log(error);
}

Handle HTTP statuses properly.

31. HTTP 400

Bad request.

Examples:

invalid URL
invalid input
duplicate URL
validation error

Display a friendly message.

Example:

We couldn't process that request.

Please check your URL and try again.

If backend provides a useful message, display that message safely.

32. HTTP 401

Unauthorized.

Examples:

missing JWT
expired JWT
invalid JWT

Frontend behavior:

clear authentication
redirect to /login

Optionally display:

Your session has expired. Please log in again.
33. HTTP 403

Forbidden.

Display:

You don't have permission to perform this action.

Do not expose backend internals.

34. HTTP 404

Not found.

Create a proper:

404 Not Found

page.

Example:

404

Page not found.

The page you're looking for doesn't exist.

[Go Home]

For invalid short URLs, handle the backend's not-found response appropriately.

35. HTTP 409

If the backend returns a conflict such as duplicate URL, handle it specifically.

Example:

You've already shortened this URL.

Do not display:

Error 409

only.

36. HTTP 429

Rate limited.

This is important because the Gateway already implements rate limiting.

Display:

Too many requests

You're doing that a little too quickly.
Please wait a moment and try again.

If the backend provides retry information, use it where appropriate.

Do not immediately spam retries.

37. HTTP 500

Internal server error.

Display:

Something went wrong on our side.

Please try again later.

Do not expose:

stack traces
SQL errors
Redis errors
Java exceptions
internal hostnames
service names
38. HTTP 502

Bad gateway.

Since the frontend communicates with our API Gateway, handle this explicitly:

The server is temporarily unavailable.

Please try again shortly.
39. HTTP 503

Service unavailable.

Display:

Service temporarily unavailable.

Please try again in a moment.
40. NETWORK ERRORS

Handle cases where:

fetch()

cannot connect at all.

Display:

Unable to connect to the server.

Please check your internet connection and try again.

Do not show a blank page.

41. GLOBAL ERROR PAGE

Create reusable pages/components for:

404
500
503
Generic error

Use React Router's route handling for frontend 404s.

42. LOADING STATES

Every API operation needs a loading state.

Examples:

Signing in...
Creating...
Updating...
Deleting...
Loading URLs...

Buttons should not allow accidental duplicate submissions.

Example:

[ Creating... ]

instead of:

[ Create URL ]

while the request is active.

43. EMPTY STATES

If the user has no URLs:

You haven't created any short links yet.

Create your first short URL to get started.

[Create URL]

Do not leave a blank dashboard.

44. TOAST / NOTIFICATION SYSTEM

Implement a reusable notification mechanism for:

Success
Error
Warning
Info

Examples:

✓ URL created successfully

✓ URL copied

✓ URL updated

✓ URL deleted

✕ Unable to create URL

⚠ Too many requests

Do not create separate duplicated notification logic in every component.

45. COMPONENT ARCHITECTURE

Use reusable components.

Suggested structure:

src/
├── api/
│   └── api.js
│
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   ├── Toast.jsx
│   ├── LoadingSpinner.jsx
│   ├── UrlCard.jsx
│   ├── UrlForm.jsx
│   ├── ConfirmDialog.jsx
│   ├── QRModal.jsx
│   └── ProtectedRoute.jsx
│
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── Analytics.jsx
│   ├── NotFound.jsx
│   ├── ServerError.jsx
│   └── ServiceUnavailable.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── hooks/
│   └── ...
│
├── utils/
│   ├── auth.js
│   ├── url.js
│   └── errors.js
│
├── App.jsx
├── main.jsx
└── index.css

Adjust the structure if necessary, but keep responsibilities separated.

46. ROUTING

Use React Router.

Routes:

/
 /login
 /signup
 /dashboard
 /dashboard/analytics
 /dashboard/analytics/:id
 *

Protected:

/dashboard
/dashboard/analytics

Public:

/
/login
/signup
47. AUTH STATE

Create a centralized authentication state.

For example:

AuthContext

It should handle:

current authentication state
token
login
logout
restoring authentication on refresh
redirecting unauthenticated users

Don't duplicate authentication logic across pages.

48. SECURITY RULES

Never put these in frontend environment variables:

MYSQL_PASSWORD
REDIS_PASSWORD
JWT_SECRET
SHORTCODE_SECRET

The frontend should only have public configuration such as:

VITE_API_URL=...

Remember that VITE_* variables become part of the client-side bundle.

Never assume frontend validation is security.

The backend is authoritative.

49. URL DISPLAY

When constructing a public short URL, use a configurable public frontend/domain value.

For local development it can be something like:

http://localhost:5173/{shortCode}

For production it will eventually become:

https://your-domain.com/{shortCode}

Do not hardcode the production domain throughout the codebase.

Create a configuration/helper for the public short URL.

50. RESPONSIVE DESIGN

The application must work well on:

Desktop
Laptop
Tablet
Mobile

Dashboard cards should adapt.

Tables should not overflow badly.

Navigation should collapse appropriately.

Forms should be usable on small screens.

51. VISUAL DESIGN

The application should look like a polished modern SaaS product.

Design goals:

clean
modern
professional
minimal but visually interesting
strong typography
good spacing
clear hierarchy
subtle animations
responsive
accessible

Avoid making it look like a generic Bootstrap tutorial.

Use a coherent design system.

52. ACCESSIBILITY

Use:

semantic HTML
proper labels
keyboard navigation
visible focus states
accessible buttons
accessible modals
appropriate ARIA where necessary
sufficient contrast

Forms must be usable without a mouse.

53. IMPORTANT BACKEND CONTRACT RULE

Do NOT invent APIs.

Currently available:

POST   /api/users/signup
POST   /api/users/login

POST   /api/urls
GET    /api/urls
PUT    /api/urls/{id}
DELETE /api/urls/{id}

GET    /{shortCode}

Analytics APIs do not exist yet.

Therefore:

DO NOT

invent:

GET /api/analytics
GET /api/urls/{id}/analytics
GET /api/clicks

until the backend actually implements them.

Build the analytics UI so it can be connected later.

54. CURRENT BACKEND BUSINESS RULES

The frontend must respect these:

Maximum 4 URLs per user.

Same user cannot shorten the same original URL twice.

Different users can shorten the same URL.

Users can edit their URLs.

Users can delete their URLs.

Short code is generated by backend.

Short code is exactly 6 characters.

URLs expire one year after creation.

Redis caches URL → original URL.

MySQL is the permanent source of truth.

JWT authentication is required for user URL operations.

Do not reproduce these business rules independently in a way that could conflict with the backend.

Frontend validation is only for UX.

55. DO NOT CHANGE BACKEND ARCHITECTURE

Do NOT:

create another backend
create Node.js APIs
create Firebase authentication
create Supabase authentication
create a second database
call MySQL from React
call Redis from React
call Creation Service directly
call Redirect Service directly
generate JWTs in React
generate short codes in React
invent analytics endpoints
replace the API Gateway
remove Redis

The backend already exists.

The frontend is a client of that backend.

56. DEVELOPMENT ENVIRONMENT

Initially:

React/Vite
localhost:5173

API Gateway
localhost:8080

Creation #1
localhost:8081

Creation #2
localhost:8083

Redirect #1
localhost:8082

Redirect #2
localhost:8084

Redis
localhost:6379

MySQL
localhost:3306

Frontend only calls:

localhost:8080
57. PRODUCTION DEPLOYMENT — FUTURE

The application will eventually be deployed to Oracle Cloud Infrastructure (OCI).

Expected architecture:

                    Internet
                       ↓
                 Cloudflare
                 (optional)
                       ↓
                OCI API Gateway
                       ↓
             Spring Cloud LB
                 /         \
          Creation ×2    Redirect ×2
                 \         /
                    Redis
                      +
                    MySQL

There will be no OCI external load balancer.

The frontend may eventually be hosted separately as static files.

The backend remains on OCI.

Do not make deployment-specific assumptions into the application code.

Use environment variables/configuration.

58. PRODUCTION ENVIRONMENT VARIABLE

Development:

VITE_API_URL=http://localhost:8080

Production will eventually use something like:

VITE_API_URL=https://api.example.com

Do not hardcode this.

59. DEVELOPMENT ORDER

Build in this order:

Phase 1

Set up:

React
Vite
React Router
Global CSS/design system
API service layer
Auth state
Phase 2

Build:

Landing
Signup
Login
Phase 3

Connect:

Signup API
Login API
JWT
Protected routes
Logout
Phase 4

Build dashboard:

Navbar
Sidebar
User information
URL creation
URL list
Phase 5

Connect URL APIs:

POST /api/urls
GET /api/urls
PUT /api/urls/{id}
DELETE /api/urls/{id}
Phase 6

Add:

Copy
Share
QR generation
Expiration
Confirm delete
Loading states
Toast notifications
Phase 7

Build:

Analytics UI

without fake backend data.

Phase 8

Complete:

Error pages
400
401
403
404
409
429
500
502
503
Network errors
Phase 9

Polish:

Responsive design
Animations
Accessibility
Loading states
Empty states
Error states
Phase 10

Production preparation:

Environment variables
npm run build
OCI deployment preparation
60. MOST IMPORTANT RULE

Do not start by creating random components and changing the architecture later.

First establish:

API layer
      ↓
Auth context
      ↓
React Router
      ↓
Pages
      ↓
Reusable components

Then connect the real backend.

Every feature should use the existing API Gateway.

The final frontend should feel like a complete production-style URL-shortening SaaS application, while remaining fully compatible with the existing Spring Boot microservice backend.

Start by creating the Vite React project and establishing the project structure. Then implement the landing page, signup and login pages before moving to the dashboard.