const Message = require("../models/message.model");

// Create message (Public: e.g. vendor application or contact message)
const createMessage = async (req, res) => {
  try {
    const { name, email, phone, message, type, subject } = req.body || {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone number, and message.",
      });
    }

    const finalType = type || "vendor_application";
    const finalSubject =
      subject ||
      (finalType === "vendor_application"
        ? "Vendor Application – NEXORA"
        : "Store Inquiry");

    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      type: finalType,
      subject: finalSubject,
      status: "unread",
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been delivered directly to the admin inbox.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit message to admin inbox.",
      error: error.message,
    });
  }
};

// Get all messages (Admin only)
const getAllMessages = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }
    if (type && type !== "all") {
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const messages = await Message.find(filter).sort({ createdAt: -1 });
    const totalCount = await Message.countDocuments();
    const unreadCount = await Message.countDocuments({ status: "unread" });
    const vendorCount = await Message.countDocuments({
      type: "vendor_application",
    });

    return res.status(200).json({
      success: true,
      messages,
      total: totalCount,
      unreadCount,
      vendorCount,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve messages.",
      error: error.message,
    });
  }
};

// Update message status or notes (Admin only)
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const message = await Message.findById(id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found." });
    }

    if (status) message.status = status;
    if (notes !== undefined) message.notes = notes;

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message updated successfully.",
      data: message,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update message.",
      error: error.message,
    });
  }
};

// Delete message (Admin only)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndDelete(id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete message.",
      error: error.message,
    });
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  updateMessageStatus,
  deleteMessage,
};
