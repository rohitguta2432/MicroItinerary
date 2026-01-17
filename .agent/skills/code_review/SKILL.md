---
description: Perform a comprehensive code review focusing on correctness, quality, security, and performance.
---

# Instructions

When performing a code review, systematically evaluate the code against the following criteria:

## 1. Correctness & Logic
- **Bugs**: Identify potential runtime errors, null pointer exceptions, type mis-matches, or off-by-one errors.
- **Edge Cases**: Ensure the code handles edge cases (e.g., empty lists, null inputs, negative numbers, network timeouts).
- **Concurrency**: Check for race conditions, deadlocks, or thread-safety issues in shared resources.

## 2. Code Quality & Maintainability
- **Readability**: Are variable/function names descriptive? Is the logic easy to follow?
- **Complexity**: Identify overly complex functions (high cyclomatic complexity) that should be refactored or broken down.
- **DRY (Don't Repeat Yourself)**: Flag duplicated code that could be extracted into helper functions or constants.
- **Consistency**: Ensure the code follows the project's existing style and conventions.

## 3. Security
- **Input Validation**: Check that all external inputs (API params, user input) are validated and sanitized.
- **Secrets Management**: Ensure no API keys, passwords, or tokens are hardcoded.
- **Vulnerabilities**: Look for common flaws like SQL injection, XSS, or insecure dependencies.

## 4. Performance
- **Efficiency**: Identify unnecessary loops, expensive operations in hot paths, or suboptimal algorithms.
- **Resource Management**: Check that database connections, file handles, and streams are properly closed.
- **Database**: efficient queries, N+1 problems, proper indexing.

## Output Format
Provide the review in a structured markdown format:
1. **Summary**: High-level feedback.
2. **Critical Issues**: Bugs or security flaws that must be fixed.
3. **Suggestions**: Improvements for readability or performance.
4. **Nitpicks**: Minor style or formatting issues.
