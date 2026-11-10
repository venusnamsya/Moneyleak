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

const monthlyData = [
  { month: "Jan", income: 45000, expenses: 22000 },
  { month: "Feb", income: 52000, expenses: 28000 },
  { month: "Mar", income: 48000, expenses: 25000 },
  { month: "Apr", income: 61000, expenses: 32000 },
  { month: "May", income: 55000, expenses: 29000 },
  { month: "Jun", income: 68000, expenses: 35000 },
];

const spendingData = [
  { name: "Food", value: 8500 },
  { name: "Transport", value: 5000 },
  { name: "Shopping", value: 6500 },
  { name: "Bills", value: 4000 },
  { name: "Other", value: 3000 },
];

const chartColors = ["#2D6A63", "#82B5A1", "#D6A56F", "#8A9C91", "#C7D2CB"];

const recentTransactions = [
  { name: "Supermarket shopping", category: "Food", date: "Today, 10:30 AM", amount: -2500 },
  { name: "Monthly allowance", category: "Income", date: "Yesterday", amount: 15000 },
  { name: "Transport", category: "Transport", date: "Yesterday", amount: -800 },
  { name: "Electricity token", category: "Bills", date: "24 Oct 2026", amount: -1200 },
];

function Dashboard() {
  return (
    <div className="dashboard">

      <div className="dashboard-welcome">
        <div>
          <h2>Your finances at a glance</h2>
          <p>Track your money, understand your spending and stay in control.</p>
        </div>

        <button className="period-button">Last 6 months</button>
      </div>

      {/* Financial summary */}

      <div className="stats-grid">
        <StatCard
          title="Total Income"
          amount="KSh 68,000"
          change="Money received"
          icon={TrendingUp}
          type="positive"
        />

        <StatCard
          title="Total Expenses"
          amount="KSh 35,000"
          change="Money spent"
          icon={TrendingDown}
          type="negative"
        />

        <StatCard
          title="Available Balance"
          amount="KSh 33,000"
          change="Income minus expenses"
          icon={Wallet}
          type="positive"
        />

        <StatCard
          title="M-Pesa Spending"
          amount="KSh 12,500"
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
            <span><i className="legend-income"></i> Income</span>
            <span><i className="legend-expenses"></i> Expenses</span>
          </div>

          <div className="line-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D6A63" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#2D6A63" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D6A56F" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#D6A56F" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0EC" />

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
                  formatter={(value) => `KSh ${value.toLocaleString()}`}
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
                    <Cell key={entry.name} fill={chartColors[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="spending-legend">
            {spendingData.map((item, index) => (
              <div className="spending-legend-item" key={item.name}>
                <span>
                  <i style={{ backgroundColor: chartColors[index] }}></i>
                  {item.name}
                </span>
                <strong>KSh {item.value.toLocaleString()}</strong>
              </div>
            ))}
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
              {recentTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td>
                    <div className="transaction-name">
                      <div className={`transaction-icon ${transaction.amount > 0 ? "income" : "expense"}`}>
                        {transaction.amount > 0 ? (
                          <ArrowDownRight size={17} />
                        ) : (
                          <ArrowUpRight size={17} />
                        )}
                      </div>
                      <strong>{transaction.name}</strong>
                    </div>
                  </td>

                  <td>{transaction.category}</td>
                  <td>{transaction.date}</td>

                  <td className={transaction.amount > 0 ? "amount-income" : "amount-expense"}>
                    {transaction.amount > 0 ? "+" : "-"}KSh{" "}
                    {Math.abs(transaction.amount).toLocaleString()}
                  </td>

                  <td>
                    <span className="status-completed">Completed</span>
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

export default Dashboard;