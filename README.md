## Chapter 1 – Customer Order Dataset
Prompt used: "Generate 15 customer orders with fields: orderId, customerName, status (Pending, Shipped, Cancelled), and totalAmount. Return as JSON array."
Observations:
- IDs look too mocked for me. A pattern like this ORD-001 doesn't look like a real product pattern.
- From one point of view, status distribution is roughly balanced. From another one, it seems more real. In the real product, most of the orders will be Shipped, small banch of orders will be Cancelled. 7 Shipped, 5 Pending, 3 Cancelled
- totalAmount is an integer without currency
## Chapter 2 – Data Variety and Extended Schema
Prompt used:
  "
  Generate 30 customer orders including realistic edge cases.
Each order should have:
- orderId (integer, range 1–9999)
- firstName (diverse cultural names transliterated into English, without special signs)
- lastName (diverse cultural names transliterated into English, without special signs)
- email (a realistic address that matches the customer name pattern).
- phoneNumber (a phone number string using a consistent pattern such as +0-000-000-0001.)
- items (an array of objects (name, quantity, price) describing purchased products. Item fields should be populated with realistic values)
- status (one of: Pending, Shipped, Cancelled, Returned, On Hold, Payment Error)
- totalAmount (range 0–10,000; include one zero value, one negative value and one very large number)
All statuses must appear at least once in the data set.
Apply the Payment Error status only to the order with a negative total.
Add a small set of invalid entries (missing fields or wrong data types).
Return the result as a JSON array.
  "

Dataset Summary:

- 30 orders with realistic customer names from diverse cultural backgrounds
All 6 statuses represented: Shipped (6), Pending (6), Cancelled (4), Returned (4), On Hold (3), Payment Error (1)
- Edge cases included:
    - Order 20: totalAmount = 0 (free item)
    - Order 7: totalAmount = -49.99 with Payment Error status
    - Order 22: totalAmount = 9899.99 (very large amount)
- 3 invalid entries for validation testing:
    - Order 9234: Missing email; items field is string instead of array; totalAmount is string
    - Order 9234 (Erik): Missing totalAmount field
    - Order 3 (Lucia): Missing orderId field
- Realistic items with quantity and price for each order
- Consistent phone format: +1-555-XXX-XXXX
- Email addresses follow the pattern firstname.lastname@email.com

Observations:
  - Added new statuses to mirror production states.
  - Introduced invalid rows for validation testing.
  - Each record now includes contact details and an items array.
  - The data summary contains inconsistencies. The sum of the status values does not equal 30. It is unclear what the section regarding the order refers to. The first section uses the product number, while the second uses the order ID.
## Chapter 3 – Data Masking and Validation
Prompt used:
"
Mask PII in the dataset:
- Replace customerName, email, and phoneNumber with synthetic but realistic values.
- Keep orderId, status, totalAmount, and items unchanged.
- Preserve types and overall structure.
- Output as JSON in the same schema.
"

Checks performed:
- All masked fields preserve type and basic format.
- No record lost required keys.
- Items arrays are intact with expected fields.
- Validation confirmed schema consistency.
- I looked through the changes. It didn't touch any fields except for firstName, lastNmae, email and phoneNumber
![alt text](image.png)
## Chapter 4 – Integrating AI-Generated Data into Validation Workflows
Result:

  1) tests\post-echo.spec.js:10:7 › Echo validates order 918 ───────────────────────────────────────

    Error: expect(received).toBeGreaterThanOrEqual(expected)

    Expected: >= 0
    Received:    -49.99

      32 |
      33 |     expect(record.email).toMatch(/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/);
    > 34 |     expect(record.totalAmount).toBeGreaterThanOrEqual(0);
         |                                ^
      35 |     expect(Array.isArray(record.items)).toBeTruthy();
      36 |     expect(record.items.length).toBeGreaterThan(0);
      37 |
        at C:\Users\d.bukhavetski\Work\ai-test-data-generation\tests\post-echo.spec.js:34:32

  2) tests\post-echo.spec.js:10:7 › Echo validates order 9234 ──────────────────────────────────────

    Error: expect(received).toHaveProperty(path)

    Expected path: "email"
    Received path: []

    Received value: {"firstName": "Layla", "items": "Invalid items type", "lastName": "Faris", "orderId": 9234, "phoneNumber": "+1-555-287-0125", "status": "Pending", "totalAmount": "Not a number"}

      20 |     // --- Structural checks ---
      21 |     const requiredKeys = ["orderId","firstName","lastName","email","phoneNumber","status","totalAmount","items"];
    > 22 |     for (const key of requiredKeys) expect(record).toHaveProperty(key);
         |                                                    ^
      23 |
      24 |     // --- Type checks (apply to all records) ---
      25 |     expect(typeof record.orderId).toBe("number");
        at C:\Users\d.bukhavetski\Work\ai-test-data-generation\tests\post-echo.spec.js:22:52

  3) tests\post-echo.spec.js:10:7 › Echo validates order Invalid ID ────────────────────────────────

    Error: expect(received).toHaveProperty(path)

    Expected path: "totalAmount"
    Received path: []

    Received value: {"email": "oskar.nyberg@email.com", "firstName": "Oskar", "items": [{"name": "Desk", "price": 599.99, "quantity": 1}], "lastName": "Nyberg", "orderId": "Invalid ID", "phoneNumber": "+1-555-398-1236", "status": "Shipped"}

      20 |     // --- Structural checks ---
      21 |     const requiredKeys = ["orderId","firstName","lastName","email","phoneNumber","status","totalAmount","items"];
    > 22 |     for (const key of requiredKeys) expect(record).toHaveProperty(key);
         |                                                    ^
      23 |
      24 |     // --- Type checks (apply to all records) ---
      25 |     expect(typeof record.orderId).toBe("number");
        at C:\Users\d.bukhavetski\Work\ai-test-data-generation\tests\post-echo.spec.js:22:52

  4) tests\post-echo.spec.js:10:7 › Echo validates order undefined ─────────────────────────────────

    Error: expect(received).toHaveProperty(path)

    Expected path: "orderId"
    Received path: []

    Received value: {"email": "serena.romano@email.com", "firstName": "Serena", "items": [{"name": "Chair", "price": 499.99, "quantity": 1}], "lastName": "Romano", "phoneNumber": "+1-555-409-2347", "status": "Cancelled", "totalAmount": 499.99}

      20 |     // --- Structural checks ---
      21 |     const requiredKeys = ["orderId","firstName","lastName","email","phoneNumber","status","totalAmount","items"];
    > 22 |     for (const key of requiredKeys) expect(record).toHaveProperty(key);
         |                                                    ^
      23 |
      24 |     // --- Type checks (apply to all records) ---
      25 |     expect(typeof record.orderId).toBe("number");
        at C:\Users\d.bukhavetski\Work\ai-test-data-generation\tests\post-echo.spec.js:22:52

4 failed:
  - tests\post-echo.spec.js:10:7 › Echo validates order 918
  - tests\post-echo.spec.js:10:7 › Echo validates order 9234
  - tests\post-echo.spec.js:10:7 › Echo validates order Invalid ID
  - tests\post-echo.spec.js:10:7 › Echo validates order undefined

26 passed (10.3s)


Summary:
4 failed tests. 3 of them are missing fields. The last one has negative amount

## Chapter 5 – AI Data Quality Report
Validation source: Playwright against `data/customer-orders-chapter-3-masked.json`

Key metrics:
- Total records tested: 30
- Valid records: 26
- Invalid records: 4
- Pass rate: 86.7%
- Status coverage: all 6 expected statuses present
- Duplicate order IDs: 0

Primary issues detected:
- Missing required fields: 3 records impacted (`orderId`, `email`, `totalAmount`)
- Type mismatches: 2 fields impacted (`orderId`, `totalAmount`)
- Invalid `items` structure: 1 record
- Business rule violation: 1 negative `totalAmount`

Assessment:
- The generation pipeline produces strong coverage and realistic variety, but it mixes production-like records with deliberately invalid cases in the same output.
- Schema quality is the main failure mode; masking did not introduce additional format errors.

Recommendations:
1. Split output into `valid` and `negative-test` datasets so validation runs can target the intended quality bar.
2. Add an automated schema gate before masking or API submission to reject missing fields, wrong types, and malformed `items` payloads.
3. Tighten the generation prompt with explicit constraints: all required keys present, numeric fields must remain numbers, and invalid cases must be tagged rather than mixed into the main dataset.
