# Problem Types Checked in Files

When checking files for "problems," the following types are reviewed:

- **Syntax errors** (e.g., missing brackets, invalid statements)
- **Type errors** (e.g., type mismatches in TypeScript)
- **Linting issues** (e.g., code style violations, unused variables)
- **Build errors** (e.g., missing imports, unresolved modules)
- **Security issues** (e.g., exposed secrets, unsafe code patterns)
- **Accessibility issues** (for UI code, e.g., missing labels, poor contrast)
- **Documentation gaps** (e.g., missing or outdated comments for complex logic)
- **Test coverage gaps** (e.g., missing tests for new or critical code paths)
- **Logic errors** (e.g., unreachable code, incorrect conditions)
- **Dependency vulnerabilities** (e.g., outdated or insecure packages)

The specific checks depend on the file type and project configuration. For code, static analysis, linting, and type checking are used. For documentation, clarity and completeness are checked. For security, OWASP and project-specific guidelines are followed.

If you want a check focused on a particular type of problem (e.g., only security, only accessibility), specify that in your request.

## Which Problem Types Static Analysis Can Find and Auto-Fix

- **Usually detectable and auto-fixable:** linting/style issues, some simple syntax issues, import/order cleanup, and some TypeScript quick-fixes (unused imports, missing imports, trivial type annotations).
- **Detectable with static analysis, but auto-fix is limited or risky:** security smells (hardcoded secrets, unsafe APIs), accessibility rule violations, some type errors, and some build-time issues (unresolved symbols/paths).
- **Often detectable, usually not safely auto-fixable:** logic errors and documentation gaps (tools can flag likely issues, but fixing requires human intent).
- **Not really a static-analysis auto-fix target:** test coverage gaps (measured from executed tests), and most missing tests.
- **Dependency vulnerabilities:** scanners detect them statically (`npm audit`, etc.); some can be auto-fixed (`npm audit fix`), but many upgrades still need manual review for breaking changes.

In short: lint/format/import-type housekeeping is the strongest auto-fix area; security/accessibility/type/build issues are partly auto-fixable; logic/tests/docs are mostly manual.
