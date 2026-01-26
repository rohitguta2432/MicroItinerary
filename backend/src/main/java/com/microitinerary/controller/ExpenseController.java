package com.microitinerary.controller;

import com.microitinerary.domain.User;
import com.microitinerary.dto.AuthDtos.ApiResponse;
import com.microitinerary.dto.ExpenseDtos.*;
import com.microitinerary.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Expense Controller
 * Endpoints for expense tracking and Splitwise-style splitting
 */
@RestController
@RequestMapping("/api")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    /**
     * Get all expenses for a trip
     */
    @GetMapping("/trips/{tripId}/expenses")
    public ResponseEntity<List<ExpenseResponse>> getTripExpenses(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal User user) {
        List<ExpenseResponse> expenses = expenseService.getTripExpenses(tripId, user.getId());
        return ResponseEntity.ok(expenses);
    }

    /**
     * Add a new expense to a trip
     */
    @PostMapping("/trips/{tripId}/expenses")
    public ResponseEntity<ExpenseResponse> addExpense(
            @PathVariable UUID tripId,
            @RequestBody CreateExpenseRequest request,
            @AuthenticationPrincipal User user) {
        try {
            ExpenseResponse expense = expenseService.addExpense(tripId, user.getId(), request);
            return ResponseEntity.ok(expense);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get expense summary for a trip (who owes whom)
     */
    @GetMapping("/trips/{tripId}/expenses/summary")
    public ResponseEntity<TripExpenseSummaryResponse> getExpenseSummary(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal User user) {
        TripExpenseSummaryResponse summary = expenseService.getTripExpenseSummary(tripId, user.getId());
        if (summary == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(summary);
    }

    /**
     * Settle a single expense split
     */
    @PostMapping("/expenses/splits/{splitId}/settle")
    public ResponseEntity<ApiResponse<Void>> settleSplit(
            @PathVariable UUID splitId,
            @AuthenticationPrincipal User user) {
        if (expenseService.settleSplit(splitId, user.getId())) {
            return ResponseEntity.ok(ApiResponse.success("Split settled", null));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Batch settle multiple splits
     */
    @PostMapping("/expenses/splits/batch-settle")
    public ResponseEntity<ApiResponse<Integer>> batchSettle(
            @RequestBody BatchSettleRequest request,
            @AuthenticationPrincipal User user) {
        int settledCount = expenseService.batchSettle(request.splitIds(), user.getId());
        return ResponseEntity.ok(ApiResponse.success(settledCount + " splits settled", settledCount));
    }
}
