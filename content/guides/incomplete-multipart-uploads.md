---
title: Incomplete multipart uploads — find and delete them
description: Interrupted S3 multipart uploads keep their parts, and AWS bills them as storage. How to find them, delete them, and prevent them with a lifecycle rule.
published: 2026-10-15
providers: [aws, cloudflare, minio, backblaze, wasabi]
---

**In short:** when a multipart upload is interrupted and never completed or aborted, its parts stay in the bucket. They are invisible in normal listings, but AWS bills them as storage until the upload is aborted. List them with `ListMultipartUploads`, abort them with `AbortMultipartUpload`, and add a lifecycle rule so they are cleaned up automatically.

## Why they cost money

Large files are uploaded in parts. The AWS documentation is explicit: after you initiate a multipart upload, S3 retains all parts until you complete or stop it, and "throughout its lifetime, you are billed for all storage, bandwidth, and requests for this multipart upload and its associated parts". Aborting deletes the parts, with no early-delete charge.

Interrupted uploads are common: closed laptops, killed scripts, failed CI jobs, network drops on multi-gigabyte files.

## Find them

With the AWS CLI:

```
aws s3api list-multipart-uploads --bucket my-bucket
```

Each entry shows the key, the `UploadId` and when it was initiated. For an S3-compatible provider, add `--endpoint-url`.

With [S3 Explorer](/), the incomplete uploads of a bucket are listed in a dedicated dialog with their key, age and size, can be filtered by age, and aborted from there.

## Delete them

```
aws s3api abort-multipart-upload --bucket my-bucket --key path/to/file --upload-id <UploadId>
```

Only abort uploads that are not in progress: aborting an active upload makes it fail.

## Prevent them: a lifecycle rule

AWS recommends a lifecycle rule with the `AbortIncompleteMultipartUpload` action:

```
<LifecycleConfiguration>
  <Rule>
    <ID>abort-incomplete-uploads</ID>
    <Filter/>
    <Status>Enabled</Status>
    <AbortIncompleteMultipartUpload>
      <DaysAfterInitiation>7</DaysAfterInitiation>
    </AbortIncompleteMultipartUpload>
  </Rule>
</LifecycleConfiguration>
```

Uploads completed within the period are not affected, and the rule applies only to incomplete uploads, never to objects.

## On S3-compatible providers

- **Cloudflare R2** aborts incomplete multipart uploads automatically after 7 days by default; a lifecycle policy can change the delay.
- **Other providers** differ in lifecycle support. Check their S3 compatibility page, and fall back to listing and aborting manually.

## Sources

- [AWS: uploading objects using multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) (billing of parts)
- [AWS: lifecycle rule to abort incomplete multipart uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html)
- [Cloudflare R2: multipart objects](https://developers.cloudflare.com/r2/objects/multipart-objects/) (7-day automatic abort)
