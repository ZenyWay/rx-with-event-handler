/**
 * @license
 * Copyright 2018 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
import withEventHandlerProps, {
  EventHandlerProp,
  EventHandlerProps,
  EventHandlerPropsOperator,
  EventProp,
  hasEvent,
  hasEventHandler
} from 'rx-with-event-handler-props'
import when from 'rx-when'
import compose from 'basic-compose'
import { Observable } from 'rxjs/Observable'

export { hasEvent, hasEventHandler }

export type RxOperator<I,O> = ($: Observable<I>) => Observable<O>

export default function withEventHandler <E>(id: string) {
  return _withEventHandler

  function _withEventHandler (): EventHandlerPropsOperator<E>
  function _withEventHandler <I,O=I&EventHandlerProps<E,EventProp<E>>>(
    onEvent: RxOperator<I&EventHandlerProps<E,EventProp<E>>, O>,
    orElse?: RxOperator<I&EventHandlerProp<E>, O>
  ): RxOperator<I,O>
  function _withEventHandler <I,O=I&EventHandlerProps<E,EventProp<E>>>(
    onEvent?: RxOperator<I&EventHandlerProps<E,EventProp<E>>, O>,
    orElse?: RxOperator<I&EventHandlerProp<E>, O>
  ) {
    return !arguments.length
      ? withEventHandlerProps<E>(id)
      : compose<Observable<I>,Observable<O>>(
          when<I&EventHandlerProps<E,EventProp<E>>,O>(hasEvent(id))(
            onEvent,
            orElse
          ),
          withEventHandlerProps<E>(id)
        )
  }
}
