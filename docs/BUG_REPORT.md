# howUdoin? Exploratory Test Report

**Tester:** Ayodele Owolabi
**Build:** `main` @ `eafa959`
**Scope:** authentication, weekly reviews (CRUD), student contact info (CRUD), authorization between accounts
**Method:** exploratory testing with two accounts (`alice`, `bob`), plus scripted HTTP probes using Supertest

Every bug below was reproduced, fixed on the `qa-and-ui-refresh` branch, and is now covered by an automated regression test (the **Test** column).

## Summary

| ID | Severity | Title | Status | Test |
|---|---|---|---|---|
| BUG-01 | 🔴 Critical | Any logged-in user can **read** another student's review | Fixed | `api/reviews.test.js` › authorization |
| BUG-02 | 🔴 Critical | Any logged-in user can **edit or delete** another student's review | Fixed | `api/reviews.test.js` › authorization |
| BUG-03 | 🟠 High | Review update accepts an `owner` field (mass assignment), so a review can be reassigned to another user | Fixed | `api/reviews.test.js` › mass assignment |
| BUG-04 | 🟠 High | Editing a review silently resets the rating to "0" | Fixed | `e2e/reviews.spec.js` › edit keeps rating |
| BUG-05 | 🟡 Medium | Opening a review ID that doesn't exist crashes with a 500 error | Fixed | `api/reviews.test.js` › 404 |
| BUG-06 | 🟡 Medium | Failed sign-up (mismatched passwords, taken username) redirects home with no message | Fixed | `api/auth.test.js` |
| BUG-07 | 🟡 Medium | Failed login gives no error message | Fixed | `api/auth.test.js`, `e2e/auth.spec.js` |
| BUG-08 | 🟡 Medium | Invalid review data is silently dropped (no error shown, nothing saved) | Fixed | `api/reviews.test.js` › validation |
| BUG-09 | 🟢 Low | Deleting contact info when none exists throws a server error | Fixed | `api/studentInfo.test.js` |
| BUG-10 | 🟢 Low | Reviews page has no empty state ("You have no reviews") | Fixed | `e2e/reviews.spec.js` |
| BUG-11 | 🟢 Low | The "tell me more" textarea is pre-filled with whitespace, which gets saved with the review | Fixed | `api/reviews.test.js` |
| BUG-12 | 🟢 Low | Invalid HTML: pages render two nested `<html>` documents, IDs are duplicated, and labels aren't linked to inputs | Fixed | `e2e` (accessible-name locators) |
| SEC-01 | 🟠 High | Passwords are hashed with bcrypt cost factor 6 (too low); the session isn't regenerated at login | Fixed | n/a |

---

## Details

### BUG-01 / BUG-02: Broken access control on reviews (IDOR)
**Severity:** Critical. Students can see and change each other's private self-assessments.

**Steps to reproduce**
1. Sign up as `alice` and create a review: Week 1, "secret".
2. Copy the review URL: `/student/reviews/<id>`.
3. Log out, then sign up as `bob`.
4. Open `/student/reviews/<id>`.

**Expected:** a 404, or an "access denied" message.
**Actual:** Bob sees Alice's review. A `PUT` or `DELETE` to the same URL changes or deletes it.

**Root cause:** routes look up `Review.findById(id)` without checking `owner`.
**Fix:** every single-review route now uses `Review.findOne({ _id, owner: req.user._id })` and returns a 404 for reviews you don't own. That way the app doesn't even reveal that the review exists.

### BUG-03: Mass assignment on review update
**Steps:** as Alice, send `PUT /student/reviews/<id>` with the body `owner=<bob's id>`.
**Actual:** the review now belongs to Bob.
**Fix:** only `weekNumber`, `rating` and `weeklyReview` are accepted from the form.

### BUG-04: Editing resets the rating
**Steps:** create a review rated "4". Open **Edit**, change only the text, and submit.
**Actual:** the rating is saved as "0 - I have no understanding".
**Root cause:** `<select value="...">` isn't valid HTML, so the browser defaults to the first option.
**Fix:** the current option is now rendered with `selected`.

### BUG-05: 500 error on a missing review
**Steps:** open `/student/reviews/000000000000000000000000`.
**Actual:** the server crashes rendering `review.weekNumber` of `null` (HTTP 500).
**Fix:** missing or invalid IDs now return a friendly 404 page.

### BUG-06 / BUG-07: No feedback on auth errors
**Steps:** sign up with passwords that don't match, or with a username that's already taken. Separately, log in with a wrong password.
**Actual:** a silent redirect, and the user doesn't know what went wrong.
**Fix:** the form re-renders with a clear error message and the right status code (422 or 401), and the username stays filled in.

### BUG-08: Invalid review silently dropped
**Steps:** POST a review with `weekNumber=Week 9`.
**Actual:** a redirect to the list with nothing saved and no message.
**Fix:** the server validates the data, and the form re-renders with the error (422).

### BUG-09: Deleting contact info that doesn't exist
**Steps:** as a new user with no contact info, send `DELETE /student/information/x`.
**Actual:** a `TypeError: Cannot read properties of undefined (reading 'deleteOne')` is logged.
**Fix:** the route handles the "nothing to delete" case.

### BUG-10 to BUG-12: UX and markup
- An empty reviews list now shows a friendly empty state with a call to action.
- The textarea starts empty, and saved text is trimmed.
- Every view now uses one layout (header and footer partials), with unique IDs and `<label for>` on every input. This also means Playwright can find fields by their accessible name.
