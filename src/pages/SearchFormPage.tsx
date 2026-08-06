// src/pages/SearchFormPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TonalityOption } from "../types";
import styles from "./SearchFormPage.module.css";
import { Header } from "../components/Header/Header";
import searchImage from "../assets/icons/search.png";
import docImage from "../assets/icons/doc.png";
import docsImage from "../assets/icons/docs.png";

/**
 * Валидация ИНН (10 или 12 цифр) с проверкой контрольных чисел.
 * Возвращает { isValid: true } или { isValid: false, message: "..." }
 */
function validateInn(innRaw: unknown): { isValid: boolean; message?: string } {
  let inn = innRaw;

  if (typeof inn === "number") {
    inn = inn.toString();
  } else if (typeof inn !== "string") {
    return { isValid: false, message: "ИНН пуст" };
  }

  const innStr = inn as string;

  if (!innStr.length) {
    return { isValid: false, message: "ИНН пуст" };
  }

  if (/[^0-9]/.test(innStr)) {
    return { isValid: false, message: "ИНН может состоять только из цифр" };
  }

  if (![10, 12].includes(innStr.length)) {
    return {
      isValid: false,
      message: "ИНН может состоять только из 10 или 12 цифр",
    };
  }

  const checkDigit = (inn: string, coefficients: number[]) => {
    let n = 0;
    for (let i = 0; i < coefficients.length; i++) {
      n += coefficients[i] * parseInt(inn[i], 10);
    }
    return (n % 11) % 10;
  };

  let isValid = false;

  switch (innStr.length) {
    case 10: {
      const n10 = checkDigit(innStr, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
      if (n10 === parseInt(innStr[9], 10)) {
        isValid = true;
      }
      break;
    }
    case 12: {
      const n11 = checkDigit(innStr, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
      const n12 = checkDigit(innStr, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
      if (
        n11 === parseInt(innStr[10], 10) &&
        n12 === parseInt(innStr[11], 10)
      ) {
        isValid = true;
      }
      break;
    }
  }

  if (!isValid) {
    return { isValid: false, message: "Введите корректные данные" };
  }

  return { isValid: true };
}

export function SearchFormPage() {
  const [inn, setInn] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [onlyMainRole, setOnlyMainRole] = useState(true);
  const [onlyWithRiskFactors, setOnlyWithRiskFactors] = useState(false);
  const [tonality, setTonality] = useState<TonalityOption>("any");
  const [limit, setLimit] = useState<string>("");

  // Ошибки
  const [innError, setInnError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInnError(null);
    setLimitError(null);
    setDateError(null);

    // Валидация ИНН
    const innCleanStr = inn.replace(/\D/g, "");
    const innValidation = validateInn(innCleanStr);
    if (!innValidation.isValid) {
      setInnError(innValidation.message ?? "Некорректный ИНН");
      return;
    }

    // Проверка limit
    if (!limit) {
      setLimitError("Обязательное поле");
      return;
    }
    const limitNum = Number(limit);
    if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      setLimitError("Лимит должен быть целым числом от 1 до 1000.");
      return;
    }

    // Валидация дат
    if (!fromDate || !toDate) {
      setDateError("Заполните диапазон дат.");
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (from > now || to > now) {
      setDateError("Даты не могут быть в будущем.");
      return;
    }

    if (from > to) {
      setDateError("Дата начала не может быть позже даты окончания.");
      return;
    }

    const params = new URLSearchParams({
      inn: innCleanStr,
      fromDate,
      toDate,
      onlyMainRole: String(onlyMainRole),
      onlyWithRiskFactors: String(onlyWithRiskFactors),
      tonality,
      limit: String(limitNum),
    });

    // Переход на страницу результатов
    navigate(`/results?${params.toString()}`);
  };

  return (
    <div>
      <div className={styles.containerMain}>
        <Header />
        <div className={styles.textImagesWrapper}>
          <div className={styles.textWrapper}>
            <h1 className={styles.title}>
              Найдите необходимые <br /> данные в пару кликов
            </h1>
            <p className={styles.text}>
              Задайте параметры поиска. <br /> Чем больше заполните, тем точнее
              поиск
            </p>
          </div>

          <div className={styles.imagesWrapper}>
            <img
              src={docImage}
              alt="Картинка сервиса по поиску публикаций"
              className={styles.docImage}
              loading="lazy"
            />
            <img
              src={docsImage}
              alt="Картинка сервиса по поиску публикаций"
              className={styles.docsImage}
              loading="lazy"
            />
          </div>
        </div>
        <div className={styles.container}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formFirst}>
              <div className={styles.wrapper}>
                <div className={styles.wrapperInnTonQuality}>
                  <div className={styles.formField}>
                    <label htmlFor="inn" className={styles.label}>
                      ИНН компании *
                    </label>
                    <input
                      id="inn"
                      type="text"
                      placeholder="10 или 12 цифр (пример 7710137066)"
                      value={inn}
                      onChange={(e) =>
                        setInn(e.target.value.replace(/\D/g, ""))
                      }
                      className={`${styles.input} ${innError ? styles.inputError : ""}`}
                      autoComplete="off"
                    />
                    {innError && (
                      <span className={styles.errorBlock}>{innError}</span>
                    )}
                  </div>

                  <div className={styles.selectLabelWrapper}>
                    <label htmlFor="tonality" className={styles.selectLabel}>
                      Тональность:
                      <div className={styles.selectWrapper}>
                        <select
                          id="tonality"
                          value={tonality}
                          onChange={(e) =>
                            setTonality(e.target.value as TonalityOption)
                          }
                          className={styles.select}
                        >
                          <option value="any">Любая</option>
                          <option value="negative">Негативная</option>
                          <option value="positive">Позитивная</option>
                        </select>
                      </div>
                    </label>
                  </div>

                  {/* Поле limit */}
                  <div className={styles.formField}>
                    <label htmlFor="limit" className={styles.label}>
                      Количество документов в выдаче*
                    </label>
                    <input
                      id="limit"
                      type="number"
                      min={1}
                      max={1000}
                      value={limit}
                      placeholder="От 1 до 1000"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setLimit("");
                          return;
                        }
                        const num = Number(val);
                        if (!Number.isNaN(num)) {
                          setLimit(String(num));
                        }
                      }}
                      className={`${styles.input} ${limitError ? styles.inputError : ""}`}
                    />

                    {limitError && (
                      <span className={styles.errorBlock}>{limitError}</span>
                    )}
                  </div>
                </div>

                <div className={styles.filtersBlock}>
                  <div className={styles.filtersRow}>
                    <label className={styles.customCheckboxLabel}>
                      <input
                        id="onlyMainRole"
                        type="checkbox"
                        checked={onlyMainRole}
                        onChange={(e) => setOnlyMainRole(e.target.checked)}
                        className={styles.nativeCheckbox}
                      />
                      <span className={styles.checkmark}></span>
                      {" Главная роль в публикации"}
                    </label>

                    <label className={styles.customCheckboxLabel}>
                      <input
                        id="onlyWithRiskFactors"
                        type="checkbox"
                        checked={onlyWithRiskFactors}
                        onChange={(e) =>
                          setOnlyWithRiskFactors(e.target.checked)
                        }
                        className={styles.nativeCheckbox}
                      />
                      <span className={styles.checkmark}></span>
                      {" Публикации с риск-факторами"}
                    </label>

                    <label className={styles.checkboxLabelDisable}>
                      <input
                        type="checkbox"
                        disabled
                        className={styles.checkbox}
                      />
                      {" Упоминания в бизнес-контексте"}
                    </label>

                    <label className={styles.checkboxLabelDisable}>
                      <input
                        type="checkbox"
                        disabled
                        className={styles.checkbox}
                      />
                      {"Признак максимальной полноты"}
                    </label>

                    <label className={styles.checkboxLabelDisable}>
                      <input
                        type="checkbox"
                        disabled
                        className={styles.checkbox}
                      />
                      {"Включать технические новости рынков"}
                    </label>

                    <label className={styles.checkboxLabelDisable}>
                      <input
                        type="checkbox"
                        disabled
                        className={styles.checkbox}
                      />
                      {"Включать анонсы и календари"}
                    </label>
                    <label className={styles.checkboxLabelDisable}>
                      <input
                        type="checkbox"
                        disabled
                        className={styles.checkbox}
                      />
                      {"Включать сводки новостей"}
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.wrapperDate}>
                <div>
                  <h3>Диапазон поиска*</h3>
                  <div className={styles.formFieldcontainer}>
                    <div className={styles.formFieldDate}>
                      <label
                        htmlFor="fromDate"
                        className={styles.label}
                      ></label>
                      <input
                        id="fromDate"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        required
                        className={`${styles.inputDate} ${dateError ? styles.inputError : ""}`}
                      />
                    </div>

                    <div className={styles.formFieldDate}>
                      <label htmlFor="toDate" className={styles.label}></label>
                      <input
                        id="toDate"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        required
                        className={`${styles.inputDate} ${dateError ? styles.inputError : ""}`}
                      />
                    </div>
                  </div>

                  {dateError && (
                    <span className={styles.errorBlock}>{dateError}</span>
                  )}
                </div>

                <div className={styles.btnBlock}>
                  <button type="submit" className={styles.btn}>
                    Поиск
                  </button>
                  <span className={styles.important}>
                    Обязательные к заполнению поля*
                  </span>
                </div>
              </div>
            </div>
          </form>
          <img
            src={searchImage}
            alt="Картинка сервиса по поиску публикаций"
            className={styles.mainImage}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export default SearchFormPage;
