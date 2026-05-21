# Marriage CV Website

This is a standalone static website for the marriage CV PDF. It is not linked to any other website.

## Local Preview

From this folder:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Access Code

The page stays hidden until a visitor enters a whole number divisible by 3.

This is a private front-door gate for casual sharing. For stronger privacy after publishing, use password protection or server-side access control from the hosting provider.

## Automatic Contact Delivery

The form is already Netlify Forms-ready:

1. Deploy this folder to Netlify.
2. Open Netlify's Forms area for the site.
3. Add an email notification for the `marriage-cv-contact` form.

For Formspree or another form service, put the endpoint URL in `script.js`:

```js
const DELIVERY = {
  formEndpoint: "https://formspree.io/f/your-id",
  recipientEmail: "your-email@example.com",
  smsNumber: "+15026931063"
};
```

If no hosted form service is configured, the form falls back to opening an SMS draft to the phone number from the CV.
