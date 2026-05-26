import twilio from 'twilio';

/**
 * Reusable function to send SMS via Twilio
 * @param {string} to - The recipient's phone number
 * @param {string} message - The message body
 */
const sendSMS = async (to, message) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error('Twilio credentials missing in environment variables');
      return;
    }

    const client = twilio(accountSid, authToken);

    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });

    console.log(`SMS sent successfully to ${to}. SID: ${response.sid}`);
    return response;
  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error.message);
    // We don't throw error here to prevent the main process (like registration) from failing if SMS fails
    return null;
  }
};

export default sendSMS;
