package OBVX.backend.dto.response;

import OBVX.backend.entity.Product;

import java.util.List;

public record ProductResponse(
        String id,
        String name,
        String category,
        int price,
        String image,
        String backImage,
        boolean isNew,
        List<String> sizes
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getCategory(), p.getPrice(),
                p.getImageUrl(), p.getBackImageUrl(), p.isNewArrival(),
                List.copyOf(p.getSizes())
        );
    }
}
