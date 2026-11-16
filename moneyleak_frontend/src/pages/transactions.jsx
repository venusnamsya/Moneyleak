import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Entertainment",
  "Income",
  "Other",
];

function getToday() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Transactions() {
  const [searchParams] = useSearchParams();

  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const csvInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadErrors, setUploadErrors] = useState([]);

  const [form, setForm] = useState({
    description: "",
    category: "Food",
    date: getToday(),
    amount: "",
  });

  // Fetch transactions from Django.
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/transactions/");

      const records = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setTransactions(records);
    } catch (err) {
      console.error("Fetch transactions error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load transactions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions.
  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch = (item.description || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  // Calculate totals.
  const totalIncome = transactions
    .filter((item) => item.category === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalExpenses = transactions
    .filter((item) => item.category !== "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // Add manual transaction.
  const handleAddTransaction = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.description.trim()) {
      setFormError("Please enter a description.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setFormError("Please enter a valid amount.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/api/transactions/", {
        description: form.description.trim(),
        category: form.category,
        date: form.date,
        amount: form.amount,
      });

      setTransactions((previous) => [
        response.data,
        ...previous,
      ]);

      setForm({
        description: "",
        category: "Food",
        date: getToday(),
        amount: "",
      });

      setShowForm(false);
    } catch (err) {
      console.error(err);

      const data = err.response?.data;

      setFormError(
        data?.description?.[0] ||
        data?.category?.[0] ||
        data?.amount?.[0] ||
        data?.date?.[0] ||
        data?.detail ||
        "Unable to save transaction. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Import CSV into Django.
  const handleCsvImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadMessage("");
    setUploadErrors([]);
    setError("");

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const response = await api.post(
        "/api/import-csv/",
        formData
      );

      const data = response.data;

      setUploadMessage(
        data.message ||
        `Imported ${data.created || 0} transactions.`
      );

      setUploadErrors(data.errors || []);

      if (Number(data.created) > 0) {
        await fetchTransactions();
      }
    } catch (err) {
      console.error("CSV import error:", err);

      const data = err.response?.data;

      setError(
        data?.detail ||
        data?.error ||
        data?.message ||
        "CSV import failed. Please check your file and try again."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="transactions-page">

      {/* PAGE HEADING AND ACTION BUTTONS */}
      <div className="transactions-heading">
        <div>
          <h2>All Transactions</h2>
          <p>
            Keep track of every shilling coming in and going out.
          </p>
        </div>

        <div className="transaction-actions">

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={handleCsvImport}
          />

          <button
            type="button"
            className="cancel-button"
            onClick={() => csvInputRef.current?.click()}
            disabled={uploading}
          >
            <FileSpreadsheet size={17} />
            {uploading ? "Importing..." : "Import CSV"}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setFormError("");
              setShowForm(true);
            }}
          >
            <Plus size={17} /> Add Transaction
          </button>

        </div>
      </div>

      {/* UPLOAD FEEDBACK */}
      {uploadMessage && (
        <p className="success-message">
          {uploadMessage}
        </p>
      )}

      {uploadErrors.length > 0 && (
        <div className="error-message">
          <strong>Rows that could not be imported:</strong>

          <ul>
            {uploadErrors.slice(0, 5).map((item, index) => (
              <li key={index}>
                Row {item.line}: {item.error}
              </li>
            ))}
          </ul>

          {uploadErrors.length > 5 && (
            <p>
              And {uploadErrors.length - 5} more errors.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      {/* TRANSACTION SUMMARY */}
      <div className="transaction-summary">
        <div className="transaction-summary-card">
          <span>Total Transactions</span>
          <strong>{transactions.length}</strong>
        </div>

        <div className="transaction-summary-card">
          <span>Total Income</span>
          <strong className="summary-income">
            KSh {formatCurrency(totalIncome)}
          </strong>
        </div>

        <div className="transaction-summary-card">
          <span>Total Expenses</span>
          <strong>
            KSh {formatCurrency(totalExpenses)}
          </strong>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <section className="dashboard-panel transaction-list-panel">

        <div className="transaction-filters">
          <div className="transaction-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="category-filter"
          >
            <option value="All">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>TYPE</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-transactions">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="transaction-name">
                        <div
                          className={`transaction-icon ${
                            item.category === "Income"
                              ? "income"
                              : "expense"
                          }`}
                        >
                          {item.category === "Income" ? (
                            <ArrowDownRight size={17} />
                          ) : (
                            <ArrowUpRight size={17} />
                          )}
                        </div>

                        <strong>{item.description}</strong>
                      </div>
                    </td>

                    <td>{item.category}</td>
                    <td>{item.date}</td>

                    <td
                      className={
                        item.category === "Income"
                          ? "amount-income"
                          : "amount-expense"
                      }
                    >
                      {item.category === "Income" ? "+" : "-"}KSh{" "}
                      {formatCurrency(item.amount)}
                    </td>

                    <td>
                      <span
                        className={
                          item.category === "Income"
                            ? "status-completed"
                            : "transaction-type-expense"
                        }
                      >
                        {item.category === "Income"
                          ? "Income"
                          : "Expense"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-transactions">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MANUAL TRANSACTION MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="transaction-modal">

            <div className="modal-heading">
              <div>
                <h3>Add Transaction</h3>
                <p>Enter the details of your transaction.</p>
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction}>

              <label>Description</label>
              <input
                type="text"
                placeholder="e.g. Grocery shopping"
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                required
              />

              <label>Amount (KSh)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(event) =>
                  setForm({
                    ...form,
                    amount: event.target.value,
                  })
                }
                required
              />

              <label>Category</label>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
                  })
                }
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    date: event.target.value,
                  })
                }
                required
              />

              {formError && (
                <p className="error-message">{formError}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Transaction"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Transactions;