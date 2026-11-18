# CampusFix API

REST API for **CampusFix**, a campus problem-reporting and resolution
platform. Students submit complaints, staff work on assigned issues, and
managers review operational analytics.

## Table of Contents

-   [Overview](#overview)
-   [Requirements](#requirements)
-   [Run Locally](#run-locally)
-   [Base URL](#base-url)
-   [Response Format](#response-format)
-   [Complaint Statuses and
    Priorities](#complaint-statuses-and-priorities)
-   [Endpoints](#endpoints)
    -   [Complaints](#complaints)
    -   [Categories](#categories)
    -   [Tags](#tags)
    -   [Reports and Analytics](#reports-and-analytics)
-   [Example Workflows](#example-workflows)
-   [Error Handling](#error-handling)
-   [API Documentation](#api-documentation)
-   [Notes](#notes)

## Overview

The API supports

-   Creating, listing, and viewing complaints
-   Filtering and paginating complaint lists
-   Updating complaint status
-   Adding comments to complaints
-   Attaching and detaching tags
-   Assigning complaints to staff through a MySQL stored procedure
-   Listing complaint categories and tags
-   Viewing system and department reports
-   Finding unassigned staff, silent students, and high-volume
    categories

## Requirements

-   Node.js and npm
-   MySQL
-   Redis, if enabled by the backend configuration
-   The CampusFix API server configured with the required environment
    variables

## Run Locally

Install dependencies and start the API using the scripts configured in
your repository:

``` bash
npm install
npm run dev
```

The examples in this README assume the API is running at
`http://localhost:8000`.

## Base URL

``` text
http://localhost:8000
```

All application routes below use the `/api/v1` prefix.

## Response Format

The API commonly wraps results in a JSON object with a `success`
property and response data. Exact response properties can vary by
endpoint.

Example error response:

``` json
{
  "success": false,
  "message": "Something went wrong"
}
```

## Complaint Statuses and Priorities

### Status values

-   `open`
-   `assigned`
-   `in_progress`
-   `resolved`
-   `rejected`
-   `closed`

### Priority values

-   `low`
-   `medium`
-   `high`
-   `urgent`

## Endpoints

### Complaints

#### 1. List complaints

`GET /api/v1/complaints`

Returns a paginated list of complaints. The list can be filtered using
query parameters.

  Query parameter   Type      Description
  ----------------- --------- ------------------------------------
  `page`            integer   Page number; defaults to `1`
  `limit`           integer   Results per page; defaults to `20`
  `status`          string    Filter by complaint status
  `priority`        string    Filter by priority
  `search`          string    Search complaints

Example:

``` bash
curl -i "http://localhost:8000/api/v1/complaints?page=1&limit=20&status=open&priority=high"
```

A successful response is documented as a paginated object containing
`success`, `data`, and `pagination` (`page`, `limit`, `total`,
`totalPages`).

#### 2. Create a complaint

`POST /api/v1/complaints`

Creates a new complaint.

Content-Type: `application/json`

Request body:

``` json
{
  "title": "Wi-Fi not working in Lab 204",
  "description": "There is no internet connection in the lab.",
  "studentId": 1,
  "categorySlug": "wi-fi-issue",
  "location": "Lab 204",
  "building": "Academic Block A",
  "priority": "medium"
}
```

Required fields: `title`, `description`, `studentId`, `categorySlug`,
and `location`.

`building` is optional. `priority` accepts `low`, `medium`, `high`, or
`urgent` and defaults to `medium`.

Example:

``` bash
curl -i -X POST "http://localhost:8000/api/v1/complaints" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wi-Fi not working in Lab 204",
    "description": "There is no internet connection in the lab.",
    "studentId": 1,
    "categorySlug": "wi-fi-issue",
    "location": "Lab 204",
    "building": "Academic Block A",
    "priority": "medium"
  }'
```

Expected documented success status: `201 Created`.

#### 3. Get complaint details

`GET /api/v1/complaints/{id}`

Returns a complaint by ID, including its comments, status history, and
tags.

Example:

``` bash
curl -i "http://localhost:8000/api/v1/complaints/4"
```

Possible documented response statuses: `200 OK`, `404 Not Found`.

#### 4. Update complaint status

`PATCH /api/v1/complaints/{id}/status`

Updates a complaint's status. The backend enforces allowed status
transitions.

Request body:

``` json
{
  "newStatus": "in_progress",
  "changedByStaffId": 5,
  "note": "Started investigating the Wi-Fi issue."
}
```

Supported properties:

  Property             Type               Description
  -------------------- ------------------ ----------------------------------------
  `newStatus`          string, required   New complaint status
  `changedByStaffId`   integer            Staff member making the change
  `note`               string             Status-history note
  `resolutionNote`     string             Explanation of the resolution
  `assignedStaffId`    integer            Staff member assigned to the complaint

Example:

``` bash
curl -i -X PATCH "http://localhost:8000/api/v1/complaints/4/status" \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "in_progress",
    "changedByStaffId": 5,
    "note": "Started investigating the Wi-Fi issue."
  }'
```

The OpenAPI definition documents `200 OK` for success and
`400 Bad Request` for invalid status transitions.

#### 5. Add a comment

`POST /api/v1/complaints/{id}/comments`

Adds a comment to a complaint.

Request body:

``` json
{
  "commenterType": "staff",
  "staffId": 5,
  "body": "I am checking the router connection."
}
```

Required fields: `commenterType` and `body`.

`commenterType` accepts `student` or `staff`. Supply `studentId` for a
student comment or `staffId` for a staff comment, as appropriate for the
implementation.

Example:

``` bash
curl -i -X POST "http://localhost:8000/api/v1/complaints/4/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "commenterType": "staff",
    "staffId": 5,
    "body": "I am checking the router connection."
  }'
```

Expected documented success status: `201 Created`.

#### 6. Attach a tag

`POST /api/v1/complaints/{id}/tags`

Attaches an existing tag to a complaint using its slug.

Request body:

``` json
{
  "tagSlug": "safety"
}
```

Example:

``` bash
curl -i -X POST "http://localhost:8000/api/v1/complaints/4/tags" \
  -H "Content-Type: application/json" \
  -d '{"tagSlug":"safety"}'
```

Expected documented success status: `201 Created`.

#### 7. Detach a tag

`DELETE /api/v1/complaints/{id}/tags/{tagSlug}`

Removes a tag association from a complaint. This removes the
association, not necessarily the tag definition itself.

Example:

``` bash
curl -i -X DELETE "http://localhost:8000/api/v1/complaints/4/tags/safety"
```

Expected documented success status: `200 OK`.

#### 8. Assign a complaint to staff

`POST /api/v1/complaints/{id}/assign`

Assigns a complaint to a staff member using the backend stored procedure
`sp_assign_complaint`.

Request body:

``` json
{
  "staffEmail": "rakesh.kumar@campusfix.edu",
  "adminEmail": "lakshmi.pillai@campusfix.edu"
}
```

Example:

``` bash
curl -i -X POST "http://localhost:8000/api/v1/complaints/4/assign" \
  -H "Content-Type: application/json" \
  -d '{
    "staffEmail": "rakesh.kumar@campusfix.edu",
    "adminEmail": "lakshmi.pillai@campusfix.edu"
  }'
```

Expected documented success status: `200 OK`.

> Security note: the backend should verify the authenticated user's
> admin permissions. In production, do not trust an `adminEmail`
> supplied by the client as proof of identity.

### Categories

#### 9. List active categories

`GET /api/v1/categories`

Returns active complaint categories. The documented response includes
category IDs, slugs, names, and optional default department IDs.

Example:

``` bash
curl -i "http://localhost:8000/api/v1/categories"
```

Example response shape:

``` json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "wi-fi-issue",
      "name": "Wi-Fi Issue",
      "defaultDepartmentId": 2
    }
  ]
}
```

### Tags

#### 10. List tags

`GET /api/v1/tags`

Returns the available complaint tags.

Example:

``` bash
curl -i "http://localhost:8000/api/v1/tags"
```

### Reports and Analytics

These endpoints provide aggregate statistics and analytical lists.

#### 11. System-wide statistics

`GET /api/v1/reports/system`

Returns aggregate system statistics, including total complaints, open
complaints, resolved complaints, and average resolution time.

``` bash
curl -i "http://localhost:8000/api/v1/reports/system"
```

#### 12. Department workload

`GET /api/v1/reports/departments`

Returns complaint workload grouped by department, using the
`v_department_workload` SQL view according to the API specification.

``` bash
curl -i "http://localhost:8000/api/v1/reports/departments"
```

#### 13. Staff who have never been assigned a complaint

`GET /api/v1/reports/analytics/unassigned-staff`

Returns staff members who have never been assigned a complaint.

``` bash
curl -i "http://localhost:8000/api/v1/reports/analytics/unassigned-staff"
```

#### 14. Silent students

`GET /api/v1/reports/analytics/silent-students`

Returns students who have submitted at least one complaint but have
never commented on a complaint, according to the documented query
definition.

``` bash
curl -i "http://localhost:8000/api/v1/reports/analytics/silent-students"
```

#### 15. High-volume categories

`GET /api/v1/reports/analytics/high-volume-categories`

Returns categories with more than two complaints.

``` bash
curl -i "http://localhost:8000/api/v1/reports/analytics/high-volume-categories"
```

## Example Workflows

### Complaint lifecycle

1.  A student submits a complaint with `POST /api/v1/complaints`.
2.  An admin reviews it using `GET /api/v1/complaints` and
    `GET /api/v1/complaints/{id}`.
3.  The admin assigns a staff member using
    `POST /api/v1/complaints/{id}/assign`.
4.  Staff updates progress using `PATCH /api/v1/complaints/{id}/status`.
5.  Staff and students can add updates using
    `POST /api/v1/complaints/{id}/comments`.
6.  The complaint can be tagged using
    `POST /api/v1/complaints/{id}/tags`.
7.  The student or admin can review the latest state and history using
    `GET /api/v1/complaints/{id}`.

The exact permissions and allowed status transitions depend on the
backend authorization and state-transition logic.

### Admin reporting

1.  Fetch system-wide totals from `/api/v1/reports/system`.
2.  Review department workload at `/api/v1/reports/departments`.
3.  Inspect analytical lists using the `/api/v1/reports/analytics/...`
    endpoints.

## Error Handling

The API may return errors for invalid input, missing resources, or
invalid status transitions. A typical error body is:

``` json
{
  "success": false,
  "message": "Complaint not found"
}
```

Use the HTTP status code and `message` field to understand the failure.
Exact error messages depend on the backend implementation.

## API Documentation

If Swagger UI is configured in the server, open:

``` text
http://localhost:8000/api-docs
```

This URL is optional and only works if the Swagger UI route is mounted
in the Express application.

The API specification supplied for this README declares OpenAPI `3.0.0`.
Keep the OpenAPI document and this README synchronized when routes,
parameters, or response schemas change.

## Notes

-   The examples use local development URLs and example IDs/emails.
    Replace them with valid records in your database.
-   The documented API specification does not define a health-check
    path, even though it declares a `Health` tag. If your server exposes
    `GET /health`, document that endpoint separately.
-   Authentication is not described as a requirement on the individual
    endpoint definitions in the supplied specification. Protect
    private/admin operations with backend authentication and
    authorization before deployment.
-   Confirm request field names and response shapes against the current
    controllers and validators when the implementation changes.
