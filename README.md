# RupeeTrack: India-Focused Expense Tracker Application

A modern, responsive, full-stack Expense Tracker Application engineered specifically for Indian users, built with **React 19 + Vite** for the frontend and **Java Spring Boot 3 + MySQL** for the backend.

---

## 1. Project Overview

RupeeTrack is tailored to the day-to-day financial workflows of Indian users:
- **Currency**: Native Indian Rupee formatting (`₹` symbol, Lakhs & Crores numbering system).
- **Date & Time**: `DD/MM/YYYY` date format operating strictly in the `Asia/Kolkata` (IST) timezone.
- **Indian Payment Modes**: Dedicated support for **UPI (Google Pay, PhonePe, Paytm)**, Cash, Debit Card, Credit Card, Net Banking (IMPS/NEFT), and custom channels.
- **Pre-configured Indian Categories**: Food & Dining (Swiggy/Zomato), Canteen & Mess, Transport (Metro/Auto/Bus), Shopping, Rent & Hostel, Bills & Utilities, Education, Healthcare, Entertainment, Mobile Recharge (Jio/Airtel), Subscriptions, Family Expenses, and Travel.
- **Smart Budgets & Alert Thresholds**: Monthly overall budget, category-wise spending limits, and automated warning notifications at **80% and 100%** utilization.
- **India Savings Goals**: Milestone targets for festive purchases (Diwali laptop upgrade, gold, emergency funds).
- **Dynamic Database Records**: All metrics and summaries are computed dynamically from actual database records (no hardcoded figures).

---

## 2. Technology Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Recharts, Lucide Icons.
- **Backend**: Java 17+, Spring Boot 3.2+, Spring Data JPA, Hibernate ORM, Spring Security.
- **Database**: MySQL 8.0+ with `utf8mb4_unicode_ci` and `DECIMAL(12,2)` precision.
- **Authentication**: Stateless JWT with BCrypt password encryption.
- **Deployment**: Single executable JAR serving both backend REST APIs and compiled React SPA.

---

## 3. Project Directory Structure

```text
JFSD/                               ← workspace root
│
├── frontend/                       ← React source & Vite build system
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── ExpenseTable.tsx
│   │   │   ├── IncomeForm.tsx
│   │   │   ├── BudgetModal.tsx
│   │   │   └── SummaryCard.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Expenses.tsx
│   │   │   ├── Income.tsx
│   │   │   ├── Budgets.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/
│   │   │   └── api.ts              ← HTTP client → Spring Boot REST API
│   │   ├── types/
│   │   │   └── index.ts            ← TypeScript interfaces (aligned with backend DTOs)
│   │   ├── utils/
│   │   │   └── formatters.ts       ← INR formatting, IST dates, CSV export
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts              ← Proxy /api → :8080, build → backend/static
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                        ← Spring Boot 3 application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/expensetracker/
│   │   │   │   ├── ExpenseTrackerApplication.java
│   │   │   │   ├── controller/     ← AuthController, ExpenseController, ...
│   │   │   │   ├── service/        ← AuthService, ExpenseService, ...
│   │   │   │   ├── repository/     ← Spring Data JPA repositories
│   │   │   │   ├── entity/         ← JPA entities (User, Expense, Income, ...)
│   │   │   │   ├── dto/            ← Request/Response DTOs
│   │   │   │   ├── mapper/         ← EntityMapper (entity ↔ DTO)
│   │   │   │   ├── config/         ← SecurityConfig, CorsConfig, SpaController
│   │   │   │   ├── security/       ← JwtTokenProvider, JwtAuthenticationFilter
│   │   │   │   └── exception/      ← GlobalExceptionHandler
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── db/migration/   ← (Flyway migration scripts, optional)
│   │   │       └── static/         ← React build output (git-ignored at runtime)
│   │   └── test/
│   │       └── java/com/expensetracker/service/
│   │           ├── AuthServiceTest.java        (5 tests)
│   │           ├── BudgetServiceTest.java      (2 tests)
│   │           ├── CategoryServiceTest.java    (3 tests)
│   │           └── ExpenseServiceTest.java     (2 tests)
│   └── pom.xml
│
├── database/
│   └── schema.sql                  ← DDL: CREATE TABLE statements & seed categories
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Database Setup (MySQL)

1. Ensure MySQL 8.0+ is running locally or in Docker.
2. Execute the initialization schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   This creates:
   - Database: `expense_tracker_db`
   - Tables: `users`, `categories`, `expenses`, `income`, `budgets`, `savings_goals`
   - Default seeded Indian categories (Food & Dining, Canteen & Mess, Transport, etc.)

---

## 5. Environment Variables

Set these in the backend process environment before starting Spring Boot. Spring Boot does not load `.env` files automatically; the example file is a reference, not an automatically loaded configuration.

| Variable       | Default           | Description                              |
|----------------|-------------------|------------------------------------------|
| `DB_HOST`      | `localhost`       | MySQL host                               |
| `DB_PORT`      | `3306`            | MySQL port                               |
| `DB_NAME`      | `expense_tracker_db` | Database name                         |
| `DB_USER`      | *(required)*      | MySQL application username (avoid `root` in production) |
| `DB_PASSWORD`  | *(required)*      | MySQL password                           |
| `DB_USE_SSL`   | `true`            | Require TLS for the MySQL connection     |
| `DB_ALLOW_PUBLIC_KEY_RETRIEVAL` | `false` | Allow MySQL RSA public-key retrieval (enable only when needed) |
| `JWT_SECRET`   | *(required)*      | ≥ 256-bit random secret for JWT signing  |
| `CORS_ORIGINS` | *(none)*          | Cross-origin browser origins; same-origin deployment needs none |

---

## 6. Running in Development

### Backend (Spring Boot)

```bash
# Windows PowerShell
$env:DB_USER="expense_tracker_app"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="your_256bit_secret_key_here_minimum_32_characters"
$env:CORS_ORIGINS="http://localhost:3000"

mvn -f backend\pom.xml spring-boot:run
```

The backend API starts on `http://localhost:8080`.

> **Note**: Set `spring.jpa.hibernate.ddl-auto=update` in `application.properties` for the
> first run if you have not yet executed `database/schema.sql`.

### Frontend (React + Vite)

```bash
# Install dependencies (first time only)
npm --prefix frontend ci

# Start dev server with API proxy to :8080
npm --prefix frontend run dev
```

The app will open at `http://localhost:3000`. All `/api/**` calls are proxied to the Spring Boot backend automatically.

---

## 7. Single-Link Production Deployment

Follow these steps to produce **one executable JAR** serving both the React SPA and all REST APIs on a single port:

```bash
# Step 1: Build the React app (outputs to backend/src/main/resources/static)
npm --prefix frontend run build

# Step 2: Run tests and package the executable JAR
cd backend
mvn clean package

# Step 3 (Linux/macOS): Run (set env vars first)
java \
  -Dapp.jwt.secret="$JWT_SECRET" \
  -Dspring.datasource.password="$DB_PASSWORD" \
  -jar target/expense-tracker-0.0.1-SNAPSHOT.jar
```

Avoid passing production credentials as `-D` JVM arguments because process arguments can be visible to other local processes. Set the required environment variables and run the JAR without secret-valued command-line arguments instead.

Open `http://localhost:8080` — the React UI and `/api/*` endpoints are hosted together.

The packaged JAR reads `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET` from the process environment. Do not place production secrets in source files or commit them. Verify the JAR includes `BOOT-INF/classes/static/index.html` and the generated `BOOT-INF/classes/static/assets/` files after packaging.

On Windows PowerShell, set those environment variables using your deployment secret store, change to `backend`, and run `java -jar target\expense-tracker-0.0.1-SNAPSHOT.jar`. For same-origin deployment, do not set `CORS_ORIGINS`.

Refreshing a supported frontend tab URL (`/dashboard`, `/expenses`, etc.) is handled by `SpaController`, which forwards it to `index.html`; the app reads the URL and restores the selected tab.

---

## 8. Running Backend Tests

The test suite uses Mockito (no database required):

```bash
mvn -f backend\pom.xml test
```

**Test results (all passing):**

| Test Class            | Tests | Result |
|-----------------------|-------|--------|
| AuthServiceTest       | 6     | ✅ PASS |
| BudgetServiceTest     | 2     | ✅ PASS |
| CategoryServiceTest   | 3     | ✅ PASS |
| DashboardServiceTest  | 1     | ✅ PASS |
| ExpenseServiceTest    | 2     | ✅ PASS |
| IncomeServiceTest     | 2     | ✅ PASS |
| SavingsGoalServiceTest| 2     | ✅ PASS |
| JwtTokenProviderTest  | 2     | ✅ PASS |
| SecurityConfigTest    | 3     | ✅ PASS |
| **Total**             | **23**| **BUILD SUCCESS** |

---

## 9. REST API Endpoints Reference

All endpoints (except auth) require `Authorization: Bearer <JWT>` header.

| Method   | Endpoint                          | Description                                          |
|----------|-----------------------------------|------------------------------------------------------|
| `POST`   | `/api/auth/register`              | Register new user with BCrypt-encrypted password     |
| `POST`   | `/api/auth/login`                 | Authenticate and obtain JWT token                    |
| `GET`    | `/api/auth/me`                    | Fetch active user profile (no password hash exposed) |
| `PUT`    | `/api/auth/me`                    | Update fullName, currency, or timezone               |
| `GET`    | `/api/dashboard/summary`          | Real-time financial summary & 7-day spending trends  |
| `GET`    | `/api/expenses`                   | Retrieve user expenses (ordered by date desc)        |
| `POST`   | `/api/expenses`                   | Record a new expense transaction                     |
| `PUT`    | `/api/expenses/{id}`              | Update an existing expense (owner check enforced)    |
| `DELETE` | `/api/expenses/{id}`              | Remove an expense (owner check enforced)             |
| `GET`    | `/api/income`                     | Retrieve user income transactions                    |
| `POST`   | `/api/income`                     | Record incoming credit (Salary, Freelance, etc.)     |
| `PUT`    | `/api/income/{id}`                | Update income record                                 |
| `DELETE` | `/api/income/{id}`                | Delete income transaction                            |
| `GET`    | `/api/budgets?month=YYYY-MM`      | Get monthly overall & category budgets with spent    |
| `POST`   | `/api/budgets`                    | Set or update budget limit                           |
| `DELETE` | `/api/budgets/{id}`               | Delete a budget entry                                |
| `GET`    | `/api/categories`                 | Get default & custom expense categories              |
| `POST`   | `/api/categories`                 | Create custom expense category                       |
| `DELETE` | `/api/categories/{id}`            | Delete custom category                               |
| `GET`    | `/api/savings-goals`          | Retrieve the authenticated user's savings goals      |
| `POST`   | `/api/savings-goals`          | Create a savings goal                                 |
| `PUT`    | `/api/savings-goals/{id}`     | Update an owned savings goal                         |
| `DELETE` | `/api/savings-goals/{id}`     | Delete an owned savings goal                         |

---

## 10. Security Notes

- **Passwords**: Encrypted with BCrypt (cost factor 10). Password hashes are never returned in API responses (`UserDto` excludes the `password` field).
- **JWT**: Stateless, 24-hour expiry. Set `JWT_SECRET` to a cryptographically random ≥ 256-bit key in production.
- **CORS**: Restricted to `CORS_ORIGINS` env var. Cross-origin access is disabled by default; same-origin deployments need no CORS configuration.
- **Cross-user access**: All mutation endpoints verify resource ownership before update/delete; returns `403 Forbidden` on violation.
- **Schema management**: `ddl-auto=validate` in production. Use `database/schema.sql` for all DDL changes.
