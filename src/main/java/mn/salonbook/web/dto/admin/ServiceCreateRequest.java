package mn.salonbook.web.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ServiceCreateRequest(
    @NotBlank @Size(max = 200) String name,

    @Size(max = 1000) String description,

    @NotNull @PositiveOrZero BigDecimal price,

    @NotNull @Positive Integer durationMinutes,

    @Size(max = 3) String currency,

    /**
     * Optional URL-safe id used by the public widget. Auto-generated from the
     * name on the server if blank.
     */
    @Size(max = 64)
    @Pattern(regexp = "^$|^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$",
        message = "Slug нь жижиг үсэг, тоо, дунд нь зураас байж болно")
    String externalId,

    Boolean active
) {
}
