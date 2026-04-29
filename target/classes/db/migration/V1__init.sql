-- =========================================================================
-- V1: Initial schema for the multi-tenant salon booking system.
--
-- Generated to match JPA entities under mn.salonbook.domain.entity.* exactly,
-- so spring.jpa.hibernate.ddl-auto can be flipped from "update" to "validate"
-- without complaints. New schema changes go in V2__*.sql, V3__*.sql, etc.
-- Never edit this file once it has been applied to a real environment.
-- =========================================================================

CREATE TABLE salons (
    id              BIGSERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL,
    version         BIGINT      NOT NULL,
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    email           VARCHAR(200),
    phone           VARCHAR(32),
    address         VARCHAR(500),
    timezone        VARCHAR(64)  NOT NULL,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_salons_slug UNIQUE (slug)
);
CREATE INDEX idx_salons_active ON salons(active);

-- =========================================================================
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL,
    version         BIGINT      NOT NULL,
    email           VARCHAR(200) NOT NULL,
    password_hash   VARCHAR(100) NOT NULL,
    full_name       VARCHAR(200) NOT NULL,
    phone           VARCHAR(32),
    role            VARCHAR(32)  NOT NULL,
    salon_id        BIGINT,
    enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_users_email_salon UNIQUE (email, salon_id)
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_salon ON users(salon_id);
CREATE INDEX idx_users_role  ON users(role);

-- =========================================================================
CREATE TABLE staff (
    id              BIGSERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL,
    version         BIGINT      NOT NULL,
    salon_id        BIGINT       NOT NULL,
    external_id     VARCHAR(64),
    display_name    VARCHAR(200) NOT NULL,
    title           VARCHAR(200),
    bio             VARCHAR(1000),
    avatar_url      VARCHAR(500),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    user_id         BIGINT       NOT NULL,
    CONSTRAINT uk_staff_user                 UNIQUE (user_id),
    CONSTRAINT uk_staff_external_id_salon    UNIQUE (external_id, salon_id),
    CONSTRAINT fk_staff_user                 FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_staff_salon       ON staff(salon_id);
CREATE INDEX idx_staff_active      ON staff(active);
CREATE INDEX idx_staff_external_id ON staff(external_id);

-- =========================================================================
CREATE TABLE staff_schedules (
    id              BIGSERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL,
    version         BIGINT      NOT NULL,
    salon_id        BIGINT       NOT NULL,
    staff_id        BIGINT       NOT NULL,
    day_of_week     VARCHAR(16)  NOT NULL,
    start_time      TIME         NOT NULL,
    end_time        TIME         NOT NULL,
    CONSTRAINT uk_staff_schedule_slot   UNIQUE (staff_id, day_of_week, start_time),
    CONSTRAINT fk_staff_schedule_staff  FOREIGN KEY (staff_id) REFERENCES staff(id)
);
CREATE INDEX idx_staff_schedule_staff ON staff_schedules(staff_id);
CREATE INDEX idx_staff_schedule_salon ON staff_schedules(salon_id);

-- =========================================================================
CREATE TABLE services (
    id                  BIGSERIAL PRIMARY KEY,
    created_at          TIMESTAMPTZ NOT NULL,
    updated_at          TIMESTAMPTZ NOT NULL,
    version             BIGINT      NOT NULL,
    salon_id            BIGINT       NOT NULL,
    external_id         VARCHAR(64),
    name                VARCHAR(200) NOT NULL,
    description         VARCHAR(1000),
    price               NUMERIC(12, 2) NOT NULL,
    currency            VARCHAR(3)   NOT NULL DEFAULT 'MNT',
    duration_minutes    INTEGER      NOT NULL,
    active              BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_services_external_id_salon UNIQUE (external_id, salon_id)
);
CREATE INDEX idx_services_salon       ON services(salon_id);
CREATE INDEX idx_services_active      ON services(active);
CREATE INDEX idx_services_external_id ON services(external_id);

-- =========================================================================
CREATE TABLE bookings (
    id                          BIGSERIAL PRIMARY KEY,
    created_at                  TIMESTAMPTZ NOT NULL,
    updated_at                  TIMESTAMPTZ NOT NULL,
    version                     BIGINT      NOT NULL,
    salon_id                    BIGINT       NOT NULL,
    staff_id                    BIGINT       NOT NULL,
    client_id                   BIGINT       NOT NULL,
    start_time                  TIMESTAMPTZ  NOT NULL,
    end_time                    TIMESTAMPTZ  NOT NULL,
    status                      VARCHAR(24)  NOT NULL,
    total_price                 NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency                    VARCHAR(3)   NOT NULL DEFAULT 'MNT',
    payment_status              VARCHAR(16)  NOT NULL DEFAULT 'UNPAID',
    notes                       VARCHAR(1000),
    qpay_invoice_id             VARCHAR(64),
    qpay_qr_text                VARCHAR(1024),
    qpay_invoice_created_at     TIMESTAMPTZ,
    qpay_payment_id             VARCHAR(64),
    qpay_paid_at                TIMESTAMPTZ,
    CONSTRAINT fk_booking_staff  FOREIGN KEY (staff_id)  REFERENCES staff(id),
    CONSTRAINT fk_booking_client FOREIGN KEY (client_id) REFERENCES users(id)
);
CREATE INDEX idx_bookings_salon  ON bookings(salon_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);

-- Composite index that powers the conflict-detection query in BookingService.
-- See BookingRepository.findOverlapping — column order matters.
CREATE INDEX idx_bookings_staff_window
    ON bookings(staff_id, start_time, end_time, status);

-- =========================================================================
CREATE TABLE booking_services (
    booking_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    PRIMARY KEY (booking_id, service_id),
    CONSTRAINT fk_booking_services_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
    CONSTRAINT fk_booking_services_service FOREIGN KEY (service_id) REFERENCES services(id)
);
CREATE INDEX idx_booking_services_booking ON booking_services(booking_id);
CREATE INDEX idx_booking_services_service ON booking_services(service_id);
