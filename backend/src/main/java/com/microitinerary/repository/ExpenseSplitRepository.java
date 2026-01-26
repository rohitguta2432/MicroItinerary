package com.microitinerary.repository;

import com.microitinerary.domain.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, UUID> {

    List<ExpenseSplit> findByExpenseId(UUID expenseId);

    List<ExpenseSplit> findByUserId(UUID userId);

    List<ExpenseSplit> findByUserIdAndIsSettledFalse(UUID userId);

    // Find all splits for a user in a specific trip
    @Query("SELECT es FROM ExpenseSplit es JOIN Expense e ON es.expenseId = e.id " +
            "WHERE e.tripId = :tripId AND es.userId = :userId")
    List<ExpenseSplit> findByTripIdAndUserId(@Param("tripId") UUID tripId, @Param("userId") UUID userId);

    // Sum unsettled amount owed by a user in a trip
    @Query("SELECT COALESCE(SUM(es.amount), 0) FROM ExpenseSplit es " +
            "JOIN Expense e ON es.expenseId = e.id " +
            "WHERE e.tripId = :tripId AND es.userId = :userId AND es.isSettled = false")
    BigDecimal sumUnsettledByTripIdAndUserId(@Param("tripId") UUID tripId, @Param("userId") UUID userId);

    // Get all splits for a trip
    @Query("SELECT es FROM ExpenseSplit es JOIN Expense e ON es.expenseId = e.id " +
            "WHERE e.tripId = :tripId")
    List<ExpenseSplit> findByTripId(@Param("tripId") UUID tripId);

    // Calculate net balance per user in a trip (paid - owed)
    // Returns: userId, totalPaid, totalOwed
    @Query("SELECT tm.userId, " +
            "COALESCE((SELECT SUM(e.amount) FROM Expense e WHERE e.tripId = :tripId AND e.paidByUserId = tm.userId), 0) as totalPaid, "
            +
            "COALESCE((SELECT SUM(es.amount) FROM ExpenseSplit es JOIN Expense exp ON es.expenseId = exp.id WHERE exp.tripId = :tripId AND es.userId = tm.userId AND es.isSettled = false), 0) as totalOwed "
            +
            "FROM TripMember tm WHERE tm.tripId = :tripId")
    List<Object[]> calculateBalancesByTripId(@Param("tripId") UUID tripId);
}
