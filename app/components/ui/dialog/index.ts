// Thin re-export over reka-ui's Dialog. The site has exactly one dialog
// (Report issue), so only the piece that needs project styling — the content
// shell — is a local component; the rest is reka's, used directly.
export {
  DialogRoot as Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
} from 'reka-ui'

export { default as DialogContent } from './DialogContent.vue'
