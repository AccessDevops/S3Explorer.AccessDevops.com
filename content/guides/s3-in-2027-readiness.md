---
title: S3 in 2027 — the EU Data Act deadline
description: From 12 January 2027 the EU Data Act removes switching charges, data egress included. What it covers, what it does not, and what to inventory first.
published: 2026-11-08
providers: [aws, cloudflare, minio, backblaze, wasabi, ovhcloud]
---

**In short:** from 12 January 2027, Article 29 of the EU Data Act forbids providers from charging you for the egress involved in *leaving* them. Everyday egress and multi-cloud egress are not covered and stay on the invoice. The deadline removes a bill, not a project: the work is knowing what your buckets contain, what is billable in them, and who can read it. Three commands cover most of it.

## What actually changes

Regulation (EU) 2023/2854 applies from 12 September 2025 (Article 50). Article 29 then withdraws switching charges in two steps:

- Between 11 January 2024 and 12 January 2027, a provider **may** charge reduced switching charges, which "shall not exceed the costs incurred by the provider of data processing services that are directly linked to the switching process concerned" (Article 29(2) and 29(3)).
- "From 12 January 2027, providers of data processing services shall not impose any switching charges on the customer for the switching process" (Article 29(1)).

Egress is explicitly inside that definition. Article 2(36) defines switching charges as charges "imposed by a provider of data processing services on a customer for the actions mandated by this Regulation for switching to the system of a different provider or to on-premises ICT infrastructure, **including data egress charges**".

Read the boundaries before you build a migration budget on it:

| | Covered by Article 29 |
|---|---|
| Egress to export your data when you leave a provider | Yes, zero from 12 January 2027 |
| Egress for running two providers in parallel | **No** — chargeable at cost |
| Everyday internet egress, CDN pulls, cross-region transfer | **No** — unaffected |
| Early termination penalties on a fixed-term contract | **No** — excluded by definition |

The multi-cloud case is the one people get wrong. Article 34(2) is explicit: "Where a data processing service is being used in parallel with another data processing service, the providers of data processing services may impose data egress charges, but only for the purpose of passing on egress costs incurred, without exceeding such costs." Parallel use is an ongoing activity, not a one-off exit, and the law treats it differently.

Everyday egress is untouched for a simpler reason: Article 2(36) carves "standard service fees" out of the definition. Nothing in the Regulation obliges a provider to stop billing normal traffic.

Two other dates matter if you are planning the move. The notice period to start switching cannot exceed two months, and the transitional period is capped at 30 calendar days (Article 25(2), points (d) and (a)).

## The three inventories

**1. What you pay for and cannot see.** Interrupted multipart uploads keep their parts. They are billed as storage and absent from every object listing, which is how a bucket looks empty and bills like it is full. This is the most common finding on an inherited account.

**2. What exists more than once.** Non-current object versions are billable and invisible in the default view. On a bucket with versioning enabled by policy and never expired, this is often the largest line of the bill.

**3. Who may read what.** Tag-based policies express tenancy without enumerating prefixes, but tags do not appear in `ListObjectsV2`, and `s3:ExistingObjectTag` is not supported as a condition on `PutObject` or `DeleteObject`. A policy you cannot inspect is a policy you cannot migrate.

## Do this now, not in December 2026

```
aws s3api list-multipart-uploads --bucket my-bucket
aws s3api list-object-versions  --bucket my-bucket --max-items 100
aws s3api get-bucket-tagging    --bucket my-bucket
```

For an S3-compatible provider, add `--endpoint-url`.

Then:

1. **Abort what is orphaned**, and add an `AbortIncompleteMultipartUpload` lifecycle rule so it does not come back. The rule does not clean the past; it only stops the future. The [incomplete multipart uploads guide](/guides/incomplete-multipart-uploads/) has the exact commands.
2. **Expire non-current versions** with a deliberate retention window, not a guess.
3. **Tag your buckets for cost allocation**, so egress can be attributed before anyone asks you to.
4. **Test a second provider while nothing forces you to.** One bucket, one key, one file with a checksum. That tells you whether "S3-compatible" means compatible with your client or with someone's 2023 SDK — and doing it now costs you the parallel-use egress above, which is capped at the provider's cost.

## Where S3 Explorer helps

The gap the deadline exposes is visibility, not storage. A viewer that lists objects and stops there leaves you where the Regulation found you.

In [S3 Explorer](/), testing a connection reports how many buckets the credentials can actually see before you browse anything. Bucket cards flag incomplete uploads older than a threshold — 24 hours by default, settable from 1 to 720 hours in Settings → Performance — and the dialog lists each upload with its key, age and size, then aborts them. The Metadata and Versions tabs show what a listing hides, with a count on each tab. A request metrics panel breaks down the calls you make by operation and category, so the traffic you pay for is visible while you work.

Connection profiles are per endpoint, so testing a second provider is a two-minute job rather than a migration. It runs on Windows, macOS and Linux; [the licence page](/buy/) has the pricing, and [what object storage really costs](/guides/s3-storage-pricing-comparison/) compares the providers on storage, egress and requests.

## Sources

- [Regulation (EU) 2023/2854 (Data Act)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R2854) — Article 2(36) (definition), Article 25(2) (notice and transitional periods), Article 29 (withdrawal of switching charges), Article 34(2) (in-parallel use), Article 50 (application from 12 September 2025). Text read on 8 November 2026.
- [European Commission — Data Act](https://digital-strategy.ec.europa.eu/en/policies/data-act) — entry into force 11 January 2024, application 12 September 2025.
- The longer analysis, with the dated figures: [S3 in 2027: the egress bill changes on 12 January](https://blog.accessdevops.com/blog/s3-in-2027-egress-bill-changes).

This guide summarises a regulation; it is not legal advice.
