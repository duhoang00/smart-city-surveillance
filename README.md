# Smart City Surveillance
### Overview
This project is a next-generation Smart City Surveillance System that replaces a legacy solution. It provides a modern web dashboard for Operators and a mobile-friendly interface for on-duty Guards, all connected via WebSockets for real-time updates.

The system focuses on enabling Operators to monitor CCTV cameras, manage alarms, and dispatch Security Guards, while Guards receive assignments and send live updates from the field.

## Tech Stack
- **Frontend**: Next.js 15, TailwindCSS, ShadCN/UI
- **Backend**: Node.js, WebSocket
- **Shared Types**: TypeScript packages
- **UI Components**: ShadCN/UI
- **Monorepo Tooling**: Turborepo

## Monorepo Structure (Turborepo)
- **apps/web** – Next.js web app (Operator dashboard & Guard interface)
- **apps/server** – Node.js + WebSocket server
- **packages/types** – Shared TypeScript types across apps
- **packages/ui** – Shared ShadCN UI components
- **packages/...-config** – Shared configs (Tailwind, TypeScript, ESLint)

## Features (by User Story)

1. Operator Dashboard
- Select premises and cameras in a 2x2 grid layout
- View live CCTV feeds over WebSocket

2. Alarm System Integration
- Receive detailed alerts when abnormalities occur (intrusion, suspicious activity, equipment damage, etc.)
- Alerts include camera and guard context

3. Incident Dispatching
- Operators can assign incidents to Guards directly from the dashboard
- Guards receive real-time notifications on their device

4. Guard Mobile Notifications
- Guards get notified when assigned to an incident
- Notifications include incident details and instructions

5. Guard Field Updates
- Guards can send updates back to the Operation Center
- Provides Operators with real-time situational awareness

6. Role-based Camera Access
- Operators → see all cameras
- Guards → only see their assigned cameras

## Getting Started
Install dependencies:
```sh
npm install
```

Run all apps in dev mode:
```sh
npm install
```