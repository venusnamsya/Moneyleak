import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
} from "lucide-react";

import StatCard from "../components/statcard";
import api from "../services/api";

const colors = [
  "#2D6A63",
  "#82B5A1",
  "#D6A56F",
  "#8A9C91",
  "#C7D2CB",
  "#547F76",
  "#B9A18A",
  "#9AA9A1",
  "#D4C5B5",
];

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPeriodDates(months) {
  const today = new Date();

  const start = new Date(
    today.getFullYear(),
    today.getMonth() - months + 1,
    1
  );

  return {
    startDate: getDateString(start),
    endDate: getDateString(today),
  };
}

function Analytics() {
  const [period, setPeriod] = useState("6");
  const [analyticsData, setAnalyticsData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const { startDate, endDate } = getPeriodDates(
          Number(period)
        );

        const [analyticsResponse, transactionsResponse] =
          await Promise.all([
            api.get("/api/analytics/", {
              params: {
                start_date: startDate,
                end_date: endDate,
              },
            }),

            api.get("/api/transactions/"),
          ]);

        const records = Array.isArray(transactionsResponse.data)
          ? transactionsResponse.data
          : transactionsResponse.data.results || [];

        if (isActive) {
          setAnalyticsData(analyticsResponse.data);
          setTransactions(records);
        }
      } catch (err) {
        console.error("Analytics loading error:", err);

        if (isActive) {
          setError(
            err.response?.data?.detail ||
              "Unable to load analytics. Please try again."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isActive = false;
    };
  }, [period]);

  const totalIncome = Number(analyticsData.total_income || 0);
  const totalExpenses = Number(analyticsData.total_expenses || 0);
  const balance = Number(analyticsData.balance || 0);

  const categoryData = (
    analyticsData.spending_by_category || []
  ).map((item) => ({
    name: item.category,
    value: Number(item.total),
  }));

  const { startDate, endDate } = getPeriodDates(Number(period));

  const filteredTransactions = transactions.filter((item) => {
    return item.date >= startDate && item.date <= endDate;
  });

  const monthlyData = [];

  for (let i = Number(period) - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;

    const monthTransactions = filteredTransactions.filter(
      (item) => item.date?.slice(0, 7) === monthKey
    );

    const income = monthTransactions
      .filter((item) => item.category === "Income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = monthTransactions
      .filter((item) => item.category !== "Income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    monthlyData.push({
      month: date.toLocaleString("en", { month: "short" }),
      income,
      expenses,
    });
  }

  return (
    <div className="analytics-page">

      <div className="analytics-heading">
        <div>
          <h2>Financial Analytics</h2>
          <p>
            Understand your financial habits and spending patterns.
          </p>
        </div>

        <select
          className="category-filter"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
        >
          <option value="1">Last month</option>
          <option value="3">Last 3 months</option>
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
        </select>
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading your financial analytics...</p>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              title="Total Income"
              amount={`KSh ${formatCurrency(totalIncome)}`}
              change="Selected period"
              icon={TrendingUp}
              type="positive"
            />

            <StatCard
              title="Total Expenses"
              amount={`KSh ${formatCurrency(totalExpenses)}`}
              change="Selected period"
              icon={TrendingDown}
              type="negative"
            />

            <StatCard
              title="Net Balance"
              amount={`KSh ${formatCurrency(balance)}`}
              change="Income minus expenses"
              icon={Wallet}
              type="positive"
            />

            <StatCard
              title="Spending Categories"
              amount={categoryData.length}
              change="Categories recorded"
              icon={Activity}
              type="neutral"
            />
          </div>

          <div className="analytics-grid">

            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h3>Monthly Financial Performance</h3>
                  <p>Income compared with expenses</p>
                </div>
              </div>

              <div className="analytics-bar-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barGap={7}>
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
                      tickFormatter={(value) =>
                        `${value / 1000}k`
                      }
                    />

                    <Tooltip
                      formatter={(value) =>
                        `KSh ${formatCurrency(value)}`
                      }
                    />

                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#2D6A63"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      fill="#D6A56F"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h3>Spending by Category</h3>
                  <p>Distribution of your expenses</p>
                </div>
              </div>

              <div className="analytics-pie-chart">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {categoryData.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={colors[index % colors.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) =>
                          `KSh ${formatCurrency(value)}`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No spending data for this period.</p>
                )}
              </div>

              <div className="analytics-category-list">
                {categoryData.map((item, index) => (
                  <div
                    className="analytics-category-item"
                    key={item.name}
                  >
                    <span>
                      <i
                        style={{
                          backgroundColor:
                            colors[index % colors.length],
                        }}
                      ></i>
                      {item.name}
                    </span>

                    <strong>
                      KSh {formatCurrency(item.value)}
                    </strong>
                  </div>
                ))}
              </div>
            </section>

          </div>

          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h3>Financial Overview</h3>
                <p>A summary of your financial position</p>
              </div>
            </div>

            <div className="financial-overview">
              <div>
                <span>Total Income</span>
                <strong className="summary-income">
                  KSh {formatCurrency(totalIncome)}
                </strong>
              </div>

              <div>
                <span>Total Expenses</span>
                <strong>
                  KSh {formatCurrency(totalExpenses)}
                </strong>
              </div>

              <div>
                <span>Remaining Balance</span>
                <strong className="overview-balance">
                  KSh {formatCurrency(balance)}
                </strong>
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  );
}

export default Analytics;