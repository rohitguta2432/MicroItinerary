CREATE TABLE trips (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE itinerary_items (
    id UUID PRIMARY KEY,
    trip_id UUID REFERENCES trips(id),
    title VARCHAR(255),
    description TEXT,
    start_time TIMESTAMP,
    day_index INT,
    order_index INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE packing_items (
    id UUID PRIMARY KEY,
    trip_id UUID REFERENCES trips(id),
    name VARCHAR(255),
    is_checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);
