# Open Blockers

## 1. Backend pull-deploy has not yet been executed on the real server
**Status:** OPEN  
**Type:** server execution blocker  
**Owner:** server/operator execution

### Why it is still open
Repo-side deployment redesign is complete, but the new deploy path has not yet been proven on the actual server.

The following still remain unverified:

- real webhook file creation under `public_html`
- webhook syntax validation
- manual `deploy.sh` execution with the new Path B1 logic
- sparse-checkout release materialization correctness
- `current` symlink switch correctness
- healthcheck compatibility under the new release materialization path
- manual webhook trigger success
- GitHub Actions integration with the new webhook path

### What must happen next
- create and validate the real webhook file
- run `deploy.sh` manually
- inspect release and shared links
- test webhook manually
- only then connect GitHub Actions

---

## 2. Webhook is not yet installed and validated
**Status:** OPEN  
**Type:** server-local deploy blocker  
**Owner:** server/operator execution

### Why it is still open
The earlier server command sequence stopped at the webhook creation step because a placeholder filename was used literally (`<RANDOM_WEBHOOK>`), which caused shell syntax failure.

That means:

- the real webhook file does not yet exist
- webhook syntax has not yet been checked
- token validation has not yet been proven
- webhook logging has not yet been proven
- webhook-triggered deploy has not yet been observed

### What must happen next
- choose a real webhook filename
- create the PHP webhook file under `public_html`
- confirm absolute paths inside it
- validate with `php -l`
- test with manual `curl`

---

## 3. Apex HTTPS is still unresolved
**Status:** OPEN  
**Type:** infrastructure / public host blocker  
**Owner:** server/provider-side action

### Current state
- `https://www.thechoosentalks.org` is healthy
- apex HTTP redirect behavior is only partial
- apex HTTPS is not yet fully healthy

### Why this remains open
Registrar/domain forwarding alone is not sufficient to guarantee safe apex HTTPS behavior in the current provider setup.

The likely practical path remains:
- use server/cPanel-side HTTPS handling for apex
- terminate HTTPS safely for `thechoosentalks.org`
- perform permanent redirect to `https://www.thechoosentalks.org/*`
- preserve path

### Important note
This blocker does **not** need to stop backend deploy execution right now, because the webhook can and should use the healthy `www` host.

---

## 4. Frontend V1 redesign batch has not resumed yet
**Status:** OPEN WORK / NOT AN ACTIVE BLOCKER TO BACKEND DEPLOY  
**Type:** product/UI execution backlog  
**Owner:** frontend/product workstream

### Current state
Frontend shell/foundation reset already passed, but deeper screen redesign work is paused while backend deploy execution/server validation is being stabilized.

Pending work later includes:

- Today redesign
- VerseHub redesign
- Community redesign
- Paths redesign
- final deprecation/removal decisions for parked routes

### Why it is listed here
This is not blocking backend deployment execution, but it remains an active unfinished workstream and should not be forgotten while server-side work is ongoing.