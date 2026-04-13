const LOGO_URL = "https://bybitterflame.com/logo-woodcut-header-400.png";

export function emailHtml(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>By Bitter Flame</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;">

<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
<tr><td align="center" style="padding:24px 16px 40px;">

  <table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:8px;overflow:hidden;border:1px solid #292524;">

    <!-- Logo header -->
    <tr>
      <td align="center" style="background:#141210;padding:24px 32px;">
        <img src="${LOGO_URL}" width="240" alt="By Bitter Flame" style="display:block;margin:0 auto;" />
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="background:#141210;padding:8px 40px 36px;border-top:1px solid #1f1c18;">
        ${bodyContent}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#0f0e0c;padding:16px 40px;border-top:1px solid #1c1917;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#44403c;text-align:center;">
          By Bitter Flame &mdash; AI Fantasy Adventure &mdash; Beta
        </p>
      </td>
    </tr>

  </table>

</td></tr>
</table>

</body>
</html>`;
}

export function emailP(text: string, opts: { muted?: boolean; small?: boolean; spaceBelow?: string } = {}): string {
  const color = opts.muted ? "#a8a29e" : "#d4c47a";
  const size = opts.small ? "13px" : "15px";
  const margin = `0 0 ${opts.spaceBelow ?? "20px"}`;
  return `<p style="margin:${margin};font-family:Georgia,serif;font-size:${size};line-height:1.7;color:${color};">${text}</p>`;
}

export function emailButton(label: string, url: string): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
  <tr>
    <td style="border-radius:4px;background:#b5a642;">
      <a href="${url}" style="display:inline-block;padding:14px 28px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#1a1814;text-decoration:none;letter-spacing:0.03em;">${label} &rarr;</a>
    </td>
  </tr>
</table>
<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#57534e;word-break:break-all;">Or copy this link: <a href="${url}" style="color:#78716c;">${url}</a></p>`;
}
