import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type {
    Shop as ShopType,
    ShopFormErrors,
    ShopResponse,
} from "../../types/shop.types.ts";

function Shop() {
    const navigate = useNavigate();
    const [shop, setShop] = useState<ShopType | null>(null);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");
    const [description, setDescription] = useState("");
    const [formErrors, setFormErrors] = useState<ShopFormErrors>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/gerant/salon", { replace: true });
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/manager/shop`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then(async (response) => {
                if (response.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    navigate("/connexion?retour=/gerant/salon", {
                        replace: true,
                    });
                    return null;
                }

                if (response.status === 404) {
                    return null;
                }

                if (response.status === 403) {
                    navigate("/acces-interdit", { replace: true });
                    return null;
                }

                if (!response.ok) {
                    throw new Error("Impossible de charger votre salon.");
                }

                return (await response.json()) as ShopResponse;
            })
            .then((result) => {
                if (!result) {
                    return;
                }

                setShop(result.data);
                setName(result.data.name);
                setAddress(result.data.address);
                setPostalCode(result.data.postalCode);
                setCity(result.data.city);
                setDescription(result.data.description ?? "");
            })
            .catch((requestError) => {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Impossible de charger votre salon.",
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [navigate]);

    function validateForm() {
        const errors: ShopFormErrors = {};

        if (!name.trim()) {
            errors.name = "Le nom du salon est obligatoire.";
        } else if (name.trim().length < 2) {
            errors.name = "Le nom doit contenir au moins 2 caractères.";
        }

        if (!address.trim()) {
            errors.address = "L'adresse est obligatoire.";
        } else if (address.trim().length < 2) {
            errors.address = "L'adresse doit contenir au moins 2 caractères.";
        }

        if (!postalCode.trim()) {
            errors.postalCode = "Le code postal est obligatoire.";
        } else if (
            postalCode.trim().length < 2 ||
            postalCode.trim().length > 10
        ) {
            errors.postalCode = "Le code postal est invalide.";
        }

        if (!city.trim()) {
            errors.city = "La ville est obligatoire.";
        }

        if (description.trim().length > 1000) {
            errors.description =
                "La description ne doit pas dépasser 1000 caractères.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/gerant/salon");
            return;
        }

        const isCreation = shop === null;
        setIsSaving(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/manager/shop`,
                {
                    method: isCreation ? "POST" : "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        address: address.trim(),
                        postalCode: postalCode.trim(),
                        city: city.trim(),
                        description: description.trim() || undefined,
                    }),
                },
            );

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate("/connexion?retour=/gerant/salon");
                return;
            }

            if (response.status === 403) {
                navigate("/acces-interdit");
                return;
            }

            if (response.status === 409) {
                setError("Vous possédez déjà un salon.");
                return;
            }

            if (!response.ok) {
                setError("Impossible d'enregistrer le salon.");
                return;
            }

            const result = (await response.json()) as ShopResponse;

            setShop(result.data);
            setName(result.data.name);
            setAddress(result.data.address);
            setPostalCode(result.data.postalCode);
            setCity(result.data.city);
            setDescription(result.data.description ?? "");
            setSuccess(
                isCreation
                    ? "Votre salon a bien été créé."
                    : "Les informations du salon ont bien été enregistrées.",
            );
        } catch {
            setError(
                "Le serveur est indisponible. Veuillez réessayer plus tard.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="shop-page">
            <Header />

            <main className="shop-main">
                <section aria-labelledby="shop-title">
                    <header className="shop-header">
                        <h1 id="shop-title">
                            {shop ? "Mon salon" : "Créer mon salon"}
                        </h1>
                        <p>
                            {shop
                                ? "Informations publiques associées à vos postes."
                                : "Cette étape est nécessaire avant d'ajouter un poste."}
                        </p>

                        {shop && (
                            <a
                                className="button button--secondary"
                                href="/gerant/postes"
                            >
                                Voir mes postes
                            </a>
                        )}
                    </header>

                    {isLoading && <p>Chargement...</p>}

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="form-success" role="status">
                            {success}
                        </p>
                    )}

                    {!isLoading && (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-field">
                                <label htmlFor="shop-name">Nom du salon</label>
                                <input
                                    id="shop-name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    maxLength={120}
                                    autoComplete="organization"
                                    aria-invalid={Boolean(formErrors.name)}
                                    aria-describedby={
                                        formErrors.name
                                            ? "shop-name-error"
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    required
                                />
                                {formErrors.name && (
                                    <p
                                        id="shop-name-error"
                                        className="form-field__error"
                                    >
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="shop-address">Adresse</label>
                                <input
                                    id="shop-address"
                                    name="address"
                                    type="text"
                                    value={address}
                                    maxLength={255}
                                    autoComplete="street-address"
                                    aria-invalid={Boolean(formErrors.address)}
                                    aria-describedby={
                                        formErrors.address
                                            ? "shop-address-error"
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        setAddress(event.target.value)
                                    }
                                    required
                                />
                                {formErrors.address && (
                                    <p
                                        id="shop-address-error"
                                        className="form-field__error"
                                    >
                                        {formErrors.address}
                                    </p>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="shop-postal-code">
                                    Code postal
                                </label>
                                <input
                                    id="shop-postal-code"
                                    name="postalCode"
                                    type="text"
                                    value={postalCode}
                                    maxLength={10}
                                    autoComplete="postal-code"
                                    aria-invalid={Boolean(
                                        formErrors.postalCode,
                                    )}
                                    aria-describedby={
                                        formErrors.postalCode
                                            ? "shop-postal-code-error"
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        setPostalCode(event.target.value)
                                    }
                                    required
                                />
                                {formErrors.postalCode && (
                                    <p
                                        id="shop-postal-code-error"
                                        className="form-field__error"
                                    >
                                        {formErrors.postalCode}
                                    </p>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="shop-city">Ville</label>
                                <input
                                    id="shop-city"
                                    name="city"
                                    type="text"
                                    value={city}
                                    maxLength={120}
                                    autoComplete="address-level2"
                                    aria-invalid={Boolean(formErrors.city)}
                                    aria-describedby={
                                        formErrors.city
                                            ? "shop-city-error"
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        setCity(event.target.value)
                                    }
                                    required
                                />
                                {formErrors.city && (
                                    <p
                                        id="shop-city-error"
                                        className="form-field__error"
                                    >
                                        {formErrors.city}
                                    </p>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="shop-description">
                                    Description
                                </label>
                                <textarea
                                    id="shop-description"
                                    name="description"
                                    value={description}
                                    maxLength={1000}
                                    rows={5}
                                    aria-invalid={Boolean(
                                        formErrors.description,
                                    )}
                                    aria-describedby={
                                        formErrors.description
                                            ? "shop-description-error"
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                />
                                {formErrors.description && (
                                    <p
                                        id="shop-description-error"
                                        className="form-field__error"
                                    >
                                        {formErrors.description}
                                    </p>
                                )}
                            </div>

                            <button
                                className="button button--primary"
                                type="submit"
                                disabled={isSaving}
                            >
                                {isSaving
                                    ? "Enregistrement..."
                                    : shop
                                      ? "Enregistrer les modifications"
                                      : "Créer le salon"}
                            </button>
                        </form>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Shop;
