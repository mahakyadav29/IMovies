# Task 02: Entity-Relationship (ER) Diagram

## 1. Overview
The **IMovies** database schema is modeled in MongoDB using Mongoose. The data model utilizes normalized references for principal entities (Users, Movies, Theatres, Shows, Bookings, Payments) combined with embedded sub-documents for fine-grained entities (Show Seats layout) for single-query retrieval performance and atomic updates.

```mermaid
erDiagram
    USER ||--o{ BOOKING : places
    USER ||--o{ PAYMENT : makes
    USER ||--o{ NOTIFICATION : receives
    MOVIE ||--o{ SHOW : scheduled_in
    THEATRE ||--o{ SHOW : hosts
    SHOW ||--|{ SEAT : contains_embedded
    SHOW ||--o{ BOOKING : reserved_for
    BOOKING ||--|| PAYMENT : settled_by

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "customer | admin"
        string phone
        date createdAt
    }

    MOVIE {
        ObjectId _id PK
        string title
        string description
        string[] genre
        string[] language
        number duration
        date releaseDate
        string posterUrl
        string bannerUrl
        number rating
        string[] cast
        string director
        string status "now_showing | coming_soon"
        string certificate
    }

    THEATRE {
        ObjectId _id PK
        string name
        string location
        string address
        number totalScreens
        string[] amenities
    }

    SHOW {
        ObjectId _id PK
        ObjectId movie FK
        ObjectId theatre FK
        string screenName
        string showDate "YYYY-MM-DD"
        string startTime
        number ticketPrice
        boolean isActive
    }

    SEAT {
        ObjectId _id PK
        string seatNumber "e.g. A1, C5, F10"
        string row "A to F"
        number col "1 to 10"
        string type "silver | gold | platinum"
        number price
        boolean isBooked
        ObjectId bookedBy FK
        date bookedAt
    }

    BOOKING {
        ObjectId _id PK
        string bookingReference UK "IM-XXXX-XXXX"
        ObjectId user FK
        ObjectId show FK
        ObjectId movie FK
        ObjectId theatre FK
        string[] selectedSeats
        number totalAmount
        string bookingStatus "confirmed | cancelled | pending"
        string paymentStatus "paid | failed | refunded_simulated"
        ObjectId paymentId FK
        string showDateSnapshot
        string startTimeSnapshot
        date cancelledAt
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId booking FK
        ObjectId user FK
        number amount
        string method "card | upi | netbanking | wallet"
        string transactionReference UK "TXN-SIM-XXXXXXXX"
        string status "success | failed"
        string simulationNote
        date createdAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        string title
        string message
        string type "booking_confirmed | booking_cancelled | payment_failed"
        boolean read
        date createdAt
    }
```

## 2. Key Relationship Explanations
1. **One-to-Many (`USER -> BOOKING`)**: A customer user can hold multiple movie bookings over time.
2. **One-to-Many (`MOVIE -> SHOW`)**: A movie can have multiple screenings across various multiplexes and time slots.
3. **Embedded Composition (`SHOW -> SEAT`)**: Each show contains an embedded array of 60 distinct seats (Rows A to F, Columns 1 to 10). This embedding allows atomic query-and-update checks when submitting a booking reservation.
4. **One-to-One (`BOOKING -> PAYMENT`)**: Every confirmed booking is linked to a simulated payment record storing the transaction reference.
5. **Auditing Snapshots (`showDateSnapshot`, `startTimeSnapshot`)**: Stored directly on `BOOKING` to preserve immutable ticket history even if the underlying show is archived.
