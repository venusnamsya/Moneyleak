MoneyLeak Backend

Overview

MoneyLeak is a personal finance management application designed to help users record, organize, and monitor their spending. This backend is built with Django and Django REST Framework and provides API endpoints for authentication, transaction management, analytics, CSV imports, and M-Pesa STK Push integration.

The application uses JWT authentication to protect user-specific resources and SQLite for database storage during development.

Features

* User registration and authentication
* JWT access and refresh token support
* Create, retrieve, update, and delete financial transactions
* Transaction analytics
* CSV transaction import
* M-Pesa STK Push initiation through Safaricom Daraja
* M-Pesa callback handling
* M-Pesa transaction history
* Transaction status tracking, including pending, successful, and failed payments
* Database persistence for financial records

Technologies Used

* Python
* Django
* Django REST Framework
* Django REST Framework Simple JWT
* SQLite
* Safaricom Daraja API
* Postman
* Git and GitHub

Project Structure

moneyleak_backend/
├── manage.py
├── moneyleak_backend/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── users/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── ...
├── transactions/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── import_views.py
│   └── ...
├── mpesa/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── ...
├── mpesa_service.py
├── .env
├── .gitignore
└── requirements.txt

The exact files may vary depending on the current implementation.

Installation and Setup

1. Clone the repository

git clone <your-repository-url>
cd moneyleak_backend

Replace <your-repository-url> with your actual Git repository URL.

2. Create a virtual environment

python -m venv .venv

Activate the environment.

Windows:

.venv\Scripts\activate

macOS or Linux:

source .venv/bin/activate

3. Install dependencies

pip install -r requirements.txt

If a requirements file has not yet been created, install the project’s required packages and generate one:

pip install django djangorestframework djangorestframework-simplejwt requests python-dotenv
pip freeze > requirements.txt

4. Configure environment variables

Create a .env file in the project root and configure the required Daraja sandbox credentials and callback settings.

Example variable names:

MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=your_public_callback_url

Use the exact variable names expected by your existing settings and M-Pesa service code.

Never commit real credentials, passwords, tokens, or private keys to a public repository.

5. Apply database migrations

python manage.py makemigrations
python manage.py migrate

6. Start the development server

python manage.py runserver

The local development server is available at:

http://127.0.0.1:8000/

API Endpoints

Authentication

Method	Endpoint	Purpose
POST	/api/auth/register/	Register a new user
POST	/api/auth/login/	Authenticate a user
POST	/api/token/refresh/	Obtain a new access token

The token refresh endpoint depends on the project’s URL configuration.

Financial Transactions

Method	Endpoint	Purpose
GET	/api/transactions/	List transactions
POST	/api/transactions/	Create a transaction
GET	/api/transactions/{id}/	Retrieve a transaction
PATCH	/api/transactions/{id}/	Update a transaction
DELETE	/api/transactions/{id}/	Delete a transaction

Transaction endpoints use the routes registered by the Django REST Framework router.

Analytics and CSV Import

Method	Endpoint	Purpose
GET	/api/analytics/	Retrieve financial analytics
POST	/api/import-csv/	Import transactions from a CSV file

Analytics currently use the existing regular transaction system. Integration of M-Pesa STK Push payments into these analytics is a planned improvement.

M-Pesa Integration

Method	Endpoint	Purpose
POST	/mpesa/stkpush/	Initiate an STK Push request
POST	/mpesa/callback/	Receive payment callback data from Daraja
GET	/mpesa/transactions/	Retrieve the authenticated user’s M-Pesa transaction history

Protected endpoints require a valid JWT access token in the request’s Authorization header:

Authorization: Bearer <access_token>

The M-Pesa callback endpoint must be accessible to the configured Daraja callback service and should not require the end user’s JWT token.

Testing with Postman

The API can be tested using Postman.

1. Register a user.
2. Log in and obtain access and refresh tokens.
3. Use the access token to test protected endpoints.
4. Create and retrieve financial transactions.
5. Test analytics and CSV import.
6. Initiate an M-Pesa STK Push using the Daraja sandbox configuration.
7. Verify that the payment request is saved in the database.
8. Verify that callback data updates the transaction status.
9. Retrieve the authenticated user’s M-Pesa transaction history.

Expected M-Pesa statuses include:

* PENDING: The payment request has been initiated and is awaiting a final result.
* SUCCESS: The callback confirms successful payment.
* FAILED: The payment request has failed.

A successful STK Push initiation does not by itself guarantee a successful payment. The final status depends on the callback received from Daraja.

Data Integrity

MoneyLeak stores regular financial transactions separately from M-Pesa transaction records.

M-Pesa payment statuses should be used to distinguish completed payments from pending or failed requests. Any future integration between M-Pesa records and analytics must account for duplicate entries to prevent double-counting.

Existing M-Pesa records created before user association was introduced may not automatically appear in an individual user’s filtered history.

Security Considerations

* Keep the .env file private.
* Add .env, .venv/, database files, and Python cache files to .gitignore as appropriate.
* Never publish access tokens, refresh tokens, or Daraja credentials.
* Use environment variables for sensitive configuration.
* Use HTTPS and a publicly reachable callback URL for deployed environments.
* Configure production settings separately from development settings.
* Use the Daraja sandbox for testing before any production integration.

Current Development Status

Implemented and under development:

* User registration and login
* JWT authentication
* Financial transaction API
* Analytics endpoint
* CSV import endpoint
* M-Pesa STK Push initiation
* M-Pesa callback processing
* M-Pesa transaction history
* Postman API testing

Planned improvements:

* Include successful M-Pesa payments in financial analytics.
* Prevent duplicate counting between imported transactions and M-Pesa records.
* Improve transaction categorization and expenditure reporting.
* Expand automated tests for authentication, transaction management, and payment callbacks.
* Prepare production deployment configuration.

Disclaimer

MoneyLeak is a developing financial management project. M-Pesa integration should be tested in the Daraja sandbox before production use. Payment records, callback handling, authentication, and financial calculations should be verified before deployment.

Author

Developed as a personal finance management and software development project.