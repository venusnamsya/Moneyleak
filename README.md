MoneyLeak – Personal Finance Tracking System

Overview

MoneyLeak is a personal finance tracking application designed to help users monitor, organise and understand their financial transactions.

The system provides a centralised dashboard where users can view their income, expenditure, transaction history and spending patterns.

MoneyLeak integrates with the Safaricom M-Pesa Daraja API to support STK Push payments and record payment transactions.

Objectives

* Help users monitor their financial transactions.
* Categorise expenditure to understand spending habits.
* Provide summaries of income, expenses and balances.
* Simplify the tracking of M-Pesa payments.
* Present financial information through visual dashboards and analytics.
* Support importing financial transactions from CSV files.

Technologies Used

Backend

* Python
* Django
* Django REST Framework
* SQLite
* SimpleJWT Authentication
* Safaricom Daraja API

Frontend

* React
* Vite
* JavaScript
* Axios
* CSS

Key Features

1. User Authentication

* User registration.
* Secure login.
* JWT-based authentication.
* Protected API endpoints.

2. Dashboard

* Financial summary cards.
* Income and expenditure overview.
* Transaction summaries.
* Financial activity overview.

3. Transaction Management

* View financial transactions.
* Organise transactions into categories.
* Track transaction descriptions, dates and amounts.
* Retrieve transaction records from the backend.

4. Financial Analytics

* Monthly expenditure analysis.
* Spending breakdown by category.
* Income and expenditure summaries.
* Date-range filtering.

5. M-Pesa Integration

MoneyLeak uses the Safaricom Daraja API to support M-Pesa STK Push transactions.

The integration supports:

* Initiating STK Push payment requests.
* Recording payment details.
* Processing Safaricom payment callbacks.
* Tracking pending, successful and failed transactions.
* Displaying M-Pesa transaction history.

6. CSV Import

The application includes a CSV transaction import feature intended to support importing existing financial records.

Transaction Categories

MoneyLeak supports the following categories:

* Food
* Transport
* Shopping
* Bills
* Education
* Health
* Entertainment
* Income
* Other

Project Structure

MoneyLeak/
│
├── manage.py
├── db.sqlite3
├── .env
│
├── users/
├── transactions/
├── mpesa/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── app.jsx
│   │   └── index.css
│   └── package.json
│
└── README.md

Installation and Setup

Prerequisites

* Python
* Node.js and npm
* Git
* Safaricom Daraja developer account for M-Pesa sandbox testing

1. Clone the Repository

git clone YOUR_REPOSITORY_URL
cd moneyleak_backend

2. Set Up the Backend

Create and activate a virtual environment:

python -m venv .venv

Install the backend dependencies using the project’s requirements file, if available:

pip install -r requirements.txt

Run migrations:

python manage.py migrate

Start the Django development server:

python manage.py runserver

The backend runs at:

http://127.0.0.1:8000

3. Set Up the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The Vite development server normally runs at:

http://localhost:5173

Environment Variables

Create a .env file in the backend root directory.

Configure the required environment variables:

MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=your_callback_url

Never commit real credentials, access tokens or secret keys to a public repository.

M-Pesa Integration

MoneyLeak uses Safaricom’s Daraja API sandbox environment for payment testing.

The STK Push process involves:

1. The user enters payment information.
2. MoneyLeak requests an STK Push.
3. Safaricom sends a payment prompt to the user’s phone.
4. The user authorises the payment.
5. Safaricom sends a callback to MoneyLeak.
6. The backend updates the transaction status.

Current Development Status

MoneyLeak is under active development.

Implemented components include authentication, transaction management, financial analytics, and the M-Pesa STK Push integration.

Further work includes:

* Complete end-to-end testing of M-Pesa payments and callbacks.
* Completing and testing CSV imports.
* Integrating successful M-Pesa transactions into all analytics reports.
* Expanding financial reporting.
* Exploring bank deposit and bank statement integration.

Security

* Authentication is handled using JWT.
* Protected endpoints require authentication.
* M-Pesa credentials are stored in environment variables.
* Payment callbacks are processed by the backend.

Additional production security and deployment measures will be required before public release.

Future Improvements

* Bank statement imports.
* Bank transaction integration.
* Improved financial reporting.
* More advanced transaction categorisation.
* Budget tracking.
* Expanded financial insights.

Author

Developed as a personal finance technology project as part of software development training at Zindua School.
