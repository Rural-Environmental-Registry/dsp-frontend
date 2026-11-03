# rer-dsp-frontend

> [!IMPORTANT]
> This repository is one module of the **DSP (Data Sharing Platform)**, part of the RER ecosystem. Full project documentation lives in **[dsp-docs](https://github.com/Rural-Environmental-Registry/dsp-docs)**. The information below covers this module only, and only briefly.
>
> **[Go to the DSP documentation](https://rural-environmental-registry.github.io/dsp-docs)**

## Where this module fits in the DSP

```mermaid
flowchart LR
  browser["BROWSER<br/>Public map consultation."]
  gw["GATEWAY<br/>nginx · single HTTP entry.<br/>/dsp/ · /dsp-backend/ · GeoServers."]

  srcDb[("YOUR DATABASE<br/>Your organization's DB to migrate from.<br/>Source for the DSP.")]
  jobMig["JOB-DATA-MIGRATION<br/>Spring Batch ETL.<br/>source → dsp-db + geoserver-db."]
  jobGeo["JOB-GEO-FILE-GENERATION<br/>Pre-generates download files."]
  core["CORE<br/>CONFIG · SETUP · START.<br/>Prepares DBs and orchestrates modules."]

  dspDb[("DSP DB<br/>Operational: business + bbox/centroid.")]
  gsDb[("GEOSERVER DB<br/>Full geometry dsp.*<br/>Read by both GeoServers.")]
  objStor[("OBJECT STORAGE<br/>SeaweedFS S3.<br/>")]

  be["DSP BACKEND<br/>REST API and business rules."]

  gsEx["GEOSERVER-EXHIBITION<br/>Publishes layers for viewing.<br/>WMS/WFS map service."]
  gsDl["GEOSERVER-DOWNLOAD<br/>WFS for download export.<br/>Used by the backend."]

  subgraph thisRepo ["This repository"]
    fe["DSP FRONTEND<br/>Web platform UI.<br/>Consultation, maps, sharing."]
  end

  browser --> gw
  gw -->|/dsp/| fe
  gw -->|/dsp-backend/| be
  gw -->|/geoserver-exhibition/| gsEx

  jobMig -->|read| srcDb
  jobMig -->|"business + bbox/centroid"| dspDb
  jobMig -->|"full geom"| gsDb
  core -.config/schema/build.-> jobMig
  core -.-> jobGeo
  core -.-> dspDb
  core -.-> gsDb
  core -.-> objStor
  core -.-> gw
  core -.-> be
  core -.-> fe
  core -.-> gsEx
  core -.-> gsDl

  dspDb --> be
  gsDb --> gsEx
  gsDb --> gsDl
  gsDb --> jobGeo
  jobGeo -->|"pre-generated CSV"| objStor
  be -->|WFS downloads| gsDl
  be -->|CSV when available| objStor

  classDef plain fill:#ffffff,color:#334155,stroke:#cbd5e1,stroke-width:1px
  classDef here fill:#fef08a,color:#713f12,stroke:#ca8a04,stroke-width:2px

  class browser,gw,srcDb,jobMig,jobGeo,core,dspDb,gsDb,objStor,be,gsEx,gsDl plain
  class fe here

  style thisRepo fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#713f12
```

## Purpose

Web interface for viewing and sharing rural environmental data among RER partner institutions.

## Responsibilities

- Display environmental data and maps (WMS layers)
- Consume the `rer-dsp-backend` REST API
- Provide the DSP platform user experience

## Technologies

Vue 3, Vite, TypeScript, Tailwind CSS.

## License

[GNU General Public License v3.0](LICENSE)

<small><strong>Copyright © 2026 Government of Brazil — Ministry of Management and Innovation in Public Services</strong></small>
