---
title: "Data Model — CIS"
version: "1.0"
date: "2026-06-25"
db: "PostgreSQL (Prisma ORM)"
conventions: "PK=cuid; snake_case columns via @map; audit cols created_at/updated_at; soft-delete where noted; see D-004"
---

# Data Model: CIS

## Entity Inventory

| Entity | Purpose | Key relationships |
|--------|---------|-------------------|
| User | ABC (Azure AD) + Surveyor (local) users | → Role, → SurveyCompany (surveyor) |
| Role | RBAC role per system | → MenuPermission |
| MenuPermission | role → menu access (view/full) | Role 1:N |
| InspectionJob | งานตรวจสภาพ 1 คัน (workflow 8 สถานะ) | → Customer, Vehicle, Source, Agent, BusinessDivision, FleetGroup, owner(User) |
| FleetGroup | กลุ่ม Fleet (≤10 jobs) | 1:N InspectionJob |
| Customer | ลูกค้า (บุคคล/นิติบุคคล) | 1:1 InspectionJob |
| Vehicle | รถ (1:1 กับ job) | → VehicleBrand, VehicleModel |
| SurveyCompany | บริษัท Surveyor (master) | 1:N User, SurveyAssignment |
| SurveyAssignment | งานที่ส่งให้ Surveyor (E-Motor work item) | 1:1 InspectionJob, → SurveyCompany |
| InspectionImage | รูปตรวจสภาพ (upload/revise/compare/ingest) | → InspectionJob |
| InspectionResult | ผลตรวจสภาพ | 1:1 InspectionJob |
| Billing | ตั้งเบิกต่อ job (master/adjusted/other price, status) | 1:1 InspectionJob, → SurveyCompany |
| JobHistory | audit trail (who/when/action) | N:1 InspectionJob |
| JobMessage | ข้อความใน job (ABC↔Surveyor) | N:1 InspectionJob |
| Agent | ตัวแทน + email (multi) | → Source |
| Source | ช่องทาง/แหล่งงาน | 1:N Agent, InspectionJob |
| BusinessDivision | ฝ่ายธุรกิจ/สาขา (30+) | 1:N InspectionJob |
| VehicleBrand | ยี่ห้อรถ (master) | 1:N VehicleModel |
| VehicleModel | รุ่นรถ (Non EV/EV) | N:1 VehicleBrand |

## ERD (core)

```text
+------------------+        +-------------------------+        +------------------+
| Customer         | 1    1 | InspectionJob           | 1    1 | Vehicle          |
+------------------+--------+-------------------------+--------+------------------+
| id           PK  |        | id                 PK   |        | id           PK  |
| type             |        | job_no             UK   |        | job_id       FK  |
| name             |        | status (8 states)       |        | license_plate    |
| corporate_name   |        | customer_type           |        | province         |
| mobile           |        | source_id          FK   |   N    | is_red_plate     |
+------------------+        | agent_id           FK   |--------| brand_id     FK  |
                            | business_div_id    FK   |   1    | model_id     FK  |
+------------------+        | fleet_group_id     FK?  |        | chassis_no       |
| Source           | 1    N | owner_user_id      FK?  |        | vehicle_type     |
+------------------+--------| coverage_start_date     |        +------------------+
| id           PK  |        | appointment_status      |
| name             |        | appointment_date        |        +------------------+
+------------------+        | not_survey_reason       | 1    1 | SurveyAssignment |
        | 1                 | created_by  / *audit*   |--------+------------------+
        | N                 +------------+------------+        | id           PK  |
+------------------+              | 1   | 1      | 1           | job_id       FK  |
| Agent            |              | N   | N      | N           | survey_co_id FK  |
+------------------+        +-----v---+ +v------+ +v---------+  | status           |
| id           PK  |        |JobHistory| |Billing| |Inspection|  | price            |
| source_id    FK  |        +---------+ +-------+ |Image     |  | reject_reason    |
| email (multi)    |                              | Result   |  | accepted_at      |
+------------------+                              +----------+  +--------+---------+
                                                                          | N:1
+------------------+  1    N  +------------------+         +--------------v------+
| VehicleBrand     |---------| VehicleModel     |         | SurveyCompany       |
+------------------+         +------------------+         +---------------------+
| id  PK | name    |         | id PK | brand_id |         | id PK | name | code  |
+------------------+         | vehicle_type     |         +----------+----------+
                             +------------------+              | 1   | N
+------------------+  N    1 +------------------+        +-----v-----+
| MenuPermission   |---------| Role             | 1    N | User      |
+------------------+         +------------------+--------+-----------+
| role_id   FK     |         | id PK | name | system    | id PK | role_id FK |
| menu_key, access |         +------------------+        | system | auth_provider | survey_co_id FK? |
+------------------+                                      +---------------------------------+
```

## Relationships

| A | rel | B | card | Note |
|---|-----|---|------|------|
| Customer | has | InspectionJob | 1:1 | one job per customer record (job-scoped) |
| InspectionJob | has | Vehicle | 1:1 | red-plate ⇒ province="99" |
| FleetGroup | groups | InspectionJob | 1:N | ≤10 jobs (US-006) |
| InspectionJob | sent as | SurveyAssignment | 1:1 | created on "ส่ง SV" (US-010) |
| SurveyCompany | employs | User | 1:N | surveyor users |
| InspectionJob | has | JobHistory | 1:N | audit (US-015) |
| InspectionJob | has | Billing | 1:1 | per-job billing line |
| Role | grants | MenuPermission | 1:N | RBAC (US-032/045) |

## Key Query Patterns (top)

| # | Query | Used by | Index |
|---|-------|---------|-------|
| 1 | list jobs by owner + status + date range, paginated | US-007 | (owner_user_id, status, created_at) |
| 2 | list all jobs by status/source/agent/plate, paginated | US-017 | (status), (source_id), GIN(plate) |
| 3 | dashboard counts grouped by status | US-002 | (status) partial/materialized |
| 4 | 3-year aggregate (count + cost) by year/division | US-002 | (created_at), (business_div_id) |
| 5 | survey assignments by company + status | US-034 | (survey_co_id, status) |
| 6 | billing by month/year + status | US-023, US-040 | (year, month, status) |
| 7 | job history by job | US-015 | (job_id, performed_at) |
| 8 | autocomplete source/agent/brand/model | US-004 | (name) text/trigram |

## Migration & Seed Strategy

- **Tool:** Prisma Migrate (`prisma migrate dev/deploy`). Schema = `prisma/schema.prisma`.
- **Seed (`prisma db seed`):** masters needed for skeleton — ≥1 Source, ≥1 BusinessDivision, ≥1 VehicleBrand+Model, ≥1 SurveyCompany, ≥1 ABC user (role Admin), ≥1 Surveyor user. Enough to run US-004 create flow.

## Walking Skeleton Entities (B0)

Skeleton (US-004 create inspection) exercises: **User** (auth), **InspectionJob** + **Vehicle** + **Customer** (create+read), **Source/BusinessDivision/VehicleBrand/VehicleModel** (seeded master for form), **JobHistory** (audit on create). Other entities deferred to B1+.

## Prisma Schema Sketch (skeleton subset — full schema authored in B0)

```prisma
model User {
  id           String   @id @default(cuid())
  system       String   // "abc" | "emotor"
  authProvider String   @map("auth_provider") // "azure" | "local"
  email        String?  @unique
  username     String?  @unique
  passwordHash String?  @map("password_hash")
  displayName  String   @map("display_name")
  roleId       String   @map("role_id")
  role         Role     @relation(fields: [roleId], references: [id])
  surveyCoId   String?  @map("survey_co_id")
  status       String   @default("active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  @@map("users")
}

model InspectionJob {
  id               String   @id @default(cuid())
  jobNo            String   @unique @map("job_no")
  status           String   @default("new") // 8-state enum (see api-design)
  customerType     String   @map("customer_type")
  sourceId         String   @map("source_id")
  agentId          String?  @map("agent_id")
  businessDivId    String   @map("business_div_id")
  fleetGroupId     String?  @map("fleet_group_id")
  ownerUserId      String?  @map("owner_user_id")
  coverageStartDate DateTime @map("coverage_start_date")
  appointmentStatus String  @map("appointment_status")
  notSurveyReason  String?  @map("not_survey_reason")
  customer         Customer?
  vehicle          Vehicle?
  history          JobHistory[]
  createdBy        String   @map("created_by")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  @@index([ownerUserId, status, createdAt])
  @@index([status])
  @@map("inspection_jobs")
}

model Vehicle {
  id           String  @id @default(cuid())
  jobId        String  @unique @map("job_id")
  job          InspectionJob @relation(fields: [jobId], references: [id])
  licensePlate String  @map("license_plate")
  province     String  // "99" when red plate
  isRedPlate   Boolean @default(false) @map("is_red_plate")
  brandId      String  @map("brand_id")
  modelId      String  @map("model_id")
  chassisNo    String  @map("chassis_no")
  vehicleType  String  @map("vehicle_type") // "non_ev" | "ev"
  @@map("vehicles")
}

// Customer, JobHistory, Source, BusinessDivision, VehicleBrand, VehicleModel — same conventions.
```

> Full schema (all 19 entities, enums, FKs, soft-delete, indexes) authored in B0 `/ai-scaffold` + `/ai-migrate`. This sketch proves the skeleton contract chain.
