# @cdt5058/json-render-uswds Demo

A live demonstration of generating USWDS (U.S. Web Design System) pages from plain English descriptions using Claude AI.

## How It Works

1. **Type a description** — "Create a contact form for a federal agency..."
2. **Claude generates a JSON spec** — constrained to only USWDS components
3. **The page renders instantly** — live USWDS components appear in the browser

All in real-time with streaming and visual feedback.

## Setup

### Prerequisites

- Node.js 18+
- An Anthropic API key (get one at https://console.anthropic.com)

### Installation

```bash
npm install
```

Create a `.env.local` file with your API key:

```bash
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

### Running the Demo

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## How to Create a GIF

1. Run the app and let it warm up with a couple of prompts
2. Clear the screen (refresh the page)
3. Use screen recording software (QuickTime, ScreenFlow, etc.)
4. Type a compelling prompt and watch it generate
5. Let it render fully before stopping the recording
6. Convert to GIF using ffmpeg or an online converter:

```bash
ffmpeg -i recording.mov -vf "fps=10,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 output.gif
```

Or use an online tool like https://ezgif.com/

## Customizing the Example Prompts

Edit `app/page.tsx` and modify the `EXAMPLE_PROMPTS` array with government page scenarios you want to showcase.

## File Structure

```
examples/demo/
├── app/
│   ├── layout.tsx              - Page layout with USWDS CSS import
│   ├── page.tsx                - Main UI with prompt input and render panel
│   ├── globals.css             - Tailwind + USWDS CSS setup
│   └── api/generate/route.ts   - Claude API endpoint for spec generation
├── lib/
│   ├── catalog.ts              - USWDS component catalog
│   ├── registry.tsx            - USWDS component registry
│   └── spec-schema.ts          - Zod schema for generated specs
├── package.json
├── next.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## Debugging

If a spec doesn't render correctly:

1. Check browser console for React/rendering errors
2. Verify the spec has a valid `root` element ID
3. Ensure all referenced elements exist in the `elements` map
4. Check that component types match USWDS component names

## Limitations

- The AI generates a single page spec without state or interactivity
- Complex form validation requires additional catalog configuration
- Dynamic data binding requires passing a `StateProvider` to the renderer

## Learn More

- [json-render documentation](https://json-render.dev)
- [USWDS Design System](https://designsystem.digital.gov)
- [@cdt5058/json-render-uswds README](../../README.md)
