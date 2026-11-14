'use strict';
// Sustituto de deepmerge 4.3.1 (MIT, © 2012 Nicholas Fisher; ver LICENSE) usado solo por
// @rollup/plugin-node-resolve al compilar el service worker. Misma API y comportamiento,
// con una diferencia: nunca copia las claves `__proto__`, `constructor` ni `prototype`
// y define las propiedades con defineProperty, de modo que el objeto devuelto no puede
// cambiar de prototipo (GHSA-gcqx-w48m-w2h4). El original no tiene versión corregida.

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const REACT_ELEMENT_TYPE = Symbol.for('react.element');

function defaultIsMergeableObject(value) {
  if (!value || typeof value !== 'object') return false;
  const tag = Object.prototype.toString.call(value);
  return (
    tag !== '[object RegExp]' && tag !== '[object Date]' && value.$$typeof !== REACT_ELEMENT_TYPE
  );
}

function emptyTarget(value) {
  return Array.isArray(value) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, options) {
  return options.clone !== false && options.isMergeableObject(value)
    ? deepmerge(emptyTarget(value), value, options)
    : value;
}

function defaultArrayMerge(target, source, options) {
  return target.concat(source).map((element) => cloneUnlessOtherwiseSpecified(element, options));
}

function getMergeFunction(key, options) {
  if (!options.customMerge) return deepmerge;
  const customMerge = options.customMerge(key);
  return typeof customMerge === 'function' ? customMerge : deepmerge;
}

function getKeys(target) {
  const symbols = Object.getOwnPropertySymbols(target).filter((symbol) =>
    Object.prototype.propertyIsEnumerable.call(target, symbol),
  );
  return Object.keys(target)
    .concat(symbols)
    .filter((key) => !UNSAFE_KEYS.has(key));
}

function propertyIsOnObject(object, property) {
  try {
    return property in object;
  } catch {
    return false;
  }
}

function propertyIsUnsafe(target, key) {
  return (
    propertyIsOnObject(target, key) &&
    !(
      Object.prototype.hasOwnProperty.call(target, key) &&
      Object.prototype.propertyIsEnumerable.call(target, key)
    )
  );
}

function define(object, key, value) {
  Object.defineProperty(object, key, {
    value,
    enumerable: true,
    writable: true,
    configurable: true,
  });
}

function mergeObject(target, source, options) {
  const destination = {};
  if (options.isMergeableObject(target)) {
    for (const key of getKeys(target)) {
      define(destination, key, cloneUnlessOtherwiseSpecified(target[key], options));
    }
  }
  for (const key of getKeys(source)) {
    if (propertyIsUnsafe(target, key)) continue;
    if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
      define(destination, key, getMergeFunction(key, options)(target[key], source[key], options));
    } else {
      define(destination, key, cloneUnlessOtherwiseSpecified(source[key], options));
    }
  }
  return destination;
}

function deepmerge(target, source, options) {
  options = options || {};
  options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  options.isMergeableObject = options.isMergeableObject || defaultIsMergeableObject;
  options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

  const sourceIsArray = Array.isArray(source);
  if (sourceIsArray !== Array.isArray(target))
    return cloneUnlessOtherwiseSpecified(source, options);
  if (sourceIsArray) return options.arrayMerge(target, source, options);
  return mergeObject(target, source, options);
}

deepmerge.all = function deepmergeAll(array, options) {
  if (!Array.isArray(array)) throw new Error('first argument should be an array');
  return array.reduce((previous, next) => deepmerge(previous, next, options), {});
};

module.exports = deepmerge;
