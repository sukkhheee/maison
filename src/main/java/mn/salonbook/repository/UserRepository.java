package mn.salonbook.repository;

import mn.salonbook.domain.entity.User;
import mn.salonbook.domain.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findFirstByEmailAndRole(String email, Role role);

    Optional<User> findByEmailAndSalonId(String email, Long salonId);

    /**
     * Login lookup. Prefers staff/admin accounts (salon_id IS NOT NULL) over
     * client accounts in the unlikely event the same email exists twice.
     * The ORDER BY puts non-null salon_id first.
     */
    @org.springframework.data.jpa.repository.Query("""
        SELECT u FROM User u
        WHERE LOWER(u.email) = LOWER(:email)
          AND u.enabled = true
        ORDER BY CASE WHEN u.salonId IS NULL THEN 1 ELSE 0 END, u.id ASC
        """)
    java.util.List<User> findLoginCandidatesByEmail(@org.springframework.data.repository.query.Param("email") String email);

    boolean existsByEmailAndRole(String email, Role role);
}
