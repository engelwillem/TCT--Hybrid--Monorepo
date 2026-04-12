# Composer System Diagrams

**Scope**: Visualizing PostComposer Modular Architecture

---

## 1. System Module Diagram
Menunjukkan hubungan antara Orchestrator, Hooks Domain, dan UI Components.

```mermaid
graph TD
    subgraph "Orchestrator Layer"
        PC[PostComposer.tsx]
    end

    subgraph "Domain Logic (Hooks)"
        L[useComposerLifecycle]
        T[useComposerText]
        M[useComposerMedia]
        C[useComposerCrop]
        S[useComposerSubmit]
    end

    subgraph "Presentation Layer"
        CS[ComposerShell]
        CI[ComposerInput]
        TC[ComposerTypeChips]
        MS[ComposerMediaStrip]
        AB[ComposerActionBar]
    end

    subgraph "External Integration"
        API[Laravel Backend API]
        AUTH[useAuthSession]
        CROP_D[Dialog Crop Editor]
    end

    PC --> L & T & M & C & S
    PC --> CS
    CS --> CI & TC & MS & AB
    S --> API
    PC --> AUTH
    PC --> CROP_D
```

---

## 2. Lifecycle & State Diagram
Menunjukkan transisi status dari kondisi draf hingga pengiriman.

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> EXPANDED: Focus / Type
    EXPANDED --> PROCESSING: Add Media / Edit
    PROCESSING --> EXPANDED: Apply Crop / Cancel
    EXPANDED --> SUBMITTING: Click Post
    SUBMITTING --> SUCCESS: API 200
    SUCCESS --> IDLE: Auto Reset
    SUBMITTING --> ERROR: API Error
    ERROR --> EXPANDED: Retry
    EXPANDED --> IDLE: Click Cancel
```

---

## 3. Data Flow Diagram: Submission Flow
Aliran data saat pengguna memicu aksi "Bagikan".

```mermaid
sequenceDiagram
    participant U as User
    participant PC as PostComposer
    participant SUB as useComposerSubmit
    participant API as Laravel API
    participant TOAST as Toast Notification

    U->>PC: Click "Bagikan"
    PC->>SUB: executeSubmit(text, type, images)
    SUB->>SUB: Set isSubmitting(true)
    SUB->>API: POST /api/community/posts
    API-->>SUB: 200 OK (New Post)
    SUB->>PC: onSuccess(newPost)
    PC->>PC: resetComposer()
    PC->>TOAST: Show "Berhasil membagikan"
    SUB->>SUB: Set isSubmitting(false)
```

---

*Diagrams authored by Antigravity Principal Architect*
