import apiClient from './common/apiClient'
import type {
  ApiResponse,
  BorderStationsByDistrictData,
  BorderStationsByRadiusData,
} from '@/types/api'
import { serviceStatisticsPath } from '@/constant/serviceConstant'

export interface BorderStationsByRadiusParams {
  lng: number
  lat: number
  /** Bán kính tìm kiếm tính bằng mét (tối đa 500000 = 500 km) */
  radius: number
}

export default {
  /** GET /statistics/border-stations/by-district/:districtId */
  getByDistrict: (districtId: number) =>
    apiClient.get<ApiResponse<BorderStationsByDistrictData>>(
      `${serviceStatisticsPath}/border-stations/by-district/${districtId}`
    ),

  /** GET /statistics/border-stations/by-radius?lng=&lat=&radius= */
  getByRadius: (params: BorderStationsByRadiusParams) =>
    apiClient.get<ApiResponse<BorderStationsByRadiusData>>(
      `${serviceStatisticsPath}/border-stations/by-radius`,
      params
    ),
}
