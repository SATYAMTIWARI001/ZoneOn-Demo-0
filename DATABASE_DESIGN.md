# ZoneOn AI Database Schema Design

This document describes the structured schema representation for ZoneOn AI.

---

## 🗄️ Relational Database Concept (PostgreSQL)

While the default application runs a stateful in-memory cache to maintain rapid simulation workflows, the data structures map perfectly onto standard PostgreSQL tables:

### 1. `incidents` Table
| Column Name | Type | Key | Description |
| ----------- | ---- | --- | ----------- |
| `id` | VARCHAR(64) | Primary | Unique incident UUID. |
| `title` | VARCHAR(255) | | Drafted title of the situation. |
| `description` | TEXT | | Raw text report entered by staff. |
| `category` | VARCHAR(32) | | Medical, Security, Crowd, Facilities, Transit. |
| `severity` | VARCHAR(16) | | Low, Medium, High, Critical. |
| `status` | VARCHAR(16) | | Active, Resolved. |
| `sector_id` | VARCHAR(16) | | Corresponding stadium zone key. |
| `checklist` | JSONB | | Recommended action steps. |
| `created_at` | TIMESTAMP | | Record initialization mark. |

### 2. `announcements` Table
| Column Name | Type | Key | Description |
| ----------- | ---- | --- | ----------- |
| `id` | VARCHAR(64) | Primary | Unique announcement UUID. |
| `title` | VARCHAR(255) | | Subject of the notification. |
| `text` | TEXT | | Main body announcement message. |
| `target` | VARCHAR(32) | | Staff, Fans, Volunteers, All. |
| `type` | VARCHAR(16) | | Alert, Information, Safe-Route. |
| `created_at` | TIMESTAMP | | Record initialization mark. |

### 3. `transit_lines` Table
| Column Name | Type | Key | Description |
| ----------- | ---- | --- | ----------- |
| `name` | VARCHAR(64) | Primary | Name of the transit line (e.g., PATH Shuttle). |
| `delay_minutes` | INT | | Logged route delays in minutes. |
| `duration_minutes` | INT | | Transit route travel duration. |
| `status` | VARCHAR(16) | | Normal, Delayed, Suspended. |

---

## 🔗 Entity Relationship (ER) Diagram

```
    +-----------------+              +--------------------+
    |    INCIDENTS    |              |   ANNOUNCEMENTS    |
    +-----------------+              +--------------------+
    | id (PK)         |              | id (PK)            |
    | title           |              | title              |
    | description     |              | text               |
    | category        |              | target             |
    | severity        |              | type               |
    | status          |              | created_at         |
    | sector_id       |              +--------------------+
    | checklist       |
    | created_at      |
    +-----------------+
```
