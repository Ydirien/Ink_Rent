import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type {
    PublicWorkstation,
    PublicWorkstationsResponse,
} from "../../types/workstation.types.ts";

const limit = 12;

function SearchResults() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchCity = searchParams.get("ville")?.trim() ?? "";
    const searchDate = searchParams.get("date") ?? "";
    const minDate = new Date().toISOString().split("T")[0];

    const [city, setCity] = useState(searchCity);
    const [date, setDate] = useState(searchDate);
    const [cityError, setCityError] = useState("");
    const [dateError, setDateError] = useState("");
    const [workstations, setWorkstations] = useState<PublicWorkstation[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setCity(searchCity);
        setDate(searchDate);
    }, [searchCity, searchDate]);

    useEffect(() => {
        if (!searchCity || !searchDate) {
            setWorkstations([]);
            setTotal(0);
            setError("");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError("");
        setWorkstations([]);

        const apiParams = new URLSearchParams({
            city: searchCity,
            date: searchDate,
            page: String(page),
            limit: String(limit),
        });

        fetch(
            `${import.meta.env.VITE_API_URL}/workstations?${apiParams.toString()}`,
        )
            .then(async (response) => {
                if (response.status === 400) {
                    throw new Error("Les critères de recherche sont invalides.");
                }

                if (!response.ok) {
                    throw new Error("La recherche n'a pas pu aboutir.");
                }

                return (await response.json()) as PublicWorkstationsResponse;
            })
            .then((result) => {
                setWorkstations(result.data);
                setTotal(result.meta.total);
            })
            .catch((requestError) => {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "La recherche n'a pas pu aboutir.",
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [page, retryCount, searchCity, searchDate]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        let formIsValid = true;
        setCityError("");
        setDateError("");

        if (!city.trim()) {
            setCityError("La ville est obligatoire.");
            formIsValid = false;
        }

        if (!date) {
            setDateError("La date est obligatoire.");
            formIsValid = false;
        } else if (date < minDate) {
            setDateError("La date ne peut pas être passée.");
            formIsValid = false;
        }

        if (!formIsValid) {
            return;
        }

        const newSearchParams = new URLSearchParams({
            ville: city.trim(),
            date,
        });

        setPage(1);
        navigate(`/recherche?${newSearchParams.toString()}`);
    }

    function formatDate(value: string) {
        const parsedDate = new Date(`${value}T00:00:00.000Z`);

        if (Number.isNaN(parsedDate.getTime())) {
            return value;
        }

        return parsedDate.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
    }

    function formatPrice(priceInCents: number) {
        return (priceInCents / 100).toLocaleString("fr-FR", {
            maximumFractionDigits: 2,
        });
    }

    const hasSearchCriteria = Boolean(searchCity && searchDate);
    const pageCount = Math.ceil(total / limit);

    return (
        <div className="search-results-page">
            <Header />

            <main className="search-results-main">
                <section aria-labelledby="search-results-title">
                    <header className="search-results-header">
                        <h1 id="search-results-title">Postes disponibles</h1>
                        {hasSearchCriteria && (
                            <p>
                                {searchCity} · {formatDate(searchDate)}
                            </p>
                        )}
                        <a
                            className="button button--secondary"
                            href="#search-form"
                        >
                            Modifier les critères
                        </a>
                    </header>

                    <form
                        id="search-form"
                        className="search-results-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className="form-field">
                            <label htmlFor="search-city">Ville</label>
                            <input
                                id="search-city"
                                name="ville"
                                type="text"
                                value={city}
                                maxLength={120}
                                autoComplete="address-level2"
                                aria-invalid={Boolean(cityError)}
                                aria-describedby={
                                    cityError ? "search-city-error" : undefined
                                }
                                onChange={(event) => {
                                    setCity(event.target.value);
                                    setCityError("");
                                }}
                                required
                            />
                            {cityError && (
                                <p
                                    id="search-city-error"
                                    className="form-field__error"
                                >
                                    {cityError}
                                </p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="search-date">Date</label>
                            <input
                                id="search-date"
                                name="date"
                                type="date"
                                value={date}
                                min={minDate}
                                aria-invalid={Boolean(dateError)}
                                aria-describedby={
                                    dateError ? "search-date-error" : undefined
                                }
                                onChange={(event) => {
                                    setDate(event.target.value);
                                    setDateError("");
                                }}
                                required
                            />
                            {dateError && (
                                <p
                                    id="search-date-error"
                                    className="form-field__error"
                                >
                                    {dateError}
                                </p>
                            )}
                        </div>

                        <button
                            className="button button--primary"
                            type="submit"
                        >
                            Rechercher
                        </button>
                    </form>

                    {isLoading && (
                        <div className="search-results-loading" role="status">
                            <p>Chargement</p>
                            <p>Veuillez patienter...</p>
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="search-results-error" role="alert">
                            <h2>La recherche n'a pas pu aboutir</h2>
                            <p>{error} Vos critères sont conservés.</p>
                            <button
                                className="button button--secondary"
                                type="button"
                                onClick={() => setRetryCount(retryCount + 1)}
                            >
                                Réessayer
                            </button>
                        </div>
                    )}

                    {!isLoading &&
                        !error &&
                        hasSearchCriteria &&
                        workstations.length === 0 && (
                            <div className="search-results-empty">
                                <h2>Aucun poste disponible</h2>
                                <p>
                                    Aucun résultat à {searchCity} le{" "}
                                    {formatDate(searchDate)}. Modifiez la ville
                                    ou la date.
                                </p>
                                <a
                                    className="button button--secondary"
                                    href="#search-form"
                                >
                                    Modifier la recherche
                                </a>
                            </div>
                        )}

                    {!isLoading && workstations.length > 0 && (
                        <>
                            <p>
                                {total} poste{total > 1 ? "s" : ""} disponible
                                {total > 1 ? "s" : ""}
                            </p>

                            <div className="search-results-list">
                                {workstations.map((workstation) => (
                                    <article
                                        className="workstation-card"
                                        key={workstation.id}
                                    >
                                        <h2>{workstation.name}</h2>
                                        <p>
                                            {workstation.shop.name} ·{" "}
                                            {workstation.shop.city}
                                        </p>

                                        {workstation.equipment && (
                                            <ul className="workstation-equipment">
                                                {workstation.equipment
                                                    .split(",")
                                                    .map((equipment, index) => (
                                                        <li
                                                            key={`${equipment.trim()}-${index}`}
                                                        >
                                                            {equipment.trim()}
                                                        </li>
                                                    ))}
                                            </ul>
                                        )}

                                        <p>
                                            {formatPrice(
                                                workstation.dailyPriceCents,
                                            )}{" "}
                                            € / jour
                                        </p>
                                        <a
                                            className="button button--secondary"
                                            href={`/postes/${workstation.id}?date=${searchDate}`}
                                        >
                                            Voir le poste
                                        </a>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}

                    {pageCount > 1 && (
                        <nav
                            className="pagination"
                            aria-label="Pagination des résultats"
                        >
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Précédent
                            </button>
                            <span>
                                Page {page} sur {pageCount}
                            </span>
                            <button
                                type="button"
                                disabled={page === pageCount}
                                onClick={() => setPage(page + 1)}
                            >
                                Suivant
                            </button>
                        </nav>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default SearchResults;
