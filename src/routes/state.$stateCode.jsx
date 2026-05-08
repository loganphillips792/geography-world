import { createFileRoute } from '@tanstack/react-router'
import StateModal from '../StateModal.jsx'

export const Route = createFileRoute('/state/$stateCode')({ component: StateModal })
