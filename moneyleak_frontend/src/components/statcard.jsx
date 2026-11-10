import { TrendingUp, TrendingDown } from "lucide-react";

function StatCard({ title, amount, change, icon: Icon, type = "neutral" }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>

        <div className="stat-card-icon">
          {Icon && <Icon size={21} />}
        </div>
      </div>

      <h2 className="stat-card-amount">{amount}</h2>

      {change && (
        <div className={`stat-card-change ${type}`}>
          {type === "positive" ? (
            <TrendingUp size={15} />
          ) : (
            <TrendingDown size={15} />
          )}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;