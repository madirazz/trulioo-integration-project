
# Trulioo Web SDK Direct Integration Project

  

This repository contains both the **backend** and **frontend** code for implementing the **Trulioo Web SDK** direct integration. The backend is built with **Node.js**, and the frontend uses **Vite-powered React** to provide a seamless user interface for document verification.

  

## Table of Contents

  

1. [Introduction](#introduction)

2. [Prerequisites](#prerequisites)

3. [Backend Setup](#backend-setup)

	- [Clone the Repository](#clone-the-repository)

	- [Navigate to the Backend Directory](#navigate-to-the-backend-directory)

	- [Install Dependencies](#install-dependencies)

	- [Configure Environment Variables](#configure-environment-variables)

	- [Run the Backend Server](#run-the-backend-server)

4. [Frontend Setup](#frontend-setup)

	- [Navigate to the Frontend Directory](#navigate-to-the-frontend-directory)

	- [Install Frontend Dependencies](#install-frontend-dependencies)

	- [Configure Frontend Environment Variables](#configure-frontend-environment-variables)

	- [Run the Frontend Application](#run-the-frontend-application)

5. [Using the Application](#using-the-application)



6. [Troubleshooting](#troubleshooting)

  

---

  

## Introduction

  

This project integrates the **Trulioo Web SDK** into a web application to enable document verification. It consists of:

  

- A **backend** built with Node.js, handling API requests, transaction management, and interaction with Trulioo.

- A **frontend** built with React (using Vite), providing the user interface for initiating the verification process.

  

This guide walks you through setting up both the backend and frontend components, configuring the necessary environment variables, and running the application.

  

---

  

## Prerequisites

Ensure you have the following installed before proceeding with the setup:

  

1.  **Node.js** (v14.x or higher)

- [Download Node.js](https://nodejs.org/)

2.  **npm** (comes with Node.js) or **yarn**

- [npm Documentation](https://docs.npmjs.com/)

- [Yarn Documentation](https://classic.yarnpkg.com/lang/en/docs/)

3.  **Git**

- [Download Git](https://git-scm.com/)

  

---

  

## Backend Setup

  

### Clone the Repository

  

First, clone this repository to your local machine.

  

```
git clone https://github.com/madirazz/trulioo-integration-project.git

```
  

### Navigate to the Backend Directory


```
cd trulioo-integration-project/backend
```

### Install Dependencies

Install the backend dependencies using **npm** or **yarn**.

Using **npm**:



```
npm install
``` 

Using **yarn**:


```
yarn install
```

### Configure Environment Variables

You'll need to create a `.env` file to store your environment variables. This file includes your Trulioo API keys and any other necessary configurations.

#### Create a `.env` File

Copy the example environment file and create a new `.env` file:

Using **npm**:



```
cp .env.sample .env
``` 



#### Edit the `.env` File

Open the `.env` file and add the necessary environment variables:



```
#Trulioo API Configuration
TRULIOO_API_URL=https://verification.trulioo.com
API_VERSION=2.5
LICENSE_KEY=your_trulioo_license_key_here

# Server Configuration
PORT=5000
```

> **Note**: You will need a valid **Trulioo License Key**. 

### Run the Backend Server

Start the backend server in development mode.

Using **npm**:



   ``` 
   npm run dev
   ```


Your backend server should now be running at `http://localhost:5000`.

----------

## Frontend Setup

### Navigate to the Frontend Directory

In a new terminal window or tab, navigate to the frontend directory.


```
cd trulioo-integration-project/frontend
```

### Install Frontend Dependencies

Install the frontend dependencies using **npm** or **yarn**.

Using **npm**:



```
npm install 
``` 

Using **yarn**:



```
yarn install
``` 

### Configure Frontend Environment Variables

The frontend uses Vite and requires its own set of environment variables for connecting to the backend and Trulioo SDK.

#### Create a `.env` File

Copy the example `.env` file and create a `.env` file:



```
cp .env.sample .env
```

#### Edit the `.env` File

Open the `.env` file and add the necessary environment variables:


```

# API Base URL (Backend URL)
VITE_API_BASE_URL=http://localhost:5000

# Trulioo Host URL (for testing via ngrok or your actual domain)
VITE_TRULIOO_HOST=https://your-ngrok-url.ngrok.io
``` 

> **Important**: Ensure the port for the backend (`VITE_API_BASE_URL`) in the frontend's `.env` matches the port your backend server is running on (e.g., `http://localhost:5000`). If you modify the backend port, make sure to update this value accordingly.

### Run the Frontend Application

Start the frontend development server.

Using **npm**:



```
npm run dev
``` 

_Your frontend application should now be running at `http://localhost:5173`._

#### Expose Your Frontend URL Using Ngrok

To test the Trulioo SDK integration, you will need to expose your frontend development server using a tool like **ngrok**. Ngrok allows you to create a public URL for your local development environment.

Run the following command in your terminal to start ngrok and expose your local frontend:


```
ngrok http 5173
``` 

This will generate a public URL (for example, `https://your-ngrok-url.ngrok.io`) that you can use to access your frontend from the web.

#### Update `.env` with Ngrok URL

Take the ngrok URL generated and update the `VITE_TRULIOO_HOST` in your `.env` file:



```
VITE_TRULIOO_HOST=https://your-ngrok-url.ngrok.io
``` 

Now, Trulioo can redirect properly to your development server for testing.

----------
## Using the Application
 1. **Access the Frontend**: Open your browser and navigate to the ngrok public URL (for example, `https://your-ngrok-url.ngrok.io`).
 2.  **Initiate Verification**: Click on the **"Start Verification"** button.


3. **Verification Process**: The frontend will communicate with the backend to create a transaction and generate a shortcode, which will be used to initiate the Trulioo SDK for document verification.
 4. **Success or Error Handling**: The UI will display whether the verification was successful or if there were any errors during the
    process.

## Troubleshooting

### 1. Backend Issues

-   Ensure the backend server is running and accessible at the correct port (`http://localhost:5000` by default).
-   Check for any errors related to environment variables, especially the Trulioo JWT.
-   Review the console logs for detailed error messages.

### 2. Frontend Issues

-   Make sure the frontend is properly connected to the backend (`VITE_API_BASE_URL` should point to the backend URL).
-   If using **ngrok** for testing, ensure that the `VITE_TRULIOO_HOST` is correctly set in the `.env` file.