# Task 05: User Flow

## 1. End-to-End User Flow Diagram

```mermaid
flowchart TD
    Start([User visits IMovies]) --> Browse[Browse Movies / Search & Filter]
    Browse --> SelectMovie[Select Movie & View Details]
    SelectMovie --> SelectDate[Select Date & Theatre Showtime]
    SelectDate --> SeatMap[Interactive Seat Map: View Available Seats]
    SeatMap --> PickSeats[Select up to 8 Seats & Review Price]

    PickSeats --> AuthCheck{Is User Logged In?}
    AuthCheck -- No --> LoginModal[Login or Quick Register]
    LoginModal --> Checkout
    AuthCheck -- Yes --> Checkout[Proceed to Simulated Checkout]

    Checkout --> ChooseMethod[Choose Payment Method & Simulation Outcome]
    ChooseMethod --> PaymentDecision{Simulate Success or Failure?}

    PaymentDecision -- Simulate Failure --> PayFail[Backend Rejects Payment: No Seats Booked]
    PayFail --> ShowFailMsg[Display Simulated Payment Declined Alert]
    ShowFailMsg --> Checkout

    PaymentDecision -- Simulate Success --> AtomicCheck{Backend Atomic Check: Are Seats Still Free?}
    AtomicCheck -- Conflict (Already Booked) --> ShowConflict[Display 409 Conflict: Seats just taken by another user]
    ShowConflict --> SeatMap

    AtomicCheck -- Seats Available --> BookSuccess[Atomically Reserve Seats & Record Payment]
    BookSuccess --> SocketBroadcast[Socket.IO: Broadcast seats_updated to all clients]
    BookSuccess --> ConfirmPage[Digital Ticket Confirmation Page]

    ConfirmPage --> HistoryPage[View in Booking History]
    HistoryPage --> CancelCheck{Is Show Date in Future?}
    CancelCheck -- Yes --> CancelAction[Customer Clicks 'Cancel Booking']
    CancelAction --> ReleaseSeats[Backend Atomically Releases Seats & Logs Refund]
    ReleaseSeats --> UpdateUI[Status updated to CANCELLED]
    CancelCheck -- No --> PastShow[Cancellation Disabled for Past Shows]
```

## 2. Step-by-Step Flow Description
1. **Discovery**: Customer visits homepage, searches or filters movies by genre and language.
2. **Selection**: Customer clicks a movie to view detailed metadata and upcoming screening slots.
3. **Seat Mapping**: The customer selects a time slot to enter the real-time seat map. Seats are categorized by Silver, Gold, and Platinum.
4. **Authentication Check**: If the user is a guest, they are prompted to sign in with demo credentials or register.
5. **Simulated Payment**: Customer proceeds to the checkout screen and tests either a successful or failed simulated payment.
6. **Confirmation**: Upon successful payment, an atomic reservation is finalized, a digital ticket with unique reference is generated, and a real-time event updates all other viewing clients.
7. **Lifecycle Management**: Customer views tickets in "My Bookings" and can cancel future bookings to release seats back into the pool.
