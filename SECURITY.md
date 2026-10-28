# Reporting a security vulnerability

Please report suspected vulnerabilities through
[GitHub's private vulnerability reporting](https://github.com/jnreis/briojs/security/advisories/new).
Do not open a public issue with exploit details or include credentials, private
data, or information belonging to someone else.

Include the Brio version, how you load it (npm or browser scripts), the affected
API, a minimal reproduction, and the impact you believe it has.

Brio is independently maintained. Reports are reviewed as time permits; there
is no guaranteed response time or bug bounty. Please coordinate public
disclosure through the private report so there is time to investigate and
prepare a fix.

## Scope and versions

Security fixes target the latest stable release. Older versions may not receive
backports; upgrade to the latest version when possible.

Brio evaluates trusted application expressions with `new Function`; they are
not sandboxed. A CSP that forbids `unsafe-eval` is incompatible with the
standard build. The CSP build (Brio 5.1+, `brio.csp.min.js` and
`@jnreis/briojs/csp`) interprets expressions without eval and never evaluates
page markup; a way to run code from page markup in that build is a security
issue. `b-html` does not sanitize input, and `trustedHTML()` asserts trust
rather than establishing it. These are documented constraints, not security
boundaries.

If Brio fails to uphold a documented security guarantee, please report it even
if one of these APIs is involved. See the
[HTML and expression security guide](./DOCUMENTATION.md#trusted-html-and-expression-security)
for intended usage.
