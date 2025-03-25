# 📨 WP Contact Form Plugin

A custom-built, lightweight contact form plugin for WordPress — powered by **React**, **Vite**, and **Tailwind CSS**. This plugin lets you visually build forms, store them as JSON using WordPress Custom Post Types, and handle submissions through a custom REST API.

---

## 🚀 Features

- ⚛️ React-based drag & drop form builder
- 🗂️ Forms saved as Custom Post Types (`cfp_form`)
- 🔘 Supports all standard form fields (text, email, textarea, select, checkbox, radio, date, file upload, etc.)
- 💾 Form submissions stored and retrievable from WP admin
- 📊 Entries graph page (grouped by year)
- 📥 Custom entries page with dynamic column rendering
- 🔐 Secured with REST API + Nonce

---

## 🧰 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: WordPress PHP, REST API, CPT
- **Build Tool**: Vite

---

## 📦 Installation

1. Clone this repository into your WordPress `plugins/` folder:
   ```bash
   git clone https://github.com/DetchedpDinter/wp-contact-form.git

2. Navigate into the plugin folder:

   cd wp-contact-form

3. Install frontend dependencies:

   npm install

4. Build production assets:

   npm run build

5. Activate the plugin from the WordPress Admin panel.

---

## 🧪 Development

For live reloading while developing the React form builder:

   npm run dev

---

## 🧠 Usage

    Go to Forms > Add New Form to open the builder.

    Save your form — it’s stored as a custom post.

    Use the generated shortcode like:

    [cfp_form id="123"]

    View submitted entries under Forms > Entries.

    Analyze yearly trends in Forms > Entries Graph.

---

## 📁 Project Structure

    wp-contact-form/
      ├── includes/                # PHP backend logic (menus, pages, REST)
      ├── src/                     # React form builder source code
      ├── dist/                    # Built frontend assets (auto-generated)
      ├── wp-contact-form.php      # Plugin bootstrap
      ├── package.json             # Frontend dependencies and scripts
      ├── vite.config.js           # Vite build config
      └── README.md                # This file

---

## 📦 Built With

    React

    Vite

    Tailwind CSS

    Native WordPress REST API

    Custom Post Types (CPTs)

---

## 📄 License

MIT License

---

## 👨‍💻 Author

  Made with 💻 by DetchedpDinter
