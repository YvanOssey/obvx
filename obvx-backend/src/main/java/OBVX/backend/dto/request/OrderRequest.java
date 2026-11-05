package OBVX.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OrderRequest(
        @NotEmpty(message = "Le panier est vide")
        @Size(max = 50, message = "Trop d'articles dans le panier")
        List<@Valid Item> items,

        @NotBlank(message = "Indique un numéro de téléphone pour la livraison")
        @Pattern(regexp = "^[+]?[0-9 ().-]{8,20}$", message = "Numéro de téléphone invalide")
        String phone,

        @NotBlank(message = "Indique une adresse de livraison")
        @Size(max = 300, message = "Adresse trop longue")
        String address,

        @Size(max = 500, message = "Note trop longue (500 caractères maximum)")
        String note
) {
    public record Item(
            @NotBlank(message = "Produit manquant")
            String productId,

            @NotBlank(message = "Choisis une taille pour chaque article")
            @Size(max = 20, message = "Taille invalide")
            String size,

            @NotNull(message = "Quantité manquante")
            @Min(value = 1, message = "Quantité invalide")
            @Max(value = 20, message = "20 exemplaires maximum par article")
            Integer quantity
    ) {
    }
}
