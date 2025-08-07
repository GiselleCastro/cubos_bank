const reaisInCents = 100

export const convertReaisToCents = (valueInReais: number) => {
  return valueInReais * reaisInCents
}

export const convertCentsToReais = (valueInCents: number) => {
  return valueInCents / reaisInCents
}
