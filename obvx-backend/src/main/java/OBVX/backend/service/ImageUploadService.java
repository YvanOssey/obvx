package OBVX.backend.service;

import OBVX.backend.exception.ApiException;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

/**
 * Envoi des photos produits vers Cloudinary.
 * Optionnel : sans CLOUDINARY_URL, l'admin peut toujours coller l'adresse d'une image.
 */
@Slf4j
@Service
public class ImageUploadService {

    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final Cloudinary cloudinary;

    public ImageUploadService(@Value("${cloudinary.url:}") String cloudinaryUrl) {
        this.cloudinary = cloudinaryUrl == null || cloudinaryUrl.isBlank() ? null : new Cloudinary(cloudinaryUrl);
    }

    public boolean isEnabled() {
        return cloudinary != null;
    }

    public String upload(MultipartFile file) {
        if (cloudinary == null) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "L'envoi de photos n'est pas configuré (CLOUDINARY_URL). Colle plutôt l'adresse de l'image.");
        }
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Aucun fichier reçu");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Photo trop lourde (5 Mo maximum)");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Format accepté : JPG, PNG ou WebP");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "obvx/products",
                    "resource_type", "image"
            ));
            String url = String.valueOf(result.get("secure_url"));
            // Livraison optimisée : format moderne, qualité auto, 1200 px maximum
            return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,c_limit,w_1200/");
        } catch (IOException | RuntimeException e) {
            log.error("Échec de l'envoi vers Cloudinary", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "L'envoi de la photo a échoué, réessaie");
        }
    }
}
