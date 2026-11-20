import test from "node:test";
import assert from "node:assert/strict";
import {canAdminTransitionOrder,canSellerTransitionOrder,type PaymentFact} from "../src/modules/orders/order-policy.js";
const unpaid:PaymentFact[]=[{method:"BKASH",status:"PENDING"}];
const verified:PaymentFact[]=[{method:"BKASH",status:"VERIFIED"}];
const cod:PaymentFact[]=[{method:"CASH_ON_DELIVERY",status:"PENDING"}];
test("seller may confirm COD and verified mobile orders only",()=>{
 assert.equal(canSellerTransitionOrder("PENDING","CONFIRMED",cod),true);
 assert.equal(canSellerTransitionOrder("PENDING","CONFIRMED",verified),true);
 assert.equal(canSellerTransitionOrder("PENDING","CONFIRMED",unpaid),false);
});
test("seller must follow the exact order lifecycle",()=>{
 assert.equal(canSellerTransitionOrder("CONFIRMED","PROCESSING",cod),true);
 assert.equal(canSellerTransitionOrder("PROCESSING","SHIPPED",cod),true);
 assert.equal(canSellerTransitionOrder("SHIPPED","DELIVERED",cod),true);
 assert.equal(canSellerTransitionOrder("PENDING","SHIPPED",cod),false);
});
test("admin may cancel pending orders but cannot cancel processing orders",()=>{
 assert.equal(canAdminTransitionOrder("PENDING","CANCELLED",unpaid),true);
 assert.equal(canAdminTransitionOrder("PROCESSING","CANCELLED",cod),false);
});
test("admin cannot confirm unpaid mobile payment",()=>{
 assert.equal(canAdminTransitionOrder("PENDING","CONFIRMED",unpaid),false);
 assert.equal(canAdminTransitionOrder("PENDING","CONFIRMED",verified),true);
});
test("admin may return delivered orders only",()=>{
 assert.equal(canAdminTransitionOrder("DELIVERED","RETURNED",cod),true);
 assert.equal(canAdminTransitionOrder("CONFIRMED","DELIVERED",cod),false);
});
