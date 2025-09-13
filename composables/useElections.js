import { storeToRefs } from 'pinia'
import { useElectionStore } from '../stores/elections'

export function useElections() {
  const store = useElectionStore()

  // reactive state (refs)
  const { elections, loading, error } = storeToRefs(store)

  // expose store actions
  const { fetchElections, createElection, updateElection, deleteElection } = store

  return {
    // state
    elections,
    loading,
    error,

    // actions
    fetchElections,
    createElection,
    updateElection,
    deleteElection
  }
}
