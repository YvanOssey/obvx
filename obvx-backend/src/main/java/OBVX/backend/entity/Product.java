package OBVX.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    /** Identifiant lisible utilisé dans les URL (ex. obvx-tee-globe-noir). */
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    /** Prix en FCFA. */
    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private String imageUrl;

    private String backImageUrl;

    @Column(nullable = false)
    private boolean newArrival;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /** Tailles disponibles, dans l'ordre d'affichage (ex. S, M, L, XL ou « Taille unique »). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_sizes", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "position")
    @Column(name = "size", nullable = false, length = 20)
    @Builder.Default
    private List<String> sizes = new ArrayList<>();
}
