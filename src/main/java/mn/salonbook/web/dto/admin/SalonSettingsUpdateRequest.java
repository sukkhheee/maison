package mn.salonbook.web.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SalonSettingsUpdateRequest(
    @NotBlank @Size(max = 200) String name,
    @Email @Size(max = 200) String email,
    @Size(max = 32) String phone,
    @Size(max = 500) String address,
    @NotBlank @Size(max = 64) String timezone
) {
}
