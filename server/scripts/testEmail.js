require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const nodemailer = require("nodemailer");

async function testEmail() {
  console.log("=========================================");
  console.log("       NODEMAILER DIAGNOSTIC TEST        ");
  console.log("=========================================");

  const appEmail = process.env.APP_EMAIL || process.env.SMTP_USER;
  let appPass = process.env.APP_PASS || process.env.SMTP_PASS;

  console.log(`Checking configuration in server/.env:`);
  console.log(`- APP_EMAIL: ${appEmail ? appEmail : "❌ NOT SET (EMPTY)"}`);
  console.log(`- APP_PASS : ${appPass ? "•••••••••••••••• (SET)" : "❌ NOT SET (EMPTY)"}`);

  if (!appEmail || !appPass) {
    console.error("\n❌ ERROR: Cannot test Nodemailer because APP_EMAIL or APP_PASS is missing in server/.env.");
    console.error("Please open server/.env and fill in:");
    console.error("  APP_EMAIL=your_email@gmail.com");
    console.error("  APP_PASS=your_16_digit_app_password");
    console.error("\nFor Gmail:");
    console.error("1. Go to Google Account > Security > 2-Step Verification");
    console.error("2. Under 2-Step Verification, open 'App passwords'");
    console.error("3. Generate a password for 'Mail' and copy the 16 letters");
    console.error("4. Paste into server/.env and run this test again.");
    process.exit(1);
  }

  appPass = appPass.replace(/\s+/g, "");

  console.log(`\nConnecting to mail server using service: "gmail"...`);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: appEmail,
      pass: appPass,
    },
  });

  try {
    console.log("Verifying SMTP connection & authentication...");
    await transporter.verify();
    console.log("✅ SUCCESS: Mail server authentication verified successfully!");

    console.log(`\nSending diagnostic test message to ${appEmail}...`);
    const info = await transporter.sendMail({
      from: `"Nexora Test" <${appEmail}>`,
      to: appEmail,
      subject: "Nexora Nodemailer Test - Connection Verified",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #0F766E;">Nexora Email Delivery Verified</h2>
          <p>Your Nodemailer configuration is working properly with Google App Passwords!</p>
          <p>Timestamp: <strong>${new Date().toISOString()}</strong></p>
        </div>
      `,
    });

    console.log(`✅ Test email delivered successfully! MessageID: ${info.messageId}`);
    console.log("=========================================");
  } catch (error) {
    console.error("\n❌ NODEMAILER CONNECTION FAILED:");
    console.error(error.message);
    if (error.code === "EAUTH") {
      console.error("\n💡 Reason: Authentication failed.");
      console.error("This usually means:");
      console.error("1. You used your regular Gmail password instead of a Google 16-character 'App Password'.");
      console.error("2. 2-Step Verification is not enabled on the Google Account.");
      console.error("3. The App Password was revoked or typed incorrectly.");
    }
  }
}

testEmail();
