import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import * as persisted from '#/state/persisted'

type StateContext = boolean
type SetContext = (v: boolean) => void

const stateContext = createContext<StateContext>(
  Boolean(persisted.defaults.useBluvyTubePlayer),
)
stateContext.displayName = 'BluvyTubePlayerStateContext'
const setContext = createContext<SetContext>((_: boolean) => {})
setContext.displayName = 'BluvyTubePlayerSetContext'

export function Provider({children}: {children: React.ReactNode}) {
  const [state, setState] = useState(
    Boolean(persisted.get('useBluvyTubePlayer')),
  )

  const setStateWrapped = useCallback(
    (useBluvyTubePlayer: persisted.Schema['useBluvyTubePlayer']) => {
      setState(Boolean(useBluvyTubePlayer))
      void persisted.write('useBluvyTubePlayer', useBluvyTubePlayer)
    },
    [setState],
  )

  useEffect(() => {
    return persisted.onUpdate('useBluvyTubePlayer', nextUseBluvyTubePlayer => {
      setState(Boolean(nextUseBluvyTubePlayer))
    })
  }, [setStateWrapped])

  return (
    <stateContext.Provider value={state}>
      <setContext.Provider value={setStateWrapped}>
        {children}
      </setContext.Provider>
    </stateContext.Provider>
  )
}

export const useBluvyTubePlayer = () => useContext(stateContext)
export const useSetBluvyTubePlayer = () => useContext(setContext)
