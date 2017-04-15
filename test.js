'use strict'
import test from 'ava'
import fn from './'

test.serial('search robin millette with created', async t => {
  const search = await fn({ o: { string: 'robin millette', created: '>=2016-03-25' } })
  t.is(search.total_count, 0)
  t.is(search.items.length, search.total_count)
  t.is(Object.keys(search.headers).length, 9)
  t.falsy(search.headers.link)
})

test.serial('search robin millette with language', async t => {
  const search = await fn({ o: { string: 'robin millette', language: 'javascript' } })
  t.is(search.total_count, 1)
  t.is(search.items.length, search.total_count)
  t.is(search.items[0].login, 'millette')
  t.is(Object.keys(search.items[0]).length, 4)
  t.is(Object.keys(search.headers).length, 9)
  t.falsy(search.headers.link)
})

test.serial('search robin millette with languages', async t => {
  const search = await fn({ o: { string: 'robin millette', language: ['javascript', 'c++'] } })
  t.is(search.total_count, 1)
  t.is(search.items.length, search.total_count)
  t.is(search.items[0].login, 'millette')
  t.is(Object.keys(search.items[0]).length, 4)
  t.is(Object.keys(search.headers).length, 9)
  t.falsy(search.headers.link)
})

test.serial('search bob, multiple pages', async t => {
  const search = await fn('bob')
  t.truthy(search.headers.link)
  t.is(Object.keys(search.headers).length, 10)
  t.true(search.total_count > 5000)
})

test.serial('search object (org, in email)', async t => {
  const search = await fn({ o: { string: 'bob', type: 'org', in: 'email' } })
  t.true(search.total_count < 50)
  t.is(search.items[0].type, 'Organization')
})

test.serial('search object (user, in all', async t => {
  const search = await fn({ o: { string: 'bob', type: 'user', in: 'all' } })
  t.truthy(search.headers.link)
  t.true(search.total_count > 10000)
  t.is(search.items[0].type, 'User')
})

test.serial('search location', async t => {
  const search = await fn({ o: { location: ['mtl', 'Montréal'] } })
  t.truthy(search.headers.link)
  t.true(search.total_count > 7000)
})

test.serial('search location #2', async t => {
  const search = await fn({ o: { location: 'Rawdon' } })
  t.true(search.total_count < 10)
})

test.serial('search location (and not location)', async t => {
  const search = await fn({
    o: { location: ['mtl', 'Montréal'] },
    n: { location: ['qc', 'Québec'] }
  })
  t.truthy(search.headers.link)
  t.true(search.total_count > 5000)
})

test.serial('search bob, full URL', async t => {
  const search = await fn('https://api.github.com/search/users?q=bob&per_page=100')
  t.truthy(search.headers.link)
  t.is(Object.keys(search.headers).length, 10)
  t.true(search.total_count > 5000)
})

test.skip('search robin millette, full URL', async t => {
  const search = await fn('https://api.github.com/search/users?q=robin+millette&per_page=100')
  t.is(search.total_count, 1)
  t.is(search.items.length, search.total_count)
  t.is(search.items[0].login, 'millette')
  t.is(Object.keys(search.items[0]).length, 4)
  t.is(Object.keys(search.headers).length, 9)
  t.falsy(search.headers.link)
})

const errorString = '`query` required (string or object)'

test('bad sort', t => t.throws(fn({ q: 'bob', sort: 'bad' }), '`query.sort` should be one of "followers", "repositories" or "joined"'))
test('bad order', t => t.throws(fn({ q: 'bob', order: 'bad' }), '`query.order` should be one of "asc" or "desc"'))
test('no search', t => t.throws(fn(), errorString))
test('number search', t => t.throws(fn(666), errorString))
test('empty search', t => t.throws(fn(''), 'either `query.q` or `query.o` should be provided and not empty'))
test('bad location', t => t.throws(fn({ o: { location: 666 } }), 'location must be a string or an array of strings'))
test('bad language', t => t.throws(fn({ o: { language: 666 } }), '`query.o.language` must be a string or an array of strings'))
test('bad in', t => t.throws(fn({ o: { in: 'bad' } }), '`query.o.in` should be a string or an array of "email", "login" or "fullname"'))
test('bad in (number)', t => t.throws(fn({ o: { in: 666 } }), '`query.o.in` should be a string or an array of "email", "login" or "fullname"'))
test('bad created', t => t.throws(fn({ o: { created: 666 } }), '`query.o.created` should be a string (>=2016-03-25; <=2016-03-30; 2016-03-25..2016-03-30)'))
test('no q', t => t.throws(fn({ o: { } }), 'either `query.q` or `query.o` should be provided and not empty'))
