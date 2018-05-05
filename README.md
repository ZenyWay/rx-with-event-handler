# rx-with-event-handler
[![NPM](https://nodei.co/npm/rx-with-event-handler.png?compact=true)](https://nodei.co/npm/rx-with-event-handler/)

[`RxJS`](http//reactivex.io/rxjs/) operator for lifting a [`component-from-stream`](https://npmjs.com/package/component-from-stream/)
that wraps [`rx-with-event-handler-props`](https://npmjs.com/package/rx-with-event-handler-props/),
adding an `onEvent` event handling operator (and an optional `orElse` operator).
shorthand for:
```ts
compose(
  when(hasEvent(id))(onEvent, orElse),
  withEventHandlerProps(id)
)
```
for a usage example, see the [`component-from-stream`](https://npmjs.com/package/component-from-stream/) module.

for more information, see the [`rx-with-event-handler-props`](https://npmjs.com/package/rx-with-event-handler-props/),
[`rx-when`](https://npmjs.com/package/rx-when/)
and [`basic-compose`](https://npmjs.com/package/basic-compose/) modules.

# API
```ts
declare function withEventHandler<E>( id: string): {
  (): EventHandlerPropsOperator<E, EventProp<E>> // = withEventHandlerProps(id)

  <I, O = I & EventHandlerProp<E> & Partial<EventProp<E>>>(
    onEvent: RxOperator<I & EventHandlerProp<E> & Partial<EventProp<E>>, O>,
    orElse?: RxOperator<I & EventHandlerProp<E>, O>
  ): RxOperator<I, O>
}

type RxOperator<I,O> = ($: Observable<I>) => Observable<O>
```
when the returned function is called without handlers (no argument),
it simply passes the given event `id` string through to `withEventHandlerProps`
from [`rx-with-event-handler-props`](https://npmjs.com/package/rx-with-event-handler-props/),
i.e. the following are equivalent:
```ts
import withEventHandler from 'rx-with-event-handler'
// import withEventHandlerProps from 'rx-with-event-handler-props'

withEventHandler('click')() // = withEventHandlerProps('click')
```

for convenience, this module exports the `hasEvent`, `hasEventHandler` and
`toHandlerKey` helpers from [`rx-with-event-handler-props`](https://github.com/ZenyWay/rx-with-event-handler-props#type-definitions).

for a partial specification of this API,
run the [unit tests](https://cdn.rawgit.com/ZenyWay/rx-with-event-handler/v1.2.2/spec/web/index.html)
in your browser.

# TypeScript
although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
modern code editors will still benefit from the available type definition,
e.g. for helpful code completion.

# License
Copyright 2018 Stéphane M. Catala

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the [License](./LICENSE) for the specific language governing permissions and
Limitations under the License.
