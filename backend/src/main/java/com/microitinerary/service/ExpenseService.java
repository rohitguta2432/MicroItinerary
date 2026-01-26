package com.microitinerary.service;

import com.microitinerary.domain.*;
import com.microitinerary.dto.ExpenseDtos.*;
import com.microitinerary.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing Expenses with Splitwise-style splitting
 */
@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final TripMemberRepository tripMemberRepository;
    private final UserRepository userRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            ExpenseSplitRepository expenseSplitRepository,
            TripMemberRepository tripMemberRepository,
            UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.tripMemberRepository = tripMemberRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get all expenses for a trip
     */
    public List<ExpenseResponse> getTripExpenses(UUID tripId, UUID userId) {
        if (!isMember(tripId, userId)) {
            return Collections.emptyList();
        }

        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId).stream()
                .map(this::toExpenseResponse)
                .collect(Collectors.toList());
    }

    /**
     * Add a new expense
     */
    @Transactional
    public ExpenseResponse addExpense(UUID tripId, UUID userId, CreateExpenseRequest request) {
        if (!isMember(tripId, userId)) {
            throw new RuntimeException("Not a member of this trip");
        }

        // Create expense
        Expense expense = new Expense(
                tripId,
                request.paidByUserId(),
                ExpenseCategory.valueOf(request.category()),
                request.amount(),
                request.description(),
                request.expenseDate());
        expense = expenseRepository.save(expense);

        // Create splits
        List<UUID> splitAmong = request.splitAmongUserIds();
        if (splitAmong == null || splitAmong.isEmpty()) {
            // Split among all trip members by default
            splitAmong = tripMemberRepository.findByTripId(tripId).stream()
                    .map(TripMember::getUserId)
                    .collect(Collectors.toList());
        }

        if (request.customSplits() != null && !request.customSplits().isEmpty()) {
            // Custom split amounts
            for (CustomSplit customSplit : request.customSplits()) {
                ExpenseSplit split = new ExpenseSplit(expense.getId(), customSplit.userId(), customSplit.amount());
                expenseSplitRepository.save(split);
            }
        } else {
            // Equal split
            BigDecimal splitAmount = request.amount().divide(
                    new BigDecimal(splitAmong.size()), 2, RoundingMode.HALF_UP);

            for (UUID memberId : splitAmong) {
                ExpenseSplit split = new ExpenseSplit(expense.getId(), memberId, splitAmount);
                expenseSplitRepository.save(split);
            }
        }

        return toExpenseResponse(expense);
    }

    /**
     * Get expense summary for a trip (who owes whom)
     */
    public TripExpenseSummaryResponse getTripExpenseSummary(UUID tripId, UUID userId) {
        if (!isMember(tripId, userId)) {
            return null;
        }

        // Get all expenses
        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Category breakdown
        List<Object[]> categoryData = expenseRepository.sumByTripIdGroupByCategory(tripId);
        List<CategoryBreakdown> byCategory = categoryData.stream()
                .map(row -> {
                    ExpenseCategory category = (ExpenseCategory) row[0];
                    BigDecimal amount = (BigDecimal) row[1];
                    double percentage = totalExpenses.compareTo(BigDecimal.ZERO) > 0
                            ? amount.divide(totalExpenses, 4, RoundingMode.HALF_UP).doubleValue() * 100
                            : 0;
                    return new CategoryBreakdown(category.name(), amount, percentage);
                })
                .collect(Collectors.toList());

        // Calculate balances per user
        List<TripMember> members = tripMemberRepository.findByTripId(tripId);
        List<UserBalance> balances = new ArrayList<>();

        for (TripMember member : members) {
            UUID memberId = member.getUserId();
            User user = userRepository.findById(memberId).orElse(null);
            if (user == null)
                continue;

            // Total paid by this user
            BigDecimal totalPaid = expenseRepository.sumByTripIdAndPaidByUserId(tripId, memberId);
            if (totalPaid == null)
                totalPaid = BigDecimal.ZERO;

            // Total owed by this user (sum of their unsettled splits)
            BigDecimal totalOwed = expenseSplitRepository.sumUnsettledByTripIdAndUserId(tripId, memberId);
            if (totalOwed == null)
                totalOwed = BigDecimal.ZERO;

            // Net balance (positive = is owed money, negative = owes money)
            BigDecimal netBalance = totalPaid.subtract(totalOwed);

            balances.add(new UserBalance(
                    memberId,
                    user.getName(),
                    totalPaid,
                    totalOwed,
                    netBalance));
        }

        // Calculate suggested settlements
        List<Settlement> settlements = calculateSettlements(balances);

        return new TripExpenseSummaryResponse(
                tripId,
                totalExpenses,
                byCategory,
                balances,
                settlements);
    }

    /**
     * Settle a split
     */
    @Transactional
    public boolean settleSplit(UUID splitId, UUID userId) {
        return expenseSplitRepository.findById(splitId)
                .map(split -> {
                    // Verify user has access (either payer or owes)
                    Expense expense = expenseRepository.findById(split.getExpenseId()).orElse(null);
                    if (expense == null)
                        return false;

                    if (!isMember(expense.getTripId(), userId))
                        return false;

                    split.settle();
                    expenseSplitRepository.save(split);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Batch settle multiple splits
     */
    @Transactional
    public int batchSettle(List<UUID> splitIds, UUID userId) {
        int settledCount = 0;
        for (UUID splitId : splitIds) {
            if (settleSplit(splitId, userId)) {
                settledCount++;
            }
        }
        return settledCount;
    }

    // ==================== Helper Methods ====================

    private boolean isMember(UUID tripId, UUID userId) {
        return tripMemberRepository.existsByTripIdAndUserId(tripId, userId);
    }

    private ExpenseResponse toExpenseResponse(Expense expense) {
        User payer = userRepository.findById(expense.getPaidByUserId()).orElse(null);

        List<ExpenseSplitResponse> splits = expenseSplitRepository.findByExpenseId(expense.getId()).stream()
                .map(split -> {
                    User user = userRepository.findById(split.getUserId()).orElse(null);
                    return new ExpenseSplitResponse(
                            split.getId(),
                            split.getUserId(),
                            user != null ? user.getName() : "Unknown",
                            split.getAmount(),
                            split.getIsSettled());
                })
                .collect(Collectors.toList());

        return new ExpenseResponse(
                expense.getId(),
                expense.getTripId(),
                expense.getPaidByUserId(),
                payer != null ? payer.getName() : "Unknown",
                expense.getCategory().name(),
                expense.getAmount(),
                expense.getDescription(),
                expense.getExpenseDate(),
                splits);
    }

    /**
     * Calculate optimal settlements using a greedy algorithm
     * This minimizes the number of transactions needed
     */
    private List<Settlement> calculateSettlements(List<UserBalance> balances) {
        List<Settlement> settlements = new ArrayList<>();

        // Create mutable copy of balances
        Map<UUID, BigDecimal> netBalances = new HashMap<>();
        Map<UUID, String> userNames = new HashMap<>();

        for (UserBalance balance : balances) {
            netBalances.put(balance.userId(), balance.netBalance());
            userNames.put(balance.userId(), balance.userName());
        }

        // Greedy algorithm: match largest debtor with largest creditor
        while (true) {
            // Find person who owes the most (most negative balance)
            UUID debtor = null;
            BigDecimal maxDebt = BigDecimal.ZERO;
            for (Map.Entry<UUID, BigDecimal> entry : netBalances.entrySet()) {
                if (entry.getValue().compareTo(maxDebt) < 0) {
                    maxDebt = entry.getValue();
                    debtor = entry.getKey();
                }
            }

            // Find person who is owed the most (most positive balance)
            UUID creditor = null;
            BigDecimal maxCredit = BigDecimal.ZERO;
            for (Map.Entry<UUID, BigDecimal> entry : netBalances.entrySet()) {
                if (entry.getValue().compareTo(maxCredit) > 0) {
                    maxCredit = entry.getValue();
                    creditor = entry.getKey();
                }
            }

            // If no significant balances remain, we're done
            if (debtor == null || creditor == null ||
                    maxDebt.abs().compareTo(new BigDecimal("0.01")) < 0 ||
                    maxCredit.compareTo(new BigDecimal("0.01")) < 0) {
                break;
            }

            // Calculate settlement amount
            BigDecimal settlementAmount = maxDebt.abs().min(maxCredit);

            // Create settlement
            settlements.add(new Settlement(
                    debtor,
                    userNames.get(debtor),
                    creditor,
                    userNames.get(creditor),
                    settlementAmount));

            // Update balances
            netBalances.put(debtor, netBalances.get(debtor).add(settlementAmount));
            netBalances.put(creditor, netBalances.get(creditor).subtract(settlementAmount));
        }

        return settlements;
    }
}
