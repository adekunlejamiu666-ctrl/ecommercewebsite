import api from "./api";

const messageService = {
  // Public: Send a message / vendor application
  sendMessage: async (data) => {
    const response = await api.post("/messages", data);
    return response.data;
  },

  // Admin: Get all messages with optional filters (status, type, search)
  getMessages: async (params = {}) => {
    const response = await api.get("/messages", { params });
    return response.data;
  },

  // Admin: Update status or internal notes
  updateMessageStatus: async (id, data) => {
    const response = await api.patch(`/messages/${id}`, data);
    return response.data;
  },

  // Admin: Delete a message
  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
};

export default messageService;
