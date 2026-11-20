import test from "node:test";
import assert from "node:assert/strict";
import { calculateShippingRate } from "../src/modules/shipping/shipping-rate.js";
test("uses seller inside-district rate for home district", () => {
 const r=calculateShippingRate({destinationDistrict:"Sylhet",homeDistrict:"Sylhet",insideDistrictCost:"55.00",outsideDistrictCost:"130.00",platformBaseCost:"150.00"});
 assert.equal(r.shippingCost,55); assert.equal(r.isHomeDistrict,true); assert.equal(r.estimatedDays,"1-2 Business Days"); assert.equal(r.rateSource,"STORE_CUSTOM");
});
test("uses seller outside-district rate for other districts", () => {
 const r=calculateShippingRate({destinationDistrict:"Dhaka",homeDistrict:"Sylhet",insideDistrictCost:55,outsideDistrictCost:130,platformBaseCost:70});
 assert.equal(r.shippingCost,130); assert.equal(r.isHomeDistrict,false);
});
test("uses platform district rate if seller has no custom rate", () => {
 const r=calculateShippingRate({destinationDistrict:"Chattogram",homeDistrict:"Sylhet",platformBaseCost:"145.00",estimatedDaysMin:3,estimatedDaysMax:5});
 assert.equal(r.shippingCost,145); assert.equal(r.estimatedDays,"3-5 Business Days"); assert.equal(r.rateSource,"PLATFORM_DEFAULT");
});
test("uses fallback rates if no seller or district rate exists", () => {
 assert.equal(calculateShippingRate({destinationDistrict:"Dhaka"}).shippingCost,70);
 assert.equal(calculateShippingRate({destinationDistrict:"Sylhet",homeDistrict:"Dhaka"}).shippingCost,150);
});
test("district matching ignores case and surrounding whitespace", () => {
 const r=calculateShippingRate({destinationDistrict:" sYlHeT ",homeDistrict:"Sylhet",insideDistrictCost:60});
 assert.equal(r.isHomeDistrict,true); assert.equal(r.shippingCost,60);
});
