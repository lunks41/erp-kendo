import { useAuthStore } from "@/stores/auth-store"
import { debug } from "@/lib/debug"
import axios, { InternalAxiosRequestConfig } from "axios"

// Create Axios instance for proxy API
// SECURITY: Session-based company ID is passed via header
// All other secure headers (auth tokens, user IDs) are handled server-side
const apiClient = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
})
// Request interceptor - adds session company ID header
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = config.headers || {}
  // Ensure Content-Type is set
  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
  }
  // Add session-based company ID header
  const sessionCompanyId = getCompanyIdFromSession()
  if (sessionCompanyId) {
    headers["X-Company-Id"] = sessionCompanyId
  }
  // Add X-Reg-Id for all API calls
  const regId = process.env.NEXT_PUBLIC_DEFAULT_REGISTRATION_ID
  if (regId) {
    headers["X-Reg-Id"] = regId
  }
  // Add X-User-Id for all API calls
  const userId = useAuthStore.getState().user?.userId
  if (userId) {
    headers["X-User-Id"] = userId
  }
  config.headers = headers

  debug.log("🚀 API Request:", {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    headers: {
      "X-Company-Id": headers["X-Company-Id"],
      "X-Reg-Id": headers["X-Reg-Id"],
      "X-User-Id": headers["X-User-Id"],
      "Content-Type": headers["Content-Type"],
    },
    params: config.params,
    data: config.data,
  })

  return config
})

// Response interceptor - logs API responses (dev only)
apiClient.interceptors.response.use(
  (response) => {
    debug.log("✅ API Response:", {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    })
    return response
  },
  (error) => {
    debug.error("❌ API Error:", {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    })
    return Promise.reject(error)
  }
)
/**
 * Helper function to get company ID from client-side session
 * @returns Company ID from Zustand store or sessionStorage
 */
export const getCompanyIdFromSession: () => string | null = () => {
  // console.log("🔍 Getting company ID from session...")
  if (typeof window === "undefined") {
    // console.log("❌ Window is undefined (SSR)")
    return null
  }
  try {
    // Try to get from Zustand store first
    const state = useAuthStore.getState()
    // console.log("📊 Auth store state:", {
    //   currentCompany: state.currentCompany,
    //   isAuthenticated: state.isAuthenticated,
    // })

    if (state.currentCompany?.companyId) {
      const companyId = state.currentCompany.companyId.toString()
      // console.log("✅ Found company ID in Zustand store:", companyId)

      // Also check sessionStorage to see if there's a mismatch
      const sessionStorageCompanyId = sessionStorage.getItem("tab_company_id")
      if (sessionStorageCompanyId && sessionStorageCompanyId !== companyId) {
        debug.warn(
          "⚠️ MISMATCH: Zustand has",
          companyId,
          "but sessionStorage has",
          sessionStorageCompanyId
        )
        // console.log("🔍 This might cause API calls to use wrong company ID!")
      }

      return companyId
    }
    // Fallback to sessionStorage for multi-tab support
    const tabCompanyId = sessionStorage.getItem("tab_company_id")
    // console.log("💾 Checking sessionStorage for tab_company_id:", tabCompanyId)

    if (tabCompanyId) {
      debug.warn(
        "⚠️ Using sessionStorage fallback - Zustand store might not be updated yet"
      )
      // console.log("🔍 This could cause API calls to use old company ID!")
      return tabCompanyId
    }
    // console.log("❌ No company ID found in any source")
    return null
  } catch (error) {
    debug.warn("❌ Error getting company ID from session:", error)
    return null
  }
}
/**
 * API Client Functions
 *
 * SECURITY MODEL:
 * - Session-based company ID passed as X-Company-Id header
 * - All other secure headers handled server-side
 * - Client only passes non-sensitive parameters
 */
export const getData = async (
  endpoint: string,
  params: Record<string, string> = {}
) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value)
      }
    })
    const url = queryParams.toString()
      ? `${endpoint}?${queryParams.toString()}`
      : endpoint
    debug.log("📡 GET Request:", { endpoint: url, params })
    const response = await apiClient.get(url)
    debug.log("✅ GET Response:", { endpoint: url, data: response.data })
    return response.data
  } catch (error) {
    debug.error("❌ GET request failed:", { endpoint, params, error })
    throw error
  }
}
export const getById = async (endpoint: string) => {
  try {
    debug.log("📡 GET by ID Request:", { endpoint })
    const response = await apiClient.get(endpoint)
    debug.log("✅ GET by ID Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    debug.error("❌ GET by ID request failed:", { endpoint, error })
    throw error
  }
}
export const getByParams = async (
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
) => {
  try {
    // For GET requests with parameters, we'll use query strings
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    const url = queryParams.toString()
      ? `${endpoint}?${queryParams.toString()}`
      : endpoint
    debug.log("📡 GET by Params Request:", { endpoint: url, params })
    const response = await apiClient.get(url)
    debug.log("✅ GET by Params Response:", {
      endpoint: url,
      data: response.data,
    })
    return response.data
  } catch (error) {
    debug.error("❌ GET by params request failed:", {
      endpoint,
      params,
      error,
    })
    throw error
  }
}

export const getByBody = async (
  endpoint: string,
  data: Record<string, unknown>
) => {
  try {
    debug.log("📡 GET by Body Request:", { endpoint, data })
    const response = await apiClient.post(endpoint, data) // body = data
    debug.log("✅ GET by Body Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    debug.error("❌ GET by Body request failed:", { endpoint, data, error })
    throw error
  }
}

export const saveData = async (
  endpoint: string,
  data: Record<string, unknown> | unknown
) => {
  try {
    debug.log("💾 POST (Save) Request:", { endpoint, data })
    const response = await apiClient.post(endpoint, data)
    debug.log("✅ POST (Save) Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    debug.error("❌ POST (Save) request failed:", { endpoint, data, error })
    throw error
  }
}
// Alias for backward compatibility
export const postData = saveData
export const updateData = async (
  endpoint: string,
  data: Record<string, unknown> | unknown
) => {
  try {
    debug.log("🔄 PUT (Update) Request:", { endpoint, data })
    const response = await apiClient.put(endpoint, data)
    debug.log("✅ PUT (Update) Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    debug.error("❌ PUT (Update) request failed:", { endpoint, data, error })
    throw error
  }
}
export const deleteData = async (endpoint: string) => {
  try {
    debug.log("🗑️ DELETE Request:", { endpoint })
    const response = await apiClient.delete(endpoint)
    debug.log("✅ DELETE Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    debug.error("❌ DELETE request failed:", { endpoint, error })
    throw error
  }
}

export const deleteDataWithRemarks = async (
  endpoint: string,
  documentId: string,
  documentNo: string,
  cancelRemarks: string
) => {
  try {
    const data = {
      DocumentId: documentId,
      DocumentNo: documentNo,
      CancelRemarks: cancelRemarks,
    }
    debug.log("🗑️ DELETE with Remarks Request:", { endpoint, data })
    const response = await apiClient.post(endpoint, data)
    debug.log("✅ DELETE with Remarks Response:", {
      endpoint,
      data: response.data,
    })
    return response.data
  } catch (error) {
    debug.error("❌ DELETE with remarks request failed:", { endpoint, error })
    throw error
  }
}
export const patchData = async (
  endpoint: string,
  data: Record<string, unknown> | unknown
) => {
  try {
    debug.log("🔧 PATCH Request:", { endpoint, data })
    const response = await apiClient.patch(endpoint, data)
    debug.log("✅ PATCH Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    debug.error("❌ PATCH request failed:", { endpoint, data, error })
    throw error
  }
}
export const uploadFile = async (
  endpoint: string,
  file: File,
  additionalData?: Record<string, unknown>
) => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }
    debug.log("📤 File Upload Request:", {
      endpoint,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      additionalData,
    })
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    debug.log("✅ File Upload Response:", { endpoint, data: response.data })
    return response.data
  } catch (error) {
    debug.error("❌ File upload failed:", {
      endpoint,
      fileName: file.name,
      error,
    })
    throw error
  }
}
// Export for backward compatibility
export const apiProxy = apiClient
export { apiClient }
export default apiClient
