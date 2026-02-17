/**
 * Decimal.js utilities for precision financial calculations
 *
 * Uses decimal.js for exact decimal arithmetic, avoiding JavaScript float errors.
 * All monetary and quantity calculations in the ERP should use these functions.
 */

import Decimal from "decimal.js"

// Rounding mode: ROUND_HALF_UP matches typical financial/banking convention
const ROUNDING = Decimal.ROUND_HALF_UP

/**
 * Round a value to specified decimal precision using Decimal.js
 * @param value - Amount to round (number, string, or Decimal)
 * @param precision - Number of decimal places
 * @returns Rounded number
 */
export function mathRound(value: number | string | Decimal, precision: number): number {
  return new Decimal(value).toDecimalPlaces(precision, ROUNDING).toNumber()
}

/**
 * Multiply two values with precision (e.g. qty × price, amount × exchange rate)
 */
export function calculateMultiplierAmount(
  baseAmount: number | string,
  multiplier: number | string,
  precision: number
): number {
  return new Decimal(baseAmount)
    .times(multiplier)
    .toDecimalPlaces(precision, ROUNDING)
    .toNumber()
}

/**
 * Multiply then divide with precision (e.g. amount × rate / rate)
 */
export function calculateMultiplierWithDivisionAmount(
  baseAmount: number | string,
  multiplier: number | string,
  division: number | string,
  precision: number
): number {
  const div = new Decimal(division)
  if (div.isZero()) return 0
  return new Decimal(baseAmount)
    .times(multiplier)
    .div(div)
    .toDecimalPlaces(precision, ROUNDING)
    .toNumber()
}

/**
 * Add amounts with precision
 */
export function calculateAdditionAmount(
  baseAmount: number | string,
  additionAmount: number | string,
  precision: number
): number {
  return new Decimal(baseAmount)
    .plus(additionAmount)
    .toDecimalPlaces(precision, ROUNDING)
    .toNumber()
}

/**
 * Calculate percentage amount (baseAmount × percentage / 100)
 */
export function calculatePercentageAmount(
  baseAmount: number | string,
  percentage: number | string,
  precision: number
): number {
  return new Decimal(baseAmount)
    .times(percentage)
    .div(100)
    .toDecimalPlaces(precision, ROUNDING)
    .toNumber()
}

/**
 * Divide with precision
 */
export function calculateDivisionAmount(
  baseAmount: number | string,
  divisor: number | string,
  precision: number
): number {
  const d = new Decimal(divisor)
  if (d.isZero()) return 0
  return new Decimal(baseAmount)
    .div(d)
    .toDecimalPlaces(precision, ROUNDING)
    .toNumber()
}

/**
 * Subtract with precision
 */
export function calculateSubtractionAmount(
  baseAmount: number | string,
  subtractAmount: number | string,
  precision: number
): number {
  return new Decimal(baseAmount)
    .minus(subtractAmount)
    .toDecimalPlaces(precision, ROUNDING)
    .toNumber()
}

/**
 * Round a value to specified decimal places (for display/exchange rate formatting)
 * Returns number suitable for form values
 */
export function roundToPrecision(value: number | string, precision: number): number {
  return new Decimal(value).toDecimalPlaces(precision, ROUNDING).toNumber()
}
