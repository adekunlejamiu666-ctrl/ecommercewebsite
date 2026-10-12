const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

// Lazy transporter — created on first use so dotenv has already loaded .env by then
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Render an EJS email template with provided data
 */
const renderEmail = async (templateName, data = {}) => {
  const templatePath = path.join(__dirname, "..", "views", "emails", `${templateName}.ejs`);
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5174";
  const year = new Date().getFullYear();

  return await ejs.renderFile(templatePath, {
    clientUrl,
    year,
    ...data,
  });
};

/**
 * Send an email using Nodemailer
 */
const sendMail = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM || `"Nexora Maison" <${process.env.APP_EMAIL}>`;

  try {
    const info = await getTransporter().sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log(`[EmailService] Email sent successfully to ${to} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 1. Welcome email after successful registration
 */
const sendWelcomeEmail = async (user) => {
  if (!user || !user.email) return { success: false };
  try {
    const html = await renderEmail("welcome", { user });
    return await sendMail({
      to: user.email,
      subject: "Welcome to Nexora - Luxury Collections & Membership",
      html,
    });
  } catch (error) {
    console.error("[EmailService] Welcome email rendering error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 2. Order confirmation email after valid order creation
 */
const sendOrderConfirmationEmail = async (order) => {
  if (!order) return { success: false };
  const recipientEmail = order.shippingAddress?.email || (order.user && order.user.email);
  if (!recipientEmail) return { success: false };

  try {
    const html = await renderEmail("order-confirmation", { order });
    return await sendMail({
      to: recipientEmail,
      subject: `Order Confirmation #${order._id ? order._id.toString().slice(-6).toUpperCase() : "ORD"} - Nexora`,
      html,
    });
  } catch (error) {
    console.error("[EmailService] Order confirmation email error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 3. Payment confirmation email only after backend verification
 */
const sendPaymentConfirmationEmail = async (order, paymentDetails = {}) => {
  if (!order) return { success: false };
  const recipientEmail = order.shippingAddress?.email || (order.user && order.user.email);
  if (!recipientEmail) return { success: false };

  try {
    const html = await renderEmail("payment-confirmation", { order, paymentDetails });
    return await sendMail({
      to: recipientEmail,
      subject: `Payment Receipt for Order #${order._id ? order._id.toString().slice(-6).toUpperCase() : "ORD"} - Nexora`,
      html,
    });
  } catch (error) {
    console.error("[EmailService] Payment confirmation email error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 4. Low-stock notification email to the configured administrator
 */
const sendLowStockAlertEmail = async (product) => {
  if (!product) return { success: false };
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.APP_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) {
    console.info("[EmailService] No ADMIN_NOTIFICATION_EMAIL configured for low stock alerts.");
    return { success: false, reason: "No admin notification email set." };
  }

  try {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5174";
    const adminUrl = `${clientUrl}/admin/products/edit/${product._id}`;
    const html = await renderEmail("low-stock-alert", { product, adminUrl });
    return await sendMail({
      to: adminEmail,
      subject: `[INVENTORY ALERT] Low Stock: ${product.name} (${product.stock} left)`,
      html,
    });
  } catch (error) {
    console.error("[EmailService] Low stock email error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 5. Password reset email with token link
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  if (!user || !user.email || !resetToken) return { success: false };

  try {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5174";
    const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const html = await renderEmail("password-reset", { user, resetUrl });
    return await sendMail({
      to: user.email,
      subject: "Password Reset Request - Nexora Security",
      html,
    });
  } catch (error) {
    console.error("[EmailService] Password reset email error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  renderEmail,
  sendMail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendLowStockAlertEmail,
  sendPasswordResetEmail,
};
