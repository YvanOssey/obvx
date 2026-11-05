package OBVX.backend.service;

import OBVX.backend.dto.request.ProductRequest;
import OBVX.backend.dto.response.AdminProductResponse;
import OBVX.backend.entity.Product;
import OBVX.backend.exception.ApiException;
import OBVX.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<AdminProductResponse> findAll() {
        return productRepository.findAllByOrderByNameAsc().stream()
                .map(AdminProductResponse::from)
                .toList();
    }

    @Transactional
    public AdminProductResponse create(ProductRequest request) {
        String id = request.id() == null || request.id().isBlank()
                ? slugify(request.name())
                : request.id();
        if (id.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Impossible de créer un identifiant à partir de ce nom");
        }
        if (productRepository.existsById(id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Un produit utilise déjà l'identifiant « " + id + " »");
        }
        Product product = Product.builder().id(id).build();
        apply(product, request);
        return AdminProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public AdminProductResponse update(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Produit introuvable"));
        apply(product, request);
        return AdminProductResponse.from(product);
    }

    private static void apply(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setCategory(request.category().trim());
        product.setPrice(request.price());
        product.setImageUrl(request.image().trim());
        product.setBackImageUrl(request.backImage() == null || request.backImage().isBlank()
                ? null : request.backImage().trim());
        product.setNewArrival(request.newArrival());
        product.setActive(request.visible());

        // Tailles nettoyées, sans doublon, dans l'ordre saisi
        LinkedHashSet<String> sizes = new LinkedHashSet<>();
        request.sizes().forEach(size -> sizes.add(size.trim()));
        product.setSizes(new ArrayList<>(sizes));
    }

    /** « T-shirt Été Noir » → « t-shirt-ete-noir » */
    static String slugify(String name) {
        String ascii = Normalizer.normalize(name, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        String slug = ascii.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        slug = slug.length() > 50 ? slug.substring(0, 50).replaceAll("-$", "") : slug;
        return slug.isEmpty() ? "" : "obvx-" + slug.replaceFirst("^obvx-", "");
    }
}
