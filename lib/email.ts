const FROM = process.env.EMAIL_FROM || "Onyx Scheduler <onboarding@resend.dev>";

export async function sendTimeOffNotification(data: {
  chatterName: string;
  startDate: string;
  endDate: string;
  reason?: string;
  to: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set – skipping email");
    return { ok: false, error: "Email not configured" };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: data.to,
      subject: `Time off request from ${data.chatterName}`,
      html: `
        <p>A new time off request has been submitted.</p>
        <ul>
          <li><strong>Employee:</strong> ${data.chatterName}</li>
          <li><strong>Start:</strong> ${data.startDate}</li>
          <li><strong>End:</strong> ${data.endDate}</li>
          ${data.reason ? `<li><strong>Reason:</strong> ${data.reason}</li>` : ""}
        </ul>
        <p>Please log in to the scheduler to approve or deny.</p>
      `,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: msg };
  }
}
