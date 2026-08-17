# Accessibility and Performance Audit

**Date tested:** 17 August 2026  
**Tools:** WAVE Web Accessibility Evaluation Tool and Google Lighthouse

## WAVE accessibility results

WAVE reported a clean automated accessibility scan for the deployed application.

| Check | Result |
| --- | ---: |
| Errors | 0 |
| Contrast errors | 0 |
| Alerts | 0 |
| Features | 1 |
| Structural elements | 4 |
| ARIA attributes | 8 |
| AIM score | 10 / 10 |

The result indicates that WAVE detected no automated accessibility errors. As WAVE notes, manual testing remains necessary to confirm full accessibility in real-world use.

## Lighthouse results

The Lighthouse audit produced the following scores:

| Category | Score |
| --- | ---: |
| Performance | 80 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 60 |

## Summary

The application achieved perfect automated accessibility scores in both WAVE and Lighthouse, with no WAVE errors, contrast errors, or alerts. Performance is good at 80, while SEO (60) is the main area identified for further improvement.

## Recommended follow-up

- Perform keyboard-only navigation and screen-reader testing.
- Review Lighthouse SEO recommendations and add any missing metadata or page descriptions.
- Re-run both audits after significant UI or content changes.
