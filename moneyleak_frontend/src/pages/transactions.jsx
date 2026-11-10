import { useState } from "react";
import { Search, Plus, ArrowUpRight, ArrowDownRight, X } from "lucide-react";

const initialTransactions = [
  { id: 1, description: "Supermarket shopping", category: "Food", date: "2026-11-09", amount: 2500 },
  { id: 2, description: "Monthly allowance", category: "Income", date: "2026-11-08", amount: 15000 },
  { id: 3, description: "Transport", category: "Transport", date: "2026-11-08", amount: 800 },
  { id: 4, description: "Electricity tokens", category: "Bills", date: "2026-11-07", amount: 1200 },
];

function Transactions() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    description: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    amount: "",
  });

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || transaction.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleAddTransaction = (event) => {
    event.preventDefault();

    if (!form.description.trim() || !form.amount || Number(form.amount) <= 0) {
      return;
    }

    setTransactions([
      {
        ...form,
        id: Date.now(),
        amount: Number(form.amount),
      },
      ...transactions,
    ]);

    setForm({
      description: "",
      category: "Food",
      date: new Date().toISOString().slice(0, 10),
      amount: "",
    });

    setShowForm(false);
  };

  return (
    <div className="transactions-page">

      <div className="transactions-heading">
        <div>
          <h2>All Transactions</h2>
          <p>Keep track of every shilling coming in and going out.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={17} /> Add Transaction
        </button>
      </div>

      <div className="transaction-summary">
        <div className="transaction-summary-card">
          <span>Total Transactions</span>
          <strong>{transactions.length}</strong>
        </div>

        <div className="transaction-summary-card">
          <span>Total Income</span>
          <strong className="summary-income">
            KSh {transactions
              .filter((item) => item.category === "Income")
              .reduce((sum, item) => sum + item.amount, 0)
              .toLocaleString()}
          </strong>
        </div>

        <div className="transaction-summary-card">
          <span>Total Expenses</span>
          <strong>
            KSh {transactions
              .filter((item) => item.category !== "Income")
              .reduce((sum, item) => sum + item.amount, 0)
              .toLocaleString()}
          </strong>
        </div>
      </div>

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
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Income">Income</option>
            <option value="Other">Other</option>
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
              {filteredTransactions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="transaction-name">
                      <div className={`transaction-icon ${item.category === "Income" ? "income" : "expense"}`}>
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

                  <td className={item.category === "Income" ? "amount-income" : "amount-expense"}>
                    {item.category === "Income" ? "+" : "-"}KSh{" "}
                    {item.amount.toLocaleString()}
                  </td>

                  <td>
                    <span className={item.category === "Income" ? "status-completed" : "transaction-type-expense"}>
                      {item.category === "Income" ? "Income" : "Expense"}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
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
                  setForm({ ...form, description: event.target.value })
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
                  setForm({ ...form, amount: event.target.value })
                }
                required
              />

              <label>Category</label>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Education</option>
                <option>Health</option>
                <option>Entertainment</option>
                <option>Income</option>
                <option>Other</option>
              </select>

              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  Save Transaction
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