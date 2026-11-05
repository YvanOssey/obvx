package OBVX.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Création ou modification d'un produit depuis l'espace admin. */
public record ProductRequest(
        // Identifiant utilisé dans l'URL : seulement à la création, généré depuis le nom s'il est vide
        @Pattern(regexp = "^$|^[a-z0-9]+(-[a-z0-9]+)*$",
                message = "Identifiant invalide : lettres minuscules, chiffres et tirets uniquement")
        @Size(max = 60, message = "Identifiant trop long")
        String id,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 80, message = "Nom trop long (80 caractères maximum)")
        String name,

        @NotBlank(message = "La catégorie est obligatoire")
        @Size(max = 40, message = "Catégorie trop longue")
        String category,

        @NotNull(message = "Le prix est obligatoire")
        @Min(value = 0, message = "Le prix ne peut pas être négatif")
        @Max(value = 10_000_000, message = "Prix trop élevé")
        Integer price,

        @NotBlank(message = "Une photo est obligatoire")
        @Size(max = 500, message = "Adresse de photo trop longue")
        String image,

        @Size(max = 500, message = "Adresse de photo trop longue")
        String backImage,

        @NotEmpty(message = "Indique au moins une taille")
        @Size(max = 12, message = "12 tailles maximum")
        List<@NotBlank(message = "Taille vide") @Size(max = 20, message = "Taille trop longue") String> sizes,

        // Facultatifs : « nouveau » faux et « visible » vrai par défaut
        Boolean isNew,

        Boolean active
) {
    public boolean newArrival() {
        return Boolean.TRUE.equals(isNew);
    }

    public boolean visible() {
        return active == null || active;
    }
}
