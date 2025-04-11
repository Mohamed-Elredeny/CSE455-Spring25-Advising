# CSR455-Spring25 University Advising System

#Repository Structure

```
university-advising-system/
│
├── .github/                         # GitHub specific files
│   ├── workflows/                   # GitHub Actions workflows
│   │   ├── build.yml                # Build workflow
│   │   ├── test.yml                 # Test workflow
│   │   └── deploy.yml               # Deployment workflow
│   ├── ISSUE_TEMPLATE/              # Issue templates
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── custom.md
│   └── PULL_REQUEST_TEMPLATE.md     # PR template
│
├── frontend/                        # Frontend application
│   ├── src/
│   │   ├── modules/                 # Feature modules by team
│   │   │   ├── team1/               # Team 1: Core Authentication & User Management
│   │   │   │   ├── auth/            # Authentication Service
│   │   │   │   ├── profile/         # Student Profile Service
│   │   │   │   └── admin/           # Admin Service
│   │   │   │
│   │   │   ├── team2/               # Team 2: Academic Planning & Course Management
│   │   │   │   ├── catalog/         # Course Catalog Service
│   │   │   │   ├── registration/    # Course Registration Service
│   │   │   │   └── plan/            # Academic Plan Service
│   │   │   │
│   │   │   └── team3/               # Team 3: Advising & Communication
│   │   │       ├── appointment/     # Advising Appointment Service
│   │   │       ├── chat/            # Chat Service
│   │   │       ├── notification/    # Notification Service
│   │   │       └── grade-simulator/ # Grade Simulator Service
│   │   │
│   │   ├── shared/                  # Shared resources
│   │   ├── routes/                  # Routing configuration
│   │   ├── store/                   # Global state management
│   │   ├── layouts/                 # Layout templates
│   │   ├── styles/                  # Global styles
│   │   ├── assets/                  # Static assets
│   │   ├── config/                  # Config files
│   │   ├── App.jsx
│   │   └── index.jsx
│   │
│   ├── public/                      # Static files
│   ├── .eslintrc                    # ESLint config
│   ├── .prettierrc                  # Prettier config
│   ├── Dockerfile                   # Docker config for frontend
│   ├── package.json
│   └── README.md                    # Frontend documentation
│
├── services/                        # Backend microservices
│   ├── team1/                       # Team 1 services
│   │   ├── authentication-service/  # Authentication service
│   │   │   ├── src/                 # Source code
│   │   │   ├── Dockerfile           # Docker config
│   │   │   ├── package.json         # Dependencies
│   │   │   └── README.md            # Service documentation
│   │   │
│   │   ├── student-profile-service/ # Student profile service
│   │   └── admin-service/           # Admin service
│   │
│   ├── team2/                       # Team 2 services
│   │   ├── course-catalog-service/  # Course catalog service
│   │   ├── course-registration-service/ # Registration service
│   │   └── academic-plan-service/   # Academic plan service
│   │
│   └── team3/                       # Team 3 services
│       ├── appointment-service/     # Appointment service
│       ├── chat-service/            # Chat service
│       ├── notification-service/    # Notification service
│       └── grade-simulator-service/ # Grade simulator service
│
├── kubernetes/                      # Kubernetes deployment files
│   ├── dev/                         # Development environment
│   │   ├── frontend/                # Frontend K8s resources
│   │   ├── team1/                   # Team 1 K8s resources
│   │   ├── team2/                   # Team 2 K8s resources
│   │   └── team3/                   # Team 3 K8s resources
│   │
│   ├── staging/                     # Staging environment
│   └── prod/                        # Production environment
│
├── docs/                            # Documentation
│   ├── architecture/                # Architecture docs
│   │   ├── diagrams/                # Architecture diagrams
│   │   └── decisions/               # Architecture decision records
│   │
│   ├── api/                         # API documentation
│   │   ├── team1/                   # Team 1 API docs
│   │   ├── team2/                   # Team 2 API docs
│   │   └── team3/                   # Team 3 API docs
│   │
│   ├── guides/                      # Guides and tutorials
│   │   ├── development/             # Development guides
│   │   ├── deployment/              # Deployment guides
│   │   └── user/                    # User guides
│   │
│   └── testing/                     # Testing documentation
│
├── scripts/                         # Utility scripts
│   ├── setup.sh                     # Setup script
│   ├── build-all.sh                 # Build all services
│   └── deploy.sh                    # Deployment script
│
├── .gitignore                       # Git ignore file
├── docker-compose.yml               # Docker Compose for local development
├── LICENSE                          # License file
└── README.md                        # Main project documentation
```


## Project Overview

The University Advising System is a comprehensive cloud-native platform designed to help students plan their academic journey, track progress, and communicate with advisors. This system is built using a microservices architecture deployed on Kubernetes, adhering to modern cloud-native application development principles.

## System Features

- **Student Portal**: View academic records, GPA/CGPA, plan courses, chat with advisors
- **Advisor Portal**: Manage student advising, review plans, communicate with students
- **Admin Portal**: Manage users, courses, study plans, and system configuration
- **Grade Simulation**: Allow students to simulate grade improvements and track impact
- **Academic Planning**: Create and manage semester-by-semester study plans
- **Advising Communication**: Real-time chat and appointment scheduling

## Microservices Architecture

The system is divided into the following microservices:

### Team 1: Core Authentication & User Management
- **Authentication Service**: JWT-based auth, role management, security
- **Student Profile Service**: Student data, academic records, GPA calculation
- **Admin Service**: System administration, user management, configuration

### Team 2: Academic Planning & Course Management
- **Course Catalog Service**: Course information, prerequisites, search
- **Course Registration Service**: Registration workflow, schedule management
- **Academic Plan Service**: Degree planning, requirement tracking, plan validation

### Team 3: Advising & Communication
- **Advising Appointment Service**: Scheduling, calendar management, reminders
- **Chat Service**: Real-time messaging between students and advisors
- **Notification Service**: System notifications, email integration, preferences
- **Grade Simulator Service**: GPA calculation, course retake simulation, graduation impact

## Implementation Timeline

- **Week 5**: Initial service development (database schemas, core APIs, template customization)
- **Week 6**: Feature development (service-specific functionality, UI components)
- **Week 7**: Integration & containerization (Docker, initial service connections)
- **Week 8**: Kubernetes configuration (deployment manifests, service resources)
- **Week 9**: Cross-service integration (service mesh, event publishing, analytics)
- **Week 10**: Testing & documentation (performance testing, API docs, user guides)

## Grading Structure

Each team member will be graded individually on their weekly submissions:
- 4 points per week (Weeks 5-10) for a total of 24 points
- Strict deadlines with no extensions
- Regular commits expected to show progress
- Complete documentation required for all components
- Successful service integration with other team members

## Technical Requirements

### Frontend
- Customization of provided templates for each service
- Responsive design for all interfaces
- Integration with backend microservices via API calls

### Backend
- REST API implementation for service functionality
- Proper data validation and error handling
- Integration with authentication and other services

### DevOps
- Containerization with Docker
- Kubernetes deployment manifests
- Resource configuration (CPU, memory, scaling)
- Service mesh and network policies

### Testing
- Unit and integration tests for all services
- Performance testing for critical components
- Documentation of test results

## Repository Structure

```
/
├── team1/
│   ├── authentication-service/
│   ├── student-profile-service/
│   ├── admin-service/
│   └── frontend-components/
├── team2/
│   ├── course-catalog-service/
│   ├── course-registration-service/
│   ├── academic-plan-service/
│   └── frontend-components/
├── team3/
│   ├── appointment-service/
│   ├── chat-service/
│   ├── notification-service/
│   ├── grade-simulator-service/
│   └── frontend-components/
├── kubernetes/
│   ├── dev/
│   ├── staging/
│   └── prod/
└── docs/
    ├── api/
    ├── guides/
    └── diagrams/
```

## Getting Started

1. Clone this repository
2. Review your assigned tasks for the current week
3. Set up your development environment (Docker, Kubernetes tools)
4. Implement your assigned microservice following the guidelines
5. Regularly commit and push your changes
6. Coordinate with team members for service integration
7. Submit your weekly deliverables by the deadline

## Team Responsibilities

### Team 1
- **Member 1-1**: Authentication Service + frontend components
- **Member 1-2**: Student Profile Service + frontend components
- **Member 1-3**: Admin Service + frontend components

### Team 2
- **Member 2-1**: Course Catalog Service + frontend components
- **Member 2-2**: Course Registration Service + frontend components
- **Member 2-3**: Academic Plan Service + frontend components

### Team 3
- **Member 3-1**: Advising Appointment Service + frontend components
- **Member 3-2**: Chat Service + frontend components
- **Member 3-3**: Notification Service + frontend components
- **Member 3-4**: Grade Simulator Service + frontend components

## Communication

- Use GitHub Issues for task tracking and questions
- Tag relevant team members when discussing integration points
- Regular team sync meetings recommended
- Document all technical decisions and architectural changes

## Submission Guidelines

- Code must be well-documented with comments
- README.md required for each microservice
- API documentation for all endpoints
- All submissions must pass provided tests
- Deployment manifests must be included
- Frontend components must match design guidelines

## Additional Resources

- Kubernetes Labs Summary documents
- Project specification document
- Frontend templates and guidelines
- API design standards document

