# System Design & Architecture

This document details the architectural decisions and system design patterns utilized in the Society Maintenance Tracker application, specifically focusing on the complaint history model, overdue detection logic, photo handling, and the notification flow.

---

## 1. Complaint History Model
A core requirement of the system is to track the lifecycle of a complaint from its inception to resolution, ensuring a transparent audit trail. Instead of simply overwriting a single `status` string on the document, the database utilizes a **Hybrid Document Pattern**.

The `Complaint` schema contains both a top-level `status` field (for rapid querying and indexing) and an embedded `statusHistory` subdocument array.
Whenever an admin updates a complaint's status:
1. The top-level `status` is updated.
2. A new object containing the `status`, an optional `note`, a `timestamp`, and the `actor` (the ObjectId of the admin who made the change) is pushed onto the `statusHistory` array.

**Why this approach?**
By embedding the history directly within the Complaint document, we avoid the need for costly `$lookup` operations or maintaining a separate `AuditLog` collection. Given that the number of state transitions for a single complaint is relatively small (typically under 10), the embedded array will never breach MongoDB's 16MB document limit, ensuring lightning-fast reads when viewing Complaint Details.

## 2. Overdue Detection
Administrators need to immediately identify complaints that have remained unresolved beyond a configurable threshold (e.g., 5 days).

Rather than running a cron job that periodically updates an `isOverdue` boolean in the database (which creates unnecessary write overhead and state synchronization issues), overdue detection is calculated **dynamically on the fly**.

**Implementation:**
- **In the API (Stats):** The `/api/admin/dashboard/stats` endpoint utilizes MongoDB's highly optimized Aggregation Pipeline. It dynamically calculates the age of the complaint using `$subtract: [new Date(), '$createdAt']` and compares it against the `OVERDUE_DAYS` environment variable. If the difference is greater than the threshold and the status is not `RESOLVED`, it increments the overdue KPI.
- **In the API (Lists):** When fetching the array of complaints, a Mongoose Virtual Field (`isOverdue`) is utilized. This virtual evaluates the timestamp difference in application memory when the JSON payload is serialized.
- **In the Frontend:** The React dashboard sorts the incoming payload, intentionally hoisting objects where `isOverdue === true` to the very top of the DOM list, ensuring they command immediate admin attention.

## 3. Photo Handling (Cloudinary Integration)
Residents can attach contextual images to their maintenance requests. Handling multipart form data and raw binary files presents a unique challenge, especially in stateless environments like Render where local disk storage is ephemeral.

**Implementation Flow:**
1. **Frontend:** React hooks intercept the file input and append it to a `FormData` payload, ensuring the browser automatically sets the correct `multipart/form-data` boundary headers.
2. **Middleware:** Express utilizes `multer` with a memory storage engine (`multer.memoryStorage()`). This is critical: the file is never saved to the server's local disk. It is held entirely in RAM as a Buffer.
3. **Cloud Transport:** A custom helper function wraps Cloudinary's `upload_stream` API in a Promise. The RAM Buffer is streamed directly to Cloudinary's servers.
4. **Database:** Once Cloudinary returns a successful response containing a persistent CDN URL (`secure_url`), only this lightweight string URL is saved to the MongoDB `Complaint` document.

This architecture ensures the Node.js server remains stateless and avoids local disk I/O bottlenecks.

## 4. Notification Flow
To keep residents informed, the system dispatches automated emails whenever significant events occur (e.g., a status transition or the posting of an important notice).

**Implementation:**
The system uses the `nodemailer` package configured with SMTP credentials. 

To ensure the user experience remains snappy, the notification flow is **decoupled from the main request-response cycle**. 
For example, when an admin updates a complaint's status:
1. The Express controller updates the database.
2. The controller invokes `sendComplaintStatusEmail()`.
3. *Crucially*, the controller does not `await` the result of the email dispatch. It immediately returns a `200 OK` response to the frontend.
4. The email dispatch executes asynchronously in the background via Node's event loop. 

This non-blocking architecture ensures that the admin interface feels instantly responsive, even if the upstream SMTP server experiences high latency or momentary delays.
