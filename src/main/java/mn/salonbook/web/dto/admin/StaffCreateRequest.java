package mn.salonbook.web.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StaffCreateRequest(
    @NotBlank @Size(max = 200) String displayName,
    @Size(max = 200) String title,
    @Size(max = 1000) String bio,
    @Size(max = 500) String avatarUrl,

    /**
     * Email of the User account to attach to this staff. We auto-create a
     * User row with role STAFF if no account exists with this email yet.
     */
    @NotBlank @Email @Size(max = 200) String email,

    @Size(max = 32) String phone
) {
}
