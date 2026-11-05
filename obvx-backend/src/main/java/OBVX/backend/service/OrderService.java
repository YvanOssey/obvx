package OBVX.backend.service;

import OBVX.backend.dto.request.OrderRequest;
import OBVX.backend.dto.response.OrderResponse;
import OBVX.backend.entity.CustomerOrder;
import OBVX.backend.entity.OrderItem;
import OBVX.backend.entity.Product;
import OBVX.backend.entity.User;
import OBVX.backend.exception.ApiException;
import OBVX.backend.repository.OrderRepository;
import OBVX.backend.repository.ProductRepository;
import OBVX.backend.repository.UserRepository;
import OBVX.backend.security.AdminAccess;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AdminAccess adminAccess;

    @Transactional
    public OrderResponse create(String email, OrderRequest request) {
        if (adminAccess.isAdmin(email)) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Le compte administrateur ne peut pas passer de commande : utilise un compte client.");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Session expirée, reconnecte-toi"));

        // Regroupe les lignes identiques (même produit, même taille).
        Map<String, OrderRequest.Item> lines = new LinkedHashMap<>();
        for (OrderRequest.Item item : request.items()) {
            String size = item.size().trim();
            lines.merge(item.productId() + "|" + size,
                    new OrderRequest.Item(item.productId(), size, item.quantity()),
                    (a, b) -> new OrderRequest.Item(a.productId(), a.size(), a.quantity() + b.quantity()));
        }

        CustomerOrder order = CustomerOrder.builder()
                .user(user)
                .createdAt(Instant.now())
                .total(0)
                .phone(request.phone().trim())
                .address(request.address().trim())
                .note(request.note() == null || request.note().isBlank() ? null : request.note().trim())
                .build();

        int total = 0;
        for (OrderRequest.Item line : lines.values()) {
            Product product = productRepository.findByIdAndActiveTrue(line.productId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                            "Un article du panier n'est plus disponible"));
            if (!product.getSizes().contains(line.size())) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "La taille " + line.size() + " n'est pas disponible pour " + product.getName());
            }
            if (line.quantity() > 20) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "20 exemplaires maximum par article");
            }

            // Le prix vient toujours de la base, jamais du navigateur.
            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .imageUrl(product.getImageUrl())
                    .size(line.size())
                    .unitPrice(product.getPrice())
                    .quantity(line.quantity())
                    .build());
            total += product.getPrice() * line.quantity();
        }
        order.setTotal(total);

        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> findMine(String email) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(OrderResponse::from)
                .toList();
    }
}
