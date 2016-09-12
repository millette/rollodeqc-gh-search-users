/*
RoLLodeQc module to search GitHub users.

Copyright 2016 Robin Millette <http://robin.millette.info/>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the
[GNU Affero General Public License](LICENSE.md)
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict'

// core
const qs = require('querystring')

// npm
const flow = require('lodash.flow')
// const omitBy = require('lodash.omitby')
const deburr = require('lodash.deburr')
const flatten = require('lodash.flatten')
const uniq = require('lodash.uniq')
const partial = require('lodash.partial')

// own
const utils = require('rollodeqc-gh-utils')

// data
const packageJson = require('./package.json')
const userAgent = [packageJson.repository, packageJson.version].join(' v')

const earlyReject = function (query) {
  if (typeof query !== 'object' && typeof query !== 'string') {
    throw new Error('`query` required (string or object)')
  }
  if (typeof query === 'string') {
    if (query.slice(0, 4) === 'http') {
      const f = query.slice(4, 5)
      let i
      if (f === ':') { i = 4 } else if (f === 's') { i = 5 }
      if (i && query.slice(i, i + 3) === '://') { query = { u: query } }
    }
    if (!query.u) { query = { q: query } }
  }
  if (!query.q && !query.o && !query.u) {
    throw new Error('either `query.q` or `query.o` should be provided and not empty')
  }
  if ([undefined, 'followers', 'repositories', 'joined'].indexOf(query.sort) === -1) {
    throw new Error('`query.sort` should be one of "followers", "repositories" or "joined"')
  }
  if ([undefined, 'asc', 'desc'].indexOf(query.order) === -1) {
    throw new Error('`query.order` should be one of "asc" or "desc"')
  }
  return query
}

const locationQuery = function (query, location, not) {
  const loc = not ? '-location' : 'location'
  if (typeof location === 'string') {
    location = [location]
  } else if (typeof location !== 'object') {
    throw new Error('location must be a string or an array of strings')
  }
  uniq(flatten(location
    .map((i) => i.toLowerCase().replace(' ', '-'))
    .map((i) => [i, deburr(i)])
  )).forEach((i) => { query.q.push(loc + ':' + i) })
  return query
}

const notQuery = function (query) {
  if (query.n && query.n.location) {
    query.q = [query.q]
    query = locationQuery(query, query.n.location, true)
    query.q = query.q.join(' ')
  }
  return query
}

const rangeQuery = function (field, query) {
  if (!query.o[field]) { return query }
  const str = field === 'created'
    ? '>=2016-03-25; <=2016-03-30; 2016-03-25..2016-03-30'
    : '>=5; <=10; 5..10'
  if (typeof query.o[field] === 'string') {
    query.q.push(field + ':' + query.o[field])
  } else {
    throw new Error('`query.o.' + field + '` should be a string (' + str + ')')
  }
  return query
}

const inQuery = function (query) {
  if (!query.o.in) { return query }

  let good = ['email', 'login', 'fullname']
  if (typeof query.o.in === 'string') {
    query.o.in = query.o.in === 'all' ? good.slice() : [query.o.in]
  }
  if (typeof query.o.in !== 'object') {
    throw new Error('`query.o.in` should be a string or an array of "email", "login" or "fullname"')
  }

  let bad = false
  query.o.in.forEach((i) => {
    if (good.indexOf(i) === -1) {
      bad = true
    } else {
      query.q.push('in:' + i)
    }
  })
  if (bad) {
    throw new Error('`query.o.in` should be a string or an array of "email", "login" or "fullname"')
  }
  return query
}

const beginDoQuery = flow(inQuery, partial(rangeQuery, 'repos'),
  partial(rangeQuery, 'followers'), partial(rangeQuery, 'created'))

const doQuery = function (query) {
  if (query.u || query.q) { return query }
  query.q = []
  if (query.o.string) { query.q.push(query.o.string) }
  if (query.o.type) { query.q.push('type:' + query.o.type) }

  query = beginDoQuery(query)
  if (query.o.location) { query = locationQuery(query, query.o.location) }

  if (query.o.language) {
    if (typeof query.o.language === 'string') {
      query.o.language = [query.o.language]
    } else if (typeof query.o.language !== 'object') {
      throw new Error('`query.o.language` must be a string or an array of strings')
    }
    query.o.language.forEach((i) => { query.q.push('language:' + i.toLowerCase().replace(' ', '-')) })
  }

  if (query.q.length) {
    query.q = query.q.join(' ')
  } else {
    throw new Error('either `query.q` or `query.o` should be provided and not empty')
  }
  return query
}

const begin = flow(earlyReject, doQuery, notQuery)

/*
const itemsOmitter = (value, key) =>
  key === 'gravatar_id' || key === 'url' || key.slice(-4) === '_url'

const chosenFields = (i) => omitBy(i, itemsOmitter)
*/

module.exports = function (query, token) {
  try { query = begin(query) } catch (e) { return Promise.reject(e) }
  if (!query.per_page) { query.per_page = 100 }
  const opts = { headers: { 'user-agent': userAgent } }
  if (token) { opts.token = token }
  return utils.got(query.u ? query.u : 'search/users?' + qs.stringify(query), opts)
    .then((body) => {
      body.items = body.items.map((i) => utils.chosenFields(i))
      return body
    })
}
