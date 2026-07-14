import transporter from '../config/mail.js';
import User from '../models/User.js';

const sendComplaintStatusEmail = async (residentEmail, residentName, complaintDetails, newStatus, adminNote) => {
  try {
    const mailOptions = {
      from: `"Society Management Portal" <${process.env.SMTP_USER}>`,
      to: residentEmail,
      subject: `[Update] Complaint ID: #${complaintDetails._id.toString().slice(-6).toUpperCase()} Status Shifted to ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #3b82f6;">Complaint Status Update</h2>
          <p>Hello <strong>${residentName}</strong>,</p>
          <p>The status of your complaint has been updated by the administration.</p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;"/>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td><strong>Complaint Title:</strong></td><td>${complaintDetails.title}</td></tr>
            <tr><td><strong>New Status:</strong></td><td><span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${newStatus}</span></td></tr>
            <tr><td><strong>Admin Note:</strong></td><td>${adminNote}</td></tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #777777;">This is an automated tracking notification. Please do not reply directly to this mail.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Status email alert successfully sent to ${residentEmail}`);
  } catch (error) {
    console.error('❌ Failed to send complaint status notification email:', error);
  }
};

const broadcastImportantNoticeEmail = async (noticeTitle, noticeDescription) => {
  try {
    const residents = await User.find({ role: 'resident' }).select('email');
    const recipientEmails = residents.map(user => user.email);

    if (recipientEmails.length === 0) return;

    const mailOptions = {
      from: `"Society Management Portal" <${process.env.SMTP_USER}>`,
      to: recipientEmails.join(','),
      subject: `🚨 CRITICAL SOCIETY NOTICE: ${noticeTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #fecaca; background-color: #ffffbb;">
          <h2 style="color: #dc2626;">Important Announcement</h2>
          <p>Hello Resident,</p>
          <p>An important announcement has been posted to the Notice Board that requires your immediate attention.</p>
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <h3 style="margin-top: 0;">${noticeTitle}</h3>
            <p style="white-space: pre-line;">${noticeDescription}</p>
          </div>
          <p style="font-size: 12px; color: #555555;">Please log in to the Society Maintenance Tracker dashboard to view full historical records.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📢 Global broadcast notice email sent to ${recipientEmails.length} residents.`);
  } catch (error) {
    console.error('❌ Failed to broadcast notice alert emails:', error);
  }
};

export { sendComplaintStatusEmail, broadcastImportantNoticeEmail };