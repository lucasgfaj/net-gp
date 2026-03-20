# ⚛️ NETGP

#### **NetGP** is a tool designed to simplify and streamline the creation of network access vouchers for visitors within a university environment. It provides controlled access to network resources by generating temporary, low-privilege accounts specifically for browsing and limited system access.

The system includes role-based visualization filters, where the IT team has full access, while individual departments can only view and manage their own groups. Additionally, NetGP supports integration with the UTFPR-GP domain, allowing staff and interns to be mapped to their respective access levels. When a user’s affiliation ends, all network permissions are automatically revoked.

This solution is focused on **domain-based network access management for visitors**, enabling:

* Creation of temporary users with **no administrative privileges**
* Access limited to **web browsing and essential services**
* Internal use of **SSH** for automated user provisioning on the Samba server (not exposed to visitors)
* File access through a **Samba server**
* Operation without requiring **Redis**, simplifying infrastructure

---

## 🚀 Dependencies

Install PHP and Laravel from the official documentation.

* Docker
* Docker Compose
* PHP 8.4
* Laravel

---

## ⚡ Quick Start

### 1️⃣ Clone Repository

```bash
cd netgp
```

### 2️⃣ Define Environment Variables

```bash
cp .env.example .env
```

### 3️⃣ Install Dependencies

```bash
./run composer install
```

### 4️⃣ Start Containers

```bash
./run up -d
```

### 5️⃣ Create Database and Tables

```bash
./run db:reset
```

---

## 🧪 Run Tests

### PHPUnit

```bash
./run test
```

### PHPCS (Code Sniffer)

```bash
./run phpcs
```

---

## 🌐 Access

* Application: [http://localhost](http://localhost)
* Data Diagram: [https://dbdiagram.io/d/6924ead1228c5bbc1a52f54c](https://dbdiagram.io/d/6924ead1228c5bbc1a52f54c)

---

## ⚠️ Notes

This solution is intended for managing visitor access within a controlled network environment. It ensures security by limiting permissions and automating access revocation when users are no longer authorized.
# net-gp
