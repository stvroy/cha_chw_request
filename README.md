# Community Health Commodity Request System

A simple web application that allows Community Health Workers (CHWs) to request medical commodities from their supervising Community Health Assistants (CHAs) for approval and fulfillment. This system helps manage commodity requests with approval workflows, request limits, and a dashboard overview.

---

## Features

- **CHW Commodity Request Form**  
  Allows CHWs to submit requests for medical commodities linked to their supervising CHA. The form dynamically loads the list of available commodities from the database.

- **Auto-assignment of CHA**  
  When a CHW registers, they select their Community Health Unit (CHU), which is linked to a specific CHA. The CHW is automatically assigned to that CHA for request approval.

- **CHA Preloaded in Database**  
  CHAs are pre-registered with hashed passwords. CHWs cannot self-register as CHA; they are linked during registration via CHU selection.

- **Validation Rules**  
  - Quantities must be whole numbers, max 100 units per request.  
  - Maximum 200 units per commodity per month per CHW.  
  - Only one submission allowed per CHW per commodity per day.

- **Request Approval**  
  CHAs can approve or reject commodity requests via a dedicated interface.

- **Dashboard**  
  Displays summaries and logs of requests for both CHWs and CHAs.

---

## User Roles and Access

| Role | Access / Capabilities                                   |
|-------|-------------------------------------------------------|
| **Guest (not logged in)** | Can view the CHW request form but cannot submit requests. Must register first. |
| **CHW (registered)** | Can log in, submit commodity requests, and view own request history. |
| **CHA (pre-registered)** | Can log in, view requests from assigned CHWs, and approve or reject them. |

---

## Setup Instructions

### Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- Git installed on your machine

### Getting Started

1. **Clone the repository**

   ```bash
    git clone https://github.com/stvroy/cha_chw_request.git

    cd cha_chw_request

2. **Create environment variables**

   ```bash
   cp .env-copy .env

3. **Start the application with Docker Compose**
   ```bash
    docker-compose up --build

**Access the app**

- Frontend: http://localhost:3000

- Backend API: http://localhost:5050/api


---

```markdown
## Usage Flow

### For CHWs

- Visit the request form page.
- If you are not registered, register by providing your details and selecting your CHU.
- Upon registration, you are automatically linked to the corresponding CHA.
- Log in and submit commodity requests.
- You can only request once per commodity per day, with quantity limits enforced.
- View your request history and status updates.

### For CHAs

- Log in with preloaded credentials (email and password).
- View commodity requests submitted by CHWs assigned to you.
- Approve or reject requests via the dashboard.
- Monitor overall requests through the dashboard view.

## Database Structure Overview

- **CHU (Community Health Unit):** Health units that CHWs belong to.
- **CHA (Community Health Assistant):** Supervisors linked to CHUs. Pre-registered in DB.
- **CHW (Community Health Worker):** Register via frontend; linked to a CHU and thus to a CHA.
- **Commodities:** Dynamically configurable list of items that can be requested.
- **Requests:** Records of CHW commodity requests awaiting CHA approval.

## Validation Logic

- Quantity per request: max 100 units.
- Max 200 units per commodity per CHW per month.
- One request per CHW per commodity per day.
- Enforced both frontend and backend.

## Troubleshooting

- **Signup fails:** Ensure `.env` variables are correct and database is running.
- **Login issues:** Passwords are hashed; if resetting passwords, use the provided reset script.
- **Requests not showing:** Verify your CHW account is linked to a CHA and commodities exist in the DB.
