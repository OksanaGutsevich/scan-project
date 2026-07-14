// src/components/SearchStats.tsx
import type { IntervalPoint } from "../types";

interface SearchStatsProps {
  points: IntervalPoint[];
}

export const SearchStats = ({ points }: SearchStatsProps) => {
  if (!points || points.length === 0) {
    return (
      <div className="container" style={{ marginBottom: "2rem" }}>
        <h3 style={{ margin: 0, fontSize: "18px" }}>Статистика публикаций</h3>
        <p style={{ marginTop: "0.5rem", color: "#666" }}>
          Статистика по периодам недоступна или данных нет.
        </p>
      </div>
    );
  }

  const total = points.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="container" style={{ marginBottom: "2rem" }}>
      <h3 style={{ margin: 0, fontSize: "18px", marginBottom: "1rem" }}>
        Статистика публикаций по периодам
      </h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "1rem",
        }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th
              style={{
                padding: "10px",
                textAlign: "left",
                border: "1px solid #ddd",
              }}
            >
              Период (начало)
            </th>
            <th
              style={{
                padding: "10px",
                textAlign: "right",
                border: "1px solid #ddd",
              }}
            >
              Количество публикаций
            </th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, idx) => (
            <tr
              key={idx}
              style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa" }}
            >
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {new Date(p.date).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </td>
              <td
                style={{
                  padding: "10px",
                  textAlign: "right",
                  border: "1px solid #ddd",
                }}
              >
                {p.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          padding: "12px",
          background: "#eef7ff",
          border: "1px solid #b6d7ff",
          borderRadius: "6px",
          fontWeight: 600,
          color: "#0056b3",
        }}
      >
        Всего публикаций за период: <strong>{total}</strong>
      </div>
    </div>
  );
};
