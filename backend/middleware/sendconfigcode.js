const { resend } = require("./emailconfig.js");
const { Verification_Email_Template } = require("./emailverify.js");

const sendconfigcode = async (confirmationCode, email) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Skyboundwebstudio <onboarding@resend.dev>",
      to: ["sovanpal12345maa@gmail.com"],
      subject: "Verification Code",
      html: Verification_Email_Template(email, confirmationCode),
    });

    if (error) {
      console.error("Email error:", error);
      return;
    }

    console.log("Email sent:", data);
  } catch (err) {
    console.error("Email sending failed:", err);
  }
};

module.exports = sendconfigcode;