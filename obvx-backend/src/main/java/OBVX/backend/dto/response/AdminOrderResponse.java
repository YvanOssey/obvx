package OBVX.backend.dto.response;

import OBVX.backend.entity.CustomerOrder;
import OBVX.backend.entity.User;

import java.time.Instant;
import java.util.List;

/** Commande vue par l'administrateur : avec les coordonnées du client. */
public record AdminOrderResponse(
        Long id,
        Instant createdAt,
        String status,
        int total,
        Customer customer,
        String phone,
        String address,
        String note,
        List<OrderResponse.Item> items
) {
    public record Customer(Long id, String firstName, String lastName, String email) {
    }

    public static AdminOrderResponse from(CustomerOrder o) {
        User u = o.getUser();
        OrderResponse base = OrderResponse.from(o);
        return new AdminOrderResponse(
                o.getId(), o.getCreatedAt(), o.getStatus(), o.getTotal(),
                new Customer(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail()),
                o.getPhone(), o.getAddress(), o.getNote(),
                base.items()
        );
    }
}
