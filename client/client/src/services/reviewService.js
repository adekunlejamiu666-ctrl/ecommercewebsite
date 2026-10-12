import api from "./api";

export const reviewService = {
  // Get all reviews for a product
  async getReviews(productId) {
    const res = await api.get(`/products/${productId}/reviews`);
    return res.data;
  },

  // Add review (Protected)
  async addReview(productId, reviewData) {
    const res = await api.post(`/products/${productId}/reviews`, reviewData);
    return res.data;
  },
};

export default reviewService;
