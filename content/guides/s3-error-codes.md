---
title: SignatureDoesNotMatch and other S3 errors, fixed
description: What SignatureDoesNotMatch, PermanentRedirect, AccessDenied, InvalidAccessKeyId and checksum errors mean on AWS S3, R2, MinIO and Ceph, and how to fix them.
published: 2026-10-15
providers: [aws, cloudflare, minio, ceph, backblaze, digitalocean]
---

**In short:** most S3 connection errors come from four settings: the secret key, the region, the endpoint, and the addressing style (path-style or virtual-hosted). On S3-compatible servers, a fifth cause is common since 2025: checksum headers that recent AWS SDKs send by default and older servers reject.

The descriptions quoted below are from the AWS S3 documentation.

## SignatureDoesNotMatch (403)

> The request signature that the server calculated does not match the signature that you provided. Check your AWS secret access key and signing method.

Usual causes:

- **Wrong secret key**, often a trailing space or a truncated paste. Some providers show the secret only once (Backblaze, for example): create a new key rather than guessing.
- **Wrong region in the signature.** The region is part of the signature. On providers without regions, use the value they document: `auto` on Cloudflare R2, any value (conventionally `us-east-1`) on MinIO.
- **A proxy rewriting the request** (host header, encoding of special characters in object keys).

## InvalidAccessKeyId (403)

> The AWS access key ID that you provided does not exist in our records.

The key belongs to another account or provider, was deleted, or is not an S3 key at all. Two classic cases: a Cloudflare API token created for Workers instead of an R2 S3 token, and a DigitalOcean API token instead of a Spaces key.

## PermanentRedirect (301) and AuthorizationHeaderMalformed (400)

> The bucket that you are attempting to access must be addressed using the specified endpoint.

On AWS, the bucket lives in a different region from the one configured. Set the region of the bucket, not of your account. `AuthorizationHeaderMalformed` ("the authorization header that you provided is not valid") often has the same cause.

## RequestTimeTooSkewed (403)

> The difference between the request time and the server's time is too large.

Signatures are time-stamped. Sync the clock of the client machine (NTP), or of the server on a self-hosted cluster.

## AccessDenied (403)

The keys are valid but not allowed to do this operation on this bucket. Check the IAM or bucket policy, the key's scope (Backblaze and R2 keys can be limited to one bucket), and whether listing all buckets is allowed: a key without `ListAllMyBuckets` can still use a bucket you name directly.

A 403 on a connection that worked an hour earlier often means temporary credentials (STS) have expired.

## Connection works but listing fails: addressing style

S3 has two URL styles: virtual-hosted (`bucket.endpoint`) and path-style (`endpoint/bucket`). AWS says path-style URLs "will be discontinued in the future".

- **MinIO** usually needs path-style.
- **DigitalOcean Spaces** and **AWS** expect virtual-hosted.
- Getting it wrong typically gives DNS errors or a listing that fails while the connection test passes.

## Checksum errors on uploads or batch deletes

AWS SDKs now calculate a checksum for every upload by default (`CRC64NVME` is the default algorithm). S3-compatible servers that predate this framework reject the headers. Cloudflare R2 documents which checksum types it supports; older MinIO releases and some enterprise systems reject them on batch deletes.

Fix: update the server, or use a client that falls back to the legacy `Content-MD5` header. S3 Explorer does this automatically.

## Sources

- [Billing for Amazon S3 error responses](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ErrorCodeBilling.html) (official descriptions of the error codes)
- [AWS: virtual-hosted and path-style requests](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html)
- [AWS: checking object integrity](https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html)
- [Cloudflare R2 S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/) (region `auto`, checksums)
- Provider specifics: [connection guides](/providers/)
