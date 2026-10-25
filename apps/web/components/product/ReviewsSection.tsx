"use client";

import React, { useState } from "react";
import { Star, CheckCircle, MessageSquare } from "lucide-react";
import type { Review } from "@/types";
import { RatingStars } from "../ui/RatingStars";

export function ReviewsSection({
  productId,
  initialReviews = [],
  avgRating = 0,
  reviewCount = 0,
}: {
  productId: string;
  initialReviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
}) {
  const [reviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    setSubmittedMessage(null);

    try {
      const res = await fetch(`http://localhost:3001/api/reviews/product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        setSubmittedMessage("Thank you! Your review has been submitted.");
        setShowForm(false);
        setComment("");
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmittedMessage(data.error || "Please log in to submit a review.");
      }
    } catch {
      setSubmittedMessage("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-gold/40 pb-4">
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-dark">
            Ratings & Customer Reviews
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={Number(avgRating)} size="md" showNumber />
            <span className="text-xs text-muted">
              Based on {reviewCount} customer reviews
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="gbtn px-4 py-2 rounded-full text-xs font-semibold shadow-xs cursor-pointer"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {submittedMessage && (
        <div className="p-3 text-xs rounded-xl bg-surface-subtle border border-gold/40 text-dark">
          {submittedMessage}
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-border-gold bg-cream space-y-3">
          <h3 className="text-xs font-semibold text-dark">Your Rating</h3>
          <div className="flex gap-1.5 text-deep">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= rating ? "fill-current text-deep" : "text-border-gold"
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted mb-1">
              Your Feedback
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you loved about this product..."
              className="w-full p-2.5 text-xs rounded-lg border border-border-gold bg-white text-dark outline-none focus:border-deep"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="gbtn px-5 py-2 rounded-full text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4 divide-y divide-border-gold/30">
        {reviews.length === 0 ? (
          <p className="text-xs text-muted py-2">
            No customer reviews yet. Be the first to review this product!
          </p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-dark">
                    {rev.user?.name ?? "Anonymous Customer"}
                  </span>
                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-2.5 h-2.5" />
                      Verified Purchase
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted">
                  {new Date(rev.createdAt).toLocaleDateString("en-BD", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <RatingStars rating={rev.rating} size="xs" />

              <p className="text-xs text-dark/90 leading-relaxed pt-0.5">
                {rev.comment}
              </p>

              {rev.sellerReply && (
                <div className="ml-4 mt-2 p-2.5 rounded-lg bg-surface-subtle border-l-2 border-deep text-xs space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-[11px] text-deep">
                    <MessageSquare className="w-3 h-3" />
                    Store Response
                  </div>
                  <p className="text-muted text-[11px]">{rev.sellerReply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
