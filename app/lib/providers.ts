// SVG paths and brand colors mirrored from S3Explorer-Core/src/config/providers.ts
// to keep the website's provider list visually consistent with the desktop app.

export interface Provider {
  id: string
  name: string
  color: string
  svgPath: string
  svgViewBox?: string
}

export const PROVIDERS: Provider[] = [
  {
    id: 'aws',
    name: 'AWS S3',
    color: '#FF9900',
    svgPath: 'M20.4 14.2c-.3 0-.5.1-.7.2l-1.1-.7c.1-.3.1-.5.1-.8 0-.3 0-.5-.1-.8l1.1-.7c.2.1.5.2.7.2.8 0 1.4-.6 1.4-1.4s-.6-1.4-1.4-1.4-1.4.6-1.4 1.4v.3l-1.1.7c-.5-.5-1.1-.8-1.9-.8s-1.4.3-1.9.8l-1.1-.7v-.3c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4.6 1.4 1.4 1.4c.3 0 .5-.1.7-.2l1.1.7c-.1.3-.1.5-.1.8 0 .3 0 .5.1.8l-1.1.7c-.2-.1-.5-.2-.7-.2-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4v-.3l1.1-.7c.5.5 1.1.8 1.9.8s1.4-.3 1.9-.8l1.1.7v.3c0 .8.6 1.4 1.4 1.4s1.4-.6 1.4-1.4-.6-1.4-1.4-1.4zM16 14.2c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2 1.2.5 1.2 1.2-.5 1.2-1.2 1.2zM6.5 9h11c.3 0 .5-.2.5-.5S17.8 8 17.5 8h-11c-.3 0-.5.2-.5.5s.2.5.5.5zM5 5.5c0-.3-.2-.5-.5-.5s-.5.2-.5.5v13c0 .3.2.5.5.5s.5-.2.5-.5v-13z',
  },
  {
    id: 'gcs',
    name: 'Google Cloud',
    color: '#4285F4',
    svgPath: 'M12 2L4.5 6.5v11L12 22l7.5-4.5v-11L12 2zm0 2.2l5.5 3.3v6.6L12 17.4l-5.5-3.3V7.5L12 4.2z',
  },
  {
    id: 'minio',
    name: 'MinIO',
    color: '#C72C48',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17l-3-3 1.41-1.41L8 14.17l7.59-7.59L17 8l-9 9z',
  },
  {
    id: 'backblaze',
    name: 'Backblaze B2',
    color: '#E21E1E',
    svgPath: 'M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L17.5 8 12 11.5 6.5 8 12 4.5zM6 9.3l5 3.1v6.2l-5-3.1V9.3zm12 0v6.2l-5 3.1v-6.2l5-3.1z',
  },
  {
    id: 'wasabi',
    name: 'Wasabi',
    color: '#56B847',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare R2',
    color: '#F6821F',
    svgPath: 'M16.5 8.5l-3-3-1.5 1.5 3 3-3 3 1.5 1.5 3-3 3 3 1.5-1.5-3-3 3-3-1.5-1.5-3 3zm-9 0l-3-3L3 7l3 3-3 3 1.5 1.5 3-3 3 3L12 13l-3-3 3-3L10.5 5.5l-3 3z',
  },
  {
    id: 'ovhcloud',
    name: 'OVHcloud',
    color: '#000E9C',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    color: '#0080FF',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  },
  {
    id: 'scaleway',
    name: 'Scaleway',
    color: '#4F0599',
    svgPath: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z',
  },
  {
    id: 'hetzner',
    name: 'Hetzner',
    color: '#D50C2D',
    svgPath: 'M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3h6v2H9V9zm0 4h6v2H9v-2z',
  },
  {
    id: 'linode',
    name: 'Linode',
    color: '#00B050',
    svgPath: 'M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2zm0 2.3L5 8.2v7.6l7 3.9 7-3.9V8.2l-7-3.9z',
  },
  {
    id: 'oci',
    name: 'Oracle Cloud',
    color: '#F80000',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z',
  },
  {
    id: 'alibaba',
    name: 'Alibaba OSS',
    color: '#FF6A00',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
  },
  {
    id: 'ibm',
    name: 'IBM Cloud',
    color: '#0530AD',
    svgPath: 'M3 4h18v2H3V4zm0 5h18v2H3V9zm0 5h18v2H3v-2zm0 5h18v2H3v-2z',
  },
  {
    id: 'vultr',
    name: 'Vultr',
    color: '#007BFC',
    svgPath: 'M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5',
  },
  {
    id: 'exoscale',
    name: 'Exoscale',
    color: '#DA291C',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
  },
  {
    id: 'ceph',
    name: 'Ceph',
    color: '#EF3E42',
    svgPath: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a2 2 0 110 4 2 2 0 010-4zM7 14a2 2 0 110 4 2 2 0 010-4zm10 0a2 2 0 110 4 2 2 0 010-4z',
  },
  {
    id: 'garage',
    name: 'Garage',
    color: '#8B5CF6',
    svgPath: 'M4 4l4-2 4 2 4-2 4 2v14l-4 2-4-2-4 2-4-2V4zm2 1.2v11.6l2 1 2-1V5.2l-2-1-2 1zm6 0v11.6l2 1 2-1V5.2l-2-1-2 1z',
  },
  {
    id: 'seaweedfs',
    name: 'SeaweedFS',
    color: '#2E7D32',
    svgPath: 'M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.7c.5.27 1.03.5 1.58.67C10.3 20.6 12.55 21 15 21c2 0 4-.5 5.5-1.5l-1-1.5C18.5 19 17 19.5 15 19.5c-2 0-4-.4-5.5-.93l3-8.57c2.06.87 3.83 2.23 5.19 3.87L19 12.5C17.5 10.5 15.5 9 13 8l4-1V5l-6 1.5V8z',
  },
  {
    id: 'dell-ecs',
    name: 'Dell ECS',
    color: '#007DB8',
    svgPath: 'M2 4h20v16H2V4zm2 2v12h16V6H4zm2 2h12v2H6V8zm0 4h12v2H6v-2zm0 4h8v2H6v-2z',
  },
]
