import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Property {
  id: string
  project_name: string
  location: string
  district: number
  property_type: string
  tenure: string
  age: number
  size_sqft: number
  recent_price: number
  recent_date: string
  top_date?: string
  lease_start_date?: string
}

export interface Transaction {
  id: string
  property_id: string
  price: number
  area: number
  transaction_date: string
  tenure_at_time: string
}

export interface Rental {
  id: string
  property_id: string
  bedrooms: number
  monthly_rent: number
  annual_rent: number
  rental_date: string
}

export interface PropertyWithYield extends Property {
  rental?: Rental
  annualYield?: number
  monthlyYield?: number
}

// Database queries
export async function getProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('recent_price', { ascending: false })

  if (error) throw error
  return data as Property[]
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Property
}

export async function getPropertiesByDistrict(district: number) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('district', district)

  if (error) throw error
  return data as Property[]
}

export async function searchProperties(filters: {
  minPrice?: number
  maxPrice?: number
  districts?: number[]
  propertyType?: string
}) {
  let query = supabase.from('properties').select('*')

  if (filters.minPrice) query = query.gte('recent_price', filters.minPrice)
  if (filters.maxPrice) query = query.lte('recent_price', filters.maxPrice)
  if (filters.districts?.length) query = query.in('district', filters.districts)
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType)

  const { data, error } = await query

  if (error) throw error
  return data as Property[]
}

export async function getRentals() {
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .order('annual_rent', { ascending: false })

  if (error) throw error
  return data as Rental[]
}

export async function getPropertiesWithYield() {
  const { data: properties, error: propsError } = await supabase
    .from('properties')
    .select('*')

  if (propsError) throw propsError

  const { data: rentals, error: rentalsError } = await supabase
    .from('rentals')
    .select('*')

  if (rentalsError) throw rentalsError

  // Combine properties with rental data
  const combined = (properties || []).map(prop => {
    const rental = (rentals || []).find(r => r.property_id === prop.id)
    const annualYield = rental ? (rental.annual_rent / prop.recent_price) * 100 : 0
    const monthlyYield = rental ? (rental.monthly_rent / prop.recent_price) * 100 : 0

    return {
      ...prop,
      rental,
      annualYield,
      monthlyYield
    }
  })

  return combined as PropertyWithYield[]
}
