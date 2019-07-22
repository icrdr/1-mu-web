import { useState, useEffect } from 'react';

export default function useForm(onSubmit, onError = undefined, validation = [], initialValues = {}) {
  let fieldDefaults = {}
  const [fieldCount, setFieldCount] = useState(0)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line
  useEffect(() => {
    setFieldCount(Object.keys(fieldDefaults).length)
  });
  useEffect(() => {
    let newValues = {}
    for (let key in fieldDefaults) {
      let value = getFieldValue(values, key)
      if (value === undefined) value = fieldDefaults[key]
      if (value !== undefined) newValues = setFieldValue(newValues, key, value)
    }
    setValues(newValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldCount]);

  const getFieldValue = (vs, f, dv = undefined) => {
    const str_list = f.replace('[', '.').replace(']', '').split('.')
    let value = { ...vs }
    for (let i in str_list) {
      // console.log(str_list[i])
      if (value[str_list[i]] !== undefined) {
        value = value[str_list[i]]
      } else {
        value = dv
        break
      }
    }
    return value
  }

  const setFieldValue = (vs, f, v, override = true) => {
    const str_list = f.replace('[', '.').replace(']', '').split('.')
    let newVs = { ...vs }
    let value = newVs

    for (let i in str_list) {
      let key
      if (/^\d+$/.test(str_list[i])) {
        key = parseInt(str_list[i])
      } else {
        key = str_list[i]
      }

      if (parseInt(i) + 1 < str_list.length) {
        if (value[key] === undefined) {
          if (/^\d+$/.test(str_list[parseInt(i) + 1])) {
            value[key] = []
          } else {
            value[key] = {}
          }
        }
        value = value[key]
      } else {
        if (value[key] === undefined || override) value[key] = v
      }
    }
    return { ...newVs }
  }

  const validationField = async arr => {
    let error_add_list = {}
    let error_remove_list = []
    let no_error = true
    for (let j in arr){
      const f = arr[j]
      for (let i in validation[f]) {
        if (!await validation[f][i].validate(getFieldValue(values, f))) {
          error_add_list[f] = validation[f][i].error
          no_error = false
          break
        }
      }
      if(no_error)error_remove_list.push(f)
    }
    return {error_add_list, error_remove_list}
  }

  const validate = async f => {
    const {error_add_list, error_remove_list} = await validationField([f])
    setErrors(preState => {
      preState = { ...preState, ...error_add_list }
      for (let i in error_remove_list){
        delete preState[error_remove_list[i]]
      }
      return { ...preState }
    })
  }

  const iterate = (obj, keyArr) => {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && keyArr.indexOf(key) >= 0) {
        obj[key] = obj[key].filter(n => n)
        iterate(obj[key], keyArr)
      }
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (e) e.persist()

    if (!isSubmitting) {
      setIsSubmitting(true)
      
      let validateField = []
      for (let key in validation)validateField.push(key)
      const {error_add_list} = await validationField(validateField)
      setErrors(error_add_list)

      if (Object.keys(error_add_list).length === 0) {
        // clear undefined array element
        let white_list = []
        for (let key in fieldDefaults) {
          const str_list = key.replace('[', '.').replace(']', '').split('.').slice(0, -1)
          white_list = white_list.concat(str_list)
        }
        white_list = white_list.filter((v, i, a) => !/^\d+$/.test(v) && a.indexOf(v) === i)
        const final = { ...values }
        iterate(final, white_list)

        // call back final values
        onSubmit(final)
      } else {
        if (onError !== undefined) {
          onError(error_add_list)
        } else {
          console.log(error_add_list)
        }
      }
      setIsSubmitting(false)
    }
  }

  const handleChange = (e, field) => {
    let v
    let isEvent = false
    if (typeof (e) === 'object' && e !== null) {
      if (e.target) {
        isEvent = true
      }
    }
    if (isEvent) {
      const element = e.target
      if (element.type === 'checkbox' || element.type === 'radio') {
        v = element.checked
      } else {
        v = element.value
      }
    } else {
      v = e
    }

    v = (v === null) ? undefined : v
    setValues(values => setFieldValue(values, field, v));
  }

  // const handleBlur = async f => {
  //   const errorList = await validationField(errors, f)
  //   setErrors({ ...errorList })
  // }

  const field = (field, defaultValue = undefined, onBlur = false) => {
    let value = getFieldValue(values, field, defaultValue)
    fieldDefaults[field] = defaultValue
    return {
      name: field,
      value: value,
      checked: value || false,
      onChange: e => handleChange(e, field),
      onBlur: () => { if (onBlur) validate(field) }
    }
  }

  const isRequired = v => {
    return v ? true : false
  }

  const inRange = (v, min, max) => {
    if (v === undefined) return false
    if (!/^\d+$/.test(v)) return false
    if (min && v < min) return false
    if (max && v > max) return false
    return true
  }
  const inLength = (v, min, max) => {
    if (v === undefined) return false
    if (min && v.length < min) return false
    if (max && v.length > max) return false
    return true
  }
  const isDigit = v => {
    if (v === undefined) return false
    return /^\d+$/.test(v) ? true : false
  }

  const isUniqueArr = arr => {
    if (typeof (arr) != 'object') return false
    var unique = arr.filter((v, i, a) => a.indexOf(v) === i);
    return unique.length === arr.length ? true : false
  }

  const isEmail = v => {
    return /[\w-]+@([\w-]+\.)+[\w-]+/.test(v) ? true : false
  }

  const va = {
    isRequired,
    inRange,
    isDigit,
    isEmail,
    inLength,
    isUniqueArr
  }
  return {
    va,
    handleSubmit,
    validate,
    errors,
    field,
  }
};
