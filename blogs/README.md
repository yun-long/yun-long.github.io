# Blog System (Optimized)

This folder contains the blog for the website. The setup is simplified around a single manifest and content-only files to avoid duplication.

## Structure

- `posts.json` — Single source of truth for posts (title, date, slug, summary, content path)
- `post.html` — One dynamic layout that renders any post by `?slug=...`
- `content/` — Content-only HTML fragments for each post

## Add a New Post

1) Create content file
- Copy `content-template.html` (or any existing content file) into `content/your-slug.html`
- Write only the body content (headings, paragraphs, images, lists). No sidebar or page wrapper.

2) Register in manifest
- Edit `posts.json` and add an entry like:

```json
{
  "slug": "my-new-post",
  "title": "My New Post",
  "date": "2025-01-01",
  "summary": "One sentence summary for the listing.",
  "content": "blogs/content/my-new-post.html"
}
```

3) Test locally
- Open `blog.html` and click your post
- Or open `blogs/post.html?slug=my-new-post`

## Notes

- Dates use ISO format (`YYYY-MM-DD`) and are displayed nicely client-side
- The main list (`blog.html`) reads from `posts.json` and links to `post.html`
- Legacy files remain for compatibility but are not required going forward
