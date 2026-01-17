CREATE TABLE trips (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    travel_type VARCHAR(50)
);

CREATE TABLE trip_days (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    trip_id UUID NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE activities (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    trip_id UUID NOT NULL,
    day_id UUID NOT NULL,
    time_block VARCHAR(50) NOT NULL,
    sort_order INTEGER NOT NULL,
    place_name VARCHAR(255) NOT NULL,
    notes TEXT,
    duration_minutes INTEGER,
    estimated_cost DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'PLANNED',
    start_time TIME WITHOUT TIME ZONE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (day_id) REFERENCES trip_days(id) ON DELETE CASCADE
);

CREATE TABLE places (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    trip_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    source_url TEXT,
    is_scheduled BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);


CREATE INDEX idx_trips_updated_at ON trips(updated_at);
CREATE INDEX idx_activities_trip_id ON activities(trip_id);
