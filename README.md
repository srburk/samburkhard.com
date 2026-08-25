# samburkhard.com

## StyleX mockup

A vanilla HTML/TypeScript + StyleX prototype of this site lives in `stylex-mockup/`. It does not replace the Python static site generator. From the repo root:

```
make stylex-mockup
```

Or `cd stylex-mockup && npm install && npm run dev`, then open http://127.0.0.1:5173/.

## Running

### Building on change

Install fswatch (macOS).

Probably will need to be more intelligent if there are a lot of posts.

## Post Format

Posts are defined in markdown with .yml front matters surrounded by "---"

Supported fields are:

```
title: String
Date: ISO Blah blah blah
```