// src/pages/SearchFormPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TonalityOption } from "../types";
import styles from "./SearchFormPage.module.css";

export function SearchFormPage() {
  const [inn, setInn] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [onlyMainRole, setOnlyMainRole] = useState(true);
  const [onlyWithRiskFactors, setOnlyWithRiskFactors] = useState(false);
  const [tonality, setTonality] = useState<TonalityOption>("any");
  const [limit, setLimit] = useState<string>("20");

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const innCleanStr = inn.replace(/\D/g, "");
    if (!innCleanStr) {
      alert("Укажите ИНН компании (только цифры).");
      return;
    }

    const limitNum = Number(limit);
    if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      alert("Лимит должен быть целым числом от 1 до 1000.");
      return;
    }

    // Собираем параметры для URL
    const params = new URLSearchParams({
      inn: innCleanStr,
      fromDate: fromDate,
      toDate: toDate,
      onlyMainRole: String(onlyMainRole),
      onlyWithRiskFactors: String(onlyWithRiskFactors),
      tonality,
      limit: String(limitNum),
    });

    // Переход на страницу результатов
    navigate(`/results?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Поиск данных по компании</h1>

      <form onSubmit={handleSubmit} className={styles.gridForm}>
        <div className={styles.formField}>
          <label htmlFor="inn" className={styles.label}>
            ИНН компании *
          </label>
          <input
            id="inn"
            type="text"
            placeholder="Только цифры (например, 7710137066)"
            value={inn}
            onChange={(e) => setInn(e.target.value.replace(/\D/g, ""))}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="fromDate" className={styles.label}>
            С даты *
          </label>
          <input
            id="fromDate"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="toDate" className={styles.label}>
            По дату *
          </label>
          <input
            id="toDate"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="limit" className={styles.label}>
            Количество документов в выдаче (1–1000)*
          </label>
          <input
            id="limit"
            type="number"
            min={1}
            max={1000}
            value={limit}
            placeholder="1–1000"
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setLimit("");
                return;
              }
              const num = Number(val);
              if (!Number.isNaN(num) && num >= 1 && num <= 1000) {
                setLimit(String(num));
              }
            }}
            className={styles.input}
          />
          <small className={styles.hint}>
            Это количество записей, которые будут найдены и доступны для
            подгрузки.
          </small>
        </div>

        <button type="submit" className={styles.btn}>
          Найти и перейти к результатам
        </button>
      </form>

      <div className={styles.filtersBlock}>
        <h3 className={styles.filtersTitle}>Фильтры контекста</h3>
        <div className={styles.filtersRow}>
          <label className={styles.checkboxLabel}>
            <input
              id="onlyMainRole"
              type="checkbox"
              checked={onlyMainRole}
              onChange={(e) => setOnlyMainRole(e.target.checked)}
              className={styles.checkbox}
            />
            {" Главная роль в публикации"}
          </label>

          <label className={styles.checkboxLabel}>
            <input
              id="onlyWithRiskFactors"
              type="checkbox"
              checked={onlyWithRiskFactors}
              onChange={(e) => setOnlyWithRiskFactors(e.target.checked)}
              className={styles.checkbox}
            />
            {" Публикации с риск-факторами"}
          </label>

          <label htmlFor="tonality" className={styles.selectLabel}>
            Тональность:
            <select
              id="tonality"
              value={tonality}
              onChange={(e) => setTonality(e.target.value as TonalityOption)}
              className={styles.select}
            >
              <option value="any">Любая</option>
              <option value="negative">Негативная</option>
              <option value="positive">Позитивная</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export default SearchFormPage;
