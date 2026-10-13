// Tải cloudflared (linux amd64) về /tmp/cf, chmod +x.
import { writeFile, chmod } from 'node:fs/promises'

const url = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64'
const res = await fetch(url)
if (!res.ok) throw new Error('Download failed: HTTP ' + res.status)
const buf = Buffer.from(await res.arrayBuffer())
await writeFile('/tmp/cf', buf)
await chmod('/tmp/cf', 0o755)
console.log('cloudflared saved to /tmp/cf (' + buf.length + ' bytes)')
