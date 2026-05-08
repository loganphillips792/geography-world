import { createFileRoute } from '@tanstack/react-router'
import CountryModal from '../CountryModal.jsx'

export const Route = createFileRoute('/country/$alpha2')({ component: CountryModal })
