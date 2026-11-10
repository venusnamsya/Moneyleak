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

const monthlyData = [
  { month: "Jan", income: 45000, expenses: 22000 },
  { month: "Feb", income: 52000, expenses: 28000 },
  { month: "Mar", income: 48000, expenses: 25000 },
  { month: "Apr", income: 61000, expenses: 32000 },
  { month: "May", income: 55000, expenses: 29000 },
  { month: "Jun", income: 68000, expenses: 35000 },
];

const categoryData = [
  { name: "Food", value: 8500 },
  { name: "Transport", value: 5000 },
  { name: "Shopping", value: 6500 },
  { name: "Bills", value: 4000 },
  { name: "Other", value: 3000 },
];

const colors = ["#2D6A63", "#82B5A1", "#D6A56F", "#8A9C91", "#C7D2CB"];

function Analytics() {
  const totalExpenses = categoryData.reduce(
    (total, item) => total + item.value,
    0
  );

  const totalIncome = 68000;
  const balance = totalIncome - totalExpenses;

  return (
    <div className="analytics-page">

      <div className="analytics-heading">
        <div>
          <h2>Financial Analytics</h2>
          <p>Understand your financial habits and spending patterns.</p>
        </div>

        <select className="category-filter" defaultValue="6">
          <option value="1">Last month</option>
          <option value="3">Last 3 months</option>
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
        </select>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Income"
          amount={`KSh ${totalIncome.toLocaleString()}`}
          change="Selected period"
          icon={TrendingUp}
          type="positive"
        />

        <StatCard
          title="Total Expenses"
          amount={`KSh ${totalExpenses.toLocaleString()}`}
          change="Selected period"
          icon={TrendingDown}
          type="negative"
        />

        <StatCard
          title="Net Balance"
          amount={`KSh ${balance.toLocaleString()}`}
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
                  tickFormatter={(value) => `${value / 1000}k`}
                />

                <Tooltip
                  formatter={(value) => `KSh ${value.toLocaleString()}`}
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
                    <Cell key={item.name} fill={colors[index]} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => `KSh ${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="analytics-category-list">
            {categoryData.map((item, index) => (
              <div className="analytics-category-item" key={item.name}>
                <span>
                  <i style={{ backgroundColor: colors[index] }}></i>
                  {item.name}
                </span>

                <strong>
                  KSh {item.value.toLocaleString()}
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
              KSh {totalIncome.toLocaleString()}
            </strong>
          </div>

          <div>
            <span>Total Expenses</span>
            <strong>
              KSh {totalExpenses.toLocaleString()}
            </strong>
          </div>

          <div>
            <span>Remaining Balance</span>
            <strong className="overview-balance">
              KSh {balance.toLocaleString()}
            </strong>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Analytics;