## Chapter 1 – Customer Order Dataset
Prompt used: "Generate 15 customer orders with fields: orderId, customerName, status (Pending, Shipped, Cancelled), and totalAmount. Return as JSON array."
Observations:
- IDs look too mocked for me. A pattern like this ORD-001 doesn't look like a real product pattern.
- From one point of view, status distribution is roughly balanced. From another one, it seems more real. In the real product, most of the orders will be Shipped, small banch of orders will be Cancelled. 7 Shipped, 5 Pending, 3 Cancelled
- totalAmount is an integer without currency