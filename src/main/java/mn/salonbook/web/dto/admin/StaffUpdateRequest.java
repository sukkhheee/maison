package mn.salonbook.web.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StaffUpdateRequest(
    @NotBlank @Size(max = 200) String displayName,
    @Size(max = 200) String title,
    @Size(max = 1000) String bio,
    @Size(max = 500) String avatarUrl,
    @Size(max = 32) String phone,
    @NotNull Boolean active
) {
}
