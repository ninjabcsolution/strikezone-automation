# Look-Alike Architecture Diagram (Mermaid)

This diagram shows the integrated architecture for look-alike generation using specialized tools (6sense/ZoomInfo/D&B) + Apollo enrichment.

## How to Generate Image

### Option 1: GitHub (easiest)
- Commit this file to GitHub
- GitHub will automatically render the Mermaid diagram
- Right-click → "Save image as"

### Option 2: VS Code
- Install "Markdown Preview Mermaid Support" extension
- Preview this file
- Take screenshot

### Option 3: Mermaid Live Editor
- Go to: https://mermaid.live
- Copy the code below and paste it
- Export as PNG/SVG

---

## Architecture Flow Diagram

```mermaid
flowchart TD
    Start([ERP Data: Top 20% Customers]) --> ICP[Step 1: ICP Extraction<br/>Strikezone Backend<br/>- Industries<br/>- Geography<br/>- Size ranges<br/>- Behavioral patterns]
    
    ICP --> ICPJson{ICP Profile<br/>JSON}
    
    ICPJson --> ToolAPI[Step 2: Look-Alike Generation<br/>Specialized Tool API<br/>🎯 6sense OR<br/>🔍 ZoomInfo OR<br/>📊 D&B Lattice]
    
    ToolAPI --> ToolResponse{Scored<br/>Account List}
    
    ToolResponse --> DB[Step 3: Store Targets<br/>lookalike_targets table<br/>- status: pending_review<br/>- similarity_score<br/>- reason_codes<br/>- source: tool name]
    
    DB --> Portal[Step 4: Approval Portal<br/>React Frontend<br/>👤 Human Review<br/>✅ Approve / ❌ Reject / ✏️ Edit]
    
    Portal --> Approved{Approved<br/>Accounts?}
    
    Approved -->|Yes| Apollo[Step 5: Contact Enrichment<br/>Apollo.io API<br/>- Find decision-makers<br/>- Job titles<br/>- Email + LinkedIn]
    
    Approved -->|No| Rejected[Rejected:<br/>Do not proceed]
    
    Apollo --> Enriched{Enriched<br/>Contacts}
    
    Enriched --> Export[Step 6: Ready for Outreach<br/>Export to CRM or<br/>Sales Engagement Platform]
    
    Export --> End([Outbound Campaign])
    
    style Start fill:#e1f5ff
    style ICP fill:#fff3cd
    style ToolAPI fill:#d4edda
    style Portal fill:#f8d7da
    style Apollo fill:#d1ecf1
    style Export fill:#d4edda
    style End fill:#e1f5ff
    
    style Approved fill:#fff3cd
    style ICPJson fill:#e2e3e5
    style ToolResponse fill:#e2e3e5
    style Enriched fill:#e2e3e5
```

---

## Vertical Architecture (Alternative View)

```mermaid
graph TB
    subgraph Phase1[Phase 1: Data Foundation]
        ERP[ERP Data<br/>Dynamics 365 / Any ERP]
        Upload[CSV Upload]
        DB1[(PostgreSQL<br/>customers, orders)]
    end
    
    subgraph Phase2[Phase 2: Intelligence Layer]
        Top20[Top 20% Engine<br/>Margin-based ranking]
        ICPExtract[ICP Extraction<br/>Industry, Geo, Size, Behavior]
    end
    
    subgraph Phase3[Phase 3: Look-Alike Generation]
        ToolChoice{Choose Tool}
        SixSense[6sense API<br/>Intent + Behavior]
        ZoomInfo[ZoomInfo API<br/>Firmographics + Scale]
        DBLattice[D&B Lattice API<br/>Predictive Modeling]
    end
    
    subgraph Phase4[Phase 4: Human-in-Loop]
        ApprovalPortal[Approval Portal<br/>React Frontend]
        Review{Review & Approve}
    end
    
    subgraph Phase5[Phase 5: Enrichment & Activation]
        ApolloEnrich[Apollo.io<br/>Contact Enrichment]
        CRM[Export to CRM<br/>Salesforce / HubSpot]
    end
    
    ERP --> Upload
    Upload --> DB1
    DB1 --> Top20
    Top20 --> ICPExtract
    ICPExtract --> ToolChoice
    
    ToolChoice --> SixSense
    ToolChoice --> ZoomInfo
    ToolChoice --> DBLattice
    
    SixSense --> ApprovalPortal
    ZoomInfo --> ApprovalPortal
    DBLattice --> ApprovalPortal
    
    ApprovalPortal --> Review
    Review -->|Approved| ApolloEnrich
    Review -->|Rejected| Reject[End]
    
    ApolloEnrich --> CRM
    
    style Phase1 fill:#e3f2fd
    style Phase2 fill:#fff3e0
    style Phase3 fill:#e8f5e9
    style Phase4 fill:#fce4ec
    style Phase5 fill:#f3e5f5
```

---

## Data Flow (Detailed)

```mermaid
sequenceDiagram
    participant User
    participant Backend
    participant DB
    participant LookAlikeTool
    participant Portal
    participant Apollo
    participant CRM
    
    User->>Backend: Upload ERP data
    Backend->>DB: Store customers/orders
    Backend->>Backend: Calculate Top 20%
    Backend->>Backend: Extract ICP traits
    
    Note over Backend: ICP Profile Ready
    
    User->>Backend: Generate look-alikes
    Backend->>LookAlikeTool: POST /search<br/>{ICP profile}
    LookAlikeTool-->>Backend: Return scored accounts
    Backend->>DB: Store in lookalike_targets
    
    User->>Portal: View targets
    Portal->>DB: Fetch pending targets
    DB-->>Portal: Display list
    
    User->>Portal: Approve/Reject
    Portal->>DB: Update status
    
    Backend->>Apollo: Enrich approved accounts
    Apollo-->>Backend: Return contacts
    Backend->>DB: Store enriched data
    
    User->>Backend: Export to CRM
    Backend->>CRM: Push account + contacts
    CRM-->>User: Ready for outreach
```

---

## Component Architecture

```mermaid
graph LR
    subgraph Frontend
        UI[React UI<br/>Approval Portal]
    end
    
    subgraph Backend
        API[Express API<br/>Node.js]
        ICPService[ICP Service]
        LookAlikeService[LookAlike Service]
        ApolloService[Apollo Service]
    end
    
    subgraph Adapters
        SixSenseAdapter[6sense Adapter]
        ZoomInfoAdapter[ZoomInfo Adapter]
        DBAdapter[D&B Adapter]
    end
    
    subgraph Database
        PostgreSQL[(PostgreSQL)]
    end
    
    subgraph External
        SixSenseAPI[6sense API]
        ZoomInfoAPI[ZoomInfo API]
        DBAPI[D&B API]
        ApolloAPI[Apollo.io API]
    end
    
    UI <--> API
    API --> ICPService
    API --> LookAlikeService
    API --> ApolloService
    
    LookAlikeService --> SixSenseAdapter
    LookAlikeService --> ZoomInfoAdapter
    LookAlikeService --> DBAdapter
    
    SixSenseAdapter --> SixSenseAPI
    ZoomInfoAdapter --> ZoomInfoAPI
    DBAdapter --> DBAPI
    
    ApolloService --> ApolloAPI
    
    API <--> PostgreSQL
```

---

## To Generate PNG/SVG:

### Using Mermaid CLI (recommended)
```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Generate PNG
mmdc -i LookAlike_Architecture_Diagram.md -o LookAlike_Architecture.png -t forest

# Generate SVG (better quality)
mmdc -i LookAlike_Architecture_Diagram.md -o LookAlike_Architecture.svg
```

### Using Online Tool
1. Go to https://mermaid.live
2. Copy one of the diagrams above
3. Click "Actions" → "PNG" or "SVG"
4. Download the image
