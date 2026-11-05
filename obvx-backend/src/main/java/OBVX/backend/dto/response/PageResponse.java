package OBVX.backend.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/** Page de résultats au format JSON stable (numéro de page à partir de 0). */
public record PageResponse<T>(List<T> items, int page, int totalPages, long totalItems) {

    public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(), page.getTotalPages(), page.getTotalElements()
        );
    }
}
