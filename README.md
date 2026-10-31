# DrawingBoard Capital website

A static site. Upload the contents of this folder to any static host (Vercel, Netlify, Cloudflare Pages, S3) with no build step.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole site in English and Arabic. Pages are `#` sections (for example `/#translink`, `/#privacy`). |
| `tl-details.json` | Details for the 1,394 Translink deals, loaded when a visitor opens a deal. Keep it next to `index.html`. |
| `favicon.svg`, `icon.svg`, `apple-touch-icon.png` | Browser tab and home-screen icons, from the DrawingBoard Capital design system. |
| `og-image.png` | The preview image shown when the link is shared on LinkedIn, WhatsApp and similar apps. |
| `robots.txt`, `sitemap.xml` | For search engines. They assume the site lives at `https://drawingboard.capital/`. |

## Before going live

1. **Connect the forms.** Open `index.html`, find `window.DB_FORM_ENDPOINT = '';` near the top, and paste your form endpoint between the quotes. It needs a URL that accepts a JSON POST, such as Formspree, Basin, Getform, or a Zapier or Make webhook that forwards to HubSpot or email. Until you do, a visitor who submits the contact form, Find Buyers, Market Comps or Blueprint AI early access sees a copy of their request and is asked to email it to albin@drawingboard.capital.
2. **Domain.** If the site will not live at `drawingboard.capital`, replace that address in the `<head>` of `index.html`, in `robots.txt` and in `sitemap.xml`.
3. **Approvals still outstanding:** Translink's written OK for the deals, reports, logo and affiliate wording, a legal review of the Privacy Policy and Terms (governing law and registered address), a native-speaker review of the Arabic, and team sign-off on bios and photos.

## Deploying

- **Netlify:** drag this folder onto app.netlify.com/drop, then add your domain under Domain settings.
- **Vercel:** create a new project from this folder (Other framework, no build command, output directory `.`), then add your domain.

## Updating content

The Translink deals and reports are a snapshot taken on 30 October 2026. They do not update by themselves.
