'use strict' /* eslint-env jasmine */
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
//
require('symbol-observable')
const withEventHandler = require('../').default
const createSubject = require('rx-subject').default
const from = require('rxjs').from
const tap = require('rxjs/operators').tap

describe('withEventHandler:', function () {
  describe('when called with an `id` string:', function () {
    let f

    beforeEach(function () {
      f = withEventHandler('baz')
    })

    it('returns a function', function () {
      expect(f).toEqual(jasmine.any(Function))
    })

    describe('the returned function:', function () {
      describe('when called with an onEvent handler', function () {
        let onEvent, op, subscribe, subscription

        beforeEach(function () {
          onEvent = jasmine.createSpy('onEvent')
          op = f(onEvent)
        })

        beforeEach(function () {
          const next = jasmine.createSpy('next')
          const error = jasmine.createSpy('error')
          const complete = jasmine.createSpy('complete')
          const src = createSubject()
          subscribe = function () {
            subscription = op(from(src.source$)).subscribe(next, error, complete)
          }
        })

        it('returns an RxJS Operator', function () {
          expect(op).toEqual(jasmine.any(Function))
          expect(subscribe).not.toThrow()
          expect(subscription).toBeDefined()
          expect(subscription.unsubscribe.bind(subscription)).not.toThrow()
        })

        describe('the returned RxJS Operator:', function () {
          let next, error, complete

          beforeEach(function () {
            next = jasmine.createSpy('next')
            error = jasmine.createSpy('error')
            complete = jasmine.createSpy('complete')
            onEvent.and.callFake(function ($) { return $ })
          })

          describe('behaves like the RxJS Operator returned ' +
          'by `withEventHandlerProps(id)`:', function () {
            beforeEach(function () {
              const src = createSubject()
              let onBaz
              next.and.callFake(function (x) { onBaz = x.onBaz })
              const sub = op(from(src.source$)).subscribe(next, error, complete)
              src.sink.next({ foo: 'foo' })
              src.sink.next({ bar: 'bar' })
              onBaz('bar')
              sub.unsubscribe()
            })

            it('adds an EventHandlerProp and, when the handler from that prop ' +
            'is called, also adds a corresponding EventProp', function () {
              expect(next.calls.argsFor(0)).toEqual([{
                foo: 'foo',
                onBaz: jasmine.any(Function)
              }])
              expect(next.calls.argsFor(1)).toEqual([{
                bar: 'bar',
                onBaz: jasmine.any(Function)
              }])
              expect(next.calls.argsFor(2)).toEqual([{
                bar: 'bar',
                onBaz: jasmine.any(Function),
                event: { id: 'baz', payload: 'bar' }
              }])
              expect(next).toHaveBeenCalledTimes(3)
              expect(error).not.toHaveBeenCalled()
              expect(complete).not.toHaveBeenCalled()
            })
          })

          describe('additionally:', function () {
            let onEventNext

            beforeEach(function () {
              onEventNext = jasmine.createSpy('onEventNext')
            })
            beforeEach(function () {
              const src = createSubject()
              let onBaz
              next.and.callFake(function (x) { onBaz = x.onBaz })
              onEvent.and.callFake(function ($) { return tap(onEventNext)($) })
              const sub = op(from(src.source$)).subscribe(next, error, complete)
              src.sink.next({ foo: 'foo' })
              onBaz('bar')
              sub.unsubscribe()
            })

            it('pipes the objects emitted by the input stream ' +
            'extended with the full EventHandlerProps ' +
            'into the given onEvent RxJS Operator when the handler ' +
            'from the EventHandlerProp is called', function () {
              expect(next.calls.argsFor(0)).toEqual([{
                foo: 'foo',
                onBaz: jasmine.any(Function)
              }])
              expect(next.calls.argsFor(1)).toEqual([{
                foo: 'foo',
                onBaz: jasmine.any(Function),
                event: { id: 'baz', payload: 'bar' }
              }])
              expect(onEventNext).toHaveBeenCalledWith({
                foo: 'foo',
                onBaz: jasmine.any(Function),
                event: { id: 'baz', payload: 'bar' }
              })
              expect(onEventNext).toHaveBeenCalledTimes(1)
              expect(next).toHaveBeenCalledTimes(2)
              expect(error).not.toHaveBeenCalled()
              expect(complete).not.toHaveBeenCalled()
            })
          })

          describe('when the input observable completes with an error:', function () {
            beforeEach(function () {
              const src = createSubject()
              const sub = op(from(src.source$)).subscribe(next, error, complete)
              src.sink.error('boom')
              sub.unsubscribe()
            })

            it('the output observable completes with that error', function () {
              expect(next).not.toHaveBeenCalled()
              expect(complete).not.toHaveBeenCalled()
              expect(error).toHaveBeenCalledWith('boom')
            })
          })

          describe('when the input observable completes:', function () {
            beforeEach(function () {
              const src = createSubject()
              const sub = op(from(src.source$)).subscribe(next, error, complete)
              src.sink.complete()
              sub.unsubscribe()
            })

            it('the output observable completes', function () {
              expect(next).not.toHaveBeenCalled()
              expect(error).not.toHaveBeenCalled()
              expect(complete).toHaveBeenCalled()
            })
          })
        })
      })
    })
  })
})
