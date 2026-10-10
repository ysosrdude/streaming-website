#!/usr/bin/env node
/**
 * Validates feed API context JSON for integrate-feed-api skill.
 * Usage: node validate-feed-context.mjs <path-to.json>
 */
import { readFileSync } from 'node:fs'

const KNOWN_KINDS = new Set(['streamcenter', 'trendy48'])

const path = process.argv[2]
if (!path) {
  console.error('Usage: node validate-feed-context.mjs <file.json>')
  process.exit(1)
}

let data
try {
  data = JSON.parse(readFileSync(path, 'utf8'))
} catch (e) {
  console.error('Invalid JSON:', e.message)
  process.exit(1)
}

const errors = []

function req(obj, key, label = key) {
  if (obj == null || obj[key] === undefined || obj[key] === '') {
    errors.push(`Missing required field: ${label}`)
  }
}

req(data, 'feed', 'feed')
if (data.feed) {
  req(data.feed, 'id', 'feed.id')
  req(data.feed, 'name', 'feed.name')
  req(data.feed, 'baseUrl', 'feed.baseUrl')
  req(data.feed, 'kind', 'feed.kind')

  if (data.feed.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.feed.id)) {
    errors.push('feed.id should be kebab-case (a-z0-9 and hyphens)')
  }

  if (data.feed.baseUrl) {
    try {
      const u = new URL(data.feed.baseUrl)
      if (u.protocol !== 'https:' && u.protocol !== 'http:') {
        errors.push('feed.baseUrl must be http(s) URL')
      }
    } catch {
      errors.push('feed.baseUrl is not a valid URL')
    }
  }

  if (data.feed.kind && !KNOWN_KINDS.has(data.feed.kind)) {
    console.warn(
      `Note: feed.kind "${data.feed.kind}" is not a built-in adapter; integration must add a new kind.`,
    )
  }
}

const hasSpec = data.spec != null && typeof data.spec === 'object'
const hasOpenApi = data.openapi != null && typeof data.openapi === 'object'

if (!hasSpec && !hasOpenApi) {
  errors.push('Provide at least one of: spec, openapi')
}

if (hasOpenApi) {
  req(data.openapi, 'info', 'openapi.info')
  if (data.openapi.info) req(data.openapi.info, 'title', 'openapi.info.title')
}

if (hasSpec) {
  req(data.spec, 'name', 'spec.name')
  if (!data.spec.endpoints && !data.spec.paths) {
    errors.push('spec.endpoints (or spec.paths) should document list endpoints')
  }
}

if (errors.length) {
  console.error('Validation failed:')
  for (const e of errors) console.error('  -', e)
  process.exit(1)
}

console.log('OK:', data.feed.id, '→', data.feed.baseUrl, `(${data.feed.kind})`)
