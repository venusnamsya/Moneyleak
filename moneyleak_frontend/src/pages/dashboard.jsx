import { useEffect, useState } from "react";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import StatCard from "../components/statcard";
import api from "../services/api";

const chartColors = [
  "#2D6A63",
  "#82B5A1",
  "#D6A56F",
  "#8A9C91",
  "#C7D2CB",
  "#A5B4A8",
  "#647D72",
  "#C28B62",
  "#9CA3AF",
];

const formatCurrency = (value) =>
  `KSh ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getDate = (value) => {
  if (!value) return null;

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = getDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      const [analyticsResult, transactionsResult] =
        await Promise.allSettled([
          api.get("/api/analytics/"),
          api.get("/api/transactions/"),
        ]);

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value.data);
      } else {
        setError("Unable to load financial summary.");
      }

      if (transactionsResult.status === "fulfilled") {
        const response = transactionsResult.value.data;

        const records = Array.isArray(response)
          ? response
          : response.results || [];

        setTransactions(records);
      } else {
        setError((previous) =>
          previous
            ? `${previous} Unable to load transactions.`
            : "Unable to load transactions."
        );
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  // Build the last six months from actual transaction records.
  const monthlyData = (() => {
    const months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleDateString("en-KE", {
          month: "short",
        }),
        income: 0,
        expenses: 0,
      });
    }

    transactions.forEach((transaction) => {
      const date = getDate(transaction.date);

      if (!date) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = months.find((item) => item.key === key);

      if (!month) return;

      const amount = Number(transaction.amount || 0);

      if (transaction.category === "Income") {
        month.income += amount;
      } else {
        month.expenses += amount;
      }
    });

    return months;
  })();

  const spendingData = (analytics?.spending_by_category || []).map(
    (item) => ({
      name: item.category,
      value: Number(item.total || 0),
    })
  );

  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const dateA = getDate(a.date)?.getTime() || 0;
      const dateB = getDate(b.date)?.getTime() || 0;

      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="dashboard">

      <div className="dashboard-welcome">
        <div>
          <h2>Your finances at a glance</h2>
          <p>
            Track your money, understand your spending and stay in control.
          </p>
        </div>

        <button className="period-button">
          Last 6 months
        </button>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* Financial summary */}

      <div className="stats-grid">
        <StatCard
          title="Total Income"
          amount={
            loading
              ? "Loading..."
              : formatCurrency(analytics?.total_income)
          }
          change="Money received"
          icon={TrendingUp}
          type="positive"
        />

        <StatCard
          title="Total Expenses"
          amount={
            loading
              ? "Loading..."
              : formatCurrency(analytics?.total_expenses)
          }
          change="Money spent"
          icon={TrendingDown}
          type="negative"
        />

        <StatCard
          title="Available Balance"
          amount={
            loading
              ? "Loading..."
              : formatCurrency(analytics?.balance)
          }
          change="Income minus expenses"
          icon={Wallet}
          type="positive"
        />

        <StatCard
          title="M-Pesa Spending"
          amount={
            loading
              ? "Loading..."
              : formatCurrency(analytics?.mpesa_expenses)
          }
          change="Successful payments"
          icon={Smartphone}
          type="neutral"
        />
      </div>

      {/* Charts */}

      <div className="dashboard-charts">

        <section className="dashboard-panel income-panel">
          <div className="panel-heading">
            <div>
              <h3>Income vs Expenses</h3>
              <p>Your monthly financial activity</p>
            </div>

            <button className="icon-button">
              <MoreHorizontal size={21} />
            </button>
          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-income"></i> Income
            </span>
            <span>
              <i className="legend-expenses"></i> Expenses
            </span>
          </div>

          <div className="line-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient
                    id="incomeFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2D6A63"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="#2D6A63"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="expenseFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#D6A56F"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="#D6A56F"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EDF0EC"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#89948F", fontSize: 11 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#89948F", fontSize: 10 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                />

                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#2D6A63"
                  strokeWidth={2.5}
                  fill="url(#incomeFill)"
                />

                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#D6A56F"
                  strokeWidth={2.5}
                  fill="url(#expenseFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-panel spending-panel">
          <div className="panel-heading">
            <div>
              <h3>Spending Breakdown</h3>
              <p>Where your money goes</p>
            </div>
          </div>

          <div className="pie-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {spendingData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="spending-legend">
            {spendingData.map((item, index) => (
              <div
                className="spending-legend-item"
                key={item.name}
              >
                <span>
                  <i
                    style={{
                      backgroundColor:
                        chartColors[index % chartColors.length],
                    }}
                  ></i>
                  {item.name}
                </span>

                <strong>{formatCurrency(item.value)}</strong>
              </div>
            ))}

            {!loading && spendingData.length === 0 && (
              <p>No spending records available yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Recent transactions */}

      <section className="dashboard-panel transactions-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent Transactions</h3>
            <p>Your latest financial activity</p>
          </div>

          <a href="/transactions" className="view-all">
            View all <ArrowUpRight size={15} />
          </a>
        </div>

        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>TRANSACTION</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {recentTransactions.map((transaction) => {
                const isIncome = transaction.category === "Income";
                const amount = Number(transaction.amount || 0);

                return (
                  <tr key={transaction.id}>
                    <td>
                      <div className="transaction-name">
                        <div
                          className={`transaction-icon ${
                            isIncome ? "income" : "expense"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownRight size={17} />
                          ) : (
                            <ArrowUpRight size={17} />
                          )}
                        </div>

                        <strong>{transaction.description}</strong>
                      </div>
                    </td>

                    <td>{transaction.category}</td>

                    <td>{formatDate(transaction.date)}</td>

                    <td
                      className={
                        isIncome
                          ? "amount-income"
                          : "amount-expense"
                      }
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(Math.abs(amount))}
                    </td>

                    <td>
                      <span className="status-completed">
                        Recorded
                      </span>
                    </td>
                  </tr>
                );
              })}

              {!loading && recentTransactions.length === 0 && (
                <tr>
                  <td colSpan="5">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan="5">
                    Loading transactions...
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

export default Dashboard;