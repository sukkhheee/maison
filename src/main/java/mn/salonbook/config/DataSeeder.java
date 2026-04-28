package mn.salonbook.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mn.salonbook.domain.entity.Salon;
import mn.salonbook.domain.entity.ServiceItem;
import mn.salonbook.domain.entity.Staff;
import mn.salonbook.domain.entity.StaffSchedule;
import mn.salonbook.domain.entity.User;
import mn.salonbook.domain.enums.Role;
import mn.salonbook.repository.SalonRepository;
import mn.salonbook.repository.ServiceItemRepository;
import mn.salonbook.repository.StaffRepository;
import mn.salonbook.repository.StaffScheduleRepository;
import mn.salonbook.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

/**
 * Seeds a demo salon ("maison") whose staff and service externalIds line up
 * with the frontend mock data, so the booking wizard can talk to a real backend
 * out of the box. Disabled in production via the !prod profile.
 */
@Slf4j
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SalonRepository salonRepo;
    private final UserRepository userRepo;
    private final StaffRepository staffRepo;
    private final StaffScheduleRepository scheduleRepo;
    private final ServiceItemRepository serviceRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (salonRepo.findBySlugAndActiveTrue("maison").isPresent()) {
            log.info("Demo data already present — skipping seed.");
            return;
        }

        Salon salon = salonRepo.save(Salon.builder()
            .name("Maison Salon")
            .slug("maison")
            .email("hello@maison.mn")
            .phone("+97677000000")
            .address("Чингэлтэй, Улаанбаатар")
            .timezone("Asia/Ulaanbaatar")
            .active(true)
            .build());

        seedServices(salon.getId());
        seedStaff(salon.getId());

        log.info("Demo seed complete. Salon slug='maison', id={}", salon.getId());
    }

    private void seedServices(Long salonId) {
        record SeedSvc(String externalId, String name, int min, long price) {}
        List<SeedSvc> svcs = List.of(
            new SeedSvc("svc-signature-cut", "Signature Cut & Style", 75, 95_000),
            new SeedSvc("svc-balayage", "Balayage & Gloss", 180, 380_000),
            new SeedSvc("svc-keratin", "Keratin Restoration", 120, 240_000),
            new SeedSvc("svc-manicure-gel", "Couture Gel Manicure", 60, 65_000),
            new SeedSvc("svc-facial", "Radiance Facial", 75, 180_000),
            new SeedSvc("svc-spa-ritual", "Maison Spa Ritual", 90, 220_000)
        );
        for (SeedSvc s : svcs) {
            ServiceItem si = ServiceItem.builder()
                .externalId(s.externalId())
                .name(s.name())
                .description("Demo service")
                .durationMinutes(s.min())
                .price(BigDecimal.valueOf(s.price()))
                .currency("MNT")
                .active(true)
                .build();
            si.setSalonId(salonId);
            serviceRepo.save(si);
        }
    }

    private void seedStaff(Long salonId) {
        record SeedStaff(String externalId, String displayName, String title, String email) {}
        List<SeedStaff> staffList = List.of(
            new SeedStaff("m-anu", "Анужин", "Senior Stylist", "anu@maison.mn"),
            new SeedStaff("m-bilg", "Билгүүн", "Color Specialist", "bilg@maison.mn"),
            new SeedStaff("m-soyo", "Соёлмаа", "Master Artist", "soyo@maison.mn"),
            new SeedStaff("m-tem", "Тэмүүлэн", "Barber & Cut", "tem@maison.mn"),
            new SeedStaff("m-ode", "Одончимэг", "Nail Artist", "ode@maison.mn"),
            new SeedStaff("m-ulm", "Уламбаяр", "Spa Therapist", "ulm@maison.mn")
        );

        for (SeedStaff sd : staffList) {
            User user = User.builder()
                .email(sd.email())
                .passwordHash(passwordEncoder.encode("demo-password"))
                .fullName(sd.displayName())
                .role(Role.STAFF)
                .salonId(salonId)
                .enabled(true)
                .build();
            user = userRepo.save(user);

            Staff staff = Staff.builder()
                .externalId(sd.externalId())
                .displayName(sd.displayName())
                .title(sd.title())
                .active(true)
                .user(user)
                .build();
            staff.setSalonId(salonId);
            staff = staffRepo.save(staff);

            // Standard hours: Tue–Sun 09:00–20:00, off Monday.
            for (DayOfWeek dow : DayOfWeek.values()) {
                if (dow == DayOfWeek.MONDAY) continue;
                StaffSchedule sch = StaffSchedule.builder()
                    .staff(staff)
                    .dayOfWeek(dow)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(20, 0))
                    .build();
                sch.setSalonId(salonId);
                scheduleRepo.save(sch);
            }
        }
    }
}
