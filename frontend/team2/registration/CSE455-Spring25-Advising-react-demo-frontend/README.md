# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

university-advising-frontend/
├── src/
│   ├── modules/                 # Main feature modules by team
│   │   ├── Team 1: Core Authentication & User Management/               # Team 1 services
│   │   │   ├── auth/            # Authentication Service
│   │   │   │   ├── components/  # UI components specific to auth
│   │   │   │   ├── pages/       # Login, Register, etc.
│   │   │   │   ├── hooks/       # Custom hooks
│   │   │   │   ├── services/    # API calls to auth service
│   │   │   │   ├── store/       # State management for auth
│   │   │   │   └── routes.js    # Auth routes configuration
│   │   │   │
│   │   │   ├── profile/         # Student Profile Service
│   │   │   │   ├── components/  
│   │   │   │   ├── pages/       # Profile view, edit, etc.
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/    # API calls to profile service
│   │   │   │   ├── store/
│   │   │   │   └── routes.js
│   │   │   │
│   │   │   └── admin/           # Admin Service
│   │   │       ├── components/
│   │   │       ├── pages/       # Admin dashboard, user management, etc.
│   │   │       ├── hooks/
│   │   │       ├── services/    # API calls to admin service
│   │   │       ├── store/
│   │   │       └── routes.js
│   │   │
│   │   ├── Team 2: Academic Planning & Course Management/               # Team 2 services
│   │   │   ├── catalog/         # Course Catalog Service
│   │   │   │   ├── components/
│   │   │   │   ├── pages/       # Course listing, search, details
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   ├── store/
│   │   │   │   └── routes.js
│   │   │   │
│   │   │   ├── registration/    # Course Registration Service
│   │   │   │   ├── components/
│   │   │   │   ├── pages/       # Registration workflow
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   ├── store/
│   │   │   │   └── routes.js
│   │   │   │
│   │   │   └── plan/            # Academic Plan Service
│   │   │       ├── components/
│   │   │       ├── pages/       # Plan creation, validation
│   │   │       ├── hooks/
│   │   │       ├── services/
│   │   │       ├── store/
│   │   │       └── routes.js
│   │   │
│   │   └── Team 3: Advising & Communication/               # Team 3 services
│   │       ├── appointment/     # Advising Appointment Service
│   │       │   ├── components/
│   │       │   ├── pages/       # Schedule, calendar
│   │       │   ├── hooks/
│   │       │   ├── services/
│   │       │   ├── store/
│   │       │   └── routes.js
│   │       │
│   │       ├── chat/            # Chat Service
│   │       │   ├── components/
│   │       │   ├── pages/       # Chat interface
│   │       │   ├── hooks/
│   │       │   ├── services/
│   │       │   ├── store/
│   │       │   └── routes.js
│   │       │
│   │       ├── notification/    # Notification Service
│   │       │   ├── components/
│   │       │   ├── pages/       # Notification settings
│   │       │   ├── hooks/
│   │       │   ├── services/
│   │       │   ├── store/
│   │       │   └── routes.js
│   │       │
│   │       └── grade-simulator/ # Grade Simulator Service
│   │           ├── components/
│   │           ├── pages/       # Simulation interface
│   │           ├── hooks/
│   │           ├── services/
│   │           ├── store/
│   │           └── routes.js
│   │
│   ├── shared/                  # Shared across all modules
│   │   ├── components/          # Common UI components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Form/
│   │   │   ├── Layout/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Header/
│   │   │   │   ├── Footer/
│   │   │   │   └── index.js
│   │   │   └── index.js         # Export all components
│   │   │
│   │   ├── hooks/               # Common hooks
│   │   │   ├── useApi.js
│   │   │   ├── useAuth.js
│   │   │   └── index.js
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── api.js           # Axios instance/config
│   │   │   ├── validation.js
│   │   │   ├── date.js
│   │   │   └── index.js
│   │   │
│   │   ├── constants/           # App-wide constants
│   │   │   ├── endpoints.js
│   │   │   ├── roles.js
│   │   │   └── index.js
│   │   │
│   │   └── contexts/            # Context providers
│   │       ├── AuthContext.js
│   │       ├── ThemeContext.js
│   │       └── index.js
│   │
│   ├── routes/                  # Routing configuration
│   │   ├── AppRoutes.js         # Combines all module routes
│   │   ├── ProtectedRoute.js    # Auth protection wrapper
│   │   ├── RoleBasedRoute.js    # Role-based access control
│   │   └── index.js
│   │
│   ├── store/                   # Global state (Redux, Context)
│   │   ├── actions/
│   │   ├── reducers/
│   │   ├── selectors/
│   │   └── index.js
│   │
│   ├── layouts/                 # Layout templates
│   │   ├── StudentLayout.js
│   │   ├── AdvisorLayout.js
│   │   ├── AdminLayout.js
│   │   └── index.js
│   │
│   ├── styles/                  # Global styles
│   │   ├── theme.js
│   │   ├── global.css
│   │   └── variables.css
│   │
│   ├── assets/                  # Static assets
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── config/                  # Configuration files
│   │   ├── api.config.js
│   │   └── app.config.js
│   │
│   ├── App.jsx                  # Main app component
│   └── index.jsx                # Entry point
│
├── public/                      # Static files
│   ├── index.html
│   └── favicon.ico
│
├── kubernetes/                  # Kubernetes configs for frontend
│   ├── deployment.yaml
│   └── service.yaml
│
├── Dockerfile                   # Docker configuration
├── package.json
└── README.md
