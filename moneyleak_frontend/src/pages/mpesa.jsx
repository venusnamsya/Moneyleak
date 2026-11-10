import { useState } from "react";
import {
  Smartphone,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";

const sampleTransactions = [
  {
    id: 1,
    receipt: "UJS19BL6JK",
    phone: "2547XXXXXXXX",
    amount: 1000,
    date: "28 Oct 2026",
    status: "SUCCESS",
  },
  {
    id: 2,
    receipt: "Pending",
    phone: "2547XXXXXXXX",
    amount: 500,
    date: "27 Oct 2026",
    status: "PENDING",
  },
  {
    id: 3,
    receipt: "Failed",
    phone: "2547XXXXXXXX",
    amount: 300,
    date: "26 Oct 2026",
    status: "FAILED",
  },
];

function Mpesa() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transactions] = useState(sampleTransactions);

  const successfulTransactions = transactions.filter(
    (item) => item.status === "SUCCESS"
  );

  const totalSpent = successfulTransactions.reduce(
    (total, item) => total + item.amount,
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

    const cleanPhone = phone.replace(/\s+/g, "");

    if (!/^2547\d{8}$/.test(cleanPhone) && !/^2541\d{8}$/.test(cleanPhone)) {
      setMessage("Enter a valid Kenyan number starting with 254.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    // API connection will be added in the integration stage.
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessage(
        "The interface is ready. STK Push will work after we connect your Django API."
      );
    }, 700);
  };

  return (
    <div className="mpesa-page">

      <div className="mpesa-heading">
        <div>
          <h2>M-Pesa Management</h2>
          <p>Monitor your M-Pesa payments and transaction activity.</p>
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
          <strong>KSh {totalSpent.toLocaleString()}</strong>
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
          <strong>
            {transactions.filter((item) => item.status === "PENDING").length}
          </strong>
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
              Use your Kenyan M-Pesa number, including country code 254.
            </small>

            <label>Amount (KSh)</label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />

            {message && (
              <div className="stk-message">
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
                  Preparing...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Request STK Push
                </>
              )}
            </button>

            <p className="stk-disclaimer">
              This form is currently a frontend preview. It does not initiate
              a payment yet.
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
                <strong>Confirm on your phone</strong>
                <p>Approve the payment request on your M-Pesa menu.</p>
              </div>
            </div>

            <div className="mpesa-info-item">
              <span className="info-number">03</span>
              <div>
                <strong>Track the transaction</strong>
                <p>Successful payments can be recorded for financial analysis.</p>
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
        </div>

        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>RECEIPT NUMBER</th>
                <th>PHONE NUMBER</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.receipt}</strong></td>
                  <td>{item.phone}</td>
                  <td>{item.date}</td>
                  <td className="amount-expense">
                    KSh {item.amount.toLocaleString()}
                  </td>
                  <td>
                    <span className={`mpesa-status ${item.status.toLowerCase()}`}>
                      {getStatusIcon(item.status)}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>

    </div>
  );
}

export default Mpesa;