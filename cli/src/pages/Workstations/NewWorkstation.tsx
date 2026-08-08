import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type {
    CreatedWorkstationResponse,
    WorkstationFormErrors,
} from "../../types/workstation.types.ts";

function NewWorkstation() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [equipment, setEquipment] = useState("");
    const [dailyPrice, setDailyPrice] = useState("");
    const [errors, setErrors] = useState<WorkstationFormErrors>({});
    const [canCreate, setCanCreate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/gerant/postes/nouveau", {
                replace: true,
            });
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/manager/shop`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((response) => {
                if (response.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    navigate("/connexion?retour=/gerant/postes/nouveau", {
                        replace: true,
                    });
                    return;
                }

                if (response.status === 403) {
                    navigate("/acces-interdit", { replace: true });
                    return;
                }

                if (response.status === 404) {
                    navigate("/gerant/salon", { replace: true });
                    return;
                }

                if (!response.ok) {
                    throw new Error();
                }

                setCanCreate(true);
            })
            .catch(() => {
                setErrors({
                    form: "Impossible de vérifier votre salon. Veuillez réessayer plus tard.",
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [navigate]);

    function validateForm() {
        const formErrors: WorkstationFormErrors = {};
        const normalizedPrice = dailyPrice.trim().replace(",", ".");
        const priceNumber = Number(normalizedPrice);

        if (!name.trim()) {
            formErrors.name = "Le nom est obligatoire.";
        } else if (name.trim().length < 2) {
            formErrors.name =
                "Le nom doit contenir au moins 2 caractères.";
        }

        if (description.trim().length > 1000) {
            formErrors.description =
                "La description ne doit pas dépasser 1000 caractères.";
        }

        if (equipment.trim().length > 1000) {
            formErrors.equipment =
                "Les équipements ne doivent pas dépasser 1000 caractères.";
        }

        if (!dailyPrice.trim()) {
            formErrors.dailyPrice = "Le prix est obligatoire.";
        } else if (!Number.isFinite(priceNumber)) {
            formErrors.dailyPrice = "Le prix est invalide.";
        } else if (priceNumber < 0) {
            formErrors.dailyPrice = "Le prix ne peut pas être négatif.";
        } else if (!/^\d+(\.\d{1,2})?$/.test(normalizedPrice)) {
            formErrors.dailyPrice =
                "Le prix doit contenir au maximum 2 décimales.";
        } else if (priceNumber > 999999.99) {
            formErrors.dailyPrice = "Le prix est trop élevé.";
        }

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/gerant/postes/nouveau");
            return;
        }

        const priceNumber = Number(dailyPrice.trim().replace(",", "."));
        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/manager/workstations`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        description: description.trim() || undefined,
                        equipment: equipment.trim() || undefined,
                        dailyPriceCents: Math.round(priceNumber * 100),
                    }),
                },
            );

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate("/connexion?retour=/gerant/postes/nouveau");
                return;
            }

            if (response.status === 403) {
                navigate("/acces-interdit");
                return;
            }

            if (response.status === 409) {
                navigate("/gerant/salon");
                return;
            }

            if (response.status === 400) {
                setErrors({
                    form: "Certaines informations du poste sont invalides.",
                });
                return;
            }

            if (!response.ok) {
                throw new Error();
            }

            const result =
                (await response.json()) as CreatedWorkstationResponse;
            navigate(`/gerant/postes/${result.data.id}`);
        } catch {
            setErrors({
                form: "Impossible de créer le poste. Veuillez réessayer plus tard.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="new-workstation-page">
            <Header />

            <main className="new-workstation-main">
                <a
                    className="new-workstation-back"
                    href="/gerant/postes"
                >
                    ← Retour aux postes
                </a>

                <section
                    className="new-workstation-card"
                    aria-labelledby="new-workstation-title"
                >
                    <header>
                        <h1 id="new-workstation-title">Nouveau poste</h1>
                        <p>
                            Renseignez les informations visibles dans la
                            recherche.
                        </p>
                    </header>

                    {isLoading && <p>Chargement...</p>}

                    {errors.form && (
                        <p className="form-error" role="alert">
                            {errors.form}
                        </p>
                    )}

                    {!isLoading && canCreate && (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-field">
                                <label htmlFor="workstation-name">
                                    Nom du poste
                                </label>
                                <input
                                    id="workstation-name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    maxLength={120}
                                    aria-invalid={Boolean(errors.name)}
                                    aria-describedby={
                                        errors.name
                                            ? "workstation-name-error"
                                            : undefined
                                    }
                                    onChange={(event) => {
                                        setName(event.target.value);
                                        setErrors({
                                            ...errors,
                                            name: undefined,
                                            form: undefined,
                                        });
                                    }}
                                    required
                                />
                                {errors.name && (
                                    <p
                                        id="workstation-name-error"
                                        className="form-field__error"
                                    >
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="workstation-description">
                                    Description
                                </label>
                                <textarea
                                    id="workstation-description"
                                    name="description"
                                    value={description}
                                    maxLength={1000}
                                    rows={5}
                                    aria-invalid={Boolean(errors.description)}
                                    aria-describedby={
                                        errors.description
                                            ? "workstation-description-error"
                                            : undefined
                                    }
                                    onChange={(event) => {
                                        setDescription(event.target.value);
                                        setErrors({
                                            ...errors,
                                            description: undefined,
                                            form: undefined,
                                        });
                                    }}
                                />
                                {errors.description && (
                                    <p
                                        id="workstation-description-error"
                                        className="form-field__error"
                                    >
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="workstation-equipment">
                                    Équipements
                                </label>
                                <textarea
                                    id="workstation-equipment"
                                    name="equipment"
                                    value={equipment}
                                    maxLength={1000}
                                    rows={5}
                                    aria-invalid={Boolean(errors.equipment)}
                                    aria-describedby={
                                        errors.equipment
                                            ? "workstation-equipment-error"
                                            : undefined
                                    }
                                    onChange={(event) => {
                                        setEquipment(event.target.value);
                                        setErrors({
                                            ...errors,
                                            equipment: undefined,
                                            form: undefined,
                                        });
                                    }}
                                />
                                {errors.equipment && (
                                    <p
                                        id="workstation-equipment-error"
                                        className="form-field__error"
                                    >
                                        {errors.equipment}
                                    </p>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="workstation-price">
                                    Prix journalier en euros
                                </label>
                                <input
                                    id="workstation-price"
                                    name="dailyPrice"
                                    type="number"
                                    value={dailyPrice}
                                    min="0"
                                    max="999999.99"
                                    step="0.01"
                                    inputMode="decimal"
                                    aria-invalid={Boolean(errors.dailyPrice)}
                                    aria-describedby={
                                        errors.dailyPrice
                                            ? "workstation-price-error"
                                            : undefined
                                    }
                                    onChange={(event) => {
                                        setDailyPrice(event.target.value);
                                        setErrors({
                                            ...errors,
                                            dailyPrice: undefined,
                                            form: undefined,
                                        });
                                    }}
                                    required
                                />
                                {errors.dailyPrice && (
                                    <p
                                        id="workstation-price-error"
                                        className="form-field__error"
                                    >
                                        {errors.dailyPrice}
                                    </p>
                                )}
                            </div>

                            <div className="new-workstation-actions">
                                <button
                                    className="button button--primary"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Création..."
                                        : "Créer le poste"}
                                </button>
                                <a
                                    className="button button--secondary"
                                    href="/gerant/postes"
                                >
                                    Annuler
                                </a>
                            </div>
                        </form>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default NewWorkstation;
