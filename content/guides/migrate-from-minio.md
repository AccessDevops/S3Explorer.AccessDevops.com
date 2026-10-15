---
title: Migrating from MinIO to Silo, Garage or RustFS
description: Step by step: move data off an unmaintained MinIO to Silo in place, or to Garage or RustFS through S3 with rclone, and check it before switching.
published: 2026-10-15
providers: [minio, ceph]
---

**In short:** there are two ways off the community MinIO. Silo, a maintained fork of the same server, can replace the MinIO binary or image on the existing data. Any other target (Garage, RustFS, SeaweedFS, Ceph, a managed provider) means copying the data through the S3 API, typically with `rclone sync`. In both cases, test on a copy first.

Background: [why MinIO is no longer maintained](/guides/minio-alternatives/).

## Before you start: inventory

List what the applications rely on, because not everything has an equivalent on the target:

- buckets, and their versioning and object lock settings;
- users, access keys and policies;
- lifecycle rules and replication;
- the S3 calls the applications make (multipart, presigned URLs, batch delete).

## Path A: Silo, in place

Silo is a community-maintained continuation of the open-source MinIO server: same server, rebuilt binaries and multi-arch images, security fixes, and the full web console.

1. Stop MinIO and **back up the data directory**.
2. Replace the image `minio/minio` with `pgsty/silo` (or the binary from Silo's releases), keeping the same data path, ports and credentials.
3. Start it and check buckets, users and policies before reopening traffic.

The client is bundled as `mcli` in the Silo image. Check Silo's README for the current release and any migration notes.

## Path B: copy through S3

This works for any target, and is the documented way to move to RustFS: its compatibility with MinIO's on-disk format is a preview feature, not part of the default build.

### 1. Prepare the target

Example with Garage (from its quick start):

```
garage key create migration-key
garage bucket create my-bucket
garage bucket allow --read --write --owner my-bucket --key migration-key
```

Garage listens for S3 on port `3900` by default, with region `garage`.

### 2. Configure both ends in rclone

Two S3 remotes in `rclone.conf`, for example `old` (MinIO) and `new` (Garage, RustFS…), each with its endpoint, keys and region.

### 3. Dry run, then copy

```
rclone sync old:my-bucket new:my-bucket --dry-run
rclone sync old:my-bucket new:my-bucket --checksum --metadata --progress
```

`rclone sync` makes the destination identical to the source, deleting extra files on the destination, which is why the dry run comes first. `--checksum` compares by checksum instead of size and modification time; `--metadata` copies object metadata, which rclone does not do by default.

Object versions, ACLs and policies are not carried over by a sync: recreate policies and keys on the target.

### 4. Verify

```
rclone check old:my-bucket new:my-bucket
```

Then point a test instance of each application at the new endpoint and exercise the operations from the inventory.

### 5. Switch and keep a way back

Repeat the sync just before switching to catch recent writes, move the applications, and keep the old MinIO read-only until the new storage has run in production for a while.

During the move, a client that connects to both endpoints, such as [S3 Explorer](/), makes it easy to compare buckets side by side.

## Sources

- [Silo README](https://github.com/pgsty/silo) (fork of MinIO, image `pgsty/silo`, bundled `mcli`)
- [RustFS README](https://github.com/rustfs/rustfs) (MinIO on-disk compatibility in preview, migrate through S3)
- [Garage quick start](https://garagehq.deuxfleurs.fr/documentation/quick-start/)
- [rclone sync](https://rclone.org/commands/rclone_sync/) and [rclone check](https://rclone.org/commands/rclone_check/)
