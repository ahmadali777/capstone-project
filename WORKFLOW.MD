# Workflow Comparison: Lazy vs. Engineered AI Generation 

### Overview 
This document analyzes the structural and qualitative architectural differences between code generated via a single-shot vague prompt (`feature/settings-lazy`) versus code produced through an intentional explore-plan-code engineering cycle (`feature/settings-engineered`). 

### Specific Code Diffs & Correctness 
The difference between the two branches is stark. In the lazy branch, the AI generated a superficial UI form component that relied entirely on baseline, native client-side validation hints (e.g., basic HTML attributes or standard empty checks). It failed to handle advanced data sanitation. 

Conversely, the engineered branch introduced a dedicated, decoupled validation engine module. The diff shows that the engineered prompt forced the inclusion of strict regular expression strings to screen the email input, along with an explicit boundary rule checking character lengths on the username field. 

### Accessibility & Edge Cases 
The single-shot prompt completely ignored accessibility (a11y) considerations. The input elements lacked clear aria-labels, semantic descriptive tags, or focus state rings. 

The engineered prompt accounted for these edge cases by explicitly managing error UI states. In the engineered branch, if a validation check fails, the form dynamically injects screen-reader-accessible validation errors below the specific problematic node, rather than throwing a generic alert dialog. It also cleanly locks out the submit button while an asynchronous mock network save operation is in-flight, preventing accidental duplicate form data payloads. 

### AI Mistakes Caught & Review Effort 
During the engineered development loop, the AI made a critical mistake in the email verification regex string—it accidentally wrote a rule that rejected emails ending in two-letter country-code top-level domains (like `.co` or `.uk`). Because the prompt demanded the execution of a companion test suite, the verification runner immediately threw a failure flag on the edge-case unit test (`test('should validate international domain extension emails')`). I was able to catch this error during the automated test compilation step, whereas in the lazy branch, this silent bug would have slipped completely unnoticed straight into production code. 

Reviewing the lazy branch requires checking every line manually because no logical guarantees were requested. The engineered branch significantly cuts down human review effort because the accompanying unit test suite mathematically proves the input constraints work before a developer even opens the file.
