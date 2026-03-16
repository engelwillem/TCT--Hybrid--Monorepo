# Audit: Inbox & DM

## Domain Overview
Inbox merepresentasikan sistem notifikasi dan perpesanan privat *Direct Message* (MessageThread) serta siaran (*Broadcast*).

## Temuan Inti
- Mekanisme Legacy Laravel memiliki tab *Messages* dan *Alerts* terpisah.
- `unread_count` perlu dibaca dalam *header navigation* (MobileAppLayout).
- `Mark as Read` function adalah krusial untuk *write-path-testing*.

## Target Parity
Sinkronisasi list perpesanan agar akurat (urutan *created_at*) dengan fungsionalitas memutasi status "unread = false".
