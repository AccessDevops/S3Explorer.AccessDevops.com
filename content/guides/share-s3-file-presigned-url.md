---
title: Share an S3 file with a presigned URL link
description: Generate an S3 presigned URL from the CLI, console or a desktop app, max expiry on AWS, R2, B2 and MinIO, and why a link dies before its expiry.
published: 2026-11-02
updated: 2026-11-02
providers: [aws, cloudflare, minio, backblaze, wasabi]
---

**In short:** a presigned URL lets someone download (or upload) one object without credentials, until a time written into the link. The ceiling is 7 days (604,800 seconds) on AWS S3 and on S3-compatible services that use the same signature scheme, and 12 hours from the AWS console. A link also dies early when the credentials that signed it expire or are deleted, which is the usual reason a "7-day" link stops working after an hour.

## What is a presigned URL?

It is the object's normal address with a signature and an expiry added to the query string:

```text
https://my-bucket.s3.eu-west-3.amazonaws.com/report.pdf
  ?X-Amz-Algorithm=AWS4-HMAC-SHA256
  &X-Amz-Credential=AKIA…/20261102/eu-west-3/s3/aws4_request
  &X-Amz-Date=20261102T091500Z
  &X-Amz-Expires=3600
  &X-Amz-SignedHeaders=host
  &X-Amz-Signature=…
```

The signature is computed on your machine from your secret key. Nothing is sent to S3 when the link is created, and S3 keeps no list of the links you issued. When someone opens it, S3 recomputes the signature and checks the expiry.

Three consequences follow:

- Anyone who has the link can use it, as many times as they like, until it expires. Treat it like a temporary password.
- The link only works for the HTTP method it was signed for: a `GET` link downloads, a `PUT` link uploads to that one key.
- There is no "revoke" button for one link. You can only make it fail by removing what it depends on (see below).

## How long can a presigned URL last?

| Where you create it | Maximum |
|---|---|
| AWS CLI and SDKs | **7 days** (604,800 s) |
| AWS S3 console | **12 hours** |
| Cloudflare R2 | **7 days** (1 s to 604,800 s) |
| MinIO (`mc share`) | **7 days** by default (`168h`) |
| Backblaze B2 native API (`b2_get_download_authorization`) | **7 days** |

The 7-day figure is not a quota you can raise. In AWS Signature Version 4 the signing key is derived from the date and is valid for seven days, so a signature cannot claim to be valid for longer. Ask for more and the SDK may build the URL anyway, but S3 rejects it with `AuthorizationQueryParametersError`.

The expiry is checked when a request starts. A large download that begins one second before the deadline finishes; a resumed download after the deadline fails.

## Why does my presigned URL expire early?

The link is only valid while the credentials that signed it are. Whichever ends first wins:

- **Temporary credentials.** A URL signed with an STS session (AssumeRole, SSO, a Lambda or ECS role) dies when the session ends. AssumeRole sessions last 1 hour by default; EC2 instance profile credentials last about 6 hours. Asking for 7 days from a role gives you a link that works for an hour.
- **A deleted or deactivated access key.** Rotate a key and every URL signed with it fails at once, days before its written expiry. Keep the old key active for 7 days after the switch if links signed with it are still in circulation.
- **A bucket policy on signature age.** On AWS, a `Deny` on the `s3:signatureAge` condition key rejects any presigned request older than the number of milliseconds you set, whatever the URL says. Useful as a safety net, surprising if you did not know it was there.

## How do I tell an expired link from a permission problem?

The HTTP status is `403` in most cases. Read the XML body, not just the code:

```bash
curl -sS "https://…presigned URL…" | head -8
```

- **`Request has expired`** inside an `AccessDenied` body: the expiry passed. Generate a new link.
- **`AuthorizationQueryParametersError`** (status 400): the link asked for more than 7 days.
- **`InvalidAccessKeyId`**: the key that signed the link no longer exists.
- **`ExpiredToken`**: the temporary credentials behind the link ran out.
- **`SignatureDoesNotMatch`**: the URL was changed on the way (a proxy, or a copy that cut it), the secret changed, or the signing machine's clock is off.
- **`AccessDenied`** with no mention of expiry: the signer lacks `s3:GetObject`, or a bucket policy denies the request.

The [S3 error codes guide](/guides/s3-error-codes/) covers these errors outside presigned URLs too.

## How do I generate one?

**AWS CLI** — default 1 hour, maximum 604,800 seconds:

```bash
aws s3 presign s3://my-bucket/report.pdf --expires-in 86400
```

For an S3-compatible service, add its endpoint:

```bash
aws s3 presign s3://my-bucket/report.pdf --expires-in 3600 \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

The CLI only signs `GET` links. Upload links (`PUT`) need an SDK call such as `generate_presigned_url("put_object", …)` in boto3.

**MinIO client:**

```bash
mc share download --expire 24h myminio/my-bucket/report.pdf
```

**AWS console** — select the object, then *Object actions → Share with a presigned URL*, up to 12 hours.

**S3 Explorer** — right-click an object and choose *Generate presigned URL*. The dialog asks for:

- the method: `GET` to share a download, or `PUT` to let someone upload to that key;
- the expiry: 5 min, 1 h, 6 h, 24 h, 7 days, or a custom number of seconds between 1 and 604,800.

Above 4 hours it asks you to confirm that the link acts as a temporary password, and on an `http://` endpoint it warns that the link would travel unencrypted. Once generated, it shows the expiry date and the access key that signed the link, which is the key that must stay active for the link to keep working. In a versioned bucket the same action is available on an older version from the Versions tab, so the link keeps pointing at that version even after the object is overwritten.

It works with every [provider S3 Explorer connects to](/providers/), with the endpoint and credentials already saved in your profile.

## What if a link must work longer than 7 days?

Do not store presigned URLs. Store the object key, and generate a short link (minutes) when someone actually clicks, behind your own login. For public delivery of private files on AWS, CloudFront signed URLs are signed with a CloudFront key pair and carry an expiry you choose, so the 7-day limit does not apply.

The reasoning behind the 7-day ceiling, the rotation trap and a bucket policy that caps signature age are detailed in [Presigned URLs expire at seven days. Then what?](https://blog.accessdevops.com/blog/presigned-url-seven-day-ceiling) on the AccessDevOps blog.

## Sources

- [Amazon S3 — Download and upload objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html): console 12 hours, CLI and SDK 7 days, temporary credentials, `s3:signatureAge`.
- [AWS CLI — s3 presign](https://docs.aws.amazon.com/cli/latest/reference/s3/presign.html): `--expires-in` default 3,600, maximum 604,800.
- [Cloudflare R2 — Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/): 1 second to 7 days, not usable on custom domains.
- [Backblaze B2 — b2_get_download_authorization](https://www.backblaze.com/apidocs/b2-get-download-authorization): `validDurationInSeconds` from 1 to 604,800.
- [MinIO — mc share download](https://docs.min.io/enterprise/aistor-object-store/reference/cli/mc-share/mc-share-download/): `--expire` defaults to `168h`.

Limits read from the providers' documentation on 2 November 2026.
