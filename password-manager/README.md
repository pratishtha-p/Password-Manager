# Keyring: Password Manager

A full-stack password manager built with the MERN stack. Users create an account, then store, search, edit and delete their logins in a personal vault. Saved passwords are encrypted before they reach the database.

## Features

- Register and log in (bcrypt-hashed passwords, JWT sessions)
- Add, edit and delete credentials (full CRUD over a REST API)
- Search by site or username
- Copy username or password to the clipboard
- Show/hide passwords and generate strong random ones
- Responsive UI that works on mobile and desktop

## Tech stack

| Layer    | Tools                                        |
|----------|----------------------------------------------|
| Frontend | React 18, Vite, plain CSS                    |
| Backend  | Node.js, Express                             |
| Database | MongoDB with Mongoose                        |
| Security | bcryptjs, JSON Web Tokens, AES-256-GCM       |

## Getting started

**Prerequisites:** Node.js 18+, and MongoDB running locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
git clone https://github.com/pratishtha-p/password-manager.git
cd password-manager
```

**1. Start the server**

```bash
cd server
cp .env.example .env     # then fill in the values (see below)
npm install
npm run dev              # runs on http://localhost:5000
```

**2. Start the client** (in a second terminal)

```bash
cd client
npm install
npm run dev              # runs on http://localhost:5173
```

### Environment variables (`server/.env`)

| Variable         | Description                                                                                         |
|------------------|-----------------------------------------------------------------------------------------------------|
| `PORT`           | Server port (default 5000)                                                                          |
| `MONGO_URI`      | MongoDB connection string                                                                           |
| `JWT_SECRET`     | Long random string used to sign login tokens                                                        |
| `ENCRYPTION_KEY` | 64 hex characters. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

## API

All `/api/credentials` routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint                   | Description                                  |
|--------|----------------------------|----------------------------------------------|
| POST   | `/api/auth/register`       | Create an account                            |
| POST   | `/api/auth/login`          | Log in and receive a token                   |
| GET    | `/api/credentials?search=` | List your credentials, optionally filtered   |
| POST   | `/api/credentials`         | Add a credential                             |
| PUT    | `/api/credentials/:id`     | Update a credential                          |
| DELETE | `/api/credentials/:id`     | Delete a credential                          |

## How security works

- **Login passwords** are hashed with bcrypt, a one-way function, so they can never be read back.
- **Vault passwords** are encrypted with AES-256-GCM using a random IV per entry. The auth tag detects tampering.
- Every credential query is filtered by the logged-in user's ID, so users can only reach their own data.
- Secrets live in `.env`, which is git-ignored.

**Limitations:** the encryption key is held by the server, so this is not zero-knowledge like Bitwarden. A future improvement would be encrypting in the browser with a key derived from a master password.

## Project structure

```
password-manager/
├── client/              React app (Vite)
│   └── src/
│       ├── pages/       Auth.jsx, Vault.jsx
│       ├── api.js       fetch wrapper that attaches the JWT
│       └── App.jsx
└── server/              Express API
    ├── models/          User, Credential
    ├── routes/          auth, credentials
    ├── middleware/      JWT check
    └── utils/           AES-256-GCM helpers
```

## License

MIT
