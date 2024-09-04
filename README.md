# 📝 Node.js Backend for Task Manager

This repository contains the backend for the **Task Manager** application, built using **Node.js**. It handles task management, user authentication, and integrates with **MongoDB** for data storage. The backend also supports real-time updates via **WebSocket** communication for collaborative task management.

## ✨ Features

### 🚀 Task Management
- **Create, update, and delete tasks**.
- Manage tasks with attributes such as **status, priority, and due dates**.

### 🔐 User Authentication
- **Registration, login, and password reset** functionalities for secure user access.

### 🕒 Real-Time Collaboration
- **Reflects task changes in real-time** for all online users using WebSocket communication.

### 🗄️ Data Storage
- Task details and user information are stored securely in **MongoDB**.

## 🛠️ Tech Stack
- **Node.js**: JavaScript runtime for building the server-side application.
- **Express.js**: Web framework for handling HTTP requests.
- **MongoDB**: NoSQL database for storing task and user data.
- **JWT**: JSON Web Tokens for secure authentication.
- **Socket.io**: Library for real-time, bidirectional communication.

## 🏗️ Backend Architecture
- **MVC**:  separates an application into three main components—Model, View, and Controller—allowing efficient organization, flexibility, and scalable development..
### 📋 Task Management
- **Task CRUD Operations**: Endpoints for creating, reading, updating, and deleting tasks.
- **Data Storage**: Task details such as titles, descriptions, status, and priority are stored in **MongoDB**.

### 🛡️ Authentication
- **Registration**: Users can create an account using their email and phone number.
- **Login**: Users can log in with their credentials, and **JWT tokens** are used for session management.


### 🔄 Real-Time Collaboration
- **WebSocket Integration**: Uses **Socket.io** to handle real-time updates for task changes.
- **Real-Time Updates**: Any changes made to tasks are instantly reflected for all online users.

## 🚀 Getting Started

To set up the backend, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/gopakumar-k-a/task-manager-backend.git
cd task-manager-backend

