CREATE TABLE locations (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(40) NOT NULL UNIQUE,
    name            VARCHAR(150) NOT NULL,
    type            VARCHAR(30) NOT NULL,
    address         VARCHAR(255),
    city            VARCHAR(100),
    phone           VARCHAR(50),
    opening_hours   VARCHAR(255),
    services        TEXT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id                 BIGSERIAL PRIMARY KEY,
    email              VARCHAR(255) NOT NULL UNIQUE,
    password_hash      VARCHAR(255) NOT NULL,
    full_name          VARCHAR(255) NOT NULL,
    phone              VARCHAR(50),
    role_code          VARCHAR(50) NOT NULL,
    active             BOOLEAN NOT NULL DEFAULT TRUE,
    home_location_id   BIGINT REFERENCES locations (id),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_locations (
    user_id     BIGINT NOT NULL REFERENCES users (id),
    location_id BIGINT NOT NULL REFERENCES locations (id),
    PRIMARY KEY (user_id, location_id)
);

CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    slug        VARCHAR(80) NOT NULL UNIQUE,
    name        VARCHAR(120) NOT NULL,
    parent_id   BIGINT REFERENCES categories (id),
    description TEXT,
    image_url   TEXT,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE products (
    id                 BIGSERIAL PRIMARY KEY,
    sku                VARCHAR(40) NOT NULL UNIQUE,
    name               VARCHAR(255) NOT NULL,
    description        TEXT,
    specification      TEXT,
    category_id        BIGINT REFERENCES categories (id),
    subcategory_id     BIGINT REFERENCES categories (id),
    brand              VARCHAR(120),
    unit_of_measure    VARCHAR(30) NOT NULL,
    cost_price         NUMERIC(14, 2) NOT NULL,
    retail_price       NUMERIC(14, 2) NOT NULL,
    trade_price        NUMERIC(14, 2),
    promotion_price    NUMERIC(14, 2),
    barcode            VARCHAR(64),
    supplier_code      VARCHAR(64),
    plu                INTEGER UNIQUE,
    minimum_stock      NUMERIC(14, 3) NOT NULL DEFAULT 0,
    reorder_quantity   NUMERIC(14, 3) NOT NULL DEFAULT 0,
    weight_kg          NUMERIC(12, 3),
    length_mm          NUMERIC(12, 2),
    width_mm           NUMERIC(12, 2),
    thickness_mm       NUMERIC(12, 2),
    height_mm          NUMERIC(12, 2),
    active             BOOLEAN NOT NULL DEFAULT TRUE,
    website_visible    BOOLEAN NOT NULL DEFAULT TRUE,
    featured           BOOLEAN NOT NULL DEFAULT FALSE,
    bestseller         BOOLEAN NOT NULL DEFAULT FALSE,
    image_url          TEXT,
    keywords           TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_name ON products (name);
CREATE INDEX idx_products_brand ON products (brand);
CREATE INDEX idx_products_barcode ON products (barcode);

CREATE TABLE product_images (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE stock_balances (
    product_id   BIGINT NOT NULL REFERENCES products (id),
    location_id  BIGINT NOT NULL REFERENCES locations (id),
    quantity     NUMERIC(14, 3) NOT NULL DEFAULT 0,
    reserved     NUMERIC(14, 3) NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, location_id)
);

CREATE TABLE stock_movements (
    id                 BIGSERIAL PRIMARY KEY,
    product_id         BIGINT NOT NULL REFERENCES products (id),
    from_location_id   BIGINT REFERENCES locations (id),
    to_location_id     BIGINT REFERENCES locations (id),
    quantity           NUMERIC(14, 3) NOT NULL,
    movement_type      VARCHAR(40) NOT NULL,
    reference_type     VARCHAR(40),
    reference_id       BIGINT,
    user_id            BIGINT REFERENCES users (id),
    reason             VARCHAR(255),
    notes              TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movements_product ON stock_movements (product_id, created_at DESC);

CREATE TABLE customers (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT UNIQUE REFERENCES users (id),
    account_code    VARCHAR(40) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(20) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(50),
    credit_limit    NUMERIC(14, 2) NOT NULL DEFAULT 0,
    outstanding     NUMERIC(14, 2) NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_addresses (
    id           BIGSERIAL PRIMARY KEY,
    customer_id  BIGINT NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
    label        VARCHAR(80),
    line1        VARCHAR(255) NOT NULL,
    city         VARCHAR(100),
    notes        TEXT,
    is_default   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE quote_requests (
    id                   BIGSERIAL PRIMARY KEY,
    reference            VARCHAR(40) UNIQUE NOT NULL,
    customer_id          BIGINT REFERENCES customers (id),
    customer_name        VARCHAR(255) NOT NULL,
    phone                VARCHAR(50),
    email                VARCHAR(255),
    preferred_location_id BIGINT REFERENCES locations (id),
    fulfilment           VARCHAR(20) NOT NULL,
    delivery_address     TEXT,
    notes                TEXT,
    status               VARCHAR(30) NOT NULL,
    converted_quote_id   BIGINT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quote_request_lines (
    id                BIGSERIAL PRIMARY KEY,
    quote_request_id  BIGINT NOT NULL REFERENCES quote_requests (id) ON DELETE CASCADE,
    product_id        BIGINT NOT NULL REFERENCES products (id),
    quantity          NUMERIC(14, 3) NOT NULL,
    unit_price        NUMERIC(14, 2) NOT NULL
);

CREATE TABLE quotes (
    id            BIGSERIAL PRIMARY KEY,
    reference     VARCHAR(40) UNIQUE NOT NULL,
    customer_id   BIGINT REFERENCES customers (id),
    location_id   BIGINT REFERENCES locations (id),
    status        VARCHAR(30) NOT NULL,
    notes         TEXT,
    subtotal      NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax           NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total         NUMERIC(14, 2) NOT NULL DEFAULT 0,
    valid_until   DATE,
    created_by    BIGINT REFERENCES users (id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quote_lines (
    id          BIGSERIAL PRIMARY KEY,
    quote_id    BIGINT NOT NULL REFERENCES quotes (id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products (id),
    quantity    NUMERIC(14, 3) NOT NULL,
    unit_price  NUMERIC(14, 2) NOT NULL,
    line_total  NUMERIC(14, 2) NOT NULL
);

CREATE TABLE sales_orders (
    id            BIGSERIAL PRIMARY KEY,
    reference     VARCHAR(40) UNIQUE NOT NULL,
    quote_id      BIGINT REFERENCES quotes (id),
    customer_id   BIGINT REFERENCES customers (id),
    location_id   BIGINT REFERENCES locations (id),
    status        VARCHAR(30) NOT NULL,
    fulfilment    VARCHAR(20) NOT NULL,
    delivery_address TEXT,
    notes         TEXT,
    reserved      BOOLEAN NOT NULL DEFAULT FALSE,
    subtotal      NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax           NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total         NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_by    BIGINT REFERENCES users (id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sales_order_lines (
    id              BIGSERIAL PRIMARY KEY,
    sales_order_id  BIGINT NOT NULL REFERENCES sales_orders (id) ON DELETE CASCADE,
    product_id      BIGINT NOT NULL REFERENCES products (id),
    quantity        NUMERIC(14, 3) NOT NULL,
    unit_price      NUMERIC(14, 2) NOT NULL,
    line_total      NUMERIC(14, 2) NOT NULL
);

CREATE TABLE invoices (
    id              BIGSERIAL PRIMARY KEY,
    reference       VARCHAR(40) UNIQUE NOT NULL,
    sales_order_id  BIGINT REFERENCES sales_orders (id),
    customer_id     BIGINT REFERENCES customers (id),
    location_id     BIGINT REFERENCES locations (id),
    status          VARCHAR(30) NOT NULL,
    subtotal        NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax             NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total           NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_lines (
    id          BIGSERIAL PRIMARY KEY,
    invoice_id  BIGINT NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products (id),
    quantity    NUMERIC(14, 3) NOT NULL,
    unit_price  NUMERIC(14, 2) NOT NULL,
    line_total  NUMERIC(14, 2) NOT NULL
);

CREATE TABLE invoice_payments (
    id          BIGSERIAL PRIMARY KEY,
    invoice_id  BIGINT NOT NULL REFERENCES invoices (id),
    method      VARCHAR(30) NOT NULL,
    amount      NUMERIC(14, 2) NOT NULL,
    reference   VARCHAR(80),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by  BIGINT REFERENCES users (id)
);

CREATE TABLE till_sessions (
    id                    BIGSERIAL PRIMARY KEY,
    location_id           BIGINT NOT NULL REFERENCES locations (id),
    cashier_id            BIGINT NOT NULL REFERENCES users (id),
    opened_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at             TIMESTAMPTZ,
    opening_float         NUMERIC(14, 2) NOT NULL,
    expected_cash         NUMERIC(14, 2),
    counted_cash          NUMERIC(14, 2),
    variance              NUMERIC(14, 2),
    variance_reason       VARCHAR(255),
    status                VARCHAR(20) NOT NULL
);

CREATE TABLE pos_sales (
    id              BIGSERIAL PRIMARY KEY,
    receipt_no      VARCHAR(40) UNIQUE NOT NULL,
    till_session_id BIGINT NOT NULL REFERENCES till_sessions (id),
    location_id     BIGINT NOT NULL REFERENCES locations (id),
    cashier_id      BIGINT NOT NULL REFERENCES users (id),
    customer_id     BIGINT REFERENCES customers (id),
    subtotal        NUMERIC(14, 2) NOT NULL,
    discount        NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax             NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total           NUMERIC(14, 2) NOT NULL,
    status          VARCHAR(20) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pos_sale_lines (
    id           BIGSERIAL PRIMARY KEY,
    pos_sale_id  BIGINT NOT NULL REFERENCES pos_sales (id) ON DELETE CASCADE,
    product_id   BIGINT NOT NULL REFERENCES products (id),
    quantity     NUMERIC(14, 3) NOT NULL,
    unit_price   NUMERIC(14, 2) NOT NULL,
    line_total   NUMERIC(14, 2) NOT NULL
);

CREATE TABLE pos_payments (
    id           BIGSERIAL PRIMARY KEY,
    pos_sale_id  BIGINT NOT NULL REFERENCES pos_sales (id) ON DELETE CASCADE,
    method       VARCHAR(30) NOT NULL,
    amount       NUMERIC(14, 2) NOT NULL
);

CREATE TABLE stock_transfers (
    id                   BIGSERIAL PRIMARY KEY,
    reference            VARCHAR(40) UNIQUE NOT NULL,
    from_location_id     BIGINT NOT NULL REFERENCES locations (id),
    to_location_id       BIGINT NOT NULL REFERENCES locations (id),
    truck_id             BIGINT,
    driver_id            BIGINT REFERENCES users (id),
    status               VARCHAR(30) NOT NULL,
    notes                TEXT,
    created_by           BIGINT REFERENCES users (id),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    loaded_at            TIMESTAMPTZ,
    received_at          TIMESTAMPTZ
);

CREATE TABLE stock_transfer_lines (
    id                  BIGSERIAL PRIMARY KEY,
    stock_transfer_id   BIGINT NOT NULL REFERENCES stock_transfers (id) ON DELETE CASCADE,
    product_id          BIGINT NOT NULL REFERENCES products (id),
    requested_qty       NUMERIC(14, 3) NOT NULL,
    loaded_qty          NUMERIC(14, 3),
    received_qty        NUMERIC(14, 3),
    variance_qty        NUMERIC(14, 3)
);

CREATE TABLE trucks (
    id                 BIGSERIAL PRIMARY KEY,
    registration       VARCHAR(40) UNIQUE NOT NULL,
    vehicle_code       VARCHAR(40) UNIQUE NOT NULL,
    make               VARCHAR(80),
    model              VARCHAR(80),
    capacity_kg        NUMERIC(12, 2),
    driver_id          BIGINT REFERENCES users (id),
    location_id        BIGINT REFERENCES locations (id),
    odometer_km        INTEGER NOT NULL DEFAULT 0,
    last_service_km    INTEGER,
    next_service_km    INTEGER,
    last_service_date  DATE,
    next_service_date  DATE,
    licence_expiry     DATE,
    insurance_expiry   DATE,
    status             VARCHAR(30) NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE stock_transfers
    ADD CONSTRAINT fk_transfer_truck FOREIGN KEY (truck_id) REFERENCES trucks (id);

CREATE TABLE trips (
    id                BIGSERIAL PRIMARY KEY,
    reference         VARCHAR(40) UNIQUE NOT NULL,
    truck_id          BIGINT NOT NULL REFERENCES trucks (id),
    driver_id         BIGINT REFERENCES users (id),
    from_location_id  BIGINT REFERENCES locations (id),
    to_location_id    BIGINT REFERENCES locations (id),
    transfer_id       BIGINT REFERENCES stock_transfers (id),
    sales_order_id    BIGINT REFERENCES sales_orders (id),
    trip_type         VARCHAR(30) NOT NULL,
    status            VARCHAR(30) NOT NULL,
    started_at        TIMESTAMPTZ,
    arrived_at        TIMESTAMPTZ,
    delivered_at      TIMESTAMPTZ,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trip_cargo (
    id          BIGSERIAL PRIMARY KEY,
    trip_id     BIGINT NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products (id),
    quantity    NUMERIC(14, 3) NOT NULL
);

CREATE TABLE proof_of_delivery (
    id              BIGSERIAL PRIMARY KEY,
    trip_id         BIGINT NOT NULL REFERENCES trips (id),
    recipient       VARCHAR(255),
    delivered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    driver_id       BIGINT REFERENCES users (id),
    notes           TEXT,
    photo_url       TEXT,
    signature_data  TEXT,
    reference       VARCHAR(80)
);

CREATE TABLE maintenance_records (
    id            BIGSERIAL PRIMARY KEY,
    truck_id      BIGINT NOT NULL REFERENCES trucks (id),
    type          VARCHAR(30) NOT NULL,
    date          DATE NOT NULL,
    odometer_km   INTEGER,
    supplier      VARCHAR(150),
    description   TEXT,
    cost          NUMERIC(14, 2) NOT NULL DEFAULT 0,
    invoice_ref   VARCHAR(80),
    next_service_km INTEGER,
    next_service_date DATE,
    created_by    BIGINT REFERENCES users (id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE timber_cut_jobs (
    id                    BIGSERIAL PRIMARY KEY,
    reference             VARCHAR(40) UNIQUE NOT NULL,
    customer_id           BIGINT REFERENCES customers (id),
    sales_order_id        BIGINT REFERENCES sales_orders (id),
    location_id           BIGINT NOT NULL REFERENCES locations (id),
    source_product_id     BIGINT NOT NULL REFERENCES products (id),
    source_qty            NUMERIC(14, 3) NOT NULL,
    original_length_m     NUMERIC(12, 4) NOT NULL,
    kerf_mm               NUMERIC(10, 3) NOT NULL,
    used_m                NUMERIC(12, 4),
    kerf_total_m          NUMERIC(12, 4),
    offcut_m              NUMERIC(12, 4),
    waste_m               NUMERIC(12, 4),
    utilisation           NUMERIC(8, 4),
    offcut_reusable       BOOLEAN,
    status                VARCHAR(30) NOT NULL,
    operator_id           BIGINT REFERENCES users (id),
    notes                 TEXT,
    created_by            BIGINT REFERENCES users (id),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at          TIMESTAMPTZ
);

CREATE TABLE timber_cut_pieces (
    id          BIGSERIAL PRIMARY KEY,
    job_id      BIGINT NOT NULL REFERENCES timber_cut_jobs (id) ON DELETE CASCADE,
    length_m    NUMERIC(12, 4) NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE suppliers (
    id       BIGSERIAL PRIMARY KEY,
    code     VARCHAR(40) UNIQUE NOT NULL,
    name     VARCHAR(255) NOT NULL,
    phone    VARCHAR(50),
    email    VARCHAR(255),
    active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE purchase_orders (
    id              BIGSERIAL PRIMARY KEY,
    reference       VARCHAR(40) UNIQUE NOT NULL,
    supplier_id     BIGINT NOT NULL REFERENCES suppliers (id),
    location_id     BIGINT NOT NULL REFERENCES locations (id),
    status          VARCHAR(30) NOT NULL,
    expected_date   DATE,
    notes           TEXT,
    created_by      BIGINT REFERENCES users (id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_order_lines (
    id                  BIGSERIAL PRIMARY KEY,
    purchase_order_id   BIGINT NOT NULL REFERENCES purchase_orders (id) ON DELETE CASCADE,
    product_id          BIGINT NOT NULL REFERENCES products (id),
    quantity            NUMERIC(14, 3) NOT NULL,
    unit_cost           NUMERIC(14, 2) NOT NULL,
    received_qty        NUMERIC(14, 3) NOT NULL DEFAULT 0
);

CREATE TABLE goods_receipts (
    id                  BIGSERIAL PRIMARY KEY,
    reference           VARCHAR(40) UNIQUE NOT NULL,
    purchase_order_id   BIGINT NOT NULL REFERENCES purchase_orders (id),
    location_id         BIGINT NOT NULL REFERENCES locations (id),
    received_by         BIGINT REFERENCES users (id),
    received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes               TEXT
);

CREATE TABLE goods_receipt_lines (
    id                 BIGSERIAL PRIMARY KEY,
    goods_receipt_id   BIGINT NOT NULL REFERENCES goods_receipts (id) ON DELETE CASCADE,
    product_id         BIGINT NOT NULL REFERENCES products (id),
    expected_qty       NUMERIC(14, 3) NOT NULL,
    received_qty       NUMERIC(14, 3) NOT NULL,
    variance_qty       NUMERIC(14, 3) NOT NULL
);

CREATE TABLE gl_accounts (
    id        BIGSERIAL PRIMARY KEY,
    code      VARCHAR(20) UNIQUE NOT NULL,
    name      VARCHAR(120) NOT NULL,
    type      VARCHAR(20) NOT NULL,
    parent_id BIGINT REFERENCES gl_accounts (id)
);

CREATE TABLE journals (
    id            BIGSERIAL PRIMARY KEY,
    reference     VARCHAR(40) UNIQUE NOT NULL,
    description   VARCHAR(255) NOT NULL,
    source_type   VARCHAR(40),
    source_id     BIGINT,
    posted        BOOLEAN NOT NULL DEFAULT TRUE,
    reversed      BOOLEAN NOT NULL DEFAULT FALSE,
    reversal_of   BIGINT REFERENCES journals (id),
    created_by    BIGINT REFERENCES users (id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE journal_lines (
    id          BIGSERIAL PRIMARY KEY,
    journal_id  BIGINT NOT NULL REFERENCES journals (id),
    account_id  BIGINT NOT NULL REFERENCES gl_accounts (id),
    debit       NUMERIC(14, 2) NOT NULL DEFAULT 0,
    credit      NUMERIC(14, 2) NOT NULL DEFAULT 0,
    memo        VARCHAR(255)
);

CREATE TABLE audit_logs (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT REFERENCES users (id),
    action        VARCHAR(80) NOT NULL,
    entity        VARCHAR(80) NOT NULL,
    entity_id     VARCHAR(80),
    before_json   TEXT,
    after_json    TEXT,
    location_id   BIGINT REFERENCES locations (id),
    reason        VARCHAR(255),
    session_info  VARCHAR(255),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_logs (entity, entity_id);
CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);

CREATE TABLE product_search_events (
    id          BIGSERIAL PRIMARY KEY,
    query       VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_view_events (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products (id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE system_settings (
    key    VARCHAR(80) PRIMARY KEY,
    value  VARCHAR(255) NOT NULL
);

CREATE TABLE sequences (
    name       VARCHAR(40) PRIMARY KEY,
    seq_value  BIGINT NOT NULL
);
