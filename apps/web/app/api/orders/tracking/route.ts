import { NextResponse } from "next/server";
import { StoreService } from "@/lib/store-data";
import { generateDeliveryTracking } from "@/lib/delivery-tracking";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    const orders = StoreService.getOrders();

    if (orderId) {
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        return NextResponse.json(
          { error: "Order not found", orderId },
          { status: 404 }
        );
      }
      const tracking = generateDeliveryTracking(order);
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        order: tracking,
      });
    }

    const trackingList = orders.map((order) => generateDeliveryTracking(order));
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: trackingList.length,
      orders: trackingList,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
