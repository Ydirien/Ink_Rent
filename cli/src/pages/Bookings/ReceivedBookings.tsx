import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type {
    BookingDecisionStatus,
    BookingStatus,
    ManagerBooking,
    ManagerBookingsResponse,
} from "../../types/booking.types.ts";

const limit = 12;

function ReceivedBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<ManagerBooking[]>([]);
    const [bookingToUpdate, setBookingToUpdate] =
        useState<ManagerBooking | null>(null);
    const [decision, setDecision] =
        useState<BookingDecisionStatus | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/gerant/demandes", {
                replace: true,
            });
            return;
        }

        setIsLoading(true);
        setError("");

        fetch(
            `${import.meta.env.VITE_API_URL}/manager/bookings?page=${page}&limit=${limit}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        )
            .then(async (response) => {
                if (response.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    navigate("/connexion?retour=/gerant/demandes", {
                        replace: true,
                    });
                    return null;
                }

                if (response.status === 403) {
                    navigate("/acces-interdit", { replace: true });
                    return null;
                }

                if (!response.ok) {
                    throw new Error("Impossible de charger les demandes.");
                }

                return (await response.json()) as ManagerBookingsResponse;
            })
            .then((result) => {
                if (result) {
                    setBookings(result.data);
                    setTotal(result.meta.total);
                }
            })
            .catch((requestError) => {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Impossible de charger les demandes.",
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [navigate, page]);

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
    }

    function getStatusLabel(status: BookingStatus) {
        if (status === "PENDING") {
            return "En attente";
        }

        if (status === "CONFIRMED") {
            return "Confirmée";
        }

        if (status === "REJECTED") {
            return "Refusée";
        }

        return "Annulée";
    }

    function askForConfirmation(
        booking: ManagerBooking,
        selectedDecision: BookingDecisionStatus,
    ) {
        setBookingToUpdate(booking);
        setDecision(selectedDecision);
        setError("");
    }

    function cancelDecision() {
        setBookingToUpdate(null);
        setDecision(null);
    }

    async function confirmDecision() {
        if (!bookingToUpdate || !decision) {
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/gerant/demandes");
            return;
        }

        setIsUpdating(true);
        setError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/manager/bookings/${bookingToUpdate.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: decision }),
                },
            );

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate("/connexion?retour=/gerant/demandes");
                return;
            }

            if (response.status === 403) {
                navigate("/acces-interdit");
                return;
            }

            if (response.status === 404) {
                setError("Cette demande est introuvable.");
                cancelDecision();
                return;
            }

            if (response.status === 409) {
                setError("Cette demande a déjà été traitée.");
                cancelDecision();
                return;
            }

            if (!response.ok) {
                throw new Error();
            }

            const newStatus = decision;
            const bookingId = bookingToUpdate.id;

            setBookings((currentBookings) =>
                currentBookings.map((booking) => {
                    if (booking.id !== bookingId) {
                        return booking;
                    }

                    return {
                        ...booking,
                        status: newStatus,
                        availability: {
                            ...booking.availability,
                            status:
                                newStatus === "CONFIRMED" ? "BOOKED" : "OPEN",
                        },
                    };
                }),
            );
            cancelDecision();
        } catch {
            setError(
                "Impossible de traiter la demande. Veuillez réessayer plus tard.",
            );
        } finally {
            setIsUpdating(false);
        }
    }

    const pageCount = Math.ceil(total / limit);

    return (
        <div className="received-bookings-page">
            <Header />

            <main className="received-bookings-main">
                <section aria-labelledby="received-bookings-title">
                    <header className="received-bookings-header">
                        <h1 id="received-bookings-title">Demandes reçues</h1>
                        <p>
                            Les demandes en attente nécessitent votre décision.
                        </p>
                        <a
                            className="button button--secondary"
                            href="/gerant/postes"
                        >
                            Voir mes postes
                        </a>
                    </header>

                    {bookingToUpdate && decision && (
                        <section
                            className="booking-decision"
                            aria-labelledby="booking-decision-title"
                        >
                            <p id="booking-decision-title">
                                {decision === "CONFIRMED"
                                    ? "Accepter"
                                    : "Refuser"}{" "}
                                la demande de{" "}
                                {bookingToUpdate.tattooArtist.user.displayName}{" "}
                                ?
                            </p>
                            <p>
                                {bookingToUpdate.availability.workstation.name} ·{" "}
                                {formatDate(
                                    bookingToUpdate.availability.availableOn,
                                )}
                            </p>
                            <button
                                className="button button--primary"
                                type="button"
                                disabled={isUpdating}
                                onClick={confirmDecision}
                            >
                                {isUpdating
                                    ? "Traitement..."
                                    : decision === "CONFIRMED"
                                      ? "Confirmer l'acceptation"
                                      : "Confirmer le refus"}
                            </button>
                            <button
                                className="button button--secondary"
                                type="button"
                                disabled={isUpdating}
                                onClick={cancelDecision}
                            >
                                Annuler
                            </button>
                        </section>
                    )}

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    {isLoading && <p>Chargement...</p>}

                    {!isLoading && !error && bookings.length === 0 && (
                        <div className="received-bookings-empty">
                            <h2>Aucune demande reçue</h2>
                            <p>
                                Les futures demandes pour vos postes
                                apparaîtront ici.
                            </p>
                            <a
                                className="button button--secondary"
                                href="/gerant/postes"
                            >
                                Voir mes postes
                            </a>
                        </div>
                    )}

                    {!isLoading && bookings.length > 0 && (
                        <div className="received-bookings-list">
                            {bookings.map((booking) => (
                                <article
                                    className="booking-card"
                                    key={booking.id}
                                >
                                    <h2>
                                        {
                                            booking.tattooArtist.user
                                                .displayName
                                        }{" "}
                                        ·{" "}
                                        {booking.availability.workstation.name}
                                    </h2>
                                    <p>
                                        {formatDate(
                                            booking.availability.availableOn,
                                        )}
                                        {booking.message &&
                                            ` · “${booking.message}”`}
                                    </p>

                                    <div className="booking-card__actions">
                                        <span
                                            className={`booking-status booking-status--${booking.status.toLowerCase()}`}
                                        >
                                            {getStatusLabel(booking.status)}
                                        </span>

                                        {booking.status === "PENDING" && (
                                            <>
                                                <button
                                                    className="button button--primary"
                                                    type="button"
                                                    onClick={() =>
                                                        askForConfirmation(
                                                            booking,
                                                            "CONFIRMED",
                                                        )
                                                    }
                                                >
                                                    Accepter
                                                </button>
                                                <button
                                                    className="button button--secondary"
                                                    type="button"
                                                    onClick={() =>
                                                        askForConfirmation(
                                                            booking,
                                                            "REJECTED",
                                                        )
                                                    }
                                                >
                                                    Refuser
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {pageCount > 1 && (
                        <nav
                            className="pagination"
                            aria-label="Pagination des demandes reçues"
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

export default ReceivedBookings;
