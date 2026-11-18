# CampusX / SaySo Backend Viva Preparation

## Questions and Answers

**Technology stack:** Node.js, Express.js, TypeScript, MySQL, Drizzle
ORM, Redis, Docker, and JWT authentication with a session-based SSO
flow.

This document collects the backend viva topics discussed during
preparation. Answers are kept concise and use CampusX examples where
relevant.

------------------------------------------------------------------------

# 1. Core Backend Concepts

## Q1. What is client-server architecture?

Client-server architecture is a model in which a client sends requests
to a server, and the server processes those requests and returns
responses.

**CampusX example:** The Next.js frontend is the client. The Express
backend receives API requests, performs operations, and returns
responses.

## Q2. How does the frontend communicate with the backend?

The frontend communicates with the backend through HTTP requests to API
endpoints. The request can contain a method, URL, headers, and body. The
backend processes it and returns an HTTP response, often containing
JSON.

## Q3. What is a REST API?

REST (Representational State Transfer) is an architectural style for
designing network APIs. REST APIs commonly use HTTP methods and
resource-oriented URLs.

**Example:** `GET /api/v1/complaints` retrieves complaints.

## Q4. What are the common HTTP methods?

-   **GET:** Retrieve data.
-   **POST:** Create a resource or trigger an operation.
-   **PUT:** Replace a resource.
-   **PATCH:** Partially update a resource.
-   **DELETE:** Delete a resource.

**CampusX examples:** `POST /api/v1/complaints` creates a complaint;
`PATCH /api/v1/complaints/:id/status` updates its status.

## Q5. What are common HTTP status codes?

-   **200 OK:** Request succeeded.
-   **201 Created:** A resource was created successfully.
-   **400 Bad Request:** The request is invalid.
-   **401 Unauthorized:** Authentication is missing or invalid.
-   **403 Forbidden:** The user is authenticated but not allowed to
    perform the action.
-   **404 Not Found:** The requested resource or endpoint was not found.
-   **500 Internal Server Error:** An unexpected server-side error
    occurred.

## Q6. What is the request-response lifecycle?

It is the path a request follows through the backend before a response
is returned.

A simplified CampusX flow is:

`Client → Route → Middleware → Validation → Controller → Service → Database → Response`

The exact middleware and validation order depends on how an endpoint is
configured.

## Q7. What is middleware?

Middleware is a function that runs during the Express request-response
lifecycle. It can inspect or modify the request, perform checks, send a
response, or pass control onward.

**CampusX example:** `requireAuth` verifies the user's authentication
before a protected endpoint proceeds.

## Q8. What is routing?

Routing defines how an application responds to a request based on its
HTTP method and URL.

**Example:**

``` ts
router.post("/complaints", createComplaint);
router.get("/complaints", getComplaints);
```

The POST and GET routes can use the same path but perform different
operations.

## Q9. What is Express Router?

`express.Router()` creates a modular router object. It lets developers
group related routes and mount them in the main Express application.

``` ts
const router = express.Router();
router.get("/complaints", getComplaints);
export default router;
```

## Q10. What is the difference between routes and a router?

-   **Routes** are endpoint definitions, and `routes/` is commonly the
    folder containing route files.
-   A **router** is the Express object created with `express.Router()`
    that groups and manages route definitions.

A route file can create and export a router. The application then mounts
that router.

## Q11. What is the difference between `app.use()` and `router.get()`?

-   `app.use()` mounts middleware or a router at a path.
-   `router.get()` defines a handler for GET requests at a particular
    path.

Example:

``` ts
app.use("/api/v1", complaintRouter);
router.get("/complaints", getComplaints);
```

Together, these define `GET /api/v1/complaints`.

## Q12. What are controllers?

Controllers handle incoming HTTP requests and send HTTP responses. They
commonly read request data, call a service, and return the result.

## Q13. What are services?

Services contain application business logic, such as creating
complaints, assigning complaints to staff, or updating complaint status.

## Q14. Why separate controllers and services?

Separating them keeps HTTP handling separate from business logic. This
makes code easier to maintain, reuse, and test.

## Q15. What is validation?

Validation checks whether incoming data has the required format and
values before the application processes it.

## Q16. What is Zod?

Zod is a TypeScript-friendly schema validation library. In CampusX, it
is used to validate request data, such as complaint fields and
pagination parameters.

## Q17. What is error handling?

Error handling manages failures and returns appropriate responses
instead of allowing unexpected errors to crash the application.

## Q18. What is centralized error middleware?

It is a common Express error-handling middleware that receives errors
passed through the request pipeline and sends a consistent error
response.

## Q19. Why use environment variables?

Environment variables keep configuration outside application source
code. Examples include `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`, and
`GOOGLE_CLIENT_ID`.

A local `.env` file is commonly used during development. Secrets should
not be committed to source control.

## Q20. What is CORS?

CORS stands for Cross-Origin Resource Sharing. It is a browser security
mechanism that controls whether a web page from one origin can access
resources from another origin.

In Express, the `cors` middleware configures the allowed origins,
methods, headers, and credential behavior.

Example:

``` ts
app.use(cors({
  origin: "https://your-frontend.example",
  credentials: true
}));
```

An origin consists of the scheme, host, and port. For example,
`http://localhost:3000` and `http://localhost:8000` are different
origins.

## Q21. What is a CORS preflight request?

For certain cross-origin requests, the browser first sends an `OPTIONS`
request to check whether the server permits the intended method and
headers.

## Q22. Does CORS authenticate users?

No. CORS is not authentication or authorization. It controls
browser-based cross-origin access. Tools such as curl and Postman are
not restricted by browser CORS enforcement.

------------------------------------------------------------------------

# 2. Node.js, Express, and TypeScript

## Q1. What is Node.js?

Node.js is a JavaScript runtime environment that allows JavaScript to
run outside the browser, including on servers.

**CampusX example:** Node.js runs the Express backend that handles API
requests and communicates with MySQL and Redis.

## Q2. What is the V8 engine?

V8 is Google's open-source JavaScript engine, written in C++, that
compiles and executes JavaScript. Node.js uses V8.

## Q3. Is Node.js single-threaded?

JavaScript execution in Node.js normally runs on a main thread. However,
Node.js also uses operating-system facilities and background threads,
including the libuv thread pool for certain operations. Therefore,
saying that all of Node.js is strictly single-threaded is inaccurate.

## Q4. What is the event loop?

The event loop is part of Node.js's asynchronous execution model. It
coordinates callbacks and other scheduled work so Node.js can continue
processing while I/O operations are waiting to complete.

**CampusX example:** While a database operation is pending, the server
can continue handling other work rather than blocking the JavaScript
thread for the entire wait.

## Q5. What is asynchronous programming?

Asynchronous programming allows a program to start an operation and
continue doing other work while waiting for that operation to complete.

It is especially useful for I/O operations such as database queries and
network requests.

## Q6. What is the difference between synchronous and asynchronous code?

-   **Synchronous code:** Executes in sequence; an operation must finish
    before the next statement proceeds.
-   **Asynchronous code:** Allows the program to continue while an
    operation is pending, then handle its result later.

A synchronous blocking operation can prevent the JavaScript thread from
doing other work during that operation.

## Q7. What is a Promise?

A Promise is a JavaScript object representing the eventual completion or
failure of an asynchronous operation.

Its states are: - Pending - Fulfilled - Rejected

## Q8. What is `async/await`?

`async/await` is syntax for working with Promises. - An `async` function
always returns a Promise. - `await` pauses that async function until the
awaited Promise settles. It does not block the entire Node.js server.

Example:

``` ts
async function loadStudents() {
  const result = await db.select().from(students);
  return result;
}
```

## Q9. What is Express.js?

Express.js is a web framework for Node.js. It provides routing,
middleware, and request-response handling to make it easier to build web
servers and APIs.

## Q10. What does `next()` do in Express?

`next()` passes control to the next middleware or handler in the Express
request pipeline. In error-handling middleware, `next(error)` passes an
error to error handlers.

If middleware neither sends a response nor calls `next()`, the request
may remain pending.

## Q11. What are `Request`, `Response`, and `NextFunction`?

These are Express types: - **Request (`req`):** Represents the incoming
HTTP request, including parameters, query values, headers, and body. -
**Response (`res`):** Provides methods to send the HTTP response. -
**NextFunction (`next`):** Represents the function used to pass control
to the next middleware or error handler.

## Q12. Why use TypeScript instead of JavaScript?

TypeScript adds static type checking to JavaScript. It helps catch many
type-related mistakes during development and provides types, interfaces,
and better editor support. TypeScript is compiled to JavaScript for
execution.

## Q13. What is an interface?

An interface describes the expected structure of an object.

``` ts
interface Student {
  id: number;
  name: string;
  email: string;
}
```

## Q14. What is a type alias?

A type alias gives a name to a type. It can represent object types,
unions, primitives, tuples, and more.

``` ts
type UserRole = "student" | "staff" | "admin";
```

## Q15. What is the difference between `interface` and `type`?

Both can describe object shapes. Interfaces are commonly used for object
contracts and can be extended or declaration-merged. Type aliases can
describe a wider range of types, including unions and primitives.

## Q16. What is type inference?

Type inference means TypeScript determines a variable's type from its
value or context.

``` ts
let age = 20; // TypeScript infers number
```

------------------------------------------------------------------------

# 3. MySQL and DBMS

## Q1. What is a DBMS?

A Database Management System is software used to store, organize,
retrieve, and manage data.

## Q2. What is an RDBMS?

A Relational Database Management System stores data in related tables
made up of rows and columns. It supports relationships and constraints.

MySQL is an RDBMS.

## Q3. What is a primary key?

A primary key uniquely identifies each row in a table. It must be unique
and cannot be NULL.

## Q4. What is a foreign key?

A foreign key is a column or set of columns that references a candidate
key, usually the primary key, in another table. It helps maintain
referential integrity.

**CampusX example:** `complaints.student_id` can reference
`students.id`.

## Q5. What is a candidate key?

A candidate key is a minimal set of column(s) that uniquely identifies a
row. One candidate key is selected as the primary key.

## Q6. What is a composite key?

A composite key consists of two or more columns that together identify a
row uniquely.

**CampusX example:** In the `staff_departments` junction table,
`(staff_id, department_id)` can form a composite key.

## Q7. What is a UNIQUE constraint?

A UNIQUE constraint prevents duplicate values in a column or combination
of columns. Unlike a primary key, a table can have multiple UNIQUE
constraints. NULL behavior depends on the database and constraint
definition.

## Q8. What is a NOT NULL constraint?

It prevents a column from storing a NULL value.

Example:

``` sql
email VARCHAR(255) NOT NULL
```

## Q9. What are one-to-one, one-to-many, and many-to-many relationships?

-   **One-to-one (1:1):** One row in table A is associated with at most
    one row in table B.
-   **One-to-many (1:N):** One row in table A can be associated with
    multiple rows in table B.
-   **Many-to-many (M:N):** Multiple rows in A can relate to multiple
    rows in B, usually through a junction table.

**CampusX examples:** - One student can submit many complaints:
student-to-complaints is 1:N. - Staff and departments can have an M:N
relationship through `staff_departments`. - `complaint_tags` connects
complaints and tags in an M:N relationship.

## Q10. What is normalization?

Normalization is the process of structuring relational tables to reduce
unnecessary duplication and improve data integrity.

## Q11. What is First Normal Form (1NF)?

A table is in 1NF when each field contains an atomic value and there are
no repeating groups or multi-valued fields in a single cell.

## Q12. What is Second Normal Form (2NF)?

A table must be in 1NF, and every non-prime attribute must depend on the
whole candidate key, not just part of a composite candidate key. In
other words, it has no partial dependency on a candidate key.

## Q13. What is Third Normal Form (3NF)?

A table must be in 2NF and have no transitive dependency of non-key
attributes on a candidate key. Informally, non-key attributes should
depend on the key, the whole key, and nothing but the key.

## Q14. What is an INNER JOIN?

An INNER JOIN returns rows for which the join condition matches in both
tables.

``` sql
SELECT *
FROM complaints c
INNER JOIN students s ON c.student_id = s.id;
```

## Q15. What is a LEFT JOIN?

A LEFT JOIN returns every row from the left table and matching rows from
the right table. If there is no match, right-table columns are NULL.

## Q16. What is a RIGHT JOIN?

A RIGHT JOIN returns every row from the right table and matching rows
from the left table. If there is no match, left-table columns are NULL.

## Q17. What is GROUP BY?

`GROUP BY` groups rows with the same values, often so aggregate
functions can calculate a result for each group.

``` sql
SELECT status, COUNT(*)
FROM complaints
GROUP BY status;
```

## Q18. What is ORDER BY?

`ORDER BY` sorts query results. `ASC` means ascending and `DESC` means
descending.

## Q19. What is the difference between WHERE and HAVING?

-   `WHERE` filters individual rows before grouping.
-   `HAVING` filters groups after `GROUP BY`, often using aggregate
    results.

``` sql
SELECT status, COUNT(*)
FROM complaints
WHERE priority = 'high'
GROUP BY status
HAVING COUNT(*) > 5;
```

## Q20. What are aggregate functions?

Aggregate functions calculate a value from multiple rows. - `COUNT()`
counts rows or non-NULL values, depending on its argument. - `SUM()`
calculates a total. - `AVG()` calculates an average. - `MAX()` returns
the maximum. - `MIN()` returns the minimum.

## Q21. What is an index?

An index is a data structure that helps the database find rows more
efficiently.

**Advantages:** It can speed up filtering, lookups, sorting, and joins
when appropriate.

**Disadvantages:** It consumes storage and can add overhead to INSERT,
UPDATE, and DELETE operations because indexes must be maintained.

## Q22. What is a database transaction?

A transaction is a group of database operations treated as one logical
unit. The operations are committed together or rolled back when the
transaction fails.

**CampusX example:** Updating a complaint's status and inserting its
status-history record should be handled together in a transaction.

## Q23. What are ACID properties?

-   **Atomicity:** All operations in the transaction succeed, or none
    do.
-   **Consistency:** A transaction takes the database from one valid
    state to another.
-   **Isolation:** Concurrent transactions are controlled so they do not
    produce invalid interference.
-   **Durability:** Committed changes persist, even after a failure
    covered by the database's durability guarantees.

## Q24. What is a stored procedure?

A stored procedure is a named group of SQL statements stored in the
database and executed when called.

**CampusX example:** The project uses a procedure named
`sp_assign_complaint` for complaint assignment.

## Q25. What is a trigger?

A trigger is database logic that runs automatically when a specified
event, such as INSERT, UPDATE, or DELETE, occurs on a table.

**CampusX example:** The project includes a manual SQL trigger script
for complaint status auditing.

## Q26. What is a database view?

A view is a named query that can be queried like a virtual table.

``` sql
CREATE VIEW open_complaints AS
SELECT *
FROM complaints
WHERE status = 'open';
```

A view can simplify repeated queries and expose a selected
representation of data.

## Q27. What is cascading delete?

Cascading delete occurs when a referenced parent row is deleted and the
database automatically deletes related child rows because the foreign
key uses `ON DELETE CASCADE`.

It should be used carefully for records such as complaint history or
audit logs that may need to be retained.

------------------------------------------------------------------------

# 4. Drizzle ORM and Database Migrations

## Q1. What is an ORM?

ORM stands for Object-Relational Mapping. It is a programming technique
or tool that maps relational database structures to programming-language
representations and helps developers query the database through
application code.

## Q2. What is Drizzle ORM?

Drizzle is a TypeScript-first ORM for SQL databases. CampusX uses it to
define schemas and execute typed database queries against MySQL.

## Q3. What is a database schema?

A database schema describes the structure of database objects, such as
tables, columns, data types, and constraints.

Example:

``` ts
export const students = mysqlTable("students", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull()
});
```

## Q4. What are `$inferSelect` and `$inferInsert`?

They derive TypeScript types from a Drizzle table schema: -
`$inferSelect` represents the shape of a selected row. - `$inferInsert`
represents the shape of data accepted for insertion, accounting for
generated or defaulted columns.

``` ts
type Student = typeof students.$inferSelect;
type NewStudent = typeof students.$inferInsert;
```

## Q5. What is a database migration?

A migration is a version-controlled change to the database structure,
such as creating a table or adding a column. Migrations help track and
apply schema changes consistently across environments.

## Q6. What is Drizzle Kit?

Drizzle Kit is the command-line tool used with Drizzle to generate and
apply migrations and inspect or synchronize schemas.

## Q7. What do `generate`, `migrate`, `push`, and `studio` do?

-   **Generate:** Creates migration files based on schema changes.
-   **Migrate:** Applies generated migration files to the database.
-   **Push:** Synchronizes the schema directly with the database without
    the usual generated migration-file workflow.
-   **Studio:** Opens Drizzle Studio, a visual interface for inspecting
    database data and structure.

## Q8. What is the difference between `generate` and `migrate`?

`generate` creates migration files. `migrate` executes those migration
files against the database.

## Q9. What is the difference between migrations and push?

Migrations provide a reviewable, version-controlled history of database
changes. Push directly synchronizes the schema and is useful in
development, but migrations are generally preferable for controlled
production deployments.

## Q10. What is a database connection pool?

A connection pool maintains reusable database connections. The
application can borrow and return connections instead of opening a new
connection for every query. This reduces connection setup overhead and
helps manage concurrent requests.

## Q11. What are CRUD operations?

CRUD means: - **Create:** Insert data. - **Read:** Retrieve data. -
**Update:** Modify data. - **Delete:** Remove data.

------------------------------------------------------------------------

# 5. Redis and Caching

## Q1. What is Redis?

Redis is an in-memory data store commonly used for caching, session
storage, queues, and other fast data-access use cases.

## Q2. What is caching?

Caching means temporarily storing frequently accessed data so later
requests can retrieve it more quickly without repeating the original
expensive operation.

**CampusX example:** Complaint-list results can be cached in Redis to
reduce repeated MySQL queries.

## Q3. Why use Redis with MySQL?

MySQL is the primary relational database for persistent application
data. Redis provides a fast in-memory layer for cached or short-lived
data. Redis reduces repeated database work, but it does not replace
MySQL's relational data storage and querying.

## Q4. What is TTL?

TTL stands for Time To Live. It specifies how long a cached key remains
available before it expires.

Example:

``` ts
await redis.set("complaints", JSON.stringify(data), "EX", 60);
```

The key expires after 60 seconds.

## Q5. What is cache invalidation?

Cache invalidation means removing or updating cached data when the
underlying database data changes. This helps prevent stale data from
being served.

## Q6. What is cache-aside?

In the cache-aside strategy: 1. The application checks the cache. 2. If
data is found (cache hit), it returns the cached value. 3. If data is
missing (cache miss), it fetches data from the database. 4. It stores
the result in the cache, usually with a TTL. 5. It returns the result to
the client.

## Q7. What is a cache hit?

A cache hit occurs when the requested data is found in the cache.

## Q8. What is a cache miss?

A cache miss occurs when the requested data is not found in the cache,
so the application must fetch it from the original data source.

## Q9. How does CampusX use Redis caching?

The complaint-list service uses a cache wrapper with a key, a
database-fetching callback, and a TTL of 60 seconds. The cache key
accounts for query filters and pagination so different query results can
be cached separately.

A simplified example:

``` ts
cache.wrap(
  key,
  () => _listComplaintsFromDB(query),
  60
);
```

## Q10. What are the advantages and disadvantages of caching?

**Advantages:** Faster reads, fewer repeated database queries, and
reduced database load.

**Disadvantages:** Cached data can become stale, cache invalidation adds
complexity, and Redis uses memory that must be managed.

------------------------------------------------------------------------

# 6. Authentication and Authorization

## Q1. What is authentication?

Authentication verifies the identity of a user.

**CampusX example:** A student logs in, and the backend verifies the
supplied credentials.

## Q2. What is authorization?

Authorization determines what an authenticated user is permitted to
access or do.

**CampusX example:** A student, staff member, and admin have different
permissions.

## Q3. What is the difference between authentication and authorization?

-   Authentication answers: **Who are you?**
-   Authorization answers: **What are you allowed to do?**

Authentication verifies identity; authorization checks permissions.

## Q4. What is JWT?

JWT stands for JSON Web Token. It is a compact token format used to
transmit claims. A JWT is commonly signed so the receiver can verify its
integrity and origin.

A signed JWT is not encrypted by default. Its payload can generally be
decoded, so secrets and passwords must not be placed in it.

## Q5. What are the three parts of a JWT?

A JWT commonly has three dot-separated parts: 1. **Header:** Metadata
such as token type and signing algorithm. 2. **Payload:** Claims, such
as a user ID or role. 3. **Signature:** Allows the receiver to verify
the token's integrity.

## Q6. What is bcrypt?

Bcrypt is a password-hashing algorithm. It is used to store password
hashes instead of plaintext passwords.

Example:

``` ts
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

The cost factor controls the computational work used for hashing.

## Q7. What is Bearer token authentication?

A Bearer token is an access token sent in the HTTP Authorization header.

``` http
Authorization: Bearer <token>
```

The server validates the token before allowing access to protected
resources.

## Q8. What is RBAC?

RBAC stands for Role-Based Access Control. Permissions are assigned
based on a user's role.

**CampusX examples:** Student, staff, and admin roles have different
access permissions. Middleware such as `requireRole` can enforce role
restrictions.

## Q9. What is OAuth 2.0?

OAuth 2.0 is an authorization framework that allows an application to
obtain limited access to resources through an authorization server.

For login and identity, OpenID Connect (OIDC) adds an identity layer on
top of OAuth 2.0. A Google ID token is an identity token whose signature
and claims should be verified.

## Q10. What are cookies?

Cookies are small pieces of data stored by the browser and sent with
requests when their domain, path, and other rules match.

Important cookie attributes: - **HttpOnly:** Prevents JavaScript from
reading the cookie. - **Secure:** Restricts sending the cookie to secure
connections such as HTTPS. - **SameSite:** Controls when cookies are
sent with cross-site requests. - **Max-Age / Expires:** Controls cookie
lifetime.

## Q11. What is a session?

A session represents server-maintained state associated with a user or
browser. A browser commonly stores a session identifier in a cookie and
sends it with later requests. The server uses that identifier to find
the session.

## Q12. What is the difference between JWT-based and session-based authentication?

-   **JWT-based:** The client sends a signed token, and the server
    validates it.
-   **Session-based:** The client commonly sends a session ID, and the
    server looks up the corresponding session state.

Both approaches can use cookies. The use of a cookie alone does not
determine whether authentication is JWT-based or session-based.

## Q13. What is SSO?

SSO stands for Single Sign-On. It allows a user to authenticate once and
access multiple related applications without separately logging in to
each one, subject to the identity system and application configuration.

## Q14. Is CampusX JWT-based or session-based?

CampusX uses a hybrid approach: - The main API authentication flow is
primarily JWT-based. The client sends a JWT in the Authorization Bearer
header, and authentication middleware verifies it. - The landing-page
SSO handoff establishes a session using an HTTP-only cookie after a
one-time handoff-code exchange.

Therefore, the most accurate short answer is: **CampusX primarily uses
JWT authentication for its main API, with a session-cookie flow for
landing-page SSO.**

## Q15. Explain the main CampusX JWT authentication flow.

1.  The user submits login credentials.
2.  The backend verifies the credentials.
3.  The backend generates a JWT.
4.  The client sends the token in the Authorization Bearer header for
    protected API requests.
5.  Authentication middleware verifies the token.
6.  Role middleware checks whether the user is permitted to perform the
    requested operation.

## Q16. Explain the CampusX landing-page SSO handoff.

1.  The user authenticates with the backend.
2.  The backend creates a short-lived, one-time handoff code.
3.  The code is stored temporarily in Redis.
4.  The landing page exchanges the code with the backend.
5.  The backend establishes a session using an HTTP-only cookie.

------------------------------------------------------------------------

# 7. Quick Project Architecture Questions

## Q1. Why are backend folders separated?

Separation of concerns keeps related responsibilities organized: -
`routes/`: Defines API endpoints. - `middlewares/`: Performs common
request processing and checks. - `controllers/`: Handles HTTP requests
and responses. - `services/`: Contains business logic. - `db/`: Contains
database-related code and schemas. - `validators/`: Validates incoming
data. - `dto/`: Defines data-transfer structures. - `types/`: Contains
TypeScript types. - `utils/`: Contains reusable helper functions. -
`config/`: Contains application configuration.

## Q2. What is the difference between DTOs and TypeScript types?

A DTO (Data Transfer Object) describes the shape of data being
transferred between parts of an application or across an API boundary.
TypeScript types are a broader language feature used to describe many
kinds of data. A DTO itself can be represented using a TypeScript type
or interface.

## Q3. What is the difference between validators and TypeScript types?

TypeScript types are primarily checked at compile time. Validators such
as Zod check actual runtime data received from a client.

## Q4. Why should business logic not all be written in controllers?

Putting all business logic in controllers makes them large and harder to
maintain and test. Services separate application logic from HTTP
handling.

## Q5. Why does CampusX use both MySQL and Redis?

MySQL is the primary relational database for persistent application
data. Redis is used as a fast caching layer for frequently accessed
results and for short-lived data such as the SSO handoff code.

------------------------------------------------------------------------

# 8. Short Revision Sheet

  Concept         One-line answer
  --------------- ---------------------------------------------------------
  Node.js         JavaScript runtime outside the browser.
  V8              JavaScript engine used by Node.js.
  Event loop      Coordinates asynchronous work and callbacks.
  Express         Node.js web framework.
  Middleware      Function in the request-response pipeline.
  `next()`        Passes control to the next middleware or error handler.
  TypeScript      JavaScript with static typing.
  REST API        Resource-oriented API style commonly using HTTP.
  CORS            Browser mechanism controlling cross-origin access.
  DBMS            Software for managing databases.
  RDBMS           Database system based on related tables.
  Primary key     Uniquely identifies a row.
  Foreign key     References a key in another table.
  Normalization   Organizes tables to reduce redundancy and anomalies.
  JOIN            Combines related rows from tables.
  Index           Data structure that can speed up data retrieval.
  Transaction     Group of database operations treated as one unit.
  ACID            Atomicity, Consistency, Isolation, Durability.
  ORM             Maps relational data to application representations.
  Drizzle ORM     TypeScript-first SQL ORM used by CampusX.
  Migration       Version-controlled database structure change.
  Redis           In-memory data store.
  Cache           Temporary storage for faster retrieval.
  TTL             Time To Live.
  JWT             Signed token format for transmitting claims.
  bcrypt          Password-hashing algorithm.
  RBAC            Role-Based Access Control.
  OAuth 2.0       Authorization framework.
  SSO             Single Sign-On.
  Session         Server-maintained state associated with a client.

------------------------------------------------------------------------

# 9. Important Viva Advice

When answering a project-specific question: 1. Give the definition
first. 2. Explain why the concept is used. 3. Give one example from
CampusX. 4. If asked about implementation details, describe only what is
actually implemented in the code.

For example:

**Question: Why does CampusX use Redis?**

**Answer:** "Redis is an in-memory data store. We use it as a caching
layer for frequently accessed complaint-list results so that repeated
requests do not always need to query MySQL. We also use Redis to
temporarily store the one-time SSO handoff code."
