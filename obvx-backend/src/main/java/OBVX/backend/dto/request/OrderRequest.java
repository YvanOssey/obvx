package OBVX.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OrderRequest(
        @NotEmpty(message = "Le panier est vide")
        @Size(max = 50, message = "Trop d'articles dans le panier")
        List<@Valid Item> items
) {
    public record Item(
            @NotBlank(message = "Produit manquant")
            String productId,

            @NotBlank(message = "Choisis une taille pour chaque article")
            @Size(max = 20, message = "Taille invalide")
            String size,

            @Min(value = 1, message = "Quantité invalide")
            @Max(value = 20, message = "20 exemplaires maximum par article")
            int quantity
    ) {
    }
}
