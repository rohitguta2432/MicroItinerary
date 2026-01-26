package com.microitinerary.repository;

import com.microitinerary.domain.Expense;
import com.microitinerary.domain.ExpenseCategory;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByTripId(UUID tripId);

    List<Expense> findByTripIdOrderByExpenseDateDesc(UUID tripId);

    List<Expense> findByTripIdAndCategory(UUID tripId, ExpenseCategory category);

    List<Expense> findByPaidByUserId(UUID userId);

    // Sum all expenses for a trip
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.tripId = :tripId")
    BigDecimal sumByTripId(@Param("tripId") UUID tripId);

    // Sum expenses by category for a trip
    @Query(
            "SELECT e.category, COALESCE(SUM(e.amount), 0) FROM Expense e "
                    + "WHERE e.tripId = :tripId GROUP BY e.category")
    List<Object[]> sumByTripIdGroupByCategory(@Param("tripId") UUID tripId);

    // Sum expenses paid by a user in a trip
    @Query(
            "SELECT COALESCE(SUM(e.amount), 0) FROM Expense e "
                    + "WHERE e.tripId = :tripId AND e.paidByUserId = :userId")
    BigDecimal sumByTripIdAndPaidByUserId(
            @Param("tripId") UUID tripId, @Param("userId") UUID userId);
}
