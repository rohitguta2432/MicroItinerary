CREATE TABLE packing_items (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    trip_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE INDEX idx_packing_items_trip_id ON packing_items(trip_id);
