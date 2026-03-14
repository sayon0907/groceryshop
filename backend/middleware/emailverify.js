function Verification_Email_Template(phone, confirmationCode) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #333333;">Email Verification</h2>
        <p>Dear user,</p>
        <p>
          You have received this email because a sign-in attempt was made using <strong>${phone}</strong>.
          If this was you, please use the verification code below to complete the process.
          If you did not initiate this request, you may safely disregard this email.
        </p>
        <p style="margin-top: 20px;">Your verification code:</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 6px; background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 5px;">
          ${confirmationCode}
        </div>
        <p style="margin-top: 20px;">This code will expire in 5 minutes.</p>
        <p style="font-size: 12px; color: #888888; margin-top: 30px;">
          If you did not request this verification, no further action is required.
        </p>
      </div>
    </div>
  `;
}

module.exports = { Verification_Email_Template };
