import { useEffect, useState } from "react";

import {
  Smartphone,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Entertainment",
  "Other",
];

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "Awaiting confirmation";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Mpesa() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      setHistoryLoading(true);

      const response = await api.get("/mpesa/transactions/");

      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("M-Pesa history error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Unable to load M-Pesa transaction history."
      );
      setMessageType("error");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const successfulTransactions = transactions.filter(
    (item) => item.status === "SUCCESS"
  );

  const pendingTransactions = transactions.filter(
    (item) => item.status === "PENDING"
  );

  const totalSpent = successfulTransactions.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const getStatusIcon = (status) => {
    if (status === "SUCCESS") return <CheckCircle2 size={16} />;
    if (status === "PENDING") return <Clock size={16} />;
    return <XCircle size={16} />;
  };

  const handleStkPush = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const cleanPhone = phone.replace(/\s+/g, "");

    if (!/^254[17]\d{8}$/.test(
      cleanPhone.startsWith("0")
        ? `254${cleanPhone.slice(1)}`
        : cleanPhone.length === 9
          ? `254${cleanPhone}`
          : cleanPhone
    )) {
      setMessage("Enter a valid Kenyan M-Pesa phone number.");
      setMessageType("error");
      return;
    }

    if (!amount || Number(amount) < 1 || !Number.isInteger(Number(amount))) {
      setMessage("Enter a valid whole-number amount.");
      setMessageType("error");
      return;
    }

    if (!description.trim()) {
      setMessage("Please describe what this payment is for.");
      setMessageType("error");
      return;
    }

    if (description.trim().length > 255) {
      setMessage("Description cannot exceed 255 characters.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/mpesa/stkpush/", {
        phone: cleanPhone,
        amount: Number(amount),
        category,
        description: description.trim(),
      });

      setMessage(
        response.data.message ||
          "Your STK Push request has been submitted."
      );
      setMessageType("success");

      setPhone("");
      setAmount("");
      setCategory("Food");
      setDescription("");

      await fetchTransactions();
    } catch (error) {
      console.error("STK Push error:", error);

      const errorData = error.response?.data;

      setMessage(
        errorData?.error ||
          errorData?.detail ||
          "Unable to request STK Push. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mpesa-page">

      <div className="mpesa-heading">
        <div>
          <h2>M-Pesa Management</h2>
          <p>
            Monitor your M-Pesa payments and transaction activity.
          </p>
        </div>

        <div className="mpesa-brand">
          <Smartphone size={19} />
          <span>M-PESA</span>
        </div>
      </div>

      <div className="mpesa-summary-grid">

        <div className="mpesa-summary-card">
          <div className="mpesa-summary-icon">
            <Smartphone size={21} />
          </div>
          <span>Total M-Pesa Spending</span>
          <strong>KSh {formatCurrency(totalSpent)}</strong>
          <small>Successful payments</small>
        </div>

        <div className="mpesa-summary-card">
          <div className="mpesa-summary-icon">
            <CheckCircle2 size={21} />
          </div>
          <span>Successful Payments</span>
          <strong>{successfulTransactions.length}</strong>
          <small>Completed transactions</small>
        </div>

        <div className="mpesa-summary-card">
          <div className="mpesa-summary-icon">
            <Clock size={21} />
          </div>
          <span>Pending Payments</span>
          <strong>{pendingTransactions.length}</strong>
          <small>Awaiting confirmation</small>
        </div>

      </div>

      <div className="mpesa-content-grid">

        <section className="dashboard-panel stk-panel">
          <div className="panel-heading">
            <div>
              <h3>STK Push</h3>
              <p>Send a payment request to your phone.</p>
            </div>

            <div className="stk-icon">
              <Send size={19} />
            </div>
          </div>

          <form className="stk-form" onSubmit={handleStkPush}>

            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="2547XXXXXXXX"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />

            <small className="input-hint">
              Use your Kenyan M-Pesa number.
            </small>

            <label>Amount (KSh)</label>
            <input
              type="number"
              min="1"
              max="150000"
              step="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />

            <label>Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label>Payment Description</label>
            <input
              type="text"
              placeholder="e.g. Grocery shopping"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={255}
              required
            />

            <small className="input-hint">
              Describe what the payment is for.
            </small>

            {message && (
              <div className={`stk-message ${messageType}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="primary-button stk-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={17} className="spin-icon" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Request STK Push
                </>
              )}
            </button>

            <p className="stk-disclaimer">
              Only payments confirmed as successful will count as completed
              transactions.
            </p>

          </form>
        </section>

        <section className="dashboard-panel mpesa-info-panel">
          <div className="panel-heading">
            <div>
              <h3>Payment Information</h3>
              <p>How M-Pesa tracking works</p>
            </div>
          </div>

          <div className="mpesa-info-list">

            <div className="mpesa-info-item">
              <span className="info-number">01</span>
              <div>
                <strong>Request payment</strong>
                <p>Enter your phone number and payment amount.</p>
              </div>
            </div>

            <div className="mpesa-info-item">
              <span className="info-number">02</span>
              <div>
                <strong>Classify your payment</strong>
                <p>Select a category and describe the expense.</p>
              </div>
            </div>

            <div className="mpesa-info-item">
              <span className="info-number">03</span>
              <div>
                <strong>Confirm on your phone</strong>
                <p>Approve the payment request on your M-Pesa menu.</p>
              </div>
            </div>

            <div className="mpesa-info-item">
              <span className="info-number">04</span>
              <div>
                <strong>Track the transaction</strong>
                <p>Successful payments are recorded for financial analysis.</p>
              </div>
            </div>

          </div>
        </section>

      </div>

      <section className="dashboard-panel mpesa-history-panel">

        <div className="panel-heading">
          <div>
            <h3>M-Pesa Transaction History</h3>
            <p>Recent payment activity</p>
          </div>

          <button
            type="button"
            className="cancel-button"
            onClick={fetchTransactions}
            disabled={historyLoading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th>CATEGORY</th>
                <th>RECEIPT NUMBER</th>
                <th>PHONE NUMBER</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan="7" className="empty-transactions">
                    Loading M-Pesa transactions...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((item) => (
                  <tr key={item.checkout_request_id}>
                    <td>
                      <strong>
                        {item.description || "M-Pesa payment"}
                      </strong>
                    </td>

                    <td>{item.category || "Other"}</td>

                    <td>
                      <strong>
                        {item.receipt_number || "Pending"}
                      </strong>
                    </td>

                    <td>{item.phone_number}</td>

                    <td>
                      {formatDate(
                        item.transaction_date || item.created_at
                      )}
                    </td>

                    <td className="amount-expense">
                      KSh {formatCurrency(item.amount)}
                    </td>

                    <td>
                      <span
                        className={`mpesa-status ${item.status.toLowerCase()}`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-transactions">
                    No M-Pesa transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </section>

    </div>
  );
}

export default Mpesa;