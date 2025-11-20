Sitestate – Real Estate Agency Platform
Project Overview

Sitestate is a real estate web application built with the MERN stack. It uses Redux Toolkit for state management, Tailwind CSS for styling, and Clerk for authentication. Users can browse, search, and view property listings while admins can manage properties.

Project Structure
SiteState/
│
├─ api/                 # Backend code (Node.js + Express)
│   ├─ controllers/     # Route controllers
│   ├─ middleware/      # Custom middleware
│   ├─ models/          # MongoDB models
│   ├─ routes/          # API routes
│   ├─ uploads/         # Uploaded property images
│   ├─ utils/           # Utility functions
│   └─ index.js         # Server entry point
│
├─ client/              # Frontend code (React + Redux + Tailwind)
│   ├─ public/          # Static assets
│   ├─ src/             # React components and pages
│   ├─ package.json     
│   └─ index.html
│
├─ .gitignore
├─ package-lock.json
└─ README.md

Features

User authentication with Clerk

Browse and search property listings

Add, edit, and delete properties (admin)

Global state management with Redux Toolkit

Responsive design using Tailwind CSS

RESTful API backend with Node.js, Express, and MongoDB

File uploads for property images


DEPLOYENT:
VERCEL =https://site-state.vercel.app/
RENDER==https://sitestate.onrender.com/ 
