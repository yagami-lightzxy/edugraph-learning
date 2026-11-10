import { createCanvas, Path2D } from '@napi-rs/canvas'
const canvas = createCanvas(100, 100)
const ctx = canvas.getContext('2d')
const proto = Object.getPrototypeOf(ctx)
console.log('fill length:', proto.fill.length, '| stroke length:', proto.stroke.length)
const path = new Path2D()
path.moveTo(10, 10); path.lineTo(80, 80); path.lineTo(10, 80); path.closePath()
try { ctx.fill(path); console.log('fill(path) ok') } catch (e) { console.log('fill(path) fail:', e.message.slice(0, 90)) }
try { ctx.fill(path, 'nonzero'); console.log('fill(path,rule) ok') } catch (e) { console.log('fill(path,rule) fail:', e.message.slice(0, 90)) }
try { ctx.fill('nonzero'); console.log('fill(rule) ok') } catch (e) { console.log('fill(rule) fail:', e.message.slice(0, 90)) }
console.log('Path2D global?', typeof globalThis.Path2D)
