// Hand-written editorial for the providers that have a page.
//
// provider-details.ts carries the generated facts (endpoint shape, regions,
// addressing mode, docs link). This file carries what a generator cannot
// produce: a worked example someone can copy, and the failure modes that
// actually cost people an afternoon.
//
// A provider gets a page ONLY if it has an entry here. Twenty-five pages
// built from the generated fields alone would be the same ~180 words with
// three values swapped, which search engines classify as doorway pages and
// penalise across the whole domain. Adding a provider means writing it up.
//
// Every credential below is fabricated. The AWS pair is the one Amazon
// publishes in its own documentation precisely so it can be recognised as
// an example; the others follow each provider's real key shape so the
// format is recognisable, with EXAMPLE spelled out inside.

export interface ProviderExample {
  /** Leave undefined when the provider needs no endpoint (AWS). */
  endpoint?: string
  region?: string
  accessKey: string
  secretKey: string
  /** What the app's "Path-style" toggle ends up on, and whether it is locked. */
  addressing: 'Path-style (locked)' | 'Path-style' | 'Virtual-hosted (locked)' | 'Virtual-hosted'
  note?: string
}

export interface Gotcha {
  title: string
  body: string
}

export interface ProviderContent {
  /** ~155 chars: meta description and search snippet. */
  summary: string
  /** Two or three sentences opening the page. */
  intro: string
  example: ProviderExample
  gotchas: Gotcha[]
}

export const PROVIDER_CONTENT: Record<string, ProviderContent> = {
  // ---------------------------------------------------------------- cloud
  aws: {
    summary: 'Connect S3 Explorer to Amazon S3: no endpoint to fill in, region-based routing, virtual-hosted addressing and temporary STS credentials.',
    intro: 'Amazon S3 is the only provider in S3 Explorer that needs no endpoint URL at all. The SDK derives it from the region, which is why the endpoint field stays empty and the region field does the work. It is also the only one where temporary credentials are the norm rather than the exception.',
    example: {
      region: 'eu-west-3',
      accessKey: 'AKIAIOSFODNN7EXAMPLE',
      secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      addressing: 'Virtual-hosted',
      note: 'Leave the endpoint empty. Those two keys are the example pair published in AWS documentation — they authenticate nothing.',
    },
    gotchas: [
      {
        title: 'Path-style is deprecated, not removed',
        body: 'AWS announced the retirement of path-style addressing in 2020 and then kept it alive for existing buckets. New buckets should assume virtual-hosted only. If you are migrating a script that forced path-style, that is the setting to drop first.',
      },
      {
        title: 'Session tokens expire mid-session',
        body: 'Credentials from STS or AssumeRole carry an expiry, usually one hour. A connection that worked at 09:00 and returns 403 at 10:05 has not been misconfigured — the token lapsed. Generate a new one rather than re-checking the keys.',
      },
      {
        title: 'The region has to match the bucket',
        body: 'Pointing a eu-west-3 profile at a bucket in us-east-1 fails with a redirect error rather than a clear message. S3 Explorer ships all 27 AWS regions in the dropdown so you can switch without retyping.',
      },
    ],
  },

  gcs: {
    summary: 'Connect S3 Explorer to Google Cloud Storage through the interoperability API: fixed endpoint, HMAC keys, and why service account keys will not work.',
    intro: 'Google Cloud Storage speaks S3 through what Google calls its interoperability API. The endpoint is fixed and the credentials are HMAC keys — not the service account JSON most GCP documentation points you to. That single distinction accounts for most failed first connections.',
    example: {
      endpoint: 'https://storage.googleapis.com',
      region: 'auto',
      accessKey: 'GOOG1EEXAMPLEACCESSKEY0123456789',
      secretKey: 'EXAMPLEhmacSecretDoNotUse0123456789abcdef',
      addressing: 'Path-style',
      note: 'HMAC access keys always start with GOOG1E, which is a quick way to tell you picked up the right credential type.',
    },
    gotchas: [
      {
        title: 'Interoperability has to be switched on first',
        body: 'In the GCP console, Cloud Storage → Settings → Interoperability. Until it is enabled the endpoint answers, but every request is rejected — which reads like bad credentials rather than a disabled API.',
      },
      {
        title: 'Service account keys are not HMAC keys',
        body: 'The JSON file you download for a service account cannot be used here. HMAC keys are generated separately on the same Interoperability tab, and can be attached to either a user or a service account.',
      },
      {
        title: 'The S3 surface is a subset',
        body: 'Google implements the parts of the S3 API that map onto its own model. Core browsing, upload and download behave normally; the further you go into tagging, versioning details or multipart edge cases, the more likely you are to hit something unimplemented.',
      },
    ],
  },

  // ----------------------------------------------------------- specialist
  cloudflare: {
    summary: 'Connect S3 Explorer to Cloudflare R2: account-scoped endpoint, mandatory path-style addressing, no regions and no egress fees.',
    intro: 'Cloudflare R2 is the provider that departs most from the AWS model while still speaking S3. There are no regions — storage is globally distributed — and path-style addressing is not a preference but a requirement. S3 Explorer locks the toggle for you.',
    example: {
      endpoint: 'https://a1b2c3d4e5f6example0000000000000.r2.cloudflarestorage.com',
      region: 'auto',
      accessKey: 'a1b2c3d4e5f6example000000000000',
      secretKey: 'd2e3f4a5b6c7example00000000000000000000000000000000000000000000',
      addressing: 'Path-style (locked)',
      note: 'The long hexadecimal string in the endpoint is your Cloudflare account ID — it is visible in the dashboard URL once you are logged in.',
    },
    gotchas: [
      {
        title: 'Region "auto" is the only correct answer',
        body: 'R2 has no regional concept. Tools that insist on a region generally accept auto or us-east-1 and ignore it. Do not try to match a region to where your data physically sits; the question does not apply.',
      },
      {
        title: 'The token must be created with S3 auth',
        body: 'R2 → Manage R2 API Tokens. A token created for the Workers binding will not authenticate an S3 client. Pick the S3-compatible option and you get an access key / secret key pair in the familiar shape.',
      },
      {
        title: 'No egress fees changes how you use it',
        body: 'R2 bills storage and operations but not bandwidth out. Pulling a large bucket down to inspect it locally costs nothing beyond the request count, which is not true on most of the providers here.',
      },
    ],
  },

  backblaze: {
    summary: 'Connect S3 Explorer to Backblaze B2 over the S3-compatible API: cluster-specific endpoints, keyID as access key, and both addressing styles supported.',
    intro: 'Backblaze B2 exposes an S3-compatible API alongside its own native one. The catch is the endpoint: it carries a cluster identifier that differs between accounts, so the generic pattern is only a starting point — the exact value is printed in your bucket details.',
    example: {
      endpoint: 'https://s3.us-west-004.backblazeb2.com',
      region: 'us-west-004',
      accessKey: '005example0b2keyid000001',
      secretKey: 'K005EXAMPLEapplicationKeyDoNotUse00',
      addressing: 'Virtual-hosted',
      note: 'In the B2 console the keyID is your access key and the applicationKey is your secret — they are labelled differently from every other provider here.',
    },
    gotchas: [
      {
        title: 'The cluster number is part of the region',
        body: 'us-west-004 is not a typo of us-west-2. The trailing digits identify the storage cluster your account lives on, and they differ between accounts created at different times. Copy the endpoint from your bucket page rather than guessing.',
      },
      {
        title: 'The application key is shown once',
        body: 'B2 displays the applicationKey at creation and never again. If it was not saved, the key has to be deleted and recreated — there is no way to reveal it afterwards.',
      },
      {
        title: 'Master keys cannot be scoped',
        body: 'The account master key works but grants everything. For a client you leave connected, create a per-bucket application key instead; B2 lets you restrict both the bucket and the prefix.',
      },
    ],
  },

  wasabi: {
    summary: 'Connect S3 Explorer to Wasabi hot cloud storage: AWS-shaped regions and credentials, region-specific endpoints, no per-request fees.',
    intro: 'Wasabi is the provider that behaves most like Amazon S3 without being it. Region names follow AWS conventions, credentials have the same shape, and the pricing model drops per-request fees. In practice the only thing you have to get right is the endpoint, which carries the region.',
    example: {
      endpoint: 'https://s3.eu-central-1.wasabisys.com',
      region: 'eu-central-1',
      accessKey: 'WASABIEXAMPLEACCESSKEY',
      secretKey: 'EXAMPLEwasabiSecretKeyDoNotUse0123456789',
      addressing: 'Virtual-hosted',
      note: 'The region in the endpoint and the region field must agree. A mismatch is the single most common Wasabi connection failure.',
    },
    gotchas: [
      {
        title: 'eu-central-1 is Amsterdam, not Frankfurt',
        body: 'Wasabi reuses AWS region names without reusing AWS locations. If data residency matters, check Wasabi’s own region map rather than assuming the AWS geography.',
      },
      {
        title: 'Minimum storage duration applies',
        body: 'Objects are billed for a minimum retention period regardless of when you delete them. Using a Wasabi bucket as scratch space for short-lived files costs more than the headline price suggests.',
      },
      {
        title: 'Compatibility is close, not identical',
        body: 'Wasabi advertises full S3 API compatibility and gets very close. The differences surface around newer features — the flexible checksum framework and some lifecycle behaviours — rather than in everyday browsing.',
      },
    ],
  },

  digitalocean: {
    summary: 'Connect S3 Explorer to DigitalOcean Spaces: region-based endpoints, virtual-hosted addressing only, and Spaces keys separate from the API token.',
    intro: 'DigitalOcean Spaces puts the region in the hostname and accepts nothing else: path-style addressing is unsupported, so S3 Explorer locks the toggle to virtual-hosted. Credentials come from a dedicated Spaces section, not from the general-purpose API token you may already have.',
    example: {
      endpoint: 'https://fra1.digitaloceanspaces.com',
      region: 'fra1',
      accessKey: 'DOEXAMPLEACCESSKEY001',
      secretKey: 'EXAMPLEdoSpacesSecretKeyDoNotUse0123456789a',
      addressing: 'Virtual-hosted (locked)',
      note: 'The region code appears twice — in the endpoint and in the region field — and the two have to match.',
    },
    gotchas: [
      {
        title: 'Spaces keys are not API tokens',
        body: 'The personal access token used for the DigitalOcean API will not authenticate here. Generate a key pair under API → Spaces Keys; it is the only credential type Spaces accepts.',
      },
      {
        title: 'Path-style simply does not answer',
        body: 'Forcing path-style produces a connection that resolves and then fails on every listing. If you are porting a configuration from MinIO, where path-style is mandatory, this is the setting that has to be inverted.',
      },
      {
        title: 'The CDN endpoint is a different hostname',
        body: 'Spaces can front a bucket with a CDN on a *.cdn.digitaloceanspaces.com hostname. That endpoint serves content but is not the S3 API — point the client at the origin endpoint.',
      },
    ],
  },

  ovhcloud: {
    summary: 'Connect S3 Explorer to OVHcloud Object Storage: datacenter-coded regions, S3 users created under Public Cloud, and the high-performance S3 endpoint.',
    intro: 'OVHcloud names its regions after datacenters — gra for Gravelines, sbg for Strasbourg, bhs for Beauharnois — rather than after compass directions. Credentials are not account-level: you create a user inside a Public Cloud project and grant it an object storage role.',
    example: {
      endpoint: 'https://s3.gra.cloud.ovh.net',
      region: 'gra',
      accessKey: 'example0ovhaccesskey00000000000a',
      secretKey: 'example0ovhsecretkey00000000000b',
      addressing: 'Virtual-hosted',
      note: 'gra is Gravelines, in northern France. The full list in the app is gra, sbg, bhs, de, uk and waw.',
    },
    gotchas: [
      {
        title: 'Two object storage products share a name',
        body: 'OVHcloud offers a Swift-based storage and an S3-compatible one. Only the latter answers on s3.{region}.cloud.ovh.net. If your container was created through the Swift interface it will not appear over S3.',
      },
      {
        title: 'The user needs an explicit role',
        body: 'Creating a user under Users & Roles is not enough — it must be given an object storage role, and the S3 credentials are generated separately once that role is attached.',
      },
      {
        title: 'Region codes are not interchangeable with AWS',
        body: 'There is no eu-west-1 here. Scripts carried over from AWS will fail on the region value before they ever reach authentication.',
      },
    ],
  },

  // ----------------------------------------------------------- self-hosted
  minio: {
    summary: 'Connect S3 Explorer to a MinIO server: full URL with port, mandatory path-style addressing, ignored regions, and the single-drive listing trap.',
    intro: 'MinIO is the most common self-hosted S3 implementation and the one with the fewest surprises in day-to-day use. Two things differ from a cloud provider: you supply the full URL including the port, and path-style addressing is not optional. S3 Explorer locks the toggle accordingly.',
    example: {
      endpoint: 'https://minio.example.internal:9000',
      region: 'us-east-1',
      accessKey: 'minio-readwrite-user',
      secretKey: 'EXAMPLEminioSecretDoNotUse0123456789',
      addressing: 'Path-style (locked)',
      note: 'For a local development server the URL is usually http://192.168.1.10:9000 with the minioadmin / minioadmin default pair. Do not leave those defaults on anything reachable from outside.',
    },
    gotchas: [
      {
        title: 'An object and a folder with the same name can break listings',
        body: 'On a single-drive deployment (xl-single), creating an object called reports and a prefix called reports/ in the same place can corrupt what the server returns for that listing. The files remain intact and retrievable by exact key, but they stop appearing. S3 Explorer warns before you create such a name.',
      },
      {
        title: 'The region is accepted and ignored',
        body: 'MinIO does not implement regions. Any value works; us-east-1 is the conventional filler. If a tool refuses to connect without one, that is the value to type.',
      },
      {
        title: 'TLS has to match the scheme',
        body: 'A server started without certificates answers on http only. Pointing an https URL at it produces a handshake failure rather than a clear refusal — check the scheme before suspecting the credentials.',
      },
      {
        title: 'Older servers reject modern checksums',
        body: 'MinIO releases before 2025 do not implement the flexible checksum framework the AWS SDK now sends by default, and reject batch deletes that carry it. S3 Explorer falls back to the legacy Content-MD5 header automatically.',
      },
    ],
  },

  ceph: {
    summary: 'Connect S3 Explorer to Ceph RADOS Gateway: default port 7480, credentials from radosgw-admin, SigV2 and SigV4 both supported.',
    intro: 'Ceph exposes S3 through the RADOS Gateway, which listens on port 7480 by default. Credentials are not created in a web console but on the command line, and the output of a single radosgw-admin invocation gives you both halves of the pair.',
    example: {
      endpoint: 'http://ceph-rgw.example.internal:7480',
      region: 'default',
      accessKey: 'CEPHEXAMPLEACCESSKEY',
      secretKey: 'EXAMPLEcephSecretKeyDoNotUse0123456789aa',
      addressing: 'Path-style',
      note: 'radosgw-admin user create --uid=myuser --display-name="My User" prints a keys block containing access_key and secret_key. Those are the two values to copy.',
    },
    gotchas: [
      {
        title: 'Multi-tenant clusters need the tenant in the user id',
        body: 'On a cluster using tenants, the uid takes the form tenant$user and bucket names are scoped per tenant. A connection that authenticates but shows no buckets is usually looking at the wrong tenant.',
      },
      {
        title: 'Both signature versions are accepted',
        body: 'RADOS Gateway implements SigV2 and SigV4. This matters when a load balancer or proxy in front of it rewrites headers: signature failures there come from the intermediary, not from the gateway.',
      },
      {
        title: 'The port is often moved',
        body: '7480 is the default, but deployments routinely put the gateway behind nginx or HAProxy on 80 and 443. Ask for the published endpoint rather than assuming the default.',
      },
    ],
  },

  // ------------------------------------------------------------ enterprise
  'dell-ecs': {
    summary: 'Connect S3 Explorer to Dell EMC ECS: namespace-scoped object users, the 9020/9021 port pair, and the Content-MD5 requirement on batch deletes.',
    intro: 'Dell ECS is an enterprise platform where the storage administrator, not you, controls the credentials. Two details decide whether a connection works: the namespace your object user belongs to, and which of the two S3 ports the cluster exposes.',
    example: {
      endpoint: 'https://ecs.example.internal:9021',
      region: 'default',
      accessKey: 'ecs-object-user',
      secretKey: 'EXAMPLEecsSecretKeyDoNotUse0123456789ab',
      addressing: 'Path-style',
      note: 'The access key for ECS is the object user name itself, not a generated identifier. Your administrator creates it and issues the secret from the ECS portal.',
    },
    gotchas: [
      {
        title: 'Batch deletes need a legacy checksum',
        body: 'ECS rejects the flexible checksum headers the current AWS SDK attaches to DeleteObjects, and answers with a checksum error that names none of this. S3 Explorer sends the legacy Content-MD5 header instead, which ECS accepts.',
      },
      {
        title: 'The namespace decides what you can see',
        body: 'ECS scopes buckets by namespace. An object user in the wrong namespace authenticates correctly and then lists nothing. If the connection succeeds but the bucket list is empty, the namespace is the first thing to check with your administrator.',
      },
      {
        // TODO(clement): the app's own help string says "S3 HTTPS port: 9022,
        // HTTP: 9021" while its endpointTemplate is https://{host}:9021 —
        // https on the port it calls HTTP. Published Dell documentation more
        // commonly cites 9020/9021. Confirm against a real cluster, then make
        // this paragraph and providers.ts agree; do not publish exact numbers
        // until then.
        title: 'The scheme has to match the port',
        body: 'ECS publishes S3 on a dedicated port rather than on 443, with one port for plain HTTP and another for HTTPS, and many installations then put both behind a load balancer. Get the exact pair from your administrator: an https URL aimed at the plain HTTP port fails during the TLS handshake, before any credential is read, which reads like a network outage rather than a configuration error.',
      },
    ],
  },
}

export function getProviderContent(id: string): ProviderContent | undefined {
  return PROVIDER_CONTENT[id]
}

/** Providers that have a page. Drives routing, prerendering and the sitemap. */
export const DOCUMENTED_PROVIDER_IDS = Object.keys(PROVIDER_CONTENT)
