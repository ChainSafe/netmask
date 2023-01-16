
# @chainsafe/netmask

Typescript implementation for using CIDR masks for address filtering.
Heavily inspired by go implementation.

## Features

* IPv4 and IPv6 support
* [Typescript](https://www.typescriptlang.org/) support

## How to use

`npm i -s @chainsafe/netmask`

or
`yarn add @chainsafe/netmask`

Example usage:

```typescript
import {IpNet} from "@chainsafe/netmask"

new IpNet("192.168.0.1/24").contains("192.168.0.16")
new IpNet("192.168.0.1", "24").contains("192.168.0.16")
new IpNet("2001:db8::/128").contains("2001:db8::")
new IpNet("192.168.0.1", "255.255.255.0").contains("192.168.0.16")
```

## Quick start

1. `yarn`
2. `yarn run build`
3. `yarn run test`
