# adonis5-nats
> Adonis, microservices, nats

[![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

Need microservices in your Adonis5 application? Just use it.

This package provide wrapper for NATs broker (based on moleculer). For better experience you must implement two classes called `${AnyService}Server`  and `${AnyService}client` who extends `${AnyService}Server` (for better autocomplete)

## Installation

```bash
npm i adonis5-nats
node ace configure adonis5-nats
```

## Example usage

### App/Services/UserServiceServer.ts:
```typescript
const sleep = (ms: number = 3000) => new Promise((res) => setTimeout(() => res(true), ms))
export class UserServiceClassServer {
  public static serviceName = 'UserServiceClassServer' //required field

  /** Your any logic: */
  public users: [1, 2, 3]
  public async getUsersIDs() {
    await sleep()
    return this.users
  }
  public async getTestVars<T>(data: T): Promise<T> {
    await sleep()
    return data
  }
}
```
### App/Services/UserServiceClient.ts:
```typescript
import {UserServiceClassServer} from 'App/Services/UserServiceServer'
import Broker from '@ioc:Adonis/Addons/NATS'
class UserServiceClassClient extends UserServiceClassServer {
  constructor() {
    super()
  }
}
export const UserServiceClient = Broker.addClient<UserServiceClassClient>(
  UserServiceClassClient,
  UserServiceClassServer
)
```

### commands/UsersService.ts
```typescript
import { BaseCommand } from '@adonisjs/core/build/standalone'
import { UserServiceClassServer } from 'App/Services/UserServiceServer'
import Broker from '@ioc:Adonis/Addons/NATS'
export default class UsersService extends BaseCommand {
  public static commandName = 'users:service'
  public static description = ''
  public static settings = {
    loadApp: true,
    stayAlive: true,
  }

  public async run() {
    await Broker.addServer<UserServiceClassServer>(UserServiceClassServer)
    this.logger.info('users service run')
  }
}
```

### start/routes.ts
```typescript
import Route from '@ioc:Adonis/Core/Route'
import { UserServiceClient } from 'App/Services/UserServiceClient'
Route.get('/get-users-ids', async () => {
  return await UserServiceClient.getUsersIDs()
})
```



### Add docker-compose.yaml
```yaml
version: '3.7'
services:
  nats:
    image: 'nats'
    ports:
      - '4222:4222'
```
### Run nats
```bash
docker-compose up nats
```
### Update manifest
```bash
node ace generate:manifest
```
### Run service and http server
```
node ace users:service
node ace serve --watch
```

### test
http://localhost:3333/get-users-ids


[npm-image]: https://img.shields.io/npm/v/adonis5-nats.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/adonis5-nats "npm"

[license-image]: https://img.shields.io/npm/l/adonis5-nats?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"
