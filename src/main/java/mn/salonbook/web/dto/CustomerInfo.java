package mn.salonbook.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerInfo(
    @NotBlank @Size(max = 200) String name,
    @NotBlank @Size(max = 32) String phone,
    @Email @Size(max = 200) String email
) {
}
