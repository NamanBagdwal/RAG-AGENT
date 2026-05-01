# RAG-AGENT – Enterprise SOP AI Assistant

## Overview

RAG-AGENT is a full-stack **Retrieval-Augmented Generation (RAG)** platform designed to transform large corporate SOP (Standard Operating Procedure) documents into an intelligent conversational assistant.

This system allows employees to ask operational questions in natural language and receive accurate, source-cited answers directly from uploaded SOP PDFs.

### Example Queries:

* How do I process a refund?
* What is the reimbursement approval workflow?
* What are vendor onboarding compliance steps?

---

# Key Features

## PDF Knowledge Base Management

* Upload large SOP PDF documents
* Automatic PDF parsing and text extraction
* Smart chunking for efficient retrieval
* Vector embedding generation
* MongoDB Atlas Vector Search integration
* Re-indexing support for updated documents

---

## Retrieval-Augmented Generation (RAG)

* Semantic search across enterprise SOPs
* Top relevant chunk retrieval
* Context-aware response generation
* Gemini 1.5 Flash integration
* Highly accurate enterprise search experience

---

## Source Citation System

Every response includes:

* Document title
* Page number
* Section reference

### Example:

> According to Refund Policy (Page 12, Section 3.1)...

---

## Hallucination Prevention

* Answers strictly from uploaded SOP data
* No fabricated information
* Unknown queries return:

> “I don’t know based on the provided SOP documents.”

---

## Admin Dashboard

* Secure admin login
* Upload/delete SOP documents
* Manage enterprise knowledge base
* Trigger document reprocessing
* Monitor ingestion pipeline

---

## Employee Chat Interface

* Real-time AI chat
* Streaming responses (SSE)
* Persistent chat history
* Citation-based PDF snippet preview
* Clean enterprise UI

---

# Tech Stack

## Frontend

* React.js
* Tailwind CSS
* TypeScript / JavaScript
* Server-Sent Events (SSE)

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Multer
* PDF Parser
* Gemini API
* JWT Authentication

---

# Project Architecture

```bash
RAG-AGENT/
│
├── frontend/                # Employee + Admin UI
├── backend/                 # API server
│   ├── routes/              # API routes
│   ├── controllers/         # Business logic
│   ├── models/              # MongoDB schemas
│   ├── services/            # RAG, embeddings, Gemini
│   └── uploads/             # SOP documents
│
├── .gitignore
├── README.md
└── package.json
```

---

# Core Workflow

## Document Ingestion:

1. Admin uploads SOP PDF
2. PDF text extraction
3. Chunking (1000 chars + overlap)
4. Embedding generation
5. MongoDB vector storage
6. Search indexing

---

## User Query Flow:

1. Employee asks question
2. Query converted to embedding
3. MongoDB vector search retrieves relevant chunks
4. Gemini receives context
5. Response generated with citations
6. User receives grounded answer

---

# Security Features

* JWT Authentication
* Role-based access control
* Admin-only document management
* Secure API endpoints
* Protected enterprise data

---

# Installation

## Clone Repository

```bash
git clone https://github.com/NamanBagdwal/RAG-AGENT.git
cd RAG-AGENT
```

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# Environment Variables

Create `.env` files with:

```env
MONGODB_URI=
GEMINI_API_KEY=
JWT_SECRET=
PORT=
```

---

# Future Enhancements

* OCR for scanned PDFs
* Department-wise SOP filtering
* Analytics dashboard
* Multi-language support
* Advanced search filters
* User feedback system

---

# Use Cases

* Corporate SOP management
* HR policy assistants
* Refund/reimbursement workflows
* Compliance documentation
* Internal knowledge systems

---

# Author

**Naman Bagdwal**
AI/Full Stack Developer Internship Project

---

# License

This project is confidential/internal use unless otherwise specified.
