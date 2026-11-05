package OBVX.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private CustomerOrder order;

    // Copie des infos produit au moment de l'achat : le prix du catalogue peut changer ensuite.
    @Column(nullable = false)
    private String productId;

    @Column(nullable = false)
    private String productName;

    private String imageUrl;

    /** Taille choisie (nullable pour les commandes passées avant l'ajout des tailles). */
    @Column(length = 20)
    private String size;

    @Column(nullable = false)
    private Integer unitPrice;

    @Column(nullable = false)
    private Integer quantity;
}
