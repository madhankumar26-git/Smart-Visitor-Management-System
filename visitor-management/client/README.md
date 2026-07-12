# Smart Visitor Management Frontend

This React application connects to the Smart Visitor Management Flask backend.

## Installation

```bash
npm install
```

## Run

```bash
npm run dev
```

## Available Pages

- `/login` — login screen
- `/admin` — admin dashboard
- `/security` — security dashboard
- `/visitors` — visitor list
- `/add-visitor` — add visitor form
- `/reports` — reports screen
- `/profile` — user profile

## API Proxy

The app proxies `/api` requests to `http://127.0.0.1:5000`.

## Notes

- JWT is stored in `localStorage`
- Admin and Security routes are protected
- Tailwind CSS is used for styling
