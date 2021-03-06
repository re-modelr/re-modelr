import {
  types as propTypes,
  comparePropertyToType,
  getTypeName,
  getPropertyTypeName,
  parseValueToType,
} from '@ngyv/prop-utils'

const TYPE_OPTIONS = Object.freeze([
  'required',
  'default',
  'acceptedTypes'
])

const TYPE_NAMES = Object.keys(propTypes)

const ACCEPTED_TYPES = Object.freeze({
  nil: [propTypes.undefined, propTypes.null],
  strings: [propTypes.emptyString, propTypes.string, propTypes.null],
})
/**
 * Takes in model descriptors and returns a flat object
 * @param  {string} typeName  String representation of prop types
 * @param  {boolean} required  Indicates validation
 * @param  {(number|boolean|string|array|object)} default  Fallback value
 * @return {object}
 */
const type = (typeName, options = {}) => {
  if (!TYPE_NAMES.includes(typeName)) {
    throw new TypeError(`Unexpected "${typeName}" passed as "typeName"`)
  }

  return Object.keys(options).reduce((hashType, optionKey) => {
    if (TYPE_OPTIONS.includes(optionKey)) {
      hashType[optionKey] = options[optionKey]
    }
    return hashType
  }, { type: propTypes[typeName] })
}

/**
 * @protected validate - Validates attribute with expected type if required is true
 * @param  {*} attribute  To be validated on
 * @param  {object} [type={}]  To be validated against and is generated by `type` function
 * @return {boolean}
 */
const validate = (attribute, type = {}) => {
  if (!type.type) { return }

  if (!comparePropertyToType(attribute, type.type, type.acceptedTypes)) {
    const message = `Expected "${getTypeName(type.type)}" but got property "${attribute}" of type "${getPropertyTypeName(attribute)}" instead`
    if (type.required) {
      throw new TypeError(message)
    } else {
      console.warn(message) // eslint-disable-line no-console
    }
    return false
  }
  return true
}

/**
 * @private _defaultAttribute - will return the parsed attribute as default value if attribute is one of the overrideTypes
 * @param  {*} attribute
 * @param  {*} defaultValue
 * @param  {Array}  i.e. [overrideTypes=[propTypes.undefined, propTypes.null]]
 * @return {*}
 */
const _defaultAttribute = (attribute, defaultValue, overrideTypes) => {
  if (comparePropertyToType(defaultValue, propTypes.undefined)) {
    return attribute
  }
  const override = overrideTypes ? { override: [propTypes.undefined, propTypes.null] } : undefined
  return (comparePropertyToType(attribute, propTypes.undefined, override)) ? defaultValue : attribute
}

/**
 * @private _validateAttributes
 * @param  {object} modelJson - will be validated against the attributes
 * @param  {object} attributes - each property contains the type to be validated
 * @return {boolean}
 */
const _validateAttributes = (modelJson, attributes) => {
  if (!comparePropertyToType(modelJson, propTypes.object) || !comparePropertyToType(attributes, propTypes.object)) {
    throw new TypeError('Non-object passed')
  }

  let warn = false, validated = true, missingDescriptors = []
  Object.keys(modelJson).forEach((attributeName) => {
    const expected = attributes[attributeName]

    // model descriptors
    if (comparePropertyToType(expected, propTypes.object)) {
      if (!expected.type) {
        throw new TypeError(`Attribute "type" for "${attributeName}" is not specified`)
      }

      const jsonAttribute = _defaultAttribute(modelJson[attributeName], expected.default)
      const parsedJsonAttribute = parseValueToType(jsonAttribute, expected.type)
      const acceptedTypes = comparePropertyToType(expected.acceptedTypes, propTypes.array) ? { ignore: [expected.type, ...expected.acceptedTypes] } : ACCEPTED_TYPES

      if(!validate(parsedJsonAttribute, Object.assign({}, expected, { acceptedTypes }))) {
        validated = false
      }
    } else {
      missingDescriptors.push(attributeName)
      warn = true
    }
  })

  if (warn) {
    console.warn(`Please use "type" function to describe model attributes (${missingDescriptors.toString()})`)  // eslint-disable-line no-console
  }

  return validated
}

export {
  type,
  validate,
  _defaultAttribute,
  _validateAttributes,
}
