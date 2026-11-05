package OBVX.backend.config;

import OBVX.backend.entity.Product;
import OBVX.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Remplit le catalogue au premier démarrage et complète les produits existants
 * (tailles manquantes, anciennes images PNG/JPG remplacées par les WebP).
 * Les images sont servies par le front, dans public/products/.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProductSeeder implements CommandLineRunner {

    private static final String VETEMENTS = "Vêtements";
    private static final String ACCESSOIRES = "Accessoires";

    /** Tailles proposées : à adapter ici si la grille change. */
    private static final List<String> TAILLES_VETEMENTS = List.of("S", "M", "L", "XL", "XXL");
    private static final List<String> TAILLE_UNIQUE = List.of("Taille unique");

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) {
        List<Product> seed = List.of(
                product("obvx-tee-globe-noir", "T-shirt Globe", VETEMENTS, 15000,
                        "tshirt-noir-standard-face.webp", "tshirt-noir-standard-dos.webp", true),
                product("obvx-tee-globe-blanc", "T-shirt Globe Blanc", VETEMENTS, 15000,
                        "tshirt-blanc-freedom-face.webp", "tshirt-blanc-freedom-dos.webp", true),
                product("obvx-t-shirt-globe", "T-shirt Multiface", VETEMENTS, 9000,
                        "tshirt-blanc-graphic-face.webp", "tshirt-blanc-graphic-dos.webp", false),
                product("obvx-tee-culture", "T-shirt Culture", VETEMENTS, 15000,
                        "tshirt-blanc-street-culture-face.webp", "tshirt-blanc-street-culture-dos.webp", false),
                product("obvx-sac-tote", "T-Shirt pyramid", VETEMENTS, 7000,
                        "tshirt-noir-orbit-face.webp", "tshirt-noir-orbit-dos.webp", true),
                product("obvx-spida-heritage", "Spida OBVX", VETEMENTS, 8500,
                        "tshirt-rose-limite-face.webp", "tshirt-rose-limite-dos.webp", true),
                product("obvx-globe-essence", "Globe Essence", VETEMENTS, 8000,
                        "tshirt-blanc-rose-face.webp", "tshirt-blanc-rose-dos.webp", true),
                product("obvx-sweat-city", "Sweat City", VETEMENTS, 8000,
                        "pull-2.webp", null, false),
                product("obvx-tee-urban", "T-shirt Urban", VETEMENTS, 8000,
                        "tshirt-noir-limite-face.webp", "tshirt-noir-limite-dos.webp", false),
                product("obvx-bonnet-signature", "Casquette Signature", ACCESSOIRES, 8000,
                        "casquette.webp", null, true),
                product("obvx-tee-identity", "T-shirt Identity", VETEMENTS, 8000,
                        "tshirt-blanc-freedom-dos.webp", null, false),
                product("obvx-tee-echo", "T-shirt Echo", VETEMENTS, 8000,
                        "tshirt-noir-standard-dos.webp", null, true),
                product("obvx-sac-commute", "Pyramid OBVX", VETEMENTS, 8000,
                        "tshirt-blanc-street-culture-dos.webp", null, false),
                product("obvx-pull-collective", "Pull Collective", VETEMENTS, 18000,
                        "pull-3.webp", null, true)
        );

        int created = 0;
        int updated = 0;
        for (Product wanted : seed) {
            Product existing = productRepository.findById(wanted.getId()).orElse(null);
            if (existing == null) {
                productRepository.save(wanted);
                created++;
                continue;
            }
            boolean changed = false;
            if (existing.getSizes().isEmpty()) {
                existing.getSizes().addAll(wanted.getSizes());
                changed = true;
            }
            if (isLegacyImage(existing.getImageUrl(), wanted.getImageUrl())) {
                existing.setImageUrl(wanted.getImageUrl());
                existing.setBackImageUrl(wanted.getBackImageUrl());
                changed = true;
            }
            if (changed) {
                productRepository.save(existing);
                updated++;
            }
        }
        if (created + updated > 0) {
            log.info("Catalogue : {} produit(s) ajouté(s), {} mis à jour", created, updated);
        }
    }

    /** Vrai si l'URL actuelle est l'ancienne version PNG/JPG de la même image WebP. */
    private static boolean isLegacyImage(String current, String webp) {
        if (current == null || current.endsWith(".webp")) {
            return false;
        }
        return current.replaceAll("[.](png|jpe?g)$", ".webp").equals(webp);
    }

    private static Product product(String id, String name, String category, int price,
                                   String image, String backImage, boolean isNew) {
        return Product.builder()
                .id(id)
                .name(name)
                .category(category)
                .price(price)
                .imageUrl("/products/" + image)
                .backImageUrl(backImage == null ? null : "/products/" + backImage)
                .newArrival(isNew)
                .sizes(new ArrayList<>(ACCESSOIRES.equals(category) ? TAILLE_UNIQUE : TAILLES_VETEMENTS))
                .build();
    }
}
