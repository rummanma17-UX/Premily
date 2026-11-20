import test from "node:test";
import assert from "node:assert/strict";
import { registerSchema } from "../src/modules/auth/auth.schema.js";
import { checkoutSchema, paymentProofSchema } from "../src/modules/orders/orders.schema.js";
import { updateStoreProfileSchema } from "../src/modules/stores/stores.schema.js";
test("registration validates Bangladeshi phone numbers and password length",()=>{
 assert.equal(registerSchema.safeParse({name:"Test Customer",phone:"01712345678",password:"secure-pass-123"}).success,true);
 assert.equal(registerSchema.safeParse({name:"Test Customer",phone:"01212345678",password:"secure-pass-123"}).success,false);
 assert.equal(registerSchema.safeParse({name:"Test Customer",phone:"01712345678",password:"short"}).success,false);
});
test("checkout validates phone and payment method",()=>{
 const base={shippingName:"Test Customer",shippingPhone:"01712345678",shippingAddress:"House 1, Road 2",shippingCity:"Sylhet",shippingDistrict:"Sylhet",paymentMethod:"CASH_ON_DELIVERY"};
 assert.equal(checkoutSchema.safeParse(base).success,true);
 assert.equal(checkoutSchema.safeParse({...base,shippingPhone:"123"}).success,false);
 assert.equal(checkoutSchema.safeParse({...base,paymentMethod:"CARD"}).success,false);
});
test("payment proof normalizes transaction IDs and validates sender phone",()=>{
 const r=paymentProofSchema.safeParse({transactionId:"  ab12cd34  ",senderNumber:"01812345678"});
 assert.equal(r.success,true); if(r.success) assert.equal(r.data.transactionId,"AB12CD34");
 assert.equal(paymentProofSchema.safeParse({transactionId:"TX-123",senderNumber:"01112345678"}).success,false);
});
test("seller cannot self-verify a store",()=>{
 assert.equal(updateStoreProfileSchema.safeParse({verificationStatus:"PENDING"}).success,true);
 assert.equal(updateStoreProfileSchema.safeParse({verificationStatus:"VERIFIED"}).success,false);
});
