# EliTech CreaTives Feedback System

A comprehensive business feedback and review management system designed for modern service providers. This platform enables businesses to collect, manage, and analyze customer feedback in real-time through a streamlined, mobile-responsive interface.

## System Overview

The system consists of three primary modules:

1. Customer Review Interface: A step-by-step survey form designed for high completion rates. It captures detailed ratings across 10 key performance areas, service selections, and contact information for follow-up.
2. Admin Dashboard: A professional command center providing an overview of business performance, including average satisfaction scores, delivery reliability, and staff professionalism metrics.
3. Review Management: A dedicated space for tracking, reading, and resolving customer feedback, featuring a detailed sidebar view of individual submissions.

## Key Features

- Dynamic Branding: Fully customized for EliTech CreaTives with a premium emerald green theme.
- Multi-Branch Support: Capability to track feedback across different physical or digital locations.
- QR Code Integration: Ready for physical deployment with token-based routing for specific branches.
- Real-time Capture: Implemented Formspree integration to ensure all feedback is captured via email even without a traditional database.
- Smart Persistence: Uses browser local storage for immediate data access and session management.
- Security and Privacy: Features a password strength meter for account security and modal-based legal documentation.

## Technical Stack

- Frontend: React.js with Vite for high-performance builds.
- State Management: Custom React hooks and centralized store logic utilizing localStorage.
- Styling: Vanilla CSS with CSS Modules for scoped, maintainable styles.
- Routing: React Router for seamless single-page application navigation.
- Icons: Google Material Icons (Round and Outlined variants).

## Getting Started

1. Install dependencies:
   npm install

2. Start the development server:
   npm run dev

3. Deployment:
   The system is optimized for Vercel and similar static hosting providers. Ensure you replace the Formspree ID in ReviewPage.jsx with your own to receive emails.

## Data Structure

Reviews are stored with a unique ELT-2026- prefix and contain:
- Overall star rating (1-5).
- Categorized scores for product quality, value, and staff.
- Binary and tertiary choice data for delivery and respect metrics.
- Open-ended text feedback for complaints and suggestions.
- Author metadata (unless submitted anonymously).

---
Developed by the EliTech CreaTives Engineering Team.
