MoneyLeak – Personal Finance Tracking System

1. Overview

MoneyLeak is a personal finance tracking application designed to help users monitor, organise and understand their financial transactions.

The application provides a centralised dashboard where users can view income, expenditure, transaction history and spending patterns.

MoneyLeak integrates with the Safaricom M-Pesa Daraja API to initiate STK Push requests, receive payment callbacks and maintain M-Pesa transaction records.

The project combines financial management, transaction automation and data visualisation to make personal financial tracking more accessible.

2. Project Objectives

* Help users monitor their financial transactions.
* Categorise expenditure to understand spending habits.
* Provide summaries of income, expenses and balances.
* Simplify the recording of M-Pesa payments.
* Present financial information through dashboards and analytics.
* Support importing existing financial records from CSV files.
* Provide secure user authentication and account management.

3. Technologies Used

Backend

* Python
* Django
* Django REST Framework
* SQLite
* SimpleJWT Authentication
* Safaricom Daraja API
* Africa’s Talking SMS API (password recovery integration under testing)

Frontend

* React
* Vite
* JavaScript
* Axios
* CSS
* React Router
* Lucide React

4. Key Features

User Authentication

* User registration.
* Email-based login.
* JWT access and refresh token authentication.
* Protected API endpoints.
* Phone number profile management.
* SMS-based OTP password recovery (under testing).

Dashboard

* Financial summary cards.
* Income and expenditure overview.
* Transaction summaries.
* Financial activity overview.

Transaction Management

* Retrieve financial transactions from the backend.
* View transaction descriptions, dates and amounts.
* Organise transactions into categories.
* Manage transaction records through authenticated endpoints.

Financial Analytics

* Income and expenditure summaries.
* Balance calculations.
* Monthly expenditure analysis.
* Spending breakdown by category.
* Category filtering.
* Transaction search.
* Date-range filtering.

M-Pesa Integration

MoneyLeak integrates with the Safaricom Daraja API using the STK Push functionality.

The integration includes:

* Initiating STK Push payment requests.
* Recording payment details.
* Storing Checkout Request IDs and Merchant Request IDs.
* Receiving Safaricom payment callbacks.
* Tracking pending, successful and failed payment statuses.
* Recording M-Pesa receipt numbers.
* Maintaining M-Pesa transaction history.

Development note: End-to-end callback processing and automatic transaction status updates are still undergoing testing.

CSV Import

* CSV-based financial transaction import functionality.
* Support for importing existing transaction records.

Further testing and improvements to statement import processing are ongoing.

5. Transaction Categories

MoneyLeak currently supports:

* Food
* Transport
* Shopping
* Bills
* Education
* Health
* Entertainment
* Income
* Other

6. Project Structure

The project is organised into separate backend and frontend components.

MoneyLeak/
│
├── moneyleak_backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── mpesa_service.py
│   │
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── transactions/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   └── mpesa/
│       ├── models.py
│       ├── views.py
│       └── urls.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   └── package.json
│
└── README.md

This is a simplified representation of the application structure.

7. Installation and Setup

Prerequisites

* Python
* Node.js and npm
* Git
* Safaricom Daraja developer account for M-Pesa sandbox testing

Clone the Repository

git clone YOUR_REPOSITORY_URL
cd moneyleak_backend

Backend Setup

Create and activate a virtual environment:

python -m venv .venv

Install dependencies:

pip install -r requirements.txt

Run database migrations:

python manage.py migrate

Start the development server:

python manage.py runserver

The backend runs at:

http://127.0.0.1:8000

Frontend Setup

Open another terminal:

cd frontend
npm install
npm run dev

The Vite development server normally runs at:

http://localhost:5173

8. Environment Variables

Create a .env file in the backend root directory.

Configure the required environment variables:

MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=your_callback_url
AFRICASTALKING_USERNAME=your_username
AFRICASTALKING_API_KEY=your_api_key

Never commit real credentials, API keys, access tokens or secret keys to a public repository.

9. M-Pesa Integration Workflow

The STK Push process follows these steps:

1. The user enters payment information.
2. MoneyLeak sends an STK Push request to Safaricom.
3. Safaricom sends a payment prompt to the user’s phone.
4. The user authorises or cancels the payment.
5. Safaricom sends a callback to MoneyLeak.
6. The backend processes the callback response.
7. The transaction status is updated.
8. Successful payments can be recorded in the main transaction system.

The expected transaction statuses are:

* PENDING
* SUCCESS
* FAILED

The callback workflow is currently undergoing end-to-end verification.

10. Current Development Status

MoneyLeak is under active development.

Implemented components

* Django REST Framework backend.
* React frontend.
* JWT authentication.
* Transaction management.
* Financial analytics endpoints.
* M-Pesa STK Push initiation.
* M-Pesa transaction records and history.
* CSV import functionality.
* Phone number profile support.

Components undergoing testing

* SMS OTP password recovery.
* M-Pesa callback delivery and processing.
* Automatic updates of successful and failed payment statuses.
* Integration of successful M-Pesa payments into financial analytics.
* Complete CSV statement import workflow.

11. Security

MoneyLeak incorporates several security measures:

* JWT-based authentication.
* Protected API endpoints.
* Environment-based storage of sensitive API credentials.
* User-associated financial transaction records.
* Backend processing of M-Pesa callbacks.

Additional security testing and production-hardening measures are required before public release.

12. Future Improvements

* Bank statement imports.
* Bank transaction integration.
* Improved financial reporting.
* Advanced transaction categorisation.
* Budget tracking.
* Expanded financial insights.
* Improved payment reconciliation.
* More comprehensive automated testing.

13. Author

Developed as a personal finance technology project as part of software development training at Zindua School.
