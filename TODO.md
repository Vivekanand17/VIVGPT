# TODO - Markdown bullet/star cleanup

- [x] Update agent SYSTEM_PROMPT in `agent.py` to explicitly forbid markdown bullets/headers and instruct plain numbered lists.
- [x] Add frontend sanitization (backup) in `frontend/src/components/ChatSection.jsx` to strip common markdown bullets/headers and emphasis.
- [x] Run minimal local check (python py_compile + frontend build) to ensure changes compile.

