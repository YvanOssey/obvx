package OBVX.backend.dto.response;

import OBVX.backend.entity.Product;

import java.util.List;

/** Produit vu par l'administrateur : inclut les produits masqués. */
public record AdminProductResponse(
        String id,
        String name,
        String category,
        int price,
        String image,
        String backImage,
        boolean isNew,
        boolean active,
        List<String> sizes
) {
    public static AdminProductResponse from(Product p) {
        return new AdminProductResponse(
                p.getId(), p.getName(), p.getCategory(), p.getPrice(),
                p.getImageUrl(), p.getBackImageUrl(), p.isNewArrival(), p.isActive(),
                List.copyOf(p.getSizes())
        );
    }
}
