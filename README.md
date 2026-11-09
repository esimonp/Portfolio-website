# Emma's Portfolio

The approved prototype, turned into a real website. It looks and behaves the same as the prototype. It is plain HTML, CSS and JavaScript with no build step, so the folder you see is the folder you upload.

## What's in the folder

| File | What it is |
|---|---|
| `content.js` | **The only file you need to edit.** Poems, projects, books, the About me text, contact settings. |
| `img/` | Photos and screenshots (SheMoves, Outgo, Much Ado still, Civilizations cover). |
| `index.html` | Page structure. |
| `style.css` | Look and layout. |
| `main.js` | Everything that moves: the poem border, cords, pen, books, chat. |
| `favicon.svg` | The gold "E" in the browser tab. |

## 1. Put it online (about 2 minutes, free)

1. Go to **https://app.netlify.com/drop** and sign in (or create a free account).
2. Drag the whole `emma-portfolio` folder onto the page.
3. Netlify gives you a live address like `https://something-random.netlify.app`. That's the site.
4. To rename it: **Site configuration → Change site name**.
5. To use your own domain (e.g. `emma.com`): **Domain management → Add a domain**, then follow the steps it shows for your domain registrar.

**To update the site later:** open the site in Netlify → **Deploys** → drag the folder onto the drop area again.

(Vercel works too: https://vercel.com/new, then upload the folder.)

## 2. Make the contact form send real email (5 minutes, free)

1. Go to **https://formspree.io**, sign up with the email address where you want messages to arrive, and create a new form.
2. Formspree shows an endpoint like `https://formspree.io/f/xyzabcde`. Copy the last part (`xyzabcde`).
3. In `content.js`, find `const CONTACT=` and paste it in:
   ```js
   const CONTACT={formspree:"xyzabcde",linkedin:"https://www.linkedin.com/in/your-name/"};
   ```
4. Re-upload the folder. The first message Formspree receives sends a confirmation email to you. Click it, and from then on messages come straight to your inbox.

Your email address never appears in the site's code, because Formspree holds it. Spam protection: a hidden honeypot field, Formspree's own filtering, and a 30-second wait between sends from the same visitor. If sending fails, the visitor sees why and gets a **copy message** button.

Until you add a Formspree ID, the chat still works, but it says sending isn't set up and offers the copy button.

## 3. Editing content

Open `content.js` in any text editor (TextEdit works; use **Format → Make Plain Text**).

- **Add a book recommendation:** in `BOOKS`, find the book and put your sentence in the 5th slot (the empty `""`).
- **Add a project link or screenshot:** in `PROJ`, add `live:"https://…"` and/or `shot:"img/your-file.jpg"` (put the image in `img/`).
- **Add a poem:** add one line to `POEMS` (the short lowercase line for the border) **and** one entry to `FULL` (the full text) at the same position.
- **Change the bio:** edit `bio:` in `ABOUT`.

Keep the quotes and commas as they are. If the page goes blank after an edit, a quote or comma is usually missing.

## Preview on your computer

Double-click `index.html`. It opens in your browser and everything works except sending messages.
