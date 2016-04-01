/*eslint arrow-parens: [2, "as-needed"]*/
'use strict'
import test from 'ava'
import fn from './'

test('search robin millette', async t => {
  const search = await fn('robin millette')
  t.is(search.total_count, 1)
  t.is(search.items.length, search.total_count)
  t.is(search.items[0].login, 'millette')
  t.is(Object.keys(search.items[0]).length, 5)
  t.is(Object.keys(search.headers).length, 9)
  t.notOk(search.headers.link)
})

test('search bob, multiple pages', async t => {
  const search = await fn('bob')
  t.ok(search.headers.link)
  t.is(Object.keys(search.headers).length, 10)
  t.true(search.total_count > 5000)
})

test('search object (org, in email)', async t => {
  const search = await fn({ o: { string: 'bob', type: 'org', in: 'email' } })
  t.true(search.total_count < 50)
  t.is(search.items[0].type, 'Organization')
})

test('search object (user, in all', async t => {
  const search = await fn({ o: { string: 'bob', type: 'user', in: 'all' } })
  t.ok(search.headers.link)
  t.true(search.total_count > 10000)
  t.is(search.items[0].type, 'User')
})

test('search location', async t => {
  const search = await fn({ o: { location: ['mtl', 'Montréal'] } })
  t.ok(search.headers.link)
  t.true(search.total_count > 7000)
})

test('search location (and not location)', async t => {
  const search = await fn({
    o: { location: ['mtl', 'Montréal'] },
    n: { location: ['qc', 'Québec'] }
  })
  t.ok(search.headers.link)
  t.true(search.total_count > 5000)
})

test('search bob, full URL', async t => {
  const search = await fn('https://api.github.com/search/users?q=bob&per_page=100')
  t.ok(search.headers.link)
  t.is(Object.keys(search.headers).length, 10)
  t.true(search.total_count > 5000)
})

test('search robin millette, full URL', async t => {
  const search = await fn('https://api.github.com/search/users?q=robin+millette&per_page=100')
  t.is(search.total_count, 1)
  t.is(search.items.length, search.total_count)
  t.is(search.items[0].login, 'millette')
  t.is(Object.keys(search.items[0]).length, 5)
  t.is(Object.keys(search.headers).length, 9)
  t.notOk(search.headers.link)
})

const errorString = '`query` required (string or object)'

test('bad sort', async t => await t.throws(fn({ q: 'bob', sort: 'bad' }), '`query.sort` should be one of "followers", "repositories" or "joined"'))
test('bad order', async t => await t.throws(fn({ q: 'bob', order: 'bad' }), '`query.order` should be one of "asc" or "desc"'))
test('no search', async t => await t.throws(fn(), errorString))
test('number search', async t => await t.throws(fn(666), errorString))
test('empty search', async t => await t.throws(fn(''), 'either `query.q` or `query.o` should be provided and not empty'))
test('bad location', async t => await t.throws(fn({ o: { location: 666 } }), 'location must be a string or an array of strings'))
