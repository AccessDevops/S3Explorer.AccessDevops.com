---
title: S3 pricing — AWS vs R2 vs Backblaze B2 vs Wasabi
description: Storage, egress and request prices of AWS S3, Cloudflare R2, Backblaze B2 and Wasabi from official price lists, with the minimums that change the bill.
published: 2026-10-15
providers: [aws, cloudflare, backblaze, wasabi]
---

**In short:** for 1,000 GB stored and served to the internet, AWS S3 Standard is the most expensive because of egress at $0.09/GB. Cloudflare R2 charges no egress at all. Backblaze B2 has the lowest storage price and free egress up to 3× what you store. Wasabi includes egress and requests but bills at least 1 TB and 90 days per object.

Prices below are the public pay-as-you-go list prices on October 15, 2026, in USD. AWS figures are for us-east-1.

## Price list

| | AWS S3 Standard | Cloudflare R2 Standard | Backblaze B2 | Wasabi |
|---|---|---|---|---|
| Storage per TB-month (1,000 GB) | $23 ($0.023/GB, first 50 TB) | $15 ($0.015/GB) | $6.95 | $7.99 |
| Egress to internet | $0.09/GB after the first 100 GB/month | Free | Free up to 3× average stored, then $0.01/GB | Free if it stays within the volume stored |
| Writes (PUT, LIST…) | $0.005 per 1,000 | $4.50 per million | Free (Class A) | Free |
| Reads (GET…) | $0.0004 per 1,000 | $0.36 per million | Free (Class B and C); Class D $0.004 per 10,000 after 2,500/day | Free |
| Free tier | 100 GB/month egress (all AWS) | 10 GB storage, 1M writes, 10M reads/month | First 10 GB storage | None |
| Minimums | None for Standard | None for Standard | None | 1 TB billed per month, 90 days per object, 4 KB per object |

## The minimums that change the bill

- **Wasabi** bills at least 1 TB of storage each month, and an object deleted before 90 days is billed for the remaining days. Free egress and API calls are under a fair-use policy: egress above the stored volume, or heavy API load from non-validated applications, can lead to service limits.
- **Backblaze B2** egress above three times the average stored volume costs $0.01/GB.
- **Cloudflare R2** Infrequent Access is cheaper to store ($0.01/GB) but has a 30-day minimum and a $0.01/GB retrieval fee.
- **AWS** egress through other AWS services and CloudFront is priced differently from direct internet egress.

## Example: 1,000 GB stored, 1,000 GB downloaded per month

Storage plus internet egress only, list prices, request costs left out:

| | Storage | Egress | Total |
|---|---|---|---|
| AWS S3 | 1,000 GB × $0.023 = $23.00 | 900 GB × $0.09 = $81.00 (100 GB free) | ≈ $104 |
| Cloudflare R2 | 990 GB × $0.015 = $14.85 (10 GB free) | $0 | ≈ $15 |
| Backblaze B2 | 990 GB × $0.00695 = $6.88 (10 GB free) | $0 (within 3×) | ≈ $7 |
| Wasabi | $7.99 | $0 (within policy) | ≈ $8 |

AWS's free 100 GB of egress is shared across all AWS services in the account.

With a small dataset, the picture changes: 100 GB on Wasabi is still billed as 1 TB, while R2 and B2 charge for what is stored.

## Which one fits

- **Public assets, heavy downloads**: R2 (no egress).
- **Backups and archives, mostly written**: B2 or Wasabi, keeping Wasabi's 90-day minimum in mind.
- **Workloads that already run on AWS**: S3, where transfers to AWS services are cheaper than to the internet.

All four speak the S3 API, so the same client works with each; see the [connection guides](/providers/).

## Sources

- [AWS price list API, S3 us-east-1](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json) and [data transfer](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/us-east-1/index.json); [Amazon S3 pricing](https://aws.amazon.com/s3/pricing/)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Backblaze B2 pricing](https://www.backblaze.com/cloud-storage/pricing)
- [Wasabi pricing](https://wasabi.com/pricing) and [pricing FAQ](https://wasabi.com/pricing/faq)

*Prices change: check the providers' pages before deciding. Last checked October 15, 2026.*
