---
title: S3 viewer — preview files without downloading
description: Why an S3 object does not open in a browser, how presigned URLs and the AWS console handle previews, and the Content-Type setting that decides whether a file displays or downloads.
published: 2026-11-02
providers: [aws, cloudflare, minio, backblaze, wasabi]
---

**In short:** an S3 object has no public URL by default, so pasting its path into a browser returns `AccessDenied`. The three ways to look at one without pulling it to disk are a presigned URL, the provider's web console, or a desktop client. Whichever you use, the object's `Content-Type` decides whether the browser displays the file or downloads it — and uploads frequently set that header wrong.

## Why the object does not just open

Two things stand between you and a preview.

**The object is private.** Buckets are private at creation, and the right fix is almost never to make them public. A viewer therefore needs credentials, and a plain URL carries none.

**The browser needs to be told what the file is.** S3 stores a `Content-Type` with every object and returns it as a response header. A JSON file stored as `application/json` renders in the browser; the same file stored as `application/octet-stream` triggers a download instead.

## Option 1: a presigned URL

A presigned URL is the object's address plus a signature and an expiry, so anyone holding it can read that one object until it expires — no credentials, no bucket policy change.

```bash
aws s3 presign s3://my-bucket/report.pdf --expires-in 300
```

Good for: showing one file to someone outside your team, or opening something quickly from a terminal.

The limit is that it is per object. Browsing a prefix means generating a URL for every file you want to look at.

## Option 2: the provider's web console

The AWS S3 console opens an object in a new tab through a presigned URL, and the consoles of R2, Backblaze B2 and Wasabi offer the same thing. No install, works from anywhere you can log in.

The limit is navigation. A console lists a page of keys at a time, and finding one file in a prefix with hundreds of thousands of objects means paging through them or already knowing the key.

## Option 3: a desktop client

[S3 Explorer](/) connects with your own credentials and opens an object in place, without writing it to disk first. Five kinds of file open in the window:

| File | What opens |
|---|---|
| Text, code, JSON, YAML, CSV, logs | Syntax-highlighted editor; edits save back to the same key |
| Images | Viewer that also crops, rotates and annotates, saving as PNG or JPEG |
| PDF | Rendered inline |
| Audio | Player |
| Video | Player |

Anything else offers a download rather than pretending to render it.

Large objects are guarded rather than loaded blindly: past a size you set in the settings it warns before fetching, and past a second threshold it stops and offers the download instead. That matters on video, where a preview means pulling a large object over the network.

It keeps a local index of the bucket, so searching a bucket with millions of objects does not mean paging through listings. The free version has every feature, with up to 5 connection profiles.

See the [connection guides](/providers/) for the endpoint and region each provider expects.

## The Content-Type trap

This is the thing that wastes an afternoon.

Many upload paths do not look at the file extension. The AWS CLI guesses from it, but SDK calls, `rclone` with some flags, and anything writing a raw stream will store `application/octet-stream` or `binary/octet-stream` unless told otherwise. The object is intact; it simply announces itself as an unknown binary, so every viewer downloads it rather than displaying it.

Check what an object claims to be:

```bash
aws s3api head-object --bucket my-bucket --key report.pdf --query ContentType
```

Fix it in place, without re-uploading, by copying the object over itself with new metadata:

```bash
aws s3 cp s3://my-bucket/report.pdf s3://my-bucket/report.pdf \
  --content-type application/pdf --metadata-directive REPLACE
```

S3 Explorer compares the stored type against the file itself when it opens an object. When the two disagree it says so and offers the correct type in one click, which is quicker than the copy-over-itself trick above and finds the problem on files you had not thought to check.
