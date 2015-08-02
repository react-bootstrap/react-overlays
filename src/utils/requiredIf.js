export default function requiredIf(propType, matcher){
  return function(...args){
    let pt = propType;

    if (matcher(...args)) {
      pt = pt.isRequired;
    }

    return pt(...args);
  };
}
