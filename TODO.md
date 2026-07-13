# TODO - VIVGPT Agentic Chatbot UI Redesign

## Plan steps
1. Update `frontend/src/components/ChatSection.jsx`:
   - Add Hero-like premium background (mesh + orbs + particles)
   - Redesign left sidebar UI (logo, glass New Chat, chat item hover/active)
   - Replace top header with glass navbar and animated green Ready indicator
   - Redesign welcome screen copy + AI orb
   - Convert suggestion cards to glass AI action cards with Framer Motion hover scale
   - Restyle message bubbles (user gradient right-aligned; assistant glass left-aligned + avatar)
   - Restyle tool progress pill
   - Redesign chat input as floating glass container with gradient circular send button
   - Add smooth message enter animation
2. Update `frontend/src/pages/Chat.jsx` to avoid conflicting background styling.
3. Update `frontend/src/index.css` only if additional keyframes/helpers are needed.
4. Run frontend build/dev to verify streaming + UI render (no backend/functionality changes).

## Progress
- [x] Implement Step 1 (ChatSection UI overhaul)
- [x] Implement Step 2 (Chat page background)
- [ ] Implement Step 3 (index.css helpers if needed)
- [x] Verify by running frontend

