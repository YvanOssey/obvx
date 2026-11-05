package OBVX.backend.dto.response;

import OBVX.backend.entity.CustomerOrder;

import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        Instant createdAt,
        String status,
        int total,
        List<Item> items
) {
    public record Item(String productId, String name, String image, String size, int unitPrice, int quantity) {
    }

    public static OrderResponse from(CustomerOrder o) {
        return new OrderResponse(
                o.getId(), o.getCreatedAt(), o.getStatus(), o.getTotal(),
                o.getItems().stream()
                        .map(i -> new Item(i.getProductId(), i.getProductName(), i.getImageUrl(),
                                i.getSize(), i.getUnitPrice(), i.getQuantity()))
                        .toList()
        );
    }
}
