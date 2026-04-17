# Shraddha Enterprises - B2B E-Commerce Platform PRD

## Original Problem Statement
Build a professional, fully responsive query-based B2B e-commerce website for Shraddha Enterprises with admin portal. No cart or checkout — customers submit inquiries routed via email and WhatsApp.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: JWT (httpOnly cookies)
- **Email**: MOCKED (console logging)
- **WhatsApp**: wa.me links

## User Personas
1. **Business Buyer** - Browses products, selects colour variants, sends queries, requests bulk quotes
2. **Admin** - Manages products, categories, queries, settings, views analytics

## Core Requirements
- Product catalog with colour variant selector, availability badges
- Send Query form with auto-filled product + colour
- WhatsApp quick inquiry on every product
- Bulk quote system (multi-product inquiry)
- Admin portal: Dashboard, Product CRUD, Category CRUD, Query Inbox, Settings

## What's Been Implemented (April 12, 2026)
### Phase 1 - MVP Complete:
- [x] Home page: hero, features, featured products, testimonials, client logos, CTA
- [x] Products page: category filter sidebar, search, 3-col grid, colour dots, availability badges
- [x] Product detail: image gallery, colour variants, specs table, send query, WhatsApp, add to quote
- [x] Send Query modal with auto-filled product + colour
- [x] WhatsApp integration (wa.me links with pre-filled messages)
- [x] Bulk quote system (add to quote, submit from quote page)
- [x] Contact page with form + Google Maps embed
- [x] Admin login (JWT, httpOnly cookies)
- [x] Admin dashboard (stats cards, queries/month chart, top queried products, recent queries)
- [x] Admin product management (list, add, edit, delete, featured toggle, colour variants, image upload)
- [x] Admin category management (CRUD with subcategories)
- [x] Admin query inbox (list, search, filter, mark read, detail view, export CSV)
- [x] Admin settings page (WhatsApp, phone, email, company info, maps URL)
- [x] Recently viewed products tracking (localStorage)
- [x] Responsive design (mobile, tablet, desktop)
- [x] Seed data: 8 products, 4 categories, 3 testimonials

## Prioritized Backlog

### P0 (Phase 2 - Next)
- [ ] Product comparison (up to 3 side-by-side)
- [ ] Email integration (Gmail API or SMTP with Nodemailer)
- [ ] Blog / knowledge base section
- [ ] Video section with YouTube embeds

### P1
- [ ] PDF catalogue generation per product/category
- [ ] QR code per product page
- [ ] Multi-language support (English/Hindi/Marathi)
- [ ] Testimonials & client logos admin management
- [ ] Blog admin management

### P2
- [ ] Tawk.to live chat widget integration
- [ ] reCAPTCHA on public forms
- [ ] SEO (sitemap, schema markup, Open Graph)
- [ ] Image compression & lazy loading optimization
- [ ] Advanced search with keywords
- [ ] Stock management per variant

## Next Tasks
1. Email integration setup (Gmail API / SMTP)
2. Product comparison feature
3. Blog section with admin management
4. Video management
5. PDF spec sheet generation
