import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { listingReducer } from '@/features/listing/listingSlice'
import { api } from '@/services/api'

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  listing: listingReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    // Required by RTK Query: caching, request deduplication, and cache expiry.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })

export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']

export const store = setupStore()
