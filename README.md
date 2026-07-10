# Capstone Project

> A full-stack web application built as part of the **FlyRank AI Frontend Internship** program.

---

## Overview

This repository contains the capstone project for Week 1 of the FlyRank AI internship. The application is a modern, full-stack solution designed to demonstrate proficiency in frontend development, state management, API integration, and software engineering best practices.

> **Note:** Update this section with a concise description of your application's purpose, target users, and the problem it solves.

---

## Features

- Responsive user interface built with React
- Centralized state management with Redux
- RESTful API powered by Node.js and Express
- Unit and component-level test coverage

> **Note:** Replace or expand this list as you implement features throughout the internship.

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Frontend     | React                               |
| State        | Redux                               |
| Backend      | Node.js, Express                    |
| Testing      | Unit & component tests                |
| Tooling      | npm                                 |

---

## Project Structure

```
capstone-project/
├── README.md          # Project documentation
├── LICENSE            # MIT License
├── .gitignore         # Git ignore rules
└── .cursorrules       # AI assistant & coding guidelines
```

> **Note:** Update this tree as you scaffold the frontend, backend, and test directories.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd capstone-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root (see `.env.example` once available):

   ```env
   PORT=3000
   # Add additional variables as needed
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000` (or the port defined in your `.env` file).

---

## Available Scripts

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `npm run dev`  | Start the development server             |
| `npm test`     | Run the test suite                       |
| `npm run lint` | Lint the codebase *(when configured)*    |
| `npm run build`| Create a production build *(when configured)* |

---

## Testing

This project uses unit and component testing to ensure reliability and maintainability.

```bash
# Run all tests
npm test

# Run tests in watch mode (if supported)
npm test -- --watch
```

---

## Development Guidelines

- Follow a clean, modular architecture as defined in `.cursorrules`
- Prefer explicit types over inferred types where applicable
- Write self-documenting code; add comments only for non-obvious logic
- Keep commits small, focused, and descriptive

---

## Roadmap

- [ ] Scaffold frontend and backend project structure
- [ ] Implement core application features
- [ ] Add Redux state management
- [ ] Write unit and component tests
- [ ] Deploy to production

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgments

Built as part of the [FlyRank AI](https://flyrank.ai) Frontend Internship program.
