export interface BorderStationCommune {
  id: number
  name: string
  district_id?: number
}

export interface BorderStation {
  id: number
  name: string
  latitude: number
  longitude: number
  commune?: BorderStationCommune
  [key: string]: any
}

export interface BorderStationWithDistance extends BorderStation {
  /** Khoảng cách từ điểm trung tâm (mét) */
  distance_meters: number
}

export interface BorderStationsByDistrictData {
  items: BorderStation[]
  total: number
}

export interface BorderStationsByRadiusData {
  items: BorderStationWithDistance[]
  total: number
}
