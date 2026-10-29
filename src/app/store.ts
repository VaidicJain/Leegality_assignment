import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { listingReducer } from '@/features/listing/listingSlice'

const rootReducer = combineReducers({
  listing: listingReducer,
})

export type RootState = ReturnType<typeof rootReducer>

/** Store factory, so tests can create isolated stores with optional preloaded state. */
export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  })

export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']

export const store = setupStore()
