package com.microitinerary.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** DTOs for Expense-related operations */
public class ExpenseDtos {

    // Request to create an expense
    public record CreateExpenseRequest(
            UUID paidByUserId,
            String category,
            BigDecimal amount,
            String description,
            LocalDate expenseDate,
            List<UUID> splitAmongUserIds, // If null, split among all members
            List<CustomSplit> customSplits // For custom split amounts
            ) {}

    // Custom split specification
    public record CustomSplit(UUID userId, BigDecimal amount) {}

    // Expense response
    public record ExpenseResponse(
            UUID id,
            UUID tripId,
            UUID paidByUserId,
            String paidByUserName,
            String category,
            BigDecimal amount,
            String description,
            LocalDate expenseDate,
            List<ExpenseSplitResponse> splits) {}

    // Expense split response
    public record ExpenseSplitResponse(
            UUID id, UUID userId, String userName, BigDecimal amount, boolean isSettled) {}

    // Summary of expenses for a trip
    public record TripExpenseSummaryResponse(
            UUID tripId,
            BigDecimal totalExpenses,
            List<CategoryBreakdown> byCategory,
            List<UserBalance> balances,
            List<Settlement> suggestedSettlements) {}

    // Breakdown by category
    public record CategoryBreakdown(String category, BigDecimal amount, double percentage) {}

    // User balance (who owes/is owed)
    public record UserBalance(
            UUID userId,
            String userName,
            BigDecimal totalPaid,
            BigDecimal totalOwed,
            BigDecimal netBalance // Positive = is owed money, Negative = owes money
            ) {}

    // Suggested settlement transaction
    public record Settlement(
            UUID fromUserId,
            String fromUserName,
            UUID toUserId,
            String toUserName,
            BigDecimal amount) {}

    // Request to settle a split
    public record SettleSplitRequest(UUID splitId) {}

    // Batch settle request
    public record BatchSettleRequest(List<UUID> splitIds) {}
}
