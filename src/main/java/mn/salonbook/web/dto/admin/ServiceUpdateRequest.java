package mn.salonbook.web.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ServiceUpdateRequest(
    @NotBlank @Size(max = 200) String name,
    @Size(max = 1000) String description,
    @NotNull @PositiveOrZero BigDecimal price,
    @NotNull @Positive Integer durationMinutes,
    @Size(max = 3) String currency,
    @NotNull Boolean active
) {
}
